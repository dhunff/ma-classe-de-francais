-- 164 · Giáo viên sắp xếp thứ tự đề thi thử (25/10). Thứ tự trong từng trình độ; giá trị
-- ban đầu giữ đúng thứ tự đang hiện (mới tạo trước).
alter table public.exams add column if not exists ord int not null default 0;
update public.exams e set ord = s.n from (
  select id, row_number() over (partition by level order by created_at desc) n from public.exams) s
where s.id = e.id;
