-- Sổ tay — mẹo và cấu trúc, do giáo viên soạn.
--
-- VÌ SAO LÀ BẢNG CHỨ KHÔNG PHẢI MỘT KHOÁ kv_store NỮA:
--
-- Tài liệu docs/roadmap-delf.md vừa chỉ ra rằng mọi thứ nằm trong blob JSON
-- đều gặp cùng ba vấn đề — đọc-sửa-ghi làm mất dữ liệu khi hai người sửa cùng
-- lúc, chi phí đọc tăng tuyến tính, và không truy vấn được. Thêm `mcf-tips`
-- vào kv_store là làm dày thêm đúng cái đống ấy ngay sau khi vừa viết rằng
-- đừng làm thế.
--
-- Bảng này nhỏ nên chi phí gần như bằng không, và nó lập luôn khuôn cho
-- `exercises`/`questions` sẽ chuyển sau: cùng lối đặt policy, cùng cách dùng
-- is_teacher().
--
-- Cần 002 (hàm is_teacher) và 003 (profiles). Chạy qua `supabase db push`.

create table if not exists public.tips (
  id          uuid primary key default gen_random_uuid(),
  tag         text not null default 'Grammaire',
  title       text not null,
  body        text not null default '',
  ord         int  not null default 0,      -- thứ tự hiện trong sổ tay
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists tips_ord_idx on public.tips (ord, created_at);

-- ─────────────────────────────── RLS ───────────────────────────────

alter table public.tips enable row level security;

drop policy if exists tips_read      on public.tips;
drop policy if exists tips_write     on public.tips;

-- ĐỌC: mở cho cả khách chưa đăng nhập.
--
-- Cố ý. Mẹo học là nội dung sư phạm, không phải dữ liệu cá nhân — cùng loại
-- với thư viện bài tập mà 002 đã mở cho anon. Đóng lại thì khách mở sổ tay ra
-- thấy trống trơn kèm câu "giáo viên chưa thêm mẹo nào", tức giao diện nói dối
-- về lý do.
create policy tips_read on public.tips
  for select to anon, authenticated
  using (true);

-- GHI: chỉ giáo viên. Dùng lại is_teacher() của 002 — nó đọc app_metadata,
-- chỗ duy nhất người dùng không tự sửa được.
create policy tips_write on public.tips
  for all to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

-- ──────────────── Tự cập nhật updated_at khi sửa ────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists tips_touch on public.tips;
create trigger tips_touch before update on public.tips
  for each row execute function public.touch_updated_at();

-- ──────────────────────── Mẹo khởi tạo ────────────────────────
--
-- Nội dung giống exercices/tips-carnet.json. Nạp sẵn để tính năng có nội dung
-- ngay từ lần deploy đầu — một sổ tay rỗng thì không ai mở lần thứ hai.
--
-- `on conflict do nothing` theo tiêu đề: chạy lại migration không nhân đôi,
-- và mẹo giáo viên đã tự sửa thì không bị ghi đè.

create unique index if not exists tips_title_uniq on public.tips (title);

insert into public.tips (tag, title, body, ord) values
  ('Méthode', 'Connecteurs : dừng lại ở từ đảo chiều',
   E'néanmoins · cependant · toutefois · en revanche · or\nQuan điểm thật của tác giả thường nằm NGAY SAU những từ này. Đề Compréhension écrite hay đặt quan điểm đối lập ở phía trước để bẫy người đọc từng từ.', 10),

  ('Méthode', 'Bốn nhóm connecteurs cần nhận ra ngay',
   E'Bổ sung — de plus, en outre, par ailleurs → đọc lướt, cùng luận điểm.\nĐảo chiều — néanmoins, cependant, or → DỪNG.\nNhân quả — car, puisque, étant donné que → đang giải thích.\nKết luận — ainsi, donc, en somme → câu trả lời ý chính hay ở đây.', 20),

  ('Piège', 'à cause de / grâce à',
   E'grâce à = nguyên nhân TỐT.\nà cause de = nguyên nhân XẤU.\nCả hai đi với DANH TỪ hoặc đại từ nhấn (lui, elle, eux), không đi với mệnh đề có động từ chia.', 30),

  ('Grammaire', 'Co từ bắt buộc',
   E'de + le → du · de + les → des\nà + le → au · à + les → aux\n« à cause de les » không tồn tại. Đây là lỗi bị bắt nhiều nhất trong phần QCM.', 40),

  ('Grammaire', 'parce que → parce qu''',
   E'Élision trước nguyên âm hoặc h câm: parce qu''il, parce qu''une, parce qu''elle.\nBắt buộc cả khi viết lẫn khi nói.', 50),

  ('Grammaire', 'Comme mở đầu, car không bao giờ',
   E'Comme il pleut, je reste. ✓\nJe reste comme il pleut. ✗\nCar thì ngược lại hoàn toàn: luôn nằm giữa câu, sau dấu phẩy.', 60),

  ('Grammaire', 'Sau giới từ dùng đại từ nhấn',
   E'moi · toi · lui · elle · nous · vous · eux · elles\ngrâce à lui ✓ — grâce à il ✗\nĐại từ chủ ngữ (je, tu, il…) không bao giờ đứng sau giới từ.', 70),

  ('Vocabulaire', 'Đoán nghĩa, đừng tra từ',
   E'Trong phòng thi không có từ điển. Tập đoán từ tiền tố, hậu tố và ngữ cảnh câu — nhanh hơn, và đó chính là kỹ năng đề thi đang đo.', 80),

  ('Méthode', 'Nghe phần « annonce », đừng nghe từng từ',
   E'Audio DELF gần như luôn tự công bố cấu trúc ở 15 giây đầu: « Trois points aujourd''hui… », « Nous verrons d''abord… ».\nLượt nghe 1: lấy bộ khung. Lượt nghe 2: lấy chi tiết. Khớp đúng giới hạn 2 lần của kỳ thi.', 90),

  ('Méthode', 'Ngưỡng đỗ: 50/100 VÀ ≥ 5/25 mỗi phần',
   E'Ngưỡng thứ hai mới là thứ đánh trượt người ta. Một kỹ năng chết dưới 5 điểm là trượt cả kỳ thi dù tổng điểm cao.\nĐừng dồn hết thời gian ôn phần mình vốn đã giỏi.', 100)
on conflict (title) do nothing;

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
--
--   select count(*) from public.tips;                    -- phải >= 10
--   select tag, count(*) from public.tips group by tag;  -- 4 nhãn
