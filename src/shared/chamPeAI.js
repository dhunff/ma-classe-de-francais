import { supabase } from "../storageShim.js";
import { loiTranVip } from "./loiTranVip.js";
import { baoHetLuot } from "./HetLuot.jsx";

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
  SAI_TRINH_DO: "Thang chấm không khớp trình độ của bài. Tải lại trang (Ctrl+F5) rồi thử lại.",
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
  void gio;
  return `Bạn đã dùng hết ${d?.han_muc ?? 3} lượt AI chấm hôm nay. Lượt mới mở lúc 0 giờ; gói VIP tới 100 lượt AI/ngày.`;
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
    if (ma === "HET_LUOT") baoHetLuot({ loai: "pe", hanMuc: than?.han_muc, cuaSoGio: than?.cua_so_gio });
    return {
      ok: false,
      ma,
      thongBao: ma === "HET_LUOT_VIP" ? loiTranVip() : ma === "HET_LUOT" ? noiHetLuot(than)
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

/* Nhận xét câu viết tự do ở màn Luyện tập (06/11): không điểm, có lỗi tô trong bài và đối chiếu
   yêu cầu của đề. Máy chủ tìm câu trả lời theo lượt làm + câu hỏi, đọc bài từ database. */
/* Bản 2 (06/11): CÓ điểm. `rubric` là thang DELF của trình độ bài (grilleToRubric); máy chủ kiểm
   thang cùng trình độ với bài trong database rồi mới chấm. */
export async function xinNhanXetLuyen(attemptId, questionId, rubric) {
  if (!attemptId || !questionId) return { ok: false, ma: "THIEU_THAM_SO", thongBao: "Bài này chưa được lưu nên chưa chấm được." };
  const { data, error } = await supabase.functions.invoke("cham-pe", { body: { luyenTap: true, attemptId, questionId, rubric } });
  if (error) {
    let than = null;
    try { than = await error.context?.json?.(); } catch { /* không đọc được thì thôi */ }
    const ma = than?.ma ?? "KHONG_RO";
    if (ma === "HET_LUOT") baoHetLuot({ loai: "pe", hanMuc: than?.han_muc, cuaSoGio: than?.cua_so_gio });
    return { ok: false, ma, thongBao: ma === "HET_LUOT_VIP" ? loiTranVip() : ma === "HET_LUOT" ? noiHetLuot(than)
      : (CAU[ma] ?? than?.thong_bao ?? "Chưa chấm được bài lúc này. Thử lại sau ít phút.") };
  }
  if (!data?.ok) return { ok: false, ma: data?.ma ?? "KHONG_RO", thongBao: CAU[data?.ma] ?? "Chưa chấm được bài." };
  return { ok: true, goiY: data.goi_y, goiYId: data.goi_y_id ?? null, conLai: data.con_lai };
}

/* ── Khiếu nại điểm AI (06/11, giai đoạn 2, migration 196) ──
   Một phiếu một khiếu nại. Giáo viên xem ở /professeur/khieu-nai-diem. */
const CAU_KHIEU_NAI = {
  SAI_DU_LIEU: "Lý do cần từ 5 đến 1000 ký tự.",
  KHONG_THAY_PHIEU: "Không tìm thấy phiếu chấm này.",
  HET_LUOT_KHIEU_NAI: "Bạn đã gửi 5 khiếu nại trong 24 giờ qua. Thử lại sau nhé.",
  CHUA_DANG_NHAP: "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.",
};
export async function guiKhieuNai(goiYId, lyDo, tieuChi = []) {
  const { data, error } = await supabase.rpc("gui_khieu_nai", { p_goi_y: goiYId, p_ly_do: lyDo, p_tieu_chi: tieuChi });
  if (error) {
    const ma = Object.keys(CAU_KHIEU_NAI).find((k) => String(error.message ?? "").includes(k));
    return { ok: false, thongBao: CAU_KHIEU_NAI[ma] ?? "Chưa gửi được khiếu nại. Thử lại sau ít phút." };
  }
  return { ok: !!data?.ok, id: data?.id };
}
/* Phần NÓI thi thử (giai đoạn 5, migration 198): khiếu nại khoá theo lượt thi (po_cham). */
export async function guiKhieuNaiPO(attemptId, lyDo, tieuChi = []) {
  const { data, error } = await supabase.rpc("gui_khieu_nai_po", { p_attempt: attemptId, p_ly_do: lyDo, p_tieu_chi: tieuChi });
  if (error) {
    const ma = Object.keys(CAU_KHIEU_NAI).find((k) => String(error.message ?? "").includes(k));
    return { ok: false, thongBao: CAU_KHIEU_NAI[ma] ?? "Chưa gửi được khiếu nại. Thử lại sau ít phút." };
  }
  return { ok: !!data?.ok };
}
export async function docKhieuNaiPO(attemptId) {
  if (!attemptId) return null;
  const { data } = await supabase.from("po_khieu_nai")
    .select("trang_thai, ly_do, tieu_chi, tong_gv, diem_gv, ghi_chu_gv, tao_luc, xu_ly_luc")
    .eq("attempt_id", attemptId).maybeSingle();
  return data ?? null;
}
export async function docKhieuNai(goiYId) {
  if (!goiYId) return null;
  const { data } = await supabase.from("pe_khieu_nai")
    .select("id, trang_thai, ly_do, tieu_chi, tong_gv, diem_gv, ghi_chu_gv, tao_luc, xu_ly_luc")
    .eq("goi_y_id", goiYId).maybeSingle();
  return data ?? null;
}

/* Đọc gợi ý đã xin trước đó. Trả `null` khi CHƯA có, và `undefined` khi KHÔNG
   ĐỌC ĐƯỢC — hai chuyện khác nhau, và gộp chúng lại là nói "chưa xin bao giờ"
   cho một lần mất mạng. Cùng lỗi mà màn « Đăng ký tư vấn » đã dính hai lần. */
export async function docGoiYAI(answerId) {
  if (!answerId) return null;
  const { data, error } = await supabase.rpc("doc_goi_y_ai", { p_answer: answerId });
  if (error) return undefined;
  return data?.co ? { id: data.id ?? null, goiY: data.ket_qua, model: data.model, luc: data.luc } : null;
}

/* AI chấm CHÍNH THỨC phần viết của bài thi thử (08/10): máy chủ ghi thẳng
   answers.score + nhận xét. Chỉ dùng cho câu chưa có điểm. */
export async function chamChinhThuc(answerId, rubric) {
  const { data, error } = await supabase.functions.invoke("cham-pe", { body: { answerId, rubric, chinhThuc: true } });
  if (error) {
    let than = null;
    try { than = await error.context?.json?.(); } catch { /* bỏ qua */ }
    return { ok: false, ma: than?.ma ?? "KHONG_RO" };
  }
  return { ok: !!data?.ok, daGhi: data?.da_ghi_diem === true || data?.chinh_thuc === true };
}
