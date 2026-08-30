-- 057 — kho lưu bản ghi âm phần nói
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG DÙNG BUCKET ĐANG CÓ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bucket hiện tại chứa MP3 và ảnh của đề bài, và nó `public = true`. Với nội
-- dung đề thì hợp lý — ai cũng phải nghe được file nghe hiểu.
--
-- Với GIỌNG NÓI CỦA HỌC SINH thì không. Đó là dữ liệu sinh trắc của trẻ vị
-- thành niên, và để nó ở một URL đoán được là chuyện khác hẳn về cả pháp lý
-- lẫn đạo đức. Một bucket công khai không có cách nào "hơi riêng tư" — hoặc
-- đoán được URL là nghe được, hoặc không.
--
-- Nên: bucket RIÊNG, `public = false`, đọc qua signed URL có hạn.
--
-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG DẪN MANG PHÂN QUYỀN
-- ══════════════════════════════════════════════════════════════════════════
--
--     bai-noi/<user_id>/<exam_id>/<exercise_id>-<mốc thời gian>.webm
--
-- Thư mục đầu tiên LÀ `auth.uid()`. Nhờ vậy policy chỉ cần so một chuỗi, không
-- cần bảng phụ nào để tra "file này của ai" — và không có bảng phụ nghĩa là
-- không có chỗ cho hai nguồn sự thật lệch nhau.
--
-- `storage.foldername(name)` trả về mảng các đoạn thư mục; phần tử [1] là đoạn
-- đầu tiên (Postgres đánh số từ 1).
--
-- ══════════════════════════════════════════════════════════════════════════
-- KHÔNG CÓ POLICY XOÁ, VÀ KHÔNG CÓ POLICY SỬA
-- ══════════════════════════════════════════════════════════════════════════
--
-- Học sinh ghi âm lại thì tạo file MỚI với mốc thời gian mới, không đè lên
-- file cũ. Ghi đè là mất bản trước mà không ai biết; thêm file thì tốn dung
-- lượng nhưng giữ được lịch sử luyện tập, vốn chính là thứ có ích ở đây.
--
-- Dọn file cũ là việc của người vận hành, làm có chủ đích — không phải thứ để
-- một cú bấm nhầm trong giao diện làm thay.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bai-noi', 'bai-noi', false,
  /* 25 MB. Một bài nói B2 dài nhất là 20 phút; webm/opus ở 32kbps rơi vào
     khoảng 5 MB. Đặt rộng gấp năm để không chặn nhầm máy ghi ở bitrate cao,
     nhưng vẫn đủ chặt để một file video vô tình bị từ chối. */
  26214400,
  array['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4', 'audio/wav']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ══════════════════════════════════════════════════════════════════════════
-- RLS TRÊN storage.objects
-- ══════════════════════════════════════════════════════════════════════════

drop policy if exists bai_noi_hoc_sinh_ghi   on storage.objects;
drop policy if exists bai_noi_hoc_sinh_doc   on storage.objects;
drop policy if exists bai_noi_giao_vien_doc  on storage.objects;

/* Học sinh TẢI LÊN, chỉ vào thư mục mang id của chính mình. */
create policy bai_noi_hoc_sinh_ghi on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'bai-noi'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

/* Học sinh nghe lại bài của chính mình. */
create policy bai_noi_hoc_sinh_doc on storage.objects
  for select to authenticated
  using (
    bucket_id = 'bai-noi'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

/* Giáo viên nghe được mọi bài — họ là người duy nhất có thể nhận xét phần nói,
   kể cả khi hệ thống chưa chấm điểm. Đọc, KHÔNG ghi và KHÔNG xoá. */
create policy bai_noi_giao_vien_doc on storage.objects
  for select to authenticated
  using (bucket_id = 'bai-noi' and public.is_teacher());

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA — chạy ở một lần Run RIÊNG, xem 058
-- ══════════════════════════════════════════════════════════════════════════
--
-- KHÔNG đặt câu kiểm ở đây: nó chạy trong cùng transaction với phần trên, nên
-- báo thành công cho việc có thể bị cuộn ngược. 046 đã trả giá cho đúng chuyện
-- này — xem CLAUDE.md.
