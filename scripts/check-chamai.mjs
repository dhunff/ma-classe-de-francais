/* npm run check:chamai — đo AI chấm bài viết lệch bao nhiêu so với giáo viên (06/11, giai đoạn 2).
 *
 * ══ VÌ SAO ══
 * « AI chấm có chuẩn không » chỉ trả lời được bằng số đo. Script này chấm lại các bài ĐÃ CÓ điểm
 * người chấm bằng ĐÚNG máy chấm đang chạy (cùng lời nhắc ở supabase/functions/_shared/loiNhacPE.js,
 * cùng chấm hai lượt, cùng gộp điểm), rồi so từng tiêu chí. Chạy lại mỗi lần đổi lời nhắc hoặc
 * đổi model, để biết thay đổi làm AI tốt lên hay tệ đi.
 *
 * ══ BÀI CHUẨN LẤY TỪ ĐÂU ══
 *  1. Khiếu nại giáo viên đã xử lý (bảng pe_khieu_nai, migration 196): « Đã chấm lại » lấy điểm
 *     giáo viên; « Giữ nguyên » lấy điểm AI lúc đó (giáo viên đã xác nhận đúng). Đọc bằng
 *     `supabase db query --read-only`, KHÔNG lưu bài học sinh vào git.
 *  2. scripts/chamai/bo-them.json (tuỳ chọn, git bỏ qua): bài mẫu có điểm chính thức bạn tự thêm,
 *     dạng [{ "ten", "level", "che_do": "exam"|"practice", "consigne", "copie", "diem": { id: số } }].
 *
 * ══ TỐN TIỀN ══
 * Mỗi bài là 2 đến 3 lời gọi mô hình thật. Cần OPENAI_API_KEY (hoặc ANTHROPIC_API_KEY nếu
 * PE_AI_MODEL là claude-…) trong biến môi trường hoặc supabase/.env. Không có khoá thì chỉ in
 * hướng dẫn và thoát 0. Khoá không bao giờ được in ra.
 *
 * Tuỳ chọn:  --toi-da N    chỉ chấm N bài đầu     --mot-luot   chỉ lượt 1 (rẻ hơn, không gộp)
 *            --tu-kiem     kiểm phần tính độ lệch bằng dữ liệu giả, không gọi mạng
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dungLoiNhac, goiMoHinh, laOpenAI } from "../supabase/functions/_shared/loiNhacPE.js";
import { gopDiemNhieuLuot, lamTronBuoc } from "../supabase/functions/_shared/goiYPE.js";
import { chuThuan, kiemTraCoDinh } from "../supabase/functions/_shared/loiViet.js";
import { grilleToRubric } from "../src/shared/grilleRubric.js";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..");
const thamSo = process.argv.slice(2);
const co = (t) => thamSo.includes(t);
const giaTri = (t) => { const i = thamSo.indexOf(t); return i >= 0 ? thamSo[i + 1] : null; };

/* ── Tính độ lệch (thuần, có --tu-kiem) ──
   ds: [{ ten, ai: { id: số }, nguoi: { id: số } }]. Chỉ so tiêu chí CẢ HAI bên đều có điểm. */
export function doLech(ds) {
  const theoTieuChi = {};
  const tong = [];
  for (const b of ds) {
    let tAi = 0, tNg = 0, coTieuChi = false;
    for (const [id, ng] of Object.entries(b.nguoi ?? {})) {
      const ai = b.ai?.[id];
      if (ai == null || ng == null) continue;
      coTieuChi = true;
      tAi += ai; tNg += Number(ng);
      (theoTieuChi[id] ??= []).push(ai - Number(ng));
    }
    if (coTieuChi) tong.push({ ten: b.ten, ai: tAi, nguoi: tNg, lech: tAi - tNg });
  }
  const tb = (xs) => (xs.length ? xs.reduce((n, x) => n + x, 0) / xs.length : 0);
  const tron = (x) => Math.round(x * 100) / 100;
  return {
    so_bai: tong.length,
    mae_tong: tron(tb(tong.map((x) => Math.abs(x.lech)))),
    lech_tb_tong: tron(tb(tong.map((x) => x.lech))),
    trong_2_5: tong.length ? tron(tong.filter((x) => Math.abs(x.lech) <= 2.5).length / tong.length) : 0,
    tieu_chi: Object.fromEntries(Object.entries(theoTieuChi).map(([id, xs]) => [id, { so: xs.length, mae: tron(tb(xs.map(Math.abs))), lech_tb: tron(tb(xs)) }])),
    te_nhat: [...tong].sort((a, b) => Math.abs(b.lech) - Math.abs(a.lech)).slice(0, 5),
  };
}

if (co("--tu-kiem")) {
  const r = doLech([
    { ten: "a", ai: { x: 2, y: 3 }, nguoi: { x: 1, y: 3 } },
    { ten: "b", ai: { x: 1, y: 1 }, nguoi: { x: 2, y: 4 } },
    { ten: "c", ai: { x: 1 }, nguoi: { y: 2 } },
  ]);
  const dung = r.so_bai === 2 && r.mae_tong === 2.5 && r.lech_tb_tong === -1.5 && r.trong_2_5 === 0.5
    && r.tieu_chi.x.mae === 1 && r.tieu_chi.x.lech_tb === 0 && r.tieu_chi.y.lech_tb === -1.5 && r.te_nhat[0].ten === "b";
  console.log(dung ? "check:chamai --tu-kiem: phần tính độ lệch đúng" : `check:chamai --tu-kiem: SAI ${JSON.stringify(r)}`);
  process.exit(dung ? 0 : 1);
}

/* ── Model và khoá: model mặc định đọc thẳng từ cham-pe để hai nơi không trôi khỏi nhau ── */
const nguonChamPe = readFileSync(join(GOC, "supabase/functions/cham-pe/index.ts"), "utf8");
const model = process.env.PE_AI_MODEL || (nguonChamPe.match(/const MODEL_MAC_DINH = "([^"]+)"/) ?? [])[1];
const tenKhoa = laOpenAI(model) ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";
let khoa = process.env[tenKhoa];
if (!khoa && existsSync(join(GOC, "supabase/.env"))) {
  const dong = readFileSync(join(GOC, "supabase/.env"), "utf8").split(/\r?\n/).find((d) => d.startsWith(`${tenKhoa}=`));
  khoa = dong ? dong.slice(tenKhoa.length + 1).trim().replace(/^["']|["']$/g, "") : "";
}
if (!khoa) {
  console.log(`check:chamai: bỏ qua, chưa có ${tenKhoa} (model ${model}).`);
  console.log(`  Đặt biến môi trường ${tenKhoa} hoặc ghi vào supabase/.env (git đã bỏ qua file này), rồi chạy lại.`);
  console.log("  Lưu ý: mỗi bài chuẩn tốn 2 đến 3 lời gọi mô hình thật.");
  process.exit(0);
}

/* ── Thang cho một bài: luyện tập bỏ « fiche » như máy chủ; chỉ giữ tiêu chí người đã chấm ── */
function thangCho(level, cheDo, ids) {
  const r = grilleToRubric(String(level || "B1").slice(0, 2).toUpperCase());
  const criteria = r.criteria.filter((c) => (cheDo === "exam" || c.id !== "fiche") && (!ids || ids.includes(c.id)));
  return { ...r, criteria };
}

/* ── Nạp bài chuẩn ── */
const bai = [];
try {
  const sql = "select k.id, k.trang_thai, k.diem_gv, g.ket_qua, a.raw, q.prompt, e.consigne, e.level, e.title, t.mode "
    + "from pe_khieu_nai k join pe_ai_goi_y g on g.id = k.goi_y_id join answers a on a.id = k.answer_id "
    + "join attempts t on t.id = a.attempt_id join questions q on q.id = a.question_id left join exercises e on e.id = q.exercise_id "
    + "where k.trang_thai in ('giu_nguyen', 'da_cham_lai') order by k.xu_ly_luc desc limit 500";
  const ra = execSync(`npx supabase db query --remote --read-only --workdir "${GOC}" -o json "${sql}"`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024 * 1024 });
  const rows = JSON.parse(ra.slice(ra.indexOf("{"))).rows ?? [];
  for (const r of rows) {
    const nguoi = r.trang_thai === "da_cham_lai"
      ? r.diem_gv
      : Object.fromEntries(Object.entries(r.ket_qua?.tieu_chi ?? {}).map(([id, t]) => [id, t?.diem]));
    const consigne = chuThuan(r.consigne ?? ""), cauHoi = chuThuan(r.prompt ?? "");
    bai.push({
      ten: `khiếu nại #${r.id}`, level: r.level, che_do: r.mode === "exam" ? "exam" : "practice",
      deBai: consigne && !cauHoi.includes(consigne) ? `${consigne}\n${cauHoi}` : (cauHoi || consigne),
      copie: typeof r.raw === "string" ? r.raw : String(r.raw ?? ""), ten_bai: r.title ?? "", nguoi,
    });
  }
} catch (e) {
  console.log(`check:chamai: không đọc được khiếu nại từ database (${String(e.message ?? e).split("\n")[0]}). Chỉ dùng bo-them.json.`);
}
const fileThem = join(GOC, "scripts/chamai/bo-them.json");
if (existsSync(fileThem)) {
  for (const b of JSON.parse(readFileSync(fileThem, "utf8"))) {
    bai.push({ ten: b.ten ?? "bài thêm", level: b.level, che_do: b.che_do ?? "exam", deBai: b.consigne ?? "", copie: b.copie ?? "", ten_bai: b.ten ?? "", nguoi: b.diem ?? {} });
  }
}
const toiDa = Number(giaTri("--toi-da")) || bai.length;
const chon = bai.filter((b) => b.copie && Object.keys(b.nguoi ?? {}).length).slice(0, toiDa);
if (!chon.length) {
  console.log("check:chamai: chưa có bài chuẩn nào. Bài chuẩn đến từ khiếu nại giáo viên đã xử lý (/professeur/khieu-nai-diem) hoặc scripts/chamai/bo-them.json.");
  process.exit(0);
}

/* ── Chấm lại bằng đúng máy chấm đang chạy ── */
console.log(`check:chamai: ${chon.length} bài, model ${model}${co("--mot-luot") ? ", chỉ lượt 1" : ", chấm hai lượt"}\n`);
const ketQua = [];
let tokVao = 0, tokRa = 0;
for (const b of chon) {
  const capDo = String(b.level || "B1").slice(0, 2).toUpperCase();
  const rubric = thangCho(capDo, b.che_do, Object.keys(b.nguoi));
  const kt = kiemTraCoDinh(b.copie, b.deBai);
  const { heThong, heThongDiem, nguoiDung } = dungLoiNhac({
    capDo, rubric, luyenTap: b.che_do !== "exam", kt, deBai: chuThuan(b.deBai).slice(0, 2000),
    copie: chuThuan(b.copie).slice(0, 12000), tenBai: b.ten_bai,
  });
  const goi = (h, maxTok) => goiMoHinh({ model, khoa, heThong: h, nguoiDung, maxTok, effort: process.env.PE_AI_EFFORT || "low" });
  const cacLuot = [];
  const [l1, l2] = await Promise.all([goi(heThong, b.che_do === "exam" ? 2000 : 4000), co("--mot-luot") ? null : goi(heThongDiem, 600)]);
  for (const l of [l1, l2]) if (l?.ok) { cacLuot.push(l.tho); tokVao += l.vao; tokRa += l.ra; }
  let gop = gopDiemNhieuLuot(rubric, cacLuot);
  if (gop.can_luot_ba) {
    const l3 = await goi(heThongDiem, 600);
    if (l3.ok) { cacLuot.push(l3.tho); tokVao += l3.vao; tokRa += l3.ra; gop = gopDiemNhieuLuot(rubric, cacLuot); }
  }
  if (!gop.so_luot) { console.log(`  ✗ ${b.ten}: AI không trả điểm (${l1?.ma ?? "?"})`); continue; }
  const tongAi = lamTronBuoc(Object.values(gop.diem).reduce((n, x) => n + x, 0), 0.5);
  const tongNg = Object.values(b.nguoi).reduce((n, x) => n + Number(x || 0), 0);
  console.log(`  ${b.ten} (${capDo}, ${b.che_do === "exam" ? "thi thử" : "luyện tập"}): AI ${tongAi} · người ${tongNg} · lệch ${tongAi - tongNg >= 0 ? "+" : ""}${lamTronBuoc(tongAi - tongNg, 0.5)} · ${gop.so_luot} lượt${gop.chua_chac ? " · CHƯA CHẮC" : ""}`);
  ketQua.push({ ten: b.ten, ai: gop.diem, nguoi: b.nguoi });
}

const r = doLech(ketQua);
console.log(`\n══ KẾT QUẢ (${r.so_bai} bài) ══`);
console.log(`Lệch tuyệt đối trung bình (tổng): ${r.mae_tong} điểm`);
console.log(`Lệch trung bình (AI − người):     ${r.lech_tb_tong >= 0 ? "+" : ""}${r.lech_tb_tong}  (dương = AI chấm rộng tay hơn)`);
console.log(`Tỉ lệ bài lệch không quá 2,5 điểm: ${Math.round(r.trong_2_5 * 100)}%`);
console.log("\nTừng tiêu chí (số bài · lệch tuyệt đối TB · lệch TB):");
for (const [id, t] of Object.entries(r.tieu_chi).sort((a, b) => b[1].mae - a[1].mae)) {
  console.log(`  ${id.padEnd(14)} ${String(t.so).padStart(3)} · ${String(t.mae).padStart(5)} · ${t.lech_tb >= 0 ? "+" : ""}${t.lech_tb}`);
}
console.log(`\nToken: vào ${tokVao}, ra ${tokRa}.`);
process.exit(0);
