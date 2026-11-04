import React from "react";
import { Lightbulb, BookOpen, Puzzle, Target, AlertTriangle, XCircle, Quote } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Khung « Giải thích » của một phần trong bài Học ngữ pháp (04/11, làm lại vì bản cũ đơn điệu).
 *
 * Nội dung (`giai`) là HTML tĩnh trong src/content/nguPhap: các mục mở bằng <h4>. Có hơn 500 tên mục
 * khác nhau, nên xếp theo NHÓM bằng từ khoá trong tên: mỗi nhóm một biểu tượng và một màu token
 * (primary, ok, warn, danger), sáng tối tự theo. Tên lạ rơi về nhóm « khái niệm ».
 * Trong chữ: phiên âm /…/ thành nhãn, <em> (từ tiếng Pháp) tô màu chính. Không có <h4> thì cả khối
 * là một mục không tên. */
const NHOM = [
  { k: "loi", re: /lỗi/i, Icon: XCircle, mau: "bg-danger-soft text-danger" },
  { k: "luuY", re: /lưu ý|ngoại lệ|bất quy tắc|phân biệt|cẩn thận|bẫy|đặc biệt|tránh/i, Icon: AlertTriangle, mau: "bg-warn-soft text-warn" },
  { k: "dung", re: /cách dùng|^dùng|ứng dụng|phương pháp|cách học|nhận biết|dấu hiệu|cách nói|văn phong|khi nào|mẹo/i, Icon: Target, mau: "bg-ok-soft text-ok" },
  { k: "viDu", re: /^ví dụ/i, Icon: Quote, mau: "bg-surface2 text-soft" },
  { k: "congThuc", re: /quy tắc|cấu tạo|nguyên tắc|bảng|vị trí|hợp giống|số nhiều|dạng|phủ định|khẳng định|nghi vấn|liên từ|giới từ|thang|phương tiện|cấu trúc|chia|đuôi|trật tự/i, Icon: Puzzle, mau: "bg-primary text-on-primary" },
];
const KHAI_NIEM = { k: "khaiNiem", Icon: BookOpen, mau: "bg-primary-soft text-primary" };
const nhomCua = (ten) => NHOM.find((n) => n.re.test(ten)) || KHAI_NIEM;

/* Tô phiên âm /…/ trong phần chữ (không đụng vào thẻ): /o/, /ʃa/, /vu/… tối đa 24 ký tự, không xuống dòng.
   Phải mở và đóng bằng ký tự không trắng: « đặt giữa / / » là nói về hai dấu gạch, không phải phiên âm. */
const toPhienAm = (html) => html.replace(/(^|[\s(>:,])\/([^/<>\s](?:[^/<>\n]{0,22}[^/<>\s])?)\//g,
  (_, truoc, am) => `${truoc}<span class="mcf-ipa">/${am}/</span>`);

function cat(html) {
  const ds = [];
  const re = /<h4>([\s\S]*?)<\/h4>/g;
  let m, ten = null, tu = 0;
  while ((m = re.exec(html))) {
    const than = html.slice(tu, m.index).trim();
    if (than || ten !== null) ds.push({ ten, than });
    ten = m[1].replace(/<[^>]+>/g, "").trim();
    tu = re.lastIndex;
  }
  ds.push({ ten, than: html.slice(tu).trim() });
  return ds.filter((d) => d.ten || d.than);
}

const KIEU_THAN = "text-[15px] leading-relaxed text-ink [&_p]:m-0 [&_p+p]:mt-1.5 [&_strong]:font-extrabold [&_em]:font-semibold [&_em]:text-primary [&_ul]:m-0 [&_ul]:mt-1 [&_ul]:pl-5 [&_li]:mt-0.5 [&_.mcf-ipa]:mx-0.5 [&_.mcf-ipa]:inline-block [&_.mcf-ipa]:rounded-md [&_.mcf-ipa]:bg-primary-soft [&_.mcf-ipa]:px-1.5 [&_.mcf-ipa]:font-bold [&_.mcf-ipa]:not-italic [&_.mcf-ipa]:text-primary";

export default function GiaiThichNguPhap({ html }) {
  const muc = cat(toPhienAm(html));
  return (
    <section className="mt-4 rounded-2xl border border-solid border-line bg-surface p-4 sm:p-5">
      <h3 className="m-0 mb-4 flex items-center gap-2 text-sm font-extrabold text-ink">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-warn-soft text-warn"><Lightbulb size={15} /></span>
        {tr("Giải thích", "Explication", "Explanation")}
      </h3>
      <ol className="m-0 grid list-none gap-4 p-0">
        {muc.map((d, i) => {
          const n = d.ten ? nhomCua(d.ten) : KHAI_NIEM;
          const { Icon } = n;
          return (
            <li key={i} className="flex gap-3">
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${n.mau}`}><Icon size={16} /></span>
              <div className="min-w-0 flex-1">
                {d.ten && <p className="m-0 mb-1 text-sm font-extrabold text-ink">{d.ten}</p>}
                <div className={KIEU_THAN} dangerouslySetInnerHTML={{ __html: d.than }} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
