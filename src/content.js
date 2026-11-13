// Content script chạy trong khung facebook.com/messages được nhúng bởi chính extension này.
// - Bơm CSS reskin (nếu bật "Giao diện gọn")
// - Chặn click vào đoạn chat để shell trượt sang trang chat
// - Nhận lệnh từ shell (focus ô tìm kiếm) và gửi avatar về dock
import css from './content.css';

(() => {
  const extOrigin = new URL(chrome.runtime.getURL('/')).origin;

  // Chỉ chạy khi là con TRỰC TIẾP của trang extension; tab Facebook thường không bị đụng tới.
  const ancestors = Array.from(location.ancestorOrigins || []);
  if (window === window.top || ancestors[0] !== extOrigin) return;

  const role = (window.name || '').startsWith('mbx-') ? window.name.slice(4) : 'fn';
  const post = (msg) => parent.postMessage({ __mbx: 1, role, ...msg }, extOrigin);

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

  function rowName(a) {
    const row = a.closest('[role="row"], [role="listitem"], li') || a;
    for (const s of row.querySelectorAll('span')) {
      const t = s.textContent.trim();
      if (t && t.length < 80) return t;
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

  // ---------- Khung chat: nếu Facebook tự quay về danh sách thì báo shell "back" ----------
  if (role === 'chat') {
    const isThread = () => /^\/messages\/(e2ee\/)?t\//.test(location.pathname);
    let was = isThread();
    setInterval(() => {
      const now = isThread();
      if (was && !now) post({ t: 'back' });
      was = now;
    }, 400);
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
