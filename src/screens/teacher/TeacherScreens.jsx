import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { useT } from "../../shared/i18n.jsx";
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from "../../shared/exercises.js";
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from "../../shared/questions.js";
import { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen } from "../../shared/display.js";
import { FloatingLayer, KebabMenu } from "../../shared/ui.jsx";
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile } from "../../shared/profile.js";
import { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal } from "../student/answers.jsx";
import ReadingPanel from "../../editor/ReadingPanel.jsx";
import RichTextEditor from "../../editor/RichTextEditor.jsx";
import { BookOpen, GraduationCap, MoreVertical, Pencil, Copy, Trash2, RotateCcw, Image as ImageIcon, X, Phone, Calendar, Target, Briefcase, ChevronLeft, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import Builder from "./Builder.jsx";
import PracticeHub from "../../PracticeHub.jsx";
import { PAYMENT_KEY, STATUS, isPremium, accessRecord, fmtPrice, loadAccess, setAccessRemote, getTeacherToken, setTeacherToken } from "../../shared/access.js";
import { supabase } from "../../storageShim.js";


/* ================= Teacher ================= */
function Teacher({ exercises, setExercises, submissions, setSubmissions, accounts, setAccounts, classes, setClasses, refresh, routeView }) {
  /* `routeView` đến từ URL. State nội bộ vẫn giữ, vì hai màn hình không có
     địa chỉ riêng — trình soạn bài ("new") và màn chấm bài ("progress:<id>")
     mở chồng lên rồi đóng lại. URL đổi thì kéo state theo; các bước tạm thì
     tự quản. */
  const [view, setView] = useState(routeView || "list");
  useEffect(() => { if (routeView) setView(routeView); }, [routeView]);
  // 📣 Annonces
  const [annModal, setAnnModal] = useState(false);
  const [annMsg, setAnnMsg] = useState("");
  const [annAll, setAnnAll] = useState(true);
  const [annClasses, setAnnClasses] = useState([]);
  const [annStudents, setAnnStudents] = useState([]);
  const [annSearch, setAnnSearch] = useState("");
  const [annToast, setAnnToast] = useState("");

  const sendAnnonce = async () => {
    const msg = annMsg.trim();
    if (!msg) return;
    let targets = null; // null = broadcast à tous
    if (!annAll) {
      const names = new Set(annStudents);
      annClasses.forEach((cid) => accounts.filter((a) => a.classId === cid).forEach((a) => names.add(a.name)));
      if (!names.size) return;
      targets = [...names];
    }
    const latest = await load("mcf-notifs", []);
    const next = [...latest, { id: uid(), message: msg, targets, createdAt: Date.now() }].slice(-30);
    await save("mcf-notifs", next);
    setAnnModal(false);
    setAnnToast("✅ Annonce envoyée !");
    setTimeout(() => setAnnToast(""), 3200);
  };
  const [draft, setDraft] = useState(null);

  const t = useT();
  const blank = () => ({ id: uid(), title: "", level: "B1", skill: "Grammaire", skills: ["Grammaire"], consigne: "", usageType: "assignment", deadline: "", audioUrl: "", readingText: "", imageUrl: "", timeLimit: "", targeted: false, assignedClasses: [], assignedExtra: [], assignedTo: null, createdAt: Date.now(), questions: [] });

  // Gom danh sách học sinh được giao : lớp đã tick ∪ học sinh chọn lẻ → mảng unique
  const finalizeTargets = (d) => {
    if (!d.targeted) return { ...d, assignedTo: null };
    const names = new Set(d.assignedExtra || []);
    (d.assignedClasses || []).forEach((cid) =>
      accounts.filter((a) => a.classId === cid).forEach((a) => names.add(a.name)));
    return { ...d, assignedTo: [...names] };
  };

  // Chuẩn hoá bài cũ khi mở Modifier (chưa có skills/targeted)
  const editPrep = (ex) => {
    const c = JSON.parse(JSON.stringify(ex));
    if (!c.skills || !c.skills.length) c.skills = c.skill ? [c.skill] : [];
    if (c.consigne === undefined) c.consigne = "";
    if (!c.usageType) c.usageType = "assignment";
    if (c.targeted === undefined) {
      c.targeted = !!(c.assignedTo && c.assignedTo.length);
      c.assignedExtra = c.assignedTo || [];
      c.assignedClasses = [];
    }
    return c;
  };

  const publish = async () => {
    const final = finalizeTargets(draft);
    final.usageType = final.usageType || "assignment";

    if (final.usageType === "practice") {
      // → Đẩy sang kho Entraînement, gỡ khỏi danh sách devoir
      const prac = await load("mcf-practice", []);
      const np = [...prac.filter((e) => e.id !== final.id),
        { ...final, assignedTo: null, targeted: false, deadline: "" }].sort((a, b) => a.createdAt - b.createdAt);
      const okP = await save("mcf-practice", np);
      if (!okP) { alert("❌ Échec de l'enregistrement — données trop volumineuses. Utilisez une URL publique pour l'image."); return; }
      const next = exercises.filter((e) => e.id !== final.id);
      setExercises(next); await save("mcf-exercises", next);
      setView("list"); return;
    }

    const others = exercises.filter((e) => e.id !== final.id);
    const next = [...others, final].sort((a, b) => a.createdAt - b.createdAt);
    const ok = await save("mcf-exercises", next);
    if (!ok) { alert("❌ Échec de l'enregistrement — données trop volumineuses (image base64). Utilisez plutôt une URL publique."); return; }
    // Nếu bài này từng nằm bên Entraînement → gỡ khỏi đó (chuyển trạng thái)
    const prac = await load("mcf-practice", []);
    if (prac.some((e) => e.id === final.id)) await save("mcf-practice", prac.filter((e) => e.id !== final.id));
    setExercises(next); setView("list");
  };
  const remove = async (id) => {
    const next = exercises.filter((e) => e.id !== id);
    setExercises(next); await save("mcf-exercises", next);
  };

  if (view === "new") return <Builder draft={draft} setDraft={setDraft} publish={publish} cancel={() => setView("list")} accounts={accounts} classes={classes} />;
  if (view.startsWith("progress:")) {
    const ex = exercises.find((e) => e.id === view.slice(9));
    return <Progress ex={ex} submissions={submissions} setSubmissions={setSubmissions} accounts={accounts} back={() => setView("list")} />;
  }

  return (
    <div>
      {/* Hàng tab ngang đã bỏ: bốn nhãn của nó (Bibliothèque d'exercices,
          Suivi des élèves, Statistiques, Entraînement) trùng khít với thanh
          bên, và mỗi tab đều có route riêng trong TEACHER_NAV nên không mất
          lối vào nào. `view` vẫn giữ vì nó còn điều khiển hai màn con không
          có URL riêng: soạn bài mới và chấm bài. */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={refresh}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-soft transition-colors hover:bg-surface2 hover:text-ink">
          ↻ {t("actions.refresh")}
        </button>
        {view === "list" && (
          <button type="button" onClick={() => { setAnnModal(true); setAnnMsg(""); setAnnAll(true); setAnnClasses([]); setAnnStudents([]); setAnnSearch(""); }}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-soft transition-colors hover:bg-surface2 hover:text-ink">
            📣 {t("actions.announce")}
          </button>
        )}
        {view === "list" && (
          <button type="button" onClick={() => { setDraft(blank()); setView("new"); }}
            className="ml-auto rounded-md border border-solid border-transparent bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            {t("actions.new_exercise")}
          </button>
        )}
      </div>

      {annModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.55)", display: "grid", placeItems: "center", padding: 16, zIndex: 9999 }}
          onClick={() => setAnnModal(false)}>
          <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...S.display, fontSize: 20, marginTop: 0 }}>📣 Envoyer une annonce</h3>
            <textarea style={{ ...S.input, minHeight: 90, resize: "vertical" }} value={annMsg} autoFocus
              placeholder="ex. Rappel : rendez le devoir B1 avant vendredi 19h !"
              onChange={(e) => setAnnMsg(e.target.value)} />

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>
              <input type="checkbox" checked={annAll} onChange={(e) => setAnnAll(e.target.checked)} />
              👥 Envoyer à tous les élèves
            </label>

            {!annAll && (
              <div style={{ marginTop: 10, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 14px", display: "grid", gap: 12 }}>
                <div>
                  <div style={{ ...S.label, fontSize: 10.5 }}>🏫 Par classes</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {classes.length === 0 && <span style={{ fontSize: 12.5, color: C.soft }}>Aucune classe créée.</span>}
                    {classes.map((cl) => {
                      const on = annClasses.includes(cl.id);
                      return (
                        <label key={cl.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                          padding: "6px 13px", borderRadius: 999, fontWeight: 700,
                          border: `1.5px solid ${on ? C.primary : C.line}`,
                          background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                          <input type="checkbox" checked={on} style={{ display: "none" }}
                            onChange={() => setAnnClasses(on ? annClasses.filter((x) => x !== cl.id) : [...annClasses, cl.id])} />
                          {on ? "✓ " : ""}{cl.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.label, fontSize: 10.5 }}>👤 Par élèves</div>
                  <input style={{ ...S.input, marginTop: 8, maxWidth: 280 }} value={annSearch}
                    placeholder="🔍 Rechercher…" onChange={(e) => setAnnSearch(e.target.value)} />
                  <div className="mcf-scroll" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, maxHeight: 140, overflowY: "auto" }}>
                    {accounts.filter((a) => a.name.toLowerCase().includes(annSearch.trim().toLowerCase())).map((a) => {
                      const on = annStudents.includes(a.name);
                      return (
                        <label key={a.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer",
                          padding: "6px 13px", borderRadius: 999, fontWeight: 600,
                          border: `1.5px solid ${on ? C.primary : C.line}`,
                          background: on ? C.primarySoft : "var(--mcf-surface)", color: on ? C.primary : C.ink }}>
                          <input type="checkbox" checked={on} style={{ display: "none" }}
                            onChange={() => setAnnStudents(on ? annStudents.filter((n) => n !== a.name) : [...annStudents, a.name])} />
                          {on ? "✓ " : ""}{a.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...S.btn(true), opacity: annMsg.trim() && (annAll || annClasses.length || annStudents.length) ? 1 : 0.4 }}
                disabled={!annMsg.trim() || (!annAll && !annClasses.length && !annStudents.length)}
                onClick={sendAnnonce}>📣 Envoyer</button>
              <button style={S.btn(false)} onClick={() => setAnnModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      {annToast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: C.ok, color: "#fff", padding: "12px 26px", borderRadius: 999, fontWeight: 700, fontSize: 14,
          boxShadow: "0 10px 30px rgba(17,24,39,.35)" }}>{annToast}</div>
      )}
      {view === "students" && <Accounts accounts={accounts} setAccounts={setAccounts} classes={classes} setClasses={setClasses} exercises={exercises} submissions={submissions} />}
      {view === "practice" && <PracticeHub role="prof" accounts={accounts} />}
      {view === "stats" && <Stats accounts={accounts} exercises={exercises} submissions={submissions} />}
      {view === "list" && (
        exercises.length === 0 ? (
          <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 40, color: C.soft }}>
            {t("empty.no_exercise")}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {exercises.map((ex) => {
              const targets = targetedAccounts(ex, accounts);
              const tNames = new Set(targets.map((a) => a.name));
              const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo && tNames.has(s.student));
              const toGrade = subs.filter((s) => !s.graded && ex.questions.some((q) => q.type === "open")).length;
              const late = isLate(ex);
              return (
                <div key={ex.id} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <span style={S.badge(ex.level)}>{ex.level}</span>
                    <span style={S.chip(C.primarySoft, C.primary)}>{exSkills(ex).join(" · ")}</span>{" "}
                    <strong style={{ fontSize: 17 }}>{ex.title}</strong>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>
                      {ex.questions.length} question(s) · {subs.length}/{targets.length} copies
                      {ex.assignedTo?.length
                        ? <span style={{ color: C.primary, fontWeight: 700 }} title={ex.assignedTo.join(", ")}> · 👤 {ex.assignedTo.length} élève{ex.assignedTo.length > 1 ? "s" : ""}{ex.assignedClasses?.length ? ` · 🏫 ${ex.assignedClasses.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(", ")}` : ""}</span>
                        : " · 👥 tous les élèves"}
                      {toGrade > 0 && <span style={{ color: C.warn, fontWeight: 700 }}> · ✏️ {toGrade} à corriger</span>}
                      {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {fmtDate(ex.deadline)}{late && " (clôturé)"}</span>}
                      {ex.audioUrl && " · 🎧 audio"}
                      {ex.timeLimit && <span style={{ fontWeight: 700 }}> · ⏱ {ex.timeLimit} min</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={S.btn(true)} onClick={() => setView("progress:" + ex.id)}>Suivi & correction</button>
                    <KebabMenu items={[
                      { label: "Modifier", icon: <Pencil size={16} />, onClick: () => { setDraft(editPrep(ex)); setView("new"); } },
                      { label: "Dupliquer", icon: <Copy size={16} />, onClick: () => duplicate(ex) },
                      { label: "Supprimer", icon: <Trash2 size={16} />, danger: true, onClick: () => remove(ex.id) },
                    ]} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

/* ================= Accounts ================= */
function Accounts({ accounts, setAccounts, classes, setClasses, exercises = [], submissions = [] }) {
  const [openStudent, setOpenStudent] = useState(null);   // 📂 dossier détaillé
  const [newClass, setNewClass] = useState("");
  const addClass = async () => {
    const n = newClass.trim(); if (!n) return;
    const next = [...classes, { id: uid(), name: n }];
    setClasses(next); await save("mcf-classes", next); setNewClass("");
  };
  const delClass = async (id) => {
    const next = classes.filter((c) => c.id !== id);
    setClasses(next); await save("mcf-classes", next);
  };
  const setStudentClass = async (name, classId) => {
    const latest = await load("mcf-accounts", []);
    const next = latest.map((a) => (a.name === name ? { ...a, classId: classId || undefined } : a));
    setAccounts(next); await save("mcf-accounts", next);
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [presence, setPresence] = useState({});
  const [, forceTick] = useState(0);

  // Nạp presence + tự làm mới mỗi 60 giây
  useEffect(() => {
    const fetchP = () => load("mcf-presence", {}).then(setPresence);
    fetchP();
    const t = setInterval(() => { fetchP(); forceTick((x) => x + 1); }, 60_000);
    return () => clearInterval(t);
  }, []);

  /* Danh sách lớp giờ chỉ còn là DANH BẠ, không phải nơi giữ mật khẩu.

     Mật khẩu đã chuyển hẳn sang Supabase Auth. Trường `code` cũ chứa mã dạng
     thô trong kv_store — bảng đọc được bằng anon key từ trình duyệt, tức ai
     cũng xem được mật khẩu của cả lớp. Nó cũng không còn xác thực gì kể từ khi
     màn đăng nhập PIN bị gỡ: giáo viên vẫn phát mật khẩu, học sinh vẫn đổi
     mật khẩu, mà không cái nào có tác dụng.

     Thay vào đó giáo viên ghi email. Học sinh tự đăng ký bằng chính email đó,
     rồi resolveRole khớp lại để giữ đúng tên hiển thị giáo viên đã đặt. */
  const add = async () => {
    const n = name.trim(), e = email.trim().toLowerCase();
    if (!n) { setMsg("Prénom requis."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { setMsg("Email invalide."); return; }
    if (accounts.some((a) => a.name.toLowerCase() === n.toLowerCase())) { setMsg("Ce prénom existe déjà."); return; }
    if (accounts.some((a) => (a.email || "").toLowerCase() === e)) { setMsg("Cet email est déjà utilisé."); return; }
    const next = [...accounts, { name: n, email: e }];
    setAccounts(next); await save("mcf-accounts", next);
    setName(""); setEmail(""); setMsg("");
  };
  const delAcc = async (n) => {
    const next = accounts.filter((a) => a.name !== n);
    setAccounts(next); await save("mcf-accounts", next);
  };

  /* Giáo viên không đặt mật khẩu hộ nữa — chỉ kích hoạt email đặt lại của
     Supabase. Mật khẩu chỉ đi qua tay chính học sinh, không qua lời nhắn. */
  const reset = async (n) => {
    const acc = accounts.find((a) => a.name === n);
    if (!acc?.email) { setMsg(`${n} n'a pas encore d'email. Ajoutez-le d'abord.`); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(acc.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setMsg(error ? `Échec de l'envoi : ${error.message}` : `Lien de réinitialisation envoyé à ${acc.email}.`);
  };

  if (openStudent) {
    const acc = accounts.find((a) => a.name === openStudent);
    if (!acc) { setOpenStudent(null); return null; }
    return <StudentDossier acc={acc} classes={classes} exercises={exercises} submissions={submissions}
      presence={presence} back={() => setOpenStudent(null)} />;
  }

  return (
    <div>
      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.label}>🏫 Classes</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <input style={{ ...S.input, flex: "1 1 200px", maxWidth: 280 }} value={newClass}
            placeholder="ex. B1-Matin, A1-K1…" onChange={(e) => setNewClass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addClass()} />
          <button style={S.btn(true)} onClick={addClass}>Créer la classe</button>
        </div>
        {classes.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {classes.map((cl) => (
              <span key={cl.id} style={{ ...S.chip(C.primarySoft, C.primary), display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px" }}>
                🏫 {cl.name} ({accounts.filter((a) => a.classId === cl.id).length})
                <button title="Supprimer la classe" onClick={() => delClass(cl.id)}
                  style={{ border: "none", background: "transparent", color: C.danger, cursor: "pointer", fontWeight: 800, padding: 0 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mcf-card" style={{ ...S.card, marginBottom: 16 }}>
        <div style={S.label}>Créer un compte élève (l'élève pourra changer son mot de passe)</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <input style={{ ...S.input, flex: "1 1 160px" }} value={name} placeholder="Prénom de l'élève" onChange={(e) => setName(e.target.value)} />
          <input style={{ ...S.input, flex: "1 1 200px" }} type="email" value={email} placeholder="Email de l'élève" onChange={(e) => setEmail(e.target.value)} />
          <button style={S.btn(true)} onClick={add}>Créer le compte</button>
        </div>
        {msg && <p style={{ color: C.danger, fontSize: 13, marginTop: 10, marginBottom: 0 }}>{msg}</p>}
      </div>
      {/* Nút « Afficher les mots de passe » đã bỏ cùng với trường code — không
          còn mật khẩu nào ở đây để hiện. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: C.soft }}>{accounts.length} compte(s)</span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {accounts.map((a) => (
          <div key={a.name} className="mcf-card" style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setOpenStudent(a.name)} title="Voir le dossier de l'élève"
                style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 800, fontSize: 15, color: C.primary, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}>
                {a.name}
              </button>
              {(() => {
                const st = formatLastSeen(presence[a.name]);
                return (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: st.online ? C.ok : C.soft, fontWeight: st.online ? 700 : 500 }}>
                    <span className={st.online ? "mcf-pulse" : ""}
                      style={{ width: 9, height: 9, borderRadius: "50%", background: st.online ? "#22C55E" : "#9CA3AF", flexShrink: 0 }} />
                    {st.label}
                  </span>
                );
              })()}
              <span style={{ fontSize: 13, color: a.email ? C.soft : C.warn }}>
                {a.email || "sans email — l'élève ne peut pas se connecter"}
              </span>
              <select value={a.classId || ""} onChange={(e) => setStudentClass(a.name, e.target.value)}
                style={{ ...S.input, width: "auto", padding: "5px 10px", fontSize: 12.5 }}>
                <option value="">— Sans classe —</option>
                {classes.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
              </select>
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn(false), padding: "5px 12px", fontSize: 12 }} onClick={() => reset(a.name)}
                title="Envoie un lien de réinitialisation à l'élève">Envoyer un lien</button>
              <button style={{ ...S.btn(false, true), padding: "5px 12px", fontSize: 12 }} onClick={() => delAcc(a.name)}>Supprimer</button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p style={{ color: C.soft }}>Aucun compte. Les élèves ne peuvent pas encore se connecter.</p>}
      </div>

      <AccessManager accounts={accounts} exercises={exercises} />
    </div>
  );
}

/* Cấp và thu hồi quyền cho bài trả phí, cùng cấu hình tài khoản nhận tiền.

   Đặt ở đây thay vì trong hồ sơ từng học sinh vì thao tác thật của giáo viên
   là: nhìn sao kê thấy một khoản tiền, rồi tìm đúng học sinh + đúng bài để mở
   khoá. Bảng chung làm được việc đó trong một màn hình; trang riêng từng em
   thì phải mở ra đóng vào nhiều lần.

   Không có gì tự động ở đây: mở khoá là hành động của giáo viên sau khi đã
   tự xác nhận tiền vào. Xem chú thích đầu src/shared/access.js. */
function AccessManager({ accounts, exercises }) {
  const t = useT();
  const [access, setAccess] = useState([]);
  const [cfg, setCfg] = useState({ bank: "", account: "", accountName: "" });
  const [savedCfg, setSavedCfg] = useState(false);
  const [token, setTok] = useState(getTeacherToken);
  const [busy, setBusy] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadAccess().then(setAccess);
    load(PAYMENT_KEY, null).then((c) => c && setCfg({ bank: "", account: "", accountName: "", ...c }));
  }, []);

  const premium = exercises.filter(isPremium);

  /* Mọi thay đổi quyền đi qua Edge Function. Trình duyệt không ghi được vào
     bảng quyền — đó là điều khiến bức tường trả phí có nghĩa. */
  const toggle = async (student, ex) => {
    const rec = accessRecord(access, student, ex.id);
    if (rec?.status === STATUS.PURCHASED) return;   // đã trả tiền: không gỡ bằng nút

    setBusy(`${student}|${ex.id}`);
    const res = await setAccessRemote(rec ? "revoke" : "grant", student, ex.id);
    setBusy(null);
    if (!res.ok) { setErr(res.reason === "no_token" ? t("pay.token_missing") : t("pay.call_failed")); return; }
    setErr("");
    setAccess(await loadAccess());
  };

  const saveCfg = async () => {
    await save(PAYMENT_KEY, cfg);
    setSavedCfg(true);
    setTimeout(() => setSavedCfg(false), 2000);
  };

  return (
    <div className="mt-6 rounded-md border border-solid border-line bg-surface p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-soft">{t("pay.access")}</h3>

      {/* Tài khoản nhận tiền — dùng để dựng mã QR cho học sinh. */}
      <div className="mb-6 rounded-md border border-solid border-line bg-surface2 p-4">
        <div className="mb-1 text-sm font-bold text-ink">{t("pay.config_title")}</div>
        <p className="mb-3 text-xs text-soft">{t("pay.config_hint")}</p>
        <div className="flex flex-wrap items-end gap-2">
          {[["bank", t("pay.bank"), "VCB"], ["account", t("pay.account"), "0123456789"], ["accountName", t("pay.holder"), "DO QUOC HUNG"]].map(([k, label, ph]) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-soft">{label}</span>
              <input value={cfg[k]} placeholder={ph}
                onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })}
                className="h-9 w-40 rounded-md border border-solid border-line-strong bg-surface px-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </label>
          ))}
          <button type="button" onClick={saveCfg}
            className="h-9 rounded-md border border-solid border-transparent bg-primary px-4 text-sm font-bold text-on-primary transition-opacity hover:opacity-90">
            {savedCfg ? t("pay.saved") : t("pay.save")}
          </button>
        </div>
      </div>

      {/* Khoá giáo viên. Lưu trong localStorage của máy này, không bao giờ ghi
          vào kv_store — ở đó ai cũng đọc được, và khoá bị lộ thì lối vòng mở
          lại y như cũ. */}
      <div className="mb-6 rounded-md border border-solid border-line bg-surface2 p-4">
        <div className="mb-1 text-sm font-bold text-ink">{t("pay.token_title")}</div>
        <p className="mb-3 text-xs text-soft">{t("pay.token_hint")}</p>
        <div className="flex flex-wrap items-end gap-2">
          <input type="password" value={token} placeholder="••••••••"
            onChange={(e) => { setTok(e.target.value); setTeacherToken(e.target.value); }}
            className="h-9 w-56 rounded-md border border-solid border-line-strong bg-surface px-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <span className={`text-xs font-bold ${token ? "text-ok" : "text-warn"}`}>
            {token ? t("pay.token_set") : t("pay.token_missing")}
          </span>
        </div>
      </div>

      {err && <p role="alert" className="mb-4 rounded-md bg-danger-soft px-3 py-2.5 text-sm text-danger">{err}</p>}

      {premium.length === 0 ? (
        <p className="text-sm text-soft">{t("pay.access_empty")}</p>
      ) : (
        <div className="mcf-scroll overflow-x-auto">
          <table className="mcf-table w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-0 border-b border-solid border-line px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-soft">
                  {t("nav.students")}
                </th>
                {premium.map((ex) => (
                  <th key={ex.id} className="border-0 border-b border-solid border-line px-2 py-2 text-left text-xs font-bold text-ink">
                    {ex.title}
                    <div className="font-normal text-soft">{fmtPrice(ex.price)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.name}>
                  <td className="border-0 border-b border-solid border-line px-2 py-2 font-bold text-ink">{a.name}</td>
                  {premium.map((ex) => {
                    const rec = accessRecord(access, a.name, ex.id);
                    return (
                      <td key={ex.id} className="border-0 border-b border-solid border-line px-2 py-2">
                        <button type="button" onClick={() => toggle(a.name, ex)}
                          aria-pressed={!!rec}
                          disabled={rec?.status === STATUS.PURCHASED || busy === `${a.name}|${ex.id}`}
                          title={rec?.status === STATUS.PURCHASED ? t("pay.paid_locked") : undefined}
                          className={[
                            "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                            rec ? "bg-ok-soft text-ok" : "bg-surface2 text-soft hover:text-ink",
                            rec?.status === STATUS.PURCHASED ? "cursor-not-allowed opacity-70" : "",
                          ].join(" ")}>
                          {rec ? `✓ ${t("pay.granted")}` : t("pay.grant")}
                        </button>
                        {rec && (
                          <div className="mt-0.5 text-[11px] text-soft">
                            {rec.status === STATUS.PURCHASED ? t("pay.by_purchase") : t("pay.by_teacher")}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function StudentDossier({ acc, classes, exercises, submissions, presence, back }) {
  const name = acc.name;
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [practice, setPractice] = useState({});
  const [pracEx, setPracEx] = useState([]);

  useEffect(() => {
    (async () => {
      const [profs, notesAll, ph, prac] = await Promise.all([
        load("mcf-profiles", {}), load("mcf-teacher-notes", {}),
        load(`mcf-ph-${name}`, {}, false), load("mcf-practice", []),
      ]);
      setProfile((profs && profs[name]) || {});
      setNotes((notesAll && notesAll[name]) || "");
      setPractice(ph && typeof ph === "object" ? ph : {});
      setPracEx(Array.isArray(prac) ? prac : []);
    })();
  }, [name]);

  const saveNotes = async () => {
    const all = await load("mcf-teacher-notes", {});
    all[name] = notes;
    await save("mcf-teacher-notes", all);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // ---- statistiques ----
  const mySubs = submissions.filter((s) => s.student === name);
  const scored = mySubs.map((s) => {
    const ex = exercises.find((e) => e.id === s.exerciseId);
    if (!ex) return null;
    const t = totalScore(s, ex);
    return t.max ? { ex, s, pct: Math.round((t.score / t.max) * 100), score: t.score, max: t.max } : null;
  }).filter(Boolean);
  const avg = scored.length ? Math.round(scored.reduce((a, b) => a + b.pct, 0) / scored.length) : null;
  const practiceRows = Object.entries(practice).filter(([, r]) => r && r.max);
  const totalDone = mySubs.length + practiceRows.length;
  const totalTime = mySubs.reduce((a, s) => a + (s.durationMs || 0), 0);
  const recent = [
    ...scored.map((r) => ({ title: r.ex.title, level: r.ex.level, pct: r.pct, label: `${r.score}/${r.max}`, at: r.s.at, kind: "Devoir" })),
    ...practiceRows.map(([exId, r]) => {
      const ex = pracEx.find((e) => e.id === exId);
      return { title: ex ? ex.title : "Exercice supprimé", level: ex ? ex.level : "", pct: Math.round((r.best / r.max) * 100), label: `${r.best}/${r.max}`, at: r.at || 0, kind: "Entraînement" };
    }),
  ].sort((a, b) => b.at - a.at).slice(0, 5);

  const st = formatLastSeen(presence[name]);
  const cls = classes.find((c) => c.id === acc.classId);
  const pct = calculateProfileCompletion(profile);

  const infoRow = (Icon, label, value) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <Icon size={17} color={C.primary} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 700, letterSpacing: .3, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 1 }}>{value || <span style={{ color: C.soft, fontWeight: 400 }}>Non renseigné</span>}</div>
      </div>
    </div>
  );

  const statCard = (Icon, label, value, color) => (
    <div className="mcf-card" style={{ ...S.card, padding: "16px 18px", textAlign: "center" }}>
      <Icon size={20} color={color} style={{ marginBottom: 6 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <button style={{ ...S.btn(false), marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }} onClick={back}>
        <ChevronLeft size={16} /> Retour aux élèves
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px, 1fr) minmax(300px, 2fr)", gap: 16, alignItems: "start" }}>
        {/* ---- Colonne gauche : carte profil ---- */}
        <div className="mcf-card" style={{ ...S.card, textAlign: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: avaColor(name), color: "#fff",
            fontSize: 40, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ ...S.display, fontSize: 22, margin: "0 0 6px" }}>{name}</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, marginBottom: 10,
            color: st.online ? C.ok : C.soft, fontWeight: st.online ? 700 : 500 }}>
            <span className={st.online ? "mcf-pulse" : ""} style={{ width: 9, height: 9, borderRadius: "50%", background: st.online ? "#22C55E" : "#9CA3AF" }} />
            {st.label}
          </div>
          {cls && <div><span style={S.chip(C.primarySoft, C.primary)}>🏫 {cls.name}</span></div>}
          <div style={{ marginTop: 16, textAlign: "left" }}>
            <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 700, marginBottom: 6 }}>PROFIL COMPLÉTÉ À {pct} %</div>
            <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.ok : C.primary, transition: "width .4s ease" }} />
            </div>
          </div>
        </div>

        {/* ---- Colonne droite ---- */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Informations personnelles */}
          <div className="mcf-card" style={{ ...S.card }}>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 16px" }}>📋 Informations personnelles</h3>
            {profile === null ? <p style={{ color: C.soft, margin: 0 }}>Chargement…</p> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
                {infoRow(Phone, "Téléphone", profile.phone)}
                {infoRow(Calendar, "Date de naissance", fmtDateFR(profile.dob))}
                {infoRow(Briefcase, "École / Profession", profile.school)}
                {infoRow(GraduationCap, "Niveau actuel", profile.level)}
                {infoRow(Target, "Objectif", profile.goal)}
              </div>
            )}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
              <div style={S.label}>🗝️ Notes privées (visibles uniquement par vous)</div>
              <textarea style={{ ...S.input, marginTop: 8, minHeight: 76, resize: "vertical" }} value={notes}
                placeholder="ex. Prononciation du « r » à travailler ; très bon à l'écrit…"
                onChange={(e) => setNotes(e.target.value)} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <button style={{ ...S.btn(true), padding: "8px 18px", fontSize: 13 }} onClick={saveNotes}>💾 Enregistrer les notes</button>
                {notesSaved && <span style={{ fontSize: 13, color: C.ok, fontWeight: 700 }}>✅ Notes enregistrées</span>}
              </div>
            </div>
          </div>

          {/* Aperçu des performances */}
          <div>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 12px" }}>📈 Aperçu des performances</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {statCard(CheckCircle, "Exercices terminés", totalDone, C.primary)}
              {statCard(TrendingUp, "Score moyen", avg == null ? "—" : `${avg} %`, avg == null ? C.soft : avg >= 80 ? C.ok : avg >= 50 ? C.warn : C.danger)}
              {statCard(Clock, "Temps total", fmtDuration(totalTime), C.primary)}
            </div>
          </div>

          {/* Activités récentes */}
          <div className="mcf-card" style={{ ...S.card }}>
            <h3 style={{ ...S.display, fontSize: 17, margin: "0 0 14px" }}>⏱️ Activités récentes</h3>
            {recent.length === 0 ? (
              <p style={{ color: C.soft, margin: 0, fontSize: 14 }}>Aucune activité pour le moment.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recent.map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    background: "var(--mcf-surface2)", border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px" }}>
                    {r.level && <span style={S.badge(r.level)}>{r.level}</span>}
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                      <div style={{ fontSize: 11.5, color: C.soft, marginTop: 1 }}>{r.kind} · {r.at ? new Date(r.at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—"}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: r.pct >= 80 ? C.ok : r.pct >= 50 ? C.warn : C.danger }}>
                      {r.label} <span style={{ fontSize: 12, fontWeight: 600 }}>({r.pct} %)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Stats (teacher) ================= */
function Stats({ accounts, exercises, submissions }) {
  const perExercise = exercises.map((ex) => {
    const pcts = submissions.filter((s) => s.exerciseId === ex.id).map((s) => {
      const t = totalScore(s, ex); return t.max ? (t.score / t.max) * 100 : null;
    }).filter((x) => x != null);
    const mean = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
    const sd = pcts.length > 1 ? Math.sqrt(pcts.reduce((a, b) => a + (b - mean) ** 2, 0) / (pcts.length - 1)) : 0;
    return { name: ex.title.length > 16 ? ex.title.slice(0, 15) + "…" : ex.title, full: ex.title, skill: exSkills(ex).join(" · "), moyenne: mean == null ? null : Math.round(mean), ecartType: Math.round(sd * 10) / 10, copies: pcts.length };
  });

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    exercises.filter((e) => exSkills(e).includes(skill)).forEach((ex) => {
      submissions.filter((s) => s.exerciseId === ex.id).forEach((s) => {
        const t = totalScore(s, ex); if (t.max) pcts.push((t.score / t.max) * 100);
      });
    });
    return { skill, classe: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0 };
  });

  const exportCSV = () => {
    const rows = [["Exercice", "Compétence", "Copies", "Moyenne (%)", "Écart-type"]];
    perExercise.forEach((r) => rows.push([r.full, r.skill, r.copies, r.moyenne ?? "", r.ecartType]));
    rows.push([]);
    rows.push(["Élève", ...exercises.map((e) => e.title), "Moyenne élève (%)"]);
    accounts.forEach((a) => {
      const cells = exercises.map((ex) => {
        const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
        if (!s) return "";
        const t = totalScore(s, ex);
        return t.max ? `${t.score}/${t.max}` : "";
      });
      const pcts = exercises.map((ex) => {
        const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
        if (!s) return null; const t = totalScore(s, ex); return t.max ? (t.score / t.max) * 100 : null;
      }).filter((x) => x != null);
      cells.push(pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : "");
      rows.push([a.name, ...cells]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rapport_classe.csv";
    a.click();
  };

  const chartData = perExercise.filter((r) => r.moyenne != null);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="mcf-card" style={{ ...S.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={S.label}>Moyenne & écart-type par exercice</div>
          <button style={S.btn(true)} onClick={exportCSV}>⬇ Exporter le rapport (CSV)</button>
        </div>
        {chartData.length === 0 ? <p style={{ color: C.soft, fontSize: 14 }}>Pas encore de copies notées.</p> : (
          <div style={{ width: "100%", height: 260, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, k) => [k === "moyenne" ? v + " %" : v, k === "moyenne" ? "Moyenne" : "Écart-type"]} />
                <Legend />
                <Bar dataKey="moyenne" name="Moyenne (%)" fill={C.primary} radius={[6, 6, 0, 0]} />
                <Bar dataKey="ecartType" name="Écart-type" fill={C.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mcf-card" style={{ ...S.card }}>
        <div style={S.label}>Profil de la classe par compétence</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={radar}>
              <PolarGrid stroke={C.line} />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Classe" dataKey="classe" stroke={C.primary} fill={C.primary} fillOpacity={0.35} />
              <Tooltip formatter={(v) => v + " %"} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <StudentTable accounts={accounts} exercises={exercises} submissions={submissions} />
    </div>
  );
}

function StudentTable({ accounts, exercises, submissions }) {
  const th = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: C.soft, textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${C.line}` };
  const td = { fontSize: 14, padding: "9px 10px", borderBottom: `1px solid ${C.line}` };
  return (
    <div className="mcf-card" style={{ ...S.card, overflowX: "auto" }}>
      <div style={{ ...S.label, marginBottom: 10 }}>Notes par élève</div>
      {accounts.length === 0 ? <p style={{ color: C.soft }}>Aucun élève inscrit.</p> : (
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520 }}>
          <thead><tr>
            <th style={th}>Élève</th><th style={th}>Rendus</th>
            {exercises.map((ex) => <th key={ex.id} style={th} title={ex.title}>{ex.title.length > 13 ? ex.title.slice(0, 12) + "…" : ex.title}</th>)}
            <th style={th}>Moyenne</th>
          </tr></thead>
          <tbody>
            {accounts.map((a) => {
              const cells = exercises.map((ex) => {
                if (!assignedTo(ex, a.name)) return { na: true };
                const s = submissions.find((x) => x.exerciseId === ex.id && x.student === a.name);
                if (!s) return null;
                if (s.redo) return { redo: true };
                return { ...totalScore(s, ex), late: s.late };
              });
              const pcts = cells.filter((c) => c && !c.na && !c.redo && c.max).map((c) => (c.score / c.max) * 100);
              const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : null;
              const nAssigned = cells.filter((c) => !c || !c.na).length;
              return (
                <tr key={a.name}>
                  <td style={{ ...td, fontWeight: 700 }}>{a.name}</td>
                  <td style={td}>{cells.filter((c) => c && !c.na && !c.redo).length}/{nAssigned}</td>
                  {cells.map((c, i) => (
                    <td key={i} style={{ ...td, fontWeight: c && !c.na ? 700 : 400, color: !c ? C.soft : c.na ? C.line : c.pending ? C.warn : c.score / c.max >= 0.5 ? C.ok : C.danger }}>
                      {!c ? "—" : c.na ? "·" : c.redo ? "🔁" : `${c.score}/${c.max}${c.pending ? " ⏳" : ""}${c.late ? " 🕐" : ""}`}
                    </td>
                  ))}
                  <td style={{ ...td, fontWeight: 800, color: avg == null ? C.soft : avg >= 50 ? C.ok : C.danger }}>{avg == null ? "—" : avg + " %"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>⏳ = réponses libres pas encore corrigées · 🕐 = rendu en retard · « · » = exercice non assigné à cet élève · 🔁 = à refaire</p>
    </div>
  );
}

/* ================= Builder ================= */
/* ================= Progress & grading ================= */
function Progress({ ex, submissions, setSubmissions, accounts, back }) {
  const [open, setOpen] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [qDrafts, setQDrafts] = useState({});
  const [marks, setMarks] = useState({});
  const [attachDrafts, setAttachDrafts] = useState({});
  const [redoFor, setRedoFor] = useState(null); // tên học sinh đang yêu cầu làm lại
  const [redoNote, setRedoNote] = useState("");
  if (!ex) return null;
  const roster = targetedAccounts(ex, accounts);
  const rosterNames = new Set(roster.map((a) => a.name));
  // Chỉ đếm bài nộp của học sinh ĐANG được giao (tránh 2/1 khi đổi danh sách giao bài)
  const subs = submissions.filter((s) => s.exerciseId === ex.id && !s.redo && rosterNames.has(s.student));
  const byName = Object.fromEntries(submissions.filter((s) => s.exerciseId === ex.id).map((s) => [s.student, s]));
  const opens = ex.questions.filter((q) => q.type === "open");

  // 🔁 Yêu cầu làm lại : reset điểm, đổi trạng thái sang redo + lưu lý do
  const requestRedo = async (student) => {
    const latest = await load("mcf-submissions", []);
    const next = latest.map((s) => {
      if (!(s.exerciseId === ex.id && s.student === student)) return s;
      return { ...s, redo: true, redoNote: redoNote.trim(), graded: false, openMarks: {}, autoScore: 0 };
    });
    await save("mcf-submissions", next);
    setSubmissions(next); setRedoFor(null); setRedoNote("");
  };

  const saveGrading = async (student) => {
    const sub = byName[student];
    const latest = await load("mcf-submissions", []);
    const next = latest.map((s) => {
      if (!(s.exerciseId === ex.id && s.student === student)) return s;
      return {
        ...s,
        comment: (drafts[student] ?? s.comment ?? ""),
        feedbackUrl: (attachDrafts[student] ?? s.feedbackUrl ?? "").trim(),
        qComments: { ...(s.qComments || {}), ...(qDrafts[student] || {}) },
        openMarks: { ...(s.openMarks || {}), ...(marks[student] || {}) },
        graded: true,
      };
    });
    await save("mcf-submissions", next);
    setSubmissions(next);
  };

  return (
    <div>
      <button style={{ ...S.btn(false), marginBottom: 16 }} onClick={back}>← Retour</button>
      <h2 style={{ ...S.display, marginTop: 0 }}>{ex.title} <span style={{ fontSize: 13, color: C.soft, fontFamily: "'Be Vietnam Pro',sans-serif" }}>({ex.level} · {exSkills(ex).join(" + ")})</span></h2>
      {ex.deadline && <p style={{ fontSize: 13, color: isLate(ex) ? C.danger : C.warn, fontWeight: 700 }}>⏰ Date limite : {fmtDate(ex.deadline)}{isLate(ex) && " — les rendus tardifs sont marqués 🕐"}</p>}

      <div className="mcf-card" style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.label}>Progression de la classe</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>{subs.length} copie(s) rendue(s) sur {roster.length} élève(s) concerné(s)
          {ex.assignedTo?.length ? <span style={{ color: C.primary, fontWeight: 700 }}> · 👤 devoir individuel</span> : null}</div>
        <div style={{ height: 10, background: C.line, borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: `${Math.min(100, roster.length ? (subs.length / roster.length) * 100 : 0)}%`, background: `linear-gradient(90deg, ${C.ok}, #37C48E)`, borderRadius: 99 }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {roster.map(({ name }) => {
          const sub = byName[name];
          const t = sub && totalScore(sub, ex);
          return (
            <div key={name} className="mcf-card" style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <strong>{name}{sub?.late && <span style={S.chip(C.warnSoft, C.warn)}> 🕐 En retard</span>}</strong>
                {sub?.redo ? (
                  <span style={{ fontSize: 13, color: C.warn, fontWeight: 700 }}>🔁 À refaire demandé{sub.redoNote && ` — « ${sub.redoNote} »`}</span>
                ) : sub ? (
                  <span style={{ fontSize: 13 }}>
                    <span style={{ color: C.ok, fontWeight: 700 }}>Rendu</span>
                    {" · "}<strong>{t.score}/{t.max}{t.pending && " ⏳"}</strong>
                    {" · "}{fmtDate(sub.at)}
                    {sub.timedOut && " · ⏱ auto (temps écoulé)"}
                    {sub.graded && " · ✅ corrigé"}
                    <button style={{ ...S.btn(false), marginLeft: 12, padding: "4px 10px", fontSize: 12 }}
                      onClick={() => setOpen(open === name ? null : name)}>{open === name ? "Fermer" : "Corriger / voir"}</button>
                  </span>
                ) : <span style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>Pas encore rendu</span>}
              </div>

              {sub && open === name && (
                <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12, display: "grid", gap: 14 }}>
                  {ex.questions.map((q, i) => {
                    const a = sub.answers[q.id];
                    const good = q.type === "qcm" ? a === q.answer
                      : q.type === "vf" ? vfOk(q, a)
                      : q.type === "tableau" ? tableauOk(q, a)
                      : q.type === "ordre" ? ordreOk(q, a)
                      : (q.type === "fill" || q.type === "conj") ? fillOk(q, a) : null;
                    return (
                      <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.line}` }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                        <div style={{ fontSize: 14 }}>
                          {q.type === "tableau" && <div style={{ marginTop: 6 }}><TableauCompare q={q} value={a || {}} readOnly correction /></div>}
                          {q.type === "ordre" && <div style={{ marginTop: 6 }}><OrdreBlocks q={q} value={a || []} readOnly correction /></div>}
                          {q.type !== "vf" && q.type !== "tableau" && q.type !== "ordre" && <>Réponse : </>}{q.type === "vf" || q.type === "tableau" || q.type === "ordre" ? null : q.type === "qcm"
                            ? <strong style={{ color: good ? C.ok : C.danger }}>{a != null ? String.fromCharCode(65 + a) + ". " + q.options[a] : "—"}</strong>
                            : q.type === "open"
                            ? <div style={{ marginTop: 6, background: "var(--mcf-surface)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                            : <em style={{ color: good ? C.ok : C.danger }}>{a || "—"}</em>}
                          {good === false && q.type === "qcm" && <span> · attendu : <strong>{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</strong></span>}
                          {(q.type === "fill" || q.type === "conj") && <span> · 💡 attendu : <strong>{String(fillAccepted(q)).split("|")[0]}</strong></span>}
                          {q.type === "vf" && (
                            <div style={{ marginTop: 4 }}>
                              Choix : <strong style={{ color: good ? C.ok : C.danger }}>{a?.choice != null ? VF_OPTS[a.choice] : "—"}</strong>
                              {good === false && <span> · attendu : <strong>{VF_OPTS[q.answer]}</strong></span>}
                              {a?.just && <div style={{ fontStyle: "italic", marginTop: 3 }}>Justification de l'élève : « {a.just} »</div>}
                              {q.answer !== 2 && q.justification && (
                                <div style={{ marginTop: 6, background: C.okSoft, border: `1px solid ${C.ok}44`, borderRadius: 10, padding: "8px 12px" }}>
                                  💡 <strong>Justification attendue :</strong> {q.justification}
                                </div>
                              )}
                            </div>
                          )}
                          {q.type === "open" && q.model && <div style={{ color: C.soft, marginTop: 4 }}>Modèle : {q.model}</div>}
                        </div>
                        {q.type === "open" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: C.soft, fontWeight: 700 }}>NOTE :</span>
                            {[1, 0].map((v) => {
                              const cur = marks[name]?.[q.id] ?? sub.openMarks?.[q.id] ?? null;
                              return (
                                <button key={v} onClick={() => setMarks({ ...marks, [name]: { ...(marks[name] || {}), [q.id]: v } })}
                                  style={{ ...S.btn(cur === v), padding: "4px 12px", fontSize: 12, background: cur === v ? (v ? C.ok : C.danger) : C.card, boxShadow: "none" }}>
                                  {v ? "✓ Juste (1 pt)" : "✗ À revoir (0 pt)"}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <input style={{ ...S.input, marginTop: 8, fontSize: 13 }}
                          placeholder="Commentaire sur cette question (visible par l'élève)…"
                          value={qDrafts[name]?.[q.id] ?? sub.qComments?.[q.id] ?? ""}
                          onChange={(e) => setQDrafts({ ...qDrafts, [name]: { ...(qDrafts[name] || {}), [q.id]: e.target.value } })} />
                      </div>
                    );
                  })}
                  <div>
                    <div style={S.label}>Appréciation générale</div>
                    <textarea style={{ ...S.input, marginTop: 6, minHeight: 60, resize: "vertical" }}
                      value={drafts[name] ?? sub.comment ?? ""}
                      placeholder="ex. Très bon travail ! Revois l'accord du participe passé."
                      onChange={(e) => setDrafts({ ...drafts, [name]: e.target.value })} />

                    {/* 📎 File chữa bài đính kèm (optionnel) */}
                    <div style={{ marginTop: 10 }}>
                      <div style={S.label}>📎 Joindre un fichier (optionnel) — URL de la correction (PDF, DOCX, image…)</div>
                      <input style={{ ...S.input, marginTop: 6 }}
                        value={attachDrafts[name] ?? sub.feedbackUrl ?? ""}
                        placeholder="https://…/correction.pdf"
                        onChange={(e) => setAttachDrafts({ ...attachDrafts, [name]: e.target.value })} />
                      {(attachDrafts[name] ?? sub.feedbackUrl) && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8,
                          background: C.primarySoft, color: C.primary, borderRadius: 999, padding: "6px 14px",
                          fontSize: 12.5, fontWeight: 700, maxWidth: "100%", overflow: "hidden" }}>
                          📄 {fileNameFromUrl(attachDrafts[name] ?? sub.feedbackUrl)}
                          <button title="Retirer" onClick={() => setAttachDrafts({ ...attachDrafts, [name]: "" })}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: C.danger, fontWeight: 800, padding: 0 }}>✕</button>
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <button style={S.btn(true)} onClick={() => saveGrading(name)}>
                        Enregistrer la correction {opens.length > 0 && "et la note"}
                      </button>
                      <button onClick={() => { setRedoFor(name); setRedoNote(""); }}
                        style={{ ...S.btn(false), color: C.warn, borderColor: C.warn, display: "inline-flex", alignItems: "center", gap: 7 }}>
                        <RotateCcw size={15} /> Demander de refaire
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog lý do yêu cầu làm lại */}
      {redoFor && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,.45)", display: "grid", placeItems: "center", padding: 16, zIndex: 200 }}
          onClick={() => setRedoFor(null)}>
          <div className="mcf-card" style={{ ...S.card, width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ ...S.display, fontSize: 20, marginTop: 0 }}>🔁 Demander à {redoFor} de refaire</h3>
            <p style={{ fontSize: 13.5, color: C.soft, marginTop: 0 }}>La note sera remise à zéro et l'exercice retournera dans « À faire » de l'élève.</p>
            <div style={S.label}>Remarque (visible sur le tableau de bord de l'élève)</div>
            <textarea style={{ ...S.input, marginTop: 6, minHeight: 70, resize: "vertical" }} value={redoNote}
              placeholder="ex. Attention à l'accord du participe passé — refais les questions 3 et 5."
              onChange={(e) => setRedoNote(e.target.value)} autoFocus />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={{ ...S.btn(true), background: `linear-gradient(135deg, ${C.warn}, #E09A2B)`, boxShadow: "0 6px 16px rgba(201,132,18,.35)" }}
                onClick={() => requestRedo(redoFor)}>Confirmer</button>
              <button style={S.btn(false)} onClick={() => setRedoFor(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { Teacher, Accounts, StudentDossier, Stats, StudentTable, Progress };
export default Teacher;
