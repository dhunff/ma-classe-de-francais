/* Dựng sẵn HTML cho trang công khai sau `vite build` (18/10, việc C2).
 *
 * Mỗi route trong DUONG_DAN (src/prerender.jsx) thành dist/<route>/index.html:
 * nội dung trang đã dựng nằm sẵn trong #root, kèm <title>, mô tả, canonical,
 * Open Graph và JSON-LD lấy từ chính useSeo của trang. Vercel phục vụ file tĩnh
 * TRƯỚC rewrite về /index.html, nên bot nhận bản dựng sẵn; người dùng vẫn chạy
 * SPA như cũ (main.jsx dựng lại từ đầu).
 *
 * Hỏng ở đây thì build DỪNG: một trang công khai trắng trơn trước mắt Google
 * tệ hơn là deploy thất bại và được báo ngay. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const GOC = "https://www.fracile.vn";
/* Vài module gắn vào window / đọc localStorage ngay lúc nạp (storageShim, i18n).
   Cho chúng một bản giả tối thiểu; document thì CỐ Ý không giả, để useSeo biết
   mình đang ở bước dựng sẵn. Ngôn ngữ mặc định là vi. */
const kho = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear() }; };
globalThis.window ??= globalThis;
globalThis.localStorage ??= kho();
globalThis.sessionStorage ??= kho();
globalThis.addEventListener ??= () => {};
globalThis.removeEventListener ??= () => {};
const { render, DUONG_DAN } = await import(pathToFileURL(path.resolve("dist-ssr/prerender.js")).href);
const khuon = readFileSync("dist/index.html", "utf8");
/* Trang chủ « / » cũng dựng sẵn (18/10): trước đó Google nhận một trang trắng ở đúng
   địa chỉ người ta tìm tên thương hiệu. Nhưng dist/index.html còn là bản dự phòng cho
   MỌI route SPA, nên giữ bản sạch ở dist/app.html và vercel.json rewrite về đó. */
writeFileSync("dist/app.html", khuon);
if (!khuon.includes('<div id="root"></div>')) throw new Error("dist/index.html không có <div id=\"root\"></div>");

const thoat = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let dem = 0;
for (const url of DUONG_DAN) {
  const { html, seo } = render(url);
  if (!html || html.length < 200) throw new Error(`${url}: HTML dựng ra quá ngắn (${html?.length ?? 0} ký tự)`);
  let trang = khuon.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  if (seo?.tieuDe) {
    trang = trang.replace(/<title>[^<]*<\/title>/, `<title>${thoat(seo.tieuDe)}</title>`);
    if (seo.moTa) trang = trang.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${thoat(seo.moTa)}" />`);
    const lien = GOC + (seo.duongDan ?? url);
    const them = [
      `<link rel="canonical" href="${thoat(lien)}" />`,
      `<meta property="og:title" content="${thoat(seo.tieuDe)}" />`,
      `<meta property="og:description" content="${thoat(seo.moTa)}" />`,
      `<meta property="og:type" content="article" />`,
      `<meta property="og:url" content="${thoat(lien)}" />`,
      seo.jsonLd ? `<script type="application/ld+json" id="seo-jsonld-tinh">${JSON.stringify(seo.jsonLd).replace(/</g, "\\u003c")}</script>` : "",
    ].join("\n    ");
    trang = trang.replace("</head>", `    ${them}\n  </head>`);
  }
  const thuMuc = path.join("dist", url);
  mkdirSync(thuMuc, { recursive: true });
  writeFileSync(path.join(thuMuc, "index.html"), trang);
  dem++;
}
console.log(`prerender: ${dem} trang`);
