import { supabase } from "../storageShim.js";

/* Tiến độ Một năm ở Paris trên máy chủ (migration 175). Hàm ghi đối chiếu kết quả trả về trước khi
   báo xong; lỗi trả { loi } để MotNam giữ bản trên máy và gửi lại lần sau. */
const goi = async (ten, tham) => {
  try {
    const { data, error } = await supabase.rpc(ten, tham);
    return error ? { loi: error.message } : data;
  } catch (e) { return { loi: e.message }; }
};

export const khoMotNam = {
  doc: () => goi("mot_nam_doc"),
  async luu(van) {
    const r = await goi("mot_nam_luu", { p_van: van });
    if (r?.loi) return r;
    return (r?.luc ?? null) === (van?.luc ?? null) ? r : { loi: "Máy chủ chưa ghi ván chơi" };
  },
  async luuKet(ds) {
    const r = await goi("mot_nam_ket_luu", { p_ds: ds });
    if (r?.loi) return r;
    const lech = ds.find((x) => !r?.ket?.[x.ma]);
    return lech ? { loi: `Máy chủ chưa ghi kết cục ${lech.ma}` } : r;
  },
  async bangBan() {
    const r = await goi("mot_nam_bang_ban");
    return Array.isArray(r) ? r : null;
  },
};
