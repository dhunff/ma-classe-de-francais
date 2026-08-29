import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { docThongBao, danhDauDaDoc } from "../../shared/notifications.js";
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


/* ================= Notifications bell ================= */
function Bell({ name, exercises, submissions }) {
  const bellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState({});
  const [annonces, setAnnonces] = useState([]);
  useEffect(() => { load(`mcf-seen-${name}`, {}, false).then(setSeen); }, [name]);
  /* 📣 Thông báo của giáo viên — làm mới mỗi 60 giây.
   *
   * Đi qua `docThongBao` chứ không đọc thẳng blob: hàm đó tự chọn giữa bảng
   * `notifications` (migration 053) và khoá cũ `s:mcf-notifs`, nên chỗ này
   * không cần biết migration đã chạy hay chưa. Xem đầu shared/notifications.js.
   *
   * Bỏ lượt trả về nếu component đã gỡ giữa chừng — một cú điều hướng ngay sau
   * khi mở trang để lại một lời hứa đang bay, và setState sau khi gỡ thì React
   * cảnh báo ầm lên trong console. */
  useEffect(() => {
    let con = true;
    const fetchA = () => docThongBao(name).then((ds) => { if (con) setAnnonces(ds); });
    fetchA();
    const t = setInterval(fetchA, 60_000);
    return () => { con = false; clearInterval(t); };
  }, [name]);

  const notifs = useMemo(() => {
    const list = [];
    annonces.forEach((n) => {
      if (!seen["ann-" + n.id])
        list.push({ id: "ann-" + n.id, icon: "📣", text: n.message, ts: n.createdAt });
    });
    const now = Date.now();
    exercises.filter((ex) => assignedTo(ex, name)).forEach((ex) => {
      const sub = submissions.find((s) => s.exerciseId === ex.id && s.student === name);
      if (ex.deadline && !sub) {
        const dt = new Date(ex.deadline).getTime() - now;
        if (dt > 0 && dt < 24 * 3600 * 1000)
          list.push({ id: "due-" + ex.id, icon: "⏰", text: `« ${ex.title} » est à rendre avant ${fmtDate(ex.deadline)} !` });
      }
      if (sub?.graded && !sub.redo && !seen["graded-" + sub.id])
        list.push({ id: "graded-" + sub.id, icon: "✅", text: `Ta copie « ${ex.title} » a été corrigée.` });
      if (sub?.redo)
        list.push({ id: "redo-" + sub.id, icon: "🔁", text: `Le professeur te demande de refaire « ${ex.title} »${sub.redoNote ? " : " + sub.redoNote : ""}.` });
    });
    return list;
  }, [exercises, submissions, name, seen, annonces]);

  const openBell = async () => {
    setOpen(!open);
    if (!open && notifs.length) {
      const next = { ...seen };
      notifs.forEach((n) => { if (n.id.startsWith("graded-") || n.id.startsWith("ann-")) next[n.id] = true; });
      setSeen(next); await save(`mcf-seen-${name}`, next, false);

      /* Ghi "đã đọc" lên SERVER cho các thông báo đi qua bảng.
       *
       * Khoá `mcf-seen-<tên>` ở trên là bộ nhớ riêng của từng MÁY, nên đổi máy
       * là mọi thông báo cũ hiện lại như mới. Cột `is_read` sửa được điều đó,
       * và `danhDauDaDoc` tự trả `false` khi bảng chưa tồn tại — chưa chạy
       * migration 053 thì không có gì xảy ra, đúng hành vi cũ.
       *
       * Cắt tiền tố "ann-" để lấy lại id thật. Không dùng `replace("ann-","")`
       * vì nó cắt cả chuỗi đó ở GIỮA id nếu chẳng may trùng. */
      const idThat = notifs.filter((n) => n.id.startsWith("ann-")).map((n) => n.id.slice(4));
      if (idThat.length) await danhDauDaDoc(idThat);
    }
  };

  return (
    <div ref={bellRef} style={{ position: "relative" }}>
      <button onClick={openBell} style={{ background: "var(--mcf-surface)", border: `1.5px solid ${C.line}`, borderRadius: 999, width: 42, height: 42, cursor: "pointer", fontSize: 17, position: "relative", boxShadow: "0 4px 12px rgba(17,24,39,.06)" }}>
        🔔
        {notifs.length > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, background: C.danger, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {notifs.length}
          </span>
        )}
      </button>
      <FloatingLayer anchorRef={bellRef} open={open} onClose={() => setOpen(false)} width={300}>
        <div>
          {notifs.length === 0
            ? <div style={{ padding: 12, fontSize: 13, color: C.soft }}>Aucune notification. Tout est à jour ! 🎉</div>
            : notifs.map((n) => (
              <div key={n.id} style={{ padding: "9px 10px", fontSize: 13, borderBottom: `1px solid ${C.line}` }}>
                {n.icon} {n.text}
              </div>
            ))}
        </div>
      </FloatingLayer>
    </div>
  );
}

export default Bell;
