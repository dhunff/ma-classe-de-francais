-- 024 — giới hạn nghe 2 lần, đếm ở máy chủ (roadmap §2.3)
--
-- ══ HAI LỖ HỔNG, KHÔNG PHẢI MỘT ══
--
-- Spec chỉ nói "lưu xuống máy chủ, đừng giữ trong state React". Cần thiết,
-- nhưng chưa đủ. Với lược đồ ở 023 thì vẫn còn hai đường vòng:
--
-- 1. HỌC SINH TỰ SỬA ĐƯỢC. Policy `attempts_own` là `for all`, nghĩa là chủ
--    sở hữu được UPDATE dòng của mình. Một lệnh PATCH đặt `audio_plays = {}`
--    là nghe lại từ đầu. Lưu ở máy chủ mà để người ta ghi thì cũng như không.
--
-- 2. TẢI LẠI TRANG LÀ ĐẾM LẠI. Nếu mỗi lần vào phần thi lại tạo một `attempt`
--    mới thì bộ đếm về 0 — đúng cái spec cảnh báo, chỉ là dời chỗ hỏng từ
--    React sang database. `exam_start` dưới đây DÙNG LẠI lần làm chưa kết
--    thúc, nên tải lại trang không đẻ ra bộ đếm mới.
--
-- Cách bịt: trình duyệt KHÔNG được ghi thẳng vào hai bảng này nữa. Mọi thay
-- đổi đi qua hàm `security definer` — hàm quyết định, không phải người gọi.

-- ─────────────── Thu quyền ghi khỏi trình duyệt ───────────────
--
-- Giữ SELECT: học sinh vẫn phải xem được lịch sử của mình (policy
-- `attempts_own` lo phạm vi). Chỉ bỏ đường GHI.
revoke insert, update, delete on public.attempts from anon, authenticated;
revoke insert, update, delete on public.answers  from anon, authenticated;

-- ─────────────── Lõi, tách ra để kiểm được ───────────────
--
-- Nhận `p_user` tường minh thay vì gọi `auth.uid()` bên trong. Nhờ vậy khối
-- đối chiếu ở cuối file chạy thử được toàn bộ luật mà không cần một phiên đăng
-- nhập — thứ mà migration không có. Hàm công khai bên dưới chỉ là lớp vỏ mỏng
-- bơm `auth.uid()` vào.
create or replace function public._exam_play(
  p_user uuid, p_attempt uuid, p_question text, p_max int
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  da_nghe int;
  chu_so_huu uuid;
begin
  select user_id into chu_so_huu from public.attempts where id = p_attempt;

  /* Không có quyền thì trả lời y hệt như khi không tồn tại. Phân biệt hai
     trường hợp là để lộ rằng attempt đó có thật — nhỏ, nhưng miễn phí để
     tránh. */
  if chu_so_huu is null or chu_so_huu <> p_user then
    return jsonb_build_object('allowed', false, 'plays', 0, 'reason', 'not_found');
  end if;

  select coalesce((audio_plays ->> p_question)::int, 0)
    into da_nghe from public.attempts where id = p_attempt;

  if da_nghe >= p_max then
    /* KHÔNG tăng tiếp. Đếm vượt ngưỡng chẳng để làm gì, mà lại khiến con số
       trong dữ liệu không còn nghĩa "đã nghe mấy lần". */
    return jsonb_build_object('allowed', false, 'plays', da_nghe, 'reason', 'limit');
  end if;

  update public.attempts
     set audio_plays = jsonb_set(audio_plays, array[p_question],
                                 to_jsonb(da_nghe + 1), true)
   where id = p_attempt;

  return jsonb_build_object('allowed', true, 'plays', da_nghe + 1,
                            'remaining', p_max - da_nghe - 1);
end $$;

-- ─────────────── Hàm cho trình duyệt gọi ───────────────

create or replace function public.exam_play_audio(p_attempt uuid, p_question text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  -- 2 lượt: con số của kỳ thi thật, roadmap §2.3.
  select public._exam_play((select auth.uid()), p_attempt, p_question, 2);
$$;

/* Mở hoặc tiếp tục một lần làm bài.
 *
 * DÙNG LẠI lần chưa kết thúc thay vì tạo mới — đây chính là chỗ chặn đường
 * "tải lại trang để nghe lại". Không có nó thì bộ đếm nằm ở máy chủ vẫn vô
 * dụng, vì mỗi F5 là một bộ đếm mới tinh. */
create or replace function public.exam_start(p_exercise_id text, p_mode text default 'exam')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := (select auth.uid());
  cu uuid;
begin
  if me is null then
    raise exception 'chưa đăng nhập' using errcode = '28000';
  end if;

  select id into cu
    from public.attempts
   where user_id = me and exercise_id = p_exercise_id
     and mode = p_mode and finished_at is null
   order by started_at desc limit 1;

  if cu is not null then return cu; end if;

  insert into public.attempts (user_id, exercise_id, mode)
       values (me, p_exercise_id, p_mode)
    returning id into cu;
  return cu;
end $$;

revoke all on function public.exam_play_audio(uuid, text) from public;
revoke all on function public.exam_start(text, text) from public;
revoke all on function public._exam_play(uuid, uuid, text, int) from public;
grant execute on function public.exam_play_audio(uuid, text) to authenticated;
grant execute on function public.exam_start(text, text) to authenticated;
-- `_exam_play` cố ý KHÔNG cấp cho ai: nó nhận p_user tường minh, nên gọi được
-- là đóng vai được người khác. Chỉ hàm vỏ ở trên được phép gọi nó.

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare
  ai uuid; bai text; att uuid; r jsonb; n_ghi int;
begin
  /* Trình duyệt phải hết đường ghi thẳng. */
  select count(*) into n_ghi
    from information_schema.table_privileges
   where table_schema = 'public' and table_name in ('attempts','answers')
     and grantee in ('anon','authenticated')
     and privilege_type in ('INSERT','UPDATE','DELETE');
  if n_ghi <> 0 then
    raise exception 'còn % quyền ghi thẳng vào attempts/answers', n_ghi;
  end if;

  select id into ai from auth.users limit 1;
  select id into bai from public.exercises limit 1;

  if ai is null then
    /* Chưa có tài khoản nào thì không dựng được attempt (khoá ngoại). Nói ra
       chứ đừng lặng lẽ bỏ qua — bộ kiểm im lặng là bộ kiểm nói dối. */
    raise notice 'BỎ QUA phần kiểm hành vi: chưa có auth.users nào để dựng attempt thử';
    return;
  end if;

  insert into public.attempts (user_id, exercise_id, mode)
       values (ai, bai, 'exam') returning id into att;

  r := public._exam_play(ai, att, 'q1', 2);
  if (r ->> 'allowed')::boolean is not true or (r ->> 'plays')::int <> 1 then
    raise exception 'lượt 1 phải được phép: %', r;
  end if;

  r := public._exam_play(ai, att, 'q1', 2);
  if (r ->> 'allowed')::boolean is not true or (r ->> 'plays')::int <> 2 then
    raise exception 'lượt 2 phải được phép: %', r;
  end if;

  r := public._exam_play(ai, att, 'q1', 2);
  if (r ->> 'allowed')::boolean is not false or (r ->> 'plays')::int <> 2 then
    raise exception 'lượt 3 phải bị chặn VÀ không tăng đếm: %', r;
  end if;

  /* Câu khác đếm riêng — bộ đếm theo từng câu, không theo cả phần thi. */
  r := public._exam_play(ai, att, 'q2', 2);
  if (r ->> 'plays')::int <> 1 then
    raise exception 'câu q2 phải đếm riêng: %', r;
  end if;

  /* Người khác không đụng được vào attempt này. */
  r := public._exam_play('00000000-0000-0000-0000-000000000000', att, 'q1', 2);
  if (r ->> 'allowed')::boolean is not false or (r ->> 'reason') <> 'not_found' then
    raise exception 'người lạ phải bị từ chối: %', r;
  end if;

  raise notice 'giới hạn nghe: 2 lượt OK, lượt 3 bị chặn, đếm theo từng câu, người lạ bị từ chối';
  delete from public.attempts where id = att;
end $$;
