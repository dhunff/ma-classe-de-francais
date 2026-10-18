import { useEffect, useRef, useState } from "react";
import { tr } from "./i18n.jsx";

/* Bảng ký tự có dấu tiếng Pháp (10/10), nổi ở đáy màn hình khi một ô nhập
 * mang `lang="fr"` đang được chọn. Gắn một lần ở vỏ app và ở màn thi, nên mọi
 * ô viết bài chỉ cần thêm `lang="fr"`. Ô có `data-khong-bang-dau` thì bỏ qua
 * (màn chép chính tả đã có bảng riêng ngay dưới ô).
 *
 * Ô nhập là controlled React: phải ghi qua setter GỐC của trình duyệt rồi bắn
 * sự kiện `input`, nếu gán `el.value` thẳng thì React không thấy và lần dựng
 * sau xoá mất ký tự vừa chèn. */
export const DAU = ["é", "è", "ê", "à", "â", "ç", "î", "ï", "ô", "û", "ù", "ë", "œ"];

const hopLe = (el) => el instanceof HTMLElement
  && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && /^(text|search|)$/.test(el.type || "")))
  && !el.disabled && !el.readOnly && !el.closest("[data-khong-bang-dau]")
  && el.closest('[lang="fr"]') !== null;

/* Chèn ký tự vào ô controlled React (dùng chung cho bảng nổi và giấy nháp). */
export function chenKyTu(o, c) {
  const a = o.selectionStart ?? o.value.length, b = o.selectionEnd ?? a;
  const moi = o.value.slice(0, a) + c + o.value.slice(b);
  const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(o), "value").set;
  set.call(o, moi);
  o.dispatchEvent(new Event("input", { bubbles: true }));
  requestAnimationFrame(() => { o.focus(); o.setSelectionRange(a + c.length, a + c.length); });
}

export default function BangDauPhap() {
  const [o, setO] = useState(null);
  const hoa = useRef(false);
  const [hoaState, setHoa] = useState(false);
  /* Điện thoại (18/10): bảng nổi ở đáy màn hình nằm đè lên đúng ô đang gõ khi bàn
     phím bật (iOS co khung nhìn). Nên trên màn hẹp, bảng thành MỘT hàng cuộn ngang
     đặt sát PHÍA TRÊN ô nhập (ô sát mép trên thì đặt phía dưới), tính lại khi bàn
     phím đổi kích thước khung nhìn hoặc trang cuộn. */
  const [viTri, setViTri] = useState(null);
  useEffect(() => {
    if (!o) return undefined;
    const hep = () => window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
    const tinh = () => {
      if (!hep()) { setViTri(null); return; }
      const r = o.getBoundingClientRect(), CAO = 52;
      const vv = window.visualViewport, dinh = vv ? vv.offsetTop : 0;
      const tren = r.top - CAO - 6;
      setViTri(tren >= dinh + 4 ? tren : r.bottom + 6);
    };
    tinh();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", tinh); vv?.addEventListener("scroll", tinh);
    window.addEventListener("scroll", tinh, true); window.addEventListener("resize", tinh);
    return () => {
      vv?.removeEventListener("resize", tinh); vv?.removeEventListener("scroll", tinh);
      window.removeEventListener("scroll", tinh, true); window.removeEventListener("resize", tinh);
    };
  }, [o]);

  useEffect(() => {
    const vao = (e) => { if (hopLe(e.target)) setO(e.target); };
    /* Rời ô: đợi một nhịp, vì bấm nút trong bảng không được làm bảng biến mất. */
    const ra = () => setTimeout(() => { if (!hopLe(document.activeElement)) setO(null); }, 120);
    document.addEventListener("focusin", vao);
    document.addEventListener("focusout", ra);
    return () => { document.removeEventListener("focusin", vao); document.removeEventListener("focusout", ra); };
  }, []);

  if (!o) return null;

  const chen = (c0) => {
    chenKyTu(o, hoa.current ? c0.toUpperCase() : c0);
  };

  return (
    <div role="toolbar" aria-label={tr("Ký tự tiếng Pháp", "Caractères français", "French characters")}
      onMouseDown={(e) => e.preventDefault()}
      style={viTri != null ? { top: viTri } : undefined}
      className={`fixed left-1/2 z-[70] flex max-w-[calc(100vw-24px)] -translate-x-1/2 gap-1.5 rounded-2xl border border-solid border-line bg-surface p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.18)] ${viTri != null ? "no-scrollbar flex-nowrap overflow-x-auto" : "bottom-3 flex-wrap justify-center p-2"}`}>
      <button type="button" onClick={() => { hoa.current = !hoa.current; setHoa(hoa.current); }}
        title={tr("Chữ hoa", "Majuscules", "Uppercase")}
        className={`h-9 shrink-0 cursor-pointer rounded-xl border border-solid px-2.5 font-sans text-xs font-extrabold ${hoaState ? "border-primary bg-primary text-white" : "border-line bg-surface text-soft"}`}>⇧</button>
      {DAU.map((c) => (
        <button key={c} type="button" onClick={() => chen(c)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-xl border border-solid border-line bg-surface font-sans text-base font-bold text-ink hover:border-primary hover:text-primary">
          {hoaState ? c.toUpperCase() : c}
        </button>
      ))}
    </div>
  );
}
