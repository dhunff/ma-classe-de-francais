import { supabase } from "../storageShim.js";

/* Tiến độ Phiên toà trên máy chủ (migration 177). Hàm ghi đối chiếu kết quả trả về trước khi báo xong;
   lỗi trả { loi } để PhienToa giữ bản trên máy và gửi lại lần sau. */
const goi = async (ten, tham) => {
  try {
    const { data, error } = await supabase.rpc(ten, tham);
    return error ? { loi: error.message } : data;
  } catch (e) { return { loi: e.message }; }
};

export const khoPhienToa = {
  doc: () => goi("phien_toa_doc"),
  async luu(van) {
    const r = await goi("phien_toa_luu", { p_van: van });
    if (r?.loi) return r;
    return (r?.luc ?? null) === (van?.luc ?? null) ? r : { loi: "Máy chủ chưa ghi phiên dở" };
  },
  async luuKet(ds) {
    const r = await goi("phien_toa_ket_luu", { p_ds: ds });
    if (r?.loi) return r;
    const lech = ds.find((x) => !r?.vu?.[x.vu]);
    return lech ? { loi: `Máy chủ chưa ghi vụ ${lech.vu}` } : r;
  },
};
