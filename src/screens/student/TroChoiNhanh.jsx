import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Headphones, CloudRain, VenusAndMars, Play, RotateCcw, Trophy, Volume2, Loader2, Shuffle, Crosshair, Check, X, Keyboard, DoorOpen, DoorClosed, Search, Landmark, MapPinned, Swords, Layers } from "lucide-react";
import { PhatAm } from "./NgheNoi.jsx";
import { soCau } from "../../../supabase/functions/_shared/soCau.js";
import { THAM_TU, DO_VUI, PHIEU_LUU } from "../../content/troChoi/docVanHoa.js";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";
import { CAP_CHOI, docDanhTuGioi, docMuaChu, phuongAnNghia, docCauNghe, phuongAnCau, ghiTroChoi, docKyLuc, docXepCau, docSanLoi, docDungSai, tron } from "../../shared/troChoiNhanh.js";

/* Ba trò chơi nhanh (27/10, migration 168). /etudiant/tro-choi là sảnh, /etudiant/tro-choi/:ma
 * là một trò. Câu hỏi dựng từ kho có sẵn (xem shared/troChoiNhanh.js); điểm, kỷ lục và XP
 * ghi qua RPC ghi_tro_choi, mỗi lượt cũng tính một ngày học cho chuỗi. */

const TRO_CHOI = () => [
  /* 28/10 (chủ dự án): Flashcard vào sảnh, nhóm Ôn luyện. */
  { ma: "flashcard", den: "/etudiant/bo-the", nhom: "on", Icon: Layers, nen: "from-teal-500 to-emerald-600",
    ten: "Flashcard",
    mo: tr("Lật thẻ ôn từ theo bộ giáo viên soạn, lịch ôn giãn cách nhắc đúng lúc sắp quên.", "Cartes à retourner, révision espacée au bon moment.", "Flip cards with spaced repetition at the right time.") },
  /* 28/10 (chủ dự án): Thách đấu PvP vào sảnh, nhóm Từ vựng; `den` = màn riêng, không qua ManChoi. */
  { ma: "thach_dau", den: "/etudiant/thach-dau", nhom: "tu", Icon: Swords, nen: "from-violet-600 to-rose-500",
    ten: tr("Thách đấu PvP", "Duel PvP", "PvP duel"),
    mo: tr("Đấu từ vựng 1 chọi 1 với bạn bè, ai nhanh và đúng hơn thì thắng.", "Duel de vocabulaire en 1 contre 1 avec vos amis.", "1-on-1 vocabulary duel against friends.") },
  { ma: "gioi_tinh", nhom: "tu", Icon: VenusAndMars, nen: "from-sky-500 to-pink-500",
    ten: tr("Le hay La?", "Le ou La ?", "Le or La?"),
    mo: tr("60 giây đoán giống đực / giống cái của danh từ. Đúng liên tiếp để nhân điểm.", "60 secondes pour trouver le genre des noms. Enchaînez pour multiplier.", "60 seconds to guess noun gender. Streaks multiply points.") },
  { ma: "nghe_chon", nhom: "ng", Icon: Headphones, nen: "from-indigo-500 to-violet-600",
    ten: tr("Nghe và chọn", "Écoute et choisis", "Listen and pick"),
    mo: tr("10 câu: nghe audio rồi chọn đúng câu vừa nghe. Trả lời càng nhanh càng nhiều điểm.", "10 phrases : écoutez puis choisissez la bonne. Plus vite, plus de points.", "10 sentences: listen, then pick the one you heard. Faster means more points.") },
  { ma: "mua_chu", nhom: "tu", Icon: CloudRain, nen: "from-emerald-500 to-cyan-600",
    ten: tr("Mưa chữ", "Pluie de mots", "Word rain"),
    mo: tr("Từ tiếng Pháp rơi xuống, chọn đúng nghĩa trước khi chạm đất. 3 mạng, càng lâu càng nhanh.", "Les mots tombent : trouvez le sens avant qu'ils touchent le sol. 3 vies.", "French words fall: pick the meaning before they land. 3 lives.") },
  { ma: "xep_cau", nhom: "np", Icon: Shuffle, nen: "from-orange-500 to-rose-500",
    ten: tr("Xếp câu tốc độ", "Phrases en vrac", "Sentence builder"),
    mo: tr("90 giây: chạm các từ theo đúng thứ tự để thành câu. Xếp được càng nhiều câu càng nhiều điểm.", "90 secondes : remettez les mots dans l'ordre, un maximum de phrases.", "90 seconds: tap words in order to build as many sentences as you can.") },
  { ma: "san_loi", nhom: "np", Icon: Crosshair, nen: "from-red-500 to-amber-500",
    ten: tr("Săn lỗi sai", "Chasse à l'erreur", "Error hunt"),
    mo: tr("Mỗi câu có đúng một từ sai: chạm vào nó. 3 mạng, chạm nhầm là mất mạng.", "Chaque phrase cache une erreur : touchez-la. 3 vies.", "Each sentence hides one wrong word: tap it. 3 lives.") },
  { ma: "dung_sai", nhom: "np", Icon: Check, nen: "from-teal-500 to-blue-600",
    ten: tr("Đúng hay sai, 60 giây", "Vrai ou faux, 60 s", "True or false, 60 s"),
    mo: tr("Lướt thật nhanh: câu này đúng hay sai? Đúng liên tiếp để nhân điểm.", "Vite : la phrase est-elle correcte ? Enchaînez pour multiplier.", "Quick: is it right or wrong? Streaks multiply points.") },
  { ma: "chep_nhanh", nhom: "ng", Icon: Keyboard, nen: "from-fuchsia-500 to-purple-600",
    ten: tr("Chép chính tả tốc độ", "Dictée express", "Speed dictation"),
    mo: tr("5 câu: nghe rồi gõ lại. Điểm theo độ chính xác (tính cả dấu) và tốc độ.", "5 phrases : écoutez et tapez. Précision et vitesse comptent.", "5 sentences: listen and type. Accuracy and speed count.") },
  { ma: "noi_mo_khoa", nhom: "ng", Icon: DoorOpen, nen: "from-rose-500 to-red-600",
    ten: tr("Nói để mở cửa", "Parle pour ouvrir", "Speak to unlock"),
    mo: tr("3 cánh cửa, mỗi cửa một câu. Đọc to cho Leon nghe, đúng từ 70% là cửa mở. Dùng lượt chấm phát âm trong ngày.", "3 portes, une phrase chacune. Lisez à voix haute : 70 % de mots reconnus pour ouvrir.", "3 doors, one sentence each. Read aloud: 70% of words recognised opens the door.") },
  { ma: "tham_tu", nhom: "dv", Icon: Search, nen: "from-slate-600 to-indigo-700",
    ten: tr("Thám tử đọc", "Détective lecture", "Reading detective"),
    mo: tr("Đọc tin nhắn, thông báo, quảng cáo ngắn rồi tìm manh mối trả lời câu hỏi.", "Lisez messages et annonces, trouvez les indices.", "Read short messages and notices, find the clues.") },
  { ma: "do_vui", nhom: "dv", Icon: Landmark, nen: "from-blue-600 to-red-500",
    ten: tr("Đố vui nước Pháp", "Quiz France", "France quiz"),
    mo: tr("10 câu về văn hoá, địa lý, ẩm thực Pháp. Trả lời nhanh để được thêm điểm.", "10 questions sur la culture française.", "10 questions on French culture.") },
  { ma: "phieu_luu", nhom: "dv", Icon: MapPinned, nen: "from-amber-500 to-orange-600",
    ten: tr("Phiêu lưu ở Paris", "Aventure à Paris", "Paris adventure"),
    mo: tr("Một ngày ở Paris: chọn câu tiếng Pháp hợp tình huống ở quán café, métro, khách sạn… 3 mạng.", "Une journée à Paris : choisissez la bonne réplique. 3 vies.", "A day in Paris: pick the right reply. 3 lives.") },
];

export default function TroChoiNhanh() {
  const { ma } = useParams();
  const ds = TRO_CHOI();
  const tc = ds.find((x) => x.ma === ma && !x.den);
  if (tc) return <ManChoi tc={tc} />;
  return <Sanh ds={ds} />;
}

/* ─────────── Sảnh ─────────── */
function Sanh({ ds }) {
  const [kl, setKl] = useState({});
  useEffect(() => { docKyLuc().then(setKl, () => {}); }, []);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-4">
      <div className="flex items-center gap-3">
        <Leon cam="yeah" size={64} />
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">{tr("Trò chơi nhanh", "Jeux rapides", "Quick games")}</h1>
          <p className="m-0 text-sm text-soft">{tr("Mỗi ván 1–2 phút. Có XP và tính vào chuỗi ngày học.", "1 à 2 minutes par partie. XP et série inclus.", "1–2 minutes per round. Earns XP and counts for your streak.")}</p>
        </div>
      </div>
      {[["on", tr("Ôn luyện", "Révision", "Review")], ["tu", tr("Từ vựng", "Vocabulaire", "Vocabulary")], ["ng", tr("Nghe và nói", "Écoute et oral", "Listening and speaking")], ["np", tr("Ngữ pháp", "Grammaire", "Grammar")], ["dv", tr("Đọc hiểu và văn hoá", "Lecture et culture", "Reading and culture")]].map(([nhom, tenNhom]) => (
      <section key={nhom} className="mt-6">
      <h2 className="m-0 mb-3 text-lg font-extrabold text-ink">{tenNhom}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {ds.filter((x) => x.nhom === nhom).map(({ ma, den, Icon, nen, ten, mo }) => (
          <Link key={ma} to={den ?? `/etudiant/tro-choi/${ma}`}
            className={`group relative flex min-h-[220px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${nen} p-5 text-white no-underline shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out hover:-translate-y-1 active:scale-[0.985]`}>
            <span aria-hidden className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15" />
            <Icon aria-hidden size={110} strokeWidth={1.2} className="absolute -bottom-6 -right-4 text-white/15" />
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/25"><Icon size={24} /></span>
            <span className="relative mt-4 text-xl font-extrabold">{ten}</span>
            <span className="relative mt-1 text-sm leading-snug text-white/90">{mo}</span>
            <span className="relative mt-auto flex items-center justify-between pt-4 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">{den ? <Icon size={14} /> : <Trophy size={14} />} {den ? (ma === "thach_dau" ? "PvP" : tr("Ôn", "Révision", "Review")) : kl[ma] != null ? kl[ma] : "—"}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-ink transition-transform group-hover:translate-x-0.5"><Play size={14} /> {tr("Chơi", "Jouer", "Play")}</span>
            </span>
          </Link>
        ))}
      </div>
      </section>
      ))}
    </div>
  );
}

/* ─────────── Khung một trò: chọn trình độ → chơi → kết quả ─────────── */
function ManChoi({ tc }) {
  const nav = useNavigate();
  const [cap, setCap] = useState(null);           // null = mọi trình độ
  const [buoc, setBuoc] = useState("chon");       // chon | choi | xong
  const [kq, setKq] = useState(null);             // { diem, dung, tong }
  const [ghi, setGhi] = useState(null);           // kết quả RPC
  const [van, setVan] = useState(0);

  const xong = useCallback(async (r) => {
    setKq(r); setBuoc("xong"); setGhi(null);
    phat(r.dung >= r.tong * 0.6 ? "thang" : "hetGio");
    setGhi(await ghiTroChoi(tc.ma, r.diem, r.dung, Math.max(1, r.tong)));
  }, [tc.ma]);

  const Game = { gioi_tinh: GioiTinh, nghe_chon: NgheChon, mua_chu: MuaChu, xep_cau: XepCau, san_loi: SanLoi, dung_sai: DungSai,
    chep_nhanh: ChepNhanh, noi_mo_khoa: NoiMoKhoa, tham_tu: ThamTu, do_vui: DoVui, phieu_luu: PhieuLuu }[tc.ma];
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-4">
      <button type="button" onClick={() => (buoc === "choi" ? setBuoc("chon") : nav("/etudiant/tro-choi"))}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface px-4 py-2 font-sans text-sm font-bold text-ink shadow-sm">
        <ArrowLeft size={16} /> {buoc === "choi" ? tr("Dừng", "Arrêter", "Stop") : tr("Trò chơi", "Jeux", "Games")}
      </button>

      <div className={`mt-4 flex items-center gap-3 rounded-3xl bg-gradient-to-br ${tc.nen} p-5 text-white`}>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25"><tc.Icon size={24} /></span>
        <div className="min-w-0">
          <h1 className="m-0 text-xl font-extrabold">{tc.ten}</h1>
          <p className="m-0 text-sm text-white/90">{tc.mo}</p>
        </div>
      </div>

      {buoc === "chon" && (
        <div className="mt-6 rounded-3xl bg-surface p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="m-0 text-sm font-bold text-soft">{tr("Chọn trình độ", "Choisissez le niveau", "Pick a level")}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {[null, ...CAP_CHOI].map((c) => (
              <button key={c ?? "tat"} type="button" onClick={() => setCap(c)}
                className={`cursor-pointer rounded-full border-0 px-4 py-2 font-sans text-sm font-bold transition-colors ${cap === c ? "bg-primary text-on-primary" : "bg-surface2 text-ink hover:bg-primary-soft"}`}>
                {c ?? tr("Tất cả", "Tous", "All")}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { phat("batDau"); setVan((v) => v + 1); setBuoc("choi"); }}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-8 py-3 font-sans text-base font-extrabold text-on-primary shadow-[0_10px_24px_rgb(var(--mcf-primary-rgb)/0.3)] active:scale-[0.97]">
            <Play size={18} /> {tr("Bắt đầu", "Commencer", "Start")}
          </button>
        </div>
      )}

      {buoc === "choi" && <Game key={van} cap={cap} onXong={xong} />}

      {buoc === "xong" && kq && (
        <div className="mt-6 rounded-3xl bg-surface p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <Leon cam={kq.dung >= kq.tong * 0.6 ? "tuyet-voi" : "quyet-tam"} size={96} className="mx-auto block" />
          <p className="m-0 mt-2 text-sm font-bold uppercase tracking-wider text-soft">{tr("Điểm", "Score", "Score")}</p>
          <p className="m-0 text-5xl font-extrabold tabular-nums text-ink">{kq.diem}</p>
          <p className="m-0 mt-1 text-sm text-soft">{tr(`Đúng ${kq.dung}/${kq.tong}`, `${kq.dung}/${kq.tong} correctes`, `${kq.dung}/${kq.tong} correct`)}</p>
          <div className="mt-3 flex min-h-[28px] flex-wrap justify-center gap-2 text-sm font-bold">
            {!ghi ? <span className="inline-flex items-center gap-1.5 text-soft"><Loader2 size={14} className="mcf-spin" /> {tr("Đang lưu…", "Enregistrement…", "Saving…")}</span>
              : ghi.loi ? <span className="text-danger">{tr("Không lưu được điểm", "Score non enregistré", "Score not saved")} ({ghi.loi})</span>
              : <>
                  {ghi.ky_luc_moi && <span className="rounded-full bg-warn-soft px-3 py-1 text-warn">🏆 {tr("Kỷ lục mới!", "Nouveau record !", "New record!")}</span>}
                  {!ghi.ky_luc_moi && ghi.ky_luc_cu > 0 && <span className="rounded-full bg-surface2 px-3 py-1 text-soft">{tr("Kỷ lục", "Record", "Best")}: {ghi.ky_luc_cu}</span>}
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">+{ghi.xp} XP</span>
                </>}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => { phat("batDau"); setVan((v) => v + 1); setBuoc("choi"); }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 py-2.5 font-sans text-sm font-extrabold text-on-primary active:scale-[0.97]">
              <RotateCcw size={16} /> {tr("Chơi lại", "Rejouer", "Play again")}
            </button>
            <Link to="/etudiant/tro-choi" className="inline-flex items-center rounded-full border border-solid border-line bg-surface px-6 py-2.5 text-sm font-bold text-ink no-underline">
              {tr("Trò khác", "Autre jeu", "Other game")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const Dang = ({ chu }) => (
  <div className="mt-6 grid place-items-center rounded-3xl bg-surface p-10 text-soft"><Loader2 size={22} className="mcf-spin" /><p className="m-0 mt-2 text-sm">{chu}</p></div>
);
const TrongKho = () => (
  <div className="mt-6 rounded-3xl bg-surface p-8 text-center text-sm text-soft">{tr("Chưa đủ dữ liệu cho trình độ này. Thử « Tất cả ».", "Pas assez de données pour ce niveau. Essayez « Tous ».", "Not enough data for this level. Try “All”.")}</div>
);

/* ─────────── 1. Le hay La ─────────── */
function GioiTinh({ cap, onXong }) {
  const GIAY = 60;
  const [ds, setDs] = useState(null);
  const [i, setI] = useState(0);
  const [chuoi, setChuoi] = useState(0);
  const [diem, setDiem] = useState(0);
  const [dung, setDung] = useState(0);
  const [tong, setTong] = useState(0);
  const [con, setCon] = useState(GIAY);
  const [loe, setLoe] = useState(null);          // { ok, mao } hiệu ứng sau khi chọn
  const ref = useRef({ diem: 0, dung: 0, tong: 0, xong: false });

  useEffect(() => { docDanhTuGioi(cap).then(setDs, () => setDs([])); }, [cap]);
  useEffect(() => {
    if (!ds?.length) return;
    const het = Date.now() + GIAY * 1000;
    const t = setInterval(() => {
      const c = Math.max(0, Math.ceil((het - Date.now()) / 1000));
      setCon(c);
      if (c === 0 && !ref.current.xong) { ref.current.xong = true; clearInterval(t); onXong({ diem: ref.current.diem, dung: ref.current.dung, tong: ref.current.tong }); }
    }, 200);
    return () => clearInterval(t);
  }, [ds, onXong]);

  const chon = useCallback((mao) => {
    if (!ds || ref.current.xong || loe) return;
    const w = ds[i % ds.length];
    const ok = w.mao === mao;
    const c = ok ? chuoi + 1 : 0;
    const them = ok ? 10 * (1 + Math.floor(c / 5)) : 0;
    ref.current = { ...ref.current, diem: ref.current.diem + them, dung: ref.current.dung + (ok ? 1 : 0), tong: ref.current.tong + 1 };
    setChuoi(c); setDiem(ref.current.diem); setDung(ref.current.dung); setTong(ref.current.tong);
    phat(ok ? (c > 0 && c % 5 === 0 ? "combo" : "dung") : "sai");
    setLoe({ ok, mao: w.mao });
    setTimeout(() => { setLoe(null); setI((x) => x + 1); }, ok ? 280 : 900);
  }, [ds, i, chuoi, loe]);

  useEffect(() => {
    const k = (e) => { if (e.key === "ArrowLeft" || e.key === "1") chon("le"); if (e.key === "ArrowRight" || e.key === "2") chon("la"); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [chon]);

  if (!ds) return <Dang chu={tr("Đang chuẩn bị từ…", "Préparation…", "Preparing…")} />;
  if (ds.length < 10) return <TrongKho />;
  const w = ds[i % ds.length];
  const sau = ds[(i + 1) % ds.length];
  const nhan = 1 + Math.floor(chuoi / 5);
  return <TheVuot w={w} sau={sau} loe={loe} chon={chon} con={con} GIAY={GIAY} diem={diem} nhan={nhan} dung={dung} tong={tong} />;
}

/* Le hay La: VUỐT thẻ sang trái (le) hoặc phải (la), như xếp bài vào hai chồng. */
function TheVuot({ w, sau, loe, chon, con, GIAY, diem, nhan, dung, tong }) {
  const [dx, setDx] = useState(0);
  const keo = useRef(null);
  useEffect(() => { setDx(0); }, [w]);
  const xuong = (e) => { if (loe) return; keo.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); };
  const di = (e) => { if (keo.current != null) setDx(e.clientX - keo.current); };
  const len = () => { if (keo.current == null) return; keo.current = null; if (Math.abs(dx) > 80) chon(dx < 0 ? "le" : "la"); else setDx(0); };
  const lech = loe ? (loe.mao === "le" ? -420 : 420) * (loe.ok ? 1 : 0) : dx;
  return (
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-500/15 via-transparent to-pink-500/15 p-5">
      <div className="flex items-center justify-between">
        <span className="relative grid h-14 w-14 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90"><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" className="stroke-line" /><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" className={con <= 10 ? "stroke-danger" : "stroke-primary"} strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - con / GIAY)} /></svg>
          <span className={`text-sm font-extrabold tabular-nums ${con <= 10 ? "text-danger" : "text-ink"}`}>{con}</span>
        </span>
        <span className="text-center"><span className="block text-3xl font-extrabold tabular-nums text-ink">{diem}</span>{nhan > 1 && <span className="rounded-full bg-warn px-2 py-0.5 text-xs font-extrabold text-white">COMBO ×{nhan}</span>}</span>
        <span className="text-sm font-bold text-soft">{dung}/{tong}</span>
      </div>
      <div className="relative mt-6 grid h-[300px] grid-cols-[64px_1fr_64px] items-center gap-2 sm:grid-cols-[96px_1fr_96px]">
        <button type="button" onClick={() => chon("le")} className={`h-full cursor-pointer rounded-3xl border-2 border-dashed border-sky-500 bg-sky-500/10 font-sans text-sky-600 transition-transform ${dx < -40 ? "scale-105 bg-sky-500/25" : ""}`}>
          <span lang="fr" className="block text-2xl font-extrabold">le</span><span className="block text-[10px] font-bold uppercase">{tr("đực", "masc.", "masc.")}</span>
        </button>
        <div className="relative h-[260px] touch-none select-none">
          <div className="absolute inset-x-4 top-3 bottom-0 rounded-3xl bg-surface opacity-60 shadow" aria-hidden>
            <p lang="fr" className="m-0 mt-24 text-center text-2xl font-extrabold text-soft">{sau.tu}</p>
          </div>
          <div onPointerDown={xuong} onPointerMove={di} onPointerUp={len} onPointerCancel={len}
            className={`absolute inset-0 flex cursor-grab flex-col items-center justify-center rounded-3xl bg-surface shadow-[0_18px_40px_rgba(0,0,0,0.15)] active:cursor-grabbing ${loe && !loe.ok ? "mcf-rung ring-4 ring-danger" : ""}`}
            style={{ transform: `translateX(${lech}px) rotate(${lech / 18}deg)`, transition: keo.current != null ? "none" : "transform .28s cubic-bezier(.22,1,.36,1)" }}>
            <span className={`absolute left-4 top-4 rounded-lg border-4 border-solid border-sky-500 px-2 text-xl font-extrabold text-sky-500 transition-opacity ${dx < -30 ? "opacity-100" : "opacity-0"}`} lang="fr">LE</span>
            <span className={`absolute right-4 top-4 rounded-lg border-4 border-solid border-pink-500 px-2 text-xl font-extrabold text-pink-500 transition-opacity ${dx > 30 ? "opacity-100" : "opacity-0"}`} lang="fr">LA</span>
            <p lang="fr" className="m-0 px-3 text-center text-4xl font-extrabold text-ink sm:text-5xl">
              {loe && <span className={loe.mao === "le" ? "text-sky-500" : "text-pink-500"}>{loe.mao} </span>}{w.tu}
            </p>
            <p className="m-0 mt-2 text-sm text-soft">{w.vi}</p>
          </div>
        </div>
        <button type="button" onClick={() => chon("la")} className={`h-full cursor-pointer rounded-3xl border-2 border-dashed border-pink-500 bg-pink-500/10 font-sans text-pink-600 transition-transform ${dx > 40 ? "scale-105 bg-pink-500/25" : ""}`}>
          <span lang="fr" className="block text-2xl font-extrabold">la</span><span className="block text-[10px] font-bold uppercase">{tr("cái", "fém.", "fem.")}</span>
        </button>
      </div>
      <p className="m-0 mt-4 text-center text-xs text-soft">{tr("Vuốt thẻ sang trái (le) hoặc phải (la). Phím ← →.", "Glissez la carte à gauche (le) ou à droite (la). Touches ← →.", "Swipe left (le) or right (la). Keys ← →.")}</p>
    </div>
  );
}

/* ─────────── 2. Nghe và chọn ─────────── */
function NgheChon({ cap, onXong }) {
  const SO = 10;
  const [kho, setKho] = useState(null);
  const [i, setI] = useState(0);
  const [pa, setPa] = useState([]);
  const [chon, setChon] = useState(null);
  const [diem, setDiem] = useState(0);
  const [dung, setDung] = useState(0);
  const batDau = useRef(0);
  const am = useRef(null);

  useEffect(() => { docCauNghe(cap).then(setKho, () => setKho([])); }, [cap]);
  const cau = kho?.[i];
  const nghe = useCallback(() => { if (!cau) return; am.current?.pause(); am.current = new Audio(cau.audio_url); am.current.play().catch(() => {}); }, [cau]);
  useEffect(() => {
    if (!cau || !kho) return;
    setPa(phuongAnCau(cau, kho)); setChon(null); batDau.current = Date.now();
    const t = setTimeout(nghe, 250);
    return () => { clearTimeout(t); am.current?.pause(); };
  }, [cau, kho, nghe]);

  if (!kho) return <Dang chu={tr("Đang tải audio…", "Chargement de l'audio…", "Loading audio…")} />;
  if (kho.length < SO + 3) return <TrongKho />;

  const tra = (x) => {
    if (chon) return;
    const ok = x === cau.cau;
    const giay = (Date.now() - batDau.current) / 1000;
    const them = ok ? 100 + Math.max(0, Math.round(50 - giay * 5)) : 0;
    setChon(x); phat(ok ? "dung" : "sai");
    const d = diem + them, s = dung + (ok ? 1 : 0);
    setDiem(d); setDung(s);
    setTimeout(() => { if (i + 1 >= SO) onXong({ diem: d, dung: s, tong: SO }); else setI(i + 1); }, ok ? 700 : 1600);
  };
  /* Đài radio cũ: mặt loa + vạch dò sóng, bốn phương án là bốn KÊNH. Chọn kênh
     đúng thì kim dò nhảy tới đó. Nền tối cố ý, màu viết thẳng (không đảo theo bản sáng). */
  const KENH = ["88.4", "94.2", "101.7", "106.9"];
  const kimTai = chon ? pa.indexOf(cau.cau) : -1;
  return (
    <div className="mt-6 rounded-[2rem] bg-[#2b1d14] p-5 text-[#f6e7c8] shadow-[inset_0_2px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#d9b98a]">
        <span>Radio Léon · {i + 1}/{SO}</span>
        <span className="tabular-nums text-[#ffd27a]">{diem} pts</span>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-[#1a120c] p-4">
        <button type="button" onClick={nghe} aria-label={tr("Nghe lại", "Réécouter", "Replay")}
          className="grid h-20 w-20 shrink-0 cursor-pointer place-items-center rounded-full border-4 border-solid border-[#6b4a2f] bg-[radial-gradient(circle,#4a3322_2px,transparent_2.5px)] bg-[length:8px_8px] text-[#ffd27a] active:scale-[0.94]">
          <Volume2 size={30} />
        </button>
        <div className="flex h-14 flex-1 items-end gap-1" aria-hidden>
          {Array.from({ length: 18 }, (_, k) => <span key={k} className="mcf-song w-full rounded-t bg-[#ffb347]" style={{ height: `${30 + ((k * 37) % 70)}%`, animationDelay: `${(k % 6) * 0.12}s` }} />)}
        </div>
      </div>
      <div className="relative mt-4 h-8 rounded-lg bg-[#f3e3c3] px-3" aria-hidden>
        <div className="flex h-full items-center justify-between font-mono text-[10px] text-[#6b4a2f]">{KENH.map((k) => <span key={k}>{k}</span>)}</div>
        <span className="absolute top-0 h-full w-1 rounded bg-red-600 transition-[left] duration-500" style={{ left: kimTai < 0 ? "50%" : `${8 + kimTai * 28}%` }} />
      </div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {pa.map((x, k) => {
          const laDung = chon && x === cau.cau, laSai = chon === x && x !== cau.cau;
          return (
            <button key={x} type="button" onClick={() => tra(x)} lang="fr"
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 border-solid px-3 py-3 text-left font-sans text-sm transition-colors duration-150 ${laDung ? "border-[#7bd88f] bg-[#1f3a26] text-white" : laSai ? "border-[#ff6b6b] bg-[#45201f] text-white" : "border-[#6b4a2f] bg-[#3a281b] text-[#f6e7c8] hover:border-[#ffb347]"}`}>
              <span className="shrink-0 rounded bg-[#ffb347] px-1.5 font-mono text-[10px] font-bold text-[#2b1d14]">FM {KENH[k]}</span>
              <span>{x}</span>
            </button>
          );
        })}
      </div>
      {chon && <p className="m-0 mt-3 text-center text-sm text-[#d9b98a]">{cau.nghia}</p>}
    </div>
  );
}

/* ─────────── 3. Mưa chữ ─────────── */
function MuaChu({ cap, onXong }) {
  const [du, setDu] = useState(null);             // { kho, tatCa }
  const [roi, setRoi] = useState([]);              // [{ id, tu, x, y }]
  const [mang, setMang] = useState(3);
  const [diem, setDiem] = useState(0);
  const [pa, setPa] = useState([]);
  const [nhay, setNhay] = useState(null);
  const s = useRef({ roi: [], mang: 3, diem: 0, dung: 0, tong: 0, k: 0, sinh: 0, tocDo: 0.045, het: false, khoaPa: null });

  useEffect(() => { docMuaChu(cap).then(setDu, () => setDu({ kho: [], tatCa: [] })); }, [cap]);

  const duoiCung = () => s.current.roi.reduce((a, b) => (!a || b.y > a.y ? b : a), null);
  const datPa = () => {
    const d = duoiCung();
    if (d && d.id !== s.current.khoaPa) { s.current.khoaPa = d.id; setPa(phuongAnNghia(d.tu, du.tatCa)); }
    if (!d) { s.current.khoaPa = null; setPa([]); }
  };

  useEffect(() => {
    if (!du?.kho?.length) return;
    let raf, truoc = performance.now();
    const vong = (now) => {
      const st = s.current; if (st.het) return;
      const dt = Math.min(50, now - truoc); truoc = now;
      st.sinh -= dt;
      if (st.sinh <= 0 && st.roi.length < 4) {
        const tu = du.kho[st.k++ % du.kho.length];
        st.roi.push({ id: st.k, tu, x: 8 + Math.random() * 64, y: -6 });
        st.sinh = Math.max(900, 2600 - st.dung * 60);
      }
      st.tocDo = 0.045 + st.dung * 0.0015;
      let mat = false;
      st.roi = st.roi.filter((w) => { w.y += st.tocDo * dt / 10; if (w.y >= 92) { mat = true; st.tong++; return false; } return true; });
      if (mat) { st.mang--; setMang(st.mang); phat("sai"); }
      setRoi(st.roi.map((w) => ({ ...w })));
      datPa();
      if (st.mang <= 0) { st.het = true; onXong({ diem: st.diem, dung: st.dung, tong: Math.max(1, st.tong) }); return; }
      raf = requestAnimationFrame(vong);
    };
    raf = requestAnimationFrame(vong);
    return () => { cancelAnimationFrame(raf); };
  }, [du]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!du) return <Dang chu={tr("Đang chuẩn bị từ…", "Préparation…", "Preparing…")} />;
  if (du.kho.length < 10) return <TrongKho />;

  const tra = (vi) => {
    const st = s.current; const d = duoiCung(); if (!d || st.het) return;
    st.tong++;
    if (vi === d.tu.vi) {
      st.dung++; st.diem += 10 + Math.round(d.y / 4);
      st.roi = st.roi.filter((w) => w.id !== d.id);
      setDiem(st.diem); setNhay({ id: d.id, ok: true }); phat("ghep");
    } else {
      st.mang--; setMang(st.mang); setNhay({ id: d.id, ok: false }); phat("sai");
      if (st.mang <= 0) { st.het = true; onXong({ diem: st.diem, dung: st.dung, tong: st.tong }); return; }
    }
    st.khoaPa = null; datPa();
    setTimeout(() => setNhay(null), 300);
  };
  const dichId = duoiCung()?.id;
  return (
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-[#0b1530] shadow-[0_20px_40px_rgba(11,21,48,0.35)]">
      <div className="relative h-[360px] overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#1e3a8a_0,transparent_45%),radial-gradient(circle_at_80%_0,#155e75_0,transparent_40%)]">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 text-sm font-bold text-white">
          <span className="flex gap-1">{[0, 1, 2].map((k) => <Heart key={k} size={18} className={k < mang ? "fill-rose-400 text-rose-400" : "text-white/25"} />)}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 tabular-nums">{diem}</span>
        </div>
        {roi.map((w) => (
          <span key={w.id} lang="fr"
            className={`absolute whitespace-nowrap rounded-b-full rounded-t-[60%] px-3 pb-2 pt-3 text-sm font-extrabold ${w.id === dichId ? "bg-cyan-300 text-[#0b1530] shadow-[0_0_24px_rgba(103,232,249,0.8)]" : "bg-white/15 text-white backdrop-blur"} ${nhay?.id === w.id && !nhay.ok ? "!bg-rose-500 text-white" : ""}`}
            style={{ left: `${w.x}%`, top: `${w.y}%` }}>
            {w.tu.fr}
          </span>
        ))}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[8%] bg-[repeating-linear-gradient(90deg,#0e7490_0_18px,#155e75_18px_36px)] opacity-80" />
      </div>
      <div className="grid grid-cols-2 gap-2 bg-[#0f1d40] p-3">
        {pa.map((vi) => (
          <button key={vi} type="button" onClick={() => tra(vi)}
            className="cursor-pointer rounded-xl border border-solid border-cyan-300/30 bg-white/5 px-3 py-3 font-sans text-sm font-bold text-white transition-colors duration-150 hover:bg-cyan-300/20 active:scale-[0.97]">
            {vi}
          </button>
        ))}
      </div>
      <p className="m-0 bg-[#0f1d40] pb-3 text-center text-xs text-cyan-100/70">{tr("Bắn giọt đang sáng (thấp nhất) bằng nghĩa đúng trước khi nó chạm đất.", "Touchez le sens de la goutte lumineuse avant qu'elle tombe.", "Hit the glowing drop's meaning before it lands.")}</p>
    </div>
  );
}

/* ─────────── Đồng hồ đếm ngược dùng chung (neo vào mốc kết thúc thật) ─────────── */
function useDemNguoc(giay, chay, onHet) {
  const [con, setCon] = useState(giay);
  const het = useRef(false);
  useEffect(() => {
    if (!chay) return;
    const moc = Date.now() + giay * 1000;
    const t = setInterval(() => {
      const c = Math.max(0, Math.ceil((moc - Date.now()) / 1000));
      setCon(c);
      if (c === 0 && !het.current) { het.current = true; clearInterval(t); onHet(); }
    }, 200);
    return () => clearInterval(t);
  }, [chay]); // eslint-disable-line react-hooks/exhaustive-deps
  return [con, het];
}

/* ─────────── 4. Xếp câu tốc độ ─────────── */
function XepCau({ cap, onXong }) {
  const GIAY = 90;
  const [ds, setDs] = useState(null);
  const [i, setI] = useState(0);
  const [chon, setChon] = useState([]);          // chỉ số mảnh đã chạm, theo thứ tự
  const [loe, setLoe] = useState(null);          // "dung" | "sai"
  const kq = useRef({ diem: 0, dung: 0, tong: 0 });
  const [, ve] = useState(0);
  useEffect(() => { docXepCau(cap).then(setDs, () => setDs([])); }, [cap]);
  const [con, het] = useDemNguoc(GIAY, !!ds?.length, () => onXong({ ...kq.current, tong: Math.max(1, kq.current.tong) }));
  const cau = ds?.[i % (ds?.length || 1)];
  const manh = React.useMemo(() => (cau ? tron(cau.tu.map((w, k) => ({ w, k }))) : []), [cau]);

  if (!ds) return <Dang chu={tr("Đang chuẩn bị câu…", "Préparation…", "Preparing…")} />;
  if (ds.length < 5) return <TrongKho />;

  const bam = (j) => {
    if (loe || het.current || chon.includes(j)) return;
    const moi = [...chon, j];
    phat("bam");
    setChon(moi);
    if (moi.length === manh.length) {
      const cauRa = moi.map((x) => manh[x].w).join(" ");
      const ok = cauRa === cau.tu.join(" ");
      kq.current.tong++;
      if (ok) { kq.current.dung++; kq.current.diem += 20 + cau.tu.length * 5; }
      ve((x) => x + 1); setLoe(ok ? "dung" : "sai"); phat(ok ? "dung" : "sai");
      setTimeout(() => { setLoe(null); setChon([]); setI((x) => x + 1); }, ok ? 600 : 1800);
    }
  };
  const go = () => { if (!loe && chon.length) setChon(chon.slice(0, -1)); };
  return (
    /* Ga tàu: mỗi từ là một TOA, chạm để móc vào sau đầu máy. Đủ toa đúng thứ tự
       thì đoàn tàu chạy khỏi ga. */
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-b from-orange-100 to-amber-50 p-5 dark:from-orange-950/40 dark:to-amber-950/20">
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-[#1f2937] px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-amber-300">{String(Math.floor(con / 60)).padStart(2, "0")}:{String(con % 60).padStart(2, "0")}</span>
        <span className="text-sm font-bold text-soft">🚉 {kq.current.dung}/{kq.current.tong}</span>
        <span className="rounded-lg bg-[#1f2937] px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-amber-300">{kq.current.diem}</span>
      </div>
      <p className="m-0 mt-5 text-center text-sm font-bold text-ink">🎯 {cau.goiY}</p>
      <div className="mt-3 overflow-x-auto no-scrollbar">
        <div className={`flex min-h-[72px] w-max min-w-full items-end gap-1 pb-3 ${loe === "dung" ? "mcf-tau-chay" : loe === "sai" ? "mcf-rung" : ""}`}>
          <span className="grid h-14 w-16 shrink-0 place-items-center rounded-l-2xl rounded-tr-lg bg-rose-600 text-2xl" aria-hidden>🚂</span>
          {chon.map((j) => (
            <span key={j} lang="fr" className={`mcf-toa-vao relative shrink-0 rounded-md px-3 py-3 text-base font-bold text-white shadow ${loe === "sai" ? "bg-danger" : "bg-orange-500"}`}>
              {manh[j].w}
              <span aria-hidden className="absolute -bottom-2 left-2 h-3 w-3 rounded-full bg-[#1f2937]" /><span aria-hidden className="absolute -bottom-2 right-2 h-3 w-3 rounded-full bg-[#1f2937]" />
            </span>
          ))}
          {chon.length === 0 && !loe && <span className="self-center pl-2 text-sm text-soft">{tr("← móc toa vào đầu máy", "← accrochez les wagons", "← hook the wagons")}</span>}
        </div>
        <div aria-hidden className="h-1.5 bg-[repeating-linear-gradient(90deg,#78350f_0_6px,transparent_6px_14px)]" />
      </div>
      {loe === "sai" && <p lang="fr" className="m-0 mt-2 text-center text-sm font-bold text-ok">{cau.tu.join(" ")}</p>}
      <p className="m-0 mt-5 text-xs font-extrabold uppercase tracking-wider text-soft">{tr("Sân ga", "Quai", "Platform")}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {manh.map((m, j) => (
          <button key={j} type="button" onClick={() => bam(j)} disabled={chon.includes(j)} lang="fr"
            className="cursor-pointer rounded-md border-2 border-solid border-orange-500 bg-surface px-4 py-2.5 font-sans text-base font-bold text-ink shadow-[0_4px_0_#c2410c] transition-[opacity,transform] duration-150 active:translate-y-1 active:shadow-none disabled:cursor-default disabled:opacity-20">
            {m.w}
          </button>
        ))}
      </div>
      <div className="mt-4 text-right">
        <button type="button" onClick={go} className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-1 font-sans text-xs font-bold text-soft underline">{tr("Tháo toa cuối", "Décrocher le dernier", "Unhook last")}</button>
      </div>
    </div>
  );
}

/* ─────────── 5. Săn lỗi sai ─────────── */
function SanLoi({ cap, onXong }) {
  const [ds, setDs] = useState(null);
  const [i, setI] = useState(0);
  const [mang, setMang] = useState(3);
  const [chon, setChon] = useState(null);         // chỉ số từ vừa chạm
  const kq = useRef({ diem: 0, dung: 0, tong: 0, mang: 3, het: false });
  const batDau = useRef(Date.now());
  useEffect(() => { docSanLoi(cap).then(setDs, () => setDs([])); }, [cap]);
  useEffect(() => { batDau.current = Date.now(); }, [i]);
  if (!ds) return <Dang chu={tr("Đang chuẩn bị câu…", "Préparation…", "Preparing…")} />;
  if (ds.length < 5) return <TrongKho />;
  const cau = ds[i % ds.length];
  const bam = (k) => {
    const st = kq.current; if (chon != null || st.het) return;
    const ok = k === cau.vt;
    st.tong++;
    if (ok) { st.dung++; st.diem += 50 + Math.max(0, Math.round(30 - (Date.now() - batDau.current) / 200)); phat("dung"); }
    else { st.mang--; setMang(st.mang); phat("sai"); }
    setChon(k);
    setTimeout(() => {
      if (st.mang <= 0) { st.het = true; onXong({ diem: st.diem, dung: st.dung, tong: st.tong }); return; }
      setChon(null); setI((x) => x + 1);
    }, ok ? 1100 : 2200);
  };
  return (
    /* Vở chấm bài: giấy kẻ dòng (màu giấy viết thẳng, không đảo bản tối), người
       chơi là giáo viên cầm bút đỏ khoanh đúng chữ sai. Ba lần khoanh nhầm là hết mực. */
    <div className="mt-6 rotate-[-0.6deg] rounded-md bg-[#fffdf5] p-0 text-[#1f2937] shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between border-0 border-b-2 border-solid border-rose-300 px-6 py-3 font-['Caveat',cursive] text-lg">
        <span className="flex items-center gap-1">{[0, 1, 2].map((k) => <span key={k} className={`h-3 w-8 rounded-full ${k < mang ? "bg-red-600" : "bg-red-200"}`} aria-hidden />)}<span className="sr-only">{mang}</span></span>
        <span className="text-sm font-bold text-[#6b7280]">{kq.current.dung}/{kq.current.tong}</span>
        <span className="rotate-[-6deg] rounded-full border-2 border-solid border-red-600 px-3 text-xl font-extrabold tabular-nums text-red-600">{kq.current.diem}</span>
      </div>
      <div className="relative px-6 pb-6 pl-14 pt-4 [background:repeating-linear-gradient(#fffdf5_0_39px,#bfdbfe_39px_40px)]">
        <span aria-hidden className="absolute bottom-0 left-10 top-0 w-0.5 bg-rose-300" />
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#6b7280]">✏️ {tr("Khoanh chữ SAI", "Entourez le mot FAUX", "Circle the WRONG word")}</p>
        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {cau.tu.map((w, k) => {
            const laLoi = chon != null && k === cau.vt, nham = chon === k && k !== cau.vt;
            return (
              <button key={k} type="button" onClick={() => bam(k)} lang="fr"
                className={`relative cursor-pointer rounded-[50%] border-2 border-solid bg-transparent px-2 py-1 font-serif text-2xl transition-colors duration-150 ${laLoi ? "border-red-600 text-[#1f2937]" : nham ? "mcf-rung border-[#9ca3af] text-[#9ca3af] line-through" : "border-transparent text-[#1f2937] hover:border-red-300"}`}>
                {laLoi ? <><s className="text-red-600">{w}</s> <span className="font-['Caveat',cursive] text-red-600">{cau.sua}</span></> : w}
              </button>
            );
          })}
        </div>
        {chon != null && <p className="m-0 mt-4 font-serif text-base text-[#374151]"><span lang="fr" className="font-bold text-green-700">✔ {cau.dung}</span>{cau.giai ? <span className="block text-sm text-[#6b7280]">{cau.giai}</span> : null}</p>}
      </div>
    </div>
  );
}

/* ─────────── 6. Đúng hay sai, 60 giây ─────────── */
function DungSai({ cap, onXong }) {
  const GIAY = 60;
  const [ds, setDs] = useState(null);
  const [i, setI] = useState(0);
  const [chuoi, setChuoi] = useState(0);
  const [loe, setLoe] = useState(null);
  const kq = useRef({ diem: 0, dung: 0, tong: 0 });
  useEffect(() => { docDungSai(cap).then(setDs, () => setDs([])); }, [cap]);
  const [con, het] = useDemNguoc(GIAY, !!ds?.length, () => onXong({ ...kq.current, tong: Math.max(1, kq.current.tong) }));
  const tra = useCallback((v) => {
    if (!ds?.length || loe || het.current) return;
    const cau = ds[i % ds.length];
    const ok = v === cau.dung;
    const c = ok ? chuoi + 1 : 0;
    kq.current.tong++;
    if (ok) { kq.current.dung++; kq.current.diem += 10 * (1 + Math.floor(c / 5)); }
    setChuoi(c); setLoe({ ok, cau }); phat(ok ? (c > 0 && c % 5 === 0 ? "combo" : "dung") : "sai");
    setTimeout(() => { setLoe(null); setI((x) => x + 1); }, ok ? 350 : 1600);
  }, [ds, i, chuoi, loe, het]);
  useEffect(() => {
    const k = (e) => { if (e.key === "ArrowLeft") tra(true); if (e.key === "ArrowRight") tra(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [tra]);
  if (!ds) return <Dang chu={tr("Đang chuẩn bị câu…", "Préparation…", "Preparing…")} />;
  if (ds.length < 10) return <TrongKho />;
  const cau = ds[i % ds.length];
  const nhan = 1 + Math.floor(chuoi / 5);
  return (
    /* Bàn thẩm phán: tờ hồ sơ trên mặt gỗ, hai con dấu. Phán xong thì dấu THẬT
       (theo đáp án) đập lên hồ sơ; phán sai thì tờ giấy rung. */
    <div className="mt-6 rounded-[2rem] bg-[#5b3a29] bg-[linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[length:46px_100%] p-5">
      <div className="flex items-center justify-between text-sm font-bold text-[#fde7c7]">
        <span className={`rounded-full bg-black/25 px-3 py-1 tabular-nums ${con <= 10 ? "text-red-300" : ""}`}>⚖️ {con}s</span>
        <span>{kq.current.dung}/{kq.current.tong}{nhan > 1 && <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-[#3b2417]">×{nhan}</span>}</span>
        <span className="rounded-full bg-black/25 px-3 py-1 tabular-nums">{kq.current.diem}</span>
      </div>
      <div className={`relative mx-auto mt-5 max-w-xl rounded-sm bg-[#fbf6ea] px-6 pb-8 pt-5 text-[#1f2937] shadow-[0_14px_30px_rgba(0,0,0,0.35)] ${loe && !loe.ok ? "mcf-rung" : ""}`}>
        <p className="m-0 border-0 border-b border-dashed border-[#c8b89a] pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8a6d4b]">
          {tr("Hồ sơ", "Dossier", "Case")} #{String(i + 1).padStart(3, "0")} · {cau.kieu === "sua" ? tr("câu này viết đúng chưa?", "phrase correcte ?", "correct sentence?") : tr("đúng hay sai?", "vrai ou faux ?", "true or false?")}
        </p>
        <p lang={cau.kieu === "sua" ? "fr" : undefined} className="m-0 mt-5 font-serif text-2xl leading-snug">{cau.cau}</p>
        {loe && !loe.ok && loe.cau.giai && <p className="m-0 mt-3 text-sm text-[#6b5a45]">{loe.cau.giai}</p>}
        {loe && <span className={`mcf-dong absolute bottom-3 right-4 rounded-md border-4 border-double px-3 py-1 font-mono text-2xl font-black tracking-widest ${loe.cau.dung ? "border-green-700 text-green-700" : "border-red-700 text-red-700"}`}>{loe.cau.dung ? "VRAI" : "FAUX"}</span>}
      </div>
      <div className="mt-6 flex justify-center gap-8">
        {[[true, "VRAI", "bg-green-700", tr("đúng", "vrai", "true")], [false, "FAUX", "bg-red-700", tr("sai", "faux", "false")]].map(([v, nhanDau, nen, mo]) => (
          <button key={nhanDau} type="button" onClick={() => tra(v)} className="group flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 font-sans">
            <span aria-hidden className="h-10 w-8 rounded-t-xl bg-[#2b1a10] transition-transform group-active:translate-y-2" />
            <span className={`grid h-14 w-32 place-items-center rounded-lg ${nen} font-mono text-xl font-black tracking-widest text-white shadow-[0_6px_0_rgba(0,0,0,0.35)] transition-transform group-active:translate-y-2 group-active:shadow-none`}>{nhanDau}</span>
            <span className="mt-2 text-xs font-bold text-[#fde7c7]">{mo}</span>
          </button>
        ))}
      </div>
      <p className="m-0 mt-3 text-center text-xs text-[#e7cfae]">{tr("Phím tắt: ← đúng · → sai", "Raccourcis : ← vrai · → faux", "Shortcuts: ← true · → false")}</p>
    </div>
  );
}

/* Câu hỏi trắc nghiệm dùng chung cho Thám tử, Đố vui, Phiêu lưu: pa[0] là đáp án đúng,
   xáo một lần cho mỗi câu. */
/* kieu: "manh" = mảnh giấy ghim (Thám tử) · "tv" = bốn ô màu A–D (Đố vui)
   · "thoai" = bong bóng lời thoại của người chơi (Phiêu lưu). */
const MAU_TV = ["bg-rose-500", "bg-sky-500", "bg-amber-500", "bg-emerald-500"];
function CauTracNghiem({ pa, onTra, daChon, laPhap, kieu }) {
  const thuTu = React.useMemo(() => tron(pa.map((x, k) => ({ x, k }))), [pa]);
  const lang = laPhap ? "fr" : undefined;
  if (kieu === "tv") return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {thuTu.map(({ x, k }, j) => {
        const dung = daChon != null && k === 0, mo = daChon != null && !dung;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={lang}
            className={`flex min-h-[72px] cursor-pointer items-center gap-3 rounded-xl border-0 ${MAU_TV[j]} px-4 py-3 text-left font-sans text-base font-bold text-white shadow-[0_5px_0_rgba(0,0,0,0.25)] transition-[opacity,transform] duration-200 active:translate-y-1 active:shadow-none ${dung ? "scale-[1.03] ring-4 ring-white" : ""} ${mo ? "opacity-30" : ""}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black/20 text-sm">{"ABCD"[j]}</span>{x}
          </button>
        );
      })}
    </div>
  );
  if (kieu === "manh") return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {thuTu.map(({ x, k }, j) => {
        const dung = daChon != null && k === 0, sai = daChon === k && k !== 0;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={lang} style={{ rotate: `${[-1.5, 1.2, 0.8, -1][j % 4]}deg` }}
            className={`relative cursor-pointer border-0 bg-[#fef9c3] px-4 pb-3 pt-5 text-left font-sans text-sm text-[#1f2937] shadow-[0_6px_14px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02] ${sai ? "mcf-rung opacity-60" : ""}`}>
            <span aria-hidden className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 shadow" />
            {x}
            {dung && <span className="mcf-dong absolute -right-2 -top-3 rounded border-2 border-solid border-green-700 bg-[#fef9c3] px-1.5 text-[11px] font-black text-green-700">{tr("CHỨNG CỨ", "PREUVE", "PROOF")}</span>}
          </button>
        );
      })}
    </div>
  );
  return (
    <div className="mt-4 flex flex-col items-end gap-2.5">
      {thuTu.map(({ x, k }) => {
        const dung = daChon != null && k === 0, sai = daChon === k && k !== 0;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={lang}
            className={`max-w-[90%] cursor-pointer rounded-3xl rounded-br-md border-2 border-solid px-4 py-2.5 text-left font-sans text-base transition-colors duration-150 ${dung ? "border-ok bg-ok text-white" : sai ? "border-danger bg-danger-soft text-ink line-through" : "border-orange-300 bg-surface text-ink hover:bg-orange-50 dark:hover:bg-orange-950/30"}`}>
            {x}
          </button>
        );
      })}
    </div>
  );
}
const Tim = ({ mang }) => <span className="flex gap-1">{[0, 1, 2].map((k) => <Heart key={k} size={18} className={k < mang ? "fill-danger text-danger" : "text-line"} />)}</span>;
const capPhu = (cap) => (x) => !cap || x.cap === cap;

/* ─────────── 7. Chép chính tả tốc độ ─────────── */
function ChepNhanh({ cap, onXong }) {
  const SO = 5;
  const [kho, setKho] = useState(null);
  const [i, setI] = useState(0);
  const [go, setGo] = useState("");
  const [kq, setKq] = useState(null);
  const tong = useRef({ diem: 0, dung: 0 });
  const batDau = useRef(Date.now());
  const am = useRef(null);
  const o = useRef(null);
  useEffect(() => { docCauNghe(cap, ["chinh_ta"]).then((d) => setKho(d ? d.filter((c) => c.cau.length <= 90) : []), () => setKho([])); }, [cap]);
  const cau = kho?.[i];
  const nghe = useCallback(() => { if (!cau) return; am.current?.pause(); am.current = new Audio(cau.audio_url); am.current.play().catch(() => {}); }, [cau]);
  useEffect(() => { if (!cau) return; setGo(""); setKq(null); batDau.current = Date.now(); const t = setTimeout(() => { nghe(); o.current?.focus(); }, 300); return () => { clearTimeout(t); am.current?.pause(); }; }, [cau, nghe]);
  if (!kho) return <Dang chu={tr("Đang tải audio…", "Chargement de l'audio…", "Loading audio…")} />;
  if (kho.length < SO) return <TrongKho />;
  const nop = () => {
    if (kq || !go.trim()) return;
    const r = soCau(cau.cau, go, { dau: true });
    const giay = (Date.now() - batDau.current) / 1000;
    const them = Math.round(r.diem * 100) + (r.diem >= 0.8 ? Math.max(0, Math.round(40 - giay)) : 0);
    tong.current.diem += them; if (r.diem >= 0.8) tong.current.dung++;
    setKq({ ...r, them }); phat(r.diem >= 0.8 ? "dung" : "sai");
  };
  const tiep = () => { if (i + 1 >= SO) onXong({ diem: tong.current.diem, dung: tong.current.dung, tong: SO }); else setI(i + 1); };
  return (
    /* Máy đánh chữ: tờ giấy cắm trên trục, chữ gõ hiện kiểu đánh máy; chấm xong
       giáo viên sửa bằng mực màu ngay dưới dòng. */
    <div className="mt-6 rounded-[2rem] bg-[#2d2a32] px-4 pb-5 pt-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
      <div className="mx-auto h-3 w-[85%] rounded-full bg-[#9ca3af]" aria-hidden />
      <div className="mx-auto -mt-1 w-[78%] rounded-b-sm bg-[#fdfbf5] px-5 pb-5 pt-6 font-mono text-[#1f2937] shadow-inner" onClick={() => o.current?.focus()}>
        <div className="flex justify-between text-[11px] uppercase tracking-widest text-[#9ca3af]"><span>{tr("Bài chép", "Dictée", "Dictation")} {i + 1}/{SO} · {cau.cap}</span><span className="tabular-nums">{tong.current.diem} pts</span></div>
        <input ref={o} lang="fr" value={go} onChange={(e) => setGo(e.target.value)} disabled={!!kq}
          onKeyDown={(e) => { if (e.key === "Enter") (kq ? tiep() : nop()); }}
          placeholder={tr("gõ câu bạn nghe…", "tapez ce que vous entendez…", "type what you hear…")}
          className="mt-4 w-full border-0 border-b border-dashed border-[#d1d5db] bg-transparent py-2 font-mono text-lg text-[#111] caret-red-600 outline-none placeholder:text-[#b0b0b0]" />
        {kq && (
          <div className="mt-3">
            <p lang="fr" className="m-0 flex flex-wrap gap-x-2 text-base">
              {kq.tu.map((t, k) => <span key={k} className={t.khop === "dung" ? "text-green-700" : t.khop === "sai_dau" ? "text-amber-600" : "text-red-600 underline decoration-wavy"}>{t.goc}</span>)}
            </p>
            <p className="m-0 mt-2 font-sans text-sm text-[#6b7280]">{cau.nghia} · <strong className="text-[#111]">+{kq.them}</strong></p>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button type="button" onClick={nghe} aria-label={tr("Nghe lại", "Réécouter", "Replay")}
          className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border-2 border-solid border-[#4b4652] bg-[#1c1a20] text-[#e5e7eb] shadow-[0_4px_0_#111] active:translate-y-1 active:shadow-none"><Volume2 size={20} /></button>
        <button type="button" onClick={kq ? tiep : nop}
          className="h-12 cursor-pointer rounded-full border-2 border-solid border-[#4b4652] bg-[#1c1a20] px-8 font-mono text-sm font-bold uppercase tracking-widest text-[#e5e7eb] shadow-[0_4px_0_#111] active:translate-y-1 active:shadow-none">
          {kq ? (i + 1 >= SO ? tr("Kết quả", "Résultat", "Result") : tr("Câu tiếp ↵", "Suivante ↵", "Next ↵")) : tr("Chấm ↵", "Valider ↵", "Check ↵")}
        </button>
      </div>
    </div>
  );
}

/* ─────────── 8. Nói để mở cửa (dùng PhatAm + Edge Function cham-phat-am) ─────────── */
function NoiMoKhoa({ cap, onXong }) {
  const SO = 3;
  const [kho, setKho] = useState(null);
  const [i, setI] = useState(0);
  const [mo, setMo] = useState([]);              // điểm từng cửa đã thử
  useEffect(() => { docCauNghe(cap, ["phat_am"]).then((d) => setKho(d ? d.filter((c) => c.cau.length <= 70) : []), () => setKho([])); }, [cap]);
  if (!kho) return <Dang chu={tr("Đang chuẩn bị cửa…", "Préparation…", "Preparing…")} />;
  if (kho.length < SO) return <TrongKho />;
  const cau = kho[i];
  const xongCua = (diem) => {
    const ds = [...mo, diem]; setMo(ds);
    setTimeout(() => {
      if (ds.length >= SO) onXong({ diem: Math.round(ds.reduce((a, b) => a + b, 0) * 100), dung: ds.filter((d) => d >= 0.7).length, tong: SO });
      else setI(i + 1);
    }, 2200);
  };
  return (
    /* Hành lang lâu đài: ba cánh cửa vòm bằng gỗ, câu thần chú khắc trên tấm đá.
       Đọc đúng ≥70% thì cửa hé ra ánh sáng. Màu đá/gỗ viết thẳng (không đảo theo bản sáng). */
    <div className="mt-6 rounded-[2rem] bg-[#1c1917] bg-[linear-gradient(#292524_2px,transparent_2px),linear-gradient(90deg,#292524_2px,transparent_2px)] bg-[length:60px_30px] p-5">
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {Array.from({ length: SO }, (_, k) => {
          const d = mo[k]; const mo_ = d != null && d >= 0.7, hong = d != null && d < 0.7, dangO = d == null && k === i;
          return (
            <span key={k} className={`relative grid h-28 w-20 place-items-center overflow-hidden rounded-t-full border-4 border-solid ${dangO ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.45)]" : "border-[#44403c]"} ${mo_ ? "bg-amber-200" : "bg-[#78350f]"}`}>
              {!mo_ && <span aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_18px,rgba(0,0,0,0.25)_18px_20px)]" />}
              {mo_ ? <DoorOpen size={30} className="relative text-amber-700" /> : <DoorClosed size={30} className={`relative ${hong ? "text-red-400" : "text-amber-300/80"}`} />}
              <span className="absolute bottom-1 text-[10px] font-extrabold text-white/80">{["I", "II", "III"][k]}</span>
            </span>
          );
        })}
      </div>
      <div className="mx-auto mt-6 max-w-xl rounded-xl border-2 border-solid border-[#57534e] bg-[#44403c] px-5 py-4 text-center shadow-inner">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-300/80">{tr(`Cửa ${i + 1}: đọc to câu thần chú`, `Porte ${i + 1} : prononcez la formule`, `Door ${i + 1}: speak the spell`)}</p>
        <p lang="fr" className="m-0 mt-2 font-serif text-2xl text-[#fef3c7]">{cau.cau}</p>
        {cau.nghia && <p className="m-0 mt-1 text-sm text-[#d6d3d1]">{cau.nghia}</p>}
      </div>
      {/* Giữ PhatAm hiện tới khi sang cửa sau để người chơi đọc được kết quả từng từ;
          chỉ lần chấm ĐẦU của mỗi cửa được tính. */}
      <div className="mx-auto mt-5 max-w-xl rounded-2xl bg-surface p-3"><PhatAm key={cau.id} cau={cau} onXong={(d) => { if (mo.length === i) xongCua(d); }} /></div>
    </div>
  );
}

/* ─────────── 9. Thám tử đọc ─────────── */
function ThamTu({ cap, onXong }) {
  const [ds] = useState(() => {
    const vb = tron(THAM_TU.filter(capPhu(cap))).slice(0, 3);
    return vb.flatMap((v) => v.hoi.map((h) => ({ v, h })));
  });
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const kq = useRef({ diem: 0, dung: 0 });
  if (ds.length < 2) return <TrongKho />;
  const { v, h } = ds[i];
  const tra = (k) => {
    if (chon != null) return;
    setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
    if (ok) { kq.current.dung++; kq.current.diem += 100; }
    setTimeout(() => { setChon(null); if (i + 1 >= ds.length) onXong({ ...kq.current, tong: ds.length }); else setI(i + 1); }, ok ? 800 : 1800);
  };
  return (
    /* Bảng điều tra: tập hồ sơ màu bìa giấy trên bảng ghim, câu hỏi là « câu hỏi
       của thanh tra », phương án là mảnh giấy ghim. */
    <div className="mt-6 rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest text-[#e7dcc8]">
        <span>🔎 {tr("Vụ", "Affaire", "Case")} {i + 1}/{ds.length}</span><span>{v.cap}</span><span className="tabular-nums">{kq.current.diem} pts</span>
      </div>
      <div className="relative mt-4 rounded-sm bg-[#e8d3a5] p-5 pt-7 text-[#2b2118] shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
        <span aria-hidden className="absolute -top-3 left-6 rounded-t-lg bg-[#e8d3a5] px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#7c5c2e]">{tr("Hồ sơ mật", "Confidentiel", "Classified")}</span>
        <p className="m-0 flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-wider text-[#7c5c2e]"><Search size={13} /> {v.tieuDe}</p>
        <p lang="fr" className="m-0 mt-2 bg-[#fffaf0] p-4 font-serif text-base leading-relaxed text-[#1f2937]">{v.van}</p>
      </div>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 font-mono text-base font-bold text-[#fef3c7]">❓ {h.q}</p>
      <CauTracNghiem key={i} pa={h.pa} onTra={tra} daChon={chon} laPhap kieu="manh" />
    </div>
  );
}

/* ─────────── 10. Đố vui nước Pháp ─────────── */
function DoVui({ onXong }) {
  const SO = 10;
  const [ds] = useState(() => tron(DO_VUI).slice(0, SO));
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const kq = useRef({ diem: 0, dung: 0 });
  const batDau = useRef(Date.now());
  useEffect(() => { batDau.current = Date.now(); }, [i]);
  const c = ds[i];
  const tra = (k) => {
    if (chon != null) return;
    setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
    if (ok) { kq.current.dung++; kq.current.diem += 100 + Math.max(0, Math.round(50 - (Date.now() - batDau.current) / 200)); }
    setTimeout(() => { setChon(null); if (i + 1 >= SO) onXong({ ...kq.current, tong: SO }); else setI(i + 1); }, ok ? 1400 : 2400);
  };
  return (
    /* Trường quay gameshow: sân khấu tối, bảng câu hỏi phát sáng, thang câu hỏi
       bên cạnh, bốn ô màu A–D. */
    <div className="mt-6 rounded-[2rem] bg-[#140b33] bg-[radial-gradient(ellipse_at_top,#3b1d8f_0,transparent_60%)] p-5 text-white">
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: SO }, (_, k) => <span key={k} className={`h-2 flex-1 rounded-full ${k < i ? "bg-amber-400" : k === i ? "bg-white" : "bg-white/15"}`} />)}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-bold"><span className="text-white/70">{tr("Câu", "Question", "Question")} {i + 1}/{SO}</span><span className="rounded-full bg-amber-400 px-3 py-1 tabular-nums text-[#140b33]">{kq.current.diem}</span></div>
      <div className="mt-4 rounded-2xl border-2 border-solid border-violet-400/60 bg-[#22145a] px-5 py-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
        <p className="m-0 text-xl font-extrabold leading-snug">{c.q}</p>
      </div>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} kieu="tv" />
      {chon != null && <p className="m-0 mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/90">💡 {c.gt}</p>}
    </div>
  );
}

/* ─────────── 11. Phiêu lưu ở Paris ─────────── */
function PhieuLuu({ onXong }) {
  const [i, setI] = useState(0);
  const [mang, setMang] = useState(3);
  const [chon, setChon] = useState(null);
  const kq = useRef({ diem: 0, dung: 0, tong: 0, mang: 3 });
  const c = PHIEU_LUU[i];
  const tra = (k) => {
    const st = kq.current; if (chon != null) return;
    setChon(k); const ok = k === 0; st.tong++; phat(ok ? "dung" : "sai");
    if (ok) { st.dung++; st.diem += 100; } else { st.mang--; setMang(st.mang); }
    setTimeout(() => {
      setChon(null);
      if (st.mang <= 0 || i + 1 >= PHIEU_LUU.length) onXong({ diem: st.diem + (st.mang > 0 ? st.mang * 50 : 0), dung: st.dung, tong: st.tong });
      else setI(i + 1);
    }, ok ? 1200 : 2400);
  };
  return (
    /* Bản đồ Paris: đường đi chấm chấm qua từng cảnh, Leon kể tình huống, người
       chơi trả lời bằng bong bóng thoại bên phải như một cuộc nhắn tin. */
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="relative bg-[#fef3c7] px-5 pb-4 pt-4 dark:bg-amber-950/40">
        <div className="flex items-center justify-between text-sm font-bold"><Tim mang={mang} /><span className="rounded-full bg-surface px-3 py-1 tabular-nums text-ink">{kq.current.diem}</span></div>
        <div className="relative mt-4 flex items-center justify-between" aria-hidden>
          <span className="absolute inset-x-2 top-1/2 border-0 border-t-2 border-dashed border-orange-400" />
          {PHIEU_LUU.map((_, k) => <span key={k} className={`relative h-3 w-3 rounded-full ${k < i ? "bg-orange-500" : k === i ? "h-5 w-5 bg-orange-600 ring-4 ring-orange-300" : "bg-surface ring-2 ring-orange-300"}`} />)}
          <span className="relative text-lg">🗼</span>
        </div>
        <p className="m-0 mt-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300"><MapPinned size={14} /> {c.canh}</p>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Leon cam="hoi" size={56} className="shrink-0" />
          <p className="m-0 rounded-3xl rounded-tl-md bg-surface2 px-4 py-3 text-base text-ink">{c.tinh}</p>
        </div>
        <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="thoai" />
        {chon != null && <p className="m-0 mt-4 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-ink dark:bg-orange-950/30">💡 {c.gt}</p>}
      </div>
    </div>
  );
}
