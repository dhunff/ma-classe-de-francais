/* Ảnh mặc định theo kỹ năng (06/10) — bucket công khai `Default` do chủ dự án
 * tải lên.
 *
 * CHỈ dùng làm ẢNH THẺ trong thư viện. KHÔNG chèn vào màn làm bài / đề thi:
 * ở đó `imageUrl` thường CHÍNH LÀ ngữ liệu (tài liệu đọc hiểu), và một hình
 * minh hoạ chung chung đặt vào chỗ đó sẽ trông như một tài liệu phải đọc.
 *
 * Không ghi vào database: bài không có ảnh vẫn `image_url = null`. Đổi ảnh
 * trong bucket thì mọi thẻ đổi theo, không cần sửa bài nào.
 *
 * Tên tệp theo đúng bucket hiện có (06/10): 1-nghe-hieu, 3-viet, 4-hieu.
 * Chưa có ảnh số 2; kỹ năng chưa có ảnh riêng dùng « 4-hieu ». Thêm ảnh mới
 * thì chỉ sửa bảng dưới. */

const GOC = "https://cdszvnuaibnnkrvynyck.supabase.co/storage/v1/object/public/Default/";

const THEO_KY_NANG = [
  [/écoute|compréhension orale|oral/i, "1-nghe-hieu.png"],
  [/écriture|production écrite/i, "3-viet.png"],
];
const CHUNG = "4-hieu.png";

export function anhMacDinh(ex) {
  const ds = [...(Array.isArray(ex?.skills) ? ex.skills : []), ex?.skill].filter(Boolean).map(String);
  // Bài có file nghe mà chưa gắn kỹ năng Nghe vẫn là bài nghe.
  if (ex?.audioUrl) return GOC + "1-nghe-hieu.png";
  for (const [mau, tep] of THEO_KY_NANG) {
    if (ds.some((k) => mau.test(k) && !/production orale/i.test(k))) return GOC + tep;
  }
  return GOC + CHUNG;
}
