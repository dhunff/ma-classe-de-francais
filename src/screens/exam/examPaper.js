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
  /* Thời lượng là con số của KỲ THI THẬT, không phải tuỳ chọn sản phẩm — nên
     giao diện soạn đề không cho sửa. Nguồn: France Éducation international.

     A1 và A2 thêm vào 28/08. Trước đó chỉ có B1/B2, nên giáo viên dạy lớp mới
     bắt đầu không soạn được đề thi thử nào — mà đó lại là nhóm cần thi thử
     nhất, vì họ chưa từng thấy một đề DELF trông ra sao.

     Cả bốn trình độ đều KHÔNG có Production orale. Đó là 25/100 điểm của kỳ
     thi thật, và hệ thống chưa tổ chức được phần nói; `check:exam` canh không
     cho ai lặng lẽ bịa ra một phần PO. */
  A1: [
    { code: "CO", skill: "Écoute",            label: "Compréhension de l'oral",  minutes: 20, points: 25 },
    { code: "CE", skill: "Lecture",           label: "Compréhension des écrits", minutes: 30, points: 25 },
    { code: "PE", skill: "Production écrite", label: "Production écrite",        minutes: 30, points: 25 },
  ],
  A2: [
    { code: "CO", skill: "Écoute",            label: "Compréhension de l'oral",  minutes: 25, points: 25 },
    { code: "CE", skill: "Lecture",           label: "Compréhension des écrits", minutes: 30, points: 25 },
    { code: "PE", skill: "Production écrite", label: "Production écrite",        minutes: 45, points: 25 },
  ],
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

/* Tên đầy đủ của một kỹ năng, tra theo `code`.
 *
 * `exam_sections` chỉ lưu `code` — hai chữ « CO » không phải thứ để hiện cho
 * thí sinh đọc giữa buổi thi. Bảng này dựng từ chính EXAM_STRUCTURE nên không
 * có nguồn thứ hai để lệch: sửa nhãn ở trên là mọi chỗ đổi theo.
 *
 * Gộp cả bốn trình độ vào một bản đồ được, vì nhãn của cùng một `code` giống
 * hệt nhau ở mọi trình độ — chỉ `minutes` khác. */
export const NHAN_KY_NANG = Object.fromEntries(
  Object.values(EXAM_STRUCTURE).flat().map((p) => [p.code, p.label]),
);

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
/* Gom các dòng `exam_sections` thành KHỐI theo kỹ năng.
 *
 * ══ VÌ SAO KHỐI, KHÔNG PHẢI TỪNG BÀI RỜI ══
 *
 * Từ migration 044, một kỹ năng chứa được nhiều bài. Nếu coi mỗi bài là một
 * "phần thi" riêng thì đề CO ba bài sẽ có BA đồng hồ 25 phút — tức 75 phút cho
 * một phần mà kỳ thi thật cho 25.
 *
 * DELF tổ chức khác: CO là MỘT khối có một đồng hồ, bên trong có mấy bài. Nên
 * ở đây gom lại đúng thế — đồng hồ và điểm thuộc về KHỐI, còn bài là thứ học
 * sinh đi qua bên trong khối.
 *
 * Thứ tự giữ nguyên theo `ord`, và thứ tự khối theo lần xuất hiện đầu tiên —
 * tức là CO, CE, PE, đúng thứ tự làm bài. Không sắp lại theo bảng chữ cái: một
 * đề bắt đầu bằng phần viết thì không còn là đề DELF.
 */
export function gomTheoKyNang(sections) {
  const khoi = [];
  const theoCode = new Map();
  for (const s of [...(sections ?? [])].sort((a, b) => (a.ord ?? 0) - (b.ord ?? 0))) {
    let k = theoCode.get(s.code);
    if (!k) {
      k = {
        code: s.code,
        /* Thời lượng và điểm lấy từ dòng ĐẦU TIÊN của khối, không cộng dồn:
           chúng là con số của cả phần thi, không phải của từng bài. Cộng dồn
           thì đề CO ba bài thành 75 điểm. */
        label: NHAN_KY_NANG[s.code] ?? s.code,
        minutes: s.minutes,
        points: s.points,
        ord: s.ord ?? 0,
        exercises: [],
      };
      theoCode.set(s.code, k);
      khoi.push(k);
    }
    if (s.exercise) k.exercises.push(s.exercise);
  }
  return khoi;
}

/* Cắt danh sách lượt chấm thành từng BUỔI THI.
 *
 * `attempts` không có cột nào đánh dấu "buổi thi nào", nên phải suy ra từ thời
 * gian. Thi lại cùng một đề mà gom chỉ theo `exam_id` thì mọi buổi dính vào
 * nhau: người dùng thi ba lần thấy MỘT thẻ với sáu dòng CO và tổng /375.
 *
 * Ngưỡng 4 giờ: đề dài nhất (B2) là 30+60+60 = 150 phút, cộng thời gian nghỉ
 * giữa các phần. Chọn rộng có chủ ý — gộp nhầm hai buổi liền kề thì nhìn thấy
 * ngay (hai dòng cùng một kỹ năng), còn cắt đôi một buổi có nghỉ giải lao thì
 * trông như dữ liệu bị mất.
 *
 * Trả về mảng các mảng, mỗi phần tử là một buổi, cũ nhất trước. */
export function chiaLuotThi(rows, gapMs = 4 * 3600 * 1000) {
  const ds = [...(rows ?? [])].sort((a, b) =>
    String(a.finished_at ?? "").localeCompare(String(b.finished_at ?? "")));
  const luot = [];
  let truoc = null;
  for (const r of ds) {
    const t = new Date(r.finished_at).getTime();
    if (truoc === null || !(t - truoc <= gapMs)) luot.push([]);
    truoc = Number.isNaN(t) ? truoc : t;
    luot[luot.length - 1].push(r);
  }
  return luot;
}

/* Điểm của MỘT kỹ năng gộp từ NHIỀU bài.
 *
 * Cộng THÔ rồi quy về thang `points` một lần. Quy đổi từng bài rồi cộng thì
 * bài 7 câu nặng bằng bài 15 câu — cùng luật mà ExamMode dùng lúc đang thi, và
 * hai chỗ phải giống nhau, nếu không thì điểm hiện lúc nộp khác điểm hiện ở
 * trang kết quả.
 *
 * Trả `null` khi không có bài nào máy chấm được (phần viết) — "chờ chấm", chứ
 * không phải 0. */
export function gopDiemKyNang(rows, points = 25) {
  let dung = 0, tong = 0;
  for (const r of rows ?? []) {
    dung += Number(r.score) || 0;
    tong += Number(r.max) || 0;
  }
  return tong > 0 ? sectionScore(dung, tong, points) : null;
}

/* Ghi kết quả một phần thi vào danh sách, THAY THẾ nếu phần đó đã có.
 *
 * ══ VÌ SAO KHÔNG DÙNG `[...p, moi]` ══
 *
 * Một buổi thi có đúng một phần CO, một CE, một PE — `code` là khoá tự nhiên.
 * Nối thêm thì mảng chỉ đúng khi mỗi phần được nộp đúng một lần, mà "đúng một
 * lần" không có gì bảo đảm: bấm hai lần trong lúc chờ mạng, hết giờ đúng lúc
 * đang nộp, F5 giữa chừng.
 *
 * Đã hỏng thật: người dùng bấm « Terminer cette partie » năm lần trong lúc chờ
 * `gradeRemote`, và màn kết quả hiện năm thẻ CO giống hệt nhau, tổng 47,5/150
 * thay vì 9,5/75. Cả tử số lẫn MẪU SỐ đều sai, vì `verdict` cộng `points` của
 * từng phần tử trong mảng.
 *
 * Hàm này ở đây, không nằm trong component, vì `check:exam` chạy bằng node và
 * không đọc được JSX. Một bản sửa không kiểm được là một bản sửa tạm thời. */
export function ghiPhan(danhSach, phan) {
  const i = danhSach.findIndex((x) => x.code === phan.code);
  if (i < 0) return [...danhSach, phan];
  const moi = [...danhSach];
  moi[i] = phan;
  return moi;
}

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
