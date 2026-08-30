import { supabase } from "../storageShim.js";

/* Bản ghi âm phần nói (Production orale).
 *
 * ══ KHÔNG CÓ BẢNG NÀO CẢ ══
 *
 * Đường dẫn tự mang đủ thông tin:
 *
 *     <user_id>/<exam_id>/<exercise_id>-<mốc thời gian>.webm
 *
 * Nhờ vậy phân quyền chỉ cần so đoạn thư mục đầu với `auth.uid()` (policy ở
 * migration 057), và không có bảng phụ nào để lệch với kho file. Một bảng
 * `bai_noi` sẽ phải đồng bộ với danh sách file thật, và hai nguồn sự thật thì
 * sớm muộn nói khác nhau — file bị xoá mà dòng còn, hoặc ngược lại.
 *
 * Đánh đổi: không truy vấn được "bài nói nào chưa nghe". Chấp nhận được, vì
 * hướng C không chấm điểm nên chưa có gì để truy vấn.
 *
 * ══ KHÔNG CHẤM ĐIỂM ══
 *
 * Cố ý. DELF chấm phần nói bằng đối thoại với giám khảo; một app tự học không
 * mô phỏng được việc đó, và cho ra một con số là bịa. Ở đây bản ghi âm chỉ để
 * học sinh tự nghe lại, và để giáo viên nghe nếu muốn nhận xét. */

const KHO = "bai-noi";

/* Đuôi file suy từ MIME thật của bản ghi, không đoán cứng .webm.
 *
 * Trình duyệt chọn định dạng khác nhau: Chrome cho `audio/webm;codecs=opus`,
 * Safari cho `audio/mp4`. Đặt sai đuôi thì file vẫn tải lên được nhưng trình
 * phát từ chối, và triệu chứng là "ghi âm xong không nghe lại được" — rất khó
 * lần ra vì không có lỗi nào. */
const duoiTu = (mime) => {
  const m = String(mime || "").split(";")[0].trim();
  return { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a",
    "audio/mpeg": "mp3", "audio/wav": "wav" }[m] ?? "webm";
};

/* Danh sách MIME mà bucket nhận (migration 057). Kiểm ở client TRƯỚC khi tải
   lên: để server từ chối thì người dùng chờ hết cả file mới biết hỏng. */
const MIME_NHAN = ["audio/webm", "audio/ogg", "audio/mpeg", "audio/mp4", "audio/wav"];
export const mimeDungDuoc = (mime) =>
  MIME_NHAN.includes(String(mime || "").split(";")[0].trim());

export async function luuBaiNoi({ blob, examId, exerciseId }) {
  if (!blob || !blob.size) return { ok: false, loi: "trong" };
  if (!mimeDungDuoc(blob.type)) return { ok: false, loi: "dinh_dang", chiTiet: blob.type };

  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return { ok: false, loi: "chua_dang_nhap" };

  /* Mốc thời gian trong tên file, KHÔNG ghi đè bản cũ. Ghi đè là mất bản trước
     mà không ai biết; thêm file thì giữ được cả quá trình luyện tập — vốn là
     thứ có ích duy nhất khi không chấm điểm. */
  const ten = `${uid}/${examId ?? "khong-de"}/${exerciseId}-${Date.now()}.${duoiTu(blob.type)}`;

  const { error } = await supabase.storage.from(KHO)
    .upload(ten, blob, { contentType: blob.type, upsert: false });

  if (error) return { ok: false, loi: "mang", chiTiet: error.message };
  return { ok: true, duongDan: ten };
}

/* Đường nghe lại. Bucket RIÊNG TƯ nên không có URL công khai — phải xin một
   đường ký có hạn. Một giờ là đủ cho một phiên nghe lại, và đủ ngắn để một
   đường bị chép ra ngoài không sống mãi. */
export async function duongNghe(duongDan, giay = 3600) {
  if (!duongDan) return null;
  const { data, error } = await supabase.storage.from(KHO)
    .createSignedUrl(duongDan, giay);
  return error ? null : data?.signedUrl ?? null;
}

/* Những bản ghi của CHÍNH MÌNH cho một bài, mới nhất trước.
 *
 * Không nhận `userId` từ chỗ gọi: truyền id người khác vào thì đây thành cửa
 * nghe trộm. RLS vẫn chặn, nhưng một hàm mà chỉ RLS mới cứu được là một hàm
 * viết sai. */
export async function dsBaiNoi({ examId, exerciseId }) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase.storage.from(KHO)
    .list(`${uid}/${examId ?? "khong-de"}`, { limit: 100, sortBy: { column: "name", order: "desc" } });
  if (error) return [];

  return (data ?? [])
    .filter((f) => !exerciseId || f.name.startsWith(exerciseId + "-"))
    .map((f) => ({
      ten: f.name,
      duongDan: `${uid}/${examId ?? "khong-de"}/${f.name}`,
      bytes: f.metadata?.size ?? 0,
      /* Mốc thời gian nằm trong tên file — nguồn đáng tin hơn `created_at` của
         kho, vốn là lúc TẢI LÊN xong chứ không phải lúc ghi âm. */
      luc: Number((f.name.match(/-(\d{10,})\./) || [])[1]) || null,
    }));
}
