-- 178 · BỎ DÒNG « voix de synthèse » KHỎI ĐỀ BÀI (01/11, theo chủ dự án).
--
-- Trước đây (02/10) đề bài nghe ghi rõ audio là giọng tổng hợp. Chủ dự án quyết định bỏ
-- dòng đó khỏi đề bài; trang pháp lý vẫn nói audio luyện nghe là giọng tổng hợp.
-- Đo trước khi viết: 29 bài, đều kho practice, đều đúng một mẫu câu.
--
-- Giữ bản cũ ở bảng khoá kín để phục hồi được:
--   update public.exercises e set consigne = s.consigne
--   from public._sao_luu_consigne_0111 s where s.id = e.id;

create table if not exists public._sao_luu_consigne_0111 as
  select id, consigne from public.exercises where consigne ilike '%voix de synthèse%';
alter table public._sao_luu_consigne_0111 enable row level security;
revoke all on table public._sao_luu_consigne_0111 from public, anon, authenticated;

update public.exercises
set consigne = regexp_replace(consigne, '<p>\s*<em>\s*Enregistrement réalisé avec une voix de synthèse[^<]*</em>\s*</p>', '', 'g')
where consigne ilike '%voix de synthèse%';

do $$
declare con int;
begin
  select count(*) into con from public.exercises where consigne ilike '%voix de synthèse%';
  if con > 0 then raise exception 'còn % bài chưa bỏ được dòng giọng tổng hợp', con; end if;
end $$;
