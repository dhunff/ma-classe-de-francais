import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { useT } from "../../shared/i18n.jsx";
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from "../../shared/exercises.js";
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from "../../shared/questions.js";
import { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen } from "../../shared/display.js";
import { FloatingLayer, KebabMenu } from "../../shared/ui.jsx";
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile } from "../../shared/profile.js";
import { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal } from "./answers.jsx";
import ReadingPanel from "../../editor/ReadingPanel.jsx";
import RichTextEditor from "../../editor/RichTextEditor.jsx";
import { BookOpen, GraduationCap, MoreVertical, Pencil, Copy, Trash2, RotateCcw, Image as ImageIcon, X, Phone, Calendar, Target, Briefcase, ChevronLeft, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";


/* ================= Taking (with auto-save) ================= */
/* ============ ORDONNANCEMENT — Duolingo-style word ordering (dnd-kit) ============ */

function Taking({ ex, name, setSubmissions, done }) {
  const draftKey = `mcf-draft-${ex.id}-${name}`;
  const startKey = `mcf-start-${ex.id}-${name}`;
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState("");
  const [remaining, setRemaining] = useState(null); // giây còn lại (null = không giới hạn)
  const [locked, setLocked] = useState(false);
  const [zen, setZen] = useState(false); // 🧘 chế độ tập trung
  const [imgZoom, setImgZoom] = useState(false); // 🔍 lightbox ảnh đề bài
  const answersRef = React.useRef(answers);
  answersRef.current = answers;
  const [confirmCount, setConfirmCount] = useState(null);   // ⚠️ modal copie incomplète
  const t = useT();
  const startedAtRef = React.useRef(Date.now());   // ⏱ đo thời lượng làm bài
  React.useEffect(() => {
    (async () => {
      const saved = await load(`mcf-began-${ex.id}-${name}`, null, false);
      if (saved) startedAtRef.current = saved;
      else await save(`mcf-began-${ex.id}-${name}`, startedAtRef.current, false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⏱ Đồng hồ đếm ngược : giờ bắt đầu lưu lại để reload trang không reset
  useEffect(() => {
    if (!ex.timeLimit) return;
    let timer;
    (async () => {
      let started = await load(startKey, null, false);
      if (!started) { started = Date.now(); await save(startKey, started, false); }
      const limitMs = Number(ex.timeLimit) * 60 * 1000;
      const tick = () => {
        const left = Math.max(0, Math.round((started + limitMs - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) { clearInterval(timer); setLocked(true); autoSubmit(); }
      };
      tick();
      timer = setInterval(tick, 1000);
    })();
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex.id]);

  const autoSubmit = async () => {
    const a = answersRef.current;
    const autos = ex.questions.filter(autoQ);
    const autoScore = autos.reduce((n, q) =>
      n + (q.type === "qcm" ? (a[q.id] === q.answer ? 1 : 0)
        : q.type === "vf" ? (vfOk(q, a[q.id]) ? 1 : 0)
        : q.type === "tableau" ? (tableauOk(q, a[q.id]) ? 1 : 0)
        : q.type === "ordre" ? (ordreOk(q, a[q.id]) ? 1 : 0)
        : (fillOk(q, a[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers: a,
      autoScore, autoMax: autos.length, openMarks: {}, qComments: {},
      late: isLate(ex), at: Date.now(), comment: "", graded: false, timedOut: true,
      durationMs: Date.now() - startedAtRef.current,
    };
    const latest = await load("mcf-submissions", []);
    const next = [...latest.filter((s) => !(s.exerciseId === ex.id && s.student === name)), sub];
    await save("mcf-submissions", next);
    setSubmissions(next); await del(draftKey); await del(startKey);
    setTimeout(done, 1800); // cho học sinh thấy thông báo hết giờ rồi thoát
  };

  const fmtLeft = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  useEffect(() => { load(draftKey, null, false).then((d) => d && setAnswers(d)); }, [draftKey]);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (Object.keys(answers).length) { await save(draftKey, answers, false); setSavedAt(new Date()); }
    }, 1200);
    return () => clearTimeout(t);
  }, [answers, draftKey]);

  const allAnswered = ex.questions.every((q) =>
    q.type === "qcm" ? answers[q.id] != null
    : q.type === "tableau" ? tableauCells(q).every((k) => answers[q.id] && answers[q.id][k])
    : q.type === "ordre" ? (Array.isArray(answers[q.id]) && answers[q.id].length === (q.elements || []).length)
    : q.type === "vf" ? (answers[q.id]?.choice != null && (answers[q.id].choice === 2 || (answers[q.id].just || "").trim() !== ""))
    : q.type === "open" ? stripHtml(answers[q.id]) !== ""
    : (answers[q.id] || "").trim() !== "");

  const submit = async () => {
    setSaving(true); setErr("");
    const autos = ex.questions.filter(autoQ);
    const autoScore = autos.reduce((n, q) =>
      n + (q.type === "qcm" ? (answers[q.id] === q.answer ? 1 : 0)
        : q.type === "vf" ? (vfOk(q, answers[q.id]) ? 1 : 0)
        : q.type === "tableau" ? (tableauOk(q, answers[q.id]) ? 1 : 0)
        : q.type === "ordre" ? (ordreOk(q, answers[q.id]) ? 1 : 0)
        : (fillOk(q, answers[q.id]) ? 1 : 0)), 0);
    const sub = {
      id: uid(), exerciseId: ex.id, student: name, answers,
      durationMs: Date.now() - startedAtRef.current,
      autoScore, autoMax: autos.length, openMarks: {}, qComments: {},
      late: isLate(ex), at: Date.now(), comment: "", graded: false,
    };
    const latest = await load("mcf-submissions", []);
    const next = [...latest.filter((s) => !(s.exerciseId === ex.id && s.student === name)), sub];
    const ok = await save("mcf-submissions", next);
    if (ok) { setSubmissions(next); await del(draftKey); await del(startKey); done(); }
    else { setErr("Impossible d'enregistrer la copie. Réessaie."); setSaving(false); }
  };

  const questionCards = ex.questions.map((q, i) => (
    <div key={q.id} className="mcf-card" style={S.card}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        <span style={S.chip(C.primarySoft, C.primary)}>{QTYPES[q.type]}</span> {i + 1}. {q.prompt}
      </div>
      {q.type === "qcm" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {q.options.map((o, j) => (
            <label key={j} style={{ fontSize: 15, display: "flex", gap: 10, alignItems: "center", padding: "9px 13px", borderRadius: 10, cursor: "pointer",
              border: `1.5px solid ${answers[q.id] === j ? C.primary : C.line}`,
              background: answers[q.id] === j ? C.primarySoft : "var(--mcf-surface)",
              color: answers[q.id] === j ? C.primary : C.ink }}>
              <input type="radio" name={q.id} disabled={locked} checked={answers[q.id] === j} onChange={() => setAnswers({ ...answers, [q.id]: j })} />
              <strong>{String.fromCharCode(65 + j)}.</strong> {o}
            </label>
          ))}
        </div>
      ) : q.type === "ordre" ? (
        <OrdreBlocks q={q} value={answers[q.id] || []} readOnly={locked}
          onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
      ) : q.type === "tableau" ? (
        <TableauCompare q={q} value={answers[q.id] || {}} readOnly={locked}
          onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
      ) : q.type === "vf" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {VF_OPTS.map((o, j) => {
              const sel = answers[q.id]?.choice === j;
              return (
                <button key={j} disabled={locked}
                  onClick={() => setAnswers({ ...answers, [q.id]: { choice: j, just: j === 2 ? "" : (answers[q.id]?.just || "") } })}
                  style={{ padding: "10px 22px", borderRadius: 999, fontSize: 14.5, fontWeight: 700, cursor: locked ? "default" : "pointer",
                    fontFamily: "inherit", border: `1.5px solid ${sel ? C.primary : C.line}`,
                    background: sel ? C.primarySoft : "var(--mcf-surface)", color: sel ? C.primary : C.ink }}>
                  {o}
                </button>
              );
            })}
          </div>
          {(answers[q.id]?.choice === 0 || answers[q.id]?.choice === 1) && (
            <textarea disabled={locked} value={answers[q.id]?.just || ""}
              placeholder="Justifiez votre réponse en citant le texte…"
              onChange={(e) => setAnswers({ ...answers, [q.id]: { ...answers[q.id], just: e.target.value } })}
              style={{ ...S.input, minHeight: 60, resize: "vertical" }} />
          )}
        </div>
      ) : q.type === "open" ? (
        <RichTextEditor value={answers[q.id] || ""} readOnly={locked} onChange={(html) => setAnswers({ ...answers, [q.id]: html })} />
      ) : (
        <input style={S.input} disabled={locked} placeholder="Ta réponse…" value={answers[q.id] || ""}
          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
      )}
    </div>
  ));

  return (
    <div style={zen ? { position: "fixed", inset: 0, zIndex: 90, background: "var(--mcf-bg)", overflowY: "auto", padding: "28px 16px 80px" } : undefined}>
      {/* 🧘 Nút thoát Zen nổi */}
      {zen && (
        <button onClick={() => setZen(false)} title="Quitter le mode Focus"
          style={{ position: "fixed", top: 16, right: 16, zIndex: 120, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: C.ink, color: "var(--mcf-bg)", fontWeight: 700, fontSize: 13.5,
            boxShadow: "0 8px 22px rgba(17,24,39,.3)" }}>
          ⤡ Quitter le Focus
        </button>
      )}
      <div style={zen ? { maxWidth: 920, margin: "0 auto" } : undefined}>
      {/* ⏱ Đồng hồ đếm ngược trôi nổi */}
      {remaining != null && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100,
          display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999,
          background: remaining <= 300 ? C.danger : "#111827", color: "#fff", border: "1px solid var(--mcf-line)", fontWeight: 800, fontSize: 17,
          boxShadow: "0 8px 22px rgba(27,37,89,.35)", fontVariantNumeric: "tabular-nums" }}>
          ⏱ {fmtLeft(remaining)}
        </div>
      )}
      {locked && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `3px solid ${C.danger}`, fontWeight: 700, color: C.danger }}>
          ⏰ Temps écoulé ! Ta copie a été rendue automatiquement.
        </div>
      )}
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        {!zen && (
          <button onClick={() => setZen(true)}
            style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}>
            🎯 Focus
          </button>
        )}
        {ex.timeLimit && !locked && <span style={{ fontSize: 13, color: C.primary, fontWeight: 700 }}>⏱ Temps limite : {ex.timeLimit} minutes</span>}
        {ex.deadline && <span style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>
          ⏰ {isLate(ex) ? "Date limite dépassée — la copie sera marquée en retard" : `À rendre avant le ${fmtDate(ex.deadline)}`}
        </span>}
        <span style={{ fontSize: 12, color: C.soft }}>{savedAt ? `💾 Brouillon enregistré à ${savedAt.toLocaleTimeString("fr-FR")}` : "💾 Enregistrement automatique activé"}</span>
      </div>

      {/* 🎧 Audio player cố định (sticky) — cuộn trang vẫn thấy */}
      {ex.consigne && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, borderLeft: `4px solid ${C.primary}` }}>
          <div style={S.label}>📋 Consigne</div>
          <div style={{ fontSize: 15.5, lineHeight: 1.75, marginTop: 6, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ex.consigne }} />
        </div>
      )}

      {ex.imageUrl && (
        <div style={{ marginBottom: 16 }}>
          <img src={ex.imageUrl} alt="illustration — cliquez pour agrandir" title="Cliquez pour agrandir 🔍"
            onClick={() => setImgZoom(true)}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.9)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
            style={{ display: "block", width: "100%", maxWidth: 900, margin: "0 auto", objectFit: "contain",
              borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 3px 12px rgba(17,24,39,.08)",
              cursor: "zoom-in", transition: "opacity .15s ease" }} />
          <div style={{ textAlign: "center", fontSize: 12, color: C.soft, marginTop: 6 }}>🔍 Cliquez sur l'image pour l'agrandir</div>
        </div>
      )}
      {imgZoom && (
        <div onClick={() => setImgZoom(false)}
          style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,.9)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <button onClick={() => setImgZoom(false)} title="Fermer"
            style={{ position: "fixed", top: 16, right: 16, zIndex: 401, width: 44, height: 44, borderRadius: 999,
              border: "none", background: "rgba(255,255,255,.15)", color: "#fff", fontSize: 22, fontWeight: 800,
              cursor: "pointer", display: "grid", placeItems: "center" }}>✕</button>
          <img src={ex.imageUrl} alt="illustration agrandie" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, cursor: "zoom-out" }} />
        </div>
      )}

      {ex.audioUrl && (
        <div className="mcf-card" style={{ ...S.card, marginBottom: 16, position: "sticky", top: 8, zIndex: 30, boxShadow: "0 6px 18px rgba(27,37,89,.12)" }}>
          <div style={{ ...S.label, marginBottom: 8 }}>🎧 Écoute le document audio (le lecteur reste visible pendant que tu réponds)</div>
          <audio controls controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()}
            style={{ width: "100%" }} src={ex.audioUrl} />
        </div>
      )}

      {/* 📖 Bố cục 2 cột nếu có bài đọc */}
      {ex.readingText ? (
        <div className="mcf-wide" style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <ReadingPanel text={ex.readingText} stickyTop={ex.audioUrl ? 110 : 8} />
          <div className="mcf-scroll" style={{ flex: "5 1 340px", minWidth: 0, display: "grid", gap: 16,
            maxHeight: "76vh", overflowY: "auto", position: "sticky", top: ex.audioUrl ? 110 : 8, paddingRight: 4 }}>
            {questionCards}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, maxWidth: 780, margin: "0 auto" }}>{questionCards}</div>
      )}

      {err && <p style={{ color: C.danger, fontSize: 13 }}>{err}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={{ ...S.btn(true), opacity: !saving && !locked ? 1 : 0.4 }} disabled={saving || locked}
          onClick={() => {
            const n = getUnansweredQuestionsCount(answers, ex.questions);
            if (n > 0) setConfirmCount(n); else submit();
          }}>
          {saving ? t("sending") : t("submit_copy")}
        </button>
        <button style={S.btn(false)} onClick={done}>{t("quit_draft")}</button>
      </div>
      {confirmCount != null && (
        <ConfirmSubmitModal count={confirmCount}
          onCancel={() => setConfirmCount(null)}
          onConfirm={() => { setConfirmCount(null); submit(); }} />
      )}
      </div>
    </div>
  );
}

export default Taking;
