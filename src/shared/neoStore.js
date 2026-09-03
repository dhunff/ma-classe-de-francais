import { supabase } from "../storageShim.js";

/* Neo ngữ liệu — lớp truy cập (migration 075).
 *
 * Phép tính nằm ở `neoNguLieu.js`, thuần và có bộ kiểm riêng. File này chỉ nối
 * nó với database.
 *
 * ══ VÌ SAO PHẢI QUA RPC, KHÔNG SELECT THẲNG ══
 *
 * `evidence` KHÔNG cấp SELECT cho `anon` lẫn `authenticated` (075), nên
 * `.select("evidence")` sẽ trả 401 chứ không phải trả ít cột hơn — đúng cái
 * bẫy đã làm trắng cả thư viện ngay sau migration 022.
 *
 * Và đó là điều mong muốn: neo là đáp án nói vòng. Hàm `doc_neo` chỉ trả về
 * neo của những câu người gọi ĐÃ TRẢ LỜI. */

/* Nhớ theo BÀI, không theo câu.
 *
 * Màn chữa bài dựng nhiều câu của cùng một bài, và mỗi câu cần neo của chính
 * nó. Không nhớ thì mười câu là mười lời gọi giống hệt nhau, cùng lúc, cho
 * cùng một kết quả.
 *
 * Nhớ cả PROMISE chứ không chỉ kết quả: mười câu dựng trong cùng một khung
 * hình thì lời gọi thứ hai xuất phát trước khi lời gọi thứ nhất trả về, và
 * một bộ nhớ chỉ giữ kết quả sẽ không chặn được gì.
 *
 * Không có hạn dùng: neo do giáo viên đặt, đổi rất thưa, và bộ nhớ này chết
 * theo lần tải trang. */
const daHoi = new Map();

export function quenNeo(exerciseId) {
  if (exerciseId) daHoi.delete(exerciseId); else daHoi.clear();
}

export async function docNeo(exerciseId) {
  if (!exerciseId) return {};
  if (daHoi.has(exerciseId)) return daHoi.get(exerciseId);
  const chay = _docNeo(exerciseId);
  daHoi.set(exerciseId, chay);
  /* Hỏng thì QUÊN đi, để lần sau còn hỏi lại. Giữ một promise hỏng trong bộ
     nhớ là biến một lần mất mạng thành mất neo vĩnh viễn cho tới khi tải lại
     trang. */
  chay.then((r) => { if (!r || !Object.keys(r).length) daHoi.delete(exerciseId); });
  return chay;
}

async function _docNeo(exerciseId) {
  const { data, error } = await supabase.rpc("doc_neo", { p_exercise_id: exerciseId });
  /* Trả object rỗng khi hỏng, KHÔNG trả null: chỗ gọi dùng nó để tra theo
     `question_id`, và phần chữa bài vẫn phải đọc được khi không có neo nào.
     Neo là phần THÊM VÀO, không phải điều kiện để xem lại bài. */
  if (error) return {};
  const ra = {};
  for (const r of data ?? []) ra[r.question_id] = r.evidence;
  return ra;
}

/* Đặt neo cho một câu. `null` là cách xoá. */
export async function luuNeo(questionId, evidence) {
  const { error } = await supabase.rpc("luu_neo", {
    p_question_id: questionId, p_evidence: evidence ?? null,
  });
  if (error) {
    if (error.code === "42501") return { ok: false, loi: "khong_phai_giao_vien" };
    if (error.code === "22023") return { ok: false, loi: "sai_dang" };
    return { ok: false, loi: "mang", chiTiet: error.message };
  }
  return { ok: true };
}
