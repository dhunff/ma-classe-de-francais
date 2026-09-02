import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

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

/* Banner chào mừng — dùng chung cho trang chủ chung và trang chủ học sinh.

   Hai màn hình phải mở đầu giống hệt nhau: người dùng đăng nhập rồi đi qua
   cả hai, thấy hai lời chào khác kiểu thì tưởng là hai sản phẩm.

   `note` chỉ trang chủ học sinh truyền vào: mục tiêu học, hoặc lời mời đặt
   mục tiêu khi chưa có. Đó là thứ duy nhất trong khối chào cũ không lặp lại ở
   hàng ô số liệu bên dưới, nên được mang sang đây thay vì bỏ đi. */
/* `as` chọn cấp tiêu đề. Trang chủ học sinh đã có <h1> là tiêu đề trang do
   Topbar dựng, nên lời chào ở đó phải là <h2> — hai <h1> trên một trang làm
   trình đọc màn hình mất mốc điều hướng. Ở /decouvrir Topbar không có tiêu
   đề, nên lời chào chính là <h1>. */
export function HeroBanner({ t, signedIn, name, note, as: Heading = "h1" }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#6d5ce7] p-6 text-on-primary shadow-[0_14px_34px_rgb(0,0,0,0.14)] sm:p-8">
      {/* Hai vòng tròn mờ tạo chiều sâu — trang trí thuần tuý, ẩn với trình
          đọc màn hình. */}
      <span aria-hidden className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15" />
      <span aria-hidden className="absolute -bottom-16 right-10 h-28 w-28 rounded-full bg-white/10" />

      <div className="relative max-w-lg">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
          <Sparkles size={21} strokeWidth={2.3} />
        </span>
        <Heading className="m-0 mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          {signedIn ? t("home.welcome_back", { name }) : t("home.welcome_guest")}
        </Heading>
        <p className="m-0 mt-2 text-sm font-medium opacity-90">
          {signedIn ? t("home.hero_sub_user") : t("home.hero_sub_guest")}
        </p>
        {note && <p className="m-0 mt-2 text-sm font-medium opacity-90">{note}</p>}
        <Link
          to="/decouvrir/entrainement"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-bold text-primary no-underline shadow-[0_6px_16px_rgb(0,0,0,0.15)] transition-transform duration-200 hover:scale-[1.03]"
        >
          {t("home.discover")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
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

/* Bốn nền chuyển sắc cho hàng ô số liệu của học sinh.

   Đây là chỗ DUY NHẤT trong dự án dùng bảng màu Tailwind thay vì token, và là
   cố ý: chúng là bốn mảng màu trang trí, không mang nghĩa trạng thái. Chữ
   luôn trắng trên nền bão hoà nên tương phản không phụ thuộc bản sáng/tối —
   thẻ giữ nguyên độ rực ở cả hai bản, đúng như thiết kế muốn.

   Không dùng cho ô của giáo viên: bảng này gồm đúng bốn màu cho bốn ô. */
export const STAT_GRADIENTS = {
  indigo: "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50",
  blue: "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50",
  fuchsia: "bg-gradient-to-br from-fuchsia-500 to-purple-500 shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50",
  pink: "bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50",
};

/* Ô số liệu. `value` là null nghĩa là chưa đo được — hiện dấu gạch, không
   hiện 0, vì 0 là một con số có nghĩa còn "chưa có dữ liệu" thì không.

   Hai diện mạo: nền trắng mặc định, và bản `gradient` nhiều màu. Bản màu xếp
   dọc — biểu tượng trong vòng tròn mờ ở góc trên, rồi con số, rồi nhãn — nên
   mắt đi từ trên xuống thay vì phải quét ngang. */
export function StatTile({ Icon, label, value, unit, hint, tone = "ink", animate = true, gradient }) {
  const toneClass = {
    ink: "text-ink",
    primary: "text-primary",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];

  const empty = value === null || value === undefined;
  const number = empty
    ? <span aria-label={hint}>—</span>
    : (
      <>
        {animate && typeof value === "number" ? <CountUp to={value} /> : value}
        {/* Ký hiệu dính sát số là đúng (`78%`); một TỪ thì không — `5ngày` đọc
            ra như một từ lạ. Ngưỡng một ký tự đủ tách hai trường hợp mà không
            cần chỗ gọi nào phải nghĩ về khoảng cách. */}
        {unit && (
          <span className={`${String(unit).length > 1 ? "ml-1.5" : "ml-0.5"} text-xl font-bold`}>
            {unit}
          </span>
        )}
      </>
    );

  if (gradient) {
    return (
      <div
        className={[
          "rounded-3xl p-5 text-white",
          STAT_GRADIENTS[gradient] || STAT_GRADIENTS.indigo,
          "transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] hover:-translate-y-1",
        ].join(" ")}
      >
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20">
            <Icon size={18} strokeWidth={2.2} />
          </span>
        )}
        <p className="m-0 mt-4 text-3xl font-bold tracking-tight text-white">{number}</p>
        <p className="m-0 mt-1 text-sm font-semibold tracking-wide text-white/90">{label}</p>
        {/* line-clamp-2: vài dòng phụ khá dài ("Chưa tính được — hệ thống chưa
            ghi hoạt động theo ngày"), để tự do thì bốn ô cao lệch nhau. Vẫn
            giữ nguyên chữ, chỉ cắt phần hiển thị. */}
        {hint && <p className="m-0 mt-1 line-clamp-2 text-xs text-white/70">{hint}</p>}
      </div>
    );
  }

  return (
    <div className={`rounded-3xl bg-surface/80 p-4 backdrop-blur-md ${SOFT_SHADOW} ${LIFT}`}>
      <div className="flex items-center gap-2 text-soft">
        {Icon && <Icon size={15} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`mt-2 text-2xl font-extrabold tracking-tight ${toneClass}`}>
        {empty ? <span className="text-soft" aria-label={hint}>—</span> : number}
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
