import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../shared/tokens.js";
import { load, save, del } from "../shared/storage.js";
import { useT } from "../shared/i18n.jsx";
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from "../shared/exercises.js";
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from "../shared/questions.js";
import { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen } from "../shared/display.js";
import { FloatingLayer, KebabMenu } from "../shared/ui.jsx";
import { BookOpen, GraduationCap, Wine, Croissant, Landmark, Stamp, Feather, Coffee, BookMarked } from "lucide-react";


/* ================= Login — Classic Parisian ================= */
function Login({ accounts, onLogin }) {
  const [tab, setTab] = useState("eleve");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");

  // 💬 Câu động lực tiếng Pháp — đổi câu mỗi 7 giây với hiệu ứng fade
  const QUOTES = [
    "« Le succès est la somme de petits efforts, répétés jour après jour. »",
    "« Petit à petit, l'oiseau fait son nid. »",
    "« Paris ne s'est pas fait en un jour. »",
    "« Vouloir, c'est pouvoir. »",
    "« L'éducation est l'arme la plus puissante qu'on puisse utiliser pour changer le monde. »",
    "« Il n'y a pas de réussite facile ni d'échecs définitifs. »",
  ];
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [quoteVisible, setQuoteVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteVisible(false);                          // mờ đi
      setTimeout(() => {
        setQuoteIdx((i) => (i + 1) % QUOTES.length);   // đổi câu
        setQuoteVisible(true);                         // hiện lại
      }, 500);
    }, 7000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginStudent = () => {
    const acc = accounts.find((a) => a.name.toLowerCase() === name.trim().toLowerCase());
    if (!acc) { setMsg("Compte introuvable. Demande à ton professeur de créer ton compte."); return; }
    if (acc.code !== code.trim()) { setMsg("Mot de passe incorrect."); return; }
    onLogin({ role: "eleve", name: acc.name });
  };
  const loginTeacher = async () => {
    const stored = await load("mcf-teacher-pin", null);
    if (!stored) {
      if (pin.length < 4) { setMsg("Choisissez un code PIN d'au moins 4 caractères (première connexion)."); return; }
      await save("mcf-teacher-pin", pin); onLogin({ role: "prof" });
    } else if (stored === pin) onLogin({ role: "prof" });
    else setMsg("Code PIN incorrect.");
  };

  const NAVY = "#1e3a8a", CREAM = "#F8F5F0", GOLD = "#C9A227";
  const serif = { fontFamily: "var(--f-display)" };

  // Vị trí trang trí (placeholder lucide — thay bằng hình minh họa sau)
  const DECOR = [
    { Icon: Landmark, x: "6%", y: "10%", size: 90, rot: 0 },      // Tháp / công trình
    { Icon: Landmark, x: "84%", y: "8%", size: 84, rot: 0 },      // Khải Hoàn Môn
    { Icon: Croissant, x: "20%", y: "24%", size: 42, rot: -15 },
    { Icon: Wine, x: "74%", y: "30%", size: 40, rot: 8 },
    { Icon: Coffee, x: "8%", y: "52%", size: 44, rot: 0 },
    { Icon: Stamp, x: "88%", y: "50%", size: 46, rot: 12 },
    { Icon: BookMarked, x: "16%", y: "76%", size: 52, rot: -8 },
    { Icon: Feather, x: "46%", y: "84%", size: 42, rot: 15 },
    { Icon: Croissant, x: "70%", y: "78%", size: 40, rot: 20 },
    { Icon: Wine, x: "30%", y: "60%", size: 34, rot: -10 },
    { Icon: BookOpen, x: "60%", y: "14%", size: 38, rot: -5 },
  ];

  const inputStyle = {
    width: "100%", padding: "10px 2px", fontSize: 16, color: "#1B2559", background: "transparent",
    border: "none", borderBottom: "1.5px solid #D8D2C7", borderRadius: 0, fontFamily: "inherit", outline: "none",
  };
  const labelStyle = { fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: "#6B7280", fontWeight: 700, fontFamily: "'Be Vietnam Pro', sans-serif" };

  const FlagFR = ({ w = 30, round = false }) => (
    <span style={{ display: "inline-flex", width: w, height: round ? w : w * 0.66, borderRadius: round ? "50%" : 3,
      overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.2)", flexShrink: 0 }}>
      <span style={{ flex: 1, background: "#0B3D91" }} /><span style={{ flex: 1, background: "var(--mcf-surface)" }} /><span style={{ flex: 1, background: "#CE1126" }} />
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: CREAM, position: "relative", overflow: "hidden",
      fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <style>{`
        .lp-input:focus { border-bottom-color: ${NAVY} !important; border-bottom-width: 2px !important; }
        @media (max-width: 640px) { .lp-decor { display: none; } }
      `}</style>

      {/* ---- Trang trí xung quanh (placeholder lucide, nét mảnh xám nhạt) ---- */}
      {DECOR.map(({ Icon, x, y, size, rot }, i) => (
        <div key={i} className="lp-decor" aria-hidden
          style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, pointerEvents: "none", opacity: 0.55 }}>
          <Icon size={size} color="#B9B2A4" strokeWidth={1.1} />
        </div>
      ))}

      {/* ---- Branding ---- */}
      <div style={{ textAlign: "center", marginBottom: 34, position: "relative", zIndex: 2 }}>
        <h1 style={{ fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif", fontWeight: 800, letterSpacing: "-1px",
          fontSize: "clamp(28px, 5vw, 40px)", color: "#152A6E", margin: 0,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <img src="/logo.png" alt="Logo" style={{ width: 46, height: 46, objectFit: "contain" }} />
          Apprendre le français avec Do Hung
          <FlagFR w={30} round />
        </h1>
        <p style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontStyle: "italic", color: "#6B7280", fontSize: "clamp(14px, 2.4vw, 16px)", marginTop: 8 }}>
          Une méthode classique de style en France
        </p>
      </div>

      {/* ---- Login card ---- */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 420 }}>
        {/* Con dấu sáp */}
        <div aria-hidden style={{ position: "absolute", top: 34, right: -26, width: 62, height: 62, borderRadius: "50%",
          background: "radial-gradient(circle at 32% 30%, #C08552, #8B4A2F 62%, #6E3821)",
          display: "grid", placeItems: "center", boxShadow: "0 8px 18px rgba(110,56,33,.4), inset 0 2px 6px rgba(255,255,255,.3)",
          border: "3px solid #A0623F", zIndex: 3 }}>
          <span style={{ ...serif, color: "#F3E2CE", fontWeight: 800, fontSize: 26, textShadow: "0 1px 2px rgba(0,0,0,.35)" }}>H</span>
        </div>

        <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: "2rem",
          padding: "30px 30px 34px", boxShadow: "0 30px 70px rgba(30,58,138,0.16), 0 10px 26px rgba(30,58,138,0.08)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#EEEBE4", borderRadius: 999, padding: 5, marginBottom: 26 }}>
            {[["eleve", "Élève", BookOpen], ["prof", "Professeur", GraduationCap]].map(([k, l, Icon]) => (
              <button key={k} onClick={() => { setTab(k); setMsg(""); }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "11px 10px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14.5,
                  fontFamily: "inherit", borderRadius: 999, transition: "all .18s ease",
                  background: tab === k ? NAVY : "transparent",
                  color: tab === k ? "#fff" : "#8B8577",
                  boxShadow: tab === k ? "0 6px 14px rgba(30,58,138,.35)" : "none" }}>
                <Icon size={17} /> {l}
              </button>
            ))}
          </div>

          {tab === "eleve" ? (
            <>
              <div style={labelStyle}>Ton prénom</div>
              <input className="lp-input" style={{ ...inputStyle, margin: "4px 0 22px" }} value={name}
                onChange={(e) => setName(e.target.value)} placeholder="ex. Linh" />
              <div style={labelStyle}>Ton mot de passe</div>
              <input className="lp-input" type="password" style={{ ...inputStyle, margin: "4px 0 28px" }} value={code}
                onChange={(e) => setCode(e.target.value)} placeholder="Donné par le professeur"
                onKeyDown={(e) => e.key === "Enter" && loginStudent()} />
              <button onClick={loginStudent}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 700, fontSize: 15.5, color: "#fff",
                  background: `linear-gradient(135deg, ${NAVY}, #2b4cad)`,
                  boxShadow: "0 10px 24px rgba(30,58,138,.38), inset 0 1px 0 rgba(255,255,255,.25)" }}>
                <BookOpen size={18} /> Entrer en classe
              </button>
            </>
          ) : (
            <>
              <div style={labelStyle}>Code PIN professeur</div>
              <input className="lp-input" type="password" style={{ ...inputStyle, margin: "4px 0 28px" }} value={pin}
                onChange={(e) => setPin(e.target.value)} placeholder="Défini à la première connexion"
                onKeyDown={(e) => e.key === "Enter" && loginTeacher()} />
              <button onClick={loginTeacher}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 700, fontSize: 15.5, color: "#fff",
                  background: `linear-gradient(135deg, ${NAVY}, #2b4cad)`,
                  boxShadow: "0 10px 24px rgba(30,58,138,.38), inset 0 1px 0 rgba(255,255,255,.25)" }}>
                <GraduationCap size={18} /> Ouvrir le tableau de bord
              </button>
            </>
          )}
          {msg && <p style={{ color: "#C0392B", fontSize: 13, marginTop: 16, marginBottom: 0, textAlign: "center" }}>{msg}</p>}
        </div>

        <p style={{ fontSize: 12, color: "#9A937F", textAlign: "center", marginTop: 16 }}>
          Seuls les élèves dont le compte a été créé par le professeur peuvent se connecter.
        </p>
      </div>

      {/* 💬 Câu động lực — fade đổi câu mỗi 7s */}
      <div style={{ position: "absolute", bottom: 58, left: "50%", transform: "translateX(-50%)", zIndex: 2,
        width: "min(92vw, 620px)", textAlign: "center" }}>
        <p style={{ fontSize: 14, fontStyle: "italic", color: "#9CA3AF", margin: 0, lineHeight: 1.6,
          opacity: quoteVisible ? 1 : 0, transition: "opacity .5s ease" }}>
          {QUOTES[quoteIdx]}
        </p>
      </div>

      {/* Cờ Pháp dưới cùng */}
      <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
        <FlagFR w={42} />
      </div>
    </div>
  );
}

export default Login;
