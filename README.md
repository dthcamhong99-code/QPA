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

## 2. Triển khai lên GitHub Pages (Cách đơn giản nhất, không bị lỗi 404)

Hệ thống đã được cấu hình lại để tự động xuất file chạy vào thư mục `docs`. Bạn không cần dùng GitHub Actions hay lệnh phức tạp nào nữa.

**Các bước thực hiện:**
1. Nhấn nút **Save to GitHub** (hoặc Push code) từ AI Studio lên nhánh `main` của bạn.
2. Truy cập vào kho lưu trữ (repository) của bạn trên trang web GitHub.
3. Vào mục **Settings** > **Pages**.
4. Ở phần **Build and deployment** > **Source**, chọn **Deploy from a branch**.
5. Ở phần **Branch**, chọn nhánh **`main`**, và ở ô thư mục bên cạnh, chọn **`/docs`**.
6. Nhấn **Save**.

Đợi khoảng 1-2 phút, GitHub sẽ tự động cập nhật trang web của bạn từ thư mục `docs` mà không gặp bất kỳ lỗi phân quyền hay 404 nào.

## 3. Lỗi thường gặp
- **"404 Not Found" trên GitHub**: Hãy kiểm tra xem bạn đã bật GitHub Pages trong phần Settings của repository chưa.
- **Màn hình trắng khi mở file index.html**: Đây là hành vi bình thường của Vite. Bạn bắt buộc phải chạy lệnh `npm run dev` hoặc sử dụng một máy chủ web (như Live Server trong VS Code) để xem ứng dụng.
