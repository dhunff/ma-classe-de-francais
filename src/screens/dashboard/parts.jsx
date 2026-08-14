import React, { useEffect, useRef, useState } from "react";

/* Khối dùng chung cho Dashboard — phong cách Soft UI.

   MÀU đi qua token (surface/ink/soft/primary) chứ không phải bảng slate cứng.
   Token tự đảo ở bản tối và được scripts/check-design.mjs đo tương phản; viết
   `dark:bg-slate-900` ở đây sẽ khiến dashboard lệch tông với phần còn lại của
   app trong bản tối.

   HÌNH KHỐI và HOẠT ẢNH thì theo Soft UI: bo lớn, bóng toả, nền mờ, nhấc nhẹ
   khi rê chuột.

   Preflight bị tắt nên mọi <button> ở đây đều có border-0 và bg rõ ràng. */

const SOFT_SHADOW = "shadow-[0_8px_30px_rgb(0,0,0,0.04)]";
/* Nhấc nhẹ khi rê chuột. Đường cong (.25,.8,.25,1) bật nhanh rồi hãm dài —
   thẻ nổi lên dứt khoát mà không nảy. Bóng đổ mượn màu chủ đạo ở độ mờ rất
   thấp: giữ đúng tông Soft UI, và tự đổi theo bản sáng/tối vì primary là
   token chứ không phải mã màu cứng. */
const LIFT =
  "transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] " +
  "hover:-translate-y-1 hover:shadow-[0_18px_40px_rgb(0,0,0,0.10)]";

/* Vỏ ứng dụng vào trước nội dung: thanh bên 0ms, topbar 60ms. Mọi khối nội
   dung cộng thêm RISE_BASE để không chạy song song với vỏ — thứ tự đọc là
   Sidebar → Header → nội dung, đúng như mắt người quét trang.

   Sửa một chỗ này là dời cả nhịp; đừng cộng tay vào từng `delay`. */
export const RISE_BASE = 140;

/* Bọc để xuất hiện so le. Delay đi qua biến CSS chứ không phải class Tailwind
   động — Tailwind quét class theo chuỗi tĩnh nên `delay-[${n}ms]` sẽ không
   được sinh ra. */
export function Rise({ delay = 0, className = "", children, as: Tag = "div", style }) {
  return (
    <Tag
      className={`mcf-rise ${className}`}
      style={{ ...style, "--mcf-delay": `${RISE_BASE + delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* Số đếm dần. Dùng requestAnimationFrame chứ không phải setInterval: rAF
   đồng bộ với nhịp vẽ nên không giật, và tự dừng khi tab ẩn.

   Người bật giảm chuyển động thì nhảy thẳng tới số cuối — con số vẫn phải
   đọc được, chỉ bỏ phần chuyển động. */
export function CountUp({ to = 0, duration = 900, className = "" }) {
  const [n, setN] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const target = Number(to) || 0;
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) { setN(target); return; }

    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      /* easeOutCubic: nhanh lúc đầu rồi chậm dần — số dừng lại êm thay vì
         phanh gấp ở cuối. */
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);

  return <span className={className}>{n}</span>;
}

/* Vòng tiến độ SVG. Vẽ vòng đầy rồi che bằng stroke-dashoffset, hạ dần offset
   về đúng tỷ lệ — nên chỉ một thuộc tính động, không phải tính lại đường path.

   Tỷ lệ cũng in bằng chữ ở giữa: vòng cung một mình thì người dùng phải ước
   lượng bằng mắt. */
export function Ring({ pct = 0, size = 116, stroke = 10, label, className = "" }) {
  const [shown, setShown] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(pct); return; }
    /* Một khung hình trễ để trình duyệt kịp vẽ trạng thái 0 trước, nếu không
       transition không có gì để chạy từ đó. */
    const id = requestAnimationFrame(() => setShown(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className={`relative grid place-items-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img"
        aria-label={label ? `${label}: ${pct}%` : `${pct}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-primary-soft" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeLinecap="round" className="stroke-primary"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * shown) / 100}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <span className="absolute text-xl font-extrabold tracking-tight text-ink">{pct}%</span>
    </div>
  );
}

export function Card({ title, action, children, className = "", hover = false }) {
  return (
    <section
      className={[
        "rounded-3xl bg-surface/80 p-5 backdrop-blur-md",
        SOFT_SHADOW,
        hover ? LIFT : "",
        className,
      ].join(" ")}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && (
            <h2 className="text-sm font-bold uppercase tracking-wider text-soft">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* Ô số liệu. `value` là null nghĩa là chưa đo được — hiện dấu gạch, không
   hiện 0, vì 0 là một con số có nghĩa còn "chưa có dữ liệu" thì không. */
export function StatTile({ Icon, label, value, unit, hint, tone = "ink", animate = true }) {
  const toneClass = {
    ink: "text-ink",
    primary: "text-primary",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];

  const empty = value === null || value === undefined;

  return (
    <div className={`rounded-3xl bg-surface/80 p-4 backdrop-blur-md ${SOFT_SHADOW} ${LIFT}`}>
      <div className="flex items-center gap-2 text-soft">
        {Icon && <Icon size={15} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-2 text-2xl font-extrabold tracking-tight ${toneClass}`}>
        {empty ? (
          <span className="text-soft" aria-label={hint}>—</span>
        ) : (
          <>
            {animate && typeof value === "number" ? <CountUp to={value} /> : value}
            {unit && <span className="ml-0.5 text-base font-bold">{unit}</span>}
          </>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-soft">{hint}</div>}
    </div>
  );
}

/* Trạng thái rỗng: nói rõ vì sao trống và làm gì tiếp theo.
   Không bao giờ thay bằng số bịa. */
export function EmptyState({ Icon, title, body }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      {Icon && <Icon size={26} className="text-soft" strokeWidth={1.6} />}
      <p className="text-sm font-bold text-ink">{title}</p>
      {body && <p className="max-w-xs text-sm text-soft">{body}</p>}
    </div>
  );
}

/* Thanh tiến độ. Tỷ lệ cũng viết bằng chữ để không phụ thuộc riêng vào màu. */
export function ProgressBar({ value, max, label }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const [w, setW] = useState(0);

  useEffect(() => {
    const reduce = typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setW(pct); return; }
    const id = requestAnimationFrame(() => setW(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-sm font-bold text-primary">
          {value}/{max} · {pct}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-primary-soft"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
          style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

export { SOFT_SHADOW, LIFT };
