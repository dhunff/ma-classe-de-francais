/* Edge Function `giai-thich-cau` (14/11, chủ dự án): ở màn « Xem lại bài thi », AI giải thích VÌ SAO
 * đáp án đúng là đúng và VÌ SAO lựa chọn của học sinh (và các phương án nhiễu) là sai, dựa trên
 * ngữ liệu thật của câu (bài đọc, tài liệu riêng của câu TCF, lời chép audio).
 *
 * body: { attemptId, questionId }.
 *  · Chỉ lượt làm ĐÃ NỘP của chính người gọi, ở chế độ thi (cùng điều kiện với rpc xem_lai_bai_thi).
 *  · Chỉ câu QCM và Vrai/Faux (câu có đáp án đóng).
 *  · Đã giải thích rồi (answers.feedback loai = giai_thich) thì trả lại, không tốn lượt.
 *  · Lưu vào answers.feedback (JSON) + graded_at để đếm hạn mức. Câu court/PE không đi đường này,
 *    nên không đè nhận xét của chúng.
 * Hạn mức: 30 câu / 24 giờ cho tài khoản thường; VIP qua tranVip. Model như cham-pe (PE_AI_MODEL). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
import { tranVip } from "../_shared/tranVip.ts";
// @ts-ignore — JS thuần
import { goiMoHinh, laOpenAI } from "../_shared/loiNhacPE.js";

const HAN_MUC = 30;
const CHU = ["A", "B", "C", "D", "E", "F"];
const html2txt = (h: string) => String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/[ \t]+/g, " ").trim();
const docJSON = (s: any) => { try { const o = JSON.parse(String(s ?? "")); return o && typeof o === "object" ? o : null; } catch { return null; } };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const model = Deno.env.get("PE_AI_MODEL") || "gpt-6-luna";
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (!userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* */ }
  const attemptId = String(than?.attemptId ?? "");
  const questionId = String(than?.questionId ?? "");
  if (!/^[0-9a-f-]{36}$/.test(attemptId) || !questionId || questionId.length > 80) return json(400, { ok: false, ma: "THIEU_THAM_SO" });

  const { data: att } = await admin.from("attempts").select("id, user_id, exercise_id, mode, finished_at").eq("id", attemptId).maybeSingle();
  if (!att || att.user_id !== userId || att.mode !== "exam" || !att.finished_at) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  const [{ data: q }, { data: an }, { data: ex }] = await Promise.all([
    admin.from("questions").select("id, exercise_id, type, prompt, payload, answer_key, explanation").eq("id", questionId).eq("exercise_id", att.exercise_id).maybeSingle(),
    admin.from("answers").select("id, raw, correct, feedback").eq("attempt_id", attemptId).eq("question_id", questionId).maybeSingle(),
    admin.from("exercises").select("level, consigne, reading_text").eq("id", att.exercise_id).maybeSingle(),
  ]);
  if (!q) return json(404, { ok: false, ma: "KHONG_THAY_CAU" });
  if (q.type !== "qcm" && q.type !== "vf") return json(400, { ok: false, ma: "KHONG_HO_TRO" });

  const cu = docJSON(an?.feedback);
  if (cu?.loai === "giai_thich") return json(200, { ok: true, da_co: true, giai_thich: cu });

  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  if (!laVip) {
    /* Đếm lời giải thích đã tạo trong 24 giờ: các dòng answers của chính người này mang loai giai_thich. */
    const { data: ats } = await admin.from("attempts").select("id").eq("user_id", userId).gte("finished_at", new Date(Date.now() - 60 * 24 * 3600_000).toISOString());
    const ids = (ats ?? []).map((x: any) => x.id);
    let dem = 0;
    if (ids.length) {
      const { count } = await admin.from("answers").select("id", { count: "exact", head: true }).in("attempt_id", ids)
        .like("feedback", '{"loai":"giai_thich"%').gte("graded_at", new Date(Date.now() - 24 * 3600_000).toISOString());
      dem = count ?? 0;
    }
    if (dem >= HAN_MUC) return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });
  } else { const tran = await tranVip(admin, userId, "giai-thich-cau"); if (tran) return tran; }

  /* Dựng đề: phương án, đáp án đúng, lựa chọn của học sinh, ngữ liệu. */
  const p: any = q.payload ?? {}, k: any = q.answer_key ?? {};
  let phuongAn: string[] = [];
  let dung = -1, chon: number | null = null;
  if (q.type === "qcm") {
    phuongAn = (Array.isArray(p.options) ? p.options : []).map((x: any) => String(x ?? ""));
    dung = Number.isInteger(k.answer) ? k.answer : -1;
    chon = Number.isInteger(an?.raw) ? an.raw : null;
  } else {
    phuongAn = ["Vrai", "Faux"];
    dung = Number.isInteger(k.answer) ? k.answer : -1;
    chon = Number.isInteger(an?.raw?.choice) && an.raw.choice < 2 ? an.raw.choice : null;
  }
  if (dung < 0) return json(400, { ok: false, ma: "THIEU_DAP_AN" });
  const chiNghe = phuongAn.every((x) => !x.trim());
  const loiChep = String(k.model ?? "");
  const nguLieu = [
    p.doc ? `DOCUMENT DE LA QUESTION :\n${html2txt(p.doc)}` : "",
    ex?.reading_text ? `TEXTE :\n${html2txt(ex.reading_text).slice(0, 9000)}` : "",
    loiChep ? `TRANSCRIPTION DE L'ENREGISTREMENT :\n${loiChep.slice(0, 4000)}` : "",
    !p.doc && !ex?.reading_text && !loiChep && ex?.consigne ? `CONSIGNE :\n${html2txt(ex.consigne).slice(0, 2000)}` : "",
  ].filter(Boolean).join("\n\n");
  const moTaPA = chiNghe
    ? "Les propositions A, B, C, D ne sont pas écrites : elles sont lues dans l'enregistrement (voir la transcription, partie « A. … B. … C. … D. … »)."
    : phuongAn.map((x, i) => `${CHU[i]}. ${x}`).join("\n");
  const nguoiDung = [
    `NIVEAU : ${ex?.level ?? ""}`,
    `QUESTION : ${html2txt(q.prompt)}`,
    `PROPOSITIONS :\n${moTaPA}`,
    `BONNE RÉPONSE : ${CHU[dung]}${phuongAn[dung]?.trim() ? ` (${phuongAn[dung]})` : ""}`,
    `RÉPONSE DU CANDIDAT : ${chon == null ? "aucune" : `${CHU[chon]}${phuongAn[chon]?.trim() ? ` (${phuongAn[chon]})` : ""}`}`,
    q.explanation ? `CORRIGÉ DU PROFESSEUR : ${String(q.explanation).slice(0, 800)}` : "",
    k.justification ? `JUSTIFICATION ATTENDUE : ${String(k.justification).slice(0, 600)}` : "",
    "", nguLieu,
  ].filter((x) => x !== "").join("\n");
  const heThong = [
    "Tu es professeur de FLE et tu aides un apprenant vietnamien à comprendre sa copie d'examen (DELF, DALF ou TCF).",
    "La bonne réponse indiquée est CERTAINE : ne la remets jamais en cause. Appuie-toi UNIQUEMENT sur le document fourni ; cite de courts passages exacts (en français, entre « »).",
    "Explique en VIETNAMIEN, en tutoyant (« bạn »), clairement et brièvement :",
    "- vi_sao_dung : pourquoi la bonne réponse est juste (2 à 3 phrases, avec la citation qui le prouve).",
    "- vi_sao_sai : si le candidat s'est trompé, pourquoi SA réponse est fausse et quel piège l'a induit en erreur ; sinon chaîne vide.",
    "- phuong_an : pour CHAQUE autre proposition fausse, une phrase sur ce qui la rend fausse.",
    "- meo : une astuce courte pour ce type de question.",
    'Réponds UNIQUEMENT en JSON : { "vi_sao_dung": "…", "vi_sao_sai": "…", "phuong_an": [ { "chu": "A", "ly_do": "…" } ], "meo": "…" }',
  ].join("\n");
  const r = await goiMoHinh({ model, khoa: KHOA, heThong, nguoiDung, maxTok: 1200, effort: Deno.env.get("PE_AI_EFFORT") || "low" });
  if (!r.ok) return json(502, { ok: false, ma: r.ma === "AI_TRA_VE_KHONG_PHAI_JSON" ? "AI_TRA_VE_SAI_KHUON" : "AI_TRA_LOI_LOI" });
  const t: any = r.tho ?? {};
  const giaiThich = {
    loai: "giai_thich",
    vi_sao_dung: String(t.vi_sao_dung ?? "").slice(0, 900),
    vi_sao_sai: chon != null && chon !== dung ? String(t.vi_sao_sai ?? "").slice(0, 900) : "",
    phuong_an: (Array.isArray(t.phuong_an) ? t.phuong_an : [])
      .filter((x: any) => CHU.includes(x?.chu) && CHU.indexOf(x.chu) !== dung && CHU.indexOf(x.chu) < phuongAn.length)
      .map((x: any) => ({ chu: x.chu, ly_do: String(x.ly_do ?? "").slice(0, 400) })).slice(0, 5),
    meo: String(t.meo ?? "").slice(0, 400),
    model,
  };
  if (!giaiThich.vi_sao_dung) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });
  /* Lưu đè lên câu trả lời (câu qcm/vf không có nhận xét nào khác ở cột này). Chưa có dòng (câu bỏ
     trống mà grade không ghi) thì vẫn trả lời giải thích, chỉ không lưu được. */
  if (an?.id) await admin.from("answers").update({ feedback: JSON.stringify(giaiThich), graded_at: new Date().toISOString() }).eq("id", an.id);
  return json(200, { ok: true, giai_thich: giaiThich });
});
