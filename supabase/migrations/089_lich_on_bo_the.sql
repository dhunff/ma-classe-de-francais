-- ═══════════════════════════════════════════════════════════════════════════
-- LỊCH ÔN SM-2 CHO BỘ FLASHCARD CỦA GIÁO VIÊN
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ VÌ SAO ══
--
-- Màn luyện bộ thẻ (LuyenBoThe.jsx) có hai nút « Chưa nhớ » / « Nhớ rồi », và
-- tới trước migration này CẢ HAI KHÔNG GHI GÌ. Bấm xong là quên. Hai cái nút
-- trông như đang theo dõi việc học mà thật ra không — đúng loại lời hứa ngầm
-- mà dự án đã gỡ khỏi trang giới thiệu hai lần.
--
-- Bộ máy lịch ôn thì đã có sẵn và đã kiểm kỹ: `shared/sm2.js` (57 ca), bảng
-- `reviews` với CHECK chặn giá trị vô lý, RPC `ghi_lan_on`. Nó chỉ mất màn hình
-- khi thẻ-sinh-từ-lỗi-sai bị gỡ ngày 09/09. Migration này nối nó vào bộ thẻ
-- của giáo viên thay vì viết một bộ máy thứ hai.
--
-- ══ MÔ HÌNH ══
--
-- Một thẻ trong bộ (`the_bo_the`) là NỘI DUNG, dùng chung. Lịch ôn là của
-- TỪNG NGƯỜI. Nên mỗi học sinh khi mở bộ lần đầu có một dòng `cards` riêng trỏ
-- về thẻ gốc qua `bo_the_id`, kèm một dòng `reviews`. Cùng thẻ, 30 học sinh,
-- 30 lịch ôn khác nhau.
--
-- ══ CHỮ ĐỌC TỪ THẺ GỐC, KHÔNG TỪ BẢN CHÉP ══
--
-- `cards.front/back` là NOT NULL nên vẫn phải chép một bản lúc tạo. Nhưng hàm
-- `hoc_bo` trả chữ từ `the_bo_the`, không từ `cards`. Lý do: bài học của
-- `luu_loi_giai` (069/070) — `cards.back` là bản chép đông cứng, thẻ không bao
-- giờ sinh lại, nên giáo viên sửa lỗi chính tả xong thấy « đã lưu » mà phía học
-- sinh không đổi gì, mãi mãi, im lặng tuyệt đối. Đọc từ nguồn thì cái bẫy đó
-- không có chỗ để xảy ra.

-- ── 1. Nới CHECK đóng của `nguon` ──
--
-- Bẫy 059, lần thứ hai: `cards_nguon_hop_le` chỉ nhận 'loi_sai' | 'tu_tao'.
-- Không nới thì mọi lần chèn thẻ từ bộ giáo viên bị database từ chối, và không
-- bộ kiểm đọc-mã-nguồn nào bắt được — `check:db` đọc CỘT, không đọc CHECK.
alter table public.cards drop constraint if exists cards_nguon_hop_le;
alter table public.cards add constraint cards_nguon_hop_le
  check (nguon in ('loi_sai', 'tu_tao', 'bo_giao_vien'));

-- ── 2. Nối thẻ cá nhân về đúng thẻ gốc ──
--
-- ON DELETE CASCADE: giáo viên xoá một thẻ khỏi bộ thì lịch ôn của mọi học sinh
-- cho thẻ đó đi theo (reviews cũng cascade từ cards). Để lại thì học sinh ôn
-- một thẻ không còn tồn tại — và `hoc_bo` sẽ không trả nó về vì phép join với
-- `the_bo_the` rơi mất, tức là dòng mồ côi nằm đó không ai thấy, không ai dọn.
alter table public.cards
  add column if not exists bo_the_id uuid references public.the_bo_the(id) on delete cascade;

-- Một người, một lịch cho mỗi thẻ gốc. Mở bộ lần hai không được đẻ thêm thẻ.
-- NULL khác NULL trong UNIQUE, nên thẻ cũ (bo_the_id NULL) không vướng gì.
create unique index if not exists cards_mot_lich_moi_the_goc
  on public.cards (user_id, bo_the_id);

-- ── 3. Mở bộ để học ──
--
-- Làm hai việc trong MỘT lời gọi: chèn những thẻ người này chưa có, rồi trả về
-- toàn bộ thẻ của bộ kèm lịch ôn. Tách thành hai lời gọi thì giữa chúng có một
-- khoảng mà màn hình đọc được bộ nhưng chưa có lịch — và thẻ mới hiện ra như
-- "chưa có lịch" thay vì "đến hạn hôm nay".
--
-- SECURITY DEFINER vì `cards` KHÔNG cấp INSERT cho authenticated (063, 073).
-- Nên quyền phải được kiểm NGAY TRONG hàm: bộ phải công khai, hoặc người gọi là
-- giáo viên. Thiếu phép kiểm đó thì ai biết id một bộ nháp cũng đọc được nó
-- qua hàm này, vượt qua đúng cái RLS mà 085 dựng lên.
create or replace function public.hoc_bo(p_bo uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := (select auth.uid()); duoc boolean;
begin
  if me is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  select (b.cong_khai or is_teacher()) into duoc from public.the_bo b where b.id = p_bo;
  if duoc is null then
    raise exception 'khong_co_bo' using errcode = 'P0002';
  end if;
  if not duoc then
    -- Cùng một thông báo cho "không có" và "không được xem" thì người ta không
    -- dò được id nào là bộ nháp có thật. Nhưng mã lỗi khác nhau để màn hình và
    -- người vận hành vẫn phân biệt được khi cần.
    raise exception 'khong_co_bo' using errcode = '42501';
  end if;

  insert into public.cards (user_id, kind, front, back, nguon, bo_id, bo_the_id, example_sentence)
  select me, 'mot', t.mat_truoc, t.mat_sau, 'bo_giao_vien', t.bo_id, t.id, t.vi_du
    from public.the_bo_the t
   where t.bo_id = p_bo
  on conflict (user_id, bo_the_id) do nothing;

  -- Thẻ mới đến hạn HÔM NAY (default của reviews.due_at). Thẻ tạo xong mà
  -- không có lịch thì không bao giờ đến hạn — người học mở bộ, thấy trống.
  insert into public.reviews (card_id, user_id)
  select c.id, me
    from public.cards c
   where c.user_id = me and c.bo_id = p_bo and c.bo_the_id is not null
  on conflict (card_id) do nothing;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'card_id', c.id,
             'bo_the_id', t.id,
             'mat_truoc', t.mat_truoc,     -- từ THẺ GỐC, xem đầu file
             'mat_sau', t.mat_sau,
             'phien_am', t.phien_am,
             'vi_du', t.vi_du,
             'am_thanh', t.am_thanh,
             'due_at', r.due_at,
             'interval_days', r.interval_days,
             'ease', r.ease,
             'lapses', r.lapses,
             'reps', r.reps
           ) order by t.ord, t.created_at)
      from public.cards c
      join public.the_bo_the t on t.id = c.bo_the_id
      join public.reviews r on r.card_id = c.id
     where c.user_id = me and c.bo_id = p_bo
  ), '[]'::jsonb);
end $$;

-- Thu đích danh. `revoke … from public` KHÔNG gỡ quyền Supabase cấp thẳng cho
-- anon — bẫy đã dính ba lần (022, 024, 063). 090 hỏi lại catalog.
revoke all on function public.hoc_bo(uuid) from public, anon;
grant execute on function public.hoc_bo(uuid) to authenticated;
