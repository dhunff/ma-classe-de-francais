import React, { useState, useRef, useEffect, useMemo } from "react";
import { C, S, QTYPES, VF_OPTS, LEVEL_COLORS } from "../../shared/tokens.js";
import { SKILLS, exSkills } from "../../shared/exercises.js";
import { uid, stripHtml, autoQ, tableauCells, fillAccepted } from "../../shared/questions.js";
import { useT } from "../../shared/i18n.jsx";
import RichTextEditor from "../../editor/RichTextEditor.jsx";
import { Image as ImageIcon, X, Trash2 } from "lucide-react";

function Builder({ draft, setDraft, publish, cancel, accounts, classes = [] }) {
  /* useT() đã được import từ lâu nhưng chưa bao giờ được gọi, trong khi t()
     được dùng ở 11 chỗ — nên mở trình soạn bài tập là ném ReferenceError ngay
     lúc render. check:imports không bắt được: nó kiểm định danh có được import
     hay không, mà useT thì có; thiếu là lời gọi. */
  const t = useT();
  const dSkills = draft.skills && draft.skills.length ? draft.skills : draft.skill ? [draft.skill] : [];
  const toggleSkill = (sk) => {
    const next = dSkills.includes(sk) ? dSkills.filter((x) => x !== sk) : [...dSkills, sk];
    setDraft({ ...draft, skills: next, skill: next[0] || "",
      audioUrl: next.includes("Écoute") ? draft.audioUrl : "",
      readingText: next.includes("Lecture") ? draft.readingText : "" });
  };
  const [studentSearch, setStudentSearch] = useState("");
  const classMembers = new Set();
  (draft.assignedClasses || []).forEach((cid) => accounts.filter((a) => a.classId === cid).forEach((a) => classMembers.add(a.name)));
  const mergedTargets = new Set([...classMembers, ...(draft.assignedExtra || [])]);
  const className = (cid) => classes.find((c) => c.id === cid)?.name;
  const jsonFileRef = React.useRef(null);
  const [jsonModal, setJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonMsg, setJsonMsg] = useState("");
  const [toast, setToast] = useState(null); // {type:'ok'|'err', msg}
  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  /* ---- Import JSON : auto-remplissage complet du formulaire ---- */
  const handleImportJSON = (raw) => {
    try {
      const data = JSON.parse(raw);
      const LEVELS = Object.keys(LEVEL_COLORS);

      // -- questions mapping (IDs régénérés OBLIGATOIREMENT) --
      const normVF = (r) => {
        if (typeof r === "number") return Math.min(2, Math.max(0, r));
        const t = String(r || "").toLowerCase();
        if (t.startsWith("v")) return 0;
        if (t.startsWith("f")) return 1;
        return 2; // ONSP / "on ne sait pas" / "?"
      };
      const qs = (Array.isArray(data.questions) ? data.questions : []).map((it) => {
        try {
        const prompt = String(it.question ?? it.prompt ?? it.enonce ?? "").trim();
        if (!prompt) return null;
        const type = String(it.type || "").toUpperCase();
        switch (type) {
          case "QCM": case "MCQ": {
            const rawOpts = it.options || it.choix || [];
            let options, answer;
            if (rawOpts.length && typeof rawOpts[0] === "object" && rawOpts[0] !== null) {
              // Gemini format : [{id, texte, isCorrect}]
              options = rawOpts.map((o) => String(o.texte ?? o.text ?? o.label ?? ""));
              const ci = rawOpts.findIndex((o) => o.isCorrect === true || o.correct === true);
              answer = ci >= 0 ? ci : 0;
            } else {
              options = rawOpts.map((o) => String(o));
              answer = it.reponse ?? it.answer ?? it.reponse_correcte ?? 0;
              if (typeof answer === "string") answer = Math.max(0, options.indexOf(answer));
            }
            if (options.length < 2) return null;
            return { id: uid(), type: "qcm", prompt, options, answer: Math.min(answer, options.length - 1) };
          }
          case "TEXTE_A_TROUS": case "FILL": {
            let fa = it.reponse ?? it.reponse_attendue ?? it.answer ?? it.accepted ?? "";
            if (!fa && it.reponses_attendues && typeof it.reponses_attendues === "object")
              fa = Object.values(it.reponses_attendues).join("|");
            return { id: uid(), type: "fill", prompt, accepted: String(fa) };
          }
          case "CONJUGAISON": case "CONJ":
            return { id: uid(), type: "conj", prompt, accepted: String(it.reponse ?? it.reponse_attendue ?? it.answer ?? it.accepted ?? "") };
          case "VRAI_FAUX_ONSP": case "VF": case "VRAI_FAUX":
            return { id: uid(), type: "vf", prompt, answer: normVF(it.reponse ?? it.reponse_correcte ?? it.answer),
              justification: String(it.justification ?? it.justification_attendue ?? "") };
          case "TABLEAU_COMPARAISON": case "TABLEAU": {
            const colonnes = (it.colonnes || []).map((c) => ({ id: uid(), titre: String(c.titre ?? c.title ?? c) }));
            const criteres = (it.criteres || []).map((c) => ({ id: uid(), texte: String(c.texte ?? c.text ?? c) }));
            if (!colonnes.length || !criteres.length) return null;
            // remap réponses_attendues (clés "crit_x_col_y" d'origine) -> nouvelles clés
            const srcCols = (it.colonnes || []).map((c) => c.id);
            const srcCrits = (it.criteres || []).map((c) => c.id);
            const rep = it.reponses_attendues || it.answers || {};
            const answers = {};
            criteres.forEach((cr, ci) => colonnes.forEach((co, oi) => {
              const srcKey = `${srcCrits[ci]}_${srcCols[oi]}`;
              const v = String(rep[srcKey] || "").toUpperCase();
              if (v === "OUI" || v === "NON") answers[`${cr.id}_${co.id}`] = v;
            }));
            return { id: uid(), type: "tableau", prompt, colonnes, criteres, answers };
          }
          case "ORDONNANCEMENT": case "ORDRE": {
            const elements = (it.elements_corrects || it.elements || []).map((e) => ({ id: uid(), texte: String(e.texte ?? e.text ?? e) }));
            if (elements.length < 2) return null;
            return { id: uid(), type: "ordre", prompt, elements };
          }
          case "REPONSE_LIBRE": case "OPEN":
            return { id: uid(), type: "open", prompt, model: String(it.corrige_type ?? it.reponse_suggeree ?? it.model ?? "") };
          default: {
            // Suy luận type khi AI ghi sai/thiếu "type"
            if (Array.isArray(it.elements_corrects) || Array.isArray(it.elements)) {
              const elements = (it.elements_corrects || it.elements).map((e) => ({ id: uid(), texte: String(e.texte ?? e.text ?? e) }));
              return elements.length >= 2 ? { id: uid(), type: "ordre", prompt, elements } : null;
            }
            if (Array.isArray(it.criteres) && Array.isArray(it.colonnes)) return null; // tableau thiếu type — bỏ qua an toàn
            if (Array.isArray(it.options) && it.options.length >= 2) {
              const rawOpts = it.options;
              let options, answer;
              if (typeof rawOpts[0] === "object" && rawOpts[0] !== null) {
                options = rawOpts.map((o) => String(o.texte ?? o.text ?? o.label ?? ""));
                const ci = rawOpts.findIndex((o) => o.isCorrect === true || o.correct === true);
                answer = ci >= 0 ? ci : 0;
              } else { options = rawOpts.map(String); answer = 0; }
              return { id: uid(), type: "qcm", prompt, options, answer };
            }
            if (it.corrige_type != null || it.model != null) return { id: uid(), type: "open", prompt, model: String(it.corrige_type ?? it.model ?? "") };
            if (it.reponse_attendue != null || it.reponses_attendues != null || it.reponse != null) {
              let fa = it.reponse ?? it.reponse_attendue ?? "";
              if (!fa && it.reponses_attendues && typeof it.reponses_attendues === "object") fa = Object.values(it.reponses_attendues).join("|");
              return { id: uid(), type: "fill", prompt, accepted: String(fa) };
            }
            return null;
          }
        }
        } catch (qe) { return null; } // 1 câu lỗi không làm hỏng cả import
      }).filter(Boolean);

      if (!qs.length) throw new Error("Aucune question valide");

      // -- infos générales --
      const rawSkills = data.competences ?? data.skills ?? [];
      const skills = (Array.isArray(rawSkills) ? rawSkills : [rawSkills]).filter((k) => SKILLS.includes(k));
      const lv = data.niveau ?? data.level;
      const consigne = data.consigne_generale ?? data.consigne ?? "";

      setDraft({
        ...draft,
        title: String(data.titre ?? data.title ?? draft.title),
        level: LEVELS.includes(lv) ? lv : draft.level,
        ...(skills.length ? { skills, skill: skills[0] } : {}),
        consigne: consigne ? (/</.test(consigne) ? consigne : `<p>${consigne}</p>`) : draft.consigne,
        readingText: String(data.texte_support ?? data.readingText ?? draft.readingText ?? ""),
        audioUrl: String(data.audio_url ?? data.audioUrl ?? draft.audioUrl ?? ""),
        questions: qs,
      });
      setJsonModal(false);
      showToast("ok", `✅ Import thành công ${qs.length} question${qs.length > 1 ? "s" : ""} !`);
    } catch (e) {
      setJsonMsg("❌ Lỗi định dạng JSON ! Vui lòng kiểm tra lại cấu trúc (thiếu ngoặc, dư dấu phẩy, thiếu trường questions…).");
    }
  };

  const onJsonFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setJsonText(String(reader.result || "")); setJsonMsg("📂 Fichier chargé — cliquez sur « Importer »."); };
    reader.onerror = () => setJsonMsg("❌ Impossible de lire le fichier.");
    reader.readAsText(file);
    if (jsonFileRef.current) jsonFileRef.current.value = "";
  };
  const [imgMsg, setImgMsg] = useState("");

  // Đọc file ảnh → base64 (giới hạn 1,5 MB để không vượt hạn mức lưu trữ)
  const handleImageFile = (file) => {
    setImgMsg("");
    if (!file.type.startsWith("image/")) { setImgMsg("⚠ Fichier non valide — choisissez une image."); return; }
    if (file.size > 800 * 1024) { setImgMsg("⚠ Image trop lourde (>800 Ko). Compressez-la (tinypng.com) ou collez une URL publique (Supabase Storage)."); return; }
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };


  const addQ = (type) => {
    const base = { id: uid(), type, prompt: "" };
    const q = type === "qcm" ? { ...base, options: ["", "", "", ""], answer: 0 }
      : type === "open" ? { ...base, model: "" }
      : { ...base, accepted: "" }; // fill & conj
    setDraft({ ...draft, questions: [...draft.questions, q] });
  };
  const setQ = (id, patch) => setDraft({ ...draft, questions: draft.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  const delQ = (id) => setDraft({ ...draft, questions: draft.questions.filter((q) => q.id !== id) });
  // ⧉ Nhân bản 1 câu hỏi : DEEP CLONE + id mới, options được copy giá trị mới hoàn toàn
  const duplicateQuestion = (id) => {
    const idx = draft.questions.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const src = draft.questions[idx];
    const clone = typeof structuredClone === "function" ? structuredClone(src) : JSON.parse(JSON.stringify(src));
    clone.id = uid();
    if (Array.isArray(clone.options)) clone.options = clone.options.map((o) => String(o)); // mảng options mới, độc lập
    const qs = [...draft.questions];
    qs.splice(idx + 1, 0, clone);
    setDraft({ ...draft, questions: qs });
  };

  /* Điều kiện xuất bản, kèm lý do.

     Trước đây nút chỉ bị làm mờ và vô hiệu hoá, không nói thiếu gì — người
     dùng bấm mãi mà không có phản hồi nào. Giữ nguyên các điều kiện, nhưng
     liệt kê ra thành câu đọc được. */
  const missing = [];
  if (!draft.title.trim()) missing.push(t("builder.need_title"));
  if (draft.questions.length === 0) missing.push(t("builder.need_question"));
  if (dSkills.length === 0) missing.push(t("builder.need_skill"));
  if (draft.targeted && mergedTargets.size === 0) missing.push(t("builder.need_target"));
  draft.questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.prompt.trim()) missing.push(t("builder.need_prompt", { n }));
    if (q.type === "qcm" && !(q.options.length >= 2 && q.options.every((o) => o.trim())))
      missing.push(t("builder.need_options", { n }));
    if ((q.type === "fill" || q.type === "conj") && !String(fillAccepted(q)).trim())
      missing.push(t("builder.need_answer", { n }));
  });
  const ready = missing.length === 0;

  const hint = {
    fill: "Écrivez la phrase avec ______ pour le trou. Réponses acceptées séparées par | (ex. « vais|me rends »).",
    conj: "Ex. de consigne : « Hier, nous (aller) ______ au cinéma. » Réponses acceptées séparées par | (ex. « sommes allés|sommes allées »).",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ ...S.display, marginTop: 0, marginBottom: 0 }}>{draft.title ? "Modifier l'exercice" : "Nouvel exercice"}</h2>
        <button style={{ ...S.btn(false), display: "inline-flex", alignItems: "center", gap: 8 }}
          onClick={() => { setJsonModal(true); setJsonText(""); setJsonMsg(""); }}>
          🪄 Import JSON
        </button>
      </div>
      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        {/* Type d'utilisation : Devoir vs Entraînement */}
        <div style={{ marginBottom: 16 }}>
          <div style={S.label}>Type d'utilisation</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {[["assignment", "📝 Devoir (À faire)"], ["practice", "🏋️ Entraînement libre"]].map(([v, l]) => {
              const on = (draft.usageType || "assignment") === v;
              return (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, cursor: "pointer",
                  padding: "9px 18px", borderRadius: 999, fontWeight: 700,
                  border: `1.5px solid ${on ? C.primary : C.line}`,
                  background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                  <input type="radio" checked={on} style={{ display: "none" }}
                    onChange={() => setDraft({ ...draft, usageType: v, ...(v === "practice" ? { deadline: "", targeted: false } : {}) })} />
                  {on ? "✓ " : ""}{l}
                </label>
              );
            })}
          </div>
          {(draft.usageType || "assignment") === "practice" && (
            <div style={{ fontSize: 12.5, color: C.soft, marginTop: 6 }}>Cet exercice sera publié dans la Bibliothèque d'entraînement, accessible librement par tous les élèves.</div>
          )}
        {(draft.usageType || "assignment") === "practice" && (
          <div style={{ marginTop: 12, display: "grid", gap: 12, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px" }}>
            <div>
              <div style={S.label}>📖 Vocabulaire (optionnel) — visible via le menu « S'entraîner ▾ »</div>
              <textarea style={{ ...S.input, marginTop: 6, minHeight: 80, resize: "vertical" }}
                value={draft.vocabulaire || ""} placeholder={"la forêt = khu rừng\nprotéger = bảo vệ\u2026"}
                onChange={(e) => setDraft({ ...draft, vocabulaire: e.target.value })} />
            </div>
            <div>
              <div style={S.label}>💡 Explications / Tips (optionnel)</div>
              <textarea style={{ ...S.input, marginTop: 6, minHeight: 80, resize: "vertical" }}
                value={draft.explications || ""} placeholder={"Rappel : « grâce à » = cause positive ; « à cause de » = cause négative\u2026"}
                onChange={(e) => setDraft({ ...draft, explications: e.target.value })} />
            </div>
          </div>
        )}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "2 1 240px" }}>
            <div style={S.label}>Titre</div>
            <input style={{ ...S.input, marginTop: 6 }} value={draft.title} placeholder="ex. Passé composé — les transports"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <div style={{ ...S.label, marginTop: 12 }}>Consigne / Énoncé de l'exercice (optionnel)</div>
            <div style={{ marginTop: 6 }}>
              <RichTextEditor minHeight={110} value={draft.consigne || ""}
                onChange={(html) => setDraft({ ...draft, consigne: stripHtml(html) ? html : "" })} />
            </div>
          </div>
          <div>
            <div style={S.label}>Niveau</div>
            <select style={{ ...S.input, marginTop: 6 }} value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })}>
              {Object.keys(LEVEL_COLORS).map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: "1 1 100%" }}>
            <div style={S.label}>Compétences (sélection multiple)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {SKILLS.map((sk) => {
                const on = dSkills.includes(sk);
                return (
                  <label key={sk} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, cursor: "pointer",
                    padding: "8px 16px", borderRadius: 999, fontWeight: 700,
                    border: `1.5px solid ${on ? C.primary : C.line}`,
                    background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                    <input type="checkbox" checked={on} style={{ display: "none" }} onChange={() => toggleSkill(sk)} />
                    {on ? "✓ " : ""}{sk}
                  </label>
                );
              })}
            </div>
          </div>
          {(draft.usageType || "assignment") !== "practice" && (
          <div>
            <div style={S.label}>Date limite (optionnel)</div>
            <input type="datetime-local" style={{ ...S.input, marginTop: 6 }} value={draft.deadline}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} />
          </div>
          )}
          <div>
            <div style={S.label}>⏱ Temps limite (min)</div>
            <input type="number" min="1" style={{ ...S.input, marginTop: 6, width: 110 }} value={draft.timeLimit || ""}
              placeholder="∞" onChange={(e) => setDraft({ ...draft, timeLimit: e.target.value })} />
          </div>

          {/* Bài trả phí. Giá chỉ hiện khi đã bật, để không ai vô tình đặt giá
              cho một bài đang miễn phí. */}
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <input type="checkbox" checked={!!draft.isPremium}
                onChange={(e) => setDraft({ ...draft, isPremium: e.target.checked, price: e.target.checked ? draft.price : "" })} />
              {t("pay.premium")}
            </label>
            {draft.isPremium && (
              <input type="number" min="0" step="1000" style={{ ...S.input, marginTop: 6, width: 150 }}
                value={draft.price || ""} placeholder={t("pay.price")}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
            )}
          </div>
        </div>
        {/* 🖼 Image d'illustration (optionnel) — URL hoặc kéo thả file */}
        <div style={{ marginTop: 14 }}>
          <div style={S.label}>🖼 Image d'illustration (optionnel)</div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", alignItems: "stretch" }}>
            <input style={{ ...S.input, flex: "1 1 260px" }} value={draft.imageUrl || ""}
              placeholder="https://…/image.jpg"
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })} />
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleImageFile(f);
              }}
              style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 6, padding: "14px 16px", borderRadius: 20, cursor: "pointer",
                border: `2px dashed ${C.line}`, background: "var(--mcf-surface2)", color: C.soft, fontSize: 12.5, textAlign: "center" }}>
              <ImageIcon size={22} color={C.soft} />
              Collez l'URL de l'image ou téléversez un fichier
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
            </label>
          </div>
          {imgMsg && <div style={{ fontSize: 12.5, color: C.danger, marginTop: 6 }}>{imgMsg}</div>}
          {draft.imageUrl && (
            <div style={{ position: "relative", display: "inline-block", marginTop: 12 }}>
              <img src={draft.imageUrl} alt="aperçu"
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 16, boxShadow: "0 4px 14px rgba(17,24,39,.12)", objectFit: "contain", display: "block" }} />
              <button title="Retirer l'image" onClick={() => setDraft({ ...draft, imageUrl: "" })}
                style={{ position: "absolute", top: -10, right: -10, width: 28, height: 28, borderRadius: "50%",
                  border: "none", background: C.danger, color: "#fff", cursor: "pointer", display: "grid",
                  placeItems: "center", boxShadow: "0 4px 10px rgba(222,75,75,.4)" }}>
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {dSkills.includes("Écoute") && (
        <div style={{ marginTop: 12 }}>
          <div style={S.label}>Lien audio pour compréhension orale (optionnel — URL mp3)</div>
          <input style={{ ...S.input, marginTop: 6 }} value={draft.audioUrl} placeholder="https://…/audio.mp3"
            onChange={(e) => setDraft({ ...draft, audioUrl: e.target.value })} />
          <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>💡 Astuce : téléversez votre mp3 sur Supabase Storage (bucket public) puis collez l'URL publique ici.</div>
        </div>
        )}

        {dSkills.includes("Lecture") && (
        <div style={{ marginTop: 12 }}>
          <div style={S.label}>📖 Texte de lecture (CE — optionnel) : l'élève verra une mise en page en 2 colonnes (texte | questions)</div>
          <textarea style={{ ...S.input, marginTop: 6, minHeight: 110, resize: "vertical" }} value={draft.readingText || ""}
            placeholder="Collez ici l'article ou le texte à lire…"
            onChange={(e) => setDraft({ ...draft, readingText: e.target.value })} />
        </div>
        )}

        {accounts.length > 0 && (draft.usageType || "assignment") !== "practice" && (
        <div style={{ marginTop: 14 }}>
          <div style={S.label}>Destinataires — qui reçoit ce devoir ?</div>

          {/* Cấp 1 : tất cả */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>
            <input type="checkbox" checked={!draft.targeted}
              onChange={(e) => setDraft({ ...draft, targeted: !e.target.checked })} />
            👥 Toute la classe / Tous les élèves
          </label>

          {draft.targeted && (
            <div style={{ marginTop: 12, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px", display: "grid", gap: 14 }}>
              {/* Cấp 2 : theo lớp */}
              <div>
                <div style={{ ...S.label, fontSize: 10.5 }}>🏫 Par classes</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {classes.length === 0 && <span style={{ fontSize: 12.5, color: C.soft }}>Aucune classe — créez-en dans l'onglet Élèves.</span>}
                  {classes.map((cl) => {
                    const on = (draft.assignedClasses || []).includes(cl.id);
                    const n = accounts.filter((a) => a.classId === cl.id).length;
                    return (
                      <label key={cl.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                        padding: "7px 14px", borderRadius: 999, fontWeight: 700,
                        border: `1.5px solid ${on ? C.primary : C.line}`,
                        background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                        <input type="checkbox" checked={on} style={{ display: "none" }}
                          onChange={() => setDraft({ ...draft, assignedClasses: on ? draft.assignedClasses.filter((x) => x !== cl.id) : [...(draft.assignedClasses || []), cl.id] })} />
                        {on ? "✓ " : ""}{cl.name} ({n})
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Cấp 3 : chọn đích danh */}
              <div>
                <div style={{ ...S.label, fontSize: 10.5 }}>👤 Par élèves spécifiques</div>
                <input style={{ ...S.input, marginTop: 8, maxWidth: 320 }} value={studentSearch}
                  placeholder="🔍 Rechercher un élève…" onChange={(e) => setStudentSearch(e.target.value)} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, maxHeight: 180, overflowY: "auto" }} className="mcf-scroll">
                  {accounts
                    .filter((a) => a.name.toLowerCase().includes(studentSearch.trim().toLowerCase()))
                    .map((a) => {
                      const viaClass = classMembers.has(a.name);
                      const on = viaClass || (draft.assignedExtra || []).includes(a.name);
                      return (
                        <label key={a.name} title={viaClass ? "Déjà inclus via sa classe" : ""}
                          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: viaClass ? "default" : "pointer",
                            padding: "7px 14px", borderRadius: 999, fontWeight: 600, opacity: viaClass ? 0.65 : 1,
                            border: `1.5px solid ${on ? C.primary : C.line}`,
                            background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                          <input type="checkbox" checked={on} disabled={viaClass} style={{ display: "none" }}
                            onChange={() => setDraft({ ...draft, assignedExtra: on ? (draft.assignedExtra || []).filter((n) => n !== a.name) : [...(draft.assignedExtra || []), a.name] })} />
                          {on ? "✓ " : ""}{a.name}{a.classId && className(a.classId) ? ` (${className(a.classId)})` : ""}
                        </label>
                      );
                    })}
                </div>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: mergedTargets.size ? C.ok : C.warn }}>
                {mergedTargets.size
                  ? `✓ ${mergedTargets.size} élève${mergedTargets.size > 1 ? "s" : ""} sélectionné${mergedTargets.size > 1 ? "s" : ""}`
                  : "⚠ Aucun élève sélectionné — cochez une classe ou un élève."}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {draft.questions.map((q, i) => (
        <div key={q.id} className="mcf-card" style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={S.label}>Question {i + 1} — {QTYPES[q.type]}{autoQ(q) && " (corrigé automatique)"}</span>
            <div style={{ display: "flex", gap: 14 }}>
              <button style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }} onClick={() => duplicateQuestion(q.id)}>⧉ dupliquer</button>
              <button style={{ background: "none", border: "none", color: C.danger, cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }} onClick={() => delQ(q.id)}>retirer</button>
            </div>
          </div>
          <textarea style={{ ...S.input, minHeight: 54, resize: "vertical" }} value={q.prompt}
            placeholder={q.type === "fill" || q.type === "conj" ? hint[q.type] : q.type === "qcm" ? "Énoncé de la question…" : "Consigne (ex. phrase à traduire)…"}
            onChange={(e) => setQ(q.id, { prompt: e.target.value })} />
          {q.type === "qcm" && (
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {q.options.map((o, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="radio" checked={q.answer === j} onChange={() => setQ(q.id, { answer: j })} title="Bonne réponse" />
                  <span style={{ fontWeight: 700, width: 20 }}>{String.fromCharCode(65 + j)}.</span>
                  <input style={S.input} value={o} placeholder={`Option ${String.fromCharCode(65 + j)}`}
                    onChange={(e) => setQ(q.id, { options: q.options.map((x, k) => (k === j ? e.target.value : x)) })} />
                  <button type="button" title={q.options.length > 2 ? "Supprimer cette option" : "Minimum 2 options"}
                    disabled={q.options.length <= 2}
                    onClick={() => {
                      const options = q.options.filter((_, k) => k !== j);
                      const answer = q.answer === j ? 0 : q.answer > j ? q.answer - 1 : q.answer;
                      setQ(q.id, { options, answer });
                    }}
                    style={{ border: "none", background: "transparent", cursor: q.options.length > 2 ? "pointer" : "not-allowed",
                      opacity: q.options.length > 2 ? 0.55 : 0.18, padding: 6, display: "grid", placeItems: "center" }}
                    onMouseEnter={(e) => { if (q.options.length > 2) e.currentTarget.style.opacity = 1; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = q.options.length > 2 ? 0.55 : 0.18; }}>
                    <Trash2 size={17} color={C.danger} />
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <button type="button" disabled={q.options.length >= 6}
                  onClick={() => setQ(q.id, { options: [...q.options, ""] })}
                  style={{ ...S.btn(false), padding: "7px 16px", fontSize: 13, opacity: q.options.length >= 6 ? 0.4 : 1 }}>
                  + Ajouter une option
                </button>
                <span style={{ fontSize: 12, color: C.soft }}>2-6 options · cochez la bonne réponse à gauche.</span>
              </div>
            </div>
          )}
          {(q.type === "fill" || q.type === "conj") && (
            <div style={{ marginTop: 10 }}>
              <div style={S.label}>Réponse(s) acceptée(s) — séparées par |</div>
              <input style={{ ...S.input, marginTop: 6 }} value={fillAccepted(q)} placeholder="ex. suis allé|suis allée"
                onChange={(e) => setQ(q.id, { accepted: e.target.value })} />
            </div>
          )}
          {q.type === "ordre" && (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input style={{ ...S.input, flex: "1 1 280px" }} value={q.sentence || ""}
                  placeholder="Tapez la phrase complète, ex. Je vais à l'école tous les jours."
                  onChange={(e) => setQ(q.id, { sentence: e.target.value })} />
                <button style={S.btn(false)} onClick={() => {
                  const parts = (q.sentence || "").trim().split(/\s+/).filter(Boolean);
                  if (parts.length) setQ(q.id, { elements: parts.map((t) => ({ id: uid(), texte: t })) });
                }}>⚡ Générer les blocs</button>
              </div>
              {(q.elements || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {q.elements.map((el, i) => (
                    <span key={el.id} style={{ display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "6px 8px", borderRadius: 12, background: "var(--mcf-surface)",
                      borderStyle: "solid", borderColor: C.line, borderWidth: "1.5px 1.5px 4px 1.5px" }}>
                      <input value={el.texte}
                        style={{ border: "none", background: "transparent", fontWeight: 700, fontSize: 13.5,
                          width: Math.max(30, el.texte.length * 8 + 12), color: "var(--mcf-ink)", outline: "none", fontFamily: "inherit" }}
                        onChange={(e) => setQ(q.id, { elements: q.elements.map((x) => x.id === el.id ? { ...x, texte: e.target.value } : x) })} />
                      {i > 0 && (
                        <button title="Fusionner avec le bloc précédent"
                          onClick={() => { const els = [...q.elements]; els[i - 1] = { ...els[i - 1], texte: els[i - 1].texte + " " + el.texte }; els.splice(i, 1); setQ(q.id, { elements: els }); }}
                          style={{ border: "none", background: "transparent", cursor: "pointer", color: C.primary, fontWeight: 800, padding: 0 }}>⇤</button>
                      )}
                      {q.elements.length > 2 && (
                        <button title="Supprimer ce bloc"
                          onClick={() => setQ(q.id, { elements: q.elements.filter((x) => x.id !== el.id) })}
                          style={{ border: "none", background: "transparent", cursor: "pointer", color: C.danger, fontWeight: 800, padding: 0 }}>✕</button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, color: C.soft }}>⇤ = fusionner avec le bloc précédent (ex. « à » + « l'école »). L'ordre ci-dessus est le corrigé — les blocs seront mélangés automatiquement pour l'élève.</div>
            </div>
          )}
          {q.type === "tableau" && (
            <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button style={{ ...S.btn(false), fontSize: 12.5, padding: "7px 14px" }}
                  onClick={() => setQ(q.id, { colonnes: [...q.colonnes, { id: uid(), titre: `Élément ${q.colonnes.length + 1}` }] })}>+ Ajouter un élément à comparer</button>
                <button style={{ ...S.btn(false), fontSize: 12.5, padding: "7px 14px" }}
                  onClick={() => setQ(q.id, { criteres: [...q.criteres, { id: uid(), texte: `Critère ${q.criteres.length + 1}` }] })}>+ Ajouter un critère</button>
              </div>

              {/* Éditer les titres de colonnes */}
              <div style={{ display: "grid", gap: 6 }}>
                {q.colonnes.map((co, ci) => (
                  <div key={co.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.soft, minWidth: 60 }}>Élément {ci + 1}</span>
                    <input style={{ ...S.input, flex: 1 }} value={co.titre}
                      onChange={(e) => setQ(q.id, { colonnes: q.colonnes.map((x) => x.id === co.id ? { ...x, titre: e.target.value } : x) })} />
                    {q.colonnes.length > 1 && (
                      <button title="Supprimer" onClick={() => { const rm = q.colonnes.filter((x) => x.id !== co.id); const na = { ...q.answers }; q.criteres.forEach((cr) => delete na[`${cr.id}_${co.id}`]); setQ(q.id, { colonnes: rm, answers: na }); }}
                        style={{ border: "none", background: "transparent", color: C.danger, cursor: "pointer" }}>🗑</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview + set corrigé */}
              <div style={{ overflowX: "auto" }} className="mcf-scroll">
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 380, fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ border: `1px solid ${C.line}`, padding: 8, textAlign: "left", background: "var(--mcf-surface2)" }}>Critère</th>
                      {q.colonnes.map((co) => <th key={co.id} style={{ border: `1px solid ${C.line}`, padding: 8, background: "var(--mcf-surface2)" }}>{co.titre}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {q.criteres.map((cr) => (
                      <tr key={cr.id}>
                        <td style={{ border: `1px solid ${C.line}`, padding: 6 }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input style={{ ...S.input, flex: 1, padding: "6px 10px", fontSize: 12.5 }} value={cr.texte}
                              onChange={(e) => setQ(q.id, { criteres: q.criteres.map((x) => x.id === cr.id ? { ...x, texte: e.target.value } : x) })} />
                            {q.criteres.length > 1 && (
                              <button title="Supprimer" onClick={() => { const rm = q.criteres.filter((x) => x.id !== cr.id); const na = { ...q.answers }; q.colonnes.forEach((co) => delete na[`${cr.id}_${co.id}`]); setQ(q.id, { criteres: rm, answers: na }); }}
                                style={{ border: "none", background: "transparent", color: C.danger, cursor: "pointer" }}>🗑</button>
                            )}
                          </div>
                        </td>
                        {q.colonnes.map((co) => {
                          const key = `${cr.id}_${co.id}`;
                          return (
                            <td key={co.id} style={{ border: `1px solid ${C.line}`, padding: 6, textAlign: "center" }}>
                              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                {["OUI", "NON"].map((v) => (
                                  <label key={v} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, cursor: "pointer",
                                    color: q.answers?.[key] === v ? (v === "OUI" ? C.ok : C.danger) : C.soft }}>
                                    <input type="radio" checked={q.answers?.[key] === v}
                                      onChange={() => setQ(q.id, { answers: { ...q.answers, [key]: v } })} />
                                    {v}
                                  </label>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 12, color: C.soft }}>Cochez OUI ou NON dans chaque cellule pour définir le corrigé.</div>
            </div>
          )}
          {q.type === "vf" && (
            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {VF_OPTS.map((o, j) => (
                  <label key={j} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14.5, cursor: "pointer", fontWeight: q.answer === j ? 700 : 500 }}>
                    <input type="radio" checked={q.answer === j}
                      onChange={() => setQ(q.id, { answer: j, justification: j === 2 ? "" : q.justification })} />
                    {o}
                  </label>
                ))}
              </div>
              {q.answer !== 2 && (
                <div>
                  <div style={S.label}>Justification attendue (trích dẫn từ bài đọc)</div>
                  <textarea style={{ ...S.input, marginTop: 6, minHeight: 50, resize: "vertical" }}
                    value={q.justification || ""}
                    placeholder="ex. « Le taux de fécondité a chuté de 22 % depuis 2007. »"
                    onChange={(e) => setQ(q.id, { justification: e.target.value })} />
                </div>
              )}
            </div>
          )}
          {q.type === "open" && (
            <div style={{ marginTop: 10 }}>
              <div style={S.label}>Corrigé type / Réponse suggérée (optionnel)</div>
              <textarea style={{ ...S.input, marginTop: 6, minHeight: 44, resize: "vertical" }} value={q.model}
                onChange={(e) => setQ(q.id, { model: e.target.value })} />
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <button style={S.btn(false)} onClick={() => addQ("qcm")}>+ QCM</button>
        <button style={S.btn(false)} onClick={() => addQ("fill")}>+ Texte à trous</button>
        <button style={S.btn(false)} onClick={() => addQ("conj")}>+ Conjugaison</button>
        <button style={S.btn(false)} onClick={() => addQ("open")}>+ Réponse libre</button>
        <button style={S.btn(false)} onClick={() => setDraft({ ...draft, questions: [...draft.questions, { id: uid(), type: "vf", prompt: "", answer: 0, justification: "" }] })}>+ Vrai / Faux / ?</button>
        <button style={S.btn(false)} onClick={() => setDraft({ ...draft, questions: [...draft.questions, { id: uid(), type: "tableau", prompt: "Pour chaque élément, cochez OUI ou NON selon le critère.", colonnes: [{ id: uid(), titre: "Élément 1" }, { id: uid(), titre: "Élément 2" }], criteres: [{ id: uid(), texte: "Critère 1" }], answers: {} }] })}>+ Tableau OUI/NON</button>
        <button style={S.btn(false)} onClick={() => setDraft({ ...draft, questions: [...draft.questions, { id: uid(), type: "ordre", prompt: "Mettez les mots dans le bon ordre pour former une phrase.", sentence: "", elements: [] }] })}>+ Remettre en ordre</button>
      </div>
      {/* 🪄 Modal Import JSON */}
      {jsonModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.55)", display: "grid", placeItems: "center", padding: 16, zIndex: 250 }}
          onClick={() => setJsonModal(false)}>
          <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...S.display, fontSize: 20, marginTop: 0, display: "flex", alignItems: "center", gap: 10 }}>🪄 Import JSON</h3>
            <div style={{ fontSize: 13, color: C.soft, marginBottom: 10 }}>
              Collez le JSON généré par une IA, ou chargez un fichier <b>.json</b>. Champs : <code>titre, niveau, competences[], consigne_generale, texte_support, audio_url, questions[]</code> — types : <code>QCM, TEXTE_A_TROUS, CONJUGAISON, VRAI_FAUX_ONSP, REPONSE_LIBRE</code>.
            </div>

            <textarea value={jsonText} onChange={(e) => { setJsonText(e.target.value); setJsonMsg(""); }} spellCheck={false}
              placeholder={'{\n  "titre": "Les transports",\n  "niveau": "B1",\n  "competences": ["Grammaire"],\n  "questions": [\n    { "type": "QCM", "question": "…", "options": ["a","b","c"], "reponse": 0 }\n  ]\n}'}
              style={{ width: "100%", minHeight: 240, boxSizing: "border-box", borderRadius: 14, border: `1.5px solid ${C.line}`,
                background: "#0B1120", color: "#4ADE80", fontFamily: "'Consolas','Menlo',monospace", fontSize: 13,
                padding: 16, resize: "vertical", lineHeight: 1.55 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <input ref={jsonFileRef} type="file" accept=".json,application/json" style={{ display: "none" }}
                onChange={(e) => onJsonFile(e.target.files?.[0])} />
              <button style={S.btn(false)} onClick={() => jsonFileRef.current?.click()}>📂 Charger un fichier .json</button>
              <span style={{ fontSize: 12, color: C.soft }}>ou glissez-collez le texte ci-dessus</span>
            </div>

            {jsonMsg && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                background: jsonMsg.startsWith("❌") ? C.dangerSoft : C.primarySoft,
                color: jsonMsg.startsWith("❌") ? C.danger : C.primary }}>{jsonMsg}</div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btn(true), opacity: jsonText.trim() ? 1 : 0.4, pointerEvents: jsonText.trim() ? "auto" : "none" }}
                onClick={() => handleImportJSON(jsonText)}>🪄 Importer</button>
              <button style={S.btn(false)} onClick={() => setJsonModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: toast.type === "ok" ? C.ok : C.danger, color: "#fff", padding: "12px 26px", borderRadius: 999,
          fontWeight: 700, fontSize: 14, boxShadow: "0 10px 30px rgba(17,24,39,.35)" }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn(true), opacity: ready ? 1 : 0.4 }} disabled={!ready}
          aria-describedby={ready ? undefined : "builder-missing"} onClick={publish}>Publier l'exercice</button>
        {!ready && (
          <p id="builder-missing" role="status"
            className="mt-2 rounded-md bg-warn-soft px-3 py-2.5 text-sm leading-relaxed text-warn">
            <span className="font-bold">{t("builder.missing")}</span>{" "}
            {missing.join(" · ")}
          </p>
        )}
        <button style={S.btn(false)} onClick={cancel}>Annuler</button>
      </div>
    </div>
  );
}


export default Builder;
