# DATABASE_ACCESS Fix Plan

## Changes

- `supabase/migrations/144_siet_kv_store.sql`: anon chỉ đọc s:mcf-folders, s:mcf-custom-cats; học sinh không đọc blob đáp án / PIN / ghi chú giáo viên; khoá p:… chỉ chủ (đuôi khoá = profiles.name, học sinh không tự sửa được cột này) và giáo viên.
- `supabase/migrations/145_siet_exercise_access.sql`: exercise_access chỉ chính chủ hoặc giáo viên đọc.

## Verification goals

- [x] Khoá anon đọc s:mcf-practice → [] (ĐÃ ĐO)
- [x] Học sinh claim giả: khoá của mình 1, của người khác 0, xoá của người khác 0, sửa của mình 1, blob đáp án 0, PIN 0 (ĐÃ ĐO)
- [x] Giáo viên vẫn đọc 60 khoá (ĐÃ ĐO)
- [x] Khoá anon đọc exercise_access → [] ; học sinh thấy dòng của mình 1, người khác 0 (ĐÃ ĐO)
