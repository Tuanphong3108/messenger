// Content script chạy trong khung facebook.com/messages được nhúng bởi chính extension này.
// - Bơm CSS reskin (nếu bật "Giao diện gọn")
// - Chặn click vào đoạn chat để shell trượt sang trang chat
// - Khung chat: render ở bề ngang rộng rồi cắt bỏ cột danh sách (Facebook ở bề ngang hẹp chỉ hiện danh sách)
// - Khung chức năng: ẩn nút back của Facebook, tự mở "Archived chats" từ menu
import css from './content.css';

(() => {
  const extOrigin = new URL(chrome.runtime.getURL('/')).origin;

  // Chỉ chạy khi là con TRỰC TIẾP của trang extension; tab Facebook thường không bị đụng tới.
  const ancestors = Array.from(location.ancestorOrigins || []);
  if (window === window.top || ancestors[0] !== extOrigin) return;

  const role = (window.name || '').startsWith('mbx-') ? window.name.slice(4) : 'fn';
  const post = (msg) => parent.postMessage({ __mbx: 1, role, ...msg }, extOrigin);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const THREAD_LINK = 'a[href*="/messages/t/"], a[href*="/messages/e2ee/t/"]';

  // ---------- CSS reskin ----------
  const STYLE_ID = 'mbx-style';
  function applyCompact(on) {
    const root = document.documentElement;
    if (!root) return;
    let el = document.getElementById(STYLE_ID);
    if (on) {
      root.dataset.mbx = role;
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        el.textContent = css;
        (document.head || root).appendChild(el);
      }
    } else {
      el?.remove();
      delete root.dataset.mbx;
    }
  }
  chrome.storage.local.get({ compact: true }).then((v) => applyCompact(v.compact));
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.compact) applyCompact(!!changes.compact.newValue);
  });

  // ---------- Click vào đoạn chat -> báo shell ----------
  const THREAD_RE = /^\/messages\/(e2ee\/)?t\/[A-Za-z0-9._-]+\/?$/;

  // Dòng trạng thái / thời gian / "Bạn: ..." không phải tên cuộc trò chuyện
  const STATUS_RE = /^(active|đang hoạt động|hoạt động|online|offline|typing|đang nhập|you:|bạn:|·|\d+\s?[smhdwy]$)/i;

  function rowName(a) {
    const row = a.closest('[role="row"], [role="listitem"], li') || a;
    for (const s of row.querySelectorAll('span')) {
      const t = s.textContent.trim();
      if (t && t.length < 80 && !STATUS_RE.test(t)) return t;
    }
    return (a.getAttribute('aria-label') || '').trim();
  }

  if (role !== 'chat') {
    document.addEventListener(
      'click',
      (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        const a = e.target instanceof Element && e.target.closest('a[href*="/messages/"]');
        if (!a) return;
        let url;
        try {
          url = new URL(a.href, location.href);
        } catch {
          return;
        }
        if (url.origin !== location.origin || !THREAD_RE.test(url.pathname)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        post({ t: 'thread', path: url.pathname, name: rowName(a) });
      },
      true
    );
  }

  // ---------- Khung chat ----------
  // Ở bề ngang hẹp Facebook chỉ hiện DANH SÁCH. Shell cho khung này viewport rộng (>= 1000px) để Facebook hiện cột
  // hội thoại. Ở đây ta: (1) khoá body đúng bề rộng panel và cho body `transform` để mọi phần tử position:fixed
  // (trình xem ảnh, hộp thoại, popup) chỉ phủ vùng panel; (2) dịch "app root" sang trái đúng bằng cột danh sách,
  // nên cột hội thoại nằm vừa khít panel.
  if (role === 'chat') {
    const paneStyle = document.createElement('style');
    paneStyle.textContent =
      'html[data-mbx-pane]{width:var(--mbx-w,100vw)!important;height:100%!important;overflow:hidden!important}' +
      'html[data-mbx-pane] body{position:relative!important;width:var(--mbx-w,100vw)!important;height:100vh!important;' +
      'margin:0!important;overflow:hidden!important;transform:translateZ(0)!important}' +
      // app root: dịch trái đúng bằng cột danh sách; chừa thêm 520px bên phải để bảng thông tin (nút "i") nằm NGOÀI vùng nhìn
      'html[data-mbx-pane] [data-mbx-root]{position:relative!important;left:calc(-1 * var(--mbx-l,0px))!important;' +
      'width:calc(var(--mbx-l,0px) + var(--mbx-w,100vw) + 520px)!important;min-width:0!important;max-width:none!important;overflow:hidden!important}' +
      // cột hội thoại cố định bằng bề rộng panel (trừ lề hai bên) -> không bị bảng thông tin ép hẹp
      'html[data-mbx-pane] [data-mbx-main]{flex:0 0 auto!important;width:calc(var(--mbx-w,100vw) - 2 * var(--mbx-gap,0px))!important;' +
      'min-width:0!important;max-width:none!important}';
    (document.head || document.documentElement).appendChild(paneStyle);

    let paneL = null;
    let panelW = 0;

    const applyPane = () => {
      const root = document.documentElement;
      if (panelW) root.style.setProperty('--mbx-w', panelW + 'px');
      if (paneL != null) {
        root.style.setProperty('--mbx-l', paneL + 'px');
        root.setAttribute('data-mbx-pane', '1');
      }
    };

    // Cột hội thoại: role=main (mép trái >= 100px khi viewport rộng), hoặc cột chứa ô soạn tin
    function findMain() {
      const main = document.querySelector('[role="main"]');
      if (!main) return null;
      const r = main.getBoundingClientRect();
      return r.width > 150 && r.left >= 100 ? main : null;
    }
    function findComposerColumn() {
      const box = document.querySelector('[role="textbox"][contenteditable="true"]');
      if (!box) return null;
      let el = box;
      while (el.parentElement && el.parentElement !== document.body && !el.parentElement.querySelector(THREAD_LINK)) {
        el = el.parentElement;
      }
      const r = el.getBoundingClientRect();
      return r.width > 150 && r.left >= 100 ? el : null;
    }

    // Đo MỘT lần khi cột hội thoại xuất hiện
    const measure = setInterval(() => {
      const main = findMain();
      const col = main || findComposerColumn();
      if (!col) return;
      clearInterval(measure);

      // cột lớn nhất không chứa danh sách (gồm cả lề/khung thẻ bao quanh hội thoại)
      let top = col;
      while (top.parentElement && top.parentElement !== document.body && !top.parentElement.querySelector(THREAD_LINK)) {
        top = top.parentElement;
      }
      // mép trái thật = mép trái nhỏ nhất của các khối lớn trong cột (tránh cắt mất lề/khung bo góc)
      const baseLeft = col.getBoundingClientRect().left;
      let left = baseLeft;
      for (const el of [top, ...top.querySelectorAll('*')]) {
        const r = el.getBoundingClientRect();
        if (r.width > 60 && r.height > 60 && r.left < left && r.left >= baseLeft - 60) left = r.left;
      }
      paneL = Math.round(left);
      let root = col;
      while (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
      root.setAttribute('data-mbx-root', '1');
      document.documentElement.style.setProperty('--mbx-gap', Math.max(0, Math.round(baseLeft - left)) + 'px');
      if (main) main.setAttribute('data-mbx-main', '1');
      applyPane();
      post({ t: 'pane', left: paneL });
    }, 400);

    // Tên cuộc trò chuyện từ header hội thoại (shell dùng làm tiêu đề)
    let lastTitle = '';
    setInterval(() => {
      const h = document.querySelector(
        '[role="main"] h1, [role="main"] h2, [role="main"] [role="heading"], [data-mbx-main] h1, [data-mbx-main] h2'
      );
      const t = ((h && h.textContent) || '').trim();
      if (t && t !== lastTitle && t.length < 80 && !STATUS_RE.test(t)) {
        lastTitle = t;
        post({ t: 'title', title: t });
      }
    }, 1000);

    window.addEventListener('message', (e) => {
      if (e.origin !== extOrigin || e.source !== parent) return;
      const d = e.data;
      if (d && d.__mbx === 1 && d.t === 'viewport' && Number.isFinite(d.w)) {
        panelW = Math.max(200, Math.round(d.w));
        applyPane();
      }
    });

    // Nếu Facebook tự quay về danh sách thì báo shell "back"
    const isThread = () => /^\/messages\/(e2ee\/)?t\//.test(location.pathname);
    let was = isThread();
    setInterval(() => {
      const now = isThread();
      if (was && !now) post({ t: 'back' });
      was = now;
    }, 400);
  }

  // ---------- Khung chức năng: ẩn nút back của Facebook ----------
  if (role === 'fn') {
    const hideBack = () => {
      for (const el of document.querySelectorAll('a, [role="button"]')) {
        if (el.dataset.mbxBack) continue;
        const r = el.getBoundingClientRect();
        if (!r.width || r.top > 100 || r.left > 100 || r.width > 64 || r.height > 64) continue;
        if (el.querySelector('img') || (el.textContent || '').trim() || !el.querySelector('svg, i')) continue;
        el.dataset.mbxBack = '1';
        el.style.setProperty('display', 'none', 'important');
      }
    };
    let pending = false;
    new MutationObserver(() => {
      if (pending) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        hideBack();
      }, 250);
    }).observe(document, { childList: true, subtree: true });
  }

  // ---------- Tự mở "Archived chats" từ menu ⋯ của danh sách ----------
  const ARCHIVED_RE = /archiv|lưu trữ/i;
  const HEADING_RE = /^(chats|đoạn chat)$/i;

  function findMenuTrigger() {
    const h = Array.from(document.querySelectorAll('h1, h2, [role="heading"]')).find((n) =>
      HEADING_RE.test((n.textContent || '').trim())
    );
    if (!h) return null;
    let box = h.parentElement;
    for (let i = 0; i < 5 && box; i++, box = box.parentElement) {
      const btns = Array.from(box.querySelectorAll('[role="button"][aria-label]')).filter((b) => !b.contains(h));
      if (btns.length >= 2) return btns[0]; // ⋯ đứng trước nút soạn tin
    }
    return null;
  }

  async function openArchived() {
    const deadline = Date.now() + 20000;
    let lastClick = 0;
    while (Date.now() < deadline) {
      const item = Array.from(
        document.querySelectorAll('[role="menuitem"], [role="menu"] [role="button"], [role="menu"] a')
      ).find((n) => ARCHIVED_RE.test(n.textContent || ''));
      if (item) {
        item.click();
        await sleep(600);
        return true;
      }
      const trigger = findMenuTrigger();
      if (trigger && Date.now() - lastClick > 1500) {
        lastClick = Date.now();
        trigger.click();
      }
      await sleep(400);
    }
    return false;
  }

  // ---------- Lệnh từ shell ----------
  function focusSearch() {
    const input = document.querySelector(
      'input[type="search"], [role="search"] input, input[aria-label*="earch" i], input[placeholder*="earch" i], input[placeholder*="ìm kiếm" i]'
    );
    if (!input) return false;
    input.scrollIntoView({ block: 'nearest' });
    input.focus();
    input.select?.();
    const box = input.closest('label') || input.parentElement;
    if (box) {
      box.classList.remove('mbx-flash');
      void box.offsetWidth;
      box.classList.add('mbx-flash');
    }
    return true;
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== extOrigin || e.source !== parent) return;
    const d = e.data;
    if (!d || d.__mbx !== 1) return;
    if (d.t === 'focus-search') focusSearch();
    if (d.t === 'action' && d.name === 'open-archived') {
      openArchived().finally(() => post({ t: 'action-done' }));
    }
  });

  // ---------- Avatar tài khoản (cho dock) ----------
  if (role === 'list') {
    let last = '';
    let tries = 0;
    const timer = setInterval(() => {
      const scope = document.querySelector('[role="banner"]') || document;
      const nodes = Array.from(scope.querySelectorAll('image, img')).filter((n) =>
        /fbcdn\.net|fbsbx\.com/.test(n.getAttribute('xlink:href') || n.getAttribute('href') || n.getAttribute('src') || '')
      );
      const n = nodes[nodes.length - 1];
      const src = n && (n.getAttribute('xlink:href') || n.getAttribute('href') || n.getAttribute('src'));
      if (src && src !== last) {
        last = src;
        post({ t: 'me', avatar: src });
      }
      if (++tries > 40) clearInterval(timer);
    }, 1500);
  }

  post({ t: 'hello' });
})();
