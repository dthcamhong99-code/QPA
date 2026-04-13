# Hướng dẫn chạy ứng dụng (Quản lý dự án)

Ứng dụng này được xây dựng bằng **React** và **Vite**. Để chạy ứng dụng này trên máy tính cá nhân (local) hoặc triển khai lên GitHub Pages, bạn cần làm theo các bước sau:

## 1. Chạy trên máy tính cá nhân (Local)

Bạn **không thể** mở trực tiếp file `index.html` bằng trình duyệt vì ứng dụng sử dụng các module JavaScript hiện đại. Bạn cần chạy một máy chủ phát triển:

1.  **Cài đặt Node.js**: Đảm bảo máy tính của bạn đã cài đặt [Node.js](https://nodejs.org/).
2.  **Mở Terminal/Command Prompt**: Di chuyển vào thư mục chứa mã nguồn đã tải về.
3.  **Cài đặt các thư viện**: Chạy lệnh sau:
    ```bash
    npm install
    ```
4.  **Chạy ứng dụng**: Chạy lệnh sau:
    ```bash
    npm run dev
    ```
5.  **Truy cập**: Mở trình duyệt và truy cập địa chỉ `http://localhost:3000` (hoặc địa chỉ hiển thị trong terminal).

## 2. Triển khai lên GitHub Pages (Bằng GitHub Actions)

Hệ thống đã được dọn dẹp sạch sẽ các cấu hình xung đột. Ứng dụng sẽ được build ra thư mục `dist` theo chuẩn mặc định của Vite.

**Để triển khai tự động bằng GitHub Actions (Không bị lỗi quyền từ AI Studio):**

1. Nhấn nút **Save to GitHub** từ AI Studio để lưu mã nguồn lên GitHub (Sẽ không bị lỗi quyền nữa vì file workflow không nằm trên AI Studio).
2. Truy cập vào kho lưu trữ (repository) của bạn trên trang web GitHub.
3. Nhấn **Add file** > **Create new file**.
4. Nhập tên file là: `.github/workflows/deploy.yml`
5. Copy nội dung sau dán vào file:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm install
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

6. Nhấn **Commit changes...** để lưu file.
7. Vào **Settings** > **Pages** của kho lưu trữ.
8. Ở mục **Source**, chọn **GitHub Actions**.

Từ giờ, mỗi lần bạn Push code từ AI Studio, GitHub sẽ tự động chạy Action này để cập nhật web.

## 3. Lỗi thường gặp
- **"404 Not Found" trên GitHub**: Hãy kiểm tra xem bạn đã bật GitHub Pages trong phần Settings của repository chưa.
- **Màn hình trắng khi mở file index.html**: Đây là hành vi bình thường của Vite. Bạn bắt buộc phải chạy lệnh `npm run dev` hoặc sử dụng một máy chủ web (như Live Server trong VS Code) để xem ứng dụng.
