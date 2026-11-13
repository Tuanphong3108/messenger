import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/ripple/ripple.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/switch/switch.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';

const FB = 'https://www.facebook.com';
const REPO = 'https://github.com/Tuanphong3108/messenger';
const THREAD_RE = /^\/messages\/(e2ee\/)?t\/[A-Za-z0-9._-]+\/?$/;
const AVATAR_RE = /^https:\/\/[a-z0-9.-]+\.(fbcdn\.net|fbsbx\.com|facebook\.com)\//i;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const store = chrome.storage.local;

// ---------------------------------------------------------------- i18n
const T = {
  vi: {
    home: 'Đoạn chat', search: 'Tìm kiếm', back: 'Quay lại', menu: 'Menu',
    account: 'Tài khoản', compose: 'Soạn tin', requests: 'Tin chờ', archived: 'Lưu trữ', settings: 'Cài đặt',
    newTitle: 'Tin nhắn mới', requestsTitle: 'Tin nhắn đang chờ', archivedTitle: 'Đoạn chat đã lưu trữ',
    fbAccount: 'Tài khoản Facebook', openProfile: 'Mở trang cá nhân', openTab: 'Mở trong tab mới',
    popupMode: 'Luôn mở dạng popup', popupDesc: 'Dùng cửa sổ nhỏ thay cho side panel',
    compact: 'Giao diện gọn', compactDesc: 'Ẩn thanh trên cùng của Facebook trong khung nhúng',
    reload: 'Tải lại Messenger', snack: 'Chưa kết nối được Messenger.',
    status: 'Khung đã kết nối', none: 'chưa có', about: 'Messenger Panel — không liên kết với Meta.',
  },
  en: {
    home: 'Chats', search: 'Search', back: 'Back', menu: 'Menu',
    account: 'Account', compose: 'Compose', requests: 'Requests', archived: 'Archived', settings: 'Settings',
    newTitle: 'New message', requestsTitle: 'Message requests', archivedTitle: 'Archived chats',
    fbAccount: 'Facebook account', openProfile: 'Open profile', openTab: 'Open in new tab',
    popupMode: 'Always open as popup', popupDesc: 'Use a small window instead of the side panel',
    compact: 'Compact UI', compactDesc: "Hide Facebook's top bar inside the embedded frame",
    reload: 'Reload Messenger', snack: "Couldn't connect to Messenger.",
    status: 'Connected frames', none: 'none', about: 'Messenger Panel — not affiliated with Meta.',
  },
};
const L = (navigator.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en';
const t = (k) => T[L][k] ?? T.en[k] ?? k;
document.documentElement.lang = L;
$$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
$$('[data-i18n-attr]').forEach((el) => {
  el.setAttribute('aria-label', t(el.dataset.i18nAttr));
  el.title = t(el.dataset.i18nAttr);
});

const params = new URLSearchParams(location.search);
document.documentElement.dataset.mode = params.get('mode') === 'popup' ? 'popup' : 'panel';

// ---------------------------------------------------------------- Trang & điều hướng trượt
const pages = Object.fromEntries($$('.page').map((p) => [p.dataset.page, p]));
const stack = ['home'];

function setState(id, state) {
  pages[id].dataset.state = state; // active | behind (trái) | ahead (phải)
  pages[id].inert = state !== 'active';
}
Object.keys(pages).forEach((id) => setState(id, id === 'home' ? 'active' : 'ahead'));

function push(id) {
  if (stack.includes(id)) return;
  setState(stack.at(-1), 'behind'); // trang hiện tại trượt sang trái
  setState(id, 'active'); // trang mới trượt vào từ phải
  stack.push(id);
}

function back() {
  if (stack.length < 2) return;
  const leaving = stack.pop();
  setState(leaving, 'ahead'); // trượt ngược ra phải
  setState(stack.at(-1), 'active'); // trang trước trượt về từ trái
  if (leaving === 'chat' || leaving === 'fn') {
    // Dừng hoạt động của khung sau khi animation xong (đỡ tốn tài nguyên, đỡ báo "đã xem" nhầm)
    setTimeout(() => {
      if (!stack.includes(leaving)) unload(leaving);
    }, 520);
  }
}

$$('.js-back').forEach((b) => b.addEventListener('click', back));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && stack.length > 1) back();
});
addEventListener('mouseup', (e) => {
  if (e.button === 3 && stack.length > 1) {
    e.preventDefault();
    back();
  }
});

// ---------------------------------------------------------------- Khung Facebook
const frames = { list: $('#frame-list'), chat: $('#frame-chat'), fn: $('#frame-fn') };
const loaders = Object.fromEntries($$('.loader').map((l) => [l.dataset.for, l]));
const loadTimers = {};
const connected = new Set();

function setLoading(name, on) {
  loaders[name].dataset.on = on ? '1' : '0';
  clearTimeout(loadTimers[name]);
  if (on) loadTimers[name] = setTimeout(() => setLoading(name, false), 15000);
}
function load(name, url) {
  setLoading(name, true);
  frames[name].src = url;
}
function unload(name) {
  frames[name].src = 'about:blank';
  frames[name].dataset.key = '';
  connected.delete(name);
  renderStatus();
}
for (const [name, f] of Object.entries(frames)) {
  f.addEventListener('load', () => {
    if (f.getAttribute('src') && f.getAttribute('src') !== 'about:blank') setLoading(name, false);
  });
}
function post(name, msg) {
  frames[name].contentWindow?.postMessage({ __mbx: 1, ...msg }, FB);
}

// Snackbar nếu khung danh sách không "bắt tay" được với content script
const snack = $('#snack');
let snackTimer;
function watchList() {
  clearTimeout(snackTimer);
  snack.hidden = true;
  snackTimer = setTimeout(() => {
    if (!connected.has('list')) snack.hidden = false;
  }, 9000);
}
$('#snack-open').addEventListener('click', () => openTab('/messages/'));

// ---------------------------------------------------------------- Mở chat / trang chức năng
const FN = {
  new: { path: '/messages/new', title: 'newTitle' },
  requests: { path: '/messages/requests', title: 'requestsTitle' },
  archived: { path: '/messages/archived', title: 'archivedTitle' },
};
let chatPath = '/messages/';

function openChat(path, name) {
  if (stack.includes('chat')) return;
  chatPath = path;
  $('#chat-title').textContent = name || t('home');
  load('chat', FB + path);
  push('chat');
}
function openFn(key) {
  const def = FN[key];
  $('#fn-title').textContent = t(def.title);
  if (frames.fn.dataset.key !== key) {
    frames.fn.dataset.key = key;
    load('fn', FB + def.path);
  }
  push('fn');
}
function openTab(path) {
  chrome.tabs.create({ url: FB + path });
}

$('#chat-open-tab').addEventListener('click', () => openTab(chatPath));
$('#acc-profile').addEventListener('click', () => openTab('/me'));
$('#acc-tab').addEventListener('click', () => openTab('/messages/'));
$('#btn-search').addEventListener('click', () => {
  frames.list.focus();
  post('list', { t: 'focus-search' });
});

$$('.dock-item').forEach((b) =>
  b.addEventListener('click', () => {
    const act = b.dataset.act;
    if (act === 'account' || act === 'settings') push(act);
    else openFn(act);
  })
);

// ---------------------------------------------------------------- Tin nhắn từ content script
addEventListener('message', (e) => {
  if (e.origin !== FB) return;
  const d = e.data;
  if (!d || d.__mbx !== 1) return;
  const name = Object.keys(frames).find((k) => frames[k].contentWindow === e.source);
  if (!name) return;

  switch (d.t) {
    case 'hello':
      connected.add(name);
      if (name === 'list') snack.hidden = true;
      renderStatus();
      break;
    case 'thread':
      if (name !== 'chat' && typeof d.path === 'string' && THREAD_RE.test(d.path)) {
        openChat(d.path, String(d.name || '').slice(0, 80));
      }
      break;
    case 'back':
      if (name === 'chat' && stack.at(-1) === 'chat') back();
      break;
    case 'me':
      if (typeof d.avatar === 'string' && AVATAR_RE.test(d.avatar)) setAvatar(d.avatar);
      break;
  }
});

// ---------------------------------------------------------------- Avatar
function setAvatar(src) {
  $$('.js-avatar').forEach((img) => {
    img.src = src;
    img.hidden = false;
  });
  $$('.js-avatar-fallback').forEach((el) => (el.hidden = true));
  store.set({ avatar: src });
}
$$('.js-avatar').forEach((img) =>
  img.addEventListener('error', () => {
    img.hidden = true;
    $$('.js-avatar-fallback').forEach((el) => (el.hidden = false));
  })
);
store.get({ avatar: '' }).then((v) => {
  if (v.avatar && AVATAR_RE.test(v.avatar)) setAvatar(v.avatar);
});

// ---------------------------------------------------------------- Cài đặt
function renderStatus() {
  const list = Array.from(connected).join(', ') || t('none');
  $('#status').textContent = `${t('status')}: ${list}`;
}
async function initSettings() {
  const s = await store.get({ forcePopup: false, compact: true });
  const bind = (rowId, swId, key, value) => {
    const sw = $(swId);
    sw.selected = value;
    sw.addEventListener('change', () => store.set({ [key]: sw.selected }));
    $(rowId).addEventListener('click', (e) => {
      if (e.target.closest('md-switch')) return;
      sw.selected = !sw.selected;
      sw.dispatchEvent(new Event('change'));
    });
  };
  bind('#row-popup', '#sw-popup', 'forcePopup', s.forcePopup);
  bind('#row-compact', '#sw-compact', 'compact', s.compact);

  $('#row-reload').addEventListener('click', () => {
    load('list', FB + '/messages/');
    watchList();
  });
  $('#row-tab').addEventListener('click', () => openTab('/messages/'));
  const v = chrome.runtime.getManifest().version;
  $('#about').textContent = `${t('about')} v${v} · ${REPO.replace('https://', '')}`;
  renderStatus();
}
initSettings();

// ---------------------------------------------------------------- Khởi động
load('list', FB + '/messages/');
watchList();
