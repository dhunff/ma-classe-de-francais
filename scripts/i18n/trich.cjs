/* Trích chữ giao diện viết cứng (tiếng Việt / tiếng Pháp) khỏi các file JSX.
 *
 * Dùng @babel/parser để chỉ lấy đúng ba loại nút, KHÔNG đụng chú thích:
 *   · JSXText              — chữ giữa hai thẻ
 *   · StringLiteral        — chuỗi trong mã (bỏ qua className, import, key…)
 *   · TemplateLiteral      — liệt kê riêng (có ${}), sửa tay
 *
 * Chạy: node scripts/i18n/trich.cjs <file…>  → in JSON { file: [{ loai, chu }] }
 * Đi kèm ap.cjs (áp bản dịch). */
const fs = require("fs");
const { parse } = require("@babel/parser");

const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹĂÂĐÊÔƠƯ]/;
const FR = /\b(Annuler|Envoyer|Supprimer|Enregistrer|Fermer|Terminer|Réponse|réponse|élève|élèves|Élève|Consigne|Justifi\w*|Ta |Ton |Votre|votre|Vous|vous|Cliquez|Quitter|Rendu|rendu|Aucun\w*|Exercice|exercice|questions?\b|Ma |Mon |Mes |Non noté|Temps|Envoi|copie|Corrigé|Choix|attendue?)\b/;
const BO_ATTR = new Set(["className", "key", "id", "type", "role", "href", "to", "src", "name", "rel", "target", "method", "autoComplete", "inputMode", "lang", "htmlFor", "style"]);

/* VI2: chữ Việt chỉ mang dấu sắc/huyền (bài, phút, dùng) — dấu cũng có ở tiếng
   Pháp nên chỉ tính khi đi cùng âm tiết không phải tiếng Pháp. Bật bằng RONG=1. */
const VI2 = new RegExp("(^|[^A-Za-zÀ-ỹ])(" + "bài|phút|dùng|chung|câu|lượt|các|có|là|và|về|tới|mới|khi|chỉ|đã|học|sinh|giáo|viên|điểm|đề|thi|phần|bấm|xem|lại|không|của|cho|trong|này|đó|một" + ")($|[^A-Za-zÀ-ỹ])", "i");
function can(chu) { return (VI.test(chu) || FR.test(chu) || (process.env.RONG && VI2.test(chu))) && /[A-Za-zÀ-ỹ]{2,}/.test(chu); }

function duyet(node, cha, kq) {
  if (!node || typeof node.type !== "string") return;
  /* Đã qua tr(...) thì bỏ qua cả cây con. */
  if (node.type === "CallExpression" && node.callee?.name === "tr") return;
  if (node.type === "CallExpression" && node.callee?.type === "MemberExpression" && node.callee.object?.name === "console") return;
  if (node.type === "ImportDeclaration" || node.type === "ExportAllDeclaration") return;
  if (node.type === "JSXText") {
    const t = node.value.replace(/\s+/g, " ").trim();
    if (t && can(t)) kq.push({ loai: "jsx", chu: t });
  } else if (node.type === "StringLiteral") {
    const t = node.value;
    const laAttr = cha?.type === "JSXAttribute";
    const tenAttr = laAttr ? cha.name?.name : null;
    const laKhoa = cha?.type === "ObjectProperty" && cha.key === node;
    if (!laKhoa && !(laAttr && BO_ATTR.has(tenAttr)) && can(t) && !/^[\w.-]+$/.test(t)) kq.push({ loai: laAttr ? "attr" : "str", chu: t });
  } else if (node.type === "TemplateLiteral") {
    const t = node.quasis.map((q) => q.value.cooked).join("${…}");
    if (can(t)) kq.push({ loai: "tpl", chu: t });
  }
  for (const k of Object.keys(node)) {
    if (k === "loc" || k === "start" || k === "end" || k === "leadingComments" || k === "trailingComments" || k === "innerComments") continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((x) => duyet(x, node, kq));
    else if (v && typeof v.type === "string") duyet(v, node, kq);
  }
}

const ra = {};
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, "utf8");
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"] });
  const kq = [];
  duyet(ast.program, null, kq);
  const da = new Set();
  ra[file] = kq.filter((x) => { const k = x.loai + "|" + x.chu; if (da.has(k)) return false; da.add(k); return true; });
}
console.log(JSON.stringify(ra, null, 1));
