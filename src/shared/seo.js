import { useEffect } from "react";

/* Thẻ SEO cho trang công khai (17/10): SPA chỉ có MỘT index.html, nên tiêu đề, mô tả,
 * đường dẫn chuẩn (canonical), thẻ Open Graph và dữ liệu cấu trúc JSON-LD được đặt
 * bằng JS khi trang dựng. Google thực thi JS khi lập chỉ mục nên đọc được.
 * Rời trang thì trả lại tiêu đề / mô tả cũ và gỡ JSON-LD, để trang khác không mang
 * nhầm thẻ của bài trước. JSON-LD là khối dữ liệu, không chạy như mã, nên CSP
 * script-src 'self' không chặn. */
const GOC = "https://www.fracile.vn";

function datMeta(thuocTinh, khoa, giaTri) {
  let el = document.head.querySelector(`meta[${thuocTinh}="${khoa}"]`);
  const cu = el ? el.getAttribute("content") : null;
  if (!el) { el = document.createElement("meta"); el.setAttribute(thuocTinh, khoa); document.head.appendChild(el); }
  el.setAttribute("content", giaTri);
  return () => { if (cu == null) el.remove(); else el.setAttribute("content", cu); };
}

export function useSeo({ tieuDe, moTa, duongDan, jsonLd }) {
  useEffect(() => {
    if (!tieuDe) return undefined;
    const tieuDeCu = document.title;
    document.title = tieuDe;
    const tra = [
      datMeta("name", "description", moTa ?? ""),
      datMeta("property", "og:title", tieuDe),
      datMeta("property", "og:description", moTa ?? ""),
      datMeta("property", "og:type", "article"),
      datMeta("property", "og:url", GOC + (duongDan ?? "")),
    ];
    let can = document.head.querySelector('link[rel="canonical"]');
    const canCu = can ? can.getAttribute("href") : null;
    if (!can) { can = document.createElement("link"); can.setAttribute("rel", "canonical"); document.head.appendChild(can); }
    can.setAttribute("href", GOC + (duongDan ?? ""));
    let ld = null;
    if (jsonLd) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "seo-jsonld";
      ld.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(ld);
    }
    return () => {
      document.title = tieuDeCu;
      tra.forEach((f) => f());
      if (canCu == null) can.remove(); else can.setAttribute("href", canCu);
      ld?.remove();
    };
  }, [tieuDe, moTa, duongDan, jsonLd ? JSON.stringify(jsonLd) : ""]); // eslint-disable-line react-hooks/exhaustive-deps
}
