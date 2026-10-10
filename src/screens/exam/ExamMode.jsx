import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Timer, ShieldCheck, AlertTriangle, Clock, Volume2, VolumeX, ArrowLeft, Trophy, Crown, Headphones, BookOpen, PenLine, Mic } from "lucide-react";
import NutTieng from "../../shared/NutTieng.jsx";
import { BangKetLuan, ThanhPhan, PhaoGiayLon } from "./KetQuaVisual.jsx";
import { supabase } from "../../storageShim.js";
import { loadExams, loadExam } from "../../shared/examStore.js";
import { gradeRemote } from "../../shared/gradeRemote.js";
import { EXAM_STRUCTURE, sectionScore, verdict, ghiPhan, gomTheoKyNang, NGUONG_PHAN, NGUONG_TONG, khongCham }
  from "./examPaper.js";
import GhiAmBaiNoi from "./GhiAmBaiNoi.jsx";
import { GhepCap, DienPhieu, AnhLuaChon } from "../student/dangMoi.jsx";
import { nhomTheoTrinhDo } from "../../shared/trinhDoDe.js";
import { HopBatDau, HopThoat, useGiuPhongThi } from "./LuotThi.jsx";
import { isQuestionAnswered } from "../../shared/questions.js";

/* Màn thi KHÔNG có ô căn cứ cho câu vf, nên chọn Đúng/Sai/? là đã làm.
   isQuestionAnswered chung đòi căn cứ, dùng thẳng sẽ báo thiếu mọi câu vf. */
const daLamCau = (q, answers) => (q.type === "vf" ? answers?.[q.id]?.choice != null : isQuestionAnswered(q, answers));
import { coPhienMayChu } from "../../shared/phienMayChu.js";
import { tr } from "../../shared/i18n.jsx";
import { LeonTheoTrang, Leon } from "../../shared/leon.jsx";
import { phat, amThanhBat, datAmThanh } from "../../shared/amThanh.js";

/* Mode Examen — thi thử có tính giờ.
 *
 * ══ NGUYÊN TẮC KHÔNG ĐƯỢC PHÁ ══
 *
 * **Không hiện đúng/sai trong lúc thi.** Toàn bộ giá trị của bài thi thử nằm ở
 * chỗ nó mô phỏng áp lực: bạn phải quyết định mà không biết mình đúng hay sai,
 * đúng như phòng thi thật. Hiện phản hồi ngay là biến nó thành bài luyện tập,
 * và khi đó con số cuối cùng không dự đoán được gì.
 *
 * Hệ quả trong mã: màn hình làm bài KHÔNG gọi bộ chấm, không import `fillOk`,
 * không biết đáp án. Nó chỉ thu câu trả lời. Việc chấm xảy ra đúng một lần,
 * sau khi nộp, ở Edge Function — và từ migration 022, client cũng không còn
 * cách nào biết đáp án kể cả muốn.
 *
 * ══ VÌ SAO ĐIỂM PHẢI QUY ĐỔI ══
 *
 * Bài trong thư viện có 7, 8, 15 câu tuỳ bài; DELF chấm mỗi phần trên 25. Phép
 * quy đổi nằm ở examPaper.js và có bộ kiểm riêng (`npm run check:exam`).
 */

const hai = (n) => String(n).padStart(2, "0");
const dongHo = (giay) => `${hai(Math.floor(giay / 60))}:${hai(Math.max(0, giay % 60))}`;

/* ─────────────────────────── Màn chờ ─────────────────────────── */

function ManCho({ dsDe, chon, paper, onStart, dangTai, lamPhanNoi, setLamPhanNoi, phienThuc }) {
  const level = paper?.level ?? "B1";
  const cauTruc = EXAM_STRUCTURE[level] ?? [];
  /* Đề có phần nói không — hỏi DỮ LIỆU của đề, không hỏi cấu trúc chuẩn.
     EXAM_STRUCTURE khai PO cho mọi trình độ, nhưng đề cụ thể chỉ có nó khi
     giáo viên đã ghép một bài nói vào. */
  const coPhanNoi = (paper?.sections ?? []).some((x) => x.code === "PO");
  const phutPhanNoi = cauTruc.find((x) => x.code === "PO")?.minutes ?? 0;
  /* Tổng phút phải theo LỰA CHỌN, không theo cấu trúc: bỏ phần nói mà vẫn hứa
     "tôi có 130 phút liên tục" là bắt người ta cam kết một điều sai. */
  const tongPhut = cauTruc.reduce(
    (n, p) => n + (p.code === "PO" && (!coPhanNoi || !lamPhanNoi) ? 0 : p.minutes), 0);
  const [sanSang, setSanSang] = useState(false);
  /* Lượt thi hôm nay (120) + hộp cảnh báo trước khi vào thi. */
  const [luot, setLuot] = useState(null);
  const [moHop, setMoHop] = useState(false);
  const [dangMo, setDangMo] = useState(false);
  const [loiMo, setLoiMo] = useState("");
  useEffect(() => {
    supabase.rpc("luot_thi_hom_nay").then(({ data }) => { if (data) setLuot(data); });
  }, [moHop]);
  const dongY = async () => {
    setDangMo(true); setLoiMo("");
    const loi = await onStart();
    setDangMo(false);
    if (loi) setLoiMo(loi);
  };
  const nhom = useMemo(() => nhomTheoTrinhDo(dsDe), [dsDe]);
  const [tabChon, setTab] = useState(null);
  /* Mặc định: trình độ của đề đang chọn, không thì trình độ đầu tiên có đề. */
  const tab = tabChon ?? paper?.level ?? nhom.find((g) => g.de.length)?.level ?? "A1";
  const deTab = nhom.find((g) => g.level === tab)?.de ?? [];

  /* Chưa có đề nào thì nói rõ NGUYÊN NHÂN, đừng hiện một màn hình trống.
     Trạng thái này có thật và hay gặp lúc mới dựng lớp: giáo viên đã soạn bài
     nhưng chưa ghép thành đề, hoặc đã ghép mà chưa bấm phát hành. */
  if (!dangTai && dsDe.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="m-0 text-2xl font-extrabold text-ink">{tr("Thi thử DELF", "Examen blanc DELF", "DELF mock exam")}</h1>
        <div className="mt-6 rounded-3xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">{tr("Chưa có đề thi nào", "Aucun sujet pour l'instant", "No exams yet")}</p>
          <p className="m-0 mt-2 text-sm text-soft">
            {tr("Đề thi thử do giáo viên soạn và phát hành. Khi có đề, nó sẽ hiện ở đây.", "Les sujets sont préparés et publiés par l'enseignant. Ils apparaîtront ici.", "Mock exams are prepared and published by the teacher. They will show up here.")}
          </p>
        </div>
        <Link to="/etudiant/resultats" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary no-underline">
          <Trophy size={15} /> {tr("Xem kết quả các lần thi trước", "Voir mes résultats précédents", "See previous results")}
        </Link>
      </div>
    );
  }

  /* Đổi tab trình độ thì tự chọn đề đầu tiên của tab (09/10). Trước đây bảng
     cấu trúc vẫn hiện đề của tab cũ, nên tab mới trông như « chưa có bài ». */
  const doiTab = (lv) => {
    if (lv !== tab) phat("tiep");
    setTab(lv);
    const dau = nhom.find((g) => g.level === lv)?.de?.[0];
    if (dau && paper?.id !== dau.id) chon(dau.id);
  };
  const deDangChon = deTab.some((e) => e.id === paper?.id) ? paper : null;
  const ICON_PHAN = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };
  const MAU_PHAN = { CO: "from-sky-500 to-blue-600", CE: "from-emerald-500 to-teal-600", PE: "from-amber-500 to-orange-600", PO: "from-fuchsia-500 to-purple-600" };
  const sanSangVao = sanSang && !dangTai && !!deDangChon?.sections?.length && phienThuc === true;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Lối ra. Màn hình thi nằm ngoài vỏ app nên KHÔNG có thanh bên — cố ý,
          phòng thi không có menu. Nhưng "không có menu" khác "không có lối ra". */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/etudiant/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft no-underline hover:text-ink">
          <ArrowLeft size={15} /> {tr("Về trang chủ", "Accueil", "Home")}
        </Link>
        <div className="flex items-center gap-2">
          <NutTieng />
          <Link to="/etudiant/resultats"
            className="inline-flex items-center gap-2 rounded-full border border-solid border-line bg-surface px-4 py-2 text-sm font-bold text-ink no-underline transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary">
            <Trophy size={15} /> {tr("Kết quả thi của tôi", "Mes résultats", "My results")}
          </Link>
        </div>
      </div>

      {/* ── Khung đầu trang (09/10) ── */}
      <header className="mcf-cau-vao relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-primary to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-20 left-1/4 h-44 w-44 rounded-full bg-sky-300/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <Leon cam="co-len" size={116} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><ShieldCheck size={14} /> {tr("Phòng thi mô phỏng", "Salle d'examen simulée", "Simulated exam room")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{tr("Thi thử DELF", "Examen blanc DELF", "DELF mock exam")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">
              {tr("Một lần duy nhất, có tính giờ, không xem đáp án giữa chừng.", "Une seule fois, chronométré, sans voir les réponses en cours.", "One sitting, timed, no answers shown along the way.")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {luot?.vip ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-extrabold text-amber-950"><Crown size={12} /> {tr("VIP: không giới hạn lượt", "VIP : essais illimités", "VIP: unlimited attempts")}</span>
              ) : luot && !luot.khong_gioi_han ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
                  <Timer size={12} /> {tr("Hôm nay còn", "Reste aujourd'hui", "Left today")} {Math.max(0, luot.gioi_han - luot.da_dung)}/{luot.gioi_han} {tr("lượt", "essai(s)", "attempt(s)")}
                </span>
              ) : null}
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{tr("Allez, courage !", "Allez, courage !", "Allez, courage!")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Trình độ ── */}
      <div role="tablist" aria-label={tr("Trình độ", "Niveau", "Level")} className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {nhom.map((g, k) => {
          const dang = g.level === tab;
          return (
            <button key={g.level} type="button" role="tab" aria-selected={dang} onClick={() => doiTab(g.level)}
              className={`mcf-cau-vao flex shrink-0 cursor-pointer flex-col items-center rounded-2xl border-2 border-solid px-5 py-2.5 font-sans transition-all duration-200 ${
                dang ? "-translate-y-0.5 border-primary bg-primary text-white shadow-[0_10px_24px_rgba(37,99,235,0.3)]" : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-primary/50"}`}
              style={{ animationDelay: `${80 + k * 50}ms` }}>
              <span className="text-lg font-extrabold leading-none">{g.level}</span>
              <span className={`mt-1 text-[11px] font-bold ${dang ? "text-white/80" : "text-soft"}`}>{g.de.length} {tr("đề", "sujet(s)", "exam(s)")}</span>
            </button>
          );
        })}
      </div>

      {/* ── Danh sách đề ── */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {deTab.length === 0 && (
          <div className="flex items-center gap-3 rounded-2xl bg-surface2 px-5 py-4 sm:col-span-2">
            <Leon cam="buon-ngu" size={56} />
            <p className="m-0 text-sm text-soft">{tr("Chưa có đề", "Aucun sujet", "No exam at level")} {tab} {tr("nào được phát hành.", "publié pour ce niveau.", "published yet.")}</p>
          </div>
        )}
        {deTab.map((e, k) => {
          const dang = paper?.id === e.id;
          return (
            <button key={e.id} type="button" onClick={() => { phat("bam"); chon(e.id); }} aria-pressed={dang}
              className={`mcf-cau-vao relative cursor-pointer rounded-2xl border-2 border-solid p-4 text-left font-sans transition-all duration-200 ${
                dang ? "-translate-y-0.5 border-primary bg-primary-soft shadow-[0_12px_28px_rgba(37,99,235,0.18)]" : "border-line bg-surface hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"}`}
              style={{ animationDelay: `${120 + k * 60}ms` }}>
              {dang && <span className="mcf-nay absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-white"><ShieldCheck size={14} /></span>}
              <span className="block pr-8 text-base font-extrabold text-ink">{e.title}</span>
              <span className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
                {/* Đếm KỸ NĂNG, không đếm dòng — một đề 6 bài vẫn là 3 phần. */}
                <span className="rounded-full bg-surface2 px-2 py-0.5 text-soft">{new Set(e.sections.map((x) => x.code)).size} {tr("phần", "parties", "parts")}</span>
                <span className="rounded-full bg-surface2 px-2 py-0.5 text-soft">{e.sections.length} {tr("bài", "exercices", "exercises")}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2 py-0.5 text-soft"><Clock size={11} />{e.duration_min ?? 0}′</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cấu trúc đề đang chọn ── */}
      {deDangChon && (
        <div className="mt-6">
          <p className="m-0 mb-3 text-xs font-bold uppercase tracking-[0.14em] text-soft">{tr("Cấu trúc đề", "Structure du sujet", "Exam structure")} · {deDangChon.title}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cauTruc.map((p, k) => {
              const co = (deDangChon.sections ?? []).filter((x) => x.code === p.code);
              const Icon = ICON_PHAN[p.code] ?? BookOpen;
              const bo = p.code === "PO" && (!co.length || !lamPhanNoi);
              return (
                <div key={p.code} className={`mcf-cau-vao flex items-start gap-3 rounded-2xl border border-solid border-line bg-surface p-4 ${bo ? "opacity-60" : ""}`}
                  style={{ animationDelay: `${160 + k * 70}ms` }}>
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${MAU_PHAN[p.code] ?? "from-slate-500 to-slate-600"} text-white shadow-md`}>
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 flex items-baseline gap-2"><span className="text-base font-extrabold text-ink">{p.code}</span><span className="truncate text-xs text-soft">{p.label}</span></p>
                    <p className="m-0 mt-1 flex flex-wrap gap-x-3 text-xs font-bold text-ink">
                      <span className="inline-flex items-center gap-1"><Clock size={12} className="text-soft" />{p.minutes}′</span>
                      <span>{p.points ? `/${p.points}` : tr("không chấm", "non noté", "not scored")}</span>
                    </p>
                    <p className="m-0 mt-1 truncate text-xs text-soft">
                      {co.length === 0 ? <span className="font-bold text-danger">{tr("chưa có bài", "pas d'exercice", "no exercise")}</span>
                        : <>{co.length > 1 && <strong className="text-ink">{co.length} {tr("bài · ", "exercices · ", "exercises · ")}</strong>}{co.map((x) => x.exercise?.title ?? tr("(không mở được)", "(inaccessible)", "(unavailable)")).join(" · ")}</>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Đề KHÔNG có phần nói, và phải nói ra: nó là 25/100 của kỳ thi thật,
          im lặng ở đây là để học sinh tưởng điểm thi thử dự đoán được điểm
          thật.

          Câu này từng hiện VÔ ĐIỀU KIỆN. Đúng vào lúc viết ra, vì hồi đó chưa
          đề nào có PO — nhưng nó thành lời nói dối ngay khi có đề đầu tiên
          kèm phần nói, và màn hình khẳng định điều ngược hẳn với bảng ngay
          phía trên nó. */}
      {!coPhanNoi && (
        <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-surface2 p-3 text-xs text-soft">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {tr("Đề này", "Ce sujet", "This exam")} <strong className="text-ink">{tr("không có phần thi nói (PO)", "n'a pas de production orale (PO)", "has no speaking part (PO)")}</strong>{tr(", vốn chiếm 25/100 điểm kỳ thi thật. Kết quả dưới đây chỉ phản ánh ba phần còn lại.", ", qui vaut 25/100 à l'examen réel. Le résultat ne reflète que les trois autres parties.", ", worth 25/100 in the real exam. The result only reflects the other three parts.")}
          </span>
        </p>
      )}

      {paper?.missing?.length > 0 && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs text-ink">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
          {/* `missing` ở đây KHÔNG phải "giáo viên quên chọn bài" — đề đã lưu
              thì phần nào cũng có exercise_id. Nó nghĩa là bài được trỏ tới
              hiện KHÔNG ĐỌC ĐƯỢC: bài trả phí mà em chưa mua (RLS 019 giấu
              câu hỏi), hoặc bài vừa bị xoá. Nói đúng nguyên nhân, vì hai
              trường hợp đó cần hai hành động khác nhau. */}
          <span>
            {tr("Không mở được phần", "Impossible d'ouvrir la partie", "Couldn't open part")} <strong>{paper.missing.map((m) => m.code).join(", ")}</strong> {tr("của đề này — bài tương ứng có thể là bài trả phí bạn chưa có quyền, hoặc đã bị gỡ. Báo giáo viên; điểm phần đó sẽ không tính được.", "de ce sujet : l'exercice est peut-être payant ou a été retiré. Prévenez l'enseignant ; cette partie ne pourra pas être notée.", "of this exam: the exercise may be paid or removed. Tell your teacher; this part can't be scored.")}
          </span>
        </p>
      )}

      {/* Bỏ chọn phần nói.
          Chỉ hiện khi đề THẬT SỰ có phần đó — một ô tích cho thứ không tồn tại
          làm người dùng tưởng mình vừa tắt mất cái gì.

          Mặc định BẬT: đề có phần nói thì mặc định làm đủ. Người muốn bỏ tự
          bấm, và khi đó họ biết chính xác mình đang bỏ gì. */}
      {coPhanNoi && (
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-surface2 p-4 text-sm text-ink">
          <input type="checkbox" checked={lamPhanNoi}
            onChange={(e) => setLamPhanNoi(e.target.checked)} className="mt-1" />
          <span>
            <strong>{tr("Làm cả phần thi nói (PO)", "Faire aussi la production orale (PO)", "Also do the speaking part (PO)")}</strong> {tr("— thêm", "— en plus", "— adds")} {phutPhanNoi} {tr("phút.", "minutes.", "minutes.")}
            <span className="mt-1 block text-xs text-soft">
              {tr("Phần này không được chấm điểm: bạn ghi âm để tự nghe lại. Bỏ chọn thì buổi thi chỉ còn ba phần, và tổng điểm không đổi.", "Cette partie n'est pas notée : vous vous enregistrez pour vous réécouter. Sans elle, l'examen a trois parties et le total ne change pas.", "This part isn't scored: you record yourself to listen back. Without it the exam has three parts and the total doesn't change.")}
            </span>
          </span>
        </label>
      )}

      {/* ── KHÔNG CÓ PHIÊN MÁY CHỦ THÌ KHÔNG CHO VÀO ──
          Xem phienMayChu.js. Ngắn gọn: app có đường đăng nhập cũ chỉ lưu tên
          trong trình duyệt, đủ để đi qua RequireRole nhưng KHÔNG có token nào.
          Người đó thi đủ 115 phút và không một dòng nào được ghi.

          Chặn ở CỬA, không báo lỗi ở cuối. Mời ai đó bỏ ra gần hai tiếng rồi
          mới nói "không lưu được gì" là hỏng ở chỗ tệ nhất. */}
      {phienThuc === false && (
        <div className="mt-6 rounded-2xl bg-danger-soft p-4">
          <p className="m-0 flex items-start gap-2 text-sm font-bold text-ink">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" />
            {tr("Phiên đăng nhập không còn hiệu lực với máy chủ.", "Votre session n'est plus valide sur le serveur.", "Your session is no longer valid on the server.")}
          </p>
          <p className="m-0 mt-2 text-xs leading-relaxed text-ink">
            {tr("Trình duyệt vẫn nhớ tên bạn, nhưng máy chủ thì không — nên bài làm và bản ghi âm sẽ KHÔNG được lưu, dù màn hình vẫn hiện điểm. Đăng nhập lại rồi quay lại đây; đề vẫn còn nguyên.", "Le navigateur se souvient de vous, mais pas le serveur : vos réponses et enregistrements NE seront PAS sauvegardés. Reconnectez-vous puis revenez ; le sujet est toujours là.", "Your browser remembers you but the server doesn't, so answers and recordings will NOT be saved. Sign in again and come back; the exam is still here.")}
          </p>
          <a href="/login"
            className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-white no-underline">
            {tr("Đăng nhập lại", "Se reconnecter", "Sign in again")}
          </a>
        </div>
      )}

      <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-solid p-4 text-sm text-ink transition-all ${sanSang ? "border-ok bg-ok-soft" : "border-line bg-surface hover:border-primary/40"}`}>
        <input type="checkbox" checked={sanSang} onChange={(e) => { phat(e.target.checked ? "dung" : "bam"); setSanSang(e.target.checked); }}
          className="mt-1 h-4 w-4 accent-[rgb(var(--mcf-primary-rgb))]" />
        <span>
          {tr("Tôi có", "J'ai", "I have")} <strong>{tongPhut} {tr("phút liên tục", "minutes sans interruption", "uninterrupted minutes")}</strong> {tr("và sẽ không rời khỏi bài thi. Đồng hồ chạy liên tục kể cả khi đóng tab.", "et je ne quitterai pas l'examen. Le chronomètre continue même si l'onglet est fermé.", "and will not leave the exam. The timer keeps running even if the tab is closed.")}
        </span>
      </label>

      <button type="button"
        disabled={!sanSangVao}
        onClick={() => { phat("bam"); setLoiMo(""); setMoHop(true); }}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-6 py-4 font-sans text-base font-extrabold uppercase tracking-wide text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)] transition-all enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 enabled:active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10 ${sanSangVao ? "mcf-nay" : ""}`}>
        {/* Nút mờ đi mà không nói vì sao là một cánh cửa khoá không biển
            báo. Ba lý do khoá, ba câu khác nhau. */}
        <Timer size={16} /> {dangTai ? tr("Đang tải đề…", "Chargement du sujet…", "Loading exam…")
          : phienThuc === null ? tr("Đang kiểm phiên đăng nhập…", "Vérification de la session…", "Checking your session…")
          : phienThuc === false ? tr("Cần đăng nhập lại", "Reconnexion nécessaire", "Sign-in required")
          : tr("Bắt đầu thi", "Commencer l'examen", "Start the exam")}
      </button>
      {moHop && (
        <HopBatDau tongPhut={tongPhut} luot={luot} dangMo={dangMo} loi={loiMo}
          onHuy={() => setMoHop(false)} onDongY={dongY} />
      )}
    </div>
  );
}

/* ───────────────────── Audio giới hạn 2 lượt ───────────────────── */

/* Bộ đếm nằm ở MÁY CHỦ (`attempts.audio_plays`), không ở đây.
 *
 * Giữ trong state React thì học sinh chỉ cần F5 là nghe lại từ đầu — và đó
 * chính là thứ họ sẽ thử. Migration 024 còn bịt thêm hai đường vòng nữa: trình
 * duyệt không còn quyền UPDATE thẳng vào `attempts`, và `exam_start` DÙNG LẠI
 * lần làm chưa kết thúc nên tải lại trang cũng không đẻ ra bộ đếm mới.
 *
 * Ở đây chỉ còn một việc: hỏi máy chủ trước khi phát, và nếu bị từ chối thì
 * NÓI RÕ VÌ SAO. Nút chết lặng không giải thích là thứ khiến người dùng tưởng
 * trang hỏng. */
/* `luot`: 2 như kỳ thi (024), hoặc 1 với bài « nghe kiểu thi » (119) vì file
   đã chứa sẵn cả hai lượt nghe và khoảng nghỉ. Máy chủ quyết định thật; số ở
   đây chỉ để hiện chữ cho khớp. */
function AudioGioiHan({ src, attemptId, questionId, luot = 2 }) {
  const [conLai, setConLai] = useState(null);   // null = chưa hỏi lần nào
  const [dangXin, setDangXin] = useState(false);
  const [loi, setLoi] = useState("");
  const ref = useRef(null);

  const het = conLai !== null && conLai <= 0;
  const chuaSanSang = !attemptId;

  /* Đọc bộ đếm THẬT khi vào, đừng mặc định "còn 2 lượt".
   *
   * Sau khi tải lại trang, `exam_start` trả về đúng lần làm cũ, nên máy chủ vẫn
   * nhớ đã nghe mấy lượt. Nhưng giao diện thì mới tinh — hiện "2 lượt" rồi bấm
   * vào bị từ chối là kiểu sai lệch khiến người dùng nghĩ hệ thống hỏng, chứ
   * không nghĩ mình đã hết lượt. */
  useEffect(() => {
    if (!attemptId) return;
    let huy = false;
    supabase.from("attempts").select("audio_plays").eq("id", attemptId).maybeSingle()
      .then(({ data }) => {
        if (huy || !data) return;
        const daNghe = Number(data.audio_plays?.[questionId] ?? 0);
        if (daNghe > 0) setConLai(Math.max(0, luot - daNghe));
      });
    return () => { huy = true; };
  }, [attemptId, questionId, luot]);

  const phat = async () => {
    if (het || dangXin || chuaSanSang) return;
    setDangXin(true); setLoi("");
    try {
      const { data, error } = await supabase.rpc("exam_play_audio", {
        p_attempt: attemptId, p_question: questionId,
      });
      if (error) throw error;
      if (data?.allowed) {
        setConLai(data.remaining ?? 0);
        ref.current?.play();
      } else {
        setConLai(0);
        setLoi(data?.reason === "limit"
          ? (luot === 1 ? tr("Bạn đã phát bài nghe này rồi.", "Vous avez déjà écouté ce document.", "You've already played this audio.") : tr("Bạn đã dùng hết 2 lượt nghe cho phần này.", "Vous avez utilisé vos 2 écoutes.", "You've used both plays."))
          : tr("Không ghi nhận được lượt nghe.", "Écoute non enregistrée.", "Play wasn't recorded."));
      }
    } catch (e) {
      /* Không đếm được thì KHÔNG cho phát. Hướng an toàn ở đây là chặn: cho
         phát khi mất kết nối là mở đúng đường vòng mà cả migration 024 sinh ra
         để bịt — ngắt mạng một giây là nghe không giới hạn. */
      setLoi(tr("Không kết nối được máy chủ, chưa phát được. Thử lại sau giây lát.", "Serveur injoignable, lecture impossible. Réessayez dans un instant.", "Can't reach the server, can't play. Try again shortly."));
      console.warn("[exam] exam_play_audio hỏng:", e?.message ?? e);
    } finally {
      setDangXin(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-line bg-surface p-4">
      {/* KHÔNG dùng `controls` mặc định: nó cho tua lại và phát lại tuỳ ý, tức
          là bỏ qua bộ đếm hoàn toàn. Chỉ một nút, mỗi lần bấm là một lượt. */}
      <audio ref={ref} src={src} onEnded={() => {}} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={phat} disabled={het || dangXin || chuaSanSang}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          <Volume2 size={15} /> {chuaSanSang ? tr("Đang mở bài thi…", "Ouverture de l'examen…", "Opening the exam…") : dangXin ? "…" : het ? tr("Hết lượt nghe", "Plus d'écoute", "No plays left") : "Phát"}
        </button>
        <span className="text-xs text-soft">
          {luot === 1
            ? (conLai === 0 ? tr("Đã phát", "Écouté", "Played") : tr("Phát một lần duy nhất", "Une seule lecture", "Plays once only"))
            : conLai === null ? tr("2 lượt nghe", "2 écoutes", "2 plays") : tr(`Còn ${conLai} lượt`, `${conLai} écoute(s) restante(s)`, `${conLai} play(s) left`)}
        </span>
      </div>
      {luot === 1 && (
        <p className="m-0 mt-2 text-xs leading-relaxed text-soft">
          {tr("Như phòng thi thật: file gồm thời gian đọc câu hỏi, lượt nghe 1, khoảng nghỉ, lượt nghe 2 và thời gian hoàn thành câu trả lời. Bấm phát một lần rồi để chạy hết, không tạm dừng được.", "Comme à l'examen : l'enregistrement contient le temps de lecture des questions, la 1re écoute, une pause, la 2e écoute et le temps pour compléter. Lancez-le une fois et laissez-le jusqu'au bout, sans pause.", "Like the real exam: the recording includes question-reading time, 1st listening, a pause, 2nd listening and time to finish. Play it once and let it run, no pausing.")}
        </p>
      )}
      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
    </div>
  );
}

/* ─────────────────────── Một phần thi ─────────────────────── */

/* Xuất tên để `preview.html` dựng được ĐÚNG component này với dữ liệu thật.
   Màn thi nằm sau đăng nhập và sau một lượt thi đang mở, nên không có đường nào
   khác để nhìn thấy nó — mà đúng ở đây thì mới có ảnh đề bài và consigne. */
function NutTiengThi() {
  const [bat, setBat] = useState(amThanhBat);
  return (
    <button type="button" onClick={() => { const m = !bat; datAmThanh(m); setBat(m); }}
      aria-label={bat ? tr("Tắt âm thanh", "Couper le son", "Mute") : tr("Bật âm thanh", "Activer le son", "Unmute")}
      className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink">
      {bat ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
}

export function PhanThi({ section, attemptId, answers, setAnswers, onDone, onBlur, onDoiBai, examId, onThoat }) {
  const [conLai, setConLai] = useState(section.minutes * 60);
  const doneRef = useRef(false);

  /* ══ NHIỀU BÀI TRONG MỘT PHẦN ══
   *
   * Từ migration 044, một kỹ năng chứa được nhiều bài. Nhưng phần thi vẫn là
   * MỘT khối có MỘT đồng hồ — đúng như DELF: CO là 25 phút cho cả ba bài, không
   * phải 25 phút mỗi bài.
   *
   * Nên `baiIdx` chỉ đổi thứ ĐANG HIỆN, không chạm vào đồng hồ và không nộp gì.
   * Câu trả lời nằm ở `answers` của cả buổi thi (state ở component cha), khoá
   * theo `question.id` — nên chuyển qua lại giữa các bài không mất gì, kể cả
   * khi bài kia đã bị gỡ khỏi DOM.
   *
   * Chỉ cho đi lại trong CÙNG một kỹ năng. Nhảy giữa CO và CE thì đồng hồ từng
   * phần mất nghĩa, và bài thi thử không còn dựng lại được kỳ thi thật. */
  const [baiIdx, setBaiIdx] = useState(0);
  const dsBai = section.exercises ?? (section.exercise ? [section.exercise] : []);
  const ex = dsBai[Math.min(baiIdx, dsBai.length - 1)];
  /* Câu chưa làm theo từng bài (08/10, theo chủ dự án): hiện trên thanh chuyển
     bài và cảnh báo trước khi nộp phần. Phần nói (PO) không có câu để đếm. */
  const thieuTheoBai = dsBai.map((b) => (b.questions ?? [])
    .map((q, i) => (daLamCau(q, answers) ? null : i + 1)).filter(Boolean));
  const tongThieu = section.code === "PO" ? 0 : thieuTheoBai.reduce((n, a) => n + a.length, 0);
  const [hoiNop, setHoiNop] = useState(false);
  const nopNgay = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    phat("nop");
    setHoiNop(false);
    setDangNop(true);
    onDone(false);
  };

  /* Đổi bài thì báo lên cha để nó mở `attempt` cho bài mới — bộ đếm lượt nghe
     audio gắn vào từng bài, không gắn vào cả phần. */
  useEffect(() => { onDoiBai?.(ex?.id); }, [ex?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Âm thanh (09/10): vào phần thi, đổi bài, còn 5 phút, còn 1 phút, hết giờ.
     Chỉ vài tiếng ngắn, nhỏ: phòng thi thật cũng chỉ có lời nhắc giờ. */
  const daBao = useRef({});
  useEffect(() => { phat("tiep"); daBao.current = {}; }, [section.code]);
  const lanDoiBai = useRef(0);
  useEffect(() => { if (lanDoiBai.current++) phat("bam"); }, [baiIdx]);
  useEffect(() => {
    const b = daBao.current;
    if (section.minutes * 60 > 300 && conLai <= 300 && conLai > 60 && !b.n5) { b.n5 = 1; phat("canhBao"); }
    if (conLai <= 60 && conLai > 0 && !b.n1) { b.n1 = 1; phat("sapHet"); }
    if (conLai <= 0 && !b.het) { b.het = 1; phat("hetGio"); }
  }, [conLai, section.minutes]);
  /* Chỉ để đổi CHỮ trên nút. Việc chặn do `doneRef` lo: ref đổi ngay trong cùng
     một nhịp, còn state thì phải đợi render kế — mà hai cú bấm liên tiếp lọt
     vừa đúng vào khe đó. */
  const [dangNop, setDangNop] = useState(false);

  /* Đồng hồ neo vào MỐC THỜI GIAN THẬT, không cộng dồn từng giây.
     setInterval bị trình duyệt giảm nhịp ở tab nền, nên đếm ngược bằng cách
     trừ dần sẽ chạy chậm lại — học sinh chuyển tab là được thêm giờ. */
  useEffect(() => {
    const het = Date.now() + section.minutes * 60 * 1000;
    const id = setInterval(() => {
      const s = Math.ceil((het - Date.now()) / 1000);
      setConLai(s);
      if (s <= 0 && !doneRef.current) { doneRef.current = true; clearInterval(id); onDone(true); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.code]);

  /* Rời tab: ghi nhận, KHÔNG chặn. Đây là tự học, không phải phòng thi có
     giám thị — chặn thì chỉ tạo cảm giác bị canh chừng mà không ngăn được gì. */
  useEffect(() => {
    const f = () => { if (document.hidden) onBlur(); };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gap = conLai <= 60 ? "text-danger" : conLai <= 300 ? "text-warn" : "text-ink";

  const dat = (qid, v) => setAnswers((p) => ({ ...p, [qid]: v }));

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex items-center justify-between gap-4 bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-primary">{section.code}</div>
          <div className="truncate text-sm font-bold text-ink">{section.label}</div>
          {dsBai.length > 1 && (
            <div className="mt-0.5 text-xs text-soft">{dsBai.length} {tr("bài · dùng chung", "exercices · durée commune", "exercises · shared")} {section.minutes} {tr("phút", "min", "min")}</div>
          )}
        </div>
        {onThoat && (
          <button type="button" onClick={onThoat}
            className="ml-auto h-9 shrink-0 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 font-sans text-xs font-bold text-soft hover:text-danger">
            Thoát
          </button>
        )}
        <NutTiengThi />
        {/* Không nhấp nháy: gây hoảng, không giúp gì thêm. */}
        <div className={`flex shrink-0 items-center gap-2 rounded-full bg-surface2 px-4 py-2 font-bold tabular-nums ${gap}`}>
          <Clock size={15} /> {dongHo(Math.max(0, conLai))}
        </div>
      </div>

      {/* ── Thanh chuyển bài (làm lại 08/10) ──
         Mỗi bài một ô: số thứ tự, tên ngắn, « đã làm x/y câu » và thanh tiến độ.
         Chỉ đi lại TRONG phần này; câu trả lời khoá theo question.id nên chuyển
         qua lại không mất gì. */}
      {dsBai.length > 1 && (
        <nav aria-label={tr("Bài trong phần thi", "Exercices de la partie", "Exercises in this part")} className="mb-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(dsBai.length, 4)}, minmax(0, 1fr))` }}>
          {dsBai.map((b, j) => {
            const tong = (b.questions ?? []).length;
            const lam = tong - thieuTheoBai[j].length;
            const dang = j === baiIdx;
            const du = tong > 0 && lam === tong;
            return (
              <button key={b.id} type="button" onClick={() => setBaiIdx(j)} aria-current={dang ? "step" : undefined}
                className={`cursor-pointer rounded-2xl border border-solid p-3 text-left font-sans transition-colors ${dang ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary"}`}>
                <span className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold ${dang ? "bg-primary text-white" : du ? "bg-ok text-white" : "bg-surface2 text-ink"}`}>{j + 1}</span>
                  <span className="text-xs font-bold text-ink">{tr("Bài", "Exercice", "Exercise")} {j + 1}</span>
                  <span className={`ml-auto text-xs font-bold tabular-nums ${du ? "text-ok" : "text-soft"}`}>{tong ? `${lam}/${tong}` : "—"}</span>
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface2">
                  <span className={`block h-full rounded-full ${du ? "bg-ok" : "bg-primary"}`} style={{ width: tong ? `${(lam / tong) * 100}%` : "0%" }} />
                </span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Consigne là HTML, không phải chữ thuần.
         Trình soạn bài (RichTextEditor) sinh ra thẻ — căn giữa, in nghiêng, tô
         màu — và lưu nguyên vào `consigne`. Dựng bằng `{ex.consigne}` thì React
         escape hết, và học sinh đọc đúng nghĩa đen của mã nguồn:
         `<div style="text-align: center;"> <span style=…>Depuis une dizaine…`

         `Taking.jsx` và `PracticeHub.jsx` đã dùng dangerouslySetInnerHTML cho
         đúng trường này từ lâu; chỉ màn thi bị bỏ sót. Nội dung do giáo viên
         soạn và đã nằm sau `is_teacher()`, cùng mức tin cậy với `readingText`
         ngay bên dưới. */}
      {ex.consigne && (
        <div className="m-0 mb-4 text-sm italic leading-relaxed text-soft"
             dangerouslySetInnerHTML={{ __html: ex.consigne }} />
      )}
      {ex.audioUrl && (
        /* `key` theo bài (07/10): không có nó thì sang bài 2 React giữ nguyên
           component của bài 1, kèm `conLai = 0` → mọi bài sau báo hết lượt. */
        <AudioGioiHan key={ex.id} src={ex.audioUrl} attemptId={attemptId} questionId={`ex:${ex.id}`} luot={ex.ngheKieuThi ? 1 : 2} />
      )}

      {/* Ảnh đề bài — màn thi trước đây KHÔNG dựng nó.
         Với bài đọc hiểu, ảnh thường CHÍNH LÀ ngữ liệu: áp phích, vé tàu, quảng
         cáo. Thiếu nó thì câu hỏi vẫn hiện đủ nhưng không trả lời được, và học
         sinh mất điểm vì một thứ không phải lỗi của họ. */}
      {ex.imageUrl && (
        <figure className="m-0 mb-6">
          <img src={ex.imageUrl} alt={tr("Tài liệu của bài", "Document de l'exercice", "Exercise document")} loading="lazy"
            className="mx-auto block w-full max-w-3xl rounded-2xl border border-line object-contain" />
        </figure>
      )}
      {ex.readingText && (
        <div className="mb-6 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-5 text-sm leading-relaxed text-ink"
             dangerouslySetInnerHTML={{ __html: ex.readingText }} />
      )}

      {/* ── PHẦN NÓI: ghi âm thay cho câu hỏi ──
          Bài nói không có câu trắc nghiệm nào để trả lời. Đề bài (consigne và
          ảnh) đã hiện ở trên; dưới đây là bộ ghi âm.

          Nhận biết theo MÃ phần, không theo "bài này có câu hỏi hay không":
          một bài nói soạn thiếu vẫn phải hiện đúng bộ ghi âm chứ không phải
          một danh sách rỗng. */}
      {section.code === "PO" ? (
        <GhiAmBaiNoi examId={examId} exerciseId={ex.id}
          gioiHanGiay={Math.max(60, (section.minutes ?? 15) * 60)} />
      ) : (
      <ol className="m-0 list-none space-y-5 p-0">
        {ex.questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="m-0 text-sm font-bold text-ink">
              <span className="mr-2 text-soft">{i + 1}.</span>{q.prompt}
            </div>

            {/* KHÔNG có tô màu đúng/sai ở đây — cố ý. Xem chú thích đầu file. */}
            {q.type === "qcm" && (
              <div className="mt-3 space-y-2">
                {(q.options ?? []).map((o, j) => (
                  <button key={j} type="button" onClick={() => dat(q.id, j)}
                    className={`block w-full rounded-xl border-0 px-4 py-2.5 text-left text-sm transition ${
                      answers[q.id] === j ? "bg-primary text-white" : "bg-surface2 text-ink hover:brightness-95"}`}>
                    <span className="flex items-center gap-3"><AnhLuaChon q={q} j={j} />{o}</span>
                  </button>
                ))}
              </div>
            )}

            {(q.type === "fill" || q.type === "conj") && (
              <input lang="fr" value={answers[q.id] ?? ""} onChange={(e) => dat(q.id, e.target.value)}
                placeholder={tr("Câu trả lời…", "Réponse…", "Answer…")}
                className="mt-3 w-full max-w-sm rounded-xl border border-line bg-surface2 px-4 py-2.5 text-sm text-ink" />
            )}

            {q.type === "vf" && (
              <div className="mt-3 flex gap-2">
                {["Vrai", "Faux", "?"].map((o, j) => (
                  <button key={j} type="button"
                    onClick={() => dat(q.id, { ...(answers[q.id] ?? {}), choice: j })}
                    className={`rounded-full border-0 px-4 py-2 text-sm font-semibold transition ${
                      answers[q.id]?.choice === j ? "bg-primary text-white" : "bg-surface2 text-ink"}`}>
                    {o}
                  </button>
                ))}
              </div>
            )}

            {q.type === "open" && (
              <>
                <textarea lang="fr" rows={10} value={answers[q.id] ?? ""}
                  onChange={(e) => dat(q.id, e.target.value)}
                  placeholder={tr("Bài viết của bạn…", "Votre texte…", "Your text…")}
                  className="mt-3 w-full rounded-xl border border-line bg-surface2 p-4 text-sm leading-relaxed text-ink" />
                <div className="mt-1 text-xs text-soft">
                  {String(answers[q.id] ?? "").trim().split(/\s+/).filter(Boolean).length} mots
                </div>
              </>
            )}

            {/* Ghép cặp + phiếu: dùng chung component, KHÔNG truyền correction. */}
            {q.type === "apparier" && (
              <div className="mt-3"><GhepCap q={q} value={answers[q.id] ?? {}} onChange={(v) => dat(q.id, v)} /></div>
            )}
            {q.type === "formulaire" && (
              <div className="mt-3"><DienPhieu q={q} value={answers[q.id] ?? {}} onChange={(v) => dat(q.id, v)} /></div>
            )}

            {q.type === "tableau" && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th />
                      {(q.colonnes ?? []).map((c) => (
                        <th key={c.id} className="p-2 text-xs font-bold text-soft">{c.titre}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(q.criteres ?? []).map((cr) => (
                      <tr key={cr.id} className="border-t border-line">
                        <td className="p-2 text-ink">{cr.texte}</td>
                        {(q.colonnes ?? []).map((co) => {
                          const key = `${cr.id}_${co.id}`;
                          const cur = answers[q.id]?.[key];
                          return (
                            <td key={co.id} className="p-2 text-center">
                              {["OUI", "NON"].map((v) => (
                                <button key={v} type="button"
                                  onClick={() => dat(q.id, { ...(answers[q.id] ?? {}), [key]: v })}
                                  className={`mx-0.5 rounded-full border-0 px-2.5 py-1 text-xs font-bold ${
                                    cur === v ? "bg-primary text-white" : "bg-surface2 text-soft"}`}>
                                  {v}
                                </button>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </li>
        ))}
      </ol>
      )}

      {/* ── Đi lại giữa các bài TRONG phần này ──
         Chỉ trong cùng một kỹ năng. Nhảy sang CO khi đang làm CE thì đồng hồ
         từng phần mất nghĩa, và bài thi thử thôi dựng lại được kỳ thi thật.

         Câu trả lời nằm ở `answers` của cả buổi thi, khoá theo `question.id`,
         nên đi qua đi lại không mất gì — kể cả khi bài kia đã rời khỏi DOM. */}
      {dsBai.length > 1 && (
        <div className="mt-8 flex items-center gap-2">
          <button type="button" disabled={baiIdx === 0} onClick={() => { setBaiIdx(baiIdx - 1); window.scrollTo({ top: 0 }); }}
            className="h-10 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 font-sans text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40">{tr("← Bài trước", "← Exercice précédent", "← Previous exercise")}</button>
          <span className="flex-1 text-center text-xs text-soft">{tr("Bài", "Exercice", "Exercise")} {baiIdx + 1}/{dsBai.length}</span>
          <button type="button" disabled={baiIdx === dsBai.length - 1} onClick={() => { setBaiIdx(baiIdx + 1); window.scrollTo({ top: 0 }); }}
            className="h-10 cursor-pointer rounded-full border-0 bg-primary-soft px-4 font-sans text-sm font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40">{tr("Bài tiếp →", "Exercice suivant →", "Next exercise →")}</button>
        </div>
      )}

      {/* ══ VÌ SAO PHẢI CHẶN BẤM LẦN THỨ HAI ══
       *
       * `onDone` là `xongPhan`, và nó `await gradeRemote(...)` — một vòng gọi
       * mạng — TRƯỚC khi chuyển sang phần kế. Suốt quãng chờ đó, nút vẫn bấm
       * được và màn hình không đổi gì.
       *
       * Người sốt ruột bấm thêm bốn lần thì `xongPhan` chạy năm lần cho CÙNG
       * một phần, và mỗi lần nối thêm một bản ghi vào `ketQua`. Kết quả thật đã
       * gặp: năm thẻ CO giống hệt nhau, tổng 47,5/150 thay vì 9,5/75.
       *
       * `doneRef` trước đây chỉ được ĐẶT ở đây chứ không được ĐỌC — nó chỉ chặn
       * đồng hồ bắn `onDone` lần nữa, không chặn ngón tay. */}
      <button type="button" disabled={doneRef.current}
        onClick={() => { if (doneRef.current) return; if (tongThieu > 0) setHoiNop(true); else nopNgay(); }}
        className="mt-8 rounded-full border-0 bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg
                   disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-soft disabled:shadow-none">
        {dangNop ? tr("Đang nộp…", "Envoi…", "Submitting…") : tr("Nộp phần này", "Terminer cette partie", "Finish this part")}
      </button>

      {hoiNop && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[300] grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><AlertTriangle size={20} className="text-warn" /> {tr("Bạn chưa làm xong phần này", "Vous n'avez pas terminé cette partie", "You haven't finished this part")}</h2>
            <p className="m-0 mt-2 text-sm text-ink">{tr("Còn", "Encore", "There are")} <strong>{tongThieu} {tr("câu", "question(s)", "question(s)")}</strong> {tr("chưa trả lời. Nộp rồi thì không quay lại phần này được.", "sans réponse. Une fois rendue, vous ne pourrez plus revenir.", "unanswered. Once submitted you can't come back.")}</p>
            <ul className="m-0 mt-3 grid list-none gap-1.5 p-0">
              {thieuTheoBai.map((ds, j) => ds.length ? (
                <li key={j}>
                  <button type="button" onClick={() => { setBaiIdx(j); setHoiNop(false); window.scrollTo({ top: 0 }); }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-xl border-0 bg-surface2 px-3 py-2 text-left font-sans text-sm text-ink hover:bg-primary-soft">
                    <strong>{dsBai.length > 1 ? tr(`Bài ${j + 1}`, `Exercice ${j + 1}`, `Exercise ${j + 1}`) : tr("Câu", "Question", "Question")}</strong>
                    <span className="min-w-0 flex-1 truncate text-soft">{dsBai.length > 1 ? tr("câu ", "questions ", "questions ") : ""}{ds.join(", ")}</span>
                    <span className="text-xs font-bold text-primary">{tr("Đến làm →", "Y aller →", "Go →")}</span>
                  </button>
                </li>
              ) : null)}
            </ul>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={nopNgay} className="h-10 cursor-pointer rounded-full border border-solid border-line bg-surface px-5 font-sans text-sm font-bold text-soft">{tr("Vẫn nộp", "Rendre quand même", "Submit anyway")}</button>
              <button type="button" onClick={() => { const k = thieuTheoBai.findIndex((d) => d.length); if (k >= 0) setBaiIdx(k); setHoiNop(false); window.scrollTo({ top: 0 }); }}
                className="h-10 cursor-pointer rounded-full border-0 bg-primary px-5 font-sans text-sm font-bold text-white">{tr("Quay lại làm tiếp", "Reprendre", "Go back")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Kết quả ─────────────────────────── */

function KetQua({ sections, blurCount, onLai }) {
  /* Có phần nào KHÔNG lưu được lên máy chủ không.
   *
   * Không gộp vào `verdict`: điểm và "có lưu được không" là hai câu hỏi khác
   * nhau, và trộn chúng thì một buổi thi mất trắng sẽ hiện thành điểm thấp —
   * sai theo hướng nguy hiểm nhất, vì học sinh sẽ đi làm lại bài thay vì đăng
   * nhập lại. */
  const mat = sections.some((s) => s.luuDuoc === false);

  const v = verdict(sections);
  useEffect(() => { phat(mat ? "sai" : v.passed === true ? "thang" : v.passed === false ? "thua" : "nop"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      {v.passed === true && !mat && <PhaoGiayLon />}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="m-0 text-2xl font-extrabold text-ink">{tr("Kết quả thi thử", "Résultat de l'examen blanc", "Mock exam result")}</h1>
        <NutTieng />
      </div>

      <BangKetLuan diem={v.total} toiDa={v.maxScored} passed={v.passed}
        tieuDe={tr("Tổng điểm", "Note totale", "Total score")}
        phu={v.passed === true ? tr("C'est super ! Bạn đã vượt cả hai ngưỡng của DELF.", "C'est super ! Les deux seuils du DELF sont franchis.", "C'est super! You cleared both DELF thresholds.")
          : v.passed === false ? tr("Allez, courage ! Xem phần nào kéo điểm xuống rồi luyện tiếp nhé.", "Allez, courage ! Repère la partie qui pèse et entraîne-toi.", "Allez, courage! Find the weak part and keep practising.")
            : null}>
        {/* Chưa chấm hết thì KHÔNG đoán. */}
        {v.passed === null && (
          <p className="m-0 mt-2 rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold">
            {tr("Còn", "Encore", "There are")} {v.pending.map((p) => p.code).join(", ")} {tr("chưa có điểm. AI sẽ chấm bài viết, xem ở « Kết quả thi ».", "n'a pas de note. La correction s'affiche dans « Mes résultats ».", "has no score yet. Grading appears in « My results ».")}
          </p>
        )}
      </BangKetLuan>

      {mat && (
        <div className="mt-5 rounded-2xl border border-solid border-danger bg-danger-soft p-4">
          <p className="m-0 text-sm font-bold text-danger">
            {tr("⚠️ Kết quả này CHƯA được lưu lên máy chủ.", "⚠️ Ce résultat N'EST PAS enregistré sur le serveur.", "⚠️ This result is NOT saved on the server.")}
          </p>
          <p className="m-0 mt-1 text-xs font-semibold text-danger">
            {tr("Máy chủ không nhận ra bạn là ai — nhiều khả năng phiên đăng nhập đã hết hạn. Điểm ở đây chỉ nằm trong trình duyệt và sẽ mất khi bạn tải lại trang; buổi thi này cũng sẽ không hiện ở « Kết quả thi ».", "Le serveur ne vous reconnaît pas, votre session a sans doute expiré. Ces notes ne sont que dans le navigateur et disparaîtront au rechargement.", "The server doesn't recognise you; your session probably expired. These scores live only in the browser and vanish on reload.")}
          </p>
          <p className="m-0 mt-1 text-xs text-danger">
            {tr("Đăng nhập lại rồi thi lại. Đừng đóng tab trước khi chép lại điểm nếu bạn cần.", "Reconnectez-vous et recommencez. Notez vos résultats avant de fermer l'onglet.", "Sign in again and retake it. Note your scores before closing the tab.")}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {sections.map((s, k) => (
          <ThanhPhan key={s.code} code={s.code} label={s.label} phu={s.baiLabel ?? s.exercise?.title ?? ""}
            score={s.score} points={s.points} nguong={s.points ? NGUONG_PHAN : null} tre={200 + k * 90} />
        ))}
      </div>

      {/* Luật đạt có HAI vế, và vế thứ hai mới hay làm trượt người ta. */}
      <p className="m-0 mt-5 flex items-start gap-2 rounded-2xl bg-surface2 p-3 text-xs text-soft">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          {tr("Đạt DELF cần", "Pour réussir le DELF :", "To pass DELF you need")} <strong className="text-ink">≥ {NGUONG_TONG}{tr("/100 toàn bài", "/100 au total", "/100 overall")}</strong> {tr("VÀ", "ET", "AND")}{" "}
          <strong className="text-ink">≥ {NGUONG_PHAN}{tr("/25 ở mỗi phần", "/25 dans chaque partie", "/25 in each part")}</strong>{tr(". Người ta thường trượt vì một kỹ năng yếu hẳn, chứ hiếm khi vì tổng điểm.", ". On échoue souvent à cause d'une compétence faible, rarement à cause du total.", ". People usually fail because of one weak skill, rarely because of the total.")}
        </span>
      </p>

      {blurCount > 0 && (
        <p className="m-0 mt-3 text-xs text-soft">
          {tr("Bạn rời khỏi tab", "Vous avez quitté l'onglet", "You left the tab")} {blurCount} {tr("lần trong lúc thi. Không bị trừ điểm — chỉ để bạn biết, vì phòng thi thật thì không rời được.", "fois pendant l'examen. Pas de pénalité, c'est pour information : en vrai, on ne peut pas sortir.", "times during the exam. No penalty — just so you know; in a real exam room you can't leave.")}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Link to="/etudiant/resultats"
          className="inline-flex items-center gap-2 rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-6 py-3 text-sm font-extrabold text-white no-underline shadow-lg transition-transform hover:-translate-y-0.5">
          <Trophy size={15} /> {tr("Xem chi tiết & nhận xét AI", "Détail et évaluation IA", "Details & AI feedback")}
        </Link>
        <button type="button" onClick={onLai}
          className="cursor-pointer rounded-2xl border-2 border-solid border-line bg-surface px-6 py-3 font-sans text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
          {tr("Thi đề khác", "Passer un autre sujet", "Take another exam")}
        </button>
        <Link to="/etudiant/dashboard"
          className="rounded-full px-5 py-3 text-sm font-semibold text-soft no-underline hover:text-ink">
          {tr("Về trang chủ", "Accueil", "Home")}
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────── Vỏ ─────────────────────────── */

export default function ExamMode() {
  const [dsDe, setDsDe] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [paper, setPaper] = useState(null);
  const [buoc, setBuoc] = useState("cho");         // cho | thi | cham | xong
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ketQua, setKetQua] = useState([]);
  const [blurCount, setBlurCount] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  /* Bài đang hiện trong phần hiện tại. Đổi bài KHÔNG nộp gì và không chạm đồng
     hồ — nó chỉ quyết định mở `attempt` cho bài nào. */
  const [baiHienTai, setBaiHienTai] = useState(null);
  /* attempt của TỪNG bài. Bộ đếm lượt nghe audio gắn vào bài, không gắn vào
     phần, nên một phần ba bài cần ba dòng attempt. Dùng ref chứ không state:
     giá trị này chỉ để đọc lúc chấm, và đưa vào state sẽ khiến mỗi lần đổi bài
     render lại cả cây. */
  const attemptTheoBai = useRef({});
  /* Lượt thi đang dùng (120). */
  const luotId = useRef(null);
  const [hopThoat, setHopThoat] = useState(false);
  const navigate = useNavigate();
  useGiuPhongThi(buoc === "thi", () => setHopThoat(true));
  useEffect(() => {
    if (buoc === "xong" && luotId.current) {
      supabase.rpc("ket_thuc_thi", { p_luot: luotId.current, p_xong: true }).then(() => {});
      luotId.current = null;
    }
  }, [buoc]);
  const thoatThi = async () => {
    setHopThoat(false);
    if (luotId.current) await supabase.rpc("ket_thuc_thi", { p_luot: luotId.current, p_xong: false });
    luotId.current = null;
    setBuoc("cho"); // gỡ chặn Back/đóng tab TRƯỚC khi rời trang
    setTimeout(() => navigate("/etudiant/dashboard"), 0);
  };

  /* Gom các dòng exam_sections thành KHỐI theo kỹ năng — một khối, một đồng hồ,
     nhiều bài bên trong. Xem gomTheoKyNang() trong examPaper.js. */
  /* Bỏ chọn phần nói: lọc NGAY ở đây, trước mọi thứ khác.
     Lọc ở chỗ khác thì đồng hồ, thanh tiến trình và phép chấm mỗi nơi đếm một
     kiểu — và số phần hiện ra sẽ lệch với số phần thật sự phải làm. */
  const [lamPhanNoi, setLamPhanNoi] = useState(true);

  /* Phiên máy chủ: null = chưa hỏi xong, true/false = câu trả lời.
     Ba trạng thái chứ không phải hai — coi "chưa biết" như "không có" thì màn
     chờ chớp một cảnh báo đỏ ngay lần render đầu rồi tự rút lại. */
  const [phienThuc, setPhienThuc] = useState(null);
  useEffect(() => {
    let con = true;
    coPhienMayChu().then((v) => { if (con) setPhienThuc(v); });
    return () => { con = false; };
  }, []);
  const khoi = useMemo(
    () => gomTheoKyNang(paper?.sections).filter((k) => lamPhanNoi || k.code !== "PO"),
    [paper, lamPhanNoi]);

  /* Đề đến từ bảng `exams` — do giáo viên soạn và phát hành (migration 026).
     RLS lo phần lọc: học sinh chỉ nhận đề đã phát hành. Không lọc lại ở đây,
     vì lọc ở client là thứ xoá được trong DevTools. */
  useEffect(() => {
    loadExams()
      .then((ds) => { setDsDe(ds); if (ds.length === 1) chonDe(ds[0].id); })
      .catch(() => setDsDe([]))
      .finally(() => setDangTai(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chonDe = async (id) => {
    setDangTai(true);
    const de = await loadExam(id);
    setDangTai(false);
    if (!de) { alert(tr("Không mở được đề này.", "Impossible d'ouvrir ce sujet.", "Couldn't open this exam.")); return; }
    setPaper(de);
  };

  /* Trả về CHUỖI LỖI nếu không mở được, để hộp cảnh báo hiện tại chỗ. Lượt
     bị trừ ở máy chủ ngay đây; không có lượt thì không vào được bài. */
  const batDau = async () => {
    const { data, error } = await supabase.rpc("bat_dau_thi", { p_exam_id: paper?.id ?? null });
    if (error) return tr("Không kết nối được máy chủ, chưa mở được bài thi. Thử lại sau giây lát.", "Serveur injoignable, examen non ouvert. Réessayez dans un instant.", "Can't reach the server; exam not opened. Try again shortly.");
    if (!data?.ok) return data?.ma === "HET_LUOT"
      ? tr("Bạn đã dùng hết 2 lượt thi hôm nay. Hãy quay lại vào ngày mai.", "Vous avez utilisé vos 2 essais d'aujourd'hui. Revenez demain.", "You've used today's 2 attempts. Come back tomorrow.")
      : tr("Không mở được bài thi. Hãy đăng nhập lại.", "Impossible d'ouvrir l'examen. Reconnectez-vous.", "Couldn't open the exam. Please sign in again.");
    luotId.current = data.luot_id;
    phat("batDau");
    setAnswers({}); setKetQua([]); setBlurCount(0); setIdx(0);
    setBaiHienTai(null); attemptTheoBai.current = {};
    setBuoc("thi");
  };

  /* Mở `attempt` NGAY khi vào phần thi, không đợi lúc nộp.
   *
   * Bộ đếm lượt nghe cần một dòng để ghi vào trong lúc đang làm bài. Nếu dòng
   * đó chỉ sinh ra lúc chấm thì suốt phần CO không có chỗ nào đếm, và giới hạn
   * 2 lượt lại phải quay về sống trong state React — đúng thứ roadmap §2.3 cấm.
   *
   * `exam_start` dùng lại lần làm chưa kết thúc, nên gọi lại nhiều lần cũng chỉ
   * ra một dòng. Đó cũng là thứ khiến F5 không cấp thêm lượt nghe. */
  useEffect(() => {
    const exId = baiHienTai ?? khoi[idx]?.exercises[0]?.id;
    if (buoc !== "thi" || !exId) return;
    let huy = false;
    setAttemptId(null);
    supabase.rpc("exam_start", {
      p_exercise_id: exId,
      /* Gắn lượt làm vào ĐỀ. Thiếu tham số này thì ba phần CO/CE/PE của cùng
         một buổi thi trông như ba lần luyện tập rời rạc, và màn hình kết quả
         không gom lại được — đúng lỗi migration 028 sửa. */
      p_exam_id: paper.id,
      p_mode: "exam",
    }).then(({ data, error }) => {
      if (huy) return;
      if (error) console.warn("[exam] không mở được attempt:", error.message);
      else { setAttemptId(data); attemptTheoBai.current[exId] = data; }
    });
    return () => { huy = true; };
  }, [buoc, idx, paper, baiHienTai]);

  const xongPhan = async () => {
    const k = khoi[idx];
    const conNua = idx + 1 < khoi.length;

    /* Nộp NGAY từng phần, không đợi hết bài: hết giờ phần này là câu trả lời
       của nó đã an toàn trên máy chủ. Đợi tới cuối thì một lần đóng tab là mất
       cả buổi thi.

       Một phần có thể có NHIỀU bài (migration 044), và mỗi bài là một lời gọi
       chấm riêng — `gradeRemote` nhận đúng một `exerciseId`. Nên chấm lần lượt
       rồi CỘNG DỒN, và chỉ quy về thang 25 MỘT LẦN ở cuối.

       Quy đổi từng bài rồi cộng là sai: hai bài 7 câu và 15 câu sẽ có trọng số
       bằng nhau, trong khi bài 15 câu đáng gấp đôi. Cộng thô rồi mới chia thì
       mỗi câu nặng như nhau — đúng cách DELF đếm. */
    let dung = 0, tong = 0;
    /* ── CÓ THẬT SỰ LƯU ĐƯỢC KHÔNG ──
     *
     * Hàm `grade` ghi `attempts` bên trong `if (userId)`, còn câu trả về nằm
     * NGOÀI khối đó. Máy chủ không nhận ra người gọi là ai — phiên hết hạn,
     * chưa đăng nhập, JWT không kèm theo — thì nó vẫn chấm và vẫn trả điểm
     * đúng, chỉ là `attemptId: null` và không một dòng nào được ghi.
     *
     * Đã xảy ra thật: một buổi thi đầy đủ, màn hình hiện CO 19 / CE 14.5, và
     * database không có lấy một dòng `attempts`. Học sinh chỉ phát hiện khi mở
     * trang Kết quả thi và không thấy buổi thi ấy ở đâu — muộn hơn nhiều, và
     * lúc đó bài làm đã mất hẳn.
     *
     * `attemptId` trả về là dấu hiệu chắc chắn: có id nghĩa là đã ghi. Đây là
     * lần thứ TƯ dự án gặp cùng một lỗi — báo thành công cho việc chưa làm.
     * Xem `saveExam`, `saveExercise`, `sendAnnonce`. */
    /* ── PHẦN NÓI: không chấm, không gọi máy chủ ──
     *
     * Bản ghi âm đã được `GhiAmBaiNoi` tải thẳng lên kho riêng tư khi học sinh
     * bấm Dừng. Ở đây không có gì để chấm và không có gì để gửi.
     *
     * Ghi `score: null` kèm `khongCham`, và `verdict` loại nó khỏi mọi phép
     * tính — nếu không thì kết luận đạt/trượt treo vĩnh viễn ở "chưa kết luận
     * được". Xem MA_KHONG_CHAM trong examPaper.js. */
    if (khongCham(k)) {
      setKetQua((p) => ghiPhan(p, {
        code: k.code, points: 0, khongCham: true,
        label: k.label ?? k.code,
        baiLabel: k.exercises.map((e) => e.title).join(" · "),
        exerciseId: k.exercises[0]?.id,
        score: null,
        luuDuoc: true,
      }));
      if (conNua) { setIdx(idx + 1); setBaiHienTai(null); }
      else setBuoc("xong");
      return;
    }

    let luuDuoc = true;
    for (const ex of k.exercises) {
      const r = await gradeRemote(ex.id, answers, {
        mode: "exam", blurCount, attemptId: attemptTheoBai.current[ex.id],
        examId: paper?.id ?? null,
      });
      if (r) { dung += r.score ?? 0; tong += r.max ?? 0; }
      if (!r || !r.attemptId) luuDuoc = false;
    }

    const ghi = {
      code: k.code, points: k.points, exerciseId: k.exercises[0]?.id,
      /* Hai nhãn khác nhau, đừng gộp làm một: `label` là tên kỹ năng
         (« Compréhension de l'oral »), `baiLabel` là tên các bài đã làm. Màn
         kết quả hiện cả hai, dòng trên dòng dưới. Bản trước đặt tên bài vào
         `label` và làm mất tên kỹ năng khỏi thanh tiêu đề lúc đang thi. */
      label: k.label ?? k.code,
      baiLabel: k.exercises.map((e) => e.title).join(" · "),
      /* tong === 0 nghĩa là phần này không có câu nào máy chấm được (Production
         écrite chỉ có bài viết) → để `null`, tức "chờ chấm", chứ không phải 0. */
      score: tong > 0 ? sectionScore(dung, tong, k.points) : null,
      /* Phần này có được lưu lên máy chủ không. Màn kết quả dùng nó để nói
         thẳng khi bài thi chỉ tồn tại trong trình duyệt. */
      luuDuoc,
    };

    /* Nút đã chặn bấm lại (xem PhanThi) — đó là chỗ sửa NGUYÊN NHÂN. `ghiPhan`
       là lớp thứ hai: dù có đường nào lọt qua thì mảng vẫn không thể chứa hai
       bản ghi cùng `code`. Chặn một chỗ là sửa lỗi; làm cho trạng thái sai
       KHÔNG BIỂU DIỄN ĐƯỢC mới là hết lo. */
    setKetQua((p) => ghiPhan(p, ghi));

    /* Phần viết KHÔNG được chấm tự động ở đây — học sinh tự chấm ở màn
       « Kết quả thi », đối chiếu với bài mẫu. Xem migration 030. */

    /* KHÔNG xoá `answers` khi sang phần mới: nó khoá theo question.id, nên câu
       của phần trước không đụng gì tới phần sau — mà giữ lại thì nếu có đường
       nào quay lại, bài làm vẫn còn. Bản cũ xoá vì mỗi phần chỉ một bài. */
    if (conNua) { setIdx(idx + 1); setBaiHienTai(null); }
    else setBuoc("xong");
  };

  if (buoc === "cho") {
    return <ManCho dsDe={dsDe} chon={chonDe} paper={paper}
      lamPhanNoi={lamPhanNoi} setLamPhanNoi={setLamPhanNoi}
      phienThuc={phienThuc}
      dangTai={dangTai} onStart={batDau} />;
  }
  if (buoc === "thi") {
    /* `key` theo code: đổi phần thì PhanThi được dựng lại từ đầu, nên đồng hồ
       và chỉ số bài đều reset. Đổi BÀI trong cùng phần thì không — key không
       đổi, component sống tiếp, đồng hồ chạy tiếp. */
    return <>
      <PhanThi key={khoi[idx].code} section={khoi[idx]} examId={paper?.id}
      attemptId={attemptId}
      answers={answers} setAnswers={setAnswers} onDone={xongPhan}
      onDoiBai={setBaiHienTai}
      onThoat={() => setHopThoat(true)}
      onBlur={() => setBlurCount((n) => n + 1)} />
      {hopThoat && <HopThoat onO={() => setHopThoat(false)} onThoat={thoatThi} />}
    </>;
  }
  return <KetQua sections={ketQua} blurCount={blurCount}
    onLai={() => { setPaper(null); setBuoc("cho"); }} />;
}
