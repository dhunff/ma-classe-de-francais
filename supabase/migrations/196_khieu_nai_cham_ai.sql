-- 196 · Khiếu nại điểm AI chấm bài viết (06/11, giai đoạn 2 chấm AI chuyên sâu).
--
-- Học sinh bấm « Tôi thấy điểm này chưa đúng » dưới một phiếu AI chấm (pe_ai_goi_y). Giáo viên
-- xem lại ở /professeur/khieu-nai-diem rồi chọn:
--   · giu_nguyen   : điểm AI đúng;
--   · da_cham_lai  : giáo viên chấm lại từng tiêu chí. Nếu phiếu là điểm THI THỬ (attempts.mode =
--                    'exam', answers.score đã có), điểm giáo viên THAY điểm AI ở answers.score.
-- Cả hai đều là dữ liệu có nhãn người chấm: scripts/check-chamai.mjs đọc chúng để đo AI lệch bao
-- nhiêu so với giáo viên (bộ hiệu chỉnh).
--
-- Không ai ghi thẳng vào bảng: mọi thay đổi đi qua RPC security definer bên dưới.

create table if not exists public.pe_khieu_nai (
  id          bigserial primary key,
  goi_y_id    uuid not null unique references public.pe_ai_goi_y(id) on delete cascade,
  answer_id   uuid not null references public.answers(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  ly_do       text not null check (char_length(ly_do) between 5 and 1000),
  tieu_chi    text[] not null default '{}',
  trang_thai  text not null default 'cho' check (trang_thai in ('cho', 'giu_nguyen', 'da_cham_lai')),
  -- Giáo viên chấm lại: { id_tieu_chi: điểm }, tổng, và thang lúc chấm (id, tên, max, bước) để
  -- bộ hiệu chỉnh không phải đoán thang của một bài cũ.
  diem_gv     jsonb,
  tong_gv     numeric,
  thang       jsonb,
  ghi_chu_gv  text not null default '' check (char_length(ghi_chu_gv) <= 1000),
  tao_luc     timestamptz not null default now(),
  xu_ly_luc   timestamptz,
  xu_ly_boi   uuid references auth.users(id) on delete set null
);
create index if not exists pe_khieu_nai_trang_thai on public.pe_khieu_nai (trang_thai, tao_luc desc);
create index if not exists pe_khieu_nai_user on public.pe_khieu_nai (user_id, tao_luc desc);

alter table public.pe_khieu_nai enable row level security;
drop policy if exists pe_khieu_nai_doc on public.pe_khieu_nai;
create policy pe_khieu_nai_doc on public.pe_khieu_nai for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
revoke all on public.pe_khieu_nai from anon;
revoke insert, update, delete on public.pe_khieu_nai from authenticated;
grant select on public.pe_khieu_nai to authenticated;

-- ── doc_goi_y_ai: trả thêm `id` của phiếu để giao diện gửi khiếu nại theo phiếu ──
create or replace function public.doc_goi_y_ai(p_answer uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := (select auth.uid()); r record;
begin
  if me is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  select g.id, g.ket_qua, g.model, g.created_at into r
    from public.pe_ai_goi_y g
   where g.answer_id = p_answer and g.user_id = me
   order by g.created_at desc
   limit 1;

  if not found then
    return jsonb_build_object('co', false);
  end if;

  return jsonb_build_object(
    'co', true,
    'id', r.id,
    'ket_qua', r.ket_qua,
    'model', r.model,
    'luc', r.created_at
  );
end $$;
revoke all on function public.doc_goi_y_ai(uuid) from public, anon;
grant execute on function public.doc_goi_y_ai(uuid) to authenticated;

-- ── Học sinh gửi khiếu nại ──
-- Một phiếu một khiếu nại (unique goi_y_id): gửi lại thì trả khiếu nại đã có. Tối đa 5 khiếu nại
-- mỗi 24 giờ, đủ cho người học thật, chặn người bấm cho vui làm ngập hàng đợi giáo viên.
create or replace function public.gui_khieu_nai(p_goi_y uuid, p_ly_do text, p_tieu_chi text[] default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); g record; v_id bigint;
begin
  if v_uid is null then raise exception 'CHUA_DANG_NHAP' using errcode = '42501'; end if;
  if coalesce(char_length(trim(p_ly_do)), 0) not between 5 and 1000
     or coalesce(array_length(p_tieu_chi, 1), 0) > 15 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  select id, answer_id, user_id into g from public.pe_ai_goi_y where id = p_goi_y;
  if not found or g.user_id <> v_uid then raise exception 'KHONG_THAY_PHIEU' using errcode = '42501'; end if;

  select id into v_id from public.pe_khieu_nai where goi_y_id = p_goi_y;
  if found then return jsonb_build_object('ok', true, 'id', v_id, 'da_co', true); end if;

  if (select count(*) from public.pe_khieu_nai where user_id = v_uid and tao_luc > now() - interval '24 hours') >= 5 then
    raise exception 'HET_LUOT_KHIEU_NAI' using errcode = 'P0001';
  end if;

  insert into public.pe_khieu_nai (goi_y_id, answer_id, user_id, ly_do, tieu_chi)
  values (p_goi_y, g.answer_id, v_uid, trim(p_ly_do), coalesce(p_tieu_chi, '{}'))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id, 'da_co', false);
end $$;
revoke all on function public.gui_khieu_nai(uuid, text, text[]) from public, anon;
grant execute on function public.gui_khieu_nai(uuid, text, text[]) to authenticated;

-- ── Giáo viên: danh sách khiếu nại kèm bài, đề, phiếu AI ──
-- pe_ai_goi_y chỉ cho chủ phiếu đọc, nên giáo viên đọc qua hàm này (kiểm is_teacher bên trong).
create or replace function public.ds_khieu_nai(p_trang_thai text default null)
returns table (
  id bigint, trang_thai text, ly_do text, tieu_chi text[], tao_luc timestamptz,
  diem_gv jsonb, tong_gv numeric, ghi_chu_gv text, xu_ly_luc timestamptz,
  ket_qua jsonb, model text, raw jsonb, prompt text, consigne text, level text, tieu_de text,
  che_do text, hoc_sinh text
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  return query
  select k.id, k.trang_thai, k.ly_do, k.tieu_chi, k.tao_luc,
         k.diem_gv, k.tong_gv, k.ghi_chu_gv, k.xu_ly_luc,
         g.ket_qua, g.model, to_jsonb(a.raw), q.prompt, e.consigne, e.level, e.title,
         t.mode, coalesce(nullif(p.display_name, ''), nullif(p.name, ''), p.email)
    from public.pe_khieu_nai k
    join public.pe_ai_goi_y g on g.id = k.goi_y_id
    join public.answers a on a.id = k.answer_id
    join public.attempts t on t.id = a.attempt_id
    join public.questions q on q.id = a.question_id
    left join public.exercises e on e.id = q.exercise_id
    left join public.profiles p on p.id = k.user_id
   where p_trang_thai is null or k.trang_thai = p_trang_thai
   order by (k.trang_thai = 'cho') desc, k.tao_luc desc
   limit 300;
end $$;
revoke all on function public.ds_khieu_nai(text) from public, anon;
grant execute on function public.ds_khieu_nai(text) to authenticated;

-- ── Giáo viên xử lý ──
-- giu_nguyen: không đổi điểm nào. da_cham_lai: p_diem = { id: điểm } theo p_thang
-- ([{ id, max_score, step, ... }]); mỗi điểm phải nằm trong 0..max. Bài thi thử thì điểm giáo viên
-- thay answers.score (graded_by = giáo viên), lời nhận xét AI giữ lại phía dưới.
create or replace function public.xu_ly_khieu_nai(
  p_id bigint, p_trang_thai text, p_diem jsonb default null, p_thang jsonb default null, p_ghi_chu text default ''
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare k record; c jsonb; v_tong numeric := 0; v_d numeric; v_n int := 0; v_ghi_diem boolean := false;
begin
  if not public.is_teacher() then raise exception 'CHI_GIAO_VIEN' using errcode = '42501'; end if;
  if p_trang_thai not in ('cho', 'giu_nguyen', 'da_cham_lai') or char_length(coalesce(p_ghi_chu, '')) > 1000 then
    raise exception 'SAI_DU_LIEU' using errcode = '22023';
  end if;
  select * into k from public.pe_khieu_nai where id = p_id for update;
  if not found then raise exception 'KHONG_THAY' using errcode = 'P0002'; end if;

  if p_trang_thai = 'da_cham_lai' then
    if p_diem is null or jsonb_typeof(p_diem) <> 'object' or p_thang is null or jsonb_typeof(p_thang) <> 'array'
       or jsonb_array_length(p_thang) = 0 then
      raise exception 'THIEU_DIEM' using errcode = '22023';
    end if;
    for c in select * from jsonb_array_elements(p_thang) loop
      if not (p_diem ? (c->>'id')) then raise exception 'THIEU_DIEM' using errcode = '22023'; end if;
      v_d := (p_diem->>(c->>'id'))::numeric;
      if v_d < 0 or v_d > (c->>'max_score')::numeric then raise exception 'DIEM_NGOAI_KHUNG' using errcode = '22023'; end if;
      v_tong := v_tong + v_d;
    end loop;
  end if;

  update public.pe_khieu_nai set
    trang_thai = p_trang_thai,
    diem_gv    = case when p_trang_thai = 'da_cham_lai' then p_diem end,
    tong_gv    = case when p_trang_thai = 'da_cham_lai' then v_tong end,
    thang      = case when p_trang_thai = 'da_cham_lai' then p_thang end,
    ghi_chu_gv = coalesce(p_ghi_chu, ''),
    xu_ly_luc  = case when p_trang_thai = 'cho' then null else now() end,
    xu_ly_boi  = case when p_trang_thai = 'cho' then null else auth.uid() end
  where id = p_id;

  if p_trang_thai = 'da_cham_lai' then
    update public.answers a set
      score = v_tong,
      graded_by = auth.uid(),
      graded_at = now(),
      feedback = left('GIÁO VIÊN CHẤM LẠI SAU KHIẾU NẠI: ' || v_tong || ' điểm.'
        || case when coalesce(p_ghi_chu, '') <> '' then E'\n' || p_ghi_chu else '' end
        || E'\n\n' || coalesce(a.feedback, ''), 6000)
    from public.attempts t
    where a.id = k.answer_id and t.id = a.attempt_id and t.mode = 'exam' and a.score is not null;
    get diagnostics v_n = row_count;
    v_ghi_diem := v_n > 0;
  end if;

  return jsonb_build_object('ok', true, 'tong', case when p_trang_thai = 'da_cham_lai' then v_tong end, 'da_ghi_diem_thi', v_ghi_diem);
end $$;
revoke all on function public.xu_ly_khieu_nai(bigint, text, jsonb, jsonb, text) from public, anon;
grant execute on function public.xu_ly_khieu_nai(bigint, text, jsonb, jsonb, text) to authenticated;
