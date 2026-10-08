/* Gợi ý chấm Production écrite bằng AI.
 *
 * ══ VÌ SAO Ở MÁY CHỦ, KHÔNG Ở TRÌNH DUYỆT ══
 *
 * Khoá API đặt trong mã client là khoá đã lộ — mở tab Network là thấy, và
 * người lấy được nó tiêu tiền của bạn cho tới khi bạn phát hiện. Chú thích
 * trong `shared/gradingEngine.js` đã ghi đúng điều này từ lâu trước khi có
 * dòng mã nào; đây là bản thi hành.
 *
 * ══ BÀI VIẾT LẤY TỪ DATABASE, KHÔNG LẤY TỪ CLIENT ══
 *
 * Client chỉ gửi `answerId`. Hàm tự đọc bài viết và đề bài từ database bằng
 * service_role. Nhận chữ do client gửi thì có hai chỗ hỏng:
 *
 *   1. Học sinh gửi một bài viết khác hẳn bài đã nộp, lấy gợi ý, rồi khoe con
 *      số. Gợi ý mất hết nghĩa với chính người đang dùng nó.
 *   2. Ai đó gửi 40 nghìn chữ và trả tiền token bằng ví của bạn.
 *
 * Đọc từ database thì cả hai biến mất cùng lúc, và không cần một dòng kiểm nào.
 *
 * ══ AI ĐỀ XUẤT, HỌC SINH KÝ ══
 *
 * Hàm này KHÔNG chạm vào `answers.self_score`. Nó ghi vào `pe_ai_goi_y` và
 * dừng ở đó. Điểm thật vẫn phải đi qua `save_self_assessment` (migration 030),
 * tức là vẫn do học sinh bấm nút. Xem migration 083.
 *
 * Biến môi trường:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (Supabase tự đặt)
 *   OPENAI_API_KEY                             (BẠN phải đặt — model mặc định là OpenAI)
 *   ANTHROPIC_API_KEY                          (chỉ khi PE_AI_MODEL là model claude-…)
 *   PE_AI_MODEL                                (tuỳ chọn, mặc định ở dưới)
 *   PE_AI_EFFORT                               (tuỳ chọn, chỉ OpenAI: none|low|medium|…, mặc định low)
 *
 * Đặt khoá:
 *   npx supabase secrets set OPENAI_API_KEY=sk-...
 *   npx supabase functions deploy cham-pe
 */

/* GHIM PHIÊN BẢN — cùng lý do đã ghi ở `grade/index.ts`.
   `@2` trỏ tới bản mới nhất lúc khởi động nguội, nên hành vi đổi được mà không
   ai deploy gì và không dòng git nào ghi lại. Dự án đã mất hai ngày vì đúng
   chuyện đó (28–30/08/2026). 2.112.4 là bản `@2` đang phân giải ra tại lúc
   ghim, tức ĐÚNG bản đang chạy. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";
// @ts-ignore — JS thuần, cố ý không có khai báo kiểu
import { kiemGoiY, bocJSON } from "../_shared/goiYPE.js";

/* Model mặc định. Đổi được bằng biến môi trường PE_AI_MODEL để thử model khác
   mà không phải deploy lại — nhưng GIÁ TRỊ MẶC ĐỊNH vẫn nằm trong git, để
   "đang chạy model nào" luôn có một câu trả lời đọc được từ mã nguồn. */
const MODEL_MAC_DINH = "gpt-6-luna";   // chủ dự án chọn 26/09 — rẻ nhất ($0,10 / $0,50 mỗi 1M token)

/* Nhà cung cấp suy ra từ TÊN model: `gpt-…` / `o…` → OpenAI (khoá
   OPENAI_API_KEY), còn lại → Anthropic (khoá ANTHROPIC_API_KEY). Đổi model
   bằng PE_AI_MODEL là đổi luôn nhà cung cấp, không cần sửa mã. */
const laOpenAI = (m: string) => /^(gpt-|o\d)/.test(m);

/* Hạn mức: 6 lượt / 24 giờ / người.
 *
 * Cửa sổ TRƯỢT, không phải "mỗi ngày". Hạn mức này tồn tại để chặn chi phí,
 * và một cửa sổ trượt không có nửa đêm để ai đó đứng chờ rồi bấm hai lượt
 * liền nhau. Cũng không có múi giờ nào để sai — khác `tao_the_tu_viet`, nơi
 * "hôm nay" là khái niệm của người học nên phải theo giờ địa phương.
 *
 * Sáu là đủ cho việc học thật: viết một bài, xin gợi ý, sửa, xin lại. Ai cần
 * lượt thứ bảy trong một ngày thì gần như chắc chắn đang thử nghịch hệ thống
 * chứ không đang luyện thi. */
/* 08/10, theo chủ dự án: 3 lượt AI chấm mỗi NGÀY (theo giờ Việt Nam) cho tài
   khoản thường, TÍNH CẢ lượt chấm bài thi thử; VIP không giới hạn (124).
   Đổi từ cửa sổ trượt 24 giờ sang ngày lịch vì « 3 lần/ngày » là thứ học sinh
   hiểu và đếm được; lượt mới mở lúc 0 giờ. */
const HAN_MUC = 3;
const CUA_SO_GIO = 24;
const dauNgayVN = () => {
  const vn = new Date(Date.now() + 7 * 3600_000);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) - 7 * 3600_000).toISOString();
};

/* Trần độ dài bài viết gửi cho mô hình. Bài DELF B2 dài nhất cũng chỉ quanh
   250 từ; 12 nghìn ký tự là rộng rãi gấp nhiều lần. Trần này không để chặn học
   sinh — nó chặn một dòng dữ liệu hỏng biến thành một hoá đơn. */
const TRAN_KY_TU = 12000;

function nhacKhoa() {
  return json(503, {
    ok: false,
    ma: "CHUA_CAU_HINH_KHOA",
    thong_bao: "Máy chủ chưa có khoá API, nên chưa xin gợi ý được.",
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const model = Deno.env.get("PE_AI_MODEL") || MODEL_MAC_DINH;
  const KHOA = Deno.env.get(laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY");
  if (!KHOA) return nhacKhoa();

  /* ── Ai đang gọi ──
     `auth.getUser(token)` với token TRUYỀN THẲNG, không gọi rỗng. Trong Deno
     không có nơi lưu phiên, nên dạng rỗng phụ thuộc vào việc thư viện có tự
     đọc header hay không — điều không nằm trong hợp đồng, và đã đổi một lần
     rồi (xem grade/index.ts). */
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: u, error: loiU } = await admin.auth.getUser(token);
  const userId = u?.user?.id;
  if (loiU || !userId) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });

  let than: any = null;
  try { than = await req.json(); } catch { /* để rơi xuống câu kiểm dưới */ }
  const answerId = than?.answerId;
  const rubric = than?.rubric;
  /* chinhThuc (08/10, theo chủ dự án): AI chấm LÀ điểm phần viết của bài thi
     thử — ghi thẳng answers.score/feedback. Chỉ cho câu CHƯA có điểm, nên mỗi
     bài tốn đúng một lượt gọi; vì vậy chế độ này không trừ vào hạn mức gợi ý. */
  const chinhThuc = than?.chinhThuc === true;
  if (!answerId || !rubric?.criteria?.length) {
    return json(400, { ok: false, ma: "THIEU_THAM_SO" });
  }

  /* VIP còn hạn: không giới hạn lượt (124). Đọc thẳng profiles bằng service_role. */
  const { data: hs } = await admin.from("profiles").select("vip_den").eq("id", userId).maybeSingle();
  const laVip = !!hs?.vip_den && new Date(hs.vip_den).getTime() > Date.now();
  /* ── Hạn mức, đo TRƯỚC khi tiêu tiền ── */
  const tuLuc = dauNgayVN();
  const { count: daDung } = await admin
    .from("pe_ai_goi_y")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", tuLuc);

  if (!laVip && (daDung ?? 0) >= HAN_MUC) {
    /* Mã lỗi RIÊNG, không gộp vào "thử lại sau".
       "Thử lại sau" mời người ta bấm lại ngay, và lần bấm đó cũng hỏng. Giao
       diện cần nói được "hết lượt, "+giờ+" nữa có lại" — cùng bài học với
       DAILY_LIMIT_REACHED ở tao_the_tu_viet. */
    return json(429, {
      ok: false, ma: "HET_LUOT", han_muc: HAN_MUC, cua_so_gio: CUA_SO_GIO,
      thong_bao: `Bạn đã dùng hết ${HAN_MUC} lượt AI chấm hôm nay. Lượt mới mở lúc 0 giờ; gói VIP không giới hạn.`,
    });
  }

  /* ── Bài viết + đề bài, đọc từ database ──
     Lọc theo attempts.user_id NGAY TRONG câu truy vấn: service_role bỏ qua
     RLS, nên không có hàng rào nào khác ở đây ngoài chính câu lệnh này. */
  const { data: ans, error: loiA } = await admin
    .from("answers")
    .select("id, raw, score, attempt_id, question_id, attempts!inner(user_id, finished_at), questions!inner(type, prompt)")
    .eq("id", answerId)
    .eq("attempts.user_id", userId)
    .maybeSingle();

  if (loiA || !ans) return json(404, { ok: false, ma: "KHONG_THAY_BAI" });
  if ((ans as any).questions?.type !== "open") {
    return json(400, { ok: false, ma: "KHONG_PHAI_TU_LUAN" });
  }
  if (!(ans as any).attempts?.finished_at) {
    /* Chấm bài chưa nộp là mở một cửa hậu: viết một câu, xin gợi ý, sửa theo
       gợi ý, rồi nộp. Bài thi khi đó không đo được gì nữa. */
    return json(400, { ok: false, ma: "CHUA_NOP" });
  }

  if (chinhThuc && (ans as any).score != null) return json(409, { ok: false, ma: "DA_CO_DIEM" });

  const tongToiDa = rubric.criteria.reduce((n: number, c: any) => n + (Number(c.max_score) || 0), 0);
  /* Phiếu điền (formulaire, A1) cùng lượt làm bài: gộp vào bài để AI chấm cả
     tiêu chí « điền phiếu », rồi ghi phiếu 0/0 điểm (đã tính trong bài viết). */
  let phieu: any[] = [];
  if (chinhThuc) {
    const { data } = await admin.from("answers").select("id, raw, questions!inner(type, payload)")
      .eq("attempt_id", (ans as any).attempt_id).eq("questions.type", "formulaire");
    phieu = data ?? [];
  }
  const vanPhieu = phieu.map((a: any) => {
    const champs = a.questions?.payload?.champs ?? [];
    const raw = a.raw && typeof a.raw === "object" ? a.raw : {};
    return "PHIẾU ĐIỀN:\n" + champs.map((c: any) => `- ${c.nhan}: ${String(raw[c.id] ?? "").trim() || "(bỏ trống)"}`).join("\n");
  }).join("\n\n");
  const ghiPhieu = () => phieu.length
    ? admin.from("answers").update({ score: 0, max_score: 0, feedback: "Chấm gộp với bài viết.", graded_at: new Date().toISOString() })
        .in("id", phieu.map((a: any) => a.id)).is("score", null)
    : Promise.resolve();

  const baiViet = String((ans as any).raw ?? "").trim();
  if (baiViet.length < 20) {
    if (!chinhThuc) return json(400, { ok: false, ma: "BAI_QUA_NGAN" });
    /* Bỏ trống / quá ngắn: không gọi AI (không có gì để chấm), cho 0 kèm lý do. */
    await admin.from("answers").update({ score: 0, max_score: tongToiDa || 25,
      feedback: "Bài viết bỏ trống hoặc quá ngắn để chấm.", graded_at: new Date().toISOString() })
      .eq("id", answerId).is("score", null);
    await ghiPhieu();
    return json(200, { ok: true, chinh_thuc: true, tong: 0, tong_toi_da: tongToiDa || 25 });
  }
  const copie = (vanPhieu ? vanPhieu + "\n\nBÀI VIẾT:\n" : "") + baiViet.slice(0, TRAN_KY_TU);

  /* ── Nhắc mô hình ──
     Liệt kê TỪNG tiêu chí kèm thang điểm và mô tả lấy thẳng từ rubric đang
     hiển thị cho học sinh. Không tóm tắt lại: nếu mô hình chấm theo một thang
     khác với thang trên màn hình thì gợi ý và ô điểm cạnh nó nói hai chuyện. */
  /* ── Lời dặn giám khảo (làm lại 08/10) ──
     Mỗi tiêu chí kèm: tên CHÍNH THỨC (tiếng Pháp), mô tả của grille DELF, và
     các MỐC ĐIỂM (barème) đúng trình độ — AI phải xếp bài vào một mốc rồi mới
     cho điểm, thay vì đoán một con số. Thang lấy thẳng từ rubric đang hiện cho
     học sinh, nên điểm AI và thang trên màn hình nói cùng một chuyện. */
  const capDo = String(rubric.level ?? "B1");
  const KY_VONG: Record<string, string> = {
    A1: "A1 : phrases simples et isolées, vocabulaire élémentaire du quotidien, informations personnelles. Ne pas exiger de connecteurs complexes ; valoriser la communication réussie.",
    A2: "A2 : phrases simples reliées par et, mais, parce que ; décrire, raconter un événement au passé composé, inviter, remercier, s'excuser.",
    B1: "B1 : texte articulé, exprimer et justifier une opinion, raconter une expérience ; passé composé / imparfait, connecteurs courants.",
    B2: "B2 : argumentation structurée et nuancée (introduction, arguments illustrés, conclusion), registre adapté, phrases complexes, vocabulaire précis.",
    C1: "C1 : texte clair, bien structuré, argumentation développée, registre soutenu maîtrisé, grande précision lexicale et syntaxique.",
  };
  const bangTieuChi = rubric.criteria.map((c: any) => {
    const moc = Array.isArray(c.bareme) && c.bareme.length
      ? "\n  Barème : " + c.bareme.map((b: any) => `${b[0]} = ${String(b[1]).slice(0, 120)}`).join(" | ")
      : "";
    return `- id: "${c.id}" | ${c.name_fr ?? c.name} (« ${c.name} ») | sur ${c.max_score}, pas de ${c.step ?? 0.5}`
      + (c.description_fr || c.description ? `\n  Descripteur : ${String(c.description_fr ?? c.description).slice(0, 300)}` : "")
      + moc;
  }).join("\n");

  const heThong = [
    `Tu es examinateur-correcteur habilité DELF/DALF. Tu corriges l'épreuve de production écrite du niveau ${capDo}, avec la grille officielle ci-dessous.`,
    KY_VONG[capDo] ?? "",
    "",
    "GRILLE (ne rien ajouter, ne rien retirer) :",
    bangTieuChi,
    "",
    "MÉTHODE :",
    "1. Pour chaque critère, situe la copie dans UNE ligne du barème, puis attribue la note correspondante (dans les bornes, au pas indiqué).",
    "2. Juge la copie par rapport aux attentes du niveau ${capDo}, ni plus ni moins exigeant.",
    "3. Ne jamais inventer d'erreur. Si un critère est réussi, dis-le.",
    "4. Si la consigne n'est pas respectée (hors sujet, nombre de mots insuffisant), applique-le au critère concerné.",
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
    "",
    "Réponds UNIQUEMENT avec ce JSON :",
    '{ "tieu_chi": { "<id>": { "diem": <nombre>, "nhan_xet": "...", "diem_manh": "...", "can_cai_thien": "...", "trich_dan": "..." } },',
    '  "tong_quat": "...", "nhan_dinh_trinh_do": "...", "loi_leon": "...", "uu_tien": ["...", "...", "..."],',
    '  "cau_mau": [ { "goc": "...", "sua": "...", "vi_sao": "..." } ] }',
  ].join("\n").replaceAll("${capDo}", capDo);

  const deBai = String((ans as any).questions?.prompt ?? "").slice(0, 2000);
  const nguoiDung = [
    "ĐỀ BÀI:", deBai || "(không còn trong hệ thống)",
    "", "BÀI LÀM CỦA HỌC SINH:", copie,
  ].join("\n");

  let phanHoi: Response;
  try {
    phanHoi = laOpenAI(model)
      /* OpenAI Chat Completions. gpt-6-luna là model suy luận: dùng
         `max_completion_tokens` (gồm cả token suy luận — để rộng, không thì
         hết chỗ trước khi kịp viết JSON) và `reasoning_effort`. JSON mode ép
         đầu ra là một object JSON; kiemGoiY vẫn kiểm khuôn như với Claude. */
      ? await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${KHOA}` },
        body: JSON.stringify({
          model,
          max_completion_tokens: 8000,
          reasoning_effort: Deno.env.get("PE_AI_EFFORT") || "low",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: heThong },
            { role: "user", content: nguoiDung },
          ],
        }),
      })
      : await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": KHOA,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system: heThong,
          messages: [{ role: "user", content: nguoiDung }],
        }),
      });
  } catch (e) {
    return json(502, { ok: false, ma: "KHONG_GOI_DUOC", chi_tiet: String(e).slice(0, 200) });
  }

  if (!phanHoi.ok) {
    const chiTiet = (await phanHoi.text().catch(() => "")).slice(0, 300);
    /* In mã trạng thái ra cho người vận hành. 401 = khoá sai, 429 = hết hạn
       mức bên nhà cung cấp, 529 = quá tải — ba việc phải làm khác hẳn nhau, và
       gộp chúng thành "lỗi AI" là bắt người sau đi đoán. */
    return json(502, {
      ok: false, ma: "AI_TRA_LOI_LOI", trang_thai: phanHoi.status, chi_tiet: chiTiet,
    });
  }

  const goi = await phanHoi.json().catch(() => null);
  const chu = laOpenAI(model)
    ? (goi?.choices?.[0]?.message?.content ?? "")
    : (goi?.content?.[0]?.text ?? "");
  const tho = bocJSON(chu);
  if (!tho) return json(502, { ok: false, ma: "AI_TRA_VE_KHONG_PHAI_JSON" });

  /* ── Kiểm khuôn TRƯỚC khi ghi ──
     Bước 4 trong phác thảo cũ ở gradingEngine.js, và là bước duy nhất có thể
     hỏng mà không ai thấy. Xem _shared/goiYPE.js. */
  const kq = kiemGoiY(tho, rubric);
  if (!kq.ok) {
    return json(502, { ok: false, ma: "AI_TRA_VE_SAI_KHUON", ly_do: kq.ly_do });
  }

  const { error: loiGhi } = await admin.from("pe_ai_goi_y").insert({
    answer_id: answerId,
    user_id: userId,
    model,
    ket_qua: kq.goiY,
    token_vao: goi?.usage?.input_tokens ?? goi?.usage?.prompt_tokens ?? null,
    token_ra: goi?.usage?.output_tokens ?? goi?.usage?.completion_tokens ?? null,
  });

  /* Chế độ chính thức: ghi điểm AI làm điểm câu này. Chỉ khi AI chấm ĐỦ mọi
     tiêu chí — thiếu tiêu chí nào thì tổng thấp giả, nên không ghi. */
  let daGhiDiem = false;
  if (chinhThuc && !kq.bo?.length) {
    const g: any = kq.goiY;
    const chiTiet = rubric.criteria.map((c: any) => {
      const t = g.tieu_chi?.[c.id];
      if (!t) return "";
      return [`▸ ${c.name ?? c.id} (${c.name_fr ?? ""}) : ${t.diem}/${c.max_score}`,
        t.diem_manh ? `  Điểm mạnh: ${t.diem_manh}` : "",
        t.can_cai_thien ? `  Cần cải thiện: ${t.can_cai_thien}` : "",
        t.trich_dan ? `  Trích bài: « ${t.trich_dan} »` : ""].filter(Boolean).join("\n");
    }).filter(Boolean).join("\n");
    const uuTien = (g.uu_tien ?? []).map((x: string, k: number) => `${k + 1}. ${x}`).join("\n");
    const { error: loiD } = await admin.from("answers").update({
      score: g.tong, max_score: g.tong_toi_da || tongToiDa,
      feedback: [`NHẬN XÉT CỦA GIÁM KHẢO AI · DELF ${capDo}`, g.tong_quat, g.nhan_dinh_trinh_do, chiTiet, uuTien ? `Ưu tiên sửa:\n${uuTien}` : ""].filter(Boolean).join("\n\n").slice(0, 6000),
      graded_at: new Date().toISOString(),
    }).eq("id", answerId).is("score", null);
    daGhiDiem = !loiD;
    if (daGhiDiem) await ghiPhieu();
  }

  /* Ghi hỏng thì VẪN trả gợi ý về. Học sinh đã chờ xong lời gọi và tiền token
     đã tiêu; nuốt kết quả vì một lỗi ghi là bắt họ trả giá hai lần. Nhưng nói
     ra rằng nó không được lưu, để "mở lại thấy mất" không thành một bí ẩn. */
  return json(200, {
    ok: true,
    goi_y: kq.goiY,
    bo: kq.bo,
    model,
    da_luu: !loiGhi,
    da_ghi_diem: daGhiDiem,
    con_lai: Math.max(0, HAN_MUC - (daDung ?? 0) - 1),
  });
});
