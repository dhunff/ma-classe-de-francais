-- 035 — thang chấm Production écrite do giáo viên soạn (PHẦN DDL)
--
-- ══ VÌ SAO FILE NÀY KHÔNG CÓ PHẦN TỰ KIỂM ══
--
-- Bản đầu gộp cả hai. SQL Editor chạy nguyên file trong MỘT transaction, nên
-- một `raise exception` ở khối kiểm cuối file cuộn ngược luôn `alter table` ở
-- đầu file. Kết quả: chạy xong, cột không tồn tại, và trạng thái đó trông y hệt
-- "chưa chạy bao giờ".
--
-- Đó là kiểu hỏng tệ nhất — không phân biệt được với việc không làm gì. Người
-- vận hành báo đã chạy, ứng dụng báo chưa có cột, và không ai sai cả.
--
-- Nay: file này CHỈ tạo. Phần kiểm nằm ở 036, chạy sau và chạy riêng, nên kiểm
-- hỏng thì vẫn biết chính xác cái gì đã có và cái gì chưa.
--
-- ══ VÌ SAO NULL LÀ MẶC ĐỊNH ══
--
-- `grille` để trống nghĩa là "dùng thang chuẩn theo level" (src/shared/
-- grilleRubric.js đọc từ delfGrille.js). Đó là mặc định ĐÚNG: không đề nào phải
-- đổi gì, và mọi đề đang có vẫn chạy y như trước sau migration này.
--
-- Cách khác — chép thang chuẩn vào từng đề lúc tạo — nghe tường minh hơn nhưng
-- nó đóng băng: sửa một lỗi chính tả trong thang chuẩn sẽ không chạm tới đề nào
-- đã tạo, và sau một năm có bốn phiên bản thang trôi nổi không ai biết cái nào
-- đúng. Đúng lỗi mà blob kv_store đã dạy.
--
-- ══ VÌ SAO RÀNG BUỘC NẰM Ở DB ══
--
-- Giao diện đã kiểm và chặn nút Lưu. Nhưng giao diện là lớp dễ đi vòng nhất:
-- một lần gọi PostgREST bằng tay, một script nhập liệu, một bản deploy cũ còn
-- mở trong tab khác — đều ghi thẳng vào bảng.
--
-- Và thang hỏng thì hỏng LẶNG LẼ: học sinh vẫn thấy màn tự chấm, vẫn kéo thanh
-- trượt, vẫn ra một con số. Chỉ là con số đó không còn nghĩa gì.

-- ── 1. Cột ──
alter table public.exams add column if not exists grille jsonb;

comment on column public.exams.grille is
  'Thang chấm PE do giáo viên soạn. NULL = dùng thang chuẩn theo level. '
  'Lược đồ: {schema_version, level, official, total, min_words, criteria[]}.';

-- ── 2. Hàm kiểm tính hợp lệ ──
--
-- Tách khỏi câu CHECK vì hai lý do. Thứ nhất, một biểu thức jsonb ba chục dòng
-- nhét vào CHECK thì không ai đọc lại được, kể cả người viết. Thứ hai, thông
-- báo lỗi của CHECK chỉ nói "vi phạm ràng buộc" — có hàm riêng thì gọi thẳng nó
-- lúc gỡ lỗi để biết CÁI GÌ sai.
--
-- IMMUTABLE vì nó chỉ đọc tham số, không chạm bảng nào — điều kiện bắt buộc để
-- dùng được trong CHECK.
create or replace function public.grille_hop_le(g jsonb)
returns boolean
language sql
immutable
as $fn$
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
         cộng đúng — học sinh chấm thiếu mà nút Lưu vẫn mở khoá.

         `step` kiểm làm HAI vế và đúng thứ tự: phải chắc nó khác 0 trước khi
         đem chia. SQL không hứa hẹn short-circuit cho OR, nên gộp phép chia vào
         cùng một vế với điều kiện bảo vệ nó, thay vì tin vào thứ tự đánh giá. */
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
           /* Nấc phải chia hết thang: max 3 với step 0.4 thì kéo hết cỡ được
              2.8 và không bao giờ chạm điểm tối đa. */
           or ((c ->> 'step')::numeric > 0
               and ((c ->> 'max_score')::numeric % (c ->> 'step')::numeric) <> 0)
      )

      /* `id` trùng nhau thì hai tiêu chí dùng chung một ô điểm: chấm cái này
         nhảy luôn cái kia. Trông như lỗi giao diện, thật ra là lỗi dữ liệu. */
      and (
        select count(distinct c ->> 'id') = count(*)
        from jsonb_array_elements(g -> 'criteria') c
      )
    );
$fn$;

comment on function public.grille_hop_le(jsonb) is
  'Thang chấm PE có dùng được không. Gọi thẳng để biết vì sao một bản ghi bị từ chối.';

-- ── 3. Ràng buộc ──
alter table public.exams drop constraint if exists exams_grille_hop_le;
alter table public.exams add constraint exams_grille_hop_le check (public.grille_hop_le(grille));

-- ── 4. Nạp lại lược đồ cho PostgREST ──
--
-- PostgREST giữ lược đồ trong bộ nhớ. Không báo nó thì hàm mới trả PGRST202
-- ("no matches found in the schema cache") dù hàm đã tồn tại thật — và triệu
-- chứng đó trông y hệt "migration chưa chạy".
notify pgrst, 'reload schema';

-- ── 5. Báo cáo trạng thái ──
--
-- KHÔNG `raise exception`. File này chỉ tạo; việc phán xét để 036 làm. Ở đây
-- chỉ nói ra cái gì đã có, để người chạy nhìn một dòng là biết.
do $$
begin
  raise notice 'cột exams.grille: %',
    case when exists (select 1 from information_schema.columns
                       where table_schema = 'public' and table_name = 'exams'
                         and column_name = 'grille')
         then 'CÓ' else 'THIẾU' end;
  raise notice 'hàm grille_hop_le: %',
    case when exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                       where n.nspname = 'public' and p.proname = 'grille_hop_le')
         then 'CÓ' else 'THIẾU' end;
  raise notice 'ràng buộc exams_grille_hop_le: %',
    case when exists (select 1 from pg_constraint
                       where conrelid = 'public.exams'::regclass
                         and conname = 'exams_grille_hop_le')
         then 'CÓ' else 'THIẾU' end;
  raise notice '→ ba dòng trên phải đều CÓ. Rồi chạy 036 để kiểm hành vi.';
end $$;
