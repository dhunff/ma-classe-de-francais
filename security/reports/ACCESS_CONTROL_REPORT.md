# ACCESS_CONTROL Security Report

## Status: PASS (1 điểm LOW)

## Findings

- Đã đọc định nghĩa các RPC nhận id: doc_goi_y_ai, save_self_assessment, ket_thuc_po, luu_po_tu_cham, exam_play_audio, exam_start, bat_dau_thi, ghi_lan_on, cham_the… đều lọc `user_id = auth.uid()` NGAY TRONG câu truy vấn (cần thiết vì security definer bỏ qua RLS).
- Edge Function viet-mau, cham-po, cham-pe, nhan-xet-noi kiểm bài thuộc người gọi; nhan-xet-noi so tiền tố thư mục `<uid>/`.
- (LOW) `ghi_chinh_ta` nhận điểm chép chính tả do trình duyệt gửi: học sinh tự khai điểm của CHÍNH mình (chỉ ảnh hưởng thống kê cá nhân).

## What's already secure

- Bucket `bai-noi` riêng tư, policy so thư mục đầu với auth.uid().

## Recommendations

- (LOW) Có thể chấm chính tả ở máy chủ (soCau.js đã dùng chung) thay vì nhận điểm từ client.
