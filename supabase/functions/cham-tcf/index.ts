/* Edge Function `cham-tcf` (14/11, chủ dự án): AI chấm Expression écrite (PE) và Expression orale
 * (PO) của đề thi thử TCF Canada / TCF tout public theo thang 0..20 của France Éducation international.
 * Luật, nguồn và lời nhắc ở _shared/chamTcf.js (dùng chung với scripts/check-cham-tcf.mjs).
 *
 * body: { attemptId } (lượt làm phần PE hoặc PO của một đề TCF, của CHÍNH người gọi).
 *  1. Kiểm quyền: attempt của người gọi, đề có level TCF/TCF_TP, phần là PE hoặc PO.
 *  2. Đã chấm (tcf_cham.ket_qua có) → trả lại, không tốn lượt.
 *  3. PE: đọc ba câu trả lời `open` từ database (KHÔNG nhận chữ từ client), đếm từ từng tâche.
 *     PO: tải bản ghi mới nhất trong kho bai-noi (<uid>/<exam>/<exercise>-…), chép lời whisper-1
 *     kèm dấu thời gian, đo độ trôi chảy; đề đã bốc lấy từ tcf_cham.de_boc (ghi bởi ket_thuc_po).
 *  4. Hai giám khảo AI song song (lượt 2 chỉ cho điểm), lệch > 2 điểm thì lượt 3, trung vị.
 *  5. Ghi tcf_cham: ket_qua, diem, cap (CECRL), nclc (chỉ TCF Canada).
 * Hạn mức: 6 lượt chấm MỚI / 24 giờ cho tài khoản thường (một đề thi = 2 lượt), VIP qua tranVip.
 * Biến môi trường: OPENAI_API_KEY, PE_AI_MODEL (mặc định gpt-6-luna), PO_STT_MODEL (whisper-1). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
import { tranVip } from "../_shared/tranVip.ts";
// @ts-ignore — JS thuần
import { goiMoHinh, laOpenAI } from "../_shared/loiNhacPE.js";
// @ts-ignore — JS thuần
import { loiNhacTcf, kiemPhieuTcf, diemKhopMuc, gopDiemTcf, capTuDiem, nclcTuDiem, demTu, GIOI_HAN_TU } from "../_shared/chamTcf.js";
// @ts-ignore — JS thuần
import { locLoi, chuThuan } from "../_shared/loiViet.js";
// @ts-ignore — JS thuần
import { doTroiChay, dongTroiChay, GOI_Y_CHEP_TU_DEM } from "../_shared/troiChay.js";

const KHO = "bai-noi";
const HAN_MUC = 6;
const TRAN_BYTE = 25 * 1024 * 1024;
const DUOI_NHAN = /\.(webm|mp3|mp4|m4a|wav|mpeg|mpga)$/i;
const MODEL_MAC_DINH = "gpt-6-luna";
const html2txt = (h: string) => String(h || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/[ \t]+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const model = Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
  const KHOA_STT = Deno.env.get("OPENAI_API_KEY");
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
  if (!/^[0-9a-f-]{36}$/.test(attemptId)) return json(400, { ok: false, ma: "THIEU_THAM_SO" });

  /* ── 1. Quyền + loại phần thi ── */
  const { data: att } = await admin.from("attempts").select("id, user_id, exam_id, exercise_id, finished_at").eq("id", attemptId).maybeSingle();
  if (!att || att.user_id !== userId || !att.exam_id) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  const [{ data: de }, { data: phan }] = await Promise.all([
    admin.from("exams").select("level").eq("id", att.exam_id).maybeSingle(),
    admin.from("exam_sections").select("code").eq("exam_id", att.exam_id).eq("exercise_id", att.exercise_id).maybeSingle(),
  ]);
  const level = de?.level;
  const code = phan?.code;
  if (!["TCF", "TCF_TP"].includes(level) || !["PE", "PO"].includes(code)) return json(400, { ok: false, ma: "KHONG_PHAI_TCF" });

  /* ── 2. Đã chấm thì trả lại ── */
  const { data: cu } = await admin.from("tcf_cham").select("*").eq("attempt_id", attemptId).maybeSingle();
  if (cu?.ket_qua) return json(200, { ok: true, da_co: true, ket_qua: cu.ket_qua, diem: cu.diem, cap: cu.cap, nclc: cu.nclc, code, level });

  /* Hạn mức, đo TRƯỚC khi tiêu tiền. */
  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  if (!laVip) {
    const { count } = await admin.from("tcf_cham").select("attempt_id", { count: "exact", head: true })
      .eq("user_id", userId).gte("ai_luc", new Date(Date.now() - 24 * 3600_000).toISOString());
    if ((count ?? 0) >= HAN_MUC) return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });
  } else { const tran = await tranVip(admin, userId, "cham-tcf"); if (tran) return tran; }

  const { data: ex } = await admin.from("exercises").select("consigne").eq("id", att.exercise_id).maybeSingle();
  let nguoiDung = "";
  let vanDeLocLoi = "";
  let phuLuc: any = {};

  if (code === "PE") {
    /* ── 3a. Viết: ba câu open theo thứ tự đề, chữ đọc từ answers ── */
    const { data: qs } = await admin.from("questions").select("id, ord, prompt").eq("exercise_id", att.exercise_id).eq("type", "open").order("ord");
    const { data: ans } = await admin.from("answers").select("question_id, raw").eq("attempt_id", attemptId);
    const theoCau = new Map((ans ?? []).map((a: any) => [a.question_id, typeof a.raw === "string" ? a.raw : ""]));
    const tache = (qs ?? []).slice(0, 3).map((q: any, i: number) => {
      const bai = chuThuan(String(theoCau.get(q.id) ?? "")).slice(0, 4000);
      const [tu, den] = GIOI_HAN_TU[i] ?? [0, 0];
      return { so: i + 1, de: html2txt(q.prompt).slice(0, 2500), bai, soTu: demTu(bai), tu, den };
    });
    if (!tache.length) return json(400, { ok: false, ma: "KHONG_THAY_DE" });
    if (tache.every((t: any) => t.soTu < 5)) {
      /* Bỏ trống cả ba: 0/20, không gọi AI. */
      const kq = { taches: tache.map((t: any) => ({ so: t.so, niveau: "non_realisee", linguistique: "", pragmatique: "", sociolinguistique: "" })),
        tong_quat: "Bạn chưa viết bài nào nên chưa có gì để chấm.", conseils: [], loi: [], so_tu: tache.map((t: any) => t.soTu), model: "", cham_doi: { so_luot: 0 } };
      await admin.from("tcf_cham").upsert({ attempt_id: attemptId, user_id: userId, code, level, ket_qua: kq, diem: 0, cap: "", nclc: level === "TCF" ? 0 : null, ai_luc: new Date().toISOString() });
      return json(200, { ok: true, ket_qua: kq, diem: 0, cap: "", nclc: level === "TCF" ? 0 : null, code, level });
    }
    nguoiDung = tache.map((t: any) => `### TÂCHE ${t.so} (attendu : ${t.tu} à ${t.den} mots ; écrit : ${t.soTu} mots, compté par la machine)\nCONSIGNE :\n${t.de}\n\nTEXTE DU CANDIDAT :\n${t.bai || "(vide)"}`).join("\n\n");
    vanDeLocLoi = tache.map((t: any) => t.bai).join("\n");
    phuLuc = { so_tu: tache.map((t: any) => t.soTu) };
  } else {
    /* ── 3b. Nói: bản ghi mới nhất của phần này ── */
    if (!KHOA_STT) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });
    const thuMuc = `${userId}/${att.exam_id}`;
    const { data: ds } = await admin.storage.from(KHO).list(thuMuc, { limit: 100 });
    const tep = (ds ?? []).filter((f: any) => f.name.startsWith(`${att.exercise_id}-`)).sort((a: any, b: any) => (a.name < b.name ? 1 : -1))[0];
    if (!tep) return json(404, { ok: false, ma: "CHUA_CO_BAN_GHI" });
    if (!DUOI_NHAN.test(tep.name)) return json(400, { ok: false, ma: "DINH_DANG_KHONG_HO_TRO" });
    const { data: file } = await admin.storage.from(KHO).download(`${thuMuc}/${tep.name}`);
    if (!file) return json(404, { ok: false, ma: "KHONG_THAY_BAN_GHI" });
    if (file.size > TRAN_BYTE) return json(413, { ok: false, ma: "BAN_GHI_QUA_LON" });
    const modelStt = Deno.env.get("PO_STT_MODEL") || "whisper-1";
    const doMoc = modelStt === "whisper-1";
    const form = new FormData();
    form.append("file", file, tep.name);
    form.append("model", modelStt);
    form.append("language", "fr");
    if (doMoc) { form.append("response_format", "verbose_json"); form.append("timestamp_granularities[]", "word"); form.append("prompt", GOI_Y_CHEP_TU_DEM); }
    const r1 = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${KHOA_STT}` }, body: form }).catch(() => null);
    if (!r1?.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "chep_loi" });
    const banChep: any = await r1.json().catch(() => null);
    const chepLoi = String(banChep?.text ?? "").trim();
    const gonChu = (x: string) => x.toLowerCase().replace(/[^\p{L}]/gu, "");
    if (chepLoi.length < 5 || (doMoc && gonChu(chepLoi).includes(gonChu(GOI_Y_CHEP_TU_DEM)))) return json(422, { ok: false, ma: "KHONG_NGHE_RO" });
    /* Ngưỡng trôi chảy: dùng mức B1 làm mốc chung (TCF không chia trình độ trước khi thi). */
    const troiChay: any = doMoc ? doTroiChay(banChep?.words, "B1") : { du_lieu: false };
    const dongTC = dongTroiChay(troiChay);
    const deBoc = Array.isArray(cu?.de_boc) ? cu.de_boc.map((d: any) => `${d.phan} : ${html2txt(d.html)}`).join("\n") : "";
    nguoiDung = `CONSIGNE DE L'ÉPREUVE :\n${html2txt(ex?.consigne ?? "").slice(0, 3000)}\n${deBoc ? `\nSUJETS TIRÉS PAR LE CANDIDAT :\n${deBoc.slice(0, 2000)}\n` : ""}\nTRANSCRIPTION (les trois tâches à la suite) :\n${chepLoi.slice(0, 12000)}${dongTC ? `\n\n${dongTC}` : ""}`;
    vanDeLocLoi = chepLoi;
    phuLuc = { chep_loi: chepLoi.slice(0, 12000), tep: tep.name, ...(troiChay.du_lieu ? { troi_chay: troiChay } : {}) };
  }

  /* ── 4. Hai giám khảo song song, lượt 3 khi lệch lớn ── */
  const effort = Deno.env.get("PE_AI_EFFORT") || "low";
  const goi = (h: string, maxTok: number) => goiMoHinh({ model, khoa: KHOA, heThong: h, nguoiDung, maxTok, effort });
  const hePhieu = loiNhacTcf({ code, level });
  const heDiem = loiNhacTcf({ code, level, laLuotHai: true });
  const [l1, l2]: any[] = await Promise.all([goi(hePhieu, 3500), goi(heDiem, 300)]);
  if (!l1.ok) return json(502, { ok: false, ma: l1.ma === "AI_TRA_VE_KHONG_PHAI_JSON" ? "AI_TRA_VE_SAI_KHUON" : "AI_TRA_LOI_LOI", buoc: "cham" });
  const phieu = kiemPhieuTcf(l1.tho);
  const cacDiem = [phieu.note, ...(l2.ok ? [diemKhopMuc(l2.tho)] : [])];
  let gop = gopDiemTcf(cacDiem);
  if (gop.can_luot_ba) {
    const l3: any = await goi(heDiem, 300);
    if (l3.ok) { cacDiem.push(diemKhopMuc(l3.tho)); gop = gopDiemTcf(cacDiem); }
  }
  if (gop.diem == null) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });

  const diem = gop.diem;
  const cap = capTuDiem(diem);
  const nclc = level === "TCF" ? nclcTuDiem(diem) : null;
  /* Lỗi: chỉ giữ đoạn trích có NGUYÊN VĂN trong bài; bài nói bỏ chính tả, dấu câu. */
  const loi = locLoi(l1.tho?.loi, vanDeLocLoi).loi
    .filter((l: any) => code === "PE" || (l.loai !== "orthographe" && l.loai !== "ponctuation")).slice(0, 10);
  const ketQua = { ...phieu, note: undefined, loi, model, cham_doi: { so_luot: gop.so_luot, cac_luot: gop.cac_luot, chua_chac: gop.chua_chac }, ...phuLuc };
  delete (ketQua as any).note;
  await admin.from("tcf_cham").upsert({ attempt_id: attemptId, user_id: userId, code, level, de_boc: cu?.de_boc ?? null,
    ket_qua: ketQua, diem, cap, nclc, ai_luc: new Date().toISOString() });
  return json(200, { ok: true, ket_qua: ketQua, diem, cap, nclc, code, level });
});
