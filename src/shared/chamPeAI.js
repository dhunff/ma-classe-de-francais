import { supabase } from "../storageShim.js";

/* Xin gợi ý chấm Production écrite từ AI.
 *
 * Vỏ mỏng quanh Edge Function `cham-pe`. Mọi phép kiểm thật — quyền, hạn mức,
 * khuôn dữ liệu mô hình trả về — đều ở máy chủ; xem supabase/functions/cham-pe.
 * File này chỉ dịch mã lỗi thành câu người đọc được.
 *
 * ══ VÌ SAO MỖI MÃ LỖI MỘT CÂU RIÊNG ══
 *
 * Gộp hết thành "Có lỗi xảy ra, thử lại sau" thì ba tình huống khác hẳn nhau
 * bị đối xử như một:
 *
 *   · HET_LUOT          — thử lại sẽ KHÔNG thành công cho tới nhiều giờ nữa
 *   · CHUA_CAU_HINH_KHOA— thử lại không bao giờ thành công; đây là việc của
 *                         người vận hành, không phải của học sinh
 *   · AI_TRA_LOI_LOI    — thử lại có thể được ngay
 *
 * Bảo người ta "thử lại sau" trong hai trường hợp đầu là mời họ bấm thêm vài
 * lần rồi kết luận sản phẩm hỏng. Cùng bài học với DAILY_LIMIT_REACHED ở thẻ
 * tự tạo (migration 073).
 */

const CAU = {
  CHUA_DANG_NHAP: "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.",
  CHUA_CAU_HINH_KHOA:
    "Tính năng gợi ý chưa được bật trên máy chủ. Đây là việc của người quản trị "
    + "— bạn có thử lại bao nhiêu lần cũng vậy.",
  KHONG_THAY_BAI: "Không tìm thấy bài viết này.",
  KHONG_PHAI_TU_LUAN: "Chỉ bài tự luận mới xin gợi ý được.",
  CHUA_NOP: "Bài chưa nộp nên chưa xin gợi ý được.",
  BAI_QUA_NGAN: "Bài quá ngắn để chấm.",
  AI_TRA_VE_KHONG_PHAI_JSON:
    "Máy chấm trả về dữ liệu không đọc được. Thử lại một lần nữa.",
  AI_TRA_VE_SAI_KHUON:
    "Máy chấm trả về kết quả không khớp thang điểm, nên bị bỏ. Thử lại một lần nữa.",
  KHONG_GOI_DUOC: "Không kết nối được tới máy chấm. Kiểm tra mạng rồi thử lại.",
};

/* Giờ thành câu chữ. `Math.ceil` chứ không `round`: nói "1 giờ nữa" cho một
   khoảng còn 1 giờ 40 phút là hẹn sai, và người ta sẽ quay lại đúng lúc vẫn
   chưa được. */
const noiHetLuot = (d) => {
  const gio = Number(d?.cua_so_gio) || 24;
  return `Bạn đã dùng hết ${d?.han_muc ?? "số"} lượt gợi ý trong ${gio} giờ qua. `
    + "Lượt mới mở lại dần khi các lượt cũ quá hạn.";
};

/**
 * @returns {Promise<{ok:true, goiY, bo, model, daLuu, conLai}
 *                  | {ok:false, ma:string, thongBao:string}>}
 */
export async function xinGoiYAI(answerId, rubric) {
  if (!answerId) return { ok: false, ma: "THIEU_THAM_SO", thongBao: "Thiếu mã bài viết." };

  const { data, error } = await supabase.functions.invoke("cham-pe", {
    body: { answerId, rubric },
  });

  /* `functions.invoke` coi mọi mã ngoài 2xx là lỗi và KHÔNG trả body ra
     `data` — nên thân phản hồi (nơi có `ma` và `thong_bao`) nằm trong
     `error.context`. Bỏ qua chỗ này thì mọi lỗi có chủ đích của máy chủ, kể cả
     "hết lượt", đều tụt xuống thành một câu chung chung. */
  if (error) {
    let than = null;
    try { than = await error.context?.json?.(); } catch { /* không đọc được thì thôi */ }
    const ma = than?.ma ?? "KHONG_RO";
    return {
      ok: false,
      ma,
      thongBao: ma === "HET_LUOT" ? noiHetLuot(than)
        : (CAU[ma] ?? than?.thong_bao ?? "Không xin được gợi ý. Thử lại sau ít phút."),
    };
  }

  if (!data?.ok) {
    const ma = data?.ma ?? "KHONG_RO";
    return { ok: false, ma, thongBao: CAU[ma] ?? "Không xin được gợi ý." };
  }

  return {
    ok: true,
    goiY: data.goi_y,
    bo: data.bo ?? [],
    model: data.model,
    daLuu: data.da_luu !== false,
    conLai: data.con_lai,
  };
}

/* Đọc gợi ý đã xin trước đó. Trả `null` khi CHƯA có, và `undefined` khi KHÔNG
   ĐỌC ĐƯỢC — hai chuyện khác nhau, và gộp chúng lại là nói "chưa xin bao giờ"
   cho một lần mất mạng. Cùng lỗi mà màn « Đăng ký tư vấn » đã dính hai lần. */
export async function docGoiYAI(answerId) {
  if (!answerId) return null;
  const { data, error } = await supabase.rpc("doc_goi_y_ai", { p_answer: answerId });
  if (error) return undefined;
  return data?.co ? { goiY: data.ket_qua, model: data.model, luc: data.luc } : null;
}
