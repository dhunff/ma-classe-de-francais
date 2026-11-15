/* PvP cho mọi trò chơi nhanh (15/11, migration 214). Người thách chơi trước với một hạt giống,
 * nộp điểm thì trận mới được tạo và bạn nhận thông báo; bạn chơi lại đúng hạt giống đó rồi nộp.
 * Điểm do trình duyệt báo (xem chú thích trong migration). */
import { supabase } from "../storageShim.js";

const ma = (e) => {
  const m = String(e?.message ?? e ?? "");
  for (const k of ["CHUA_THEO_DOI", "KHONG_TU_THACH_MINH", "DAILY_LIMIT_REACHED", "DA_NOP", "KHONG_CO_QUYEN", "SAI_DU_LIEU", "CHUA_DANG_NHAP"]) if (m.includes(k)) return k;
  if (e?.code === "PGRST202") return "CHUA_CO_HAM";
  return m || "LOI";
};

export async function dsDauTroChoi() {
  const { data, error } = await supabase.rpc("ds_dau_tro_choi");
  if (error) return error.code === "PGRST202" ? [] : null;
  return Array.isArray(data) ? data : [];
}

export async function taoDauTroChoi({ doi, troChoi, muc, kieu, vu, hat, diem, dung, tong }) {
  const { data, error } = await supabase.rpc("tao_dau_tro_choi", {
    p_doi: doi, p_tro_choi: troChoi, p_muc: muc, p_kieu: kieu ?? null, p_vu: vu ?? null, p_hat: hat,
    p_diem: diem, p_dung: dung, p_tong: Math.max(1, tong),
  });
  return error ? { loi: ma(error) } : { id: data };
}

export async function nopDauTroChoi(id, { diem, dung, tong }) {
  const { data, error } = await supabase.rpc("nop_dau_tro_choi", { p_id: id, p_diem: diem, p_dung: dung, p_tong: Math.max(1, tong) });
  return error ? { loi: ma(error) } : data;
}

/* "thang" | "thua" | "hoa" | null (bạn chưa chơi). Điểm cao hơn thắng, bằng điểm thì đúng nhiều hơn. */
export function ketCucDau(d) {
  if (!d?.xong || d.diem_doi == null) return null;
  const toi = d.toi_moi ? [d.diem_moi, d.dung_moi] : [d.diem_doi, d.dung_doi];
  const ho = d.toi_moi ? [d.diem_doi, d.dung_doi] : [d.diem_moi, d.dung_moi];
  if (toi[0] !== ho[0]) return toi[0] > ho[0] ? "thang" : "thua";
  if (toi[1] !== ho[1]) return toi[1] > ho[1] ? "thang" : "thua";
  return "hoa";
}

export const loiDau = (m) => ({
  CHUA_THEO_DOI: ["Bạn cần theo dõi người này trước khi thách đấu.", "Suivez d'abord cette personne.", "Follow this person first."],
  KHONG_TU_THACH_MINH: ["Không thể tự thách chính mình.", "Impossible de se défier soi-même.", "You can't challenge yourself."],
  DAILY_LIMIT_REACHED: ["Bạn đã gửi đủ 30 lời thách trong 24 giờ. Thử lại sau nhé.", "30 défis en 24 h : réessayez plus tard.", "30 challenges in 24 h: try again later."],
  DA_NOP: ["Bạn đã nộp điểm trận này rồi.", "Score déjà envoyé pour ce duel.", "You already submitted this duel."],
  KHONG_CO_QUYEN: ["Trận này không dành cho bạn.", "Ce duel ne vous est pas destiné.", "This duel isn't yours."],
  CHUA_CO_HAM: ["Máy chủ chưa bật tính năng đấu (thiếu migration 214).", "Le serveur n'a pas encore les duels (migration 214).", "Server lacks duels (migration 214)."],
}[m]);
