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

## 2. Triển khai lên GitHub Pages (Sử dụng GitHub Actions Tự động)

Tôi đã cấu hình lại hệ thống để xuất file vào thư mục `dist` (mặc định) để tương thích hoàn toàn với Workflow bạn yêu cầu.

**LƯU Ý QUAN TRỌNG:** Để tránh lỗi "Insufficient permissions" (do AI Studio không có quyền đẩy file cấu hình hệ thống), bạn cần tự tay tạo file này trên GitHub theo các bước sau:

### Bước 1: Lưu code từ AI Studio
Nhấn nút **Save to GitHub** (Push) từ AI Studio để đồng bộ mã nguồn mới nhất lên GitHub.

### Bước 2: Tạo file Workflow trên GitHub
1. Truy cập vào repository của bạn trên GitHub.
2. Nhấn **Add file** > **Create new file**.
3. Nhập tên file chính xác là: `.github/workflows/deploy.yml`
4. Dán toàn bộ nội dung mã bạn đã cung cấp vào:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"] # Chạy khi có code mới đẩy lên nhánh main hoặc master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        env:
          # Dòng này sẽ lấy API Key từ Bước 1 bạn đã cài để đưa vào web
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

5. Nhấn **Commit changes...** để lưu lại.

### Bước 3: Cấu hình Pages
1. Vào **Settings** > **Pages**.
2. Ở mục **Source**, chọn **GitHub Actions**.

Từ giờ, mỗi lần bạn Push code, GitHub sẽ tự động Build và Deploy ứng dụng của bạn.

## 3. Lỗi thường gặp
- **"404 Not Found" trên GitHub**: Hãy kiểm tra xem bạn đã bật GitHub Pages trong phần Settings của repository chưa.
- **Màn hình trắng khi mở file index.html**: Đây là hành vi bình thường của Vite. Bạn bắt buộc phải chạy lệnh `npm run dev` hoặc sử dụng một máy chủ web (như Live Server trong VS Code) để xem ứng dụng.
