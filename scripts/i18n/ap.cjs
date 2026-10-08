/* Áp bản dịch: thay chữ viết cứng bằng tr("vi", "fr", "en").
 *
 * node scripts/i18n/ap.cjs <ban-dich.json>
 * ban-dich.json = { "<file>": { "<chữ gốc>": ["<fr>", "<en>"] } }
 *
 * Chữ gốc có thể là tiếng Việt HOẶC tiếng Pháp. Nếu gốc là tiếng Pháp, ghi
 * ["<vi>", "<en>"] kèm cờ: khoá bắt đầu bằng "FR:" (ví dụ "FR:Consigne").
 *
 * Chỉ thay JSXText / StringLiteral nằm TRONG một hàm (chuỗi cấp module tính
 * một lần lúc nạp file, tr() ở đó sẽ đứng yên) — chuỗi cấp module được báo ra
 * để sửa tay. Template literal không đụng tới. */
const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");

const banDich = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const js = (s) => JSON.stringify(s);
const BO_ATTR = new Set(["className", "key", "id", "type", "role", "href", "to", "src", "name", "rel", "target", "method", "autoComplete", "inputMode", "lang", "htmlFor", "style"]);
const HAM = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ObjectMethod", "ClassMethod"]);

for (const [file, bang] of Object.entries(banDich)) {
  let src = fs.readFileSync(file, "utf8");
  const crlf = src.includes("\r\n");
  src = src.replace(/\r\n/g, "\n");
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"] });
  const tim = (chu) => {
    if (bang[chu]) return { vi: chu, fr: bang[chu][0], en: bang[chu][1] };
    if (bang["FR:" + chu]) return { vi: bang["FR:" + chu][0], fr: chu, en: bang["FR:" + chu][1] };
    return null;
  };
  const sua = [];   // { start, end, thay }
  const capModule = [];
  const duyet = (node, cha, trongHam) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "ImportDeclaration") return;
    const ham = trongHam || HAM.has(node.type);
    if (node.type === "JSXText") {
      const t = node.value.replace(/\s+/g, " ").trim();
      const d = t && tim(t);
      if (d) {
        if (!ham) capModule.push(t);
        else {
          const dau = node.value.match(/^\s*/)[0], cuoi = node.value.match(/\s*$/)[0];
          sua.push({ start: node.start, end: node.end, thay: `${dau}{tr(${js(d.vi)}, ${js(d.fr)}, ${js(d.en)})}${cuoi}` });
        }
      }
    } else if (node.type === "StringLiteral") {
      const laAttr = cha?.type === "JSXAttribute";
      const laKhoa = cha?.type === "ObjectProperty" && cha.key === node;
      const d = !laKhoa && !(laAttr && BO_ATTR.has(cha.name?.name)) && tim(node.value);
      if (d) {
        if (!ham) capModule.push(node.value);
        else sua.push({ start: node.start, end: node.end, thay: laAttr ? `{tr(${js(d.vi)}, ${js(d.fr)}, ${js(d.en)})}` : `tr(${js(d.vi)}, ${js(d.fr)}, ${js(d.en)})` });
      }
    }
    for (const k of Object.keys(node)) {
      if (["loc", "start", "end", "leadingComments", "trailingComments", "innerComments", "extra"].includes(k)) continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach((x) => duyet(x, node, ham));
      else if (v && typeof v.type === "string") duyet(v, node, ham);
    }
  };
  duyet(ast.program, null, false);
  sua.sort((a, b) => b.start - a.start).forEach((x) => { src = src.slice(0, x.start) + x.thay + src.slice(x.end); });

  /* Import tr. */
  if (sua.length && !/\btr\b[^\n]*from "[^"]*i18n\.jsx"/.test(src)) {
    const rel = path.relative(path.dirname(file), "src/shared/i18n.jsx").replace(/\\/g, "/");
    const duongDan = rel.startsWith(".") ? rel : "./" + rel;
    const m = src.match(/import \{([^}]*)\} from ["']([^"']*i18n\.jsx)["'];?/);
    if (m) src = src.replace(m[0], `import {${m[1].replace(/\s*$/, "")}, tr } from "${m[2]}";`);
    else {
      const cuoiImport = [...src.matchAll(/^import [^\n]*\n/gm)].pop();
      const vt = cuoiImport ? cuoiImport.index + cuoiImport[0].length : 0;
      src = src.slice(0, vt) + `import { tr } from "${duongDan}";\n` + src.slice(vt);
    }
  }
  const thieu = Object.keys(bang).filter((k) => !src.includes(js(k.replace(/^FR:/, ""))) );
  if (crlf) src = src.replace(/\n/g, "\r\n");
  fs.writeFileSync(file, src);
  console.log(`${file}: thay ${sua.length}` + (capModule.length ? ` · CẤP MODULE (sửa tay): ${JSON.stringify(capModule)}` : "") + (thieu.length ? ` · KHÔNG KHỚP: ${JSON.stringify(thieu.slice(0, 5))}` : ""));
}
