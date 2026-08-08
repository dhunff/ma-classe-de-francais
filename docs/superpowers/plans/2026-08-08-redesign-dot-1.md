# Ma Classe — Đợt 1: Nền tảng và mặt tiền

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng hệ design token thật cho `ma-classe`, gỡ import vòng, tách `App.jsx`, rồi làm lại màn hình đăng nhập và vỏ ứng dụng theo hướng thiết kế mới.

**Architecture:** Toàn bộ màu, chữ, khoảng cách chuyển vào `src/styles/*.css` dưới dạng biến CSS. Hai object `C` và `S` trong `App.jsx` được trỏ vào các biến đó, nên ~512 inline style hiện có đổi theo mà không cần sửa JSX. Sau đó gỡ import vòng `App.jsx ⇄ PracticeHub.jsx` bằng cách hạ mọi thứ dùng chung xuống `src/shared/`, tách `App.jsx` theo ranh giới component có sẵn, và làm lại `Login` + vỏ app.

**Tech Stack:** React 18, Vite 5, CSS thuần (không thêm thư viện), Node ≥ 18 cho script kiểm tra.

**Spec:** `docs/superpowers/specs/2026-08-08-ma-classe-redesign-design.md`

## Global Constraints

- **Không đổi hành vi.** Logic lưu trữ, chấm điểm, i18n, phân quyền giữ nguyên. Đây là việc thiết kế lại.
- **Không thêm dependency.** `package.json` không được có mục mới.
- **Ba ngôn ngữ.** Mọi chuỗi mới phải thêm đủ vào `I18N.vi`, `I18N.fr`, `I18N.en`.
- **Tương phản:** chữ ≥ 4.5:1, phần tử giao diện ≥ 3:1, ở cả bản sáng lẫn bản tối.
- **Responsive xuống 360px.** Không có thanh cuộn ngang ở cấp trang.
- **`prefers-reduced-motion: reduce`** phải tắt mọi transition và animation.
- **Focus bàn phím thấy được** trên mọi phần tử tương tác, qua `:focus-visible`.
- **Selector CSS:** cấm selector kiểu phần-tử-gắn-class (`button.mcf-btn`, `div.mcf-card`) — đây là nguồn chiến tranh specificity. **Cho phép** phần tử con trong phạm vi một class gốc (`.mcf-table th`, `.mcf-float button`) vì chúng không cạnh tranh với class nào.
- **`!important`:** cấm ở mọi nơi, **trừ đúng một ngoại lệ** — khối `@media (prefers-reduced-motion: reduce)` trong `base.css`. Khối đó phải đè được cả inline style, nên không có `!important` thì nó vô tác dụng và vi phạm ràng buộc reduced-motion ngay bên dưới. Không được viện ngoại lệ này cho bất kỳ khối nào khác.
- **Một phần tử hoặc dùng inline hoặc dùng class, không trộn** — inline luôn thắng class.
- **Không file nào được import từ `App.jsx`** sau Task 5.
- Sau mỗi task: `npm run build` phải chạy được.

---

### Task 1: Script kiểm tra thiết kế

Dự án không có test nào. Task này dựng một guard chạy được để các task sau có tiêu chí đỏ/xanh thật thay vì cảm tính.

**Files:**
- Create: `scripts/check-design.mjs`
- Modify: `package.json` (thêm script `check:design`)

**Interfaces:**
- Produces: lệnh `npm run check:design`. Thoát mã 0 nếu mọi kiểm tra đạt, mã 1 nếu có kiểm tra trượt. In từng kiểm tra kèm `PASS`/`FAIL`.

- [ ] **Step 1: Viết script kiểm tra**

Tạo `scripts/check-design.mjs`:

```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SRC = "src";
const files = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if ([".js", ".jsx"].includes(extname(p))) files.push(p);
  }
})(SRC);
const read = (p) => readFileSync(p, "utf8");
const results = [];
const check = (name, ok, detail = "") => results.push({ name, ok, detail });

// --- 1. Không còn màu và font của thiết kế cũ trong mã nguồn ---
const BANNED = ["#3D5AF1", "#F26B4E", "Playfair", "Lora", "C.accent"];
for (const token of BANNED) {
  const hits = files.filter((f) => read(f).includes(token));
  check(`banned:${token}`, hits.length === 0, hits.join(", "));
}

// --- 2. Font nạp qua index.html, không qua @import trong JS ---
const jsHasImport = files.some((f) => read(f).includes("@import url('https://fonts.googleapis"));
check("fonts:no-js-import", !jsHasImport);
const html = read("index.html");
check("fonts:link-in-html", html.includes("fonts.googleapis.com/css2"));
for (const fam of ["Be+Vietnam+Pro", "Bricolage+Grotesque", "Newsreader"]) {
  check(`fonts:${fam}`, html.includes(fam));
}

// --- 3. Không file nào import từ App.jsx ---
const importers = files.filter((f) => f !== join("src", "App.jsx") && /from\s+["'][^"']*App\.jsx["']/.test(read(f)));
check("imports:no-app-jsx-importers", importers.length === 0, importers.join(", "));

// --- 4. Tương phản màu theo WCAG 2.1 ---
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const safe = (label, fn) => { try { fn(); } catch (e) { check(label, false, e.message); } };

let css = "";
try {
  css = readFileSync("src/styles/tokens.css", "utf8");
  check("tokens:file-exists", true);
} catch {
  check("tokens:file-exists", false, "chưa có src/styles/tokens.css");
}
const varOf = (name, scope) => {
  const start = css.indexOf(scope);
  if (start === -1) throw new Error(`không tìm thấy khối ${scope}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const block = css.slice(open, close === -1 ? css.length : close + 1);
  const m = block.match(new RegExp(`--mcf-${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`không tìm thấy --mcf-${name} trong ${scope}`);
  return m[1];
};

const suites = [
  { scope: ":root", label: "light", min: 4.5, pairs: [["ink", "bg"], ["soft", "surface"], ["primary", "surface"], ["ok", "surface"], ["warn", "surface"], ["danger", "surface"]] },
  { scope: "html.mcf-dark-root", label: "dark", min: 4.5, pairs: [["ink", "bg"], ["soft", "surface"], ["primary", "surface"], ["ok", "surface"], ["warn", "surface"], ["danger", "surface"]] },
];
for (const s of suites) {
  for (const [fg, bg] of s.pairs) {
    safe(`contrast:${s.label}:${fg}/${bg}`, () => {
      const r = ratio(varOf(fg, s.scope), varOf(bg, s.scope));
      check(`contrast:${s.label}:${fg}/${bg}`, r >= s.min, `${r.toFixed(2)} < ${s.min}`);
    });
  }
  safe(`contrast:${s.label}:line-strong/surface`, () => {
    const r = ratio(varOf("line-strong", s.scope), varOf("surface", s.scope));
    check(`contrast:${s.label}:line-strong/surface`, r >= 3, `${r.toFixed(2)} < 3`);
  });
}

// --- 5. Thang cấp độ ---
safe("level:scale", () => {
  const levels = readFileSync("src/shared/tokens.js", "utf8");
  const grab = (obj) => {
    const m = levels.match(new RegExp(`${obj}\\s*=\\s*\\{([^}]*)\\}`));
    if (!m) throw new Error(`không tìm thấy ${obj}`);
    return Object.fromEntries([...m[1].matchAll(/"?([A-B][12]\+?)"?\s*:\s*"(#[0-9A-Fa-f]{6})"/g)].map((x) => [x[1], x[2]]));
  };
  const fg = grab("LEVEL_COLORS"), bg = grab("LEVEL_PASTEL");
  for (const lv of Object.keys(fg)) {
    const onPastel = ratio(fg[lv], bg[lv]);
    const onWhite = ratio(fg[lv], varOf("surface", ":root"));
    check(`level:${lv}`, onPastel >= 4.5 && onWhite >= 4.5, `pastel ${onPastel.toFixed(2)}, surface ${onWhite.toFixed(2)}`);
  }
});

// --- Kết quả ---
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail && !r.ok ? `  → ${r.detail}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} đạt`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Thêm script vào package.json**

Trong `"scripts"`, thêm dòng sau `"preview": "vite preview"`:

```json
"check:design": "node scripts/check-design.mjs"
```

- [ ] **Step 3: Chạy để xác nhận nó trượt**

```bash
npm run check:design --prefix ma-classe/ma-classe
```

Kết quả mong đợi: **thoát mã 1**, in ra danh sách gồm `FAIL tokens:file-exists`, `FAIL banned:#3D5AF1`, `FAIL banned:#F26B4E`, `FAIL banned:Playfair`, `FAIL banned:Lora`, `FAIL banned:C.accent`, `FAIL fonts:no-js-import`, `FAIL fonts:link-in-html`, `FAIL imports:no-app-jsx-importers`, cùng các `FAIL contrast:*` và `FAIL level:scale`.

Script **phải chạy hết và in bảng kết quả**, không được văng exception giữa chừng — nếu nó văng thì hàm `safe()` chưa bọc đúng chỗ. Đây là trạng thái đúng: guard đang đỏ toàn tập.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-design.mjs package.json
git commit -m "Add design token guard script"
```

---

### Task 2: Token và base CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`
- Modify: `index.html` (nạp font), `src/main.jsx` (import CSS)

**Interfaces:**
- Produces: biến CSS `--mcf-bg`, `--mcf-surface`, `--mcf-card`, `--mcf-surface2`, `--mcf-ink`, `--mcf-soft`, `--mcf-line`, `--mcf-line-strong`, `--mcf-primary`, `--mcf-primarysoft`, `--mcf-ok`, `--mcf-oksoft`, `--mcf-warn`, `--mcf-warnsoft`, `--mcf-danger`, `--mcf-dangersoft`; token khoảng cách `--sp-1`…`--sp-10`; bo góc `--r-sm`, `--r-md`, `--r-full`; bóng `--sh-1`, `--sh-2`; họ chữ `--f-display`, `--f-ui`, `--f-read`.
- Consumes: không có.

- [ ] **Step 1: Tạo tokens.css**

Tạo `src/styles/tokens.css`:

```css
:root {
  --mcf-bg: #F5F5F7;
  --mcf-surface: #FFFFFF;
  --mcf-card: #FFFFFF;
  --mcf-surface2: #FAFAFC;
  --mcf-ink: #23232E;
  --mcf-soft: #6E7280;
  --mcf-line: #E4E4EA;
  --mcf-line-strong: #8E8E99;
  --mcf-primary: #5B4B9E;
  --mcf-primarysoft: #EFECF9;
  --mcf-ok: #2F7D5C;
  --mcf-oksoft: #E6F3EC;
  --mcf-warn: #9A6111;
  --mcf-warnsoft: #FBF1E0;
  --mcf-danger: #C43636;
  --mcf-dangersoft: #FBEAEA;

  --f-display: 'Bricolage Grotesque', 'Be Vietnam Pro', sans-serif;
  --f-ui: 'Be Vietnam Pro', -apple-system, 'Segoe UI', sans-serif;
  --f-read: 'Newsreader', Georgia, serif;

  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px; --sp-5: 24px;
  --sp-6: 32px; --sp-7: 40px; --sp-8: 48px; --sp-9: 64px; --sp-10: 80px;

  --r-sm: 8px; --r-md: 12px; --r-full: 999px;

  --sh-1: 0 1px 2px rgba(35,35,46,.06), 0 1px 3px rgba(35,35,46,.04);
  --sh-2: 0 8px 24px rgba(35,35,46,.10);
}

html.mcf-dark-root,
html.mcf-dark-root body,
.mcf-root.mcf-dark {
  --mcf-bg: #16161C;
  --mcf-surface: #1E1E27;
  --mcf-card: #1E1E27;
  --mcf-surface2: #14141A;
  --mcf-ink: #E6E6EC;
  --mcf-soft: #9A9AA8;
  --mcf-line: #33333F;
  --mcf-line-strong: #6E6E82;
  --mcf-primary: #9E8FD8;
  --mcf-primarysoft: #2A2440;
  --mcf-ok: #4FA07C;
  --mcf-oksoft: #14301F;
  --mcf-warn: #D0982F;
  --mcf-warnsoft: #33280F;
  --mcf-danger: #E07070;
  --mcf-dangersoft: #331A1A;

  --sh-1: 0 1px 2px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.25);
  --sh-2: 0 8px 24px rgba(0,0,0,.45);
}
```

`.mcf-float` là lớp cho phần tử render qua Portal ra `document.body` — nằm ngoài `.mcf-root` nên phải đọc biến từ `:root`. Vì `:root` đã khai báo đủ, không cần làm gì thêm.

- [ ] **Step 2: Tạo base.css**

Tạo `src/styles/base.css`:

```css
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--mcf-bg);
  color: var(--mcf-ink);
  font-family: var(--f-ui);
  -webkit-font-smoothing: antialiased;
}

.mcf-float {
  font-family: var(--f-ui);
  color: var(--mcf-ink);
}
.mcf-float button,
.mcf-float input,
.mcf-float textarea,
.mcf-float select { font-family: inherit; }

.mcf-dark input,
.mcf-dark textarea,
.mcf-dark select { color: var(--mcf-ink); }

:focus-visible {
  outline: 2px solid var(--mcf-primary);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}

.mcf-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.mcf-scroll::-webkit-scrollbar-track { background: transparent; }
.mcf-scroll::-webkit-scrollbar-thumb { background: var(--mcf-line-strong); border-radius: var(--r-full); }
.mcf-scroll { scrollbar-width: thin; scrollbar-color: var(--mcf-line-strong) transparent; }

.mcf-wide { position: relative; left: 50%; transform: translateX(-50%); width: min(100vw - 24px, 1600px); }

mark.mcf-hl { background: var(--mcf-warnsoft); color: var(--mcf-ink); border-radius: var(--r-sm); padding: 0 2px; }

@keyframes mcfSpin { to { transform: rotate(360deg); } }
.mcf-spin { animation: mcfSpin .7s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

Ba thay đổi so với khối `FONTS` cũ, mỗi thay đổi có lý do:
- `input:focus { outline: none; ... }` (`App.jsx:178`) **bị bỏ**, thay bằng `:focus-visible` — quy tắc cũ xoá vòng focus của trình duyệt, vi phạm sàn chất lượng.
- `.mcf-card { animation: fadeUp ... }` **bị bỏ**. Mọi thẻ tự chạy animation là hiệu ứng rải rác; spec chỉ cho phép một khoảnh khắc lúc tải landing.
- `.mcf-dark img { filter: brightness(.92) }` **bị bỏ** — làm mờ ảnh bài tập của học sinh trong bản tối là mất thông tin.
- `button:hover { transform: translateY(-1px) }` **bị bỏ**; chuyển thành đổi nền, xử lý trong `components.css` ở Task 7.

- [ ] **Step 3: Nạp font trong index.html**

Trong `index.html`, thêm ngay trước `</head>`:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@400..800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap"
      rel="stylesheet"
    />
```

Cả ba URL con đã được xác minh trả về HTTP 200 kèm subset tiếng Việt (`U+1EA0-1EF9`).

- [ ] **Step 4: Nạp CSS trong main.jsx**

Trong `src/main.jsx`, thêm hai dòng ngay sau `import ReactDOM from 'react-dom/client'`:

```jsx
import './styles/tokens.css'
import './styles/base.css'
```

Thứ tự quan trọng: `tokens` trước `base`.

- [ ] **Step 5: Chạy guard**

```bash
npm run check:design --prefix ma-classe/ma-classe
```

Mong đợi: mọi kiểm tra `contrast:*` và `fonts:*` chuyển sang **PASS**. Các kiểm tra `banned:*`, `imports:*`, `level:*` vẫn **FAIL** (Task 3–5 mới xử lý). Script vẫn thoát mã 1.

- [ ] **Step 6: Xác nhận app còn chạy**

```bash
npm run build --prefix ma-classe/ma-classe
```

Mong đợi: build thành công. Giao diện lúc này còn xấu và lệch tông vì `C`/`S` chưa trỏ vào token — đó là bình thường, Task 3 xử lý.

- [ ] **Step 7: Commit**

```bash
git add src/styles index.html src/main.jsx
git commit -m "Add design tokens and base stylesheet"
```

---

### Task 3: Trỏ C và S vào token

**Files:**
- Modify: `src/App.jsx:23-27` (object `C`), `src/App.jsx:198-213` (object `S`), `src/App.jsx:152-196` (xoá khối `FONTS`), `src/App.jsx:452` (xoá `<style>{FONTS}</style>`)
- Modify: `src/App.jsx:547`, `:968`, `:1268`, `:1368`, `:2598` (năm chỗ dùng `C.accent`)

**Interfaces:**
- Consumes: biến CSS từ Task 2.
- Produces: `C` với đúng 16 khoá — `bg`, `card`, `surface`, `surface2`, `ink`, `soft`, `line`, `lineStrong`, `primary`, `primarySoft`, `ok`, `okSoft`, `warn`, `warnSoft`, `danger`, `dangerSoft`. Khoá `accent` **không còn tồn tại**. `S` với các khoá `font`, `display`, `card`, `btn(primary, danger)`, `input`, `label`, `badge(lv)`, `chip(bg, col)` — chữ ký hàm giữ nguyên.

- [ ] **Step 1: Thay object C**

Thay `App.jsx:23-27` bằng:

```js
const C = {
  bg: "var(--mcf-bg)", card: "var(--mcf-card)", surface: "var(--mcf-surface)", surface2: "var(--mcf-surface2)",
  ink: "var(--mcf-ink)", soft: "var(--mcf-soft)", line: "var(--mcf-line)", lineStrong: "var(--mcf-line-strong)",
  primary: "var(--mcf-primary)", primarySoft: "var(--mcf-primarysoft)",
  ok: "var(--mcf-ok)", okSoft: "var(--mcf-oksoft)",
  warn: "var(--mcf-warn)", warnSoft: "var(--mcf-warnsoft)",
  danger: "var(--mcf-danger)", dangerSoft: "var(--mcf-dangersoft)",
};
```

- [ ] **Step 2: Thay object S**

Thay `App.jsx:198-213` bằng:

```js
const S = {
  font: { fontFamily: "var(--f-ui)", color: C.ink },
  display: { fontFamily: "var(--f-display)", fontWeight: 700, letterSpacing: "-0.02em", fontSize: 26, color: C.ink },
  card: { background: C.card, border: `1px solid ${C.line}`, borderRadius: "var(--r-md)", boxShadow: "var(--sh-1)", padding: "var(--sp-5)" },
  btn: (primary, danger) => ({
    padding: "10px 18px", borderRadius: "var(--r-md)", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    border: primary ? "1px solid transparent" : `1px solid ${danger ? C.danger : C.lineStrong}`,
    background: primary ? C.primary : C.surface,
    color: primary ? "#fff" : danger ? C.danger : C.ink,
    boxShadow: "none",
  }),
  input: { width: "100%", padding: "10px 12px", border: `1px solid ${C.lineStrong}`, borderRadius: "var(--r-sm)", fontSize: 15, color: C.ink, background: C.surface, fontFamily: "inherit" },
  label: { fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.soft, fontWeight: 600 },
  badge: (lv) => ({ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[lv] || C.primary, background: LEVEL_PASTEL[lv] || C.primarySoft, borderRadius: "var(--r-sm)", padding: "3px 8px", marginRight: 8, letterSpacing: "0.02em" }),
  chip: (bg, col) => ({ fontSize: 12, fontWeight: 600, background: bg, color: col, borderRadius: "var(--r-sm)", padding: "3px 10px" }),
};
```

Thay đổi đáng chú ý: bo góc `32`/`999` → `--r-md`/`--r-sm`; gradient và bóng màu của nút bị bỏ; `fontWeight` 800/700 → 700/600; `badge` và `chip` đổi từ viên thuốc tròn sang bo nhẹ để phân biệt với nút.

- [ ] **Step 3: Xoá khối FONTS**

Xoá toàn bộ `const FONTS = \`...\`;` (`App.jsx:152-196`) và dòng `<style>{FONTS}</style>` (`App.jsx:452`). Nội dung đã chuyển hết sang `tokens.css` và `base.css` ở Task 2.

`Login` cũng dùng `FONTS` (`App.jsx:648`) — xoá `FONTS + ` khỏi chuỗi, giữ lại phần quy tắc riêng của Login. Task 8 làm lại `Login` sẽ dọn nốt.

- [ ] **Step 4: Xử lý năm chỗ dùng C.accent**

| Dòng | Sửa |
|---|---|
| `547` | `background: C.accent` → `background: C.danger` |
| `968` | `color: C.accent` → `color: C.warn` |
| `1268` | `statCard(Clock, "Temps total", fmtDuration(totalTime), C.accent)` → `..., C.primary)` |
| `1368` | `fill={C.accent}` → `fill={C.primary}` |
| `2598` | `stroke={C.accent} fill={C.accent}` → `stroke={C.primary} fill={C.primary}` |

- [ ] **Step 5: Chạy guard**

```bash
npm run check:design --prefix ma-classe/ma-classe
```

Mong đợi: `banned:#3D5AF1`, `banned:#F26B4E`, `banned:C.accent` chuyển **PASS**. `banned:Playfair` và `banned:Lora` vẫn FAIL (`App.jsx:614` và `:3319`).

- [ ] **Step 6: Xem tận mắt**

```bash
npm run dev --prefix ma-classe/ma-classe
```

Mở `http://localhost:5173`, đăng nhập bằng PIN giáo viên, và xác nhận: nền xám trung tính, nút và badge màu tím, không còn màu xanh `#3D5AF1` ở đâu. Bật/tắt nút mặt trăng để kiểm tra bản tối.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "Point C and S at CSS tokens, drop accent color"
```

---

### Task 4: Thang cấp độ đơn sắc

**Files:**
- Create: `src/shared/tokens.js`
- Modify: `src/App.jsx:28-29` (`LEVEL_COLORS`, `LEVEL_PASTEL`), `src/App.jsx:30` (`SKILLS`), `src/App.jsx:149-150` (`QTYPES`, `VF_OPTS`) — xoá tại chỗ, import từ file mới

**Interfaces:**
- Consumes: không có.
- Produces: `src/shared/tokens.js` export `LEVEL_COLORS`, `LEVEL_PASTEL`, `LEVEL_COLORS_DARK`, `LEVEL_PASTEL_DARK`, `SKILLS`, `QTYPES`, `VF_OPTS`. Guard ở Task 1 đọc `LEVEL_COLORS` và `LEVEL_PASTEL` từ đúng file này.

- [ ] **Step 1: Tạo src/shared/tokens.js**

```js
/* Thang cấp độ CECRL — đơn sắc theo --mcf-primary, đậm dần.
   A1→B2+ là thang CÓ THỨ TỰ nên độ đậm mang thông tin.
   Mọi giá trị đã đo đạt ≥ 4.5:1 trên nền nhạt tương ứng và trên --mcf-surface. */
export const LEVEL_COLORS = { A1: "#6A5F9C", A2: "#6E61A3", B1: "#5B4B9E", B2: "#4A3B85", "B2+": "#382C68" };
export const LEVEL_PASTEL = { A1: "#F2EFFA", A2: "#EDE9F7", B1: "#E7E2F4", B2: "#E1DBF1", "B2+": "#DAD3EC" };

export const LEVEL_COLORS_DARK = { A1: "#C4BAE8", A2: "#B7ABE2", B1: "#A99BDC", B2: "#9C8CD6", "B2+": "#8E7DD0" };
export const LEVEL_PASTEL_DARK = { A1: "#241F38", A2: "#28223E", B1: "#2C2544", B2: "#30284A", "B2+": "#342B50" };

/* 7 kỹ năng là PHÂN LOẠI, không phải trình tự — không đánh số, không xếp hạng. */
export const SKILLS = ["Grammaire", "Vocabulaire", "Écoute", "Lecture", "Production écrite", "Traduction", "Communication"];

export const QTYPES = { qcm: "QCM", fill: "Texte à trous", conj: "Conjugaison", vf: "Vrai / Faux / ?", tableau: "Tableau OUI/NON", ordre: "Remettre en ordre", open: "Réponse libre / traduction" };
export const VF_OPTS = ["Vrai", "Faux", "On ne sait pas"];
```

- [ ] **Step 2: Kiểm tra tương phản bản tối trước khi đi tiếp**

Chạy trực tiếp trong Node để đo `LEVEL_COLORS_DARK` trên `LEVEL_PASTEL_DARK` và trên `--mcf-surface` bản tối (`#1E1E27`):

```bash
node -e "const l=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};const L=h=>{const n=parseInt(h.slice(1),16);return 0.2126*l(n>>16&255)+0.7152*l(n>>8&255)+0.0722*l(n&255)};const R=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};const f={A1:'#C4BAE8',A2:'#B7ABE2',B1:'#A99BDC',B2:'#9C8CD6','B2+':'#8E7DD0'};const g={A1:'#241F38',A2:'#28223E',B1:'#2C2544',B2:'#30284A','B2+':'#342B50'};for(const k in f)console.log(k,R(f[k],g[k]).toFixed(2),R(f[k],'#1E1E27').toFixed(2))"
```

Mong đợi: cả hai cột đều ≥ 4.5. Nếu có giá trị nào dưới ngưỡng, làm sáng màu chữ tương ứng lên rồi đo lại cho tới khi đạt. **Không đi tiếp khi còn số dưới 4.5.**

- [ ] **Step 3: Nối vào App.jsx**

Xoá `App.jsx:28-29` (`LEVEL_COLORS`, `LEVEL_PASTEL`) và dòng khai báo `SKILLS` (`App.jsx:30`), `QTYPES` và `VF_OPTS` (`App.jsx:149-150`). Thêm vào khối import đầu file:

```js
import { LEVEL_COLORS, LEVEL_PASTEL, SKILLS, QTYPES, VF_OPTS } from "./shared/tokens.js";
```

- [ ] **Step 4: Chạy guard**

```bash
npm run check:design --prefix ma-classe/ma-classe
```

Mong đợi: mọi kiểm tra `level:*` chuyển **PASS**.

- [ ] **Step 5: Xác nhận build và giao diện**

```bash
npm run build --prefix ma-classe/ma-classe
```

Rồi `npm run dev`, mở danh sách bài tập với vai giáo viên. Xác nhận badge cấp độ giờ là thang tím đậm dần, không còn xanh lá / hồng / tím rời rạc.

- [ ] **Step 6: Commit**

```bash
git add src/shared/tokens.js src/App.jsx
git commit -m "Replace level colors with ordered monochrome scale"
```

---

### Task 5: Gỡ import vòng

Đây là task rủi ro nhất của đợt. `App.jsx` import `PracticeHub`, và `PracticeHub` import ngược 24 định danh từ `App.jsx`.

**Files:**
- Create: `src/shared/helpers.js`, `src/shared/i18n.jsx`, `src/shared/storage.js`
- Modify: `src/App.jsx` (xoá dòng export `:3387`, import từ `shared/`), `src/PracticeHub.jsx:7-10` (import từ `shared/` thay vì `App.jsx`)

**Interfaces:**
- Consumes: `src/shared/tokens.js` từ Task 4.
- Produces:
  - `src/shared/storage.js`: `load(key, fallback)`, `save(key, value)` — chữ ký giữ y nguyên bản hiện có trong `App.jsx`.
  - `src/shared/helpers.js`: `uid()`, `fillOk(q, a)`, `fillAccepted(q)`, `vfOk(q, a)`, `stripHtml(html)`, `wordCount(s)`, `autoQ(q, a)`, `isLate(ex, at)`, `exSkills(ex)`, `tableauOk(q, a)`, `tableauCells(q)`, `ordreOk(q, a)`, `isQuestionAnswered(q, answers)`, `getUnansweredQuestionsCount(answers, questions)`, `calculateProfileCompletion(p)`, `validateProfile(p)`, `emptyProfile()`, và hằng `PROFILE_FIELDS`, `LEVELS_PROFILE`, `GOALS_PROFILE`.
  - `src/shared/i18n.jsx`: `I18N`, `LangCtx`, `useT()`, `getLang()`, `LANG_KEY`, `LANGS`.
- **Sau task này `App.jsx` không còn export gì ngoài `default`.**

- [ ] **Step 1: Tạo src/shared/storage.js**

Cắt hàm `load` và `save` khỏi `App.jsx` (tìm bằng `grep -n "const load\|const save\|function load\|function save" src/App.jsx`) và dán nguyên văn vào file mới, thêm `export` trước mỗi hàm. **Không sửa thân hàm.**

- [ ] **Step 2: Tạo src/shared/i18n.jsx**

Cắt `LANG_KEY`, `LANGS`, `I18N`, `getLang`, `LangCtx`, `digKey`, `useT` (`App.jsx:105-128` và khối `I18N` ở trên) sang file mới. `digKey` là hàm nội bộ, không export. Export phần còn lại.

- [ ] **Step 3: Tạo src/shared/helpers.js**

Cắt các hàm thuần liệt kê ở mục Interfaces sang file mới, thêm `export`. **Không sửa thân hàm.** Định vị chúng bằng:

```bash
grep -n "const uid\|const fillOk\|const fillAccepted\|const vfOk\|const stripHtml\|const wordCount\|const autoQ\|const isLate\|const exSkills\|const tableauOk\|const tableauCells\|const ordreOk\|const isQuestionAnswered\|const getUnansweredQuestionsCount\|const calculateProfileCompletion\|const validateProfile\|const emptyProfile\|const PROFILE_FIELDS\|const LEVELS_PROFILE\|const GOALS_PROFILE" src/App.jsx
```

- [ ] **Step 4: Cập nhật import trong App.jsx**

Thêm vào đầu `App.jsx`:

```js
import { load, save } from "./shared/storage.js";
import { I18N, LangCtx, useT, getLang, LANG_KEY, LANGS } from "./shared/i18n.jsx";
import {
  uid, fillOk, fillAccepted, vfOk, stripHtml, wordCount, autoQ, isLate, exSkills,
  tableauOk, tableauCells, ordreOk, isQuestionAnswered, getUnansweredQuestionsCount,
  calculateProfileCompletion, validateProfile, emptyProfile,
  PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE,
} from "./shared/helpers.js";
```

- [ ] **Step 5: Cập nhật import trong PracticeHub.jsx**

`PracticeHub` còn cần `C`, `S`, `TableauCompare`, `OrdreBlocks`, `RichTextEditor`, `Builder`, `ReadingPanel`, `ConfirmSubmitModal` — những thứ này chưa tách xong, nên **giữ nguyên import từ `App.jsx` cho riêng chúng ở bước này** và chỉ chuyển phần đã có nhà mới:

```js
import { QTYPES, VF_OPTS } from "./shared/tokens.js";
import { load, save } from "./shared/storage.js";
import { useT } from "./shared/i18n.jsx";
import {
  uid, fillOk, fillAccepted, vfOk, stripHtml, autoQ, tableauOk, tableauCells,
  ordreOk, exSkills, getUnansweredQuestionsCount,
} from "./shared/helpers.js";
import {
  C, S, TableauCompare, OrdreBlocks, RichTextEditor, Builder, ReadingPanel, ConfirmSubmitModal,
} from "./App.jsx";
```

Vòng import **chưa đứt hẳn ở bước này** — Task 6 mới đứt hẳn, khi các component kia có file riêng. Guard `imports:no-app-jsx-importers` vẫn FAIL, đúng như dự kiến.

- [ ] **Step 6: Thu gọn dòng export ở App.jsx:3387**

Giữ lại đúng những gì `PracticeHub` còn cần:

```js
export { C, S, TableauCompare, OrdreBlocks, RichTextEditor, Builder, ReadingPanel, ConfirmSubmitModal };
```

- [ ] **Step 7: Xác nhận build và chạy luồng thật**

```bash
npm run build --prefix ma-classe/ma-classe
```

Rồi `npm run dev` và chạy hết một vòng: đăng nhập giáo viên → tạo bài tập → tạo tài khoản học sinh → đăng xuất → đăng nhập học sinh → làm bài → nộp → mở tab Luyện tập. Mọi bước phải hoạt động y như trước.

- [ ] **Step 8: Commit**

```bash
git add src/shared src/App.jsx src/PracticeHub.jsx
git commit -m "Extract shared helpers, storage and i18n into src/shared"
```

---

### Task 6: Tách màn hình khỏi App.jsx

**Files:**
- Create: `src/shared/ui.jsx`, `src/editor/RichTextEditor.jsx`, `src/editor/ReadingPanel.jsx`, `src/screens/Login.jsx`, `src/screens/answers/index.jsx`, `src/screens/teacher/*.jsx`, `src/screens/student/*.jsx`
- Modify: `src/App.jsx` (chỉ còn `App` + `AppInner`), `src/PracticeHub.jsx` (import từ nhà mới)

**Interfaces:**
- Consumes: `src/shared/tokens.js`, `helpers.js`, `storage.js`, `i18n.jsx` từ Task 4–5.
- Produces:
  - `src/shared/ui.jsx`: `FloatingLayer`, `KebabMenu`, `Bell`, và `styleTokens` (object `C` và `S` chuyển về đây, export cả hai).
  - `src/editor/RichTextEditor.jsx`: default export `RichTextEditor`.
  - `src/editor/ReadingPanel.jsx`: default export `ReadingPanel`.
  - `src/screens/answers/index.jsx`: `OrdreChip`, `OrdreBlocks`, `TableauCompare`, `ConfirmSubmitModal`.
  - `src/screens/Login.jsx`: default export `Login`.
  - `src/screens/teacher/`: `Teacher.jsx`, `Accounts.jsx`, `StudentDossier.jsx`, `Stats.jsx`, `StudentTable.jsx`, `Builder.jsx`, `Progress.jsx` — mỗi file default export component cùng tên.
  - `src/screens/student/`: `Student.jsx`, `Taking.jsx`, `ProfileForm.jsx`, `PasswordForm.jsx` — như trên.

**Đây là thao tác thuần cơ học. Không đổi một dòng logic nào.** `C` và `S` chuyển sang `src/shared/ui.jsx` là bước phá vòng cuối cùng.

- [ ] **Step 1: Chuyển C và S sang src/shared/ui.jsx**

Cắt `C` (`App.jsx:23-27` sau Task 3) và `S` sang `src/shared/ui.jsx`, thêm `export` cho cả hai. `S.badge` cần `LEVEL_COLORS`/`LEVEL_PASTEL` — import từ `./tokens.js`.

- [ ] **Step 2: Chuyển các component dùng chung**

Cắt `FloatingLayer`, `KebabMenu`, `Bell` sang `src/shared/ui.jsx`. **`Doodles` không chuyển đi đâu cả — xoá hẳn**, kèm dòng `<Doodles />` ở `App.jsx:453`.

- [ ] **Step 3: Chuyển editor và các component trả lời**

Cắt `RichTextEditor` (`App.jsx:3282`) và `ReadingPanel` (`:3210`) sang `src/editor/`. Cắt `OrdreChip` (`:2760`), `OrdreBlocks` (`:2778`), `TableauCompare` (`:2848`), `ConfirmSubmitModal` (`:2904`) sang `src/screens/answers/index.jsx`.

Trong `RichTextEditor`, dòng chọn font (`App.jsx:3319`) đang có `<option value="Lora, Georgia, serif">Lora</option>` — đổi thành:

```jsx
<option value="var(--f-read)">Newsreader</option>
```

- [ ] **Step 4: Chuyển các màn hình**

Cắt từng component sang file tương ứng theo bảng ở mục Interfaces. Mỗi file tự import những gì nó cần từ `../shared/` và `../../shared/`.

- [ ] **Step 5: Dọn App.jsx**

`App.jsx` chỉ còn: import, `AppInner`, `App`, và `export default App`. **Xoá hoàn toàn dòng `export { ... }`.**

- [ ] **Step 6: Trỏ PracticeHub sang nhà mới**

Thay khối import từ `./App.jsx` trong `PracticeHub.jsx` bằng:

```js
import { C, S } from "./shared/ui.jsx";
import RichTextEditor from "./editor/RichTextEditor.jsx";
import ReadingPanel from "./editor/ReadingPanel.jsx";
import Builder from "./screens/teacher/Builder.jsx";
import { TableauCompare, OrdreBlocks, ConfirmSubmitModal } from "./screens/answers/index.jsx";
```

- [ ] **Step 7: Chạy guard**

```bash
npm run check:design --prefix ma-classe/ma-classe
```

Mong đợi: `imports:no-app-jsx-importers`, `banned:Playfair`, `banned:Lora` chuyển **PASS**. Ở điểm này **toàn bộ guard phải xanh** và script thoát mã 0.

- [ ] **Step 8: Xác nhận không vỡ gì**

```bash
npm run build --prefix ma-classe/ma-classe
```

Rồi `npm run dev` và chạy lại đúng luồng đầu-cuối ở Task 5 Step 7. Đặc biệt chú ý tab **Luyện tập** — đây là chỗ vòng import cũ đi qua, nếu có gì vỡ thì vỡ ở đây.

Kiểm tra thêm số dòng đã giảm:

```bash
node -e "console.log(require('fs').readFileSync('src/App.jsx','utf8').split('\n').length)"
```

Mong đợi: dưới 200 dòng.

- [ ] **Step 9: Commit**

```bash
git add src
git commit -m "Split App.jsx into screens, break circular import with PracticeHub"
```

---

### Task 7: components.css

**Files:**
- Create: `src/styles/components.css`
- Modify: `src/main.jsx` (import), `src/shared/ui.jsx` (`S` trả về `className` thay vì style object ở những chỗ đã có class)

**Interfaces:**
- Consumes: token từ Task 2.
- Produces: các lớp `.mcf-btn`, `.mcf-btn--primary`, `.mcf-btn--danger`, `.mcf-card`, `.mcf-input`, `.mcf-label`, `.mcf-chip`, `.mcf-level`, `.mcf-table`.

- [ ] **Step 1: Tạo components.css**

```css
.mcf-btn {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: var(--r-md);
  border: 1px solid var(--mcf-line-strong);
  background: var(--mcf-surface);
  color: var(--mcf-ink);
  cursor: pointer;
  transition: background-color .12s ease, border-color .12s ease;
}
.mcf-btn:hover:not(:disabled) { background: var(--mcf-surface2); }
.mcf-btn:disabled { opacity: .5; cursor: not-allowed; }

.mcf-btn--primary {
  background: var(--mcf-primary);
  border-color: var(--mcf-primary);
  color: #fff;
}
.mcf-btn--primary:hover:not(:disabled) { background: var(--mcf-primary); filter: brightness(1.12); }

.mcf-btn--danger { border-color: var(--mcf-danger); color: var(--mcf-danger); }
.mcf-btn--danger:hover:not(:disabled) { background: var(--mcf-dangersoft); }

.mcf-card {
  background: var(--mcf-card);
  border: 1px solid var(--mcf-line);
  border-radius: var(--r-md);
  box-shadow: var(--sh-1);
  padding: var(--sp-5);
}

.mcf-input {
  width: 100%;
  font: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border: 1px solid var(--mcf-line-strong);
  border-radius: var(--r-sm);
  background: var(--mcf-surface);
  color: var(--mcf-ink);
  transition: border-color .12s ease;
}
.mcf-input:hover { border-color: var(--mcf-ink); }

.mcf-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--mcf-soft);
}

.mcf-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--r-sm);
  background: var(--mcf-primarysoft);
  color: var(--mcf-primary);
}

.mcf-level {
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .02em;
  padding: 3px 8px;
  border-radius: var(--r-sm);
}

.mcf-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.mcf-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--mcf-soft);
  padding: var(--sp-2) var(--sp-3);
  border-bottom: 1px solid var(--mcf-line);
}
.mcf-table td { padding: var(--sp-3); border-bottom: 1px solid var(--mcf-line); }
```

**Không** dùng selector phần tử và **không** dùng `!important` ở bất kỳ đâu trong file này.

- [ ] **Step 2: Nạp trong main.jsx**

Thêm sau `import './styles/base.css'`:

```jsx
import './styles/components.css'
```

- [ ] **Step 3: Xác nhận không xung đột với inline style**

`S.card` và `.mcf-card` giờ mô tả cùng một thứ. `App.jsx` hiện có nhiều chỗ viết `className="mcf-card" style={{...S.card}}` — đây chính là kiểu trộn bị cấm. Tìm chúng:

```bash
grep -rn 'className="mcf-card"' src | head -40
```

Với mỗi chỗ tìm được, **bỏ `...S.card` khỏi style object, giữ `className`**, và chỉ để lại trong `style` những thuộc tính riêng của chỗ đó (ví dụ `marginBottom`).

- [ ] **Step 4: Xác nhận build và giao diện**

```bash
npm run build --prefix ma-classe/ma-classe
```

Rồi `npm run dev`, xem tất cả thẻ còn đúng padding và viền, không bị mất nền hay nhân đôi khoảng cách.

- [ ] **Step 5: Commit**

```bash
git add src/styles/components.css src/main.jsx src
git commit -m "Add component stylesheet, replace S.card duplication"
```

---

### Task 8: Làm lại màn hình đăng nhập

**Files:**
- Modify: `src/screens/Login.jsx`

**Interfaces:**
- Consumes: token từ Task 2, lớp từ Task 7, `load`/`save` từ `shared/storage.js`.
- Produces: `Login` với chữ ký props **giữ nguyên**: `{ accounts, setAccounts, onLogin }`. Hàm `loginStudent()` và `loginTeacher()` giữ nguyên logic.

- [ ] **Step 1: Xoá phần trang trí**

Trong `Login.jsx`, xoá:
- mảng `DECOR` và vòng lặp render `.lp-decor` (11 icon tháp/croissant/rượu/tem/lông vũ)
- component `FlagFR` và mọi chỗ dùng
- khối con dấu sáp chữ H
- hằng `NAVY`, `CREAM`, `GOLD`, và biến `serif`
- import lucide không còn dùng: `Landmark`, `Croissant`, `Wine`, `Coffee`, `Stamp`, `Feather`, `BookMarked`

Giữ `BookOpen` và `GraduationCap` cho hai tab.

- [ ] **Step 2: Dựng bố cục mới**

Thay thân `return` bằng:

```jsx
return (
  <div className="lp-page">
    <div className="lp-inner">
      <header className="lp-brand">
        <img src="/logo.png" alt="" className="lp-logo" />
        <h1 className="lp-title">
          <span className="lp-title-1">apprendre</span>
          <span className="lp-title-2">le français</span>
        </h1>
        <p className="lp-sub">avec Do Hung</p>
      </header>

      <div className="mcf-card lp-card">
        <div className="lp-tabs" role="tablist">
          {[["eleve", "Élève", BookOpen], ["prof", "Professeur", GraduationCap]].map(([k, l, Icon]) => (
            <button key={k} role="tab" aria-selected={tab === k}
              className={"lp-tab" + (tab === k ? " lp-tab--on" : "")}
              onClick={() => { setTab(k); setMsg(""); }}>
              <Icon size={16} aria-hidden /> {l}
            </button>
          ))}
        </div>

        {tab === "eleve" ? (
          <>
            <label className="mcf-label" htmlFor="lp-name">Tên của bạn</label>
            <input id="lp-name" className="lp-field" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="ví dụ: Linh" />

            <label className="mcf-label" htmlFor="lp-code">Mật khẩu</label>
            <input id="lp-code" type="password" className="lp-field" value={code}
              onChange={(e) => setCode(e.target.value)} placeholder="Giáo viên cấp cho bạn"
              onKeyDown={(e) => e.key === "Enter" && loginStudent()} />

            <button className="mcf-btn mcf-btn--primary lp-submit" onClick={loginStudent}>Vào lớp</button>
          </>
        ) : (
          <>
            <label className="mcf-label" htmlFor="lp-pin">Mã PIN giáo viên</label>
            <input id="lp-pin" type="password" className="lp-field" value={pin}
              onChange={(e) => setPin(e.target.value)} placeholder="Đặt ở lần đăng nhập đầu tiên"
              onKeyDown={(e) => e.key === "Enter" && loginTeacher()} />

            <button className="mcf-btn mcf-btn--primary lp-submit" onClick={loginTeacher}>Vào lớp</button>
          </>
        )}

        {msg && <p className="lp-msg" role="alert">{msg}</p>}
      </div>
    </div>
  </div>
);
```

Nhãn và placeholder trên là tiếng Việt vì `vi` là ngôn ngữ mặc định và màn hình này hiện ra **trước khi** người dùng chọn được ngôn ngữ.

- [ ] **Step 3: Viết CSS cho Login**

Tạo `src/screens/Login.css` và import trong `Login.jsx`:

```css
.lp-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: var(--sp-5) var(--sp-4);
  background: var(--mcf-bg);
}
.lp-inner { width: 100%; max-width: 400px; }

.lp-brand { margin-bottom: var(--sp-6); }
.lp-logo { width: 40px; height: 40px; object-fit: contain; margin-bottom: var(--sp-4); }

.lp-title {
  font-family: var(--f-display);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: .95;
  font-size: clamp(2.5rem, 11vw, 3.5rem);
  color: var(--mcf-ink);
  margin: 0;
  display: flex;
  flex-direction: column;
}
.lp-title-2 { color: var(--mcf-primary); }

.lp-sub {
  font-size: 14px;
  color: var(--mcf-soft);
  margin: var(--sp-3) 0 0;
}

.lp-card { padding: var(--sp-5); }

.lp-tabs {
  display: flex;
  gap: var(--sp-5);
  border-bottom: 1px solid var(--mcf-line);
  margin-bottom: var(--sp-5);
}
.lp-tab {
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 0 var(--sp-3);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--mcf-soft);
  cursor: pointer;
  margin-bottom: -1px;
}
.lp-tab--on { color: var(--mcf-primary); border-bottom-color: var(--mcf-primary); }

.lp-field {
  width: 100%;
  font: inherit;
  font-size: 16px;
  color: var(--mcf-ink);
  background: none;
  border: none;
  border-bottom: 1px solid var(--mcf-line-strong);
  border-radius: 0;
  padding: var(--sp-2) 0;
  margin: var(--sp-1) 0 var(--sp-5);
  transition: border-color .12s ease;
}
.lp-field:hover { border-bottom-color: var(--mcf-ink); }
.lp-field:focus { outline: none; border-bottom-color: var(--mcf-primary); border-bottom-width: 2px; }
.lp-field:focus-visible { outline: 2px solid var(--mcf-primary); outline-offset: 4px; }

.lp-submit { width: 100%; padding: 12px; }

.lp-msg {
  margin: var(--sp-4) 0 0;
  font-size: 14px;
  color: var(--mcf-danger);
}

.lp-brand, .lp-card { animation: lpIn .4s ease both; }
.lp-card { animation-delay: .1s; }
@keyframes lpIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
```

`font-size: 16px` trên `.lp-field` là cố ý — dưới 16px Safari trên iOS tự phóng to trang khi focus vào ô nhập.

Đây là **khoảnh khắc chuyển động duy nhất** được phép, tổng cộng 500ms. Quy tắc `prefers-reduced-motion` ở `base.css` đã tắt nó khi cần.

- [ ] **Step 4: Kiểm tra tận mắt**

```bash
npm run dev --prefix ma-classe/ma-classe
```

Xác nhận cả năm điều sau, **không bỏ qua điều nào**:
1. Ở 1280px và ở **360px** đều không có cuộn ngang.
2. Bấm Tab đi hết: tab Élève → tab Professeur → ô tên → ô mật khẩu → nút. Vòng focus tím thấy rõ ở mọi bước.
3. Nhập sai mật khẩu, xác nhận thông báo lỗi hiện ra màu đỏ.
4. Đăng nhập được cả vai học sinh lẫn vai giáo viên.
5. Bật giả lập `prefers-reduced-motion: reduce` trong DevTools, tải lại, xác nhận không còn animation.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Login.jsx src/screens/Login.css
git commit -m "Redesign login screen"
```

---

### Task 9: Làm lại vỏ ứng dụng

**Files:**
- Modify: `src/App.jsx` (`AppInner`, phần `header` và `main`)
- Create: `src/styles/shell.css`

**Interfaces:**
- Consumes: token Task 2, lớp Task 7.
- Produces: không có gì cho task sau — đây là task cuối về giao diện của đợt 1.

- [ ] **Step 1: Viết shell.css**

```css
.mcf-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--mcf-surface);
  border-bottom: 1px solid var(--mcf-line);
  padding: var(--sp-3) var(--sp-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  flex-wrap: wrap;
}
.mcf-brand { display: flex; align-items: center; gap: var(--sp-3); min-width: 0; }
.mcf-brand-logo { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
.mcf-brand-name {
  font-family: var(--f-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--mcf-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mcf-header-tools { display: flex; align-items: center; gap: var(--sp-2); }

.mcf-identity {
  font-size: 13px;
  font-weight: 600;
  color: var(--mcf-primary);
  background: var(--mcf-primarysoft);
  border-radius: var(--r-sm);
  padding: 6px 12px;
  white-space: nowrap;
}

.mcf-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--sp-5) var(--sp-4) var(--sp-9);
}

@media (min-width: 768px) {
  .mcf-header { padding: var(--sp-3) var(--sp-5); }
  .mcf-main { padding-left: var(--sp-5); padding-right: var(--sp-5); }
}

@media (max-width: 560px) {
  .mcf-header { flex-direction: column; align-items: stretch; }
  .mcf-header-tools { justify-content: flex-end; flex-wrap: wrap; }
  .mcf-brand-name { font-size: 16px; }
}
```

Import trong `main.jsx` sau `components.css`.

- [ ] **Step 2: Viết lại header trong AppInner**

Thay khối `<header>` (`App.jsx:454-482` ở bản gốc) bằng:

```jsx
<header className="mcf-header">
  <div className="mcf-brand">
    <img src="/logo.png" alt="" className="mcf-brand-logo" />
    <span className="mcf-brand-name">{t("header.title")}</span>
  </div>
  {session && (
    <div className="mcf-header-tools">
      <select className="mcf-input" value={lang} onChange={(e) => setLang(e.target.value)}
        aria-label={t("lang_label")} style={{ width: "auto", fontSize: 13 }}>
        {LANGS.map(([code, flag, label]) => <option key={code} value={code}>{flag} {label}</option>)}
      </select>
      <button className="mcf-btn" onClick={toggleTheme}
        aria-label={dark ? "Mode clair" : "Mode sombre"}>{dark ? "☀️" : "🌙"}</button>
      {session.role === "eleve" && <Bell name={session.name} exercises={exercises} submissions={submissions} />}
      <span className="mcf-identity">{session.role === "prof" ? t("header.teacher") : session.name}</span>
      <button className="mcf-btn" onClick={() => setSession(null)}>{t("header.logout")}</button>
    </div>
  )}
</header>
```

Ba thay đổi về nội dung chữ, không chỉ về hình thức:
- Dòng `header.subtitle` bị bỏ khỏi header. Nó là khẩu hiệu tiếp thị, không giúp ai điều hướng, và chiếm chỗ trên màn hình hẹp. Khoá i18n giữ lại trong `I18N` phòng khi dùng chỗ khác.
- Emoji `👨‍🏫` và `🎒` bị bỏ khỏi ô danh tính — chúng không thêm thông tin và trình đọc màn hình đọc thành tiếng.
- Ngôi sao `✳` vàng sau tiêu đề bị bỏ.

- [ ] **Step 3: Viết lại main**

```jsx
<main className="mcf-main">
  {loading ? <p style={{ textAlign: "center", color: C.soft }}>{t("loading")}</p>
    : !session ? null
    : session.role === "prof"
      ? <Teacher {...{ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh }} />
      : <Student name={session.name} {...{ exercises, submissions, setSubmissions, accounts, setAccounts, refresh }} />}
</main>
```

Chuỗi `"Ouverture du cahier…"` đang hardcode tiếng Pháp giữa một app mặc định tiếng Việt. Thêm khoá `loading` vào cả ba ngôn ngữ trong `src/shared/i18n.jsx`:

```js
// vi
loading: "Đang tải…",
// fr
loading: "Chargement…",
// en
loading: "Loading…",
```

- [ ] **Step 4: Xoá Doodles khỏi vỏ**

Xác nhận dòng `<Doodles />` (`App.jsx:453`) đã biến mất ở Task 6 Step 2. Nếu còn, xoá.

Đồng thời sửa `div` gốc — bỏ inline style thừa:

```jsx
<div className={"mcf-root" + (dark ? " mcf-dark" : "")}>
```

Nền và font giờ do `body` trong `base.css` lo.

- [ ] **Step 5: Kiểm tra tận mắt, cả hai vai và cả hai bản**

```bash
npm run dev --prefix ma-classe/ma-classe
```

Chạy hết bảng sau, ghi lại kết quả thật kể cả khi trượt:

| Kiểm tra | Cách làm |
|---|---|
| Header dính | Cuộn danh sách bài tập dài, header phải bám trên cùng |
| 360px | DevTools đặt rộng 360px, header xuống hai hàng, không cuộn ngang |
| Bản tối | Bấm 🌙, kiểm tra cả header, thẻ, badge, biểu đồ |
| Bàn phím | Tab qua toàn bộ header, vòng focus thấy rõ ở mọi nút |
| Đổi ngôn ngữ | Chọn fr rồi en, xác nhận chuỗi `loading` đúng |
| Vai giáo viên | Đăng nhập PIN, xem Bài tập / Học sinh / Thống kê |
| Vai học sinh | Đăng nhập, xem Cần làm / Đã nộp / Luyện tập / Tiến độ |

- [ ] **Step 6: Chạy toàn bộ guard lần cuối**

```bash
npm run check:design --prefix ma-classe/ma-classe
npm run build --prefix ma-classe/ma-classe
```

Cả hai phải thành công, guard thoát mã 0.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "Redesign app shell header and main column"
```

---

## Nghiệm thu đợt 1

Đợt 1 hoàn tất khi tất cả những điều sau đúng, và **mỗi điều đã được chạy thật chứ không suy luận**:

1. `npm run check:design` thoát mã 0, mọi kiểm tra PASS.
2. `npm run build` thành công.
3. `src/App.jsx` dưới 200 dòng.
4. Không file nào import từ `App.jsx`.
5. Luồng đầu-cuối chạy được: giáo viên tạo bài → học sinh làm và nộp → giáo viên chấm → học sinh xem điểm.
6. Ảnh chụp màn hình đăng nhập và vỏ app, ở bản sáng và bản tối, ở 360px và desktop — tổng cộng 8 ảnh.
7. Đi hết bằng bàn phím, focus luôn thấy được.

Nếu có mục nào chưa đạt, **nói rõ mục nào và trượt thế nào**. Không tuyên bố đợt 1 xong khi còn mục đỏ.

## Ngoài phạm vi đợt 1

Các màn hình bên trong (`Teacher`, `Builder`, `Accounts`, `StudentDossier`, `Stats`, `StudentTable`, `Progress`, `Student`, `Taking`, `PracticeHub`) **chỉ được hưởng lợi gián tiếp** qua token và qua `C`/`S`. Bố cục riêng của chúng, và cột lề chữa bài ở mục 4.1 của spec, thuộc đợt 2 và đợt 3.
