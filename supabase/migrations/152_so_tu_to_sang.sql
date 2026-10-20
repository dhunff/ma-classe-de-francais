-- 152 · Tô sáng trong bài luyện tập (20/10, theo chủ dự án).
-- Dùng chung bảng so_tu (151): loai = 'tu' là từ ghi vào sổ, 'to' là đoạn tô
-- sáng. Đoạn tô sáng có thể là cả câu nên nới độ dài lên 300 ký tự.
alter table public.so_tu
  add column if not exists loai text not null default 'tu' check (loai in ('tu', 'to')),
  drop constraint if exists so_tu_tu_check,
  add constraint so_tu_tu_check check (char_length(btrim(tu)) between 1 and 300);
