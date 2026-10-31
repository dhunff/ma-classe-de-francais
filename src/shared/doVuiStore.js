import { supabase } from "../storageShim.js";

/* Tiến độ Đố vui nước Pháp trên máy chủ (migration 176). Hàm ghi đối chiếu kết quả trả về trước khi
   báo xong; lỗi trả { loi } để DoVui giữ bản trên máy và gửi lại lần sau. */
const goi = async (ten, tham) => {
  try {
    const { data, error } = await supabase.rpc(ten, tham);
    return error ? { loi: error.message } : data;
  } catch (e) { return { loi: e.message }; }
};

export const khoDoVui = {
  doc: () => goi("do_vui_doc"),
  async luu(van) {
    const r = await goi("do_vui_luu", { p_van: van });
    if (r?.loi) return r;
    return (r?.luc ?? null) === (van?.luc ?? null) ? r : { loi: "Máy chủ chưa ghi ván chơi" };
  },
  async luuTem(ds) {
    const r = await goi("do_vui_tem_luu", { p_ds: ds });
    if (r?.loi) return r;
    const lech = ds.find((x) => (r?.tem?.[x.noi] ?? -1) < x.diem);
    return lech ? { loi: `Máy chủ chưa ghi tem ${lech.noi}` } : r;
  },
};
