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

/* ══════════════════════════════════════════════════════════════════════════
   PHÍA GIÁO VIÊN
   ══════════════════════════════════════════════════════════════════════════

   Không có bảng nào, nên không truy vấn được — phải DUYỆT cây thư mục:

       bai-noi/<user_id>/<exam_id>/<exercise_id>-<mốc>.webm

   Ba tầng, ba lượt `list()`. Đắt hơn một câu SQL, và đó là cái giá đã chọn khi
   quyết định không dựng bảng phụ (xem đầu file). Đắt ở đây nghĩa là vài chục
   lượt gọi cho một lớp vài chục em — chấp nhận được cho một màn hình giáo viên
   mở vài lần một tuần, và rẻ hơn nhiều so với một bảng lệch với kho file.

   Nếu lớp lớn tới mức chậm thấy rõ thì lúc đó mới dựng bảng — chứ không phải
   dựng trước cho một vấn đề chưa có.

   RLS cho phép giáo viên đọc MỌI file trong kho (policy `bai_noi_giao_vien_doc`).
   Với học sinh, cùng đoạn mã này chỉ thấy thư mục của chính họ — nên hàm không
   cần tự kiểm vai, nhưng cũng không được dựa vào đó: giao diện gọi nó nằm sau
   `RequireRole role="prof"`. */

/* Đọc một tầng thư mục. Trả về [] khi lỗi thay vì ném — một thư mục hỏng không
   được làm mất cả danh sách. */
async function _liet(duong, gioiHan = 100) {
  const { data, error } = await supabase.storage.from(KHO)
    .list(duong, { limit: gioiHan, sortBy: { column: "name", order: "asc" } });
  return error ? [] : (data ?? []);
}

/* `list()` trả cả file lẫn thư mục. Thư mục KHÔNG có `id` — đó là cách duy
   nhất phân biệt, vì tên thư mục cũng có thể trông như tên file. */
const _laThuMuc = (x) => x && x.id == null;

export async function dsBaiNoiMoiNguoi({ toiDaHocSinh = 60 } = {}) {
  const nguoi = (await _liet("", toiDaHocSinh)).filter(_laThuMuc);
  const ra = [];

  for (const n of nguoi) {
    const uid = n.name;
    const deThi = (await _liet(uid, 50)).filter(_laThuMuc);
    const bai = [];

    for (const d of deThi) {
      for (const f of await _liet(`${uid}/${d.name}`, 100)) {
        if (_laThuMuc(f)) continue;
        bai.push({
          ten: f.name,
          examId: d.name,
          duongDan: `${uid}/${d.name}/${f.name}`,
          bytes: f.metadata?.size ?? 0,
          /* Mốc lấy từ TÊN FILE, không từ `created_at`: created_at là lúc tải
             lên xong, lệch với lúc ghi âm khi mạng chậm. */
          luc: Number((f.name.match(/-(\d{10,})\./) || [])[1]) || null,
        });
      }
    }

    /* Thư mục rỗng vẫn hiện được ở `list()` sau khi file bị dọn tay. Bỏ qua —
       "học sinh này có 0 bài" và "học sinh này chưa từng ghi" trông giống nhau
       trên màn hình mà chỉ cái sau là thật. */
    if (!bai.length) continue;

    bai.sort((a, b) => (b.luc ?? 0) - (a.luc ?? 0));
    ra.push({ userId: uid, bai });
  }

  /* Ai mới ghi thì lên đầu: giáo viên mở màn này để nghe bài MỚI. */
  ra.sort((a, b) => (b.bai[0]?.luc ?? 0) - (a.bai[0]?.luc ?? 0));
  return ra;
}
