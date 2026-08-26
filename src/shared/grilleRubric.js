import { GRILLE } from "../screens/exam/delfGrille.js";
import { BAREME, NHOM_CUA } from "./peBareme.js";

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
