/* ═══════════════════════════════════════════════════════════════════════════
 * AI GỢI Ý ĐIỂM PHẦN NÓI (Production orale) — 12/10, chấm chuyên sâu 09/11
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Học sinh vừa thi PO trong thi thử, mở màn tự chấm và bấm « AI gợi ý » (hoặc trang kết quả gọi
 * chế độ chinhThuc):
 *   1. Tìm bản ghi MỚI NHẤT của chính người đó cho bài PO của lượt thi này
 *      (kho riêng tư bai-noi, thư mục `<uid>/<exam_id>/`).
 *   2. Chép lời bằng whisper-1, KÈM dấu thời gian từng từ: máy tự đo độ trôi chảy
 *      (_shared/troiChay.js) và đưa cho AI như sự thật đã đo (giai đoạn 5, 09/11).
 *   3. Hai giám khảo AI chấm ĐỘC LẬP theo grille PO chính thức (_shared/grillePO.js), song song:
 *      lượt 1 viết cả lời giải thích, lượt 2 chỉ cho điểm. Gộp về đúng mức có trên grille, lệch lớn
 *      thì chấm lượt 3 lấy trung vị (_shared/gopDiemPO.js).
 *   4. Lượt 1 liệt kê thêm lỗi ngữ pháp, từ vựng trong bản chép lời (lọc như phần viết: đoạn trích
 *      phải có nguyên văn trong bản chép), để vào hồ sơ lỗi ở Tiến bộ VIP.
 *   5. Lưu vào po_cham.ai_goi_y. Chế độ chinhThuc ghi điểm khi học sinh chưa tự chấm.
 *
 * ══ AI CHỈ ĐỀ XUẤT ══ (như cham-pe) Giá trị không có trên tờ grille thì BỎ,
 * không kẹp về biên. AI chỉ đọc chữ đã chép: phần phát âm là gián tiếp, và
 * phần tương tác với giám khảo không có trong bản ghi tự học — lời nhắc nói
 * thẳng điều đó để AI không bịa.
 *
 * Hạn mức 6 lượt / 24 giờ (VIP không giới hạn). Đã có gợi ý → trả lại, không tốn lượt.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
import { tranVip } from "../_shared/tranVip.ts";
import { GRILLE_PO, mucCuaTieuChi } from "../_shared/grillePO.js";
// @ts-ignore — JS thuần, dùng chung với scripts/check-champo.mjs
import { gopDiemPO } from "../_shared/gopDiemPO.js";
// @ts-ignore — JS thuần, dùng chung với scripts/check-troichay.mjs
import { doTroiChay, dongTroiChay, GOI_Y_CHEP_TU_DEM } from "../_shared/troiChay.js";
// @ts-ignore — JS thuần, dùng chung với cham-pe
import { goiMoHinh } from "../_shared/loiNhacPE.js";
// @ts-ignore — JS thuần, dùng chung với trình duyệt
import { locLoi } from "../_shared/loiViet.js";

const KHO = "bai-noi";
const HAN_MUC = 6;
const TRAN_BYTE = 25 * 1024 * 1024;
const DUOI_NHAN = /\.(webm|mp3|mp4|m4a|wav|mpeg|mpga)$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });
  const KHOA = Deno.env.get("OPENAI_API_KEY");
  if (!KHOA) return json(503, { ok: false, ma: "CHUA_CAU_HINH_KHOA" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (!userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* */ }
  const attemptId = String(than?.attemptId ?? "");
  /* 14/10: chinhThuc = AI CHẤM luôn (như phần viết): đủ mọi tiêu chí hợp lệ thì
     ghi điểm vào po_cham (nguon 'ai'), CHỈ khi học sinh chưa tự chấm. */
  const chinhThuc = than?.chinhThuc === true;

  const { data: pc } = await admin.from("po_cham").select("cap, ai_goi_y, de_boc, diem").eq("attempt_id", attemptId).eq("user_id", userId).maybeSingle();
  if (!pc) return json(404, { ok: false, ma: "KHONG_THAY_BAI_NOI" });
  const ghiDiem = async (goiY: any) => {
    if (!chinhThuc || pc.diem != null) return null;
    const g = (GRILLE_PO as any)[pc.cap];
    if (!g || !g.criteres.every((c: any) => typeof goiY?.diem?.[c.id] === "number")) return null;
    const tong = g.criteres.reduce((n: number, c: any) => n + goiY.diem[c.id], 0);
    await admin.from("po_cham").update({ tu_cham: goiY.diem, diem: tong, nguon: "ai", cap_nhat: new Date().toISOString() })
      .eq("attempt_id", attemptId).is("diem", null);
    return tong;
  };
  if (pc.ai_goi_y) return json(200, { ok: true, goi_y: pc.ai_goi_y, da_co: true, diem: await ghiDiem(pc.ai_goi_y) });
  const grille = (GRILLE_PO as any)[pc.cap];
  if (!grille) return json(400, { ok: false, ma: "KHONG_CO_THANG" });

  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  const { count: daDung } = await admin.from("po_cham").select("attempt_id", { count: "exact", head: true })
    .eq("user_id", userId).gte("ai_luc", new Date(Date.now() - 24 * 3600_000).toISOString());
  if (!laVip && (daDung ?? 0) >= HAN_MUC) return json(429, { ok: false, ma: "HET_LUOT", han_muc: HAN_MUC });
  if (laVip) { const tran = await tranVip(admin, userId, "cham-po"); if (tran) return tran; }

  const { data: att } = await admin.from("attempts").select("exam_id, exercise_id").eq("id", attemptId).maybeSingle();
  if (!att?.exam_id) return json(404, { ok: false, ma: "KHONG_THAY_BAI_NOI" });
  const thuMuc = `${userId}/${att.exam_id}`;
  const { data: ds } = await admin.storage.from(KHO).list(thuMuc, { limit: 100 });
  const tep = (ds ?? []).filter((f: any) => f.name.startsWith(`${att.exercise_id}-`)).sort((a: any, b: any) => (a.name < b.name ? 1 : -1))[0];
  if (!tep) return json(404, { ok: false, ma: "CHUA_CO_BAN_GHI", thong_bao: "Chưa có bản ghi âm nào cho phần nói này." });
  if (!DUOI_NHAN.test(tep.name)) return json(400, { ok: false, ma: "DINH_DANG_KHONG_HO_TRO" });

  const { data: file } = await admin.storage.from(KHO).download(`${thuMuc}/${tep.name}`);
  if (!file) return json(404, { ok: false, ma: "KHONG_THAY_BAN_GHI" });
  if (file.size > TRAN_BYTE) return json(413, { ok: false, ma: "BAN_GHI_QUA_LON" });

  /* ── 1. Chép lời, kèm dấu thời gian từng từ khi model là whisper-1 (model khác thì bỏ phần đo,
     không làm hỏng lời gọi). Gợi ý gửi kèm là câu có từ đệm, KHÔNG phải nội dung đề. */
  const modelStt = Deno.env.get("PO_STT_MODEL") || "whisper-1";
  const doMoc = modelStt === "whisper-1";
  const form = new FormData();
  form.append("file", file, tep.name);
  form.append("model", modelStt);
  form.append("language", "fr");
  if (doMoc) {
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    form.append("prompt", GOI_Y_CHEP_TU_DEM);
  }
  const r1 = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${KHOA}` }, body: form }).catch(() => null);
  if (!r1?.ok) return json(502, { ok: false, ma: "AI_TRA_LOI_LOI", buoc: "chep_loi" });
  const banChep: any = await r1.json().catch(() => null);
  const chepLoi = String(banChep?.text ?? "").trim();
  if (chepLoi.length < 5) return json(422, { ok: false, ma: "KHONG_NGHE_RO" });
  /* Bản ghi gần như im lặng thì whisper có thể chép lại chính câu gợi ý: coi như không nghe rõ. */
  const gonChu = (x: string) => x.toLowerCase().replace(/[^\p{L}]/gu, "");
  if (doMoc && gonChu(chepLoi).includes(gonChu(GOI_Y_CHEP_TU_DEM))) return json(422, { ok: false, ma: "KHONG_NGHE_RO" });
  const troiChay: any = doMoc ? doTroiChay(banChep?.words, pc.cap) : { du_lieu: false };

  const { data: ex } = await admin.from("exercises").select("consigne").eq("id", att.exercise_id).maybeSingle();
  /* Đề học sinh đã BỐC và CHỌN (137) quan trọng hơn consigne chung. */
  const deBoc = Array.isArray(pc.de_boc) ? pc.de_boc.map((d: any) => `${d.phan} : ${d.html}`).join("\n") : "";
  const deBai = `${ex?.consigne ?? ""}\n${deBoc}`.replace(/<[^>]+>/g, " ").slice(0, 3500);
  const moTa = grille.criteres.map((c: any) => `- ${c.id} (${c.nhom}) « ${c.label} » : giá trị được phép ${JSON.stringify(mucCuaTieuChi(pc.cap, c).map((m: any) => m.v))}`).join("\n");
  const dongTC = dongTroiChay(troiChay);

  /* ── 2. Lời nhắc: lượt 1 (đủ phiếu) và lượt 2 (giám khảo thứ hai, chỉ điểm). Cùng grille, cùng
     sự thật về độ trôi chảy, không thấy điểm của nhau. */
  const chung = [
    "Bạn chỉ có BẢN CHÉP LỜI do máy tạo từ bản ghi tự luyện ở nhà: không nghe được giọng, không có giám khảo đối thoại.",
    "- Phần phát âm chỉ suy đoán gián tiếp; phần tương tác chỉ đánh giá theo những gì học viên tự nói.",
    "- Phần nào học viên KHÔNG làm trong bản ghi thì cho mức thấp nhất.",
    "- Mỗi tiêu chí chỉ được chọn MỘT giá trị trong danh sách cho phép.",
    ...(dongTC ? ["- Mục ĐỘ TRÔI CHẢY là số đo của máy: dùng nó cho phần hoàn thành nhiệm vụ và phát âm (độ dễ nghe, nhịp nói), đừng tự suy độ trôi chảy từ bản chép lời."] : []),
    "Các tiêu chí:", moTa,
  ];
  const heThong = [
    `Bạn là giám khảo DELF ${pc.cap}, chấm Production orale theo grille chính thức của France Éducation international.`,
    ...chung, "",
    "- ly_do: với mỗi tiêu chí, 1 câu tiếng Việt giải thích mức đã chọn; phần học viên không làm thì nói rõ lý do.",
    "- loi: tối đa 10 lỗi NGỮ PHÁP hoặc DÙNG TỪ rõ ràng trong bản chép lời. trich = đoạn trích NGUYÊN VĂN từ bản chép lời (2 đến 120 ký tự), sua = cách nói đúng, loai = một mã trong accord, conjugaison, temps, preposition, article, pronom, syntaxe, lexique, registre, giai_thich = quy tắc bằng tiếng Việt, một câu. KHÔNG tính chính tả, dấu câu hay từ lạ có thể do máy chép sai: đây là lời nói.",
    ...(dongTC ? ["- troi_chay: 1-2 câu tiếng Việt về độ trôi chảy dựa trên các MỨC đã đo và một cách luyện; KHÔNG nêu con số nào (học sinh chỉ được xem mức)."] : []),
    "Trả lời CHỈ bằng JSON: { \"diem\": { \"<id>\": <số> }, \"ly_do\": { \"<id>\": \"<1 câu>\" }, \"tong_quat\": \"<2-3 câu tiếng Việt, xưng bạn>\", \"loi\": [ { \"trich\": \"...\", \"sua\": \"...\", \"loai\": \"...\", \"giai_thich\": \"...\" } ]" + (dongTC ? ", \"troi_chay\": \"<...>\"" : "") + " }",
  ].join("\n");
  const heThongDiem = [
    `Bạn là giám khảo THỨ HAI, độc lập, chấm Production orale DELF ${pc.cap} theo grille chính thức. Bạn không biết điểm của giám khảo thứ nhất.`,
    ...chung, "",
    "Trả lời CHỈ bằng JSON, một giá trị cho mỗi tiêu chí: { \"diem\": { \"<id>\": <số> } }",
  ].join("\n");
  const nguoiDung = `ĐỀ BÀI:\n${deBai}\n\nBẢN CHÉP LỜI:\n${chepLoi.slice(0, 8000)}${dongTC ? `\n\n${dongTC}` : ""}`;

  /* ── 3. Chấm hai lượt song song, lượt 3 khi lệch lớn. Lượt 2, 3 hỏng thì lùi về số lượt còn lại. */
  const model = Deno.env.get("PE_AI_MODEL") || "gpt-6-luna";
  const effort = Deno.env.get("PE_AI_EFFORT") || "low";
  const goi = (h: string, maxTok: number) => goiMoHinh({ model, khoa: KHOA, heThong: h, nguoiDung, maxTok, effort });
  const [l1, l2]: any[] = await Promise.all([goi(heThong, 3000), goi(heThongDiem, 600)]);
  if (!l1.ok) return json(502, { ok: false, ma: l1.ma === "AI_TRA_VE_KHONG_PHAI_JSON" ? "AI_TRA_VE_SAI_KHUON" : "AI_TRA_LOI_LOI", buoc: "cham" });
  const kq: any = l1.tho;
  const cacLuot: any[] = [kq, ...(l2.ok ? [l2.tho] : [])];
  let gop: any = gopDiemPO(pc.cap, cacLuot);
  if (gop.can_luot_ba) {
    const l3: any = await goi(heThongDiem, 600);
    if (l3.ok) { cacLuot.push(l3.tho); gop = gopDiemPO(pc.cap, cacLuot); }
  }
  if (!gop.so_luot) return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON" });

  const lyDo: Record<string, string> = {};
  for (const c of grille.criteres) if (typeof kq.ly_do?.[c.id] === "string") lyDo[c.id] = kq.ly_do[c.id].slice(0, 400);
  /* Lỗi nói: cùng bộ lọc với phần viết, đối chiếu với BẢN CHÉP LỜI. Lỗi chính tả, dấu câu bị loại
     vì bản chép do máy tạo (lời nhắc đã dặn; lọc thêm ở đây cho chắc). */
  const loi = locLoi(kq.loi, chepLoi).loi.filter((l: any) => l.loai !== "orthographe" && l.loai !== "ponctuation").slice(0, 10);
  const nxTC = typeof kq.troi_chay === "string" ? kq.troi_chay.trim().slice(0, 600) : "";
  const goiY = {
    diem: gop.diem, ly_do: lyDo, tong_quat: String(kq.tong_quat ?? "").slice(0, 1200),
    chep_loi: chepLoi.slice(0, 8000), tep: tep.name, model,
    cham_doi: { so_luot: gop.so_luot, tong_cac_luot: gop.tong_cac_luot, lech_lon_nhat: gop.lech_lon_nhat, chua_chac: gop.chua_chac },
    loi,
    ...(troiChay.du_lieu ? { troi_chay: troiChay, troi_chay_nx: /\d/.test(nxTC) ? "" : nxTC } : {}),
  };
  await admin.from("po_cham").update({ ai_goi_y: goiY, ai_luc: new Date().toISOString() }).eq("attempt_id", attemptId);
  return json(200, { ok: true, goi_y: goiY, diem: await ghiDiem(goiY) });
});
