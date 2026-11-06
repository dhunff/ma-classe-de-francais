/* Lời nhắc chấm Production écrite và lời gọi mô hình (06/11, giai đoạn 2 chấm AI).
 *
 * JS thuần, dùng chung cho Edge Function `cham-pe` VÀ `scripts/check-chamai.mjs`. Bộ hiệu chỉnh
 * chỉ đo được điều có nghĩa khi nó chấm bằng ĐÚNG lời nhắc đang chạy thật: chép lời nhắc sang
 * script là để hai bản trôi khỏi nhau, rồi con số độ lệch nói về một máy chấm không tồn tại.
 *
 * ══ CHẤM HAI LƯỢT ══
 * Lượt 1 (`heThong`) viết đủ phiếu: điểm, nhận xét, lỗi, yêu cầu của đề. Lượt 2 (`heThongDiem`)
 * là một giám khảo thứ hai ĐỘC LẬP, không thấy lượt 1, chỉ trả điểm từng tiêu chí nên rẻ. Gộp
 * điểm ở goiYPE.js › gopDiemNhieuLuot. */
import { bocJSON } from "./goiYPE.js";

export const KY_VONG = {
  A1: "A1 : phrases simples et isolées, vocabulaire élémentaire du quotidien, informations personnelles. Ne pas exiger de connecteurs complexes ; valoriser la communication réussie.",
  A2: "A2 : phrases simples reliées par et, mais, parce que ; décrire, raconter un événement au passé composé, inviter, remercier, s'excuser.",
  B1: "B1 : texte articulé, exprimer et justifier une opinion, raconter une expérience ; passé composé / imparfait, connecteurs courants.",
  B2: "B2 : argumentation structurée et nuancée (introduction, arguments illustrés, conclusion), registre adapté, phrases complexes, vocabulaire précis.",
  C1: "C1 : texte clair, bien structuré, argumentation développée, registre soutenu maîtrisé, grande précision lexicale et syntaxique.",
};

/* Số từ máy đếm, đưa vào lời nhắc như một SỰ THẬT đã đo để mô hình khỏi tự đếm (và đếm sai). */
export function dongKiemTra(kt) {
  return `NOMBRE DE MOTS (compté par la machine, règle DELF : tout ensemble entre deux espaces) : ${kt.so_tu}`
    + (kt.toi_thieu != null ? ` ; consigne : ${kt.toi_thieu}${kt.toi_da ? ` à ${kt.toi_da}` : " minimum"}${kt.thieu_tu ? " → INSUFFISANT" : kt.thua_tu ? " → TROP LONG" : " → respecté"}` : " ; la consigne ne fixe pas de nombre de mots lisible par la machine")
    + ". Ne recompte pas, utilise ce chiffre.";
}

/* Dựng lời nhắc. Mỗi tiêu chí kèm tên CHÍNH THỨC (tiếng Pháp), mô tả của grille DELF và các MỐC
   ĐIỂM (barème) đúng trình độ: AI phải xếp bài vào một mốc rồi mới cho điểm, thay vì đoán một
   con số. Thang lấy thẳng từ rubric đang hiện cho học sinh. */
export function dungLoiNhac({ capDo, rubric, luyenTap = false, kt, deBai, copie, tenBai = "" }) {
  const bangTieuChi = rubric.criteria.map((c) => {
    const moc = Array.isArray(c.bareme) && c.bareme.length
      ? "\n  Barème : " + c.bareme.map((b) => `${b[0]} = ${String(b[1]).slice(0, 120)}`).join(" | ")
      : "";
    return `- id: "${c.id}" | ${c.name_fr ?? c.name} (« ${c.name} ») | sur ${c.max_score}, pas de ${c.step ?? 0.5}`
      + (c.description_fr || c.description ? `\n  Descripteur : ${String(c.description_fr ?? c.description).slice(0, 300)}` : "")
      + moc;
  }).join("\n");

  const PHUONG_PHAP = [
    "MÉTHODE :",
    "1. Pour chaque critère, situe la copie dans UNE ligne du barème, puis attribue la note correspondante (dans les bornes, au pas indiqué).",
    "2. Juge la copie par rapport aux attentes du niveau ${capDo}, ni plus ni moins exigeant.",
    "3. Ne jamais inventer d'erreur. Si un critère est réussi, dis-le.",
    "4. Si la consigne n'est pas respectée (hors sujet, nombre de mots insuffisant), applique-le au critère concerné.",
    ...(luyenTap ? [
      "5. Lis d'abord la consigne de CET exercice (ĐỀ BÀI) : c'est elle qui fixe la tâche, les éléments à traiter et le nombre de mots. Un critère de la grille qui parle d'un élément que cette consigne ne demande pas se juge sur ce que la consigne demande vraiment ; ne pénalise pas l'absence d'un élément non demandé.",
    ] : []),
  ];

  /* Lỗi tô trong bài + đối chiếu yêu cầu của đề (giai đoạn 1). */
  const CHI_DAN_LOI = [
    "",
    "ERREURS (champ loi) : relève les erreurs de langue RÉELLES de la copie, au plus 15, les plus importantes d'abord.",
    "- trich : l'extrait EXACT de la copie, copié caractère par caractère (2 à 120 caractères, le plus court possible qui contient l'erreur). Un extrait absent de la copie sera supprimé.",
    "- sua : la correction de cet extrait, en français.",
    "- loai : UN code parmi accord, conjugaison, temps, preposition, article, pronom, syntaxe, lexique, registre, orthographe, ponctuation.",
    "- giai_thich : la règle, en VIETNAMIEN, une phrase courte.",
    "- N'invente aucune erreur ; ne signale pas un choix stylistique correct. Copie sans erreur : loi = [].",
    "",
    "CONSIGNE (champ yeu_cau) : liste les éléments que la consigne demande (2 à 6, en VIETNAMIEN, ex. « Mời bạn tới dự tiệc », « Nêu ngày giờ »), et pour chacun :",
    "- dat : co (fait), mot_phan (partiellement), khong (absent) ;",
    "- ghi_chu : en VIETNAMIEN, où ou pourquoi, en citant brièvement la copie si utile.",
  ];
  const JSON_LOI = '  "loi": [ { "trich": "...", "sua": "...", "loai": "...", "giai_thich": "..." } ], "yeu_cau": [ { "y": "...", "dat": "co", "ghi_chu": "..." } ]';

  const heThong = [
    luyenTap
      ? "Tu es examinateur-correcteur habilité DELF/DALF et professeur de FLE. Tu corriges un exercice d'ENTRAÎNEMENT à la production écrite du niveau ${capDo} : tu notes la copie avec la grille DELF ${capDo} ci-dessous, puis tu montres à l'élève comment gagner des points."
      : "Tu es examinateur-correcteur habilité DELF/DALF. Tu corriges l'épreuve de production écrite du niveau ${capDo}, avec la grille officielle ci-dessous.",
    KY_VONG[capDo] ?? "",
    "",
    "GRILLE (ne rien ajouter, ne rien retirer) :",
    bangTieuChi,
    "",
    ...PHUONG_PHAP,
    "",
    "RÉDACTION DES COMMENTAIRES (en VIETNAMIEN, ton professionnel d'examinateur, vouvoiement « bạn ») :",
    "- diem_manh : ce qui est réussi pour ce critère, concret.",
    "- can_cai_thien : ce qui fait perdre des points et comment progresser.",
    "- trich_dan : un extrait EXACT de la copie (en français) qui illustre le commentaire, ou chaîne vide.",
    "- nhan_xet : une phrase de synthèse pour le critère.",
    "- tong_quat : 2 à 3 phrases, appréciation globale d'examinateur.",
    "- nhan_dinh_trinh_do : une phrase situant la copie par rapport au niveau ${capDo} (atteint, presque atteint, non atteint) et pourquoi.",
    "- uu_tien : les 3 actions prioritaires pour gagner des points, formulées en verbes d'action.",
    "- loi_leon : 1 à 2 phrases chaleureuses en VIETNAMIEN, signées par Leon (la mascotte bouledogue de FRACILE), qui encouragent l'élève en citant un vrai point fort ; tu peux glisser une expression française simple (Allez, courage !, C'est super !). Hors de la notation, aucun chiffre.",
    "- cau_mau : jusqu'à 3 phrases de la copie réécrites correctement (goc = original exact, sua = version corrigée en français, vi_sao = raison en vietnamien).",
    ...(luyenTap ? [
      "- tang_diem : 1 à 3 actions concrètes pour GAGNER DES POINTS sur CETTE copie, les plus rentables d'abord. Chaque action : tieu_chi = l'id d'un critère de la grille où l'élève n'a pas la note maximale ; viec = quoi faire, en VIETNAMIEN, précis et appuyé sur la copie (ex. « Thêm một đoạn kể ngày chủ nhật: bạn đã làm gì, với ai ») ; them = les points que cette action peut rapporter sur ce critère (au pas de 0,5, sans dépasser le maximum).",
      "- bai_sua : LA COPIE DE L'ÉLÈVE réécrite en français, corrigée et améliorée pour mériter une très bonne note au niveau ${capDo} : garde ses idées, son plan et sa voix, corrige toutes les erreurs, complète ce que la consigne demande et qui manque, sans dépasser le niveau ${capDo} ni le nombre de mots demandé. Ce n'est pas un modèle générique : c'est SA copie, en mieux.",
    ] : []),
    ...CHI_DAN_LOI,
    "",
    dongKiemTra(kt),
    "",
    "Réponds UNIQUEMENT avec ce JSON :",
    '{ "tieu_chi": { "<id>": { "diem": <nombre>, "nhan_xet": "...", "diem_manh": "...", "can_cai_thien": "...", "trich_dan": "..." } },',
    '  "tong_quat": "...", "nhan_dinh_trinh_do": "...", "loi_leon": "...", "uu_tien": ["...", "...", "..."],',
    '  "cau_mau": [ { "goc": "...", "sua": "...", "vi_sao": "..." } ],',
    ...(luyenTap ? ['  "tang_diem": [ { "tieu_chi": "<id>", "viec": "...", "them": <nombre> } ], "bai_sua": "...",'] : []),
    JSON_LOI + " }",
  ].join("\n").replaceAll("${capDo}", capDo);

  /* Giám khảo thứ hai: cùng grille, cùng phương pháp, cùng sự thật về số từ, KHÔNG viết nhận xét.
     Như double correction của DELF: hai người chấm không trao đổi với nhau trước khi cho điểm. */
  const heThongDiem = [
    "Tu es le SECOND correcteur, indépendant, d'une copie de production écrite DELF niveau ${capDo}" + (luyenTap ? " (exercice d'entraînement)" : "") + ". Tu ne connais pas la note du premier correcteur.",
    KY_VONG[capDo] ?? "",
    "",
    "GRILLE (ne rien ajouter, ne rien retirer) :",
    bangTieuChi,
    "",
    ...PHUONG_PHAP,
    "",
    dongKiemTra(kt),
    "",
    "Réponds UNIQUEMENT avec ce JSON, une note par critère :",
    '{ "tieu_chi": { "<id>": <nombre> } }',
  ].join("\n").replaceAll("${capDo}", capDo);

  const nguoiDung = [
    ...(luyenTap ? [`TRÌNH ĐỘ: ${capDo}`, `BÀI TẬP: ${String(tenBai ?? "").slice(0, 200)}`, ""] : []),
    "ĐỀ BÀI:", deBai || "(không còn trong hệ thống)",
    "", "BÀI LÀM CỦA HỌC SINH:", copie,
  ].join("\n");

  return { heThong, heThongDiem, nguoiDung };
}

/* Nhà cung cấp suy ra từ TÊN model: `gpt-…` / `o…` → OpenAI, còn lại → Anthropic. */
export const laOpenAI = (m) => /^(gpt-|o\d)/.test(m);

/* Một lời gọi mô hình. Không ném lỗi: trả { ok, tho, usage } hoặc { ok: false, ma, ... } để nơi
   gọi quyết định (lượt 1 hỏng thì cả lượt chấm hỏng; lượt 2, 3 hỏng thì lùi về ít lượt hơn).
   gpt-6-luna là model suy luận: `max_completion_tokens` gồm cả token suy luận, để rộng, không
   thì hết chỗ trước khi kịp viết JSON. */
export async function goiMoHinh({ model, khoa, heThong, nguoiDung, maxTok = 2000, effort = "low" }) {
  let phanHoi;
  try {
    phanHoi = laOpenAI(model)
      ? await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${khoa}` },
        body: JSON.stringify({
          model,
          max_completion_tokens: 8000,
          reasoning_effort: effort,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: heThong }, { role: "user", content: nguoiDung }],
        }),
      })
      : await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": khoa, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model, max_tokens: maxTok, system: heThong, messages: [{ role: "user", content: nguoiDung }] }),
      });
  } catch (e) {
    return { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) };
  }
  if (!phanHoi.ok) {
    /* 401 = khoá sai, 429 = hết hạn mức bên nhà cung cấp, 529 = quá tải: ba việc phải làm khác
       hẳn nhau, nên trả mã trạng thái ra cho người vận hành. */
    return { ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: phanHoi.status, chi_tiet: (await phanHoi.text().catch(() => "")).slice(0, 300) };
  }
  const goi = await phanHoi.json().catch(() => null);
  const chu = laOpenAI(model) ? (goi?.choices?.[0]?.message?.content ?? "") : (goi?.content?.[0]?.text ?? "");
  const tho = bocJSON(chu);
  if (!tho) return { ok: false, ma: "AI_TRA_VE_KHONG_PHAI_JSON" };
  return {
    ok: true, tho,
    vao: goi?.usage?.input_tokens ?? goi?.usage?.prompt_tokens ?? 0,
    ra: goi?.usage?.output_tokens ?? goi?.usage?.completion_tokens ?? 0,
  };
}
