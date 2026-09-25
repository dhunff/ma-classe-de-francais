-- ═══════════════════════════════════════════════════════════════════════════
-- TÌM KIẾM CHUNG — ô « Tìm bài tập, học sinh… » ở thanh trên
-- ═══════════════════════════════════════════════════════════════════════════
--
-- SECURITY INVOKER: hàm chạy bằng quyền của NGƯỜI GỌI, nên RLS của
-- `exercises` và `profiles` áp nguyên vẹn — hàm không mở thêm cửa nào.
--   · profiles: học sinh chỉ đọc được dòng của CHÍNH MÌNH (profiles_read_self),
--     giáo viên đọc hết (profiles_read_teacher).
--   · exercises: ai cũng đọc được (exercises_read = true).
--
-- Nhóm « students » CHỈ trả khi người gọi là giáo viên. Với học sinh, RLS đã
-- chỉ để lọt dòng của chính họ — trả về "bạn tìm thấy chính mình" là vô nghĩa,
-- nên chặn hẳn bằng is_teacher() cho kết quả gọn.
--
-- Bài tập: chỉ kho luyện tập (`store = 'practice'`). Kho bài giao
-- (`assignment`) là bài giao riêng cho từng học sinh/lớp; RLS vẫn cho đọc tiêu
-- đề, nhưng đưa bài của lớp khác vào ô tìm kiếm của một học sinh là rối.
-- Giáo viên thấy cả hai kho.
--
-- Ký tự % và _ trong từ khoá được thoát, để gõ "50%" không khớp với mọi thứ.

create or replace function public.global_search(search_term text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  tu    text := btrim(coalesce(search_term, ''));
  mau   text;
  gv    boolean := public.is_teacher();
  bai   jsonb;
  hs    jsonb := '[]'::jsonb;
begin
  if char_length(tu) < 2 then
    return jsonb_build_object('exercises', '[]'::jsonb, 'students', '[]'::jsonb);
  end if;
  tu  := left(tu, 60);
  mau := '%' || replace(replace(replace(tu, '\', '\\'), '%', '\%'), '_', '\_') || '%';

  select coalesce(jsonb_agg(x order by x->>'title'), '[]'::jsonb) into bai
    from (
      select jsonb_build_object('id', e.id, 'title', e.title, 'level', e.level,
                                'store', e.store, 'type', 'exercise') as x
        from public.exercises e
       where (e.title ilike mau or coalesce(e.consigne, '') ilike mau)
         and (gv or e.store = 'practice')
       order by e.title
       limit 8
    ) t;

  if gv then
    select coalesce(jsonb_agg(x), '[]'::jsonb) into hs
      from (
        select jsonb_build_object('id', p.id,
                                  'name', coalesce(nullif(p.display_name, ''), p.name, p.email),
                                  'email', p.email, 'type', 'student') as x
          from public.profiles p
         where (p.name ilike mau or p.email ilike mau
                or coalesce(p.display_name, '') ilike mau or coalesce(p.username, '') ilike mau)
           and coalesce(p.role, '') <> 'prof'
         order by p.name
         limit 8
      ) t;
  end if;

  return jsonb_build_object('exercises', bai, 'students', hs);
end $$;

revoke all on function public.global_search(text) from public, anon;
grant execute on function public.global_search(text) to authenticated;
