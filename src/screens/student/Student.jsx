import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { supabase } from "../../storageShim.js";
import AccountPage from "../account/AccountPage.jsx";
import { useT } from "../../shared/i18n.jsx";
import { SKILLS, fmtDate, isLate, exSkills, assignedTo, totalScore } from "../../shared/exercises.js";
import { uid, norm, stripHtml, wordCount, vfOk, fillAccepted, fillOk, autoQ, ordreOk, tableauCells, tableauOk, isQuestionAnswered, getUnansweredQuestionsCount } from "../../shared/questions.js";
import { AVA_COLORS, avaColor, fmtDateFR, fmtDuration, targetedAccounts, fileNameFromUrl, formatLastSeen } from "../../shared/display.js";
import { FloatingLayer, KebabMenu, WrongExplanation } from "../../shared/ui.jsx";
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile } from "../../shared/profile.js";
import { OrdreChip, OrdreBlocks, TableauCompare, ConfirmSubmitModal } from "./answers.jsx";
import ReadingPanel from "../../editor/ReadingPanel.jsx";
import RichTextEditor from "../../editor/RichTextEditor.jsx";
import { BookOpen, GraduationCap, MoreVertical, Pencil, Copy, Trash2, RotateCcw, Image as ImageIcon, X, Phone, Calendar, Target, Briefcase, ChevronLeft, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import PracticeHub from "../../PracticeHub.jsx";
import Taking from "./Taking.jsx";
import NeoCauHoi from "./NeoCauHoi.jsx";


/* ================= Student ================= */
function Student({ name, exercises, submissions, setSubmissions, accounts, setAccounts, refresh, routeView }) {
  const [taking, setTaking] = useState(null);

  // 🟢 Presence heartbeat : cập nhật last_active_at (debounce 90s) khi có tương tác
  useEffect(() => {
    let lastBeat = 0;
    const beat = async () => {
      lastBeat = Date.now();
      try {
        const p = await load("mcf-presence", {});
        p[name] = Date.now();
        await save("mcf-presence", p);
      } catch {}
    };
    const onActivity = () => { if (Date.now() - lastBeat > 90_000) beat(); };
    beat(); // đánh dấu online ngay khi vào
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, onActivity));
  }, [name]);
  /* `routeView` đến từ URL; xem chú thích tương ứng trong Teacher. */
  const [tab, setTab] = useState(routeView || "todo");
  useEffect(() => { if (routeView) setTab(routeView); }, [routeView]);
  const [showPw, setShowPw] = useState(false);
  const t = useT();

  /* Email và trạng thái xác minh lấy từ chính phiên Supabase, không phải từ
     hồ sơ — hồ sơ do người dùng ghi, còn đây là dữ kiện của tài khoản.

     PHẢI đứng TRƯỚC `if (taking) return …` bên dưới. Ba hook này từng nằm sau
     nó: mở một bài để làm khiến component thoát sớm và bỏ qua chúng, React
     đếm được ít hook hơn lần render trước và ném lỗi #300 — cả trang bị error
     boundary nuốt mất. Mọi hook của component này phải nằm trên mốc đó. */
  const [authEmail, setAuthEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  useEffect(() => {
    let off = false;
    supabase.auth.getUser().then(({ data }) => {
      if (off || !data?.user) return;
      setAuthEmail(data.user.email || "");
      setEmailVerified(!!data.user.email_confirmed_at);
    }).catch(() => {});
    return () => { off = true; };
  }, []);

  const mine = (exId) => submissions.find((s) => s.exerciseId === exId && s.student === name);
  const mineDone = (exId) => { const s0 = mine(exId); return s0 && !s0.redo ? s0 : null; };

  /* ⚠️ MỐC HOOK — không thêm hook nào bên dưới dòng này. */
  if (taking) return <Taking ex={taking} name={name} setSubmissions={setSubmissions} done={() => { setTaking(null); refresh(); }} />;

  const visible = exercises.filter((ex) => assignedTo(ex, name));
  const todo = visible.filter((ex) => !mineDone(ex.id))
    .sort((a, b) => (a.deadline ? new Date(a.deadline) : Infinity) - (b.deadline ? new Date(b.deadline) : Infinity));
  const doneList = visible.filter((ex) => mineDone(ex.id));
  const gradedList = doneList.filter((ex) => mine(ex.id).graded || !ex.questions.some((q) => q.type === "open"));

  const myScores = visible.map((ex, i) => {
    const s = mineDone(ex.id); if (!s) return null;
    const t = totalScore(s, ex); if (!t.max) return null;
    return { name: `Ex.${i + 1}`, full: ex.title, pct: Math.round((t.score / t.max) * 100), at: s.at };
  }).filter(Boolean).sort((a, b) => a.at - b.at);

  const radar = SKILLS.map((skill) => {
    const pcts = [];
    visible.filter((e) => exSkills(e).includes(skill)).forEach((ex) => {
      const s = mineDone(ex.id); if (!s) return;
      const t = totalScore(s, ex); if (t.max) pcts.push((t.score / t.max) * 100);
    });
    return { skill, moi: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0 };
  });

  const stamps = visible.filter((ex) => {
    const s = mineDone(ex.id); if (!s) return false;
    const t = totalScore(s, ex); return t.max && t.score / t.max >= 0.8;
  }).length;
  const JOURNEY = [
    { need: 1, icon: "🥐", label: "La boulangerie" }, { need: 3, icon: "🚉", label: "Gare de Lyon" },
    { need: 5, icon: "🖼️", label: "Le Louvre" }, { need: 8, icon: "🗼", label: "Tour Eiffel" },
    { need: 12, icon: "✈️", label: "Départ pour Paris !" },
  ];

  /* Đổi mật khẩu qua Supabase Auth.

     Trước đây hàm này so sánh với `acc.code` rồi ghi mật khẩu mới dạng thô vào
     kv_store — bảng mà trình duyệt đọc được bằng anon key. Từ khi đăng nhập
     chuyển sang Supabase, nó còn ghi vào chỗ chẳng ai đọc: học sinh đổi mật
     khẩu, thấy báo thành công, rồi lần sau vẫn phải đăng nhập bằng mật khẩu cũ.

     Mật khẩu cũ được kiểm bằng một lần signInWithPassword. updateUser không
     đòi điều đó — có phiên là đổi được — nhưng nếu ai đó ngồi vào máy đang mở
     sẵn, chỉ mỗi bước này chặn họ chiếm tài khoản. */
  const onLogout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    window.location.replace("/login");
  };

  const changePw = async (oldPw, newPw, setMsg) => {
    if (newPw.trim().length < 8) { setMsg("Le nouveau mot de passe doit faire au moins 8 caractères."); return; }

    const { data: sess } = await supabase.auth.getUser();
    const emailOf = sess?.user?.email;
    if (!emailOf) { setMsg("Session expirée. Reconnectez-vous."); return; }

    const { error: badOld } = await supabase.auth.signInWithPassword({ email: emailOf, password: oldPw });
    if (badOld) { setMsg("Ancien mot de passe incorrect."); return; }

    const { error } = await supabase.auth.updateUser({ password: newPw.trim() });
    setMsg(error ? `Échec : ${error.message}` : "✅ Mot de passe modifié !");
  };

  const Card = ({ ex }) => {
    const subRaw = mine(ex.id);
    const redo = subRaw?.redo;
    const sub = redo ? null : subRaw;
    const late = isLate(ex);
    const t = sub && totalScore(sub, ex);
    return (
      <div className="mcf-card" style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={S.badge(ex.level)}>{ex.level}</span>
            <span style={S.chip(C.primarySoft, C.primary)}>{exSkills(ex).join(" · ")}</span>{" "}
            <strong style={{ fontSize: 16 }}>{ex.title}</strong>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 5 }}>
              {ex.questions.length} question(s){ex.audioUrl && " · 🎧"}{ex.timeLimit && ` · ⏱ ${ex.timeLimit} min`}
              {ex.deadline && <span style={{ color: late ? C.danger : C.warn, fontWeight: 700 }}> · ⏰ {late ? "en retard si rendu maintenant" : `avant le ${fmtDate(ex.deadline)}`}</span>}
            </div>
          </div>
          {sub ? (
            <span style={{ fontSize: 13, fontWeight: 700, color: t.pending ? C.warn : C.ok }}>
              {t.pending ? `⏳ ${t.score}/${t.max} (en attente de correction)` : `✓ ${t.score}/${t.max}`}{sub.late && " 🕐"}
            </span>
          ) : (
            <button style={S.btn(true)} onClick={() => setTaking(ex)}>Commencer</button>
          )}
        </div>
        {redo && (
          <div style={{ marginTop: 12, background: C.warnSoft, border: `2px solid ${C.warn}`, borderRadius: 16, padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>
            🔁 <strong>Le professeur te demande de refaire cet exercice.</strong>
            {subRaw.redoNote && <div style={{ marginTop: 4, fontWeight: 400 }}>💬 {subRaw.redoNote}</div>}
          </div>
        )}
        {sub?.comment && (
          <div style={{ marginTop: 12, background: C.warnSoft, border: `1px solid ${C.warn}44`, borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>
            💬 <strong>Professeur :</strong> {sub.comment}
          </div>
        )}
        {sub?.feedbackUrl && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            background: C.primarySoft, border: `1px solid ${C.primary}33`, borderRadius: 16, padding: "12px 16px" }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, letterSpacing: 0.5, textTransform: "uppercase" }}>Correction du professeur</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, wordBreak: "break-all" }}>{fileNameFromUrl(sub.feedbackUrl)}</div>
            </div>
            <a href={sub.feedbackUrl} target="_blank" rel="noopener noreferrer"
              style={{ ...S.btn(true), textDecoration: "none", fontSize: 13, padding: "9px 18px" }}>
              Voir le fichier ↗
            </a>
          </div>
        )}
        {sub?.graded && ex.questions.some((q) => q.type === "open" || q.type === "vf" || q.type === "tableau" || q.type === "ordre" || q.type === "fill" || q.type === "conj" || q.type === "qcm") && (
          <details style={{ marginTop: 10, fontSize: 13.5 }}>
            <summary style={{ cursor: "pointer", color: C.primary, fontWeight: 700 }}>📋 Voir ma copie corrigée</summary>
            <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
              {ex.questions.map((q, i) => {
                const a = sub.answers[q.id];
                if (q.type === "open") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                    <div style={{ fontSize: 12, color: C.soft, fontWeight: 700, marginBottom: 4 }}>MA RÉPONSE</div>
                    <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: a || "—" }} />
                    {q.model && (
                      <div style={{ marginTop: 10, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px" }}>
                        💡 <strong>Réponse suggérée :</strong>
                        <div style={{ marginTop: 4, fontStyle: "italic", lineHeight: 1.7 }}>{q.model}</div>
                      </div>
                    )}
                  </div>
                );
                if (q.type === "vf") {
                  const good = vfOk(q, a);
                  return (
                    <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                      Mon choix : <strong style={{ color: good ? C.ok : C.danger }}>{a?.choice != null ? VF_OPTS[a.choice] : "—"}</strong>
                      {!good && <span> · Bonne réponse : <strong>{VF_OPTS[q.answer]}</strong></span>}
                      {a?.just && <div style={{ fontStyle: "italic", marginTop: 4 }}>Ma justification : « {a.just} »</div>}
                      {q.answer !== 2 && q.justification && (
                        <div style={{ marginTop: 8, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "10px 14px" }}>
                          💡 <strong>Justification attendue :</strong> <em>{q.justification}</em>
                        </div>
                      )}
                    </div>
                  );
                }
                /* ── TRẮC NGHIỆM ──
                   Nhánh này trước đây KHÔNG tồn tại: bài đọc hiểu toàn trắc
                   nghiệm mở "copie corrigée" ra là một danh sách rỗng, đúng
                   loại bài mà việc chữa quan trọng nhất.

                   KHÔNG hiện "đáp án đúng là B": `answer_key` không cấp SELECT
                   cho học sinh (022), nên phía này không có con số đó và bịa
                   ra một cái là sai. Thay vào đó là NEO — nó chỉ ra chỗ chứa
                   câu trả lời trong bài, dạy được nhiều hơn một chữ cái, và
                   không lộ đáp án của câu chưa làm. */
                if (q.type === "qcm") {
                  const chon = typeof a === "number" ? a : (a?.choice ?? null);
                  return (
                    <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                      <div>Mon choix : <strong>{chon != null ? (q.options?.[chon] ?? "—") : "—"}</strong></div>
                      <NeoCauHoi exerciseId={ex.id} questionId={q.id}
                        vanBan={ex.readingText} chonSai={chon} />
                    </div>
                  );
                }
                if (q.type === "tableau") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{i + 1}. {q.prompt}</div>
                    <TableauCompare q={q} value={a || {}} readOnly correction />
                  </div>
                );
                if (q.type === "fill" || q.type === "conj") {
                  const good = fillOk(q, a);
                  return (
                    <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {q.prompt}</div>
                      <div>Ma réponse : <strong style={{ color: good ? C.ok : C.danger }}>{a || "—"}</strong></div>
                      <div style={{ marginTop: 6, background: C.okSoft, border: `1.5px solid ${C.ok}55`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5 }}>
                        💡 <strong style={{ color: C.ok }}>Réponse attendue :</strong> {String(fillAccepted(q)).split("|").join(" / ")}
                      </div>
                      {/* Lời giải thích chỉ hiện khi sai — đó là lúc nó có việc
                          để làm. Người trả lời đúng không cần đọc lại lý do. */}
                      <WrongExplanation show={!good} explanation={q.explanation || q.explication || ex?.explications} />
                      {/* Chỉ neo khi SAI: người trả lời đúng không cần ai chỉ
                          lại chỗ chứa đáp án. */}
                      {!good && <NeoCauHoi exerciseId={ex.id} questionId={q.id}
                        vanBan={ex.readingText} chonSai={null} />}
                    </div>
                  );
                }
                if (q.type === "ordre") return (
                  <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 14, padding: "12px 15px", border: `1px solid ${C.line}` }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>{i + 1}. {q.prompt}</div>
                    <OrdreBlocks q={q} value={a || []} readOnly correction />
                  </div>
                );
                return null;
              })}
            </div>
          </details>
        )}
        {sub && Object.values(sub.qComments || {}).some(Boolean) && (
          <details style={{ marginTop: 8, fontSize: 13 }}>
            <summary style={{ cursor: "pointer", color: C.primary, fontWeight: 600 }}>Voir les remarques question par question</summary>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {ex.questions.map((q, i) => sub.qComments?.[q.id] ? (
                <div key={q.id} style={{ background: "var(--mcf-surface2)", borderRadius: 8, padding: "8px 12px", border: `1px solid ${C.line}` }}>
                  <strong>Q{i + 1} :</strong> {sub.qComments[q.id]}
                </div>
              ) : null)}
            </div>
          </details>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Hàng tab ngang đã bỏ: nhãn của nó trùng khít với thanh bên, và mỗi
          tab đều đã có route riêng nên không mất lối vào nào. Nút làm mới vốn
          nằm trong prop `trailing` của cụm tab đó, nên được tách ra đây. */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button type="button" onClick={refresh}
          className="cursor-pointer rounded-md border-0 bg-transparent px-3 py-1.5 font-[inherit] text-sm font-medium text-soft transition-colors hover:bg-surface2 hover:text-ink">
          ↻ {t("actions.refresh")}
        </button>
      </div>

      {tab === "todo" && (
        todo.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>{t("empty.all_done")}</div>
          : <div style={{ display: "grid", gap: 14 }}>{todo.map((ex) => <Card key={ex.id} ex={ex} />)}</div>
      )}
      {tab === "done" && (
        doneList.length === 0
          ? <div className="mcf-card" style={{ ...S.card, textAlign: "center", padding: 36, color: C.soft }}>{t("empty.no_submission")}</div>
          : <div style={{ display: "grid", gap: 14 }}>{doneList.map((ex) => <Card key={ex.id} ex={ex} />)}</div>
      )}

      {tab === "progress" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>🗺️ Mon voyage vers Paris — {stamps} timbre(s) collecté(s)</div>
            <div style={{ fontSize: 12.5, color: C.soft, margin: "6px 0 14px" }}>Obtiens 80 % ou plus à un exercice pour gagner un timbre !</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {JOURNEY.map((m, i) => {
                const got = stamps >= m.need;
                return (
                  <React.Fragment key={m.need}>
                    {i > 0 && <div style={{ flex: 1, minWidth: 18, height: 3, borderRadius: 2, background: got ? C.ok : C.line }} />}
                    <div style={{ textAlign: "center", opacity: got ? 1 : 0.45 }}>
                      <div style={{ fontSize: 26, filter: got ? "none" : "grayscale(1)" }}>{m.icon}</div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: got ? C.ink : C.soft }}>{m.label}</div>
                      <div style={{ fontSize: 10, color: C.soft }}>{m.need} 🏵️</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>Mes notes au fil du temps</div>
            {myScores.length === 0 ? <p style={{ color: C.soft, fontSize: 14 }}>Rends ta première copie pour voir ta courbe !</p> : (
              <div style={{ width: "100%", height: 240, marginTop: 10 }}>
                <ResponsiveContainer>
                  <LineChart data={myScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v + " %"} labelFormatter={(l, p) => p?.[0]?.payload?.full || l} />
                    <Line type="monotone" dataKey="pct" name="Note (%)" stroke={C.primary} strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mcf-card" style={{ ...S.card }}>
            <div style={S.label}>Mes points forts par compétence</div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <RadarChart data={radar}>
                  <PolarGrid stroke={C.line} />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Moi" dataKey="moi" stroke={C.primary} fill={C.primary} fillOpacity={0.35} />
                  <Tooltip formatter={(v) => v + " %"} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "practice" && <PracticeHub role="eleve" name={name} />}
      {/* Trang Mon Compte thay cho hai khối rời trước đây. ProfileForm và
          PasswordForm cũ giờ nằm bên trong nó, dưới hai tab. */}
      {tab === "settings" && (
        <AccountPage
          name={name}
          role="eleve"
          email={authEmail}
          emailVerified={emailVerified}
          onLogout={onLogout}
          changePw={changePw}
        />
      )}
    </div>
  );
}

/* ProfileForm ĐÃ GỠ (migration 049).
 *
 * Nó là biểu mẫu hồ sơ CŨ, chỉ còn được export chứ không màn hình nào dựng —
 * trang « Mon Compte » (AccountPage.jsx) thay nó từ lâu. Gỡ chứ không chuyển
 * sang bảng, vì nó đọc/ghi blob `s:mcf-profiles` mà 052 thu quyền ghi của học
 * sinh: giữ lại thì nó thành một biểu mẫu bấm Lưu không báo lỗi và không lưu
 * được gì — `save()` bọc trong try/catch và trả `false` mà không ai đọc.
 *
 * Mã chết trông vô hại cho tới khi có người dựng lại nó. */

function PasswordForm({ changePw }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="mcf-card" style={{ ...S.card, maxWidth: 420 }}>
      <div style={S.label}>Changer mon mot de passe</div>
      <input style={{ ...S.input, margin: "10px 0" }} type="password" placeholder="Ancien mot de passe" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
      <input style={{ ...S.input, marginBottom: 12 }} type="password" placeholder="Nouveau mot de passe (min. 4)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
      <button style={S.btn(true)} onClick={() => changePw(oldPw, newPw, setMsg)}>Enregistrer</button>
      {msg && <p style={{ fontSize: 13, marginTop: 10, color: msg.startsWith("✅") ? C.ok : C.danger }}>{msg}</p>}
    </div>
  );
}

export { Student, PasswordForm };
export default Student;
