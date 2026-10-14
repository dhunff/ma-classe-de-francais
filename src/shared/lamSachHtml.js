/* Lọc HTML do HỌC SINH viết trước khi hiển thị bằng dangerouslySetInnerHTML
 * (15/10, rà bảo mật vibe-check, nhóm XSS).
 *
 * Bài tự luận được hiện lại cho chính học sinh và cho GIÁO VIÊN ở màn chấm. Nộp
 * `<img src=x onerror=…>` là chạy mã trong trình duyệt giáo viên. CSP
 * (vercel.json, script-src 'self') đã chặn mã chèn trong thuộc tính, đây là lớp
 * thứ hai: chỉ giữ thẻ định dạng chữ, bỏ MỌI thuộc tính, bỏ hẳn thẻ nguy hiểm.
 * Dùng DOMParser của trình duyệt (không chạy script khi phân tích). */
const THE_GIU = new Set(["P", "BR", "B", "STRONG", "I", "EM", "U", "S", "UL", "OL", "LI", "SPAN", "DIV", "BLOCKQUOTE", "SUB", "SUP"]);
const THE_BO_HAN = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META", "TEMPLATE", "SVG", "MATH", "FORM", "INPUT", "TEXTAREA", "BUTTON", "SELECT"]);

export function lamSachHtml(html) {
  if (html == null) return "";
  const s = String(html);
  if (!/[<&]/.test(s)) return s;
  if (typeof DOMParser === "undefined") return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const doc = new DOMParser().parseFromString(`<div>${s}</div>`, "text/html");
  const goc = doc.body.firstChild;
  const duyet = (nut) => {
    for (const con of [...nut.childNodes]) {
      if (con.nodeType === 3) continue;                          // chữ: giữ
      if (con.nodeType !== 1) { con.remove(); continue; }       // chú thích…: bỏ
      if (THE_BO_HAN.has(con.tagName)) { con.remove(); continue; }
      duyet(con);
      if (!THE_GIU.has(con.tagName)) { con.replaceWith(...con.childNodes); continue; }   // thẻ lạ: giữ chữ bên trong
      for (const a of [...con.attributes]) con.removeAttribute(a.name);
    }
  };
  duyet(goc);
  return goc.innerHTML;
}
