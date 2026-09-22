import { supabase } from "../storageShim.js";
import { onLai, xepLichOn, ngayCong } from "./sm2.js";
import { ngayHomNay } from "./hoatDong.js";

/* Thẻ ghi nhớ — lớp truy cập (migration 063/065).
 *
 * Phép tính lịch nằm ở `sm2.js`, thuần và có bộ kiểm riêng. File này chỉ nối
 * nó với database, và cố ý không chứa một phép tính nào — chỗ nào có công thức
 * thì chỗ đó phải kiểm được dưới node. */

/* Thẻ đến hạn hôm nay, kèm nội dung. Một lời gọi, không phải hai:
   PostgREST nhúng được bảng liên quan, và hai vòng mạng cho một màn hình chỉ
   để ghép id với nội dung là lãng phí thấy rõ. */
export async function docTheDenHan() {
  const { data, error } = await supabase
    .from("reviews")
    .select("card_id, due_at, interval_days, ease, lapses, reps, cards(front, back, kind, example_sentence, nguon, source_question_id)")
    .lte("due_at", ngayCong(0))
    .order("due_at", { ascending: true })
    .limit(100);

  /* Trả `null` khi KHÔNG ĐỌC ĐƯỢC, `[]` khi đọc được mà không có thẻ nào. Hai
     thứ đó phải hiện khác nhau: "hôm nay ôn xong rồi" là tin vui, "mất mạng"
     là chuyện phải xử lý. Gộp lại thành mảng rỗng là chúc mừng người vừa gặp
     sự cố. */
  if (error) return null;

  /* Vẫn lọc lại ở client dù đã `.lte` ở trên: `ngayCong(0)` là ngày ĐỊA
     PHƯƠNG, còn máy chủ so chuỗi — nên biên có thể lệch một ngày quanh nửa
     đêm. Lọc hai lần rẻ hơn nhiều so với một thẻ hiện sai ngày. */
  return xepLichOn(
    (data ?? []).map((r) => ({
      ...r,
      front: r.cards?.front ?? "",
      back: r.cards?.back ?? "",
      kind: r.cards?.kind ?? "mot",
      viDu: r.cards?.example_sentence ?? "",
      nguon: r.cards?.nguon ?? "loi_sai",
      questionId: r.cards?.source_question_id ?? null,
    })),
  );
}

/* Bao nhiêu thẻ đến hạn — cho ô trên trang chủ. `head: true` nên chỉ tải về
   con số, không tải nội dung thẻ nào. */
export async function demTheDenHan() {
  const { count, error } = await supabase
    .from("reviews")
    .select("card_id", { count: "exact", head: true })
    .lte("due_at", ngayCong(0));
  return error ? null : (count ?? 0);
}

/* Sinh thẻ từ những câu đã làm sai. Máy chủ tự đọc `answers`; client không gửi
   nội dung nào lên — nó không được phép tự khai mình sai câu gì. */
export async function sinhTheTuLoiSai(gioiHan = 20) {
  const { data, error } = await supabase.rpc("tao_the_tu_lo_hong", { p_gioi_han: gioiHan });
  if (error) return { ok: false, loi: error.message };
  return { ok: true, soThe: Number(data) || 0 };
}

/* Ghi kết quả một lần ôn.
 *
 * ĐỌC KẾT QUẢ TRẢ VỀ. Đây là lần thứ năm dự án chạm vào cùng một cái bẫy
 * (saveExam, saveExercise, sendAnnonce, guiThongBao) — báo thành công cho một
 * việc chưa làm. Ở đây hậu quả kín hơn mọi lần trước: thẻ biến mất khỏi màn
 * hình vì giao diện tự gỡ nó, người học tin là đã ôn xong, và ngày mai nó
 * quay lại y nguyên mà không ai hiểu vì sao. */
/* Ghi một lần ôn — và KIỂM BIÊN NHẬN trước khi nói đã xong.
 *
 * Trước 22/09 hàm này gọi `ghi_lan_on`, trả `void`, và coi "không có lỗi" là
 * "đã lưu". Đo được: ba lần bấm « Tốt » nhận 204, màn hình lật thẻ, database
 * không đổi một dòng — n_tup_upd của reviews đứng yên. Một 204 rỗng trông y
 * hệt nhau dù hàng có được sửa hay không, nên "không lỗi" không chứng minh gì.
 *
 * `cham_the` (migration 091) trả biên nhận: uid máy chủ thấy, số dòng đã sửa,
 * reps sau khi sửa. Không khớp với thứ ta vừa gửi thì BÁO LỖI, kèm nguyên biên
 * nhận để người dùng dán lại được. Đọc kết quả trước khi nói đã xong — lần thứ
 * sáu trong dự án, và lần đầu tiên nó bắt được một lỗi đang sống. */
export async function chamThe(the, q, moc = new Date()) {
  const moi = onLai(the, q, moc);
  const { data, error } = await supabase.rpc("cham_the", {
    p_card_id: the.card_id,
    p_due_at: moi.due_at,
    p_interval_days: moi.interval_days,
    p_ease: moi.ease,
    p_reps: moi.reps,
    p_lapses: moi.lapses,
  });
  if (error) return { ok: false, loi: error.message };

  const khop = data?.ok === true && data?.so_dong === 1 && data?.reps_sau === moi.reps;
  if (!khop) {
    return {
      ok: false,
      loi: "máy chủ trả về nhưng không xác nhận đã lưu — "
        + JSON.stringify(data ?? null),
    };
  }
  return { ok: true, moi, bienNhan: data };
}

/* Sai lại một câu đã có thẻ → kéo thẻ về hôm nay thay vì đẻ thẻ mới.
   Nuốt lỗi có chủ đích: đây là việc phụ chạy sau khi chấm bài, và không được
   phép làm đổ đường chính. */
export async function datLaiTheSai(questionIds) {
  const ds = [...new Set((questionIds ?? []).filter(Boolean))];
  for (const id of ds) {
    try { await supabase.rpc("dat_lai_the_sai", { p_question_id: id }); } catch { /* việc phụ */ }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   THẺ TỰ TẠO (migration 073)
   ══════════════════════════════════════════════════════════════════════════ */

export const HAN_MUC_NGAY = 10;

/* Đã tạo mấy thẻ hôm nay. Gọi TRƯỚC khi người ta gõ, để hiện « 3/10 » ngay —
   bắt viết xong cả thẻ rồi mới báo hết hạn mức là phí công của họ.
   `null` = không đọc được, khác hẳn số 0. */
export async function demTheTuViet() {
  const { data, error } = await supabase.rpc("dem_the_tu_viet", { p_ngay: ngayHomNay() });
  return error ? null : Number(data) || 0;
}

/* Tạo một thẻ. Ngày gửi từ client vì "hôm nay" là ngày của NGƯỜI DÙNG, không
   phải của máy chủ chạy UTC — xem chú thích trong 073. */
export async function taoTheTuViet({ front, back, viDu }) {
  const { data, error } = await supabase.rpc("tao_the_tu_viet", {
    p_front: front, p_back: back, p_example: viDu || null, p_ngay: ngayHomNay(),
  });
  if (error) {
    /* Hết hạn mức KHÔNG phải sự cố: thử lại sẽ không bao giờ thành công cho
       tới sáng mai, nên nó phải có câu chữ riêng chứ không phải "thử lại sau". */
    if (/DAILY_LIMIT_REACHED/.test(error.message || "")) return { ok: false, loi: "het_han_muc" };
    if (error.code === "22023") return { ok: false, loi: "trong" };
    if (error.code === "22001") return { ok: false, loi: "qua_dai" };
    if (error.code === "42501") return { ok: false, loi: "chua_dang_nhap" };
    return { ok: false, loi: "mang", chiTiet: error.message };
  }
  const d = Array.isArray(data) ? data[0] : data;
  return { ok: true, cardId: d?.card_id ?? null, conLai: Number(d?.con_lai ?? 0) };
}
