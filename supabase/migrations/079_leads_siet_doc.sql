-- 079 — thu hẳn quyền đọc `leads` của anon
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- Đo sau khi 077 chạy: `anon` KHÔNG đọc được dòng nào (RLS làm đúng việc, thử
-- thật qua PostgREST trả về `[]`), nhưng `has_table_privilege('anon', …,
-- 'select')` vẫn TRUE — quyền mức bảng còn đó, chỉ là không có policy nào cho
-- nó đi qua.
--
-- Một lớp là đủ để chặn hôm nay. Nó không đủ cho ngày ai đó thêm một policy
-- SELECT rộng tay vào bảng này, hoặc bật `security_invoker` ở một view đọc
-- sang. Dữ liệu ở đây là tên, email, số điện thoại của người thật — chỗ đáng
-- để có hai lớp.
--
-- `authenticated` GIỮ quyền select, vì policy `leads_giao_vien_doc` cần nó.

revoke select on public.leads from anon;
