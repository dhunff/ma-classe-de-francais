import React from "react";

/* Khối dùng chung cho Dashboard. Viền mỏng, bóng nhẹ, nền phẳng —
   phân tách bằng đường kẻ chứ không bằng mảng màu đậm. */

export function Card({ title, action, children, className = "" }) {
  return (
    <section
      className={`rounded-md border border-solid border-line bg-surface p-5 shadow-sm ${className}`}
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
export function StatTile({ Icon, label, value, unit, hint, tone = "ink" }) {
  const toneClass = {
    ink: "text-ink",
    primary: "text-primary",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];

  return (
    <div className="rounded-md border border-solid border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-soft">
        {Icon && <Icon size={15} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-2 text-2xl font-extrabold tracking-tight ${toneClass}`}>
        {value === null || value === undefined ? (
          <span className="text-soft" aria-label={hint}>—</span>
        ) : (
          <>
            {value}
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
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
