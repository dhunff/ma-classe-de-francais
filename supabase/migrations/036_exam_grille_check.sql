-- 036 — kiểm hành vi của thang chấm PE (chạy SAU 035)
--
-- ══ VÌ SAO LÀ FILE RIÊNG ══
--
-- 035 tạo, file này phán xét. Gộp chung thì một phép kiểm hỏng sẽ cuộn ngược cả
-- phần đã tạo, và trạng thái sau đó không phân biệt được với "chưa chạy bao
-- giờ" — đã xảy ra đúng một lần với bản đầu của 035.
--
-- File này KHÔNG ghi gì vào bảng. Nó gọi `public.grille_hop_le` bằng dữ liệu
-- dựng tại chỗ. Kiểm HÀM chứ không chèn rác vào `exams`: một dòng đề thi hỏng
-- lọt lại là một buổi thi ma trong danh sách của giáo viên.
--
-- Chạy lại bao nhiêu lần cũng được.
--
-- ══ CÁC CA NÀY PHẢI KHỚP scripts/check-bareme.mjs ══
--
-- Phía JS có `grilleLuuDuoc` làm cùng việc, để nói cho giáo viên biết tiêu chí
-- nào sai thay vì để Postgres trả về "vi phạm ràng buộc". Hai bên kiểm cùng một
-- thứ ở hai nơi; bản JS lỏng hơn thì giao diện cho bấm Lưu rồi database từ
-- chối. `check:bareme` chạy lại đúng các ca dưới đây.

do $$
declare
  hop_le jsonb := $j$ {
    "schema_version": 1, "level": "B2", "official": true, "total": 5,
    "criteria": [
      {"id":"a","key":"consigne","category":"pragmatique","name":"Bám sát đề","max_score":2,"step":0.5},
      {"id":"b","key":"argumenter","category":"pragmatique","name":"Lập luận","max_score":3,"step":0.5}
    ]
  } $j$;
  dat int := 0;
  hong int := 0;
begin
  /* Tiền đề: 035 đã chạy. Kiểm trước, vì nếu thiếu thì mọi lỗi bên dưới đều là
     hệ quả và đọc chúng chỉ tốn thời gian. */
  if not exists (select 1 from information_schema.columns
                  where table_schema = 'public' and table_name = 'exams'
                    and column_name = 'grille') then
    raise exception 'chưa có cột exams.grille — chạy 035_exam_grille.sql trước';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public' and p.proname = 'grille_hop_le') then
    raise exception 'chưa có hàm grille_hop_le — chạy 035_exam_grille.sql trước';
  end if;

  -- ── Phải NHẬN ──
  if public.grille_hop_le(hop_le) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: thang hợp lệ lại bị từ chối'; end if;

  if public.grille_hop_le(null) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: NULL phải được nhận — đó là "dùng thang chuẩn"'; end if;

  -- ── Phải TỪ CHỐI ──
  if not public.grille_hop_le(jsonb_set(hop_le, '{total}', '6')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: tổng lệch mà vẫn lọt'; end if;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,category}', '"linh tinh"')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: nhóm lạ mà vẫn lọt'; end if;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,name}', '""')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: tên rỗng mà vẫn lọt'; end if;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,key}', '""')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: thiếu key mà vẫn lọt'; end if;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,max_score}', '0')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: điểm tối đa bằng 0 mà vẫn lọt'; end if;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,step}', '0.3')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: step không chia hết max_score mà vẫn lọt'; end if;

  /* step = 0 phải TỪ CHỐI, và quan trọng hơn là không được NỔ vì chia cho 0.
     Đây là ca mà thứ tự đánh giá của OR quyết định: SQL không hứa short-circuit,
     nên phép chia phải nằm cùng vế với điều kiện bảo vệ nó. */
  begin
    if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,step}', '0')) then dat := dat + 1;
      else hong := hong + 1; raise warning 'HỎNG: step = 0 mà vẫn lọt'; end if;
  exception when division_by_zero then
    hong := hong + 1;
    raise warning 'HỎNG: step = 0 làm hàm nổ (chia cho 0) thay vì từ chối';
  end;

  if not public.grille_hop_le(jsonb_set(hop_le, '{criteria,1,id}', '"a"')) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: id trùng mà vẫn lọt'; end if;

  if not public.grille_hop_le('{"total":0,"criteria":[]}'::jsonb) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: thang không tiêu chí nào mà vẫn lọt'; end if;

  if not public.grille_hop_le('"khong phai object"'::jsonb) then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: jsonb không phải object mà vẫn lọt'; end if;

  -- ── Ràng buộc có gắn vào bảng thật không ──
  --
  -- Hàm đúng mà quên gắn thì bảng vẫn nhận mọi thứ, và các phép thử ở trên báo
  -- xanh một cách vô nghĩa.
  if exists (select 1 from pg_constraint
              where conrelid = 'public.exams'::regclass
                and conname = 'exams_grille_hop_le') then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: ràng buộc exams_grille_hop_le chưa gắn vào bảng'; end if;

  -- ── Trình duyệt đọc được cột không ──
  --
  -- Không đọc được thì màn tự chấm lặng lẽ lùi về thang chuẩn, và không ai biết
  -- thang tuỳ chỉnh đang bị bỏ qua.
  if has_column_privilege('authenticated', 'public.exams', 'grille', 'SELECT') then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: vai authenticated không đọc được cột grille'; end if;

  if has_column_privilege('anon', 'public.exams', 'grille', 'SELECT') then dat := dat + 1;
    else hong := hong + 1; raise warning 'HỎNG: vai anon không đọc được cột grille'; end if;

  -- ── Dòng cuối ──
  if hong > 0 then
    raise exception '% đạt, % HỎNG — đọc các dòng warning ở trên', dat, hong;
  end if;
  raise notice '% đạt, 0 hỏng — thang chấm PE sẵn sàng', dat;
end $$;
