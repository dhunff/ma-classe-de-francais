import { supabase } from "../storageShim.js";
import { onLai, xepLichOn, ngayCong } from "./sm2.js";

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
    .select("card_id, due_at, interval_days, ease, lapses, reps, cards(front, back, kind)")
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
    (data ?? []).map((r) => ({ ...r, front: r.cards?.front ?? "", back: r.cards?.back ?? "",
      kind: r.cards?.kind ?? "mot" })),
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
export async function chamThe(the, q, moc = new Date()) {
  const moi = onLai(the, q, moc);
  const { error } = await supabase.rpc("ghi_lan_on", {
    p_card_id: the.card_id,
    p_due_at: moi.due_at,
    p_interval_days: moi.interval_days,
    p_ease: moi.ease,
    p_reps: moi.reps,
    p_lapses: moi.lapses,
  });
  if (error) return { ok: false, loi: error.message };
  return { ok: true, moi };
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
