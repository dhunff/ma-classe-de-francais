-- 163 · Giáo viên xem MỌI hoạt động tính vào chuỗi ngày học của một học sinh (25/10).
-- Nguồn giống 153: bài tập / thi thử (attempts), Nghe & Nói (cau_luyen_ket_qua), Thách
-- đấu, Lộ trình, Học ngữ pháp, ôn ngữ pháp sai, Bài luyện của tôi (on_tap_luot), Flashcard.
--
-- Flashcard: bảng reviews không có mốc thời gian, nên trước đây không biết em ôn lúc
-- nào. Thêm cột on_luc, trigger đặt now() mỗi lần chấm thẻ (update). Dữ liệu CŨ không có
-- giờ: chỉ thấy được qua ngày học (ngay_hoc), không bịa ra từng lượt.

alter table public.reviews add column if not exists on_luc timestamptz;
create or replace function public._trg_reviews_on_luc()
returns trigger language plpgsql as $$ begin new.on_luc := now(); return new; end $$;
drop trigger if exists on_luc on public.reviews;
create trigger on_luc before update on public.reviews for each row
  when (old.due_at is distinct from new.due_at or old.reps is distinct from new.reps or old.lapses is distinct from new.lapses)
  execute function public._trg_reviews_on_luc();

create or replace function public.hoat_dong_hoc_sinh(p_uid uuid, p_ngay int default 30)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare tu timestamptz := now() - make_interval(days => least(greatest(p_ngay, 1), 90));
begin
  if not public.is_teacher() then raise exception 'KHONG_PHAI_GIAO_VIEN' using errcode = '42501'; end if;
  return jsonb_build_object(
    'ngay', coalesce((select jsonb_agg(d order by d desc) from (
        select distinct (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date d from attempts a
         where a.user_id = p_uid and a.finished_at >= tu
        union select h.ngay from ngay_hoc h where h.user_id = p_uid and h.ngay >= (tu at time zone 'Asia/Ho_Chi_Minh')::date) s), '[]'::jsonb),
    'su_kien', coalesce((select jsonb_agg(e order by e->>'luc' desc) from (
      -- Bài tập và thi thử
      select jsonb_build_object('loai', case when a.mode = 'exam' then 'thi' else 'bai' end, 'luc', a.finished_at,
        'ten', coalesce(ex.title || ' · ', '') || x.title, 'kq', a.score || '/' || a.max) e
        from attempts a join exercises x on x.id = a.exercise_id left join exams ex on ex.id = a.exam_id
       where a.user_id = p_uid and a.finished_at >= tu
      union all  -- Nghe & Nói
      select jsonb_build_object('loai', 'nghe_noi', 'luc', k.created_at, 'ten', coalesce(c.cau, ''), 'kieu', k.kieu,
        'kq', round(coalesce(k.diem, 0) * 100) || '%')
        from cau_luyen_ket_qua k left join cau_luyen c on c.id = k.cau_id
       where k.user_id = p_uid and k.created_at >= tu
      union all  -- Thách đấu (người thách)
      select jsonb_build_object('loai', 'thach_dau', 'luc', t.a_xong, 'ten', coalesce(t.chu_de, 'Thách đấu'), 'kq', coalesce(t.a_dung, 0) || ' đúng')
        from thach_dau t where t.nguoi_thach = p_uid and t.a_xong >= tu
      union all  -- Thách đấu (người được thách)
      select jsonb_build_object('loai', 'thach_dau', 'luc', t.b_xong, 'ten', coalesce(t.chu_de, 'Thách đấu'), 'kq', coalesce(t.b_dung, 0) || ' đúng')
        from thach_dau t where t.doi_thu = p_uid and t.b_xong >= tu
      union all  -- Lộ trình (lần chơi gần nhất của mỗi màn)
      select jsonb_build_object('loai', 'lo_trinh', 'luc', k.cap_nhat,
        'ten', coalesce(m.ten, case when k.ma_man like 'trum:%' then 'Thử thách cuối chương' else k.ma_man end),
        'kq', k.sao || '★ · ' || k.lan_choi || ' lần')
        from lo_trinh_ket_qua k left join lo_trinh_man m on k.ma_man = 'man:' || m.id
       where k.user_id = p_uid and k.cap_nhat >= tu
      union all  -- Học ngữ pháp (lần làm gần nhất của mỗi bài)
      select jsonb_build_object('loai', 'ngu_phap', 'luc', b.cap_nhat, 'ten', b.ma_bai, 'kq', b.diem || '/' || b.tong)
        from bai_hoc_ket_qua b where b.user_id = p_uid and b.cap_nhat >= tu
      union all  -- Bài luyện của tôi: gộp theo ngày
      select jsonb_build_object('loai', 'bai_luyen', 'luc', max(o.luc), 'ten', 'Bài luyện của tôi',
        'kq', count(*) filter (where o.correct) || '/' || count(*) || ' câu đúng')
        from on_tap_luot o where o.user_id = p_uid and o.luc >= tu
       group by (o.luc at time zone 'Asia/Ho_Chi_Minh')::date
      union all  -- Flashcard: gộp theo ngày (chỉ từ khi có cột on_luc)
      select jsonb_build_object('loai', 'flashcard', 'luc', max(r.on_luc), 'ten', 'Ôn Flashcard', 'kq', count(*) || ' thẻ')
        from reviews r where r.user_id = p_uid and r.on_luc >= tu
       group by (r.on_luc at time zone 'Asia/Ho_Chi_Minh')::date
    ) s), '[]'::jsonb));
end $$;
revoke execute on function public.hoat_dong_hoc_sinh(uuid, int) from public, anon;
grant execute on function public.hoat_dong_hoc_sinh(uuid, int) to authenticated;
