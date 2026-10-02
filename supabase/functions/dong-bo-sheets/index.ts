/* ĐỒNG BỘ GOOGLE SHEETS (02/10) — giáo viên bấm một nút, máy chủ tự ghi số liệu
 * vào một bảng tính Google CỐ ĐỊNH của chủ dự án.
 *
 * ══ VÌ SAO QUA APPS SCRIPT, KHÔNG QUA GOOGLE SHEETS API ══
 * API chính thức cần một tài khoản dịch vụ Google Cloud + khoá JSON. Apps Script
 * gắn vào chính bảng tính thì chỉ cần dán một đoạn mã và bấm « Triển khai »
 * (docs/google-sheets/HUONG-DAN.md). Script nhận POST, ghi đè ba trang tính, và
 * TRẢ BIÊN NHẬN số dòng đã ghi — hàm này chuyển nguyên biên nhận đó về giao
 * diện, nên « đã đồng bộ » chỉ hiện khi Google thật sự xác nhận.
 *
 * ══ HAI BÍ MẬT, ĐẶT BẰNG `supabase secrets set` ══
 *   SHEETS_WEBHOOK_URL — địa chỉ web app Apps Script (…/exec)
 *   SHEETS_TOKEN       — chuỗi bí mật script so khớp; ai không có thì bị từ chối
 * Không nằm trong mã client: trình duyệt chỉ gọi hàm này, và hàm kiểm vai GIÁO
 * VIÊN (app_metadata.role = 'prof', cùng nguồn với is_teacher()).
 *
 * Số liệu đọc bằng service_role ở máy chủ, không nhận số từ client — client gửi
 * gì lên cũng không đổi được nội dung bảng tính.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.112.4";
import { CORS, json } from "../_shared/cors.ts";

const NGAY = 86400000;
const tb = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const lam = (v: number | null) => (v == null ? "" : Math.round(v));
const ngayVN = (t: number) => new Date(t + 7 * 3600000).toISOString().slice(0, 10);   // giờ Việt Nam
const luc = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600000).toISOString().slice(0, 16).replace("T", " ") : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { ok: false, ma: "SAI_PHUONG_THUC" });

  const URL_SHEETS = Deno.env.get("SHEETS_WEBHOOK_URL");
  const TOKEN = Deno.env.get("SHEETS_TOKEN");
  if (!URL_SHEETS || !TOKEN) return json(503, { ok: false, ma: "CHUA_CAU_HINH_SHEETS" });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: u, error: loiU } = await admin.auth.getUser(token);
  if (loiU || !u?.user) return json(401, { ok: false, ma: "CHUA_DANG_NHAP" });
  if (u.user.app_metadata?.role !== "prof") return json(403, { ok: false, ma: "CHI_GIAO_VIEN" });

  // ── Đọc số liệu ──
  const tu = new Date(Date.now() - 30 * NGAY).toISOString();
  const [hs, luot, bai, sao] = await Promise.all([
    admin.from("profiles").select("id, name, display_name, username, xp_balance").eq("role", "eleve"),
    admin.from("attempts").select("user_id, exercise_id, mode, started_at, finished_at, score, max, giay_lam").gte("started_at", tu),
    admin.from("exercises").select("id, title, level, skills"),
    admin.from("lo_trinh_ket_qua").select("user_id, sao"),
  ]);
  const loi = hs.error || luot.error || bai.error || sao.error;
  if (loi) return json(500, { ok: false, ma: "LOI_DOC_DU_LIEU", chi_tiet: loi.message });

  const tenHs = new Map((hs.data ?? []).map((p: any) => [p.id, p.display_name || p.name || ""]));
  const baiMap = new Map((bai.data ?? []).map((b: any) => [b.id, b]));
  const dsLuot = (luot.data ?? []).filter((r: any) => tenHs.has(r.user_id));
  const p = (r: any) => (r.max > 0 && r.finished_at ? (r.score / r.max) * 100 : null);

  // Trang 1: từng học sinh (30 ngày)
  const tongQuan: (string | number)[][] = [["Học sinh", "@username", "Lượt làm bài (30 ngày)", "Điểm TB (%)", "Phút học (30 ngày)", "Sao lộ trình", "XP", "Lần cuối"]];
  for (const h of hs.data ?? []) {
    const cua = dsLuot.filter((r: any) => r.user_id === h.id && r.finished_at);
    const diem = cua.map(p).filter((x): x is number => x != null);
    const giay = cua.reduce((s: number, r: any) => s + (r.giay_lam > 0 ? r.giay_lam : 0), 0);
    const cuoi = cua.map((r: any) => r.finished_at).sort().pop() ?? null;
    tongQuan.push([tenHs.get(h.id), h.username ? "@" + h.username : "", cua.length, lam(tb(diem)), Math.round(giay / 60),
      (sao.data ?? []).filter((s: any) => s.user_id === h.id).reduce((a: number, s: any) => a + s.sao, 0),
      h.xp_balance ?? 0, luc(cuoi)]);
  }

  // Trang 2: theo ngày (30 ngày)
  const theoNgay: (string | number)[][] = [["Ngày", "Học sinh hoạt động", "Lượt nộp", "Lượt bỏ dở", "Điểm TB (%)", "Phút học"]];
  for (let i = 29; i >= 0; i--) {
    const ngay = ngayVN(Date.now() - i * NGAY);
    const trong = dsLuot.filter((r: any) => ngayVN(new Date(r.finished_at || r.started_at).getTime()) === ngay);
    const xong = trong.filter((r: any) => r.finished_at);
    theoNgay.push([ngay, new Set(trong.map((r: any) => r.user_id)).size, xong.length, trong.length - xong.length,
      lam(tb(xong.map(p).filter((x): x is number => x != null))),
      Math.round(xong.reduce((s: number, r: any) => s + (r.giay_lam > 0 ? r.giay_lam : 0), 0) / 60)]);
  }

  // Trang 3: từng lượt (30 ngày)
  const chiTiet: (string | number)[][] = [["Học sinh", "Bài", "Cấp", "Kỹ năng", "Loại", "Mở lúc", "Nộp lúc", "Điểm (%)", "Phút"]];
  for (const r of [...dsLuot].sort((a: any, b: any) => String(b.started_at).localeCompare(String(a.started_at)))) {
    const b: any = baiMap.get(r.exercise_id) ?? {};
    chiTiet.push([tenHs.get(r.user_id), b.title ?? r.exercise_id ?? "", b.level ?? "", (b.skills ?? []).join(", "),
      r.mode ?? "", luc(r.started_at), r.finished_at ? luc(r.finished_at) : "bỏ dở", lam(p(r)), r.giay_lam > 0 ? Math.round(r.giay_lam / 60) : ""]);
  }

  // ── Gửi sang Apps Script ──
  const goi = { token: TOKEN, capNhat: luc(new Date().toISOString()), sheets: { "Tổng quan học sinh": tongQuan, "Theo ngày": theoNgay, "Lượt làm bài": chiTiet } };
  let tra: any = null;
  try {
    /* Apps Script trả 302 sang googleusercontent rồi mới ra kết quả; fetch tự
       đi theo. Lệnh ghi đã chạy ở bước POST đầu, bước sau chỉ lấy biên nhận. */
    const r = await fetch(URL_SHEETS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(goi), redirect: "follow" });
    const chu = await r.text();
    try { tra = JSON.parse(chu); } catch { return json(502, { ok: false, ma: "SHEETS_TRA_SAI", chi_tiet: chu.slice(0, 300) }); }
  } catch (e) {
    return json(502, { ok: false, ma: "KHONG_GOI_DUOC_SHEETS", chi_tiet: String(e) });
  }
  if (!tra?.ok) return json(502, { ok: false, ma: tra?.ma || "SHEETS_TU_CHOI", chi_tiet: tra?.chi_tiet ?? null });

  return json(200, { ok: true, so_dong: tra.so_dong, url: tra.url ?? null, cap_nhat: goi.capNhat });
});
