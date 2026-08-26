import { GRILLE } from "../screens/exam/delfGrille.js";
import { BAREME, NHOM_CUA, THU_TU_NHOM } from "./peBareme.js";

const lamTron = (n) => Math.round(n * 2) / 2;

/* Thang có lưu được không.
 *
 * ══ PHẢI KHỚP VỚI `public.grille_hop_le` (migration 035) ══
 *
 * Ràng buộc thật nằm ở database — đó là lớp không đi vòng được. Hàm này chỉ
 * tồn tại để nói cho giáo viên biết TIÊU CHÍ NÀO sai, thay vì để Postgres trả
 * về "vi phạm ràng buộc exams_grille_hop_le" sau khi họ đã soạn xong.
 *
 * Chặt hơn phía SQL thì không sao — chỉ là từ chối sớm. LỎNG hơn thì hỏng:
 * giao diện cho bấm Lưu, rồi database từ chối, và thông báo lỗi không giúp gì.
 * `check:bareme` chạy lại đúng các ca trong khối tự đối chiếu của 035 để hai
 * đầu không trôi khỏi nhau.
 *
 * Ở đây (JS) chứ không ở GrilleEditor.jsx: bộ kiểm chạy bằng node, và node
 * không đọc được JSX. Một hàm không kiểm được thì sớm muộn cũng sai. */
export function grilleLuuDuoc(g) {
  if (!g) return { ok: true };                       // null = dùng thang chuẩn
  if (!Array.isArray(g.criteria) || !g.criteria.length) {
    return { ok: false, vi: "Thang chưa có tiêu chí nào." };
  }
  const ids = new Set();
  for (const c of g.criteria) {
    const ten = String(c.name || "").trim();
    if (!ten) return { ok: false, vi: "Có tiêu chí chưa đặt tên." };
    if (!String(c.id || "").trim()) return { ok: false, vi: `« ${ten} » thiếu mã.` };
    if (!String(c.key || "").trim()) return { ok: false, vi: `« ${ten} » thiếu khoá.` };
    if (!(Number(c.max_score) > 0)) return { ok: false, vi: `« ${ten} » phải có điểm tối đa lớn hơn 0.` };
    if (!(Number(c.step) > 0)) return { ok: false, vi: `« ${ten} » thiếu bước nhảy.` };
    if (Number(c.max_score) % Number(c.step) !== 0) {
      return { ok: false, vi: `« ${ten} »: ${c.max_score} không chia hết cho bước ${c.step}, nên không kéo tới điểm tối đa được.` };
    }
    if (!THU_TU_NHOM.includes(c.category)) return { ok: false, vi: `« ${ten} » chưa xếp vào nhóm nào.` };
    if (ids.has(c.id)) return { ok: false, vi: "Có hai tiêu chí trùng mã." };
    ids.add(c.id);
  }
  const tong = lamTron(g.criteria.reduce((n, c) => n + Number(c.max_score), 0));
  if (tong !== lamTron(Number(g.total))) {
    return { ok: false, vi: `Tổng ghi ${g.total} nhưng cộng ra ${tong}.` };
  }
  return { ok: true };
}

/* Chuyển `GRILLE` sang lược đồ rubric mà giao diện tự chấm dùng.
 *
 * ══ VÌ SAO CẦN MỘT LỚP CHUYỂN ĐỔI ══
 *
 * Hai dạng dữ liệu tồn tại vì hai lý do khác nhau:
 *
 *   `GRILLE`  — thang chính thức, viết cho người đọc đối chiếu với bản in.
 *               `{ id, max, label, aide }`, không nhóm, không mốc.
 *   `rubric`  — thứ giáo viên sẽ SỬA ĐƯỢC, lưu ở cột `grille jsonb` trên
 *               `exams`. `{ id, key, category, name, max_score, step, bareme }`
 *
 * Giao diện chỉ được biết dạng thứ hai. Nhờ vậy khi cột `grille` có dữ liệu
 * thật, việc duy nhất phải làm là truyền nó vào thay cho hàm này — không phải
 * đi sửa giao diện. Nếu giao diện đọc thẳng `GRILLE` thì mọi thang tuỳ chỉnh
 * đều đòi một nhánh `if` mới ở đâu đó.
 *
 * ══ THIẾU DỮ LIỆU THÌ LÙI, KHÔNG BIẾN MẤT ══
 *
 * `bareme` vắng (A1, A2, hoặc thang giáo viên tự soạn) → dùng `aide` của
 * grille. `category` lạ → xếp vào `pragmatique`, vì rơi ra ngoài mọi nhóm nghĩa
 * là biến mất khỏi màn hình và không ai biết mình đang chấm thiếu tiêu chí.
 */
export function grilleToRubric(level) {
  const g = GRILLE[level] ?? GRILLE.B1;
  const barLevel = BAREME[level] ?? {};

  const criteria = g.criteres.map((c, i) => ({
    /* `id` ở đây trùng `key` vì `GRILLE` chưa có UUID. Vẫn tách hai trường:
       khi thang chuyển sang cột jsonb, `id` thành UUID còn `key` giữ nguyên,
       và mọi chỗ khoá theo `id` không phải viết lại. */
    id: c.id,
    key: c.id,
    category: NHOM_CUA[c.id] ?? "pragmatique",
    name: c.label,
    description: c.aide,
    max_score: c.max,
    step: 0.5,
    bareme: barLevel[c.id] ?? null,
    order: i + 1,
  }));

  return {
    schema_version: 1,
    level,
    official: !g.adapted,   // A1/A2 là bản phỏng theo — nói ra, đừng để tưởng là chính thức
    adapted: !!g.adapted,
    total: criteria.reduce((n, c) => n + c.max_score, 0),
    min_words: g.minWords ?? null,
    consigne: g.consigne ?? "",
    criteria,
  };
}
