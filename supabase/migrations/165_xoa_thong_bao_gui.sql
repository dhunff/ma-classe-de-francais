-- 165 · Giáo viên xoá một thông báo đã gửi (25/10, theo chủ dự án). Một lần gửi = các dòng
-- announcement cùng created_at + cùng nội dung. Xoá là THU HỒI: học sinh không còn thấy
-- trong chuông. Không có policy DELETE cho trình duyệt; đường duy nhất là RPC này, trả số
-- dòng đã xoá để giao diện đối chiếu.
create or replace function public.xoa_thong_bao_gui(p_luc timestamptz, p_noi_dung text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_teacher() then raise exception 'KHONG_PHAI_GIAO_VIEN' using errcode = '42501'; end if;
  delete from notifications where type = 'announcement' and created_at = p_luc and message = p_noi_dung;
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.xoa_thong_bao_gui(timestamptz, text) from public, anon;
grant execute on function public.xoa_thong_bao_gui(timestamptz, text) to authenticated;
