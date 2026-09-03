/* Neo đáp án vào ngữ liệu — phần THUẦN, không import gì.
 *
 * Cùng lý do với sm2.js và identityRules.js: file nào chạm `storageShim` là
 * file `node` không nạp được, và phần dễ sai nhất sẽ thành phần duy nhất không
 * có bộ kiểm nào canh.
 *
 * ══ VÌ SAO LƯU ĐOẠN TRÍCH, KHÔNG LƯU OFFSET ══
 *
 * roadmap §3.2 phác `{"start": 412, "end": 507}` — vị trí ký tự trong
 * `reading_text`. Không dùng, vì hai lý do đo được:
 *
 * 1. OFFSET TRÔI KHI SỬA BÀI, VÀ TRÔI IM LẶNG. Giáo viên sửa một dấu phẩy ở
 *    đầu văn bản là mọi neo phía sau lệch đi một ký tự. Không có lỗi nào, chỉ
 *    là đoạn tô sáng bắt đầu lệch dần — và với văn bản dài thì lệch vài chục
 *    ký tự vẫn trông "gần đúng", nên không ai báo.
 *
 * 2. `reading_text` LÀ HTML, không phải chữ thuần. Offset vào chuỗi HTML thì
 *    chèn thẻ <mark> ở giữa một thẻ khác và làm vỡ đánh dấu; offset vào chữ đã
 *    dựng thì phụ thuộc cách trình duyệt gộp khoảng trắng.
 *
 * Đoạn trích thì hoặc KHỚP hoặc KHÔNG. Không khớp là một trạng thái nhìn thấy
 * được, và giao diện nói thẳng ra thay vì tô sáng nhầm chỗ.
 *
 * Đánh đổi: đoạn trích tốn chỗ hơn hai con số, và phải xử lý trường hợp một
 * đoạn xuất hiện nhiều lần. Xem `viTriTrich`.
 */

/* Bỏ thẻ HTML, trả về chữ thuần — đây là thứ người đọc THẤY.
 *
 * Không dùng DOMParser: file này phải chạy được dưới node. Regex đủ cho
 * `reading_text` do RichTextEditor sinh ra (thẻ đơn giản, không script).
 *
 * `<br>` và `</p>` thành xuống dòng chứ không thành rỗng — nếu không thì chữ
 * cuối đoạn dính liền chữ đầu đoạn sau và tạo ra một "từ" không có thật, làm
 * hỏng phép tìm. */
export function chuThuan(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/* Chuẩn hoá để SO SÁNH, không phải để hiển thị.
 *
 * Gộp mọi loại khoảng trắng thành một dấu cách: giáo viên chép đoạn trích từ
 * văn bản thì hay dính thêm xuống dòng hoặc hai dấu cách, và một đoạn trích
 * đúng từng chữ mà lệch một khoảng trắng thì phép so chuỗi thô báo "không tìm
 * thấy" — sai theo hướng khó hiểu nhất.
 *
 * KHÔNG bỏ dấu tiếng Pháp: « ou » và « où » là hai từ khác nhau, và cả dự án
 * này chấm bài dựa trên đúng điều đó. */
export const chuanHoa = (s) =>
  String(s ?? "").replace(/[\s ]+/g, " ").trim();

/* Tìm đoạn trích trong văn bản. Trả về `{ dau, cuoi }` theo chỉ số của CHỮ
 * THUẦN, hoặc `null` khi không tìm thấy.
 *
 * `null` là một câu trả lời hợp lệ và phải được hiển thị như vậy — neo trỏ vào
 * một đoạn không còn tồn tại (giáo viên đã sửa bài) thì nói ra, đừng đoán chỗ
 * gần đúng. Tô sáng nhầm đoạn còn tệ hơn không tô gì: học sinh tin vào nó.
 *
 * `lanThu` để xử lý đoạn xuất hiện nhiều lần: neo có thể ghi `lan: 2`. Mặc
 * định lấy lần đầu. */
export function viTriTrich(vanBan, trich, lanThu = 1) {
  const v = chuanHoa(vanBan);
  const t = chuanHoa(trich);
  if (!v || !t) return null;

  let tu = 0;
  for (let i = 0; i < Math.max(1, lanThu); i++) {
    const j = v.indexOf(t, tu);
    if (j < 0) return null;
    if (i === Math.max(1, lanThu) - 1) return { dau: j, cuoi: j + t.length };
    tu = j + 1;
  }
  return null;
}

/* Cắt văn bản thành các mảnh để dựng: mỗi mảnh là `{ chu, loai }` với `loai`
 * thuộc { thuong, dung, bay }.
 *
 * Trả về MẢNG thay vì chuỗi HTML: dựng bằng `dangerouslySetInnerHTML` với chữ
 * do giáo viên gõ là mở một cửa không cần mở, và ở đây hoàn toàn tránh được.
 *
 * Vùng CHỒNG NHAU: nếu một đoạn vừa là bằng chứng vừa là bẫy thì `dung` thắng.
 * Không có luật này thì thứ tự sắp xếp quyết định màu, và cùng một dữ liệu cho
 * ra hai màn hình khác nhau tuỳ ngày. */
export function catManh(vanBan, vung) {
  const v = chuanHoa(vanBan);
  if (!v) return [];

  const sach = (vung ?? [])
    .filter((x) => x && Number.isFinite(x.dau) && Number.isFinite(x.cuoi) && x.cuoi > x.dau)
    .sort((a, b) => a.dau - b.dau || (a.loai === "dung" ? -1 : 1));

  const manh = [];
  let i = 0;
  for (const u of sach) {
    const dau = Math.max(u.dau, i);
    if (dau >= u.cuoi) continue;          // đã nằm trong một vùng trước đó
    if (dau > i) manh.push({ chu: v.slice(i, dau), loai: "thuong" });
    manh.push({ chu: v.slice(dau, u.cuoi), loai: u.loai });
    i = u.cuoi;
  }
  if (i < v.length) manh.push({ chu: v.slice(i), loai: "thuong" });
  return manh;
}

/* Từ một `evidence` + văn bản, dựng danh sách vùng cần tô.
 *
 * `chonSai` là chỉ số đáp án học sinh đã chọn. Chỉ tô bẫy mà CHÍNH HỌ đã sa
 * vào — tô hết mọi bẫy là biến phần chữa bài thành một bài giảng, và thứ đáng
 * học nhất (vì sao TÔI bị dụ) chìm trong đó. */
export function dungVung(vanBan, evidence, chonSai = null) {
  const ra = [];
  const e = evidence ?? {};

  const chinh = viTriTrich(vanBan, e.trich, e.lan);
  if (chinh) ra.push({ ...chinh, loai: "dung" });

  for (const b of e.pieges ?? []) {
    /* `chonSai == null` nghĩa là CHƯA chọn gì (hoặc chọn đúng) — khi đó không
       tô bẫy nào. Bản đầu viết `chonSai != null && …` nên nhánh này không loại
       gì cả và tô SẠCH mọi bẫy: bài chữa thành một bài giảng, và thứ đáng học
       nhất — vì sao TÔI bị dụ — chìm trong đó. Bộ kiểm bắt được. */
    if (chonSai == null || b?.option !== chonSai) continue;
    const v = viTriTrich(vanBan, b?.trich, b?.lan);
    if (v) ra.push({ ...v, loai: "bay", viSao: b?.vi_sao ?? "" });
  }
  return ra;
}

/* Neo có dùng được không — để giao diện nói thật thay vì im lặng bỏ qua.
 * Trả về mã, không phải câu chữ (file này chạy cả dưới node). */
export function kiemNeo(vanBan, evidence) {
  const e = evidence ?? {};
  if (!e.trich) return { ok: false, ly_do: "thieu_trich" };
  if (!viTriTrich(vanBan, e.trich, e.lan)) return { ok: false, ly_do: "khong_tim_thay" };
  const bayHong = (e.pieges ?? []).filter((b) => b?.trich && !viTriTrich(vanBan, b.trich, b.lan));
  return { ok: true, bayHong: bayHong.length };
}
