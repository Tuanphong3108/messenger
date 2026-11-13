# Messenger Panel

Extension Chrome (MV3) đưa Messenger vào **side panel** với giao diện gọn kiểu Material 3 Expressive.
Không mở được side panel thì tự mở **popup**.

> Không liên kết với Meta. Messenger/Facebook là nhãn hiệu của Meta Platforms.
> Từ 04/2026 `messenger.com` đã đóng và chuyển sang `facebook.com/messages`, nên extension nhúng trực tiếp trang này.

## Cài nhanh (không cần build)

1. Tải repo: **Code → Download ZIP**, giải nén.
2. Mở `chrome://extensions`, bật **Developer mode**.
3. **Load unpacked** → chọn thư mục vừa giải nén (thư mục có `manifest.json`).
4. Bấm icon extension → side panel mở ra. Đăng nhập Facebook ngay trong khung nếu chưa đăng nhập.

Yêu cầu Chrome 116+.

## Tính năng

- Danh sách đoạn chat full-width, nút **tìm kiếm** ở app bar (focus ô tìm kiếm của Messenger).
- **Dock dưới**: avatar (trang tài khoản), Soạn tin, Tin chờ, Lưu trữ, Cài đặt.
- Bấm nút chức năng hoặc mở một đoạn chat: UI **trượt sang phải** (trang mới trượt vào từ bên phải); **Back** (nút ←, `Esc`, nút Back của chuột) trượt ngược lại.
- Không mở được side panel (hoặc bật "Luôn mở dạng popup" trong Cài đặt) → mở cửa sổ popup.
- Giao diện theo hệ thống sáng/tối, font Google Sans Flex, icon Material Symbols, component Material Web.

## Cách hoạt động / lưu ý bảo mật

- Extension nhúng `https://www.facebook.com/messages/` bằng `<iframe>`. Để được phép nhúng, service worker thêm một rule
  `declarativeNetRequest` **chỉ cho request khung do chính extension này tạo** (`initiatorDomains` = ID extension): gỡ
  `X-Frame-Options` và `Content-Security-Policy` của response khung đó. Tab Facebook bình thường không bị đổi header.
- Content script chỉ hoạt động khi trang là con trực tiếp của extension; nó chặn click vào đoạn chat để shell trượt sang
  trang chat, và gửi avatar về dock. Không gửi dữ liệu ra ngoài; không có server nào khác.
- Quyền: `sidePanel`, `declarativeNetRequest`, `storage`, host `facebook.com`.

## Nếu giao diện trong khung bị lệch

Facebook hay đổi DOM. Vào **Cài đặt → tắt "Giao diện gọn"** để bỏ phần reskin, hoặc sửa `src/content.css`.

## Phát triển

```bash
npm install
npm run build        # bundle ra thư mục gốc (app.js, background.js, content.js, app.css, app.html)
npm run subset-icons # (tuỳ chọn) cắt lại font icon, cần: pip install fonttools brotli
npm run icons        # (tuỳ chọn) tạo lại icon PNG, cần playwright
```

Đổi màu chủ đạo: sửa `SEED` trong `build.mjs`. Đổi URL/tab chức năng: `FN` trong `src/app.js`.

## Giấy phép

MIT
