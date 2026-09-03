import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { chuThuan, dungVung, catManh, kiemNeo } from "../../shared/neoNguLieu.js";

/* Ngữ liệu có tô sáng chỗ chứa đáp án — phần TRÌNH BÀY thuần.
 *
 * Nhận mọi thứ qua props, không chạm `storageShim`, nên xem thử được ở
 * /preview.html — và một tính năng mà giá trị nằm hoàn toàn ở chỗ NHÌN thì
 * phải nhìn được.
 *
 * ══ DỰNG BẰNG MẢNG, KHÔNG DÙNG dangerouslySetInnerHTML ══
 *
 * `reading_text` là HTML do giáo viên soạn, và ở màn thi nó vẫn được dựng
 * nguyên bằng `dangerouslySetInnerHTML` — chấp nhận được vì nội dung nằm sau
 * `is_teacher()`. Nhưng ở đây ta phải CHÈN thẻ `<mark>` vào giữa, và chèn theo
 * vị trí ký tự vào một chuỗi HTML thì sẽ có ngày cắt đúng giữa một thẻ và làm
 * vỡ cả trang.
 *
 * Nên: gỡ HTML về chữ thuần, cắt thành mảnh, dựng bằng React. Mất định dạng
 * (in đậm, xuống dòng của giáo viên) — đổi lại đúng thứ cần: tô được, và
 * không bao giờ vỡ. Ở màn chữa bài thì tô sáng quan trọng hơn in đậm.
 *
 * ══ MÀU MANG NGHĨA ══
 *
 * Xanh = chỗ chứa câu trả lời. Đỏ = chỗ đã dụ bạn. Đây không phải trang trí:
 * hai màu đó là hai bài học khác nhau, và roadmap §3.2 nói thẳng rằng chỗ học
 * được nhiều nhất là cái thứ hai.
 */

export default function NeoNguLieu({ vanBan, evidence, chonSai = null }) {
  const chu = useMemo(() => chuThuan(vanBan), [vanBan]);
  const vung = useMemo(() => dungVung(chu, evidence, chonSai), [chu, evidence, chonSai]);
  const manh = useMemo(() => catManh(chu, vung), [chu, vung]);
  const tinh = useMemo(() => kiemNeo(chu, evidence), [chu, evidence]);

  if (!chu.trim()) return null;

  const bay = vung.filter((v) => v.loai === "bay" && v.viSao);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-soft">Ngữ liệu</div>

      {/* Neo hỏng thì NÓI RA. Im lặng bỏ qua thì học sinh đọc một đoạn văn
          không tô gì và tưởng bài này không có gợi ý — trong khi thật ra giáo
          viên đã viết neo, chỉ là nó trỏ vào đoạn đã bị sửa mất. */}
      {evidence && !tinh.ok && (
        <p className="m-0 mt-2 flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-xs text-ink">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warn" />
          {tinh.ly_do === "khong_tim_thay"
            ? "Chỗ đánh dấu không còn khớp với bài — có thể bài đã được sửa. Báo giáo viên giúp nhé."
            : "Câu này chưa có đánh dấu ngữ liệu."}
        </p>
      )}

      <p className="m-0 mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {manh.map((m, i) =>
          m.loai === "thuong" ? (
            <React.Fragment key={i}>{m.chu}</React.Fragment>
          ) : (
            <mark key={i}
              className={`rounded px-1 ${m.loai === "dung"
                ? "bg-ok-soft text-ink"
                : "bg-danger-soft text-ink"}`}>
              {m.chu}
            </mark>
          ))}
      </p>

      {/* Vì sao cái bẫy đó hấp dẫn — phần đáng học nhất, nên nó đứng riêng chứ
          không nhét vào tooltip. Tooltip trên điện thoại là không có. */}
      {bay.map((b, i) => (
        <p key={i} className="m-0 mt-3 rounded-xl bg-danger-soft p-3 text-sm leading-relaxed text-ink">
          <strong>Vì sao đáp án kia hấp dẫn: </strong>{b.viSao}
        </p>
      ))}
    </div>
  );
}
