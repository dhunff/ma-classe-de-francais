-- 048 — KIỂM 046 (chạy RIÊNG, sau khi 046 đã chạy xong)
--
-- ══════════════════════════════════════════════════════════════════════════
-- FILE NÀY TỪNG LÀ MỘT BẢN SỬA SAI. ĐÃ GỠ.
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản trước của 048 cấp quyền đọc theo cột:
--
--     grant select (display_name, username, avatar)
--       on public.profiles to anon, authenticated;
--
-- Nó dựa trên một chẩn đoán SAI của tôi — rằng `profiles` được cấp quyền theo
-- CỘT nên cột thêm sau không thừa hưởng. Đo lại danh mục hệ thống thì:
--
--     select attname, attacl from pg_attribute
--     where attrelid = 'public.profiles'::regclass and attnum > 0;
--
--     → cả 7 cột đều có attacl = NULL
--
-- `attacl = NULL` nghĩa là KHÔNG có quyền cấp theo cột nào cả. Quyền của bảng
-- này ở mức BẢNG, và cột thêm sau tự động thừa hưởng. Không cần cấp gì.
--
-- Vì sao tôi tin nhầm: `information_schema.column_privileges` liệt kê đủ 7 cột
-- cho cả bốn vai, và tôi đọc đó là "danh sách cột được cấp". Không phải — nó
-- khai triển quyền mức BẢNG thành từng dòng cột. Một bảng cấp mức bảng và một
-- bảng cấp đủ từng cột nhìn qua khung đó thì giống hệt nhau.
--
-- Chạy bản 048 cũ còn có hại nhẹ: nó TẠO RA attacl ở ba cột, biến bảng đang
-- lành thành bảng có quyền theo cột — tức là dựng lên đúng cái bẫy mà nó
-- tưởng đang gỡ, cho mọi cột thêm sau này.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO PHÉP KIỂM PHẢI NẰM Ở FILE RIÊNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- Câu kiểm cuối file 046 in ra `cot_moi = 3` trong khi cột không hề tồn tại
-- sau đó. Nó không nói dối: SQL Editor chạy nguyên file trong MỘT transaction,
-- và bên trong transaction thì `alter table` đã có hiệu lực. Câu select đọc
-- đúng trạng thái tại thời điểm ấy. Nếu transaction cuộn ngược sau đó, cột
-- biến mất còn con số 3 thì người vận hành đã đọc rồi.
--
-- Bài học 035 nói "đừng đặt khối tự kiểm biết ném lỗi chung transaction với
-- DDL". Tôi đọc nó thành "không raise exception thì an toàn" và vẫn để câu
-- kiểm ở cuối 046. Sai. Vấn đề không phải ném lỗi — mà là MỘT PHÉP KIỂM CHẠY
-- TRONG CÙNG TRANSACTION VỚI THỨ NÓ KIỂM thì không kiểm được gì hết. Nó chỉ
-- xác nhận rằng câu lệnh đã chạy, điều ta vốn đã biết.
--
-- Phép kiểm chỉ có nghĩa khi nó chạy ở một transaction KHÁC, sau khi
-- transaction kia đã commit. Nên nó nằm ở file riêng.
--
-- ══════════════════════════════════════════════════════════════════════════
-- CÁCH CHẠY
-- ══════════════════════════════════════════════════════════════════════════
--
-- 1. Chạy 046 tới hết. Đọc thông báo lỗi nếu có — ĐỪNG bỏ qua.
-- 2. Chạy file này, trong một lần Run RIÊNG.
-- 3. Đo từ ngoài: npm run check:db
--
-- Ba bước, ba nguồn độc lập. Bước 2 đọc danh mục hệ thống sau khi đã commit;
-- bước 3 hỏi PostgREST, thứ có bộ nhớ đệm riêng và có thể lệch với bước 2.

-- ── Cột có thật không, và quyền của chúng ra sao ──
--
-- Đọc thẳng pg_attribute, KHÔNG qua information_schema.columns:
-- information_schema lọc theo quyền của người đang chạy, nên nó có thể giấu
-- cột — và khi giấu thì trông y hệt như cột không tồn tại.
--
-- `attacl` phải là NULL, giống 7 cột cũ. Ra một danh sách quyền nghĩa là có ai
-- đó (rất có thể là bản 048 cũ) đã cấp theo cột, và mọi cột thêm về sau sẽ
-- không thừa hưởng quyền mức bảng nữa.

select a.attnum, a.attname, a.attacl
from pg_attribute a
where a.attrelid = 'public.profiles'::regclass
  and a.attnum > 0
  and not a.attisdropped
order by a.attnum;

-- Phải thấy 10 dòng: 7 cột cũ + display_name, username, avatar.

-- ── Ràng buộc của 046 ──

select conname
from pg_constraint
where conrelid = 'public.profiles'::regclass
  and conname in ('profiles_username_dang', 'profiles_username_duy_nhat',
                  'profiles_display_name_dai', 'profiles_avatar_dang')
order by conname;

-- Phải thấy đủ 4 dòng.
