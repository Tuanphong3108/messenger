// Service worker: mở side panel khi bấm icon, không được thì mở popup.
// Đồng thời gỡ X-Frame-Options / CSP khỏi các khung Facebook do CHÍNH extension này nhúng.

const POPUP_SIZE = { width: 440, height: 780 };

// ---- Cache cài đặt (đọc đồng bộ trong onClicked để không mất user gesture) ----
let forcePopup = false;
chrome.storage.local.get({ forcePopup: false }).then((v) => (forcePopup = v.forcePopup));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.forcePopup) forcePopup = !!changes.forcePopup.newValue;
});

// ---- Mở panel / popup ----
chrome.action.onClicked.addListener((tab) => {
  if (forcePopup || !chrome.sidePanel || typeof chrome.sidePanel.open !== 'function') {
    openPopup();
    return;
  }
  // Gọi ngay (đồng bộ) để còn user gesture; nếu lỗi thì rơi xuống popup.
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => openPopup());
});

async function openPopup() {
  const { popupWindowId } = await chrome.storage.session.get('popupWindowId');
  if (popupWindowId != null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch {
      /* cửa sổ cũ đã đóng, tạo mới bên dưới */
    }
  }
  const win = await chrome.windows.create({
    url: chrome.runtime.getURL('app.html?mode=popup'),
    type: 'popup',
    ...POPUP_SIZE,
  });
  await chrome.storage.session.set({ popupWindowId: win.id });
}

chrome.windows.onRemoved.addListener(async (id) => {
  const { popupWindowId } = await chrome.storage.session.get('popupWindowId');
  if (popupWindowId === id) await chrome.storage.session.remove('popupWindowId');
});

// ---- Cho phép nhúng facebook.com/messages vào khung của extension ----
// Mọi rule chỉ áp dụng cho request sub_frame có initiator là CHÍNH extension này.
// Mỗi rule được cài riêng: rule nào bị Chrome từ chối thì chỉ rule đó thất bại.
const frameCondition = () => ({
  requestDomains: ['facebook.com'],
  resourceTypes: ['sub_frame'],
  initiatorDomains: [chrome.runtime.id],
});

const FRAME_RULES = [
  {
    // 1) Gỡ chặn nhúng iframe
    id: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        { header: 'x-frame-options', operation: 'remove' },
        { header: 'content-security-policy', operation: 'remove' },
        { header: 'content-security-policy-report-only', operation: 'remove' },
      ],
    },
  },
  {
    // 2) Referer là chrome-extension://... làm Facebook báo lỗi -> đặt lại thành chính Facebook
    id: 2,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{ header: 'referer', operation: 'set', value: 'https://www.facebook.com/' }],
    },
  },
  {
    // 3) Facebook từ chối request "Sec-Fetch-Dest: iframe" từ site lạ -> làm giống điều hướng trang thường
    id: 3,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        { header: 'sec-fetch-dest', operation: 'set', value: 'document' },
        { header: 'sec-fetch-site', operation: 'set', value: 'same-origin' },
      ],
    },
  },
];

async function installFrameRules() {
  const errors = [];
  for (const rule of FRAME_RULES) {
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [rule.id],
        addRules: [{ ...rule, priority: 1, condition: frameCondition() }],
      });
    } catch (e) {
      errors.push(`rule ${rule.id}: ${e.message}`);
      console.warn('[messenger-panel] DNR rule failed', rule.id, e);
    }
  }
  await chrome.storage.session.set({ ruleErrors: errors });
}

chrome.runtime.onInstalled.addListener(installFrameRules);
chrome.runtime.onStartup.addListener(installFrameRules);
