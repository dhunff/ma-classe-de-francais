/* Lắp đề thi thử và tính điểm theo thang DELF thật.
 *
 * Tách khỏi giao diện để KIỂM ĐƯỢC: file này không import gì, nên
 * scripts/check-exam.mjs chạy thẳng bằng node. Phần dễ sai nhất của thi thử
 * không phải cái đồng hồ — mà là quy đổi điểm và luật đạt/trượt.
 */

/* Cấu trúc thật của kỳ thi, docs/roadmap-delf.md §2.1.
 *
 * PO (nói) cố ý KHÔNG có ở đây: 25/100 điểm của kỳ thi thật, nhưng hệ thống
 * chưa có gì để tổ chức phần đó. Bịa ra một phần nói giả rồi cộng điểm vào là
 * đưa cho học sinh một con số dự đoán sai — tệ hơn hẳn việc nói thẳng là thiếu.
 */
export const EXAM_STRUCTURE = {
  B1: [
    { code: "CO", skill: "Écoute",            label: "Compréhension de l'oral",  minutes: 25, points: 25 },
    { code: "CE", skill: "Lecture",           label: "Compréhension des écrits", minutes: 45, points: 25 },
    { code: "PE", skill: "Production écrite", label: "Production écrite",        minutes: 45, points: 25 },
  ],
  B2: [
    { code: "CO", skill: "Écoute",            label: "Compréhension de l'oral",  minutes: 30, points: 25 },
    { code: "CE", skill: "Lecture",           label: "Compréhension des écrits", minutes: 60, points: 25 },
    { code: "PE", skill: "Production écrite", label: "Production écrite",        minutes: 60, points: 25 },
  ],
};

export const NGUONG_TONG = 50;      // /100 toàn bài
export const NGUONG_PHAN = 5;       // /25 mỗi phần — điều kiện dễ trượt hơn

/* `assemblePaper` từng ở đây: bốc ngẫu nhiên một bài mỗi kỹ năng để dựng đề.
   Gỡ ngày 2026-08-25 — đề thi nay do GIÁO VIÊN soạn (bảng `exams`, migration
   026), nên hàm đó không còn ai gọi. Giữ lại mã chết chỉ để nó phân kỳ dần với
   phần đang chạy, rồi một ngày có người sửa nhầm vào đó. Lịch sử nằm trong git. */

/* Quy đổi về thang 25.
 *
 * Bài trong thư viện có số câu tuỳ ý — 7 câu, 8 câu, 15 câu — còn kỳ thi thật
 * chấm mỗi phần trên 25. Không quy đổi thì "6/8" và "6/15" trông như nhau,
 * và tổng điểm chẳng liên quan gì tới thang /100 của DELF.
 *
 * Làm tròn tới 0.5 vì DELF chấm theo nửa điểm. */
export function sectionScore(correct, total, points = 25) {
  if (!total) return 0;
  const raw = (correct / total) * points;
  return Math.round(raw * 2) / 2;
}

/* Kết luận đạt / trượt.
 *
 * HAI điều kiện, và điều kiện thứ hai mới là điều kiện hay làm trượt người ta:
 * dưới 5/25 ở BẤT KỲ phần nào là trượt, dù tổng có cao bao nhiêu. Học sinh
 * trượt vì một kỹ năng chết chứ hiếm khi vì tổng điểm — nên giao diện phải nói
 * rõ điều đó chứ không chỉ hiện một con số tổng.
 *
 * `pending` là các phần chưa chấm được (Production écrite chờ giáo viên). Còn
 * phần chưa chấm thì CHƯA kết luận được — trả `passed: null`, đừng đoán. Một
 * lời "bạn đạt rồi" dựa trên hai phần ba bài thi là lời nói dối tử tế nhưng
 * vẫn là nói dối. */
export function verdict(sections) {
  const chuaCham = sections.filter((s) => s.score == null);
  const daCham = sections.filter((s) => s.score != null);

  const tong = daCham.reduce((n, s) => n + s.score, 0);
  const phanYeu = daCham.filter((s) => s.score < NGUONG_PHAN);

  /* Tối đa còn có thể đạt được, để nói "chắc chắn trượt" khi đúng là vậy. */
  const conLai = chuaCham.reduce((n, s) => n + (s.points ?? 25), 0);

  let passed = null;
  if (!chuaCham.length) {
    passed = tong >= NGUONG_TONG && phanYeu.length === 0;
  } else if (phanYeu.length > 0 || tong + conLai < NGUONG_TONG) {
    /* Đã chắc chắn trượt: hoặc có phần dưới ngưỡng, hoặc dù được điểm tối đa
       những phần còn lại vẫn không đủ 50. Kết luận được mà không cần đoán. */
    passed = false;
  }

  return {
    total: tong,
    maxScored: daCham.reduce((n, s) => n + (s.points ?? 25), 0),
    pending: chuaCham,
    weakSections: phanYeu,
    passed,
  };
}
