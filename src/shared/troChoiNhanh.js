/* Dữ liệu cho ba trò chơi nhanh (27/10, migration 168).
 * Câu hỏi dựng ở client từ kho có sẵn: lo_trinh_tu (từ vựng Lộ trình, có loại từ và
 * mạo từ) và cau_luyen (câu có audio của Nghe & Nói). Không soạn nội dung mới. */
import { supabase } from "../storageShim.js";
import { docLoTrinh } from "./loTrinhStore.js";

export const CAP_CHOI = ["A1", "A2", "B1", "B2"];
export const tron = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* Từ vựng Lộ trình kèm trình độ của màn chứa nó. Nhớ một lần cho cả phiên. */
let tuVungHua = null;
export function docTuVung() {
  if (!tuVungHua) {
    tuVungHua = docLoTrinh().then((lt) => {
      if (!lt) { tuVungHua = null; return null; }
      return lt.chuDe.flatMap((cd) => cd.man.flatMap((m) => m.tu.map((t) => ({ fr: t.matTruoc, vi: t.matSau, loai: t.loai, cap: m.cap, chuDe: cd.id }))));
    }, () => { tuVungHua = null; return null; });
  }
  return tuVungHua;
}

/* Giống đực / giống cái: chỉ danh từ mở đầu bằng « le » / « la ». Bỏ « l' » (không
 * nhìn ra giống) và « les ». Trả { tu: phần sau mạo từ, mao: "le"|"la", vi }. */
export async function docDanhTuGioi(cap) {
  const ds = await docTuVung();
  if (!ds) return null;
  const ra = [];
  const daCo = new Set();
  for (const t of ds) {
    if (t.loai !== "n" || (cap && t.cap !== cap)) continue;
    const m = /^(le|la)\s+(.+)$/i.exec(String(t.fr).trim());
    if (!m || daCo.has(m[2].toLowerCase())) continue;
    daCo.add(m[2].toLowerCase());
    ra.push({ tu: m[2], mao: m[1].toLowerCase(), vi: t.vi });
  }
  return tron(ra);
}

/* Mưa chữ: từ tiếng Pháp + 3 nghĩa nhiễu CÙNG loại từ (cùng chủ đề nếu đủ). */
export async function docMuaChu(cap) {
  const ds = await docTuVung();
  if (!ds) return null;
  const kho = ds.filter((t) => !cap || t.cap === cap);
  return { kho: tron(kho), tatCa: ds };
}
export function phuongAnNghia(tu, tatCa) {
  const cung = tatCa.filter((x) => x.loai === tu.loai && x.vi !== tu.vi);
  const uuTien = tron(cung.filter((x) => x.chuDe === tu.chuDe));
  const nhieu = [];
  for (const x of [...uuTien, ...tron(cung)]) { if (nhieu.length === 3) break; if (!nhieu.some((y) => y.vi === x.vi)) nhieu.push(x); }
  return tron([tu.vi, ...nhieu.map((x) => x.vi)]);
}

/* Nghe và chọn: câu có audio. Nhiễu là câu cùng trình độ, độ dài gần nhất. */
export async function docCauNghe(cap, loai = ["chinh_ta", "phat_am"]) {
  let q = supabase.from("cau_luyen").select("id, loai, cap, cau, nghia, meo, audio_url").eq("cong_khai", true)
    .in("loai", loai).not("audio_url", "is", null);
  if (cap) q = q.eq("cap", cap);
  const { data, error } = await q.limit(1000);
  if (error) return null;
  return tron((data ?? []).filter((c) => c.audio_url && c.cau));
}
export function phuongAnCau(cau, kho) {
  const khac = kho.filter((c) => c.id !== cau.id && c.cau !== cau.cau)
    .map((c) => ({ c, d: Math.abs(c.cau.length - cau.cau.length) + Math.random() * 6 }))
    .sort((a, b) => a.d - b.d).map((x) => x.c.cau);
  return tron([cau.cau, ...[...new Set(khac)].slice(0, 3)]);
}

/* ─── Ba trò ngữ pháp (27/10, migration 169): câu lấy từ bài « Học ngữ pháp »
   (src/content/nguPhap), đã áp bản giáo viên sửa / ẩn (napSuaNguPhap). ─── */
const tachTu = (x) => String(x ?? "").trim().split(/\s+/).filter(Boolean);
let nguPhapHua = null;
async function docCauNguPhap() {
  if (!nguPhapHua) {
    nguPhapHua = (async () => {
      const m = await import("../content/nguPhap/index.js");
      try { await m.napSuaNguPhap(supabase); } catch { /* không đọc được bản sửa: dùng bản gốc */ }
      return m.TAT_CA.flatMap((b) => m.chiaPhan(b).flatMap((p) => (p.cau ?? []).filter(Boolean)
        .map((c) => ({ ...c, cap: b.cap === "A0" ? "A1" : b.cap, bai: b.ten }))));
    })().catch(() => { nguPhapHua = null; return null; });
  }
  return nguPhapHua;
}

/* Xếp câu: câu « sap » có ≥3 từ, bỏ câu đánh vần (toàn chữ cái lẻ). */
export async function docXepCau(cap) {
  const ds = await docCauNguPhap(); if (!ds) return null;
  return tron(ds.filter((c) => c.loai === "sap" && (!cap || c.cap === cap)).map((c) => ({ goiY: c.goiY ?? c.de, tu: tachTu(c.dap?.[0]), giai: c.giai }))
    .filter((c) => c.tu.length >= 3 && c.tu.length <= 12 && !c.tu.every((w) => w.length === 1)));
}
/* Săn lỗi: câu « sua » khác bản đúng ĐÚNG MỘT từ, cùng số từ. */
export async function docSanLoi(cap) {
  const ds = await docCauNguPhap(); if (!ds) return null;
  const ra = [];
  for (const c of ds) {
    if (c.loai !== "sua" || (cap && c.cap !== cap)) continue;
    const sai = tachTu(c.de), dung = tachTu(c.dap?.[0]);
    if (sai.length !== dung.length || sai.length < 3) continue;
    const lech = sai.map((w, i) => (w !== dung[i] ? i : -1)).filter((i) => i >= 0);
    if (lech.length === 1) ra.push({ tu: sai, vt: lech[0], sua: dung[lech[0]], dung: c.dap[0], giai: c.giai });
  }
  return tron(ra);
}
/* Đúng hay sai: câu « vf » có sẵn, cộng câu « sua » hiện ngẫu nhiên bản sai hoặc bản đúng. */
export async function docDungSai(cap) {
  const ds = await docCauNguPhap(); if (!ds) return null;
  const ra = [];
  for (const c of ds) {
    if (cap && c.cap !== cap) continue;
    if (c.loai === "vf") ra.push({ cau: c.de, dung: !!c.dung, giai: c.giai, kieu: "vf" });
    else if (c.loai === "sua" && c.dap?.[0]) {
      const laDung = Math.random() < 0.5;
      ra.push({ cau: laDung ? c.dap[0] : c.de, dung: laDung, giai: laDung ? "" : `${c.dap[0]}. ${c.giai ?? ""}`, kieu: "sua" });
    }
  }
  return tron(ra);
}

export async function ghiTroChoi(ma, diem, dung, tong) {
  const { data, error } = await supabase.rpc("ghi_tro_choi", { p_tro_choi: ma, p_diem: diem, p_dung: dung, p_tong: tong });
  if (error) return { loi: error.message };
  return data;
}

export async function docKyLuc() {
  const { data } = await supabase.from("tro_choi_luot").select("tro_choi, diem").order("diem", { ascending: false }).limit(300);
  const kl = {};
  for (const r of data ?? []) if (kl[r.tro_choi] == null) kl[r.tro_choi] = r.diem;
  return kl;
}
