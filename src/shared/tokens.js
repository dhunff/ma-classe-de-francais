/* Token màu và preset style dùng chung. Giá trị thật nằm ở src/styles/tokens.css. */

const C = {
  bg: "var(--mcf-bg)", card: "var(--mcf-card)", surface: "var(--mcf-surface)", surface2: "var(--mcf-surface2)",
  ink: "var(--mcf-ink)", soft: "var(--mcf-soft)", line: "var(--mcf-line)", lineStrong: "var(--mcf-line-strong)",
  primary: "var(--mcf-primary)", primarySoft: "var(--mcf-primarysoft)",
  ok: "var(--mcf-ok)", okSoft: "var(--mcf-oksoft)",
  warn: "var(--mcf-warn)", warnSoft: "var(--mcf-warnsoft)",
  danger: "var(--mcf-danger)", dangerSoft: "var(--mcf-dangersoft)",
};
/* Thang cấp độ CECRL.
   A1→B2+ là thang CÓ THỨ TỰ, nên dùng một dải xanh đậm dần chứ không phải
   5 màu cầu vồng rời rạc — vị trí trên dải mang thông tin, màu sắc thì không.
   Bảng cũ (xanh lá / xanh mòng két / xanh dương / tím / hồng) vừa không mã
   hoá thứ tự vừa trượt tương phản: A2 chỉ đạt 2.85:1.
   Mọi số dưới đây là số đo WCAG thật, chữ trên nền pastel và trên surface. */
const LEVEL_COLORS = { A1: "#476EB2", A2: "#3D62A8", B1: "#2E5296", B2: "#234181", "B2+": "#182F66" };
const LEVEL_PASTEL = { A1: "#EFF4FC", A2: "#E8EFF9", B1: "#E1E9F6", B2: "#DAE3F3", "B2+": "#D3DDF0" };

const QTYPES = { qcm: "QCM", fill: "Texte à trous", conj: "Conjugaison", vf: "Vrai / Faux / ?", tableau: "Tableau OUI/NON", ordre: "Remettre en ordre", open: "Réponse libre / traduction" };
const VF_OPTS = ["Vrai", "Faux", "On ne sait pas"];

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

export { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS };
