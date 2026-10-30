import { supabase } from "../storageShim.js";

/* Tiến độ Thám tử Léon trên máy chủ (migration 173). Hàm ghi trả lại trạng thái sau khi ghi và
   đối chiếu trước khi báo xong; lỗi trả { loi } để ThamTu giữ bản trên máy và gửi lại lần sau. */
const goi = async (ten, tham) => {
  try {
    const { data, error } = await supabase.rpc(ten, tham);
    return error ? { loi: error.message } : data;
  } catch (e) { return { loi: e.message }; }
};

export const khoThamTu = {
  doc: () => goi("tham_tu_doc"),
  async luu(ds) {
    const r = await goi("tham_tu_luu", { p_ds: ds });
    if (r?.loi) return r;
    const lech = ds.find((x) => (r?.vu?.[x.vu]?.diem ?? -1) < x.diem);
    return lech ? { loi: `Máy chủ chưa ghi hồ sơ ${lech.vu}` } : r;
  },
  async luuChon(ma, gt) {
    const r = await goi("tham_tu_chon_luu", { p_ma: ma, p_gt: gt });
    if (r?.loi) return r;
    return r?.chon?.[ma] === gt ? r : { loi: `Máy chủ chưa ghi lựa chọn ${ma}` };
  },
  async bangHang() {
    const r = await goi("tham_tu_bang_hang");
    return Array.isArray(r) ? r : null;
  },
};
