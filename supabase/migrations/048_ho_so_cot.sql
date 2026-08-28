-- 048 — hồ sơ mở rộng thành CỘT trên public.profiles
--
-- CHỈ TẠO CẤU TRÚC. Chép dữ liệu ở 049, hàm ghi và quyền ở 050, siết policy
-- kv_store ở 051. Chạy đúng thứ tự đó.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO
-- ══════════════════════════════════════════════════════════════════════════
--
-- Địa chỉ, số điện thoại, ngày sinh, trường học của TOÀN BỘ học sinh đang nằm
-- trong MỘT ô JSON: `kv_store` khoá `s:mcf-profiles`, một object khoá theo TÊN
-- người dùng. Policy của 002 biến chuyện đó thành hai lỗ hổng:
--
--   ĐỌC   `kv_auth_read` cho MỌI người đã đăng nhập đọc mọi khoá `s:%` trừ
--         `s:mcf-teacher-notes`. Một học sinh mở DevTools gõ một lời gọi
--         supabase-js là có địa chỉ nhà và số điện thoại của cả lớp.
--
--   GHI   `kv_student_insert` / `kv_student_update` liệt kê `s:mcf-profiles`
--         trong danh sách khoá học sinh được ghi. Ghi kv là ghi đè CẢ object,
--         nên một học sinh xoá hoặc sửa được hồ sơ của mọi người khác — và
--         phía nạn nhân không có gì để lần ra.
--
-- RLS không cứu được cái blob: nó phân quyền theo DÒNG, mà cả lớp chung một
-- dòng. Muốn "mỗi người chỉ thấy hồ sơ của mình" thì mỗi người phải là một
-- dòng — tức là cột trên `profiles`, khoá theo `auth.uid()`, nơi RLS của 003
-- đã sẵn đúng hình dạng cần.
--
-- Khoá theo TÊN còn một cái sai độc lập với bảo mật: đổi tên là mất hồ sơ, và
-- hai người trùng tên thì ghi đè lên nhau. `auth.uid()` không đổi, không trùng.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO FILE NÀY CHỈ CÓ DDL
-- ══════════════════════════════════════════════════════════════════════════
--
-- SQL Editor chạy NGUYÊN FILE trong MỘT transaction, nên một `raise exception`
-- ở khối tự kiểm cuối file cuộn ngược luôn `alter table` ở đầu file — và
-- trạng thái sau khi cuộn ngược không phân biệt được với "chưa chạy bao giờ".
-- Dự án đã dính hai lần (035, và bản đầu của 046). Khuôn 046/047 tách ra, và
-- 048–051 giữ đúng khuôn đó.
--
-- Chạy lại được: `if not exists` cho cột, `drop ... if exists` trước mỗi
-- `add constraint`.

-- ══════════════════════════════════════════════════════════════════════════
-- CỘT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Tên cột giữ NGUYÊN tên khoá trong blob (`genre`, `prenom`, `nom`, …). Đổi
-- tên lúc chuyển kho là gộp hai thay đổi vào một bước: khi số liệu đối chiếu
-- lệch, không biết là chép sót hay ánh xạ sai tên. Tên tiếng Pháp lẫn tiếng
-- Anh trông không đều, nhưng chúng khớp từng chữ với `PROFILE_FIELDS` trong
-- src/shared/profile.js, và `check:identity` so hai bên.
--
-- Tất cả đều `null` được. Hồ sơ trống là trạng thái bình thường — mọi người
-- dùng hiện có đều bắt đầu từ đó.
--
-- `dob` là `date`, không phải `text`. Blob giữ chuỗi "YYYY-MM-DD" vì JSON
-- không có kiểu ngày; database thì có, và một cột `date` là chỗ duy nhất
-- "31/02" bị chặn thay vì được lưu rồi hiện ra thành `Invalid Date`.

alter table public.profiles
  add column if not exists genre   text,
  add column if not exists prenom  text,
  add column if not exists nom     text,
  add column if not exists adresse text,
  add column if not exists phone   text,
  add column if not exists dob     date,
  add column if not exists level   text,
  add column if not exists goal    text,
  add column if not exists school  text;

-- ══════════════════════════════════════════════════════════════════════════
-- RÀNG BUỘC
-- ══════════════════════════════════════════════════════════════════════════
--
-- Mọi ràng buộc đều cho `null` qua. Bắt buộc: 049 chép dữ liệu cũ vào, và dữ
-- liệu cũ chưa từng bị kiểm gì cả — một ràng buộc `not null` ở đây nghĩa là
-- không chép được người nào chưa điền, tức là gần như tất cả.
--
-- ── Vì sao lặp lại luật của client vào đây ──
--
-- `validateProfile()` trong src/shared/profile.js đã kiểm ngần này rồi. Nhưng
-- client là thứ người dùng chạy, còn RPC ở 050 nhận thẳng tham số — ai gọi
-- `supabase.rpc()` từ DevTools là đi vòng qua toàn bộ biểu mẫu. Ràng buộc ở
-- database là lớp duy nhất không bỏ qua được.
--
-- Đánh đổi đã biết: hai chỗ phải sửa cùng nhau khi luật đổi. `check:identity`
-- so danh sách trình độ và mục tiêu giữa JS và SQL, đỏ nếu lệch.

-- Giới tính: giá trị lưu xuống KHÔNG dịch — đó là dữ liệu, đổi theo ngôn ngữ
-- đang chọn thì hồ sơ cũ đọc bằng thứ tiếng khác sẽ không khớp.
alter table public.profiles
  drop constraint if exists profiles_genre_dang,
  add  constraint profiles_genre_dang
    check (genre is null or genre in ('homme', 'femme', 'autre'));

-- Điện thoại: khớp từng ký tự với regex trong `validateProfile`. Cố ý lỏng —
-- số quốc tế, dấu cách, dấu chấm, ngoặc đều là cách người ta thật sự gõ.
alter table public.profiles
  drop constraint if exists profiles_phone_dang,
  add  constraint profiles_phone_dang
    check (phone is null or phone ~ '^[+]?[0-9 .()-]{8,20}$');

-- Ngày sinh: chỉ chặn thứ vô nghĩa. KHÔNG viết được `dob <= current_date` —
-- Postgres đòi biểu thức trong `check` phải IMMUTABLE, mà "hôm nay" thì không.
-- Ngày trong tương lai vẫn do `validateProfile` chặn ở client; ở đây chấp nhận
-- rằng đó là lỗ hở, và nó chỉ làm hỏng hồ sơ của chính người tự gõ vào.
alter table public.profiles
  drop constraint if exists profiles_dob_khoang,
  add  constraint profiles_dob_khoang
    check (dob is null or dob between date '1900-01-01' and date '2200-01-01');

-- Trình độ và mục tiêu: danh sách đóng. Phải khớp LEVELS_PROFILE và
-- GOALS_PROFILE trong src/shared/profile.js — `check:identity` so hai bên.
alter table public.profiles
  drop constraint if exists profiles_level_dang,
  add  constraint profiles_level_dang
    check (level is null or level in (
      'Débutant', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

alter table public.profiles
  drop constraint if exists profiles_goal_dang,
  add  constraint profiles_goal_dang
    check (goal is null or goal in (
      'DELF A1', 'DELF A2', 'DELF B1', 'DELF B2', 'DALF C1', 'DALF C2',
      'Étudier en France', 'Travailler en français',
      'Communication quotidienne', 'Voyage', 'Plaisir personnel'));

-- Ba ô chữ tự do: chỉ chặn độ dài. `school` 120 khớp với `validateProfile`;
-- hai ô kia chưa từng có giới hạn ở client, nên đặt mức rộng rãi — mục đích là
-- chặn ai đó nhét cả megabyte vào một cột, không phải phán xét tên người.
alter table public.profiles
  drop constraint if exists profiles_school_dai,
  add  constraint profiles_school_dai
    check (school is null or char_length(school) <= 120);

alter table public.profiles
  drop constraint if exists profiles_ten_that_dai,
  add  constraint profiles_ten_that_dai
    check ((prenom is null or char_length(prenom) <= 80)
       and (nom    is null or char_length(nom)    <= 80));

alter table public.profiles
  drop constraint if exists profiles_adresse_dai,
  add  constraint profiles_adresse_dai
    check (adresse is null or char_length(adresse) <= 200);

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA SAU KHI CHẠY 048
-- ══════════════════════════════════════════════════════════════════════════
--
-- Câu SELECT, KHÔNG phải khối `do` có `raise exception`: một phép kiểm biết
-- ném lỗi nằm chung transaction với DDL sẽ cuộn ngược chính cái DDL nó vừa
-- kiểm. Đọc hai con số.
--
-- Rồi đo lại từ NGOÀI database: `npm run check:db` phải chuyển ca
-- "048: chín cột hồ sơ mở rộng có mặt" sang xanh. Lệnh chạy xong không bao giờ
-- là bằng chứng dữ liệu đã đổi.

select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name in ('genre', 'prenom', 'nom', 'adresse', 'phone',
                          'dob', 'level', 'goal', 'school'))            as cot_moi,    -- phải là 9
  (select count(*) from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname in ('profiles_genre_dang', 'profiles_phone_dang',
                      'profiles_dob_khoang', 'profiles_level_dang',
                      'profiles_goal_dang', 'profiles_school_dai',
                      'profiles_ten_that_dai', 'profiles_adresse_dai')) as rang_buoc;  -- phải là 8
