/* Lô 26 (29/10): thay bộ đề nói B2 bằng 15 sujet của đề TP68 (bản giám khảo) chủ dự án gửi.
 * Cả 6 đề B2 dùng CHUNG 15 sujet: bốc hai, chọn một, như phòng thi thật.
 * Lượt thi cũ không hỏng: đề đã bốc được chép sẵn ở po_cham.de_boc.
 * Chạy: node scripts/nhap/lo26_b2_po_tp68.mjs > lo26.sql */
import fs from "node:fs";

const ID = ["nhapmur616oz002", "nhapmv3lbczp018", "lo18mv42hjcr04y", "lo23mven531h03k", "lo23mven72cw03t", "lo23mven91gc042"];
const ds = JSON.parse(fs.readFileSync(new URL("./lo26_b2_po_tp68.json", import.meta.url), "utf8"));
if (ds.length !== 15) throw new Error("Cần 15 sujet, có " + ds.length);

const p = (...xs) => xs.map((x) => `<p>${x}</p>`).join("");
const sujets = ds.map((s) => ({ ma: s.ma, html: p(`<strong>${s.titre}</strong>`, s.texte, ...(s.note ? [`<em>* ${s.note}</em>`] : [])) }));
const consigne = p("<strong>Production orale : 20 minutes environ.</strong> 30 minutes de préparation.",
  "Vous tirez au sort deux sujets et vous en choisissez un. Vous dégagerez le problème soulevé par le document que vous avez choisi puis vous présenterez votre opinion sur le sujet de manière claire et argumentée (5 à 7 minutes). Vous défendrez votre point de vue au cours du débat avec l'examinateur (10 à 13 minutes).");
const bocTham = { chuanBi: 30, phan: [{ ten: "Monologue suivi puis exercice en interaction", cachLam: "Choisissez un document.", soRut: 2, sujets }] };

const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const out = `update public.exercises set consigne = ${q(consigne)}, meta = meta || ${q(JSON.stringify({ bocTham }))}::jsonb where id in (${ID.map(q).join(", ")});`;
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);
