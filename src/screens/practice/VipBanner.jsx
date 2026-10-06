import React from "react";
import { Crown, Check } from "lucide-react";
import { VIP, vipConHan } from "../../shared/vip.js";
import { fmtPrice } from "../../shared/access.js";

/* Dải giới thiệu gói VIP đầu Thư viện luyện tập (06/10) — chỉ học sinh.
 *
 * Còn hạn: cho biết hạn tới ngày nào + nút gia hạn (gia hạn nối tiếp, không
 * mất ngày). Chưa có / hết hạn: lợi ích + giá + nút đăng ký. Học sinh được giáo
 * viên mở toàn quyền thì không hiện gì (đã có mọi bài, chào mua là thừa).
 *
 * Màu hổ phách = cùng tông nhãn XP/vương miện; chữ dùng token để đọc được ở
 * cả bản sáng lẫn tối. */
export default function VipBanner({ vipDen, toanQuyen, onMua, t }) {
  if (toanQuyen && !vipConHan(vipDen)) return null;
  const con = vipConHan(vipDen);
  return (
    <section className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-amber-300/60 bg-warn-soft p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white"><Crown size={24} /></span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-base font-extrabold text-ink">
          {con ? t("vip.active", { ngay: new Date(vipDen).toLocaleDateString("vi-VN") }) : t("vip.title", { gia: fmtPrice(VIP.gia) })}
        </p>
        <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm text-ink">
          {["vip.b1", "vip.b2", "vip.b3"].map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5"><Check size={14} className="text-ok" />{t(k)}</li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={onMua}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-amber-500 px-5 py-2.5 font-sans text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-amber-600">
        <Crown size={16} /> {con ? t("vip.renew") : t("vip.cta", { gia: fmtPrice(VIP.gia) })}
      </button>
    </section>
  );
}
