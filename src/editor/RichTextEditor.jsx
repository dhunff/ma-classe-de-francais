import React, { useRef, useState, useEffect } from "react";
import { C, S } from "../shared/tokens.js";
import { wordCount } from "../shared/questions.js";

function RichTextEditor({ value, onChange, wordLimit, readOnly, minHeight = 280 }) {
  const ref = React.useRef(null);
  const [lineH, setLineH] = useState("1.8");
  const words = wordCount(value);

  // Đồng bộ khi nạp draft từ storage
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current?.innerHTML || "");
  };

  const TBtn = ({ label, title, cmd, arg, wide }) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg); }}
      style={{ minWidth: wide ? 34 : 30, height: 30, borderRadius: 7, border: "1px solid transparent", background: "transparent",
        color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--mcf-line)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
      {label}
    </button>
  );
  const Sep = () => <span style={{ width: 1, height: 20, background: C.line, margin: "0 4px" }} />;
  const sel = { height: 30, borderRadius: 7, border: `1px solid ${C.line}`, background: "var(--mcf-surface)", fontSize: 13, fontFamily: "inherit", color: C.ink, padding: "0 6px" };

  return (
    <div style={{ borderRadius: 24, boxShadow: "0 8px 24px rgba(17,24,39,.08)", border: `1px solid ${C.line}`, overflow: "hidden", background: "var(--mcf-surface)" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 3, padding: "8px 10px", background: "var(--mcf-bg)", borderBottom: `1px solid ${C.line}` }}>
        <select style={sel} defaultValue="" title="Police" onChange={(e) => { if (e.target.value) exec("fontName", e.target.value); }}>
          <option value="" disabled>Police</option>
          <option value="'Segoe UI', sans-serif">Aptos / Segoe UI</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Plus Jakarta Sans', sans-serif">Sans-serif</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
        </select>
        <select style={sel} defaultValue="" title="Taille" onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); }}>
          <option value="" disabled>Taille</option>
          <option value="2">Petit</option><option value="3">Normal</option>
          <option value="4">Grand</option><option value="5">Très grand</option>
        </select>
        <Sep />
        <TBtn label="B" title="Gras (in đậm)" cmd="bold" />
        <TBtn label={<i>I</i>} title="Italique" cmd="italic" />
        <TBtn label={<u>U</u>} title="Souligné" cmd="underline" />
        <TBtn label={<s>abc</s>} title="Barré" cmd="strikeThrough" wide />
        <TBtn label={<span>x<sub>2</sub></span>} title="Indice" cmd="subscript" wide />
        <TBtn label={<span>x<sup>2</sup></span>} title="Exposant" cmd="superscript" wide />
        <Sep />
        <label title="Couleur du texte" style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", width: 34, height: 30, justifyContent: "center", borderRadius: 7 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--mcf-line)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 800, borderBottom: "3px solid #DE4B4B", lineHeight: 1 }}>A</span>
          <input type="color" defaultValue="#DE4B4B" style={{ width: 0, height: 0, opacity: 0 }} onChange={(e) => exec("foreColor", e.target.value)} />
        </label>
        <label title="Surligneur (highlight)" style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", width: 34, height: 30, justifyContent: "center", borderRadius: 7 }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--mcf-line)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontWeight: 800, background: "#FFE066", padding: "0 4px", borderRadius: 3, lineHeight: 1.3 }}>ab</span>
          <input type="color" defaultValue="#FFE066" style={{ width: 0, height: 0, opacity: 0 }} onChange={(e) => exec("hiliteColor", e.target.value)} />
        </label>
        <Sep />
        <TBtn label="⯇" title="Aligner à gauche" cmd="justifyLeft" />
        <TBtn label="☰" title="Centrer" cmd="justifyCenter" />
        <TBtn label="⯈" title="Aligner à droite" cmd="justifyRight" />
        <TBtn label="≡" title="Justifier" cmd="justifyFull" />
        <Sep />
        <TBtn label="•≡" title="Liste à puces" cmd="insertUnorderedList" wide />
        <TBtn label="1≡" title="Liste numérotée" cmd="insertOrderedList" wide />
        <TBtn label="⇤" title="Diminuer le retrait" cmd="outdent" />
        <TBtn label="⇥" title="Augmenter le retrait" cmd="indent" />
        <Sep />
        <select style={sel} value={lineH} title="Interligne (giãn dòng)" onChange={(e) => setLineH(e.target.value)}>
          <option value="1.4">1,0</option><option value="1.8">1,5</option><option value="2.2">2,0</option>
        </select>
        <button type="button" title="Insérer un lien"
          onMouseDown={(e) => { e.preventDefault(); const url = prompt("URL du lien :", "https://"); if (url) exec("createLink", url); }}
          style={{ minWidth: 34, height: 30, borderRadius: 7, border: "1px solid transparent", background: "transparent",
            color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--mcf-line)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>🔗</button>
        <TBtn label="🧹" title="Effacer la mise en forme" cmd="removeFormat" wide />
      </div>

      {/* Vùng viết — "tờ giấy" */}
      <div ref={ref} contentEditable={!readOnly} suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        style={{ minHeight, maxHeight: 560, overflowY: "auto", padding: "20px 24px", fontSize: 15.5,
          lineHeight: lineH, color: C.ink, outline: "none", fontFamily: "'Be Vietnam Pro', sans-serif" }} />

      {/* Word counter */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 14px", borderTop: `1px solid ${C.line}`, background: "var(--mcf-surface2)" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: wordLimit && words > wordLimit ? C.danger : C.soft }}>
          {words}{wordLimit ? `/${wordLimit}` : ""} mots
        </span>
      </div>
    </div>
  );
}



export default RichTextEditor;
