-- 033 — cấp quyền tay cho một giao dịch đã nhận tiền nhưng webhook từ chối
--
-- ══ VÌ SAO PHẢI LÀM TAY ══
--
-- 26/08/2026 13:35, giao dịch #76662247: +94.000₫, nội dung
-- « LMS HUNGDO W4X6VC ». Webhook trả 401 vì lúc đó nó ký body trần trong khi
-- SePay ký kèm `x-sepay-timestamp` — xem commit e58fcd9. Tiền vào thật, quyền
-- không được cấp, và học sinh bị khoá ngoài bài mình đã trả tiền.
--
-- Đây là ghi thẳng vào quyền lợi của người dùng thật, nên KHÔNG tự động. Người
-- dùng đã yêu cầu rõ ràng sau khi đối chiếu đủ bốn mảnh:
--
--   số tiền     94.000  =  giá bài mt896bzlw4x6vc (94.000)   ✓
--   memo        W4X6VC  =  6 ký tự cuối của id bài            ✓
--   memo        HUNGDO  =  chuẩn hoá NFD của « Hùng Đỗ »      ✓
--   ref         76662247 chưa từng xuất hiện                  ✓
--
-- ══ VÌ SAO GHI CẢ `ref` ══
--
-- `ref` là UNIQUE. Ghi đúng mã giao dịch nghĩa là khi webhook chạy được và
-- SePay gửi lại lần nữa, nó sẽ đụng ràng buộc đó và trả `duplicate: true` —
-- không cấp quyền hai lần, và sổ sách vẫn đối chiếu được với sao kê ngân hàng.
--
-- Bỏ `ref` đi thì dòng này thành một khoản trời ơi không lần được về giao dịch
-- nào, và lần webhook sau sẽ tạo thêm một dòng nữa.

insert into public.exercise_access (student, exercise_id, status, amount, ref)
values ($ten$Hùng Đỗ$ten$, 'mt896bzlw4x6vc', 'PURCHASED', 94000, '76662247')
on conflict (student, exercise_id) do update
  set status = excluded.status,
      amount = excluded.amount,
      ref    = excluded.ref;

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare r record; n int;
begin
  select count(*) into n from public.exercise_access where ref = '76662247';
  if n <> 1 then
    raise exception 'mong đúng 1 dòng cho ref 76662247, có %', n;
  end if;

  select student, exercise_id, amount into r
    from public.exercise_access where ref = '76662247';

  /* Tên phải khớp CHÍNH XÁC tên trong profiles — ứng dụng so bằng chuỗi thuần
     (`hasAccess`), không chuẩn hoá gì. Lệch một dấu là học sinh vẫn bị khoá,
     và nhìn vào bảng thì trông như đã cấp rồi. */
  if not exists (select 1 from public.profiles
                  where role = 'eleve' and name = r.student) then
    raise exception 'tên « % » không khớp học sinh nào trong profiles', r.student;
  end if;

  if not exists (select 1 from public.exercises
                  where id = r.exercise_id
                    and (meta ->> 'price')::int = r.amount) then
    raise exception 'số tiền % không khớp giá của bài %', r.amount, r.exercise_id;
  end if;

  raise notice 'đã cấp: % → % (% đ, ref 76662247)', r.student, r.exercise_id, r.amount;
end $$;
