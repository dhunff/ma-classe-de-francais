/* Thang chấm Production orale CHÍNH THỨC (12/10) — chép từ « Grille
 * d'évaluation de la production orale » bản dành cho giám khảo của France
 * Éducation international (chủ dự án cung cấp, A1 · A2 · B1 · B2). Mỗi thang
 * cộng đúng 25.
 *
 * A1 dùng thang cũ chấm từng nửa điểm; A2–B2 dùng thang mới bốn mức:
 *   Non répondu ou production insuffisante / En dessous du niveau ciblé /
 *   Au niveau ciblé / Au-dessus (niveau +).
 * `muc` là ĐÚNG các giá trị in trên tờ grille, không nội suy thêm.
 *
 * C1/C2: chưa có tờ grille nào trong tay → KHÔNG có ở đây, và phần nói của
 * DALF vẫn « không chấm » (quy tắc 1: không bịa thang).
 *
 * File này dùng chung: client import theo đường tương đối, Edge Function
 * cham-po import thẳng. Sửa một chỗ là đủ. */

const NUA = (max) => Array.from({ length: max * 2 + 1 }, (_, i) => i / 2);
const BON = (cao) => (cao === 5 ? [0, 1, 3, 5] : [0, 1, 2.5, 4]);
const NHAN_MUC = (cap) => [
  { fr: "Non répondu ou production insuffisante", vi: "Không trả lời / quá ít" },
  { fr: `En dessous du niveau ${cap}`, vi: `Dưới mức ${cap}` },
  { fr: `Au niveau ${cap}`, vi: `Đạt mức ${cap}` },
  { fr: `${cap}+`, vi: `Trên mức ${cap}` },
];

export const GRILLE_PO = {
  A1: {
    kieu: "nua",
    criteres: [
      { id: "entretien", max: 5, nhom: "Entretien dirigé", label: "Peut se présenter et parler de soi en répondant à des questions personnelles simples, lentement et clairement formulées.", vi: "Giới thiệu bản thân, trả lời câu hỏi cá nhân đơn giản." },
      { id: "echange", max: 4, nhom: "Échange d'informations", label: "Peut poser des questions personnelles simples sur des sujets familiers et concrets et manifester qu'il/elle a compris la réponse.", vi: "Đặt câu hỏi đơn giản và cho thấy đã hiểu câu trả lời." },
      { id: "dialogue", max: 4, nhom: "Dialogue simulé", label: "Peut demander ou donner quelque chose à quelqu'un, comprendre ou donner des instructions simples sur des sujets concrets de la vie quotidienne.", vi: "Hỏi, đưa đồ vật; hiểu và đưa chỉ dẫn đơn giản đời thường." },
      { id: "politesse", max: 3, nhom: "Dialogue simulé", label: "Peut établir un contact social de base en utilisant les formes de politesse les plus élémentaires.", vi: "Chào hỏi, dùng công thức lịch sự cơ bản." },
      { id: "lexique", max: 3, nhom: "Pour l'ensemble de l'épreuve", label: "Lexique (étendue) / correction lexicale", vi: "Vốn từ và dùng từ đúng." },
      { id: "morpho", max: 3, nhom: "Pour l'ensemble de l'épreuve", label: "Morphosyntaxe / correction grammaticale", vi: "Ngữ pháp, cấu trúc câu." },
      { id: "phono", max: 3, nhom: "Pour l'ensemble de l'épreuve", label: "Maîtrise du système phonologique", vi: "Phát âm dễ hiểu." },
    ],
  },
  A2: {
    kieu: "bon",
    criteres: [
      { id: "entretien", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : entretien dirigé", vi: "Hoàn thành phần trò chuyện có hướng dẫn." },
      { id: "monologue", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : monologue suivi", vi: "Hoàn thành phần độc thoại." },
      { id: "interaction", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : exercice en interaction", vi: "Hoàn thành phần hội thoại tình huống." },
      { id: "lexique", max: 5, nhom: "Compétence linguistique", label: "Lexique", vi: "Từ vựng." },
      { id: "morpho", max: 4, nhom: "Compétence linguistique", label: "Morphosyntaxe", vi: "Ngữ pháp." },
      { id: "phono", max: 4, nhom: "Compétence linguistique", label: "Maîtrise du système phonologique", vi: "Phát âm." },
    ],
  },
  B1: {
    kieu: "bon",
    criteres: [
      { id: "entretien", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : entretien dirigé", vi: "Hoàn thành phần trò chuyện có hướng dẫn." },
      { id: "interaction", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : exercice en interaction", vi: "Hoàn thành phần hội thoại tình huống." },
      { id: "point_de_vue", max: 4, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : expression d'un point de vue", vi: "Trình bày quan điểm về một tài liệu." },
      { id: "lexique", max: 5, nhom: "Compétence linguistique", label: "Lexique", vi: "Từ vựng." },
      { id: "morpho", max: 4, nhom: "Compétence linguistique", label: "Morphosyntaxe", vi: "Ngữ pháp." },
      { id: "phono", max: 4, nhom: "Compétence linguistique", label: "Maîtrise du système phonologique", vi: "Phát âm." },
    ],
  },
  B2: {
    kieu: "bon",
    criteres: [
      { id: "monologue", max: 5, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : monologue suivi", vi: "Độc thoại: nêu vấn đề, lập luận có ví dụ, bố cục rõ." },
      { id: "interaction", max: 5, nhom: "Compétences pragmatique et sociolinguistique", label: "Réalisation de la tâche : exercice en interaction", vi: "Tranh luận: phản hồi, nhấn sắc thái, bảo vệ quan điểm." },
      { id: "lexique", max: 5, nhom: "Compétence linguistique", label: "Lexique", vi: "Từ vựng." },
      { id: "morpho", max: 5, nhom: "Compétence linguistique", label: "Morphosyntaxe", vi: "Ngữ pháp." },
      { id: "phono", max: 5, nhom: "Compétence linguistique", label: "Maîtrise du système phonologique", vi: "Phát âm." },
    ],
  },
};

/* Các giá trị được phép chọn cho một tiêu chí, kèm nhãn mức (thang bốn mức). */
export function mucCuaTieuChi(cap, c) {
  const g = GRILLE_PO[cap];
  if (!g) return [];
  if (g.kieu === "nua") return NUA(c.max).map((v) => ({ v }));
  const nhan = NHAN_MUC(cap);
  return BON(c.max).map((v, i) => ({ v, ...nhan[i] }));
}

export const coThangPO = (cap) => !!GRILLE_PO[cap];

/* Kiểm và cộng một bảng điểm { [id]: số }. Trả { ok, tong, loi }.
 * Thiếu tiêu chí hoặc giá trị không có trên tờ grille → không hợp lệ
 * (đừng kẹp về biên: xem bài học ở cham-pe). */
export function tongPO(cap, bang) {
  const g = GRILLE_PO[cap];
  if (!g) return { ok: false, loi: "KHONG_CO_THANG" };
  let tong = 0;
  for (const c of g.criteres) {
    const v = Number(bang?.[c.id]);
    if (!mucCuaTieuChi(cap, c).some((m) => m.v === v)) return { ok: false, loi: "THIEU_HOAC_SAI", tieuChi: c.id };
    tong += v;
  }
  return { ok: true, tong: Math.round(tong * 2) / 2 };
}
