-- 063 — thẻ ghi nhớ sinh từ lỗi sai, lịch ôn SM-2
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- roadmap-delf.md §1.3. Lược đồ theo đúng phác thảo ở đó, cộng một cột mà bản
-- phác thiếu — xem `reps` bên dưới.
--
-- ══════════════════════════════════════════════════════════════════════════
-- THẺ SINH TỪ LỖI SAI, KHÔNG NHẬP TAY
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đây là điểm nối quan trọng nhất của cả tính năng. Thẻ nhập tay là thứ người
-- học không bao giờ làm — mọi app thẻ ghi nhớ đều chết ở chỗ đó. Còn câu vừa
-- làm sai thì đã có sẵn: đề bài, đáp án đúng, lời giải thích, và quan trọng
-- nhất là BẰNG CHỨNG rằng người này chưa nắm được nó.
--
-- Nên `tao_the_tu_lo_hong()` đọc `answers` + `questions` ở MÁY CHỦ và tự dựng
-- thẻ. Client không gửi nội dung thẻ lên — nó không được phép tự khai mình sai
-- câu nào, và cũng không cần biết đáp án để dựng mặt sau.

create table if not exists public.cards (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  kind               text not null default 'mot',       -- mot | structure | astuce
  front              text not null,
  back               text not null,
  source_question_id text references public.questions on delete set null,
  created_at         timestamptz not null default now(),

  /* MỘT THẺ MỖI CÂU MỖI NGƯỜI. Không có ràng buộc này thì làm sai cùng một
     câu ba lần là ba thẻ giống hệt nhau, và buổi ôn thành ba lần trả lời cùng
     một thứ. Sai lại lần nữa thì phải ĐẶT LẠI LỊCH của thẻ đang có, chứ không
     phải đẻ thêm thẻ. */
  unique (user_id, source_question_id)
);

create table if not exists public.reviews (
  card_id       uuid primary key references public.cards on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,
  due_at        date not null default current_date,
  interval_days int  not null default 1,
  ease          real not null default 2.5,
  lapses        int  not null default 0,

  /* `reps` KHÔNG có trong phác thảo ở roadmap, và thiếu nó thì SM-2 sai.
     Thuật toán cần biết đây là lần ôn đúng thứ MẤY liên tiếp: lần 1 → 1 ngày,
     lần 2 → 6 ngày, từ lần 3 mới nhân với `ease`. Suy ngược từ
     `interval_days` thì không phân biệt được "lần đầu" với "một thẻ khó đã ôn
     mười lần mà quãng vẫn còn 1 ngày" — hai thứ đó cần hai lịch khác hẳn. */
  reps          int  not null default 0,

  /* Chặn giá trị vô lý ngay ở database. Phép tính SM-2 chạy ở trình duyệt (xem
     src/shared/sm2.js và lý do ở đó), nghĩa là client gửi kết quả xuống — và
     client là thứ người dùng sửa được.

     Không ai có động cơ gian lận lịch ôn của CHÍNH MÌNH, nên đây không phải
     hàng rào chống tấn công. Nó chặn một lỗi lập trình: một phép chia sai ghi
     `interval_days = 0` xuống thì thẻ đó đến hạn mãi mãi và buổi ôn không bao
     giờ kết thúc. */
  constraint reviews_quang_hop_ly  check (interval_days between 1 and 365),
  constraint reviews_ease_hop_ly   check (ease between 1.3 and 3.0),
  constraint reviews_lapses_khong_am check (lapses >= 0 and reps >= 0)
);

create index if not exists reviews_den_han on public.reviews (user_id, due_at);

alter table public.cards   enable row level security;
alter table public.reviews enable row level security;

-- ══════════════════════════════════════════════════════════════════════════
-- RLS: chỉ của mình, và chỉ ĐỌC
-- ══════════════════════════════════════════════════════════════════════════
--
-- Không có policy ghi trên `cards`: thẻ do máy chủ dựng từ lỗi sai, không do
-- client khai. Cho client chèn thẻ thì nó tự viết được mặt sau — tức là tự
-- viết đáp án cho mình, mà đáp án chính là thứ migration 022 khoá đi.
--
-- `reviews` thì cho UPDATE, vì kết quả một lần ôn đến từ cú bấm của người
-- dùng. Ràng buộc CHECK ở trên là hàng rào của đường đó.

drop policy if exists cards_cua_minh   on public.cards;
drop policy if exists reviews_cua_minh on public.reviews;
drop policy if exists reviews_sua_cua_minh on public.reviews;

create policy cards_cua_minh on public.cards
  for select to authenticated using (user_id = (select auth.uid()));

create policy reviews_cua_minh on public.reviews
  for select to authenticated using (user_id = (select auth.uid()));

create policy reviews_sua_cua_minh on public.reviews
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke insert, delete on public.reviews from anon, authenticated;
revoke insert, update, delete on public.cards from anon, authenticated;

/* `user_id` KHÔNG được sửa. Policy update ở trên kiểm cả `using` lẫn
   `with check` nên không đổi sang người khác được, nhưng thu quyền cột là lớp
   thứ hai và nó không phụ thuộc vào việc đọc đúng một policy.

   `card_id` cũng vậy: đổi khoá chính của dòng mình sang thẻ người khác là
   cách vòng qua mọi phép kiểm ở trên. */
revoke update (user_id, card_id) on public.reviews from anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- SINH THẺ TỪ LỖ HỔNG
-- ══════════════════════════════════════════════════════════════════════════

create or replace function public.tao_the_tu_lo_hong(p_gioi_han int default 20)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
  n  int;
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  with sai as (
    /* Câu đã trả lời SAI, mới nhất trước. Lọc theo attempt của chính mình —
       không dựa vào RLS: một hàm security definer chạy vòng qua RLS, nên điều
       kiện phải nằm ngay trong câu. Quên nó là mở cửa đọc bài người khác. */
    select distinct on (a.question_id)
           a.question_id, q.prompt, q.explanation, q.point_gram
      from public.answers a
      join public.attempts t on t.id = a.attempt_id
      join public.questions q on q.id = a.question_id
     where t.user_id = ai
       and a.correct = false
       and q.prompt is not null
     order by a.question_id, a.id desc
  ),
  chon as (
    select * from sai
     /* Bỏ câu đã có thẻ. Ràng buộc unique cũng chặn, nhưng lọc trước thì
        `p_gioi_han` đếm đúng số thẻ MỚI thay vì đếm cả những dòng sẽ bị bỏ. */
     where question_id not in (
       select source_question_id from public.cards
        where user_id = ai and source_question_id is not null
     )
     limit greatest(p_gioi_han, 0)
  ),
  them as (
    insert into public.cards (user_id, kind, front, back, source_question_id)
    select ai,
           case when point_gram is null then 'mot' else 'structure' end,
           prompt,
           /* Mặt sau là LỜI GIẢI THÍCH, không phải đáp án trần.
              "Đáp án là B" không dạy gì; câu giải thích mới dạy. Câu chưa có
              explanation thì nói thẳng là chưa có, đừng dựng chữ thay thế. */
           coalesce(nullif(trim(explanation), ''),
                    'Câu này chưa có lời giải thích. Mở lại bài để xem đáp án.'),
           question_id
      from chon
    returning 1
  )
  select count(*)::int into n from them;

  /* Mỗi thẻ mới cần một dòng lịch. Tách khỏi câu trên vì `returning` của CTE
     không cho chèn tiếp vào bảng thứ hai trong cùng câu. */
  insert into public.reviews (card_id, user_id)
  select c.id, ai from public.cards c
   where c.user_id = ai
     and not exists (select 1 from public.reviews r where r.card_id = c.id);

  return n;
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- SAI LẠI CÂU CŨ → ĐẶT LẠI LỊCH, KHÔNG ĐẺ THẺ MỚI
-- ══════════════════════════════════════════════════════════════════════════
--
-- Ràng buộc unique đã chặn thẻ trùng. Nhưng "đã có thẻ rồi nên bỏ qua" là sai
-- ở chỗ khác: người vừa sai lại đúng câu đó nghĩa là thẻ ấy đang được xếp lịch
-- quá thưa. Kéo nó về hôm nay và ghi thêm một lần quên.

create or replace function public.dat_lai_the_sai(p_question_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  update public.reviews r
     set due_at = current_date,
         interval_days = 1,
         reps = 0,
         lapses = r.lapses + 1,
         ease = greatest(1.3, r.ease - 0.2)
    from public.cards c
   where c.id = r.card_id
     and c.user_id = ai
     and c.source_question_id = p_question_id;
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- GHI KẾT QUẢ MỘT LẦN ÔN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Phép tính SM-2 chạy ở trình duyệt (src/shared/sm2.js). Hàm này chỉ GHI, và
-- ràng buộc CHECK trên bảng là hàng rào. Xem chú thích ở `reviews` để biết vì
-- sao chấp nhận được.

create or replace function public.ghi_lan_on(
  p_card_id uuid,
  p_due_at date,
  p_interval_days int,
  p_ease real,
  p_reps int,
  p_lapses int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  /* Ngày đến hạn phải nằm trong tương lai gần. Quá khứ nghĩa là thẻ đến hạn
     ngay lập tức và buổi ôn không bao giờ kết thúc. */
  if p_due_at < current_date or p_due_at > current_date + 365 then
    raise exception 'ngày ôn lại ngoài khoảng cho phép: %', p_due_at using errcode = '22007';
  end if;

  update public.reviews
     set due_at = p_due_at,
         interval_days = p_interval_days,
         ease = p_ease,
         reps = p_reps,
         lapses = p_lapses
   where card_id = p_card_id
     and user_id = ai;

  if not found then
    raise exception 'không có thẻ này, hoặc thẻ không thuộc về bạn'
      using errcode = '42501';
  end if;
end $$;

revoke all on function public.tao_the_tu_lo_hong(int) from public, anon;
revoke all on function public.dat_lai_the_sai(text) from public, anon;
revoke all on function public.ghi_lan_on(uuid, date, int, real, int, int) from public, anon;
grant execute on function public.tao_the_tu_lo_hong(int) to authenticated;
grant execute on function public.dat_lai_the_sai(text) to authenticated;
grant execute on function public.ghi_lan_on(uuid, date, int, real, int, int) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 064.
