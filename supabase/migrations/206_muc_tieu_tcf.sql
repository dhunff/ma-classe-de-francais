-- 206 (14/11, chủ dự án): thêm mục tiêu « TCF Canada » và « TCF tout public » vào hồ sơ.
-- Danh sách đóng phải khớp GOALS_PROFILE trong src/shared/profile.js (check:identity đọc ràng
-- buộc MỚI NHẤT trong các migration và so hai bên). Một câu lệnh, chỉ nới (không bỏ giá trị cũ).
alter table public.profiles
  drop constraint if exists profiles_goal_dang,
  add  constraint profiles_goal_dang
    check (goal is null or goal in (
      'DELF A1', 'DELF A2', 'DELF B1', 'DELF B2', 'DALF C1', 'DALF C2', 'TCF Canada', 'TCF tout public',
      'Étudier en France', 'Travailler en français',
      'Communication quotidienne', 'Voyage', 'Plaisir personnel'));
