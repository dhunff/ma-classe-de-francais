-- ═══════════════════════════════════════════════════════════════════════════
-- CHẤM THẺ CÓ BIÊN NHẬN — lần ôn nào cũng trả về bằng chứng nó đã được ghi
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ LỖI ĐANG SỐNG, TÁI HIỆN ĐƯỢC NGÀY 22/09 ══
--
-- Học sinh bấm « Tốt » ba lần. Mỗi lần trình duyệt nhận POST /rpc/ghi_lan_on →
-- 204, không lỗi, màn hình lật sang thẻ sau. Database: cả 8 thẻ vẫn reps = 0,
-- và bộ đếm n_tup_upd của `reviews` KHÔNG NHÚC NHÍCH — trong khi một lệnh
-- UPDATE, kể cả bị rollback, luôn làm nó tăng (đã hiệu chuẩn: 36 → 37).
--
-- Cùng hàm, cùng tài khoản, cùng thẻ, chạy bằng claim giả trong db query →
-- cập nhật bình thường. Đầu dò tạm qua đúng PostgREST bằng khoá anon, hàm void
-- UPDATE → lưu được. Nên thứ khác biệt là phiên JWT thật của người dùng, thứ
-- không tái tạo được từ phía máy chủ.
--
-- Rất có thể đây là CÙNG lỗi với `luu_neo` / `luu_loi_giai` đầu tháng 9: báo
-- thành công, không lưu. Ba tuần chưa tìm ra vì mọi phép thử đều chạy từ phía
-- máy chủ, nơi lỗi không xảy ra.
--
-- ══ VÌ SAO HÀM MỚI THAY VÌ SỬA HÀM CŨ ══
--
-- `ghi_lan_on` trả `void`, nên « thành công » không chứng minh được gì: 204 rỗng
-- là thứ duy nhất trình duyệt nhận, và nó y hệt nhau dù hàng có được sửa hay
-- không. Đổi kiểu trả về của một hàm đang dùng là phải drop — và app đang chạy
-- sẽ gãy trong khoảng giữa. Nên dựng hàm mới, cho app chuyển sang, giữ hàm cũ.
--
-- Hàm mới trả về một BIÊN NHẬN: máy chủ nhận ra ai, sửa bao nhiêu dòng, reps
-- trước và sau. Client ĐỐI CHIẾU biên nhận trước khi lật thẻ. Hai lợi ích:
--   1. Hỏng thì hiện chữ đỏ thay vì im lặng — đúng thứ lỗi này thiếu.
--   2. Người dùng dán được nội dung tab Response, và nó sẽ nói thẳng chỗ lệch.

create or replace function public.cham_the(
  p_card_id uuid,
  p_due_at date,
  p_interval_days int,
  p_ease real,
  p_reps int,
  p_lapses int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
  truoc int;
  so_dong int;
  sau int;
  chu uuid;
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  if p_due_at < current_date or p_due_at > current_date + 365 then
    raise exception 'ngày ôn lại ngoài khoảng cho phép: %', p_due_at using errcode = '22007';
  end if;

  -- Đọc trước, để biên nhận nói được "đã đổi từ bao nhiêu sang bao nhiêu" và —
  -- khi hỏng — thẻ này thật ra thuộc về ai.
  select r.reps, r.user_id into truoc, chu from public.reviews r where r.card_id = p_card_id;

  update public.reviews
     set due_at = p_due_at,
         interval_days = p_interval_days,
         ease = p_ease,
         reps = p_reps,
         lapses = p_lapses
   where card_id = p_card_id
     and user_id = ai;
  get diagnostics so_dong = row_count;

  if so_dong = 0 then
    raise exception 'không có thẻ này, hoặc thẻ không thuộc về bạn (uid=%, chủ thẻ=%)', ai, chu
      using errcode = '42501';
  end if;

  select r.reps into sau from public.reviews r where r.card_id = p_card_id;

  return jsonb_build_object(
    'ok', true,
    'uid', ai,
    'so_dong', so_dong,
    'reps_truoc', truoc,
    'reps_sau', sau,
    'due_at', p_due_at,
    'luc', now()
  );
end $$;

revoke all on function public.cham_the(uuid, date, int, real, int, int) from public, anon;
grant execute on function public.cham_the(uuid, date, int, real, int, int) to authenticated;
