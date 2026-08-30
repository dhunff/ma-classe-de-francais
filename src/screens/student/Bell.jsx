import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { C, S, LEVEL_COLORS, LEVEL_PASTEL, QTYPES, VF_OPTS } from "../../shared/tokens.js";
import { load, save, del } from "../../shared/storage.js";
import { docThongBao, danhDauDaDoc } from "../../shared/notifications.js";
import { supabase } from "../../storageShim.js";
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
  /* Bắt đầu bằng `true`: lượt đọc đầu tiên chưa xong, và trong quãng đó danh
     sách rỗng KHÔNG có nghĩa là "không có thông báo nào". Hiện "Aucune
     notification" lúc ấy là nói một điều ta chưa biết. */
  const [dangTai, setDangTai] = useState(true);
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
    const fetchA = () => docThongBao(name).then((ds) => {
      if (!con) return;
      setAnnonces(ds);
      /* Chỉ tắt cờ tải SAU lượt đầu tiên. Những lượt làm mới 60 giây sau đó
         không được bật lại cờ này — nếu bật, cứ mỗi phút bảng thả xuống lại
         nhấp nháy về khung xương trong lúc người dùng đang đọc. */
      setDangTai(false);
    });
    fetchA();
    const t = setInterval(fetchA, 60_000);
    return () => { con = false; clearInterval(t); };
  }, [name]);

  /* ══ REALTIME: thông báo mới hiện ra mà không cần tải lại trang ══
   *
   * Supabase đẩy sự kiện qua WebSocket. Đăng ký một kênh, lọc ngay ở SERVER
   * bằng `filter` — lọc ở client thì mọi thông báo của mọi học sinh đều bay về
   * máy này rồi mới bị bỏ đi, tức là vẫn rò dữ liệu dù màn hình không hiện.
   *
   * Vì sao vẫn GIỮ vòng lặp 60 giây ở trên: WebSocket đứt là chuyện thường —
   * mất mạng, máy ngủ, tab nền bị treo. Realtime làm cho nhanh, vòng lặp làm
   * cho chắc. Bỏ vòng lặp thì một lần đứt kết nối là chuông im lặng vĩnh viễn
   * cho tới khi người dùng tự tải lại trang.
   *
   * `dangTai` KHÔNG bật lại ở đây: dòng mới thêm vào danh sách đã có, không
   * phải một lượt tải mới.
   *
   * Bảng `notifications` phải bật Realtime trong dashboard (Database →
   * Replication) thì kênh này mới nhận được gì. Chưa bật thì không có lỗi nào —
   * chỉ là không bao giờ có sự kiện, và vòng lặp 60 giây vẫn lo phần còn lại.
   * Đó là lý do nó được viết để hỏng THEO HƯỚNG chậm hơn, chứ không phải im. */
  useEffect(() => {
    let kenh = null;
    let con = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid || !con) return;

      kenh = supabase
        .channel("thong-bao-" + uid)
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications",
            filter: `user_id=eq.${uid}` },
          (payload) => {
            const n = payload.new;
            if (!n) return;
            setAnnonces((cu) => {
              /* Chống trùng: vòng lặp 60 giây và realtime có thể mang về cùng
                 một dòng. Không kiểm thì thông báo hiện hai lần. */
              if (cu.some((x) => x.id === n.id)) return cu;
              return [{
                id: n.id, message: n.message, daDoc: !!n.is_read,
                createdAt: new Date(n.created_at).getTime(),
              }, ...cu];
            });
          })
        .subscribe();
    })();

    /* Huỷ đăng ký khi rời trang. Thiếu dòng này thì mỗi lần vào ra để lại một
       kênh còn sống, và sau vài lượt điều hướng một thông báo sinh ra năm bản
       sao trong state. */
    return () => { con = false; if (kenh) supabase.removeChannel(kenh); };
  }, [name]);

  /* ══ `seen` KHÔNG còn quyết định có hiện hay không ══
   *
   * Bản trước lọc danh sách bằng `if (!seen[id])`, và `openBell` lại đặt
   * `seen[id] = true` cho mọi mục ngay khi mở. Hậu quả: bấm chuông → `seen`
   * đổi → `useMemo` này chạy lại → mọi mục bị lọc mất → bảng thả xuống hiện
   * "Aucune notification". Chuông báo 1, mở ra 0, và cả hai đều đúng theo mã.
   *
   * Gốc rễ: một biến gánh hai việc mâu thuẫn — vừa "có hiện không", vừa "có
   * tính vào huy hiệu không". Tách ra thì cả hai đều đơn giản:
   *
   *   `notifs`   MỌI mục hiện có, mỗi mục mang cờ `chuaDoc`
   *   `soChuaDoc` đếm những mục `chuaDoc` → con số trên huy hiệu
   *
   * Mở chuông đánh dấu đã đọc: huy hiệu về 0, danh sách VẪN nguyên. Đó cũng là
   * hành vi người dùng chờ đợi ở mọi ứng dụng khác. */
  const notifs = useMemo(() => {
    const list = [];
    annonces.forEach((n) => {
      list.push({
        id: "ann-" + n.id, icon: "📣", text: n.message, ts: n.createdAt,
        /* Hai nguồn "đã đọc", và phải xét CẢ HAI:
           · `n.daDoc` — cột `is_read` trên server, theo TÀI KHOẢN
           · `seen`    — khoá `mcf-seen-<tên>`, theo MÁY
           Server là nguồn đúng hơn (đổi máy vẫn nhớ), nhưng đường cũ
           `s:mcf-notifs` không có cột nào như thế nên vẫn cần `seen`. */
        chuaDoc: !n.daDoc && !seen["ann-" + n.id],
      });
    });
    const now = Date.now();
    exercises.filter((ex) => assignedTo(ex, name)).forEach((ex) => {
      const sub = submissions.find((s) => s.exerciseId === ex.id && s.student === name);
      /* Hạn nộp và "làm lại" LUÔN `chuaDoc`: chúng là việc còn phải làm, không
         phải tin đã đọc là xong. Đọc rồi mà bài vẫn chưa nộp thì nó vẫn phải
         nhắc — đánh dấu đã đọc ở đây là làm mất một lời nhắc còn hiệu lực. */
      if (ex.deadline && !sub) {
        const dt = new Date(ex.deadline).getTime() - now;
        if (dt > 0 && dt < 24 * 3600 * 1000)
          list.push({ id: "due-" + ex.id, icon: "⏰", chuaDoc: true,
            text: `« ${ex.title} » est à rendre avant ${fmtDate(ex.deadline)} !` });
      }
      if (sub?.graded && !sub.redo)
        list.push({ id: "graded-" + sub.id, icon: "✅",
          chuaDoc: !seen["graded-" + sub.id],
          text: `Ta copie « ${ex.title} » a été corrigée.` });
      if (sub?.redo)
        list.push({ id: "redo-" + sub.id, icon: "🔁", chuaDoc: true,
          text: `Le professeur te demande de refaire « ${ex.title} »${sub.redoNote ? " : " + sub.redoNote : ""}.` });
    });
    /* Mới nhất trước. `ts` chỉ có ở thông báo của giáo viên; những mục sinh từ
       bài tập không có mốc thời gian nên xếp sau, giữ nguyên thứ tự. */
    return list.sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0));
  }, [exercises, submissions, name, seen, annonces]);

  /* Con số trên huy hiệu — CHỈ đếm mục chưa đọc, không phải cả danh sách. */
  const soChuaDoc = useMemo(() => notifs.filter((n) => n.chuaDoc).length, [notifs]);

  const openBell = async () => {
    setOpen(!open);
    /* Đánh dấu đã đọc khi MỞ. Giờ việc này chỉ làm huy hiệu về 0 — danh sách
       vẫn hiện nguyên, chỉ mất phần tô sáng. Trước đây nó xoá luôn danh sách. */
    if (!open && soChuaDoc) {
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
        {/* Huy hiệu đếm mục CHƯA ĐỌC, không phải cả danh sách. Đếm cả danh sách
            thì đọc xong con số vẫn nằm đó mãi mãi. */}
        {soChuaDoc > 0 && (
          <span style={{ position: "absolute", top: -3, right: -3, background: C.danger, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 999, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {soChuaDoc}
          </span>
        )}
      </button>
      <FloatingLayer anchorRef={bellRef} open={open} onClose={() => setOpen(false)} width={300}>
        {/* BA nhánh, không phải hai.
            Nhánh `dangTai` là thứ bản trước thiếu: lượt đọc đầu chưa xong thì
            danh sách rỗng, và hiện "Aucune notification" lúc ấy là khẳng định
            một điều ta chưa biết. Khung xương nói đúng thứ đang xảy ra. */}
        {dangTai ? (
          <div className="space-y-2 p-3" aria-busy="true" aria-label="Đang tải thông báo">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-full bg-surface2" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 animate-pulse rounded bg-surface2" />
                  {/* Dòng thứ hai ngắn hơn — khối chữ thật không bao giờ vuông
                      vức, và khung xương vuông vức thì trông như lỗi bố cục. */}
                  <span className="block h-3 w-2/3 animate-pulse rounded bg-surface2" />
                </span>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="p-3 text-sm text-soft">Aucune notification. Tout est à jour ! 🎉</div>
        ) : (
          <ul className="m-0 list-none p-0">
            {notifs.map((n) => (
              <li key={n.id}
                  className={`flex items-start gap-2.5 border-0 border-b border-solid border-line px-3 py-2.5 text-sm
                              ${n.chuaDoc ? "bg-primary-soft/40" : ""}`}>
                <span aria-hidden className="shrink-0">{n.icon}</span>
                <span className="min-w-0 flex-1 text-ink">{n.text}</span>
                {/* Chấm xanh cho mục chưa đọc. Nền tô sáng một mình là không
                    đủ: người mù màu, và màn hình chói nắng, đều mất nó. */}
                {n.chuaDoc && (
                  <span aria-label="chưa đọc"
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </li>
            ))}
          </ul>
        )}
      </FloatingLayer>
    </div>
  );
}

export default Bell;
