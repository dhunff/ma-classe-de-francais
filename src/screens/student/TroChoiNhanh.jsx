import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Headphones, CloudRain, VenusAndMars, Play, RotateCcw, Trophy, Volume2, Loader2, Shuffle, Crosshair, Check, X, Keyboard, DoorOpen, DoorClosed, Search, Landmark, MapPinned, Swords } from "lucide-react";
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
      {[["tu", tr("Từ vựng", "Vocabulaire", "Vocabulary")], ["ng", tr("Nghe và nói", "Écoute et oral", "Listening and speaking")], ["np", tr("Ngữ pháp", "Grammaire", "Grammar")], ["dv", tr("Đọc hiểu và văn hoá", "Lecture et culture", "Reading and culture")]].map(([nhom, tenNhom]) => (
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">{den ? <Swords size={14} /> : <Trophy size={14} />} {den ? "PvP" : kl[ma] != null ? kl[ma] : "—"}</span>
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
  const nhan = 1 + Math.floor(chuoi / 5);
  return (
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={`tabular-nums ${con <= 10 ? "text-danger" : "text-ink"}`}>⏱ {con}s</span>
        <span className="text-soft">{dung}/{tong}</span>
        <span className="tabular-nums text-ink">{diem} {tr("điểm", "pts", "pts")}{nhan > 1 && <span className="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-xs text-warn">×{nhan}</span>}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface2">
        <div className="h-full w-full rounded-full bg-primary transition-transform duration-200 ease-linear" style={{ transform: `translateX(${(con / GIAY) * 100 - 100}%)` }} />
      </div>
      <div className={`mt-8 rounded-3xl px-4 py-10 text-center transition-colors duration-200 ${loe ? (loe.ok ? "bg-ok-soft" : "bg-danger-soft") : "bg-surface2"}`}>
        <p lang="fr" className="m-0 text-4xl font-extrabold text-ink sm:text-5xl">
          {loe && <span className={loe.mao === "le" ? "text-sky-600" : "text-pink-600"}>{loe.mao} </span>}{w.tu}
        </p>
        <p className="m-0 mt-2 text-sm text-soft">{w.vi}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {[["le", "bg-sky-500", tr("giống đực", "masculin", "masculine")], ["la", "bg-pink-500", tr("giống cái", "féminin", "feminine")]].map(([m, nen, mo]) => (
          <button key={m} type="button" onClick={() => chon(m)}
            className={`cursor-pointer rounded-3xl border-0 ${nen} py-6 font-sans text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition-transform duration-150 active:scale-[0.96]`}>
            <span lang="fr" className="block text-3xl font-extrabold">{m}</span>
            <span className="block text-xs font-bold text-white/85">{mo}</span>
          </button>
        ))}
      </div>
      <p className="m-0 mt-3 text-center text-xs text-soft">{tr("Phím tắt: ← le · → la", "Raccourcis : ← le · → la", "Shortcuts: ← le · → la")}</p>
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
  return (
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-soft">{tr("Câu", "Phrase", "Item")} {i + 1}/{SO}</span>
        <span className="tabular-nums text-ink">{diem} {tr("điểm", "pts", "pts")}</span>
      </div>
      <div className="mt-6 grid place-items-center">
        <button type="button" onClick={nghe} aria-label={tr("Nghe lại", "Réécouter", "Replay")}
          className="grid h-24 w-24 cursor-pointer place-items-center rounded-full border-0 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)] transition-transform active:scale-[0.94]">
          <Volume2 size={40} />
        </button>
        <p className="m-0 mt-2 text-xs text-soft">{tr("Bấm để nghe lại", "Touchez pour réécouter", "Tap to replay")}</p>
      </div>
      <div className="mt-6 grid gap-3">
        {pa.map((x) => {
          const laDung = chon && x === cau.cau, laSai = chon === x && x !== cau.cau;
          return (
            <button key={x} type="button" onClick={() => tra(x)} lang="fr"
              className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-3 text-left font-sans text-base transition-colors duration-150 ${laDung ? "border-ok bg-ok-soft text-ink" : laSai ? "border-danger bg-danger-soft text-ink" : "border-line bg-surface text-ink hover:border-primary/50"}`}>
              {x}
            </button>
          );
        })}
      </div>
      {chon && <p className="m-0 mt-3 text-center text-sm text-soft">{cau.nghia}</p>}
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
    <div className="mt-6 rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="flex gap-1">{[0, 1, 2].map((k) => <Heart key={k} size={18} className={k < mang ? "fill-danger text-danger" : "text-line"} />)}</span>
        <span className="tabular-nums text-ink">{diem} {tr("điểm", "pts", "pts")}</span>
      </div>
      <div className="relative mt-3 h-[340px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-sky-950/40 dark:to-emerald-950/30">
        {roi.map((w) => (
          <span key={w.id} lang="fr"
            className={`absolute whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-extrabold shadow-md ${w.id === dichId ? "bg-primary text-on-primary ring-4 ring-primary/25" : "bg-surface text-ink"} ${nhay?.id === w.id && !nhay.ok ? "bg-danger text-white" : ""}`}
            style={{ left: `${w.x}%`, top: `${w.y}%` }}>
            {w.tu.fr}
          </span>
        ))}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[8%] bg-emerald-400/40" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {pa.map((vi) => (
          <button key={vi} type="button" onClick={() => tra(vi)}
            className="cursor-pointer rounded-2xl border-2 border-solid border-line bg-surface px-3 py-3 font-sans text-sm font-bold text-ink transition-colors duration-150 hover:border-primary/50 active:scale-[0.97]">
            {vi}
          </button>
        ))}
      </div>
      <p className="m-0 mt-3 text-center text-xs text-soft">{tr("Chọn nghĩa của từ đang sáng (từ thấp nhất).", "Choisissez le sens du mot en surbrillance (le plus bas).", "Pick the meaning of the highlighted (lowest) word.")}</p>
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
const ThanhGio = ({ con, tong }) => (
  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface2">
    <div className="h-full w-full rounded-full bg-primary transition-transform duration-200 ease-linear" style={{ transform: `translateX(${(con / tong) * 100 - 100}%)` }} />
  </div>
);

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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={`tabular-nums ${con <= 10 ? "text-danger" : "text-ink"}`}>⏱ {con}s</span>
        <span className="text-soft">{kq.current.dung}/{kq.current.tong}</span>
        <span className="tabular-nums text-ink">{kq.current.diem} {tr("điểm", "pts", "pts")}</span>
      </div>
      <ThanhGio con={con} tong={GIAY} />
      <p className="m-0 mt-5 text-center text-sm font-bold text-soft">{cau.goiY}</p>
      <div className={`mt-3 flex min-h-[64px] flex-wrap items-center justify-center gap-2 rounded-2xl p-3 transition-colors ${loe === "dung" ? "bg-ok-soft" : loe === "sai" ? "bg-danger-soft" : "bg-surface2"}`}>
        {chon.length === 0 && !loe && <span className="text-sm text-soft">{tr("Chạm các từ bên dưới theo thứ tự…", "Touchez les mots dans l'ordre…", "Tap the words in order…")}</span>}
        {chon.map((j) => <span key={j} lang="fr" className="rounded-xl bg-surface px-3 py-1.5 text-base font-bold text-ink shadow-sm">{manh[j].w}</span>)}
      </div>
      {loe === "sai" && <p lang="fr" className="m-0 mt-2 text-center text-sm font-bold text-ok">{cau.tu.join(" ")}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {manh.map((m, j) => (
          <button key={j} type="button" onClick={() => bam(j)} disabled={chon.includes(j)} lang="fr"
            className="cursor-pointer rounded-xl border-0 bg-primary px-4 py-2.5 font-sans text-base font-bold text-on-primary shadow-sm transition-[opacity,transform] duration-150 active:scale-[0.95] disabled:cursor-default disabled:opacity-25">
            {m.w}
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button type="button" onClick={go} className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-1 font-sans text-xs font-bold text-soft underline">{tr("Xoá từ cuối", "Effacer le dernier", "Undo last")}</button>
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="flex gap-1">{[0, 1, 2].map((k) => <Heart key={k} size={18} className={k < mang ? "fill-danger text-danger" : "text-line"} />)}</span>
        <span className="text-soft">{kq.current.dung}/{kq.current.tong}</span>
        <span className="tabular-nums text-ink">{kq.current.diem} {tr("điểm", "pts", "pts")}</span>
      </div>
      <p className="m-0 mt-6 text-center text-sm font-bold text-soft">{tr("Chạm vào từ SAI trong câu", "Touchez le mot FAUX", "Tap the WRONG word")}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2 rounded-3xl bg-surface2 p-5">
        {cau.tu.map((w, k) => {
          const laLoi = chon != null && k === cau.vt, nham = chon === k && k !== cau.vt;
          return (
            <button key={k} type="button" onClick={() => bam(k)} lang="fr"
              className={`cursor-pointer rounded-xl border-2 border-solid px-3 py-2 font-sans text-lg font-bold transition-colors duration-150 ${laLoi ? "border-ok bg-ok-soft text-ink" : nham ? "border-danger bg-danger-soft text-danger" : "border-transparent bg-surface text-ink hover:border-primary/40"}`}>
              {laLoi ? <><s className="text-danger">{w}</s> <span className="text-ok">{cau.sua}</span></> : w}
            </button>
          );
        })}
      </div>
      {chon != null && <p className="m-0 mt-3 text-center text-sm text-soft"><span lang="fr" className="font-bold text-ink">{cau.dung}</span>{cau.giai ? ` · ${cau.giai}` : ""}</p>}
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className={`tabular-nums ${con <= 10 ? "text-danger" : "text-ink"}`}>⏱ {con}s</span>
        <span className="text-soft">{kq.current.dung}/{kq.current.tong}</span>
        <span className="tabular-nums text-ink">{kq.current.diem} {tr("điểm", "pts", "pts")}{nhan > 1 && <span className="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-xs text-warn">×{nhan}</span>}</span>
      </div>
      <ThanhGio con={con} tong={GIAY} />
      <p className="m-0 mt-5 text-center text-xs font-bold uppercase tracking-wider text-soft">
        {cau.kieu === "sua" ? tr("Câu này viết đúng chưa?", "Cette phrase est-elle correcte ?", "Is this sentence correct?") : tr("Đúng hay sai?", "Vrai ou faux ?", "True or false?")}
      </p>
      <div className={`mt-3 rounded-3xl px-4 py-8 text-center transition-colors duration-200 ${loe ? (loe.ok ? "bg-ok-soft" : "bg-danger-soft") : "bg-surface2"}`}>
        <p lang={cau.kieu === "sua" ? "fr" : undefined} className="m-0 text-2xl font-extrabold leading-snug text-ink">{cau.cau}</p>
        {loe && !loe.ok && loe.cau.giai && <p className="m-0 mt-3 text-sm text-soft">{loe.cau.giai}</p>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button type="button" onClick={() => tra(true)} className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border-0 bg-ok py-5 font-sans text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] active:scale-[0.96]"><Check size={24} /> {tr("Đúng", "Vrai", "True")}</button>
        <button type="button" onClick={() => tra(false)} className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border-0 bg-danger py-5 font-sans text-xl font-extrabold text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] active:scale-[0.96]"><X size={24} /> {tr("Sai", "Faux", "False")}</button>
      </div>
      <p className="m-0 mt-3 text-center text-xs text-soft">{tr("Phím tắt: ← đúng · → sai", "Raccourcis : ← vrai · → faux", "Shortcuts: ← true · → false")}</p>
    </div>
  );
}

/* Câu hỏi trắc nghiệm dùng chung cho Thám tử, Đố vui, Phiêu lưu: pa[0] là đáp án đúng,
   xáo một lần cho mỗi câu. */
function CauTracNghiem({ pa, onTra, daChon, laPhap }) {
  const thuTu = React.useMemo(() => tron(pa.map((x, k) => ({ x, k }))), [pa]);
  return (
    <div className="mt-4 grid gap-2.5">
      {thuTu.map(({ x, k }) => {
        const dung = daChon != null && k === 0, sai = daChon === k && k !== 0;
        return (
          <button key={k} type="button" onClick={() => onTra(k)} lang={laPhap ? "fr" : undefined}
            className={`cursor-pointer rounded-2xl border-2 border-solid px-4 py-3 text-left font-sans text-base transition-colors duration-150 ${dung ? "border-ok bg-ok-soft text-ink" : sai ? "border-danger bg-danger-soft text-ink" : "border-line bg-surface text-ink hover:border-primary/50"}`}>
            {x}
          </button>
        );
      })}
    </div>
  );
}
const KhungDiem = ({ trai, giua, phai }) => (
  <div className="flex items-center justify-between text-sm font-bold"><span>{trai}</span><span className="text-soft">{giua}</span><span className="tabular-nums text-ink">{phai}</span></div>
);
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <KhungDiem trai={<span className="text-soft">{tr("Câu", "Phrase", "Item")} {i + 1}/{SO}</span>} giua={cau.cap} phai={`${tong.current.diem} ${tr("điểm", "pts", "pts")}`} />
      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={nghe} aria-label={tr("Nghe lại", "Réécouter", "Replay")}
          className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white active:scale-[0.94]"><Volume2 size={26} /></button>
        <input ref={o} lang="fr" value={go} onChange={(e) => setGo(e.target.value)} disabled={!!kq}
          onKeyDown={(e) => { if (e.key === "Enter") (kq ? tiep() : nop()); }}
          placeholder={tr("Gõ câu bạn nghe được…", "Tapez ce que vous entendez…", "Type what you hear…")}
          className="min-w-0 flex-1 rounded-2xl border-2 border-solid border-line bg-surface2 px-4 py-3 font-sans text-base text-ink outline-none focus:border-primary" />
      </div>
      {kq && (
        <div className="mt-4 rounded-2xl bg-surface2 p-4">
          <p lang="fr" className="m-0 flex flex-wrap gap-x-1.5 text-base">
            {kq.tu.map((t, k) => <span key={k} className={t.khop === "dung" ? "text-ok" : t.khop === "sai_dau" ? "text-warn" : "text-danger underline"}>{t.goc}</span>)}
          </p>
          <p className="m-0 mt-2 text-sm text-soft">{cau.nghia} · <strong className="text-ink">+{kq.them}</strong></p>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={kq ? tiep : nop} className="cursor-pointer rounded-full border-0 bg-primary px-6 py-2.5 font-sans text-sm font-extrabold text-on-primary active:scale-[0.97]">
          {kq ? (i + 1 >= SO ? tr("Xem kết quả", "Résultat", "See result") : tr("Câu tiếp", "Suivante", "Next")) : tr("Chấm", "Valider", "Check")}
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-center gap-4">
        {Array.from({ length: SO }, (_, k) => {
          const d = mo[k]; const Ic = d != null && d >= 0.7 ? DoorOpen : DoorClosed;
          return <span key={k} className={`grid h-16 w-14 place-items-center rounded-2xl ${d == null ? (k === i ? "bg-primary-soft text-primary ring-2 ring-primary" : "bg-surface2 text-soft") : d >= 0.7 ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}><Ic size={28} /></span>;
        })}
      </div>
      <p className="m-0 mt-5 text-center text-xs font-bold uppercase tracking-wider text-soft">{tr(`Cửa ${i + 1}: đọc to câu này`, `Porte ${i + 1} : lisez à voix haute`, `Door ${i + 1}: read aloud`)}</p>
      <p lang="fr" className="m-0 mt-2 text-center text-2xl font-extrabold text-ink">{cau.cau}</p>
      {cau.nghia && <p className="m-0 mt-1 text-center text-sm text-soft">{cau.nghia}</p>}
      {/* Giữ PhatAm hiện tới khi sang cửa sau để người chơi đọc được kết quả từng từ;
          chỉ lần chấm ĐẦU của mỗi cửa được tính. */}
      <div className="mt-5"><PhatAm key={cau.id} cau={cau} onXong={(d) => { if (mo.length === i) xongCua(d); }} /></div>
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <KhungDiem trai={<span className="text-soft">{tr("Câu", "Question", "Question")} {i + 1}/{ds.length}</span>} giua={v.cap} phai={`${kq.current.diem} ${tr("điểm", "pts", "pts")}`} />
      <div className="mt-4 rounded-2xl border-2 border-dashed border-line bg-surface2 p-4">
        <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-soft"><Search size={13} /> {v.tieuDe}</p>
        <p lang="fr" className="m-0 mt-2 text-base leading-relaxed text-ink">{v.van}</p>
      </div>
      <p lang="fr" className="m-0 mt-5 text-lg font-extrabold text-ink">{h.q}</p>
      <CauTracNghiem key={i} pa={h.pa} onTra={tra} daChon={chon} laPhap />
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <KhungDiem trai={<span className="text-soft">{i + 1}/{SO}</span>} giua="" phai={`${kq.current.diem} ${tr("điểm", "pts", "pts")}`} />
      <p className="m-0 mt-5 text-xl font-extrabold leading-snug text-ink">{c.q}</p>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} />
      {chon != null && <p className="m-0 mt-3 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-ink">💡 {c.gt}</p>}
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
    <div className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <KhungDiem trai={<Tim mang={mang} />} giua={`${i + 1}/${PHIEU_LUU.length}`} phai={`${kq.current.diem} ${tr("điểm", "pts", "pts")}`} />
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600 transition-[width] duration-500" style={{ width: `${(i / PHIEU_LUU.length) * 100}%` }} /></div>
      <div className="mt-5 flex items-start gap-3">
        <Leon cam="hoi" size={64} className="shrink-0" />
        <div className="rounded-2xl rounded-tl-none bg-surface2 px-4 py-3">
          <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-soft">{c.canh}</p>
          <p className="m-0 mt-1 text-base text-ink">{c.tinh}</p>
        </div>
      </div>
      <p className="m-0 mt-4 text-sm font-bold text-soft">{tr("Bạn nói gì?", "Que dites-vous ?", "What do you say?")}</p>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap />
      {chon != null && <p className="m-0 mt-3 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-ink">💡 {c.gt}</p>}
    </div>
  );
}
