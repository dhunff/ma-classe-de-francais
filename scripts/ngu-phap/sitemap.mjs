/* Sinh public/sitemap.xml + public/robots.txt (17/10) cho các trang công khai:
 * giới thiệu, FAQ, pháp lý, và « Ngữ pháp » (/ngu-phap + các bài trong BAI_CONG_KHAI).
 * Chạy lại sau khi đổi danh sách bài công khai: node scripts/ngu-phap/sitemap.mjs */
import { writeFileSync } from "node:fs";
import { TAT_CA, BAI_CONG_KHAI } from "../../src/content/nguPhap/index.js";

const GOC = "https://fracile.vercel.app";
const homNay = new Date().toISOString().slice(0, 10);
const trang = [
  ["/gioi-thieu", "1.0", "weekly"],
  ["/ngu-phap", "0.9", "weekly"],
  ...TAT_CA.filter((b) => BAI_CONG_KHAI.has(b.ma)).map((b) => [`/ngu-phap/${b.ma}`, "0.8", "monthly"]),
  ["/faq", "0.5", "monthly"],
  ["/dieu-khoan", "0.2", "yearly"],
  ["/bao-mat", "0.2", "yearly"],
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${trang.map(([p, uu, tan]) => `  <url><loc>${GOC}${p}</loc><lastmod>${homNay}</lastmod><changefreq>${tan}</changefreq><priority>${uu}</priority></url>`).join("\n")}
</urlset>
`;
writeFileSync("public/sitemap.xml", xml);
writeFileSync("public/robots.txt", `User-agent: *
Allow: /
Disallow: /etudiant/
Disallow: /professeur/
Disallow: /examen/
Disallow: /preview.html

Sitemap: ${GOC}/sitemap.xml
`);
console.log("sitemap:", trang.length, "trang");
