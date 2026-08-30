/* Dò định danh được dùng — làm thẻ JSX hoặc làm hàm được gọi — nhưng chưa
   import và cũng không định nghĩa trong file. Bundler không bắt được loại lỗi
   này: chúng chỉ nổ lúc render, nên một màn hình có thể hỏng hoàn toàn mà
   `npm run build` vẫn xanh. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const files = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".js", ".jsx"].includes(extname(p))) files.push(p);
  }
})("src");

// Tên viết hoa có sẵn trong môi trường hoặc là hằng cục bộ hợp lệ.
const GLOBALS = new Set([
  "React", "Object", "Array", "String", "Number", "Boolean", "Date", "Math", "JSON",
  "Promise", "Map", "Set", "Error", "RegExp", "Intl", "URL", "Blob", "FileReader",
  "Image", "Audio", "Event", "KeyboardEvent", "CustomEvent", "DOMParser", "Infinity", "NaN",
  "HTMLInputElement", "HTMLSelectElement", "HTMLElement", "MutationObserver",
  /* Ghi âm phần nói — API sẵn có của trình duyệt, không import từ đâu cả. */
  "MediaRecorder", "MediaStream", "MediaStreamTrack",
  "URLSearchParams", "FormData", "AbortController", "File", "Response", "Request",
  "Headers", "TextEncoder", "TextDecoder", "WeakMap", "WeakSet", "Symbol", "BigInt",
  "Proxy", "Reflect", "Function", "AudioContext", "ResizeObserver", "IntersectionObserver",
  // Sẵn có trong môi trường, viết thường — chỉ gặp ở vị trí lời gọi hàm.
  "document", "window", "globalThis", "self", "console", "navigator", "location",
  "localStorage", "sessionStorage", "history", "screen", "performance", "crypto",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "queueMicrotask",
  "requestAnimationFrame", "cancelAnimationFrame", "requestIdleCallback",
  "parseInt", "parseFloat", "isNaN", "isFinite", "fetch", "structuredClone",
  "alert", "confirm", "prompt", "atob", "btoa", "encodeURIComponent",
  "decodeURIComponent", "encodeURI", "decodeURI", "require", "import", "super",
  "symbol", "bigint", "process",
]);

/* Thẻ nội tại của JSX. Chúng KHÔNG bao giờ cần import — React ánh xạ thẳng
   tên viết thường sang phần tử DOM — nên báo chúng là "thiếu import" luôn là
   báo động giả.

   Cần danh sách này vì bản dò lời gọi hàm nhầm `<th>…</th>` và `<tbody>` là
   `th(` và `tbody(`. Đó là lỗi của bộ tách mã, và danh sách này che nó đi
   thay vì sửa — chấp nhận được, vì kết quả cuối cùng đúng theo NGHĨA: thẻ
   viết thường không phải định danh phải import. Một bộ kiểm có báo động giả
   thì sớm muộn cũng bị bỏ qua, và khi đó nó không còn bắt được gì. */
const HTML_TAGS = new Set([
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi",
  "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite",
  "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn",
  "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure",
  "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup",
  "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend",
  "li", "link", "main", "map", "mark", "menu", "meta", "meter", "nav", "noscript",
  "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre",
  "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select",
  "slot", "small", "source", "span", "strong", "style", "sub", "summary", "sup",
  "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time",
  "title", "tr", "track", "u", "ul", "var", "video", "wbr",
  // SVG — dùng trong shared/avatars.jsx và các biểu đồ.
  "svg", "circle", "ellipse", "path", "rect", "line", "polyline", "polygon", "g",
  "defs", "clipPath", "linearGradient", "radialGradient", "stop", "text", "tspan",
  "mask", "pattern", "use", "foreignObject", "marker", "filter", "animate",
]);

// Từ khoá đứng trước "(" nhưng không phải lời gọi hàm.
const KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "typeof", "instanceof",
  "function", "await", "yield", "new", "delete", "void", "in", "of", "do",
  "else", "case", "throw", "with", "async", "get", "set", "constructor",
]);

/* Chỉ giữ lại phần MÃ, xoá chú thích, chuỗi, regex và chữ hiển thị trong JSX
   (thay bằng khoảng trắng để số dòng không đổi). Bắt buộc phải làm trước khi
   dò: chữ Pháp "Réponse (s)" trông y hệt một lời gọi hàm, còn dấu nháy trong
   "l'élève" sẽ nuốt mất code nếu coi nó là mở chuỗi. Thẻ JSX và biểu thức
   trong {…} vẫn được giữ nguyên vì đó mới là mã thật. */
function codeOnly(src) {
  const out = new Array(src.length).fill(" ");
  for (let k = 0; k < src.length; k++) if (src[k] === "\n") out[k] = "\n";
  const keep = (k) => { out[k] = src[k]; };
  const modes = [{ t: "code", depth: 0 }];
  const top = () => modes[modes.length - 1];

  // Ký tự (hoặc từ khoá) đứng ngay trước quyết định "<" là JSX hay phép so sánh,
  // và "/" là regex hay phép chia.
  const prefixAllows = (k) => {
    let j = k - 1;
    while (j >= 0 && /\s/.test(src[j])) j--;
    if (j < 0) return true;
    if (/[({[,;:=<>&|!?+\-*%^~}]/.test(src[j])) return true;
    let e = j;
    while (j >= 0 && /[\w$]/.test(src[j])) j--;
    return KEYWORDS.has(src.slice(j + 1, e + 1));
  };

  let i = 0;
  while (i < src.length) {
    const m = top();
    const c = src[i];

    if (m.t === "jsxtext") {
      if (c === "<") {
        if (src[i + 1] === "/") {           // thẻ đóng: kết thúc phần tử
          while (i < src.length && src[i] !== ">") i++;
          i++; modes.pop(); continue;
        }
        keep(i); modes.push({ t: "tag" }); i++; continue;
      }
      if (c === "{") { modes.push({ t: "code", depth: 0, closeTo: "jsxtext" }); i++; continue; }
      i++; continue;                        // chữ hiển thị → bỏ
    }

    if (m.t === "tmpl") {
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { modes.pop(); i++; continue; }
      if (c === "$" && src[i + 1] === "{") { modes.push({ t: "code", depth: 0, closeTo: "tmpl" }); i += 2; continue; }
      i++; continue;
    }

    if (m.t === "tag") {
      if (c === '"' || c === "'") { i++; while (i < src.length && src[i] !== c) i += src[i] === "\\" ? 2 : 1; i++; continue; }
      if (c === "{") { modes.push({ t: "code", depth: 0, closeTo: "tag" }); i++; continue; }
      if (c === "/" && src[i + 1] === ">") { modes.pop(); i += 2; continue; }
      if (c === ">") { modes.pop(); modes.push({ t: "jsxtext" }); i++; continue; }
      keep(i); i++; continue;
    }

    // mode "code"
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'") { i++; while (i < src.length && src[i] !== c) i += src[i] === "\\" ? 2 : 1; i++; continue; }
    if (c === "`") { modes.push({ t: "tmpl" }); i++; continue; }
    /* Gặp thẻ đóng trong mode code nghĩa là trước đó đã lệch nhịp một nấc.
       Nuốt thẻ rồi gỡ ngăn xếp tới lớp jsxtext gần nhất để bắt nhịp lại —
       nếu không, "/div>" phía sau sẽ bị hiểu thành regex và nuốt luôn hàng
       chục dòng mã thật. */
    if (c === "<" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== ">") i++;
      i++;
      while (modes.length > 1 && modes.pop().t !== "jsxtext");
      continue;
    }
    if (c === "/" && prefixAllows(i)) {      // regex literal
      i++;
      let cls = false;
      while (i < src.length && (cls || src[i] !== "/")) {
        if (src[i] === "\\") i++;
        else if (src[i] === "[") cls = true;
        else if (src[i] === "]") cls = false;
        i++;
      }
      i++; continue;
    }
    if (c === "<" && /[A-Za-z_$>]/.test(src[i + 1] || "") && prefixAllows(i)) {
      keep(i); modes.push({ t: "tag" }); i++; continue;
    }
    if (c === "{") { m.depth++; keep(i); i++; continue; }
    if (c === "}") {
      if (m.depth === 0 && m.closeTo) { modes.pop(); i++; continue; }
      if (m.depth > 0) m.depth--;
      keep(i); i++; continue;
    }
    keep(i); i++;
  }
  return out.join("");
}

let problems = 0;

for (const file of files) {
  const src = codeOnly(readFileSync(file, "utf8"));

  const imported = new Set();
  for (const m of src.matchAll(/import\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from/g)) {
    if (m[1]) imported.add(m[1]);
    if (m[2]) {
      for (const part of m[2].split(",")) {
        const name = part.trim().split(/\s+as\s+/).pop().trim();
        if (name) imported.add(name);
      }
    }
  }

  const ID = "[A-Za-z_$][\\w$]*";
  const declared = new Set();
  const declare = (name) => { if (new RegExp(`^${ID}$`).test(name)) declared.add(name); };

  for (const m of src.matchAll(new RegExp(`(?:^|\\n)\\s*(?:export\\s+(?:default\\s+)?)?(?:async\\s+)?(?:function(?:\\s*\\*)?|class)\\s+(${ID})`, "g"))) declare(m[1]);
  for (const m of src.matchAll(new RegExp(`(?:^|[^\\w$.])(?:const|let|var)\\s+(${ID})`, "g"))) declare(m[1]);
  // Định nghĩa method trong class / object literal: `name(a, b) {` — không phải lời gọi.
  for (const m of src.matchAll(new RegExp(`(?:^|\\n)\\s*(?:static\\s+)?(?:async\\s+)?\\*?\\s*(${ID})\\s*\\([^()]*\\)\\s*\\{`, "g"))) declare(m[1]);
  // Nhãn `name:` trong object literal — giá trị có thể là hàm, gọi qua obj.name(.
  for (const m of src.matchAll(new RegExp(`(?:^|[,{\\n])\\s*(${ID})\\s*:`, "g"))) declare(m[1]);
  // Tham số huỷ cấu trúc đối tượng, gồm cả { Icon } và { onSave }.
  for (const m of src.matchAll(/(?:const|let|var|\(|,|=>|\{)\s*\{([^{}]*)\}/g)) {
    for (const part of m[1].split(",")) declare(part.trim().split(":").pop().trim().replace(/\s*=[\s\S]*/, "").replace(/^\.\.\./, ""));
  }
  // Huỷ cấu trúc mảng: ([k, label, Icon]) => … / const [a, setA] = …
  for (const m of src.matchAll(/\[([^\][\n]*)\]\s*(?:=[^=>]|\)?\s*=>)/g)) {
    for (const part of m[1].split(",")) declare(part.trim().replace(/\s*=[\s\S]*/, "").replace(/^\.\.\./, ""));
  }
  // Tham số hàm: function f(a, b), (a, b) =>, catch (err), a => …
  for (const m of src.matchAll(new RegExp(`(?:function\\s*\\*?\\s*${ID}?|catch|=>|\\)\\s*=>)?\\s*\\(([^()]*)\\)\\s*(?:=>|\\{)`, "g"))) {
    for (const part of m[1].split(",")) declare(part.trim().split("=")[0].trim().replace(/^\.\.\./, ""));
  }
  for (const m of src.matchAll(new RegExp(`(?:^|[^\\w$.)])(${ID})\\s*=>`, "g"))) declare(m[1]);

  const used = new Map();
  for (const m of src.matchAll(/<([A-Z][\w$.]*)/g)) used.set(m[1].split(".")[0], "JSX");
  // Vị trí lời gọi hàm: `name(` không đứng sau dấu chấm (loại obj.method()),
  // không đứng sau `?.`, `function`, `new`… và không phải từ khoá.
  for (const m of src.matchAll(new RegExp(`(?:^|[^\\w$.?])(${ID})\\s*\\(`, "g"))) {
    if (KEYWORDS.has(m[1]) || used.has(m[1])) continue;
    used.set(m[1], "lời gọi hàm");
  }

  const missing = [...used].filter(([n]) =>
    !imported.has(n) && !declared.has(n) && !HTML_TAGS.has(n) && !GLOBALS.has(n));
  if (missing.length) {
    problems += missing.length;
    console.log(`FAIL  ${file}`);
    for (const [n, kind] of missing) console.log(`        ${n}  — dùng ở ${kind} nhưng không import, không định nghĩa`);
  }
}

console.log(problems ? `\n${problems} định danh thiếu` : "\nKhông có định danh nào thiếu");
process.exit(problems ? 1 : 0);
