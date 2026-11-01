/* Lô 28: dựng ba sơ đồ của bài Đọc A1 vào public/images/doc-a1/.
 * Sơ đồ là một phần của đề: đổi vị trí ở đây thì phải đổi đáp án ở lo28_doc_a1_noi_dung.mjs.
 * Nền trắng cố định, vì tờ sơ đồ nằm trên cả bản sáng lẫn bản tối.
 * Chạy: node scripts/nhap/lo28_so_do.mjs */
import { mkdirSync, writeFileSync } from "node:fs";

const DUONG = "#CBD5E1", NHA = "#EEF2FF", VIEN = "#94A3B8", CHU = "#0F172A";
const mo = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif"><rect width="${w}" height="${h}" fill="#fff"/>`;
const pho = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${DUONG}" stroke-width="26" stroke-linecap="round"/>`;
const o = (x, y, w, h, nhan, co = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${NHA}" stroke="${VIEN}"/><text x="${x + w / 2}" y="${y + h / 2 + co / 3}" text-anchor="middle" font-size="${co}" font-weight="700" fill="${CHU}">${nhan}</text>`;
const sao = (x, y) => `<text x="${x}" y="${y + 12}" text-anchor="middle" font-size="36" fill="#DC2626">★</text>`;
const mui = (x, y) => `<path d="M${x} ${y}h34m-10-9 10 9-10 9" fill="none" stroke="#DC2626" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;

/* Ai đi tới đâu (đang nhìn sang phải): trái = lên, phải = xuống; rẽ lên thì tay phải là phía đông. */
const ville = mo(800, 400)
  + pho(30, 200, 770, 200) + pho(260, 20, 260, 380) + pho(530, 20, 530, 380)
  + o(50, 30, 180, 140, "A") + o(290, 30, 210, 140, "B") + o(560, 30, 210, 140, "C")
  + o(50, 230, 180, 140, "D") + o(290, 230, 210, 140, "E") + o(560, 230, 210, 140, "F")
  + sao(26, 200) + mui(52, 200);

const tang = (y, nhan, trai, phai) => `<text x="16" y="${y + 34}" font-size="21" font-weight="700" fill="${CHU}">${nhan.split("/").map((t, i) => `<tspan x="16" dy="${i ? 24 : 0}">${t}</tspan>`).join("")}</text>`
  + o(170, y, 220, 76, trai, 22) + `<rect x="400" y="${y}" width="100" height="76" fill="${DUONG}"/><text x="450" y="${y + 44}" text-anchor="middle" font-size="16" fill="${CHU}">Ascenseur</text>` + o(510, y, 220, 76, phai, 22);
const immeuble = mo(760, 300)
  + tang(16, "2e/étage", "Salle 21", "Bibliothèque") + tang(108, "1er/étage", "Secrétariat", "Salle 12") + tang(200, "Rez-de-/chaussée", "Cafétéria", "Accueil");

const duong = (d, mau, net = "") => `<path d="${d}" fill="none" stroke="${mau}" stroke-width="6" stroke-linejoin="round" ${net}/>`;
const nhanDuong = (x, y, mau, t) => `<circle cx="${x}" cy="${y}" r="15" fill="${mau}"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">${t}</text>`;
const chemins = mo(800, 460)
  + pho(70, 400, 720, 400) + pho(70, 230, 720, 230) + pho(70, 60, 720, 60) + pho(70, 60, 70, 400) + pho(395, 60, 395, 400) + pho(720, 60, 720, 400)
  + o(105, 268, 255, 96, "Parc", 24) + o(430, 268, 255, 96, "Musée", 24) + o(105, 96, 255, 96, "École", 24) + o(430, 96, 255, 96, "Piscine", 24)
  + o(8, 415, 124, 40, "Gare", 20) + o(668, 8, 124, 36, "Hôtel", 20)
  + duong("M70 408H728V60", "#2563EB") + duong("M62 400V52H720", "#C2410C", 'stroke-dasharray="14 8"') + duong("M70 392H387V222H712V60", "#047857", 'stroke-dasharray="4 8" stroke-linecap="round"')
  + nhanDuong(560, 432, "#2563EB", "A") + nhanDuong(30, 200, "#C2410C", "B") + nhanDuong(560, 196, "#047857", "C");

mkdirSync("public/images/doc-a1", { recursive: true });
for (const [ten, noi] of Object.entries({ ville, immeuble, chemins })) writeFileSync(`public/images/doc-a1/${ten}.svg`, noi + "</svg>\n");
console.log("xong");
