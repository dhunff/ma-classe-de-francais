-- 019 — chặn nội dung bài trả phí ở tầng RLS
--
-- ══ VÌ SAO PHẢI LÀ RLS, KHÔNG PHẢI JAVASCRIPT ══
--
-- FRACILE là SPA chạy hoàn toàn trong trình duyệt (React + Vite). Không có máy
-- chủ nào của ta đứng giữa. Trình duyệt nói chuyện thẳng với Supabase bằng
-- `anon key` — mà anon key nằm sẵn trong bundle, ai xem mã nguồn trang cũng
-- đọc được. Nó KHÔNG phải mật khẩu.
--
-- Nghĩa là mọi thứ viết bằng JavaScript đều chỉ điều khiển GIAO DIỆN:
--
--     if (!canOpen(ex, access, name)) return <Khoá/>;   ← xoá được trong DevTools
--
-- Chặn ở đó chỉ giấu cái nút. Dữ liệu vẫn nằm trong tầm với. Trước migration
-- này, một dòng lệnh không cần đăng nhập là lấy sạch đáp án:
--
--     curl "$SUPABASE_URL/rest/v1/questions?select=prompt,payload" -H "apikey: $ANON"
--     → {"prompt":"…", "payload":{"answer":0,"options":[…]}}
--
-- RLS thì khác: nó chạy TRONG Postgres, sau khi request đã tới nơi. Trình
-- duyệt không sửa được nó, không bỏ qua được nó, và không nói dối được về
-- danh tính — vì danh tính đến từ JWT đã ký, không phải từ một biến JS.
--
-- Quy tắc chung để nhớ: **kiểm tra ở client là cho trải nghiệm, kiểm tra ở
-- server là cho bảo mật.** Cần cả hai, nhưng chỉ cái sau mới ngăn được người
-- cố tình.
--
-- ══ PHẠM VI ══
--
-- Chỉ khoá bài TRẢ PHÍ. Bài miễn phí vẫn mở cho khách vãng lai đọc — thư viện
-- ở /decouvrir sống nhờ điều đó, và đáp án bài miễn phí vốn đã nằm trong tầm
-- với, được ghi nhận là đánh đổi chấp nhận được cho việc tự luyện (xem 010).
--
-- CHƯA GIẢI QUYẾT — nói rõ để đừng ai tưởng đã xong: bài trả phí mà học sinh
-- ĐÃ MUA thì đáp án vẫn về trình duyệt cùng lúc với đề. Em ấy vẫn xem trước
-- được. Chấp nhận được cho tự luyện, KHÔNG chấp nhận được cho thi thử. Muốn
-- kín hẳn thì phải chuyển việc chấm lên Edge Function — vẫn là câu hỏi treo ở
-- docs/roadmap-delf.md §5.
--
-- Cần 002 (is_teacher), 003 (profiles), 004 (has_premium_access), 010 (bảng).

-- ─────────────────────── Hàm quyết định ───────────────────────
--
-- `security definer` vì hàm phải đọc `profiles` và `exercise_access` bất kể
-- RLS của hai bảng đó — nếu không, học sinh không đọc được dòng quyền của
-- CHÍNH MÌNH thì hàm luôn trả false và khoá luôn cả người đã trả tiền.
--
-- `set search_path = public` là bắt buộc với security definer: thiếu nó,
-- người gọi có thể trỏ search_path sang schema của họ và khiến hàm chạy nhầm
-- bảng — leo thang đặc quyền kinh điển.
--
-- `stable` cho phép Postgres gọi một lần cho mỗi giá trị đầu vào thay vì mỗi
-- dòng, nên 400+ câu hỏi không thành 400 lần truy vấn.
create or replace function public.can_open_exercise(ex_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    /* 1. Bài không phải trả phí → ai cũng đọc được.
          Viết dưới dạng NOT EXISTS để bài không tồn tại cũng rơi vào nhánh
          này; câu hỏi mồ côi không có gì đáng giấu, và khoá nó lại chỉ làm
          giao diện hỏng theo cách khó truy. */
    not exists (
      select 1 from public.exercises e
       where e.id = ex_id
         and (e.meta ->> 'isPremium')::boolean is true
    )
    /* 2. Giáo viên xem được tất. is_teacher() đọc app_metadata — chỗ duy nhất
          người dùng KHÔNG tự sửa được (user_metadata thì sửa được). */
    or public.is_teacher()
    /* 3. Học sinh đóng trọn gói. */
    or exists (
      select 1 from public.profiles p
       where p.id = (select auth.uid())
         and p.has_premium_access
    )
    /* 4. Học sinh đã mua đúng bài này. Nối qua `name` vì exercise_access lưu
          tên chứ không lưu uuid — hạn chế đã biết của lược đồ 001, và là lý do
          nên chuyển sang khoá ngoại uuid khi có dịp. */
    or exists (
      select 1
        from public.exercise_access a
        join public.profiles p on p.name = a.student
       where a.exercise_id = ex_id
         and p.id = (select auth.uid())
    );
$$;

comment on function public.can_open_exercise(text) is
  'Người gọi hiện tại có được đọc nội dung bài này không. Dùng trong RLS của questions.';

-- ─────────────────────── Policy ───────────────────────
--
-- `exercises` vẫn mở: tiêu đề, trình độ, kỹ năng là thứ tường phí cần hiện ra
-- để mời chào. Đúng tinh thần "masked preview metadata".
--
-- `questions` mới là chỗ chứa đề và đáp án — khoá ở đây.
drop policy if exists questions_read on public.questions;

create policy questions_read on public.questions
  for select to anon, authenticated
  using (public.can_open_exercise(exercise_id));

-- ─────────────────────── Tự chứng minh ───────────────────────
--
-- Một policy chưa bao giờ thấy chạy là một policy chưa biết có chạy không.
-- Khối này dựng dữ liệu giả, đóng vai khách vãng lai, và ĐÒI đúng con số.
-- Sai một ly là migration tự huỷ, không có gì được ghi.
-- Bản đầu dùng `set local role anon` ngay trong migration để đóng vai khách.
-- Không chạy được: vai trò chạy migration không chuyển sang anon rồi đọc bảng
-- được (permission denied). Nên tách làm hai tầng.
--
-- TẦNG 1 — ở đây: kiểm chính HÀM quyết định, không JWT nào cả, tức đúng hoàn
-- cảnh của khách vãng lai (auth.uid() rỗng, is_teacher() false).
--
-- TẦNG 2 — bằng HTTP thật, sau khi migration chạy xong: gọi PostgREST bằng
-- anon key và đòi 0 dòng. Đó mới là đường tấn công thật, nên nó mới là bằng
-- chứng thật. Hai bài thử dưới đây được GIỮ LẠI để làm việc đó, rồi migration
-- 020 dọn đi.
do $$
declare
  mo_bai_phi boolean; mo_bai_free boolean;
begin
  insert into public.exercises (id, store, title, level, meta)
       values ('__test_premium__', 'practice', 'Bài thử trả phí', 'B1',
               '{"isPremium": true, "price": 50000}'::jsonb),
              ('__test_free__', 'practice', 'Bài thử miễn phí', 'B1', '{}'::jsonb)
    on conflict (id) do update set meta = excluded.meta;

  insert into public.questions (id, exercise_id, ord, type, prompt, payload)
       values ('__q_premium__', '__test_premium__', 1, 'qcm', 'Đề trả phí',
               '{"answer": 0, "options": ["đúng", "sai"]}'::jsonb),
              ('__q_free__', '__test_free__', 1, 'qcm', 'Đề miễn phí',
               '{"answer": 0, "options": ["đúng", "sai"]}'::jsonb)
    on conflict (id) do nothing;

  select public.can_open_exercise('__test_premium__') into mo_bai_phi;
  select public.can_open_exercise('__test_free__')    into mo_bai_free;

  raise notice 'không đăng nhập → bài trả phí: % · bài miễn phí: %',
    mo_bai_phi, mo_bai_free;

  if mo_bai_phi is not false then
    raise exception 'HỎNG: bài trả phí mở cho người chưa đăng nhập (%)', mo_bai_phi;
  end if;
  if mo_bai_free is not true then
    raise exception 'QUÁ CHẶT: bài miễn phí phải mở, nhận được %', mo_bai_free;
  end if;
end $$;
