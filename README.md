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

## 2. Triển khai lên GitHub Pages (404 Error Fix)

Lỗi 404 bạn gặp phải là do GitHub Pages chưa được kích hoạt hoặc chưa nhận được các file đã biên dịch (build).

### Cách 1: Sử dụng GitHub Actions (Khuyên dùng)
1. Đẩy mã nguồn lên một repository trên GitHub.
2. Vào **Settings** > **Pages**.
3. Ở mục **Build and deployment** > **Source**, chọn **GitHub Actions**.
4. GitHub sẽ tự động nhận diện ứng dụng Vite và triển khai cho bạn.

### Cách 2: Triển khai thủ công
1. Biên dịch ứng dụng:
   ```bash
   npm run build
   ```
2. Sau khi chạy lệnh trên, một thư mục tên là `dist` sẽ được tạo ra.
3. Bạn cần đẩy nội dung của thư mục `dist` này lên nhánh `gh-pages` hoặc cấu hình GitHub Pages để phục vụ từ thư mục này.

**Lưu ý về đường dẫn (Base Path):**
Trong file `vite.config.ts`, tôi đã đặt `base: './'`. Điều này giúp ứng dụng có thể chạy ở bất kỳ thư mục nào. Nếu bạn triển khai lên `username.github.io/ten-kho-luu-tru/`, cấu hình này sẽ đảm bảo các file CSS/JS được tải đúng.

## 3. Lỗi thường gặp
- **"404 Not Found" trên GitHub**: Hãy kiểm tra xem bạn đã bật GitHub Pages trong phần Settings của repository chưa.
- **Màn hình trắng khi mở file index.html**: Đây là hành vi bình thường của Vite. Bạn bắt buộc phải chạy lệnh `npm run dev` hoặc sử dụng một máy chủ web (như Live Server trong VS Code) để xem ứng dụng.
