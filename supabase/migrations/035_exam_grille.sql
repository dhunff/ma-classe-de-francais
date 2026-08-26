-- 035 — thang chấm Production écrite do giáo viên soạn
--
-- ══ VÌ SAO NULL LÀ MẶC ĐỊNH ══
--
-- `grille` để trống nghĩa là "dùng thang chuẩn theo level" (src/shared/
-- grilleRubric.js đọc từ delfGrille.js). Đó là mặc định ĐÚNG: không giáo viên
-- nào phải soạn một thang mới thì tính năng mới chạy, và mọi đề đang có vẫn
-- hoạt động y như trước sau migration này.
--
-- Cách khác — chép thang chuẩn vào từng đề lúc tạo — nghe có vẻ tường minh
-- hơn, nhưng nó đóng băng: sửa một lỗi chính tả trong thang chuẩn sẽ không
-- chạm tới đề nào đã tạo, và sau một năm sẽ có bốn phiên bản thang trôi nổi
-- không ai biết cái nào đúng. Đúng lỗi mà blob kv_store đã dạy.
--
-- ══ VÌ SAO RÀNG BUỘC NẰM Ở DB ══
--
-- Giao diện soạn thang sẽ kiểm tổng và chặn nút Lưu. Nhưng giao diện là lớp dễ
-- đi vòng nhất trong cả hệ thống: một lần gọi PostgREST bằng tay, một script
-- nhập liệu, một bản deploy cũ còn mở trong tab khác — đều ghi thẳng vào bảng.
--
-- Và thang hỏng thì hỏng LẶNG LẼ: học sinh vẫn thấy màn tự chấm, vẫn kéo thanh
-- trượt, vẫn ra một con số. Chỉ là con số đó không còn nghĩa gì. Không có
-- thông báo lỗi nào, không có dòng log nào.

alter table public.exams add column if not exists grille jsonb;

comment on column public.exams.grille is
  'Thang chấm PE do giáo viên soạn. NULL = dùng thang chuẩn theo level. '
  'Lược đồ: {schema_version, level, official, total, min_words, criteria[]}.';

/* ── Hàm kiểm tính hợp lệ ──
 *
 * Tách khỏi câu CHECK vì hai lý do. Thứ nhất, một biểu thức jsonb dài ba chục
 * dòng nhét vào CHECK thì không ai đọc lại được, kể cả người viết ra nó. Thứ
 * hai, thông báo lỗi của CHECK chỉ nói "vi phạm ràng buộc" — có hàm riêng thì
 * gọi thẳng nó lúc gỡ lỗi để biết CÁI GÌ sai.
 *
 * IMMUTABLE vì nó chỉ đọc tham số, không chạm bảng nào — điều kiện bắt buộc để
 * dùng được trong CHECK.
 */
create or replace function public.grille_hop_le(g jsonb)
returns boolean
language sql
immutable
as $$
  select
    g is null
    or (
      jsonb_typeof(g) = 'object'
      and jsonb_typeof(g -> 'criteria') = 'array'
      and jsonb_array_length(g -> 'criteria') > 0

      /* Tổng phải khớp. Đây là ràng buộc quan trọng nhất: `total` là con số
         hiện trên màn hình học sinh ("18 / 25"), còn thanh trượt lấy từ
         `max_score`. Hai thứ lệch nhau thì không ai chấm được điểm tối đa, và
         màn hình vẫn trông hoàn toàn bình thường. */
      and (g ->> 'total')::numeric = (
        select coalesce(sum((c ->> 'max_score')::numeric), 0)
        from jsonb_array_elements(g -> 'criteria') c
      )

      /* Mỗi tiêu chí đủ trường mà giao diện đọc. Thiếu `category` thì tiêu chí
         rơi ra ngoài cả ba nhóm và BIẾN MẤT khỏi màn hình, trong khi tổng vẫn
         cộng đúng — học sinh chấm thiếu mà nút Lưu vẫn mở khoá. */
      and not exists (
        select 1 from jsonb_array_elements(g -> 'criteria') c
        where coalesce(c ->> 'id', '') = ''
           or coalesce(c ->> 'key', '') = ''
           or coalesce(c ->> 'name', '') = ''
           or coalesce(c ->> 'category', '') not in ('pragmatique', 'lexicale', 'grammaticale')
           or (c ->> 'max_score') is null
           or (c ->> 'max_score')::numeric <= 0
           or (c ->> 'step') is null
           or (c ->> 'step')::numeric <= 0
           /* Nấc phải chia hết thang. `max_score` 3 với `step` 0.4 thì kéo hết
              cỡ được 2.8 và không bao giờ chạm điểm tối đa. */
           or ((c ->> 'max_score')::numeric % (c ->> 'step')::numeric) <> 0
      )

      /* `id` trùng nhau thì hai tiêu chí dùng chung một ô điểm: chấm cái này
         nhảy luôn cái kia. Trông như lỗi giao diện, thật ra là lỗi dữ liệu. */
      and (
        select count(distinct c ->> 'id') = count(*)
        from jsonb_array_elements(g -> 'criteria') c
      )
    );
$$;

comment on function public.grille_hop_le(jsonb) is
  'Thang chấm PE có dùng được không. Gọi thẳng để biết vì sao một bản ghi bị từ chối.';

alter table public.exams drop constraint if exists exams_grille_hop_le;
alter table public.exams add constraint exams_grille_hop_le check (public.grille_hop_le(grille));

-- ─────────────────── Tự đối chiếu ───────────────────
--
-- Kiểm HÀM chứ không kiểm bằng cách chèn rác vào bảng thật: một dòng thi hỏng
-- lọt lại là một buổi thi ma trong danh sách của giáo viên.
do $$
declare
  hop_le jsonb := $j$ {
    "schema_version": 1, "level": "B2", "official": true, "total": 5,
    "criteria": [
      {"id":"a","key":"consigne","category":"pragmatique","name":"Bám sát đề","max_score":2,"step":0.5},
      {"id":"b","key":"argumenter","category":"pragmatique","name":"Lập luận","max_score":3,"step":0.5}
    ]
  } $j$;
  n int;
begin
  if not public.grille_hop_le(hop_le) then
    raise exception 'thang hợp lệ lại bị từ chối';
  end if;

  if not public.grille_hop_le(null) then
    raise exception 'NULL phải được chấp nhận — đó là "dùng thang chuẩn"';
  end if;

  -- Tổng lệch
  if public.grille_hop_le(jsonb_set(hop_le, '{total}', '6')) then
    raise exception 'tổng lệch mà vẫn lọt';
  end if;

  -- Thiếu category
  if public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,category}', '"linh tinh"')) then
    raise exception 'category lạ mà vẫn lọt';
  end if;

  -- Tên rỗng
  if public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,name}', '""')) then
    raise exception 'tên rỗng mà vẫn lọt';
  end if;

  -- Nấc không chia hết thang
  if public.grille_hop_le(jsonb_set(hop_le, '{criteria,0,step}', '0.3')) then
    raise exception 'step không chia hết max_score mà vẫn lọt';
  end if;

  -- id trùng
  if public.grille_hop_le(jsonb_set(hop_le, '{criteria,1,id}', '"a"')) then
    raise exception 'id trùng mà vẫn lọt';
  end if;

  -- Mảng rỗng
  if public.grille_hop_le('{"total":0,"criteria":[]}'::jsonb) then
    raise exception 'thang không tiêu chí nào mà vẫn lọt';
  end if;

  -- Ràng buộc có thật sự gắn vào bảng chưa. Hàm đúng mà quên gắn thì bảng vẫn
  -- nhận mọi thứ, và bộ tự đối chiếu ở trên sẽ báo xanh một cách vô nghĩa.
  select count(*) into n from pg_constraint
   where conrelid = 'public.exams'::regclass and conname = 'exams_grille_hop_le';
  if n <> 1 then
    raise exception 'ràng buộc exams_grille_hop_le chưa gắn vào bảng (thấy %)', n;
  end if;

  -- Cột phải đọc được từ trình duyệt, nếu không màn tự chấm sẽ lặng lẽ lùi về
  -- thang chuẩn và không ai biết thang tuỳ chỉnh bị bỏ qua.
  if not has_column_privilege('authenticated', 'public.exams', 'grille', 'SELECT') then
    raise exception 'vai authenticated không đọc được cột grille';
  end if;
  if not has_column_privilege('anon', 'public.exams', 'grille', 'SELECT') then
    raise exception 'vai anon không đọc được cột grille';
  end if;

  raise notice 'exams.grille sẵn sàng — ràng buộc đã gắn, 7 phép thử đều đúng';
end $$;
