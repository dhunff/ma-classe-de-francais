/* Lô 44 (14/11, chủ dự án): hàm dựng câu dùng chung cho đề TCF Canada · Đề 1 và TCF Pháp · Đề 1.
 *
 * Khung lấy từ tài liệu đề TCF chủ dự án gửi (OneDrive « TCF TP »: 32 bài Đọc, 28 bài Nghe, đề
 * Viết/Nói theo tháng), KHÔNG chép nội dung: mọi tài liệu, kịch bản, câu hỏi do FRACILE soạn.
 *   Nghe, Đọc: mỗi câu một tài liệu riêng, 4 lựa chọn A, B, C, D, khó dần theo sáu mức
 *   (TCF Canada 39 câu: 4 A1, 6 A2, 9 B1, 10 B2, 6 C1, 4 C2; TCF Pháp 29 câu: 3, 5, 7, 7, 5, 2).
 *   Nghe: câu tả tranh (nghe 4 lời tả, chọn lời đúng với hình), câu nghe một câu nói rồi 4 lời đáp
 *   (lựa chọn KHÔNG in, chỉ nghe), còn lại nghe tài liệu + câu hỏi đọc to, 4 lựa chọn in sẵn.
 *   Mỗi câu nghe là MỘT file audio riêng, phát một lần (q.audio, migration 202).
 * Lời chép audio để ở `model` (vào answer_key, học sinh không đọc được trước khi làm).
 * Không dùng dấu gạch dài trong nội dung học (quy tắc 7). */

let hat = 20261114;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
export const datHat = (h) => { hat = h; };

/* Trộn lựa chọn in sẵn (đáp án đúng viết đầu tiên trong nội dung). */
const tron = (dung, sai) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { options: o.map((y) => y.x), answer: o.findIndex((y) => y.d) };
};

export const GIAM_KHAO = "Voix neutre et posée de présentateur d'examen, français standard, débit régulier.";
export const DOI_THOAI = "Conversation naturelle et spontanée entre deux personnes, ton de la vie quotidienne.";
export const RADIO = "Ton de journaliste ou de chroniqueur à la radio, clair et vivant.";
export const ANNONCE = "Ton d'annonce dans un lieu public (gare, magasin), clair et un peu formel.";
export const QC = " Léger accent québécois naturel.";
export const d = (giong, cach, chu) => ({ giong, cach, chu });
const CHU = ["A", "B", "C", "D"];
const docLuaChon = (ds) => ds.map((x, i) => `${CHU[i]}. ${x}`).join(" ");
const chep = (doan) => doan.map((x) => x.chu).join("\n");

/* Câu Nghe tả tranh: narrateur đọc 4 lời tả; `dung` = chỉ số lời đúng. */
export const ngheTranh = (anh, loi, dung, giaiThich) => {
  const doan = [d("sage", GIAM_KHAO, docLuaChon(loi))];
  return { type: "qcm", prompt: "Écoutez les quatre propositions. Choisissez celle qui correspond à l'image.", anh,
    options: ["", "", "", ""], answer: dung, explanation: giaiThich, model: chep(doan), doan };
};

/* Câu Nghe một câu nói + 4 lời đáp (chỉ nghe). `noi` = các đoạn trước lời đáp. */
export const ngheDap = (noi, loi, dung, giaiThich) => {
  const doan = [...noi, d("sage", GIAM_KHAO, docLuaChon(loi))];
  return { type: "qcm", prompt: "Écoutez l'extrait sonore et les quatre propositions. Choisissez la bonne réponse.",
    options: ["", "", "", ""], answer: dung, explanation: giaiThich, model: chep(doan), doan };
};

/* Câu Nghe tài liệu + câu hỏi đọc to, 4 lựa chọn in sẵn. */
export const ngheHoi = (taiLieu, cauHoi, dung, sai, giaiThich) => {
  const doan = [...taiLieu, d("sage", GIAM_KHAO, cauHoi)];
  return { type: "qcm", prompt: "Écoutez le document sonore et la question. Choisissez la bonne réponse.",
    ...tron(dung, sai), explanation: giaiThich, model: chep(doan), doan };
};

/* Câu Đọc: tài liệu ngắn riêng (HTML) + câu hỏi + 4 lựa chọn. */
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
export const doc = (taiLieu, cauHoi, dung, sai, giaiThich) => ({
  type: "qcm", doc: Array.isArray(taiLieu) ? p(...taiLieu) : p(taiLieu), prompt: cauHoi, ...tron(dung, sai), explanation: giaiThich,
});

/* Câu Cấu trúc ngôn ngữ (TCF Pháp): câu có chỗ trống « ____ ». */
export const ms = (cau, dung, sai, giaiThich) => ({ type: "qcm", prompt: cau, ...tron(dung, sai), explanation: giaiThich });

export { p };
