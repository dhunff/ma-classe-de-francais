# Báo cáo gửi Supabase — cột mới không bao giờ hiện ra

Dán phần tiếng Anh bên dưới vào ticket. Phần tiếng Việt là ghi chú cho mình.

---

## Ghi chú cho mình

Ngày 28–29/08/2026. Project `cdszvnuaibnnkrvynyck`.

Triệu chứng: thêm ba cột vào `public.profiles` bằng **cả hai** đường — SQL
Editor (`alter table`) và Table Editor (+ New column) — và PostgREST không bao
giờ thấy chúng. Đã restart project. Đã `notify pgrst, 'reload schema'` ba lần.

Điều lạ nhất, và là lý do phải nhờ Supabase: **`pg_attribute` cho hai câu trả
lời khác nhau ở hai lần đọc cách nhau vài phút**, trong cùng SQL Editor, cùng
project. Một lần đếm ra 3 cột, lần sau liệt kê chỉ còn 7 cột cũ. Không có lệnh
`drop column` nào được chạy.

Những gì đã loại trừ, kèm cách đo:

| Giả thuyết | Cách đo | Kết quả |
|---|---|---|
| Sai project | so project ref trong Data API với `VITE_SUPABASE_URL` | **giống nhau** |
| Đang ở nhánh | xem `?branch=` trên thanh địa chỉ | không có |
| Migration bị cuộn ngược | tách DDL ra file riêng, chạy một mình, không lỗi | vẫn không có cột |
| Thiếu quyền đọc cột | `attacl` của cả 7 cột = NULL → quyền ở mức bảng | không phải |
| Bộ nhớ đệm lược đồ cũ | `notify` ×3, rồi Restart project | không đổi |
| Đường SQL hỏng | thêm cột bằng Table Editor | không đổi |

Không dùng số liệu dữ liệu để nhận biết database nữa — bốn bảng khớp số tuyệt
đối mà vẫn không chứng minh được gì (bản sao gần đây thì trùng hết).

---

## Ticket (tiếng Anh)

**Subject:** New columns never appear in PostgREST schema; `pg_attribute`
returns inconsistent results across runs

**Project ref:** `cdszvnuaibnnkrvynyck`
**Region / plan:** (điền)
**When:** 28–29 Aug 2026

### What I did

Added three nullable `text` columns to `public.profiles`:

```sql
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists username     text,
  add column if not exists avatar       text;
```

The statement completed with no error. I also added the same columns through
the **Table Editor** UI ("+ New column"), which likewise reported success.

### What happens

The REST API never sees the columns, on both the read and the write path:

```
GET  /rest/v1/profiles?select=display_name&limit=1
  {"code":"42703","details":null,"hint":null,
   "message":"column profiles.display_name does not exist"}

PATCH /rest/v1/profiles?id=eq.00000000-0000-0000-0000-000000000000
      {"display_name":"x"}
  {"code":"PGRST204","details":null,"hint":null,
   "message":"Could not find the 'display_name' column of 'profiles'
              in the schema cache"}
```

Pre-existing columns (`id`, `email`, `name`, `role`, `class_id`, `created_at`,
`has_premium_access`) work normally on both paths.

### The part I cannot explain

Two reads of `pg_attribute`, minutes apart, in the same SQL Editor and the same
project, disagree. No `drop column` was ever run between them.

Read A — returned 3:

```sql
select count(*) as con_lai from pg_attribute
where attrelid = 'public.profiles'::regclass
  and attname in ('display_name','username','avatar')
  and not attisdropped;
```

Read B — returned only the 7 original columns:

```sql
select a.attname, a.attacl,
       has_column_privilege('anon',          a.attrelid, a.attname, 'select') as anon,
       has_column_privilege('authenticated', a.attrelid, a.attname, 'select') as auth
from pg_attribute a
where a.attrelid = 'public.profiles'::regclass
  and a.attnum > 0 and not a.attisdropped
order by a.attnum;
```

### What I already ruled out

- **Wrong project.** The project ref shown in Settings → Data API → Project URL
  matches the URL the application uses.
- **Branch.** No `?branch=` parameter in the dashboard URL.
- **Rolled-back migration.** The DDL was isolated into its own file and run
  alone, with no error reported, and verified in a *separate* execution.
- **Column-level privileges.** `attacl` is NULL for all seven existing columns,
  so grants are table-level and new columns inherit them.
- **Stale schema cache.** `notify pgrst, 'reload schema';` three times, then a
  full **Restart project**. No change.
- **SQL path specifically.** Adding the columns via the Table Editor UI produced
  the same outcome.

`select … from pg_stat_activity where usename = 'authenticator'` returns no
rows, but I understand `postgres` is not a superuser here so this may simply be
a visibility restriction rather than evidence.

### Additionally

- The **Table Editor UI lists all three columns** on `public.profiles`. So the
  dashboard sees them; only PostgREST does not.
- The anon API key is a JWT whose `ref` claim is `cdszvnuaibnnkrvynyck`, which
  matches the host in the Project URL. Key and endpoint belong to the same
  project.

### Question

Is the SQL Editor / Table Editor for this project writing to a different
instance from the one PostgREST reads, or is DDL on this project being
rolled back or discarded after reporting success?
