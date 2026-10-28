import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Headphones, CloudRain, VenusAndMars, Play, RotateCcw, Trophy, Volume2, Loader2, Shuffle, Crosshair, Check, X, Keyboard, Drama, Search, Landmark, MapPinned, Swords, Layers } from "lucide-react";
import { PhatAm } from "./NgheNoi.jsx";
import { soCau } from "../../../supabase/functions/_shared/soCau.js";
import { VU_AN } from "../../content/troChoi/thamTu.js";
import { CHANG } from "../../content/troChoi/doVui.js";
import { CHUONG } from "../../content/troChoi/phieuLuu.js";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";
import { MUC_CHOI, khopCap, docDanhTuGioi, docMuaChu, phuongAnNghia, docCauNghe, phuongAnCau, ghiTroChoi, docKyLuc, docXepCau, docSanLoi, docDungSai, tron } from "../../shared/troChoiNhanh.js";

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
    mo: tr("Đua giờ đoán giống đực / giống cái của danh từ. Đúng liên tiếp để nhân điểm.", "Contre la montre : trouvez le genre des noms. Enchaînez pour multiplier.", "Beat the clock guessing noun gender. Streaks multiply points.") },
  { ma: "nghe_chon", nhom: "ng", Icon: Headphones, nen: "from-indigo-500 to-violet-600",
    ten: tr("Radio Léon: băng đứt", "Radio Léon : la bande coupée", "Radio Léon: the snapped tape"),
    mo: tr("DJ Léon làm đứt cuộn băng! Nghe liền một chuỗi đoạn (không hiện chữ) rồi ghép lại đúng thứ tự đã nghe.", "La bande de DJ Léon est coupée ! Écoutez une série d'extraits, puis remettez-les dans l'ordre.", "DJ Léon's tape snapped! Hear a run of clips (no text), then put them back in order.") },
  { ma: "mua_chu", nhom: "tu", Icon: CloudRain, nen: "from-emerald-500 to-cyan-600",
    ten: tr("Mưa chữ", "Pluie de mots", "Word rain"),
    mo: tr("Ba cách chơi: chọn nghĩa, bắt đúng giọt, hoặc gõ từ trước khi nó chạm đất. 3 mạng.", "Trois modes : choisir le sens, attraper le mot ou le taper avant qu'il tombe. 3 vies.", "Three modes: pick the meaning, catch the word, or type it before it lands. 3 lives."),
    kieu: [
      { ma: "nghia", get ten() { return tr("Chọn nghĩa", "Le sens", "Meaning"); }, get mo() { return tr("Từ Pháp rơi, chọn nghĩa đúng.", "Le mot tombe, choisissez son sens.", "French falls, pick its meaning."); } },
      { ma: "bat", get ten() { return tr("Bắt từ", "Attrape-mot", "Catch"); }, get mo() { return tr("Nghĩa hiện ở dưới, chạm đúng giọt tiếng Pháp.", "Le sens s'affiche, touchez le bon mot.", "Meaning shown, tap the right word."); } },
      { ma: "go", get ten() { return tr("Gõ chữ", "Tape-mot", "Type it"); }, get mo() { return tr("Nghĩa rơi, gõ từ tiếng Pháp.", "Le sens tombe, tapez le mot.", "Meaning falls, type the French."); } },
    ] },
  { ma: "xep_cau", nhom: "np", Icon: Shuffle, nen: "from-orange-500 to-rose-500",
    ten: tr("Xếp câu tốc độ", "Phrases en vrac", "Sentence builder"),
    mo: tr("Đua giờ: chạm các từ theo đúng thứ tự để thành câu. Xếp được càng nhiều câu càng nhiều điểm.", "Contre la montre : remettez les mots dans l'ordre, un maximum de phrases.", "Beat the clock: tap words in order to build as many sentences as you can.") },
  { ma: "san_loi", nhom: "np", Icon: Crosshair, nen: "from-red-500 to-amber-500",
    ten: tr("Săn lỗi sai", "Chasse à l'erreur", "Error hunt"),
    mo: tr("Mỗi câu có đúng một từ sai: chạm vào nó. 3 mạng, chạm nhầm là mất mạng.", "Chaque phrase cache une erreur : touchez-la. 3 vies.", "Each sentence hides one wrong word: tap it. 3 lives.") },
  { ma: "dung_sai", nhom: "np", Icon: Check, nen: "from-teal-500 to-blue-600",
    ten: tr("Đúng hay sai", "Vrai ou faux", "True or false"),
    mo: tr("Lướt thật nhanh: câu này đúng hay sai? Đúng liên tiếp để nhân điểm.", "Vite : la phrase est-elle correcte ? Enchaînez pour multiplier.", "Quick: is it right or wrong? Streaks multiply points.") },
  { ma: "chep_nhanh", nhom: "ng", Icon: Keyboard, nen: "from-fuchsia-500 to-purple-600",
    ten: tr("Mật thư của P.G.", "Les messages de P.G.", "P.G.'s secret messages"),
    mo: tr("Giải mã 5 bức điện của kẻ bí ẩn. Máy thu có ít pin: mỗi lần nghe tốn 1 vạch, pin còn dư được cộng điểm.", "Décodez 5 messages secrets. Chaque écoute coûte de la batterie.", "Decode 5 secret messages. Every listen costs battery.") },
  { ma: "noi_mo_khoa", nhom: "ng", Icon: Drama, nen: "from-rose-500 to-red-600",
    ten: tr("Sân khấu Léon", "Le théâtre de Léon", "Léon's theatre"),
    mo: tr("Bạn là diễn viên: đọc thoại vài giây, màn nhung kéo kín, rồi nói thuộc lòng. 3 cảnh, dùng lượt chấm phát âm trong ngày.", "Lisez la réplique, le rideau tombe, dites-la de mémoire. 3 scènes.", "Read your line, the curtain closes, say it from memory. 3 scenes.") },
  { ma: "tham_tu", nhom: "dv", Icon: Search, nen: "from-slate-600 to-indigo-700",
    ten: tr("Thám tử Léon", "Détective Léon", "Detective Léon"),
    mo: tr("Làm trợ lý cho Thanh tra Léon: 9 vụ án, đọc manh mối tiếng Pháp và lần ra kẻ bí ẩn P.G.", "Assistez l'inspecteur Léon : 9 affaires, des indices en français et le mystérieux P.G.", "Assist Inspector Léon: 9 cases, French clues and the mysterious P.G.") },
  { ma: "do_vui", nhom: "dv", Icon: Landmark, nen: "from-blue-600 to-red-500",
    ten: tr("Le Grand Quiz de France", "Le Grand Quiz de France", "Le Grand Quiz de France"),
    mo: tr("Gameshow 9 chặng vòng quanh nước Pháp do MC Léon dẫn: bạn đấu bà Minette, thắng chặng để đóng dấu hộ chiếu.", "Un jeu télé en 9 étapes animé par Léon : vous contre Mme Minette.", "A 9-stage TV quiz hosted by Léon: you vs Mme Minette.") },
  { ma: "phieu_luu", nhom: "dv", Icon: MapPinned, nen: "from-amber-500 to-orange-600",
    ten: tr("Một năm ở Paris", "Une année à Paris", "A year in Paris"),
    mo: tr("9 chương đời sống du học sinh cùng Léon: từ sân bay, tìm nhà, tới phỏng vấn và tranh luận. Chọn câu đáp đúng sắc thái.", "9 chapitres de vie étudiante avec Léon : de l'aéroport à l'entretien.", "9 chapters of student life with Léon: from the airport to the job interview.") },
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
              {den ? <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1"><Icon size={14} /> {ma === "thach_dau" ? "PvP" : tr("Ôn", "Révision", "Review")}</span>
                : <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs" title={tr("Kỷ lục Dễ · Vừa · Khó", "Records Facile · Moyen · Difficile", "Best Easy · Medium · Hard")}>
                    <Trophy size={13} />{["de", "vua", "kho"].map((m, j) => <span key={m} className="tabular-nums">{j > 0 && <span className="opacity-50"> · </span>}<span className="opacity-70">{["D", "V", "K"][j]}</span> {kl[`${ma}:${m}`] ?? "—"}</span>)}
                  </span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-[#111] transition-transform group-hover:translate-x-0.5"><Play size={14} /> {tr("Chơi", "Jouer", "Play")}</span>
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
  const [muc, setMuc] = useState("vua");          // de | vua | kho (MUC_CHOI)
  const [kieu, setKieu] = useState(tc.kieu?.[0]?.ma ?? null);
  const [buoc, setBuoc] = useState("chon");       // chon | choi | xong
  const [kq, setKq] = useState(null);             // { diem, dung, tong }
  const [ghi, setGhi] = useState(null);           // kết quả RPC
  const [van, setVan] = useState(0);

  const xong = useCallback(async (r) => {
    setKq(r); setBuoc("xong"); setGhi(null);
    phat(r.dung >= r.tong * 0.6 ? "thang" : "hetGio");
    setGhi(await ghiTroChoi(tc.ma, r.diem, r.dung, Math.max(1, r.tong), muc));
  }, [tc.ma, muc]);

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
          {tc.kieu && <>
            <p className="m-0 text-sm font-bold text-soft">{tr("Cách chơi", "Mode", "Mode")}</p>
            <div className="mb-5 mt-3 grid gap-2 sm:grid-cols-3">
              {tc.kieu.map((k) => (
                <button key={k.ma} type="button" onClick={() => setKieu(k.ma)}
                  className={`cursor-pointer rounded-2xl border-2 border-solid px-3 py-3 text-left font-sans transition-colors ${kieu === k.ma ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/40"}`}>
                  <span className="block text-sm font-extrabold text-ink">{k.ten}</span>
                  <span className="mt-0.5 block text-xs text-soft">{k.mo}</span>
                </button>
              ))}
            </div>
          </>}
          <p className="m-0 text-sm font-bold text-soft">{tr("Mức độ", "Difficulté", "Difficulty")}</p>
          <div className="mx-auto mt-3 grid max-w-md grid-cols-3 gap-2">
            {[["de", tr("Dễ", "Facile", "Easy"), "A1–A2", "bg-ok"], ["vua", tr("Vừa", "Moyen", "Medium"), "A2–B1", "bg-warn"], ["kho", tr("Khó", "Difficile", "Hard"), "B1–B2", "bg-danger"]].map(([m, ten, mo, nen]) => (
              <button key={m} type="button" onClick={() => setMuc(m)}
                className={`cursor-pointer rounded-2xl border-0 px-2 py-3 font-sans transition-[transform,opacity] ${muc === m ? `${nen} scale-105 text-white shadow-md` : "bg-surface2 text-ink opacity-80 hover:opacity-100"}`}>
                <span className="block text-base font-extrabold">{ten}</span>
                <span className="block text-[11px] font-bold opacity-80">{mo}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { phat("batDau"); setVan((v) => v + 1); setBuoc("choi"); }}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-8 py-3 font-sans text-base font-extrabold text-on-primary shadow-[0_10px_24px_rgb(var(--mcf-primary-rgb)/0.3)] active:scale-[0.97]">
            <Play size={18} /> {tr("Bắt đầu", "Commencer", "Start")}
          </button>
        </div>
      )}

      {buoc === "choi" && <Game key={van} cap={MUC_CHOI[muc].cap} he={MUC_CHOI[muc]} muc={muc} kieu={kieu} onXong={xong} />}

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
                  {!ghi.ky_luc_moi && ghi.ky_luc_cu > 0 && <span className="rounded-full bg-surface2 px-3 py-1 text-soft">{tr("Kỷ lục", "Record", "Best")} ({{ de: tr("Dễ", "Facile", "Easy"), vua: tr("Vừa", "Moyen", "Medium"), kho: tr("Khó", "Difficile", "Hard") }[muc]}): {ghi.ky_luc_cu}</span>}
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
function GioiTinh({ cap, he, onXong }) {
  const GIAY = Math.round(60 * (he?.gio ?? 1));
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

/* ─────────── 2. Radio Léon: « Cuộn băng bị đứt » ───────────
   Cách chơi riêng (28/10): KHÔNG chọn một câu. Léon là DJ, cuộn băng chương trình đêm nay bị
   đứt thành từng đoạn; mỗi vòng nghe liền một chuỗi câu (chữ KHÔNG hiện), rồi chạm các thẻ
   theo đúng THỨ TỰ đã nghe để ghép lại băng. Mức Khó có thêm một đoạn « lạc sóng » không hề
   phát, phải bỏ ra ngoài. Mỗi vòng được phát lại một lần (−30). */
const SO_DOAN = { de: 3, vua: 4, kho: 4 };
const DOAN_LAC = { de: 0, vua: 0, kho: 1 };
function NgheChon({ cap, muc = "vua", onXong }) {
  const VONG = 4, n = SO_DOAN[muc] ?? 4, lac = DOAN_LAC[muc] ?? 0;
  const [kho, setKho] = useState(null);
  const [v, setV] = useState(0);
  const [buoc, setBuoc] = useState("mo");          // mo | phat | xep | xong
  const [dangPhat, setDangPhat] = useState(-1);
  const [thuTu, setThuTu] = useState([]);          // id thẻ đã chạm, theo thứ tự
  const [daPhatLai, setDaPhatLai] = useState(false);
  const tong = useRef({ diem: 0, dung: 0 });
  const am = useRef(null);
  const huy = useRef(0);

  useEffect(() => { docCauNghe(cap).then((d) => setKho(d ? d.filter((c) => c.cau.length <= 75) : []), () => setKho([])); }, [cap]);
  useEffect(() => () => { huy.current++; am.current?.pause(); }, []);
  const can = VONG * (n + lac);
  const vong = kho && kho.length >= can ? kho.slice(v * (n + lac), (v + 1) * (n + lac)) : [];
  const doan = vong.slice(0, n);                   // các đoạn THẬT, đúng thứ tự phát
  const the = React.useMemo(() => tron(vong), [kho, v]); // eslint-disable-line react-hooks/exhaustive-deps

  const phatChuoi = useCallback(() => {
    const lan = ++huy.current;
    setBuoc("phat"); setThuTu([]);
    const mot = (k) => {
      if (lan !== huy.current) return;
      if (k >= doan.length) { setDangPhat(-1); setBuoc("xep"); return; }
      setDangPhat(k);
      am.current?.pause();
      const a = new Audio(doan[k].audio_url); am.current = a;
      const sau = () => setTimeout(() => mot(k + 1), 700);
      a.onended = sau; a.onerror = sau;
      a.play().catch(sau);
    };
    setTimeout(() => mot(0), 400);
  }, [doan]);

  if (!kho) return <Dang chu={tr("Đang tải cuộn băng…", "Chargement de la bande…", "Loading the tape…")} />;
  if (kho.length < can) return <TrongKho />;

  const cham = (id) => {
    if (buoc !== "xep" || thuTu.includes(id) || thuTu.length >= n) return;
    phat("bam");
    const moi = [...thuTu, id]; setThuTu(moi);
    if (moi.length === n) {
      const khop = moi.filter((x, k) => x === doan[k].id).length;
      const tron_ = khop === n;
      const them = khop * 50 + (tron_ ? 100 : 0) - (daPhatLai ? 30 : 0);
      tong.current.diem += Math.max(0, them); if (tron_) tong.current.dung++;
      phat(tron_ ? "dung" : "sai"); setBuoc("xong");
    }
  };
  const tiep = () => {
    if (v + 1 >= VONG) { onXong({ diem: tong.current.diem, dung: tong.current.dung, tong: VONG }); return; }
    setV(v + 1); setDaPhatLai(false); setThuTu([]); setBuoc("mo");
  };
  const LOI_DJ = [
    tr("Bonsoir Paris! Đây là Radio Léon. Ối, cuộn băng đêm nay đứt mất rồi! Bạn nghe kỹ thứ tự các đoạn rồi ghép lại giúp ta nhé.", "Bonsoir Paris ! Ici Radio Léon. Oh non, la bande est coupée ! Écoute l'ordre des extraits et recolle-les.", "Bonsoir Paris! This is Radio Léon. Oh no, tonight's tape snapped! Listen to the order and splice it back."),
    tr("Đoạn băng thứ hai đây. Thính giả đang chờ, ghép nhanh mà chuẩn nhé!", "Deuxième bobine. Les auditeurs attendent !", "Second reel. The listeners are waiting!"),
    tr("Gần xong rồi! Đoạn này dài hơn một chút, tập trung nào.", "On y est presque ! Celle-ci est plus longue.", "Almost there! This one's a bit longer."),
    tr("Cuộn cuối cùng trước giờ lên sóng. Cố lên!", "Dernière bobine avant l'antenne. Courage !", "Last reel before we go on air. Go!"),
  ];
  const khopK = (k) => thuTu[k] === doan[k]?.id;
  return (
    <div className="mt-6 rounded-[2rem] bg-[#2b1d14] p-5 text-[#f6e7c8] shadow-[inset_0_2px_0_rgba(255,255,255,0.08),0_20px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#d9b98a]">
        <span className="inline-flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${buoc === "phat" ? "animate-pulse bg-red-500" : "bg-[#5a3d27]"}`} />
          {buoc === "phat" ? "On air" : "Radio Léon"} · {tr("Cuộn", "Bobine", "Reel")} {v + 1}/{VONG}
        </span>
        <span className="tabular-nums text-[#ffd27a]">{tong.current.diem} pts</span>
      </div>

      {buoc === "mo" ? (
        <div className="mcf-cau-vao mt-5 grid gap-4">
          <div className="flex items-start gap-3">
            <Leon cam={v === 0 ? "chao" : "nhay-mat"} size={64} className="shrink-0" />
            <p className="m-0 rounded-3xl rounded-tl-md bg-[#3a281b] px-4 py-3 text-sm leading-relaxed">{LOI_DJ[v]}</p>
          </div>
          <p className="m-0 text-center text-xs text-[#d9b98a]">{tr(`Sẽ phát liền ${n} đoạn, chữ không hiện.`, `${n} extraits à la suite, sans texte.`, `${n} clips in a row, no text shown.`)}{lac ? " " + tr("Có 1 thẻ lạc sóng không hề phát: đừng chọn nó.", "Une carte n'a jamais été diffusée : ignore-la.", "One card was never played: leave it out.") : ""}</p>
          <button type="button" onClick={phatChuoi} className="mx-auto inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-[#ffb347] px-7 py-3 font-mono text-sm font-extrabold uppercase tracking-widest text-[#2b1d14]">
            <Play size={16} fill="currentColor" /> {tr("Phát băng", "Lancer la bande", "Play tape")}
          </button>
        </div>
      ) : (
        <>
          {/* Hai cuộn băng + các rãnh đoạn: rãnh sáng lên khi đoạn đó đang phát, sau đó hiện số thẻ đã ghép */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#1a120c] p-4">
            <span aria-hidden className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-dotted border-[#ffb347] ${buoc === "phat" ? "mcf-spin" : ""}`}><span className="h-4 w-4 rounded-full bg-[#ffb347]" /></span>
            <div className="flex flex-1 gap-1.5">
              {doan.map((_, k) => (
                <span key={k} className={`grid h-10 flex-1 place-items-center rounded-md border-2 border-solid font-mono text-xs font-bold transition-colors ${dangPhat === k ? "border-[#ffd27a] bg-[#ffb347] text-[#2b1d14]" : buoc === "xong" ? (khopK(k) ? "border-[#7bd88f] bg-[#1f3a26] text-white" : "border-[#ff6b6b] bg-[#45201f] text-white") : thuTu[k] ? "border-[#ffb347] bg-[#3a281b]" : "border-[#5a3d27] bg-transparent text-[#8a6a4a]"}`}>
                  {k + 1}
                </span>
              ))}
            </div>
            <span aria-hidden className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-dotted border-[#ffb347] ${buoc === "phat" ? "mcf-spin" : ""}`}><span className="h-4 w-4 rounded-full bg-[#ffb347]" /></span>
          </div>

          {buoc === "phat" ? (
            <p className="m-0 mt-5 text-center font-mono text-sm uppercase tracking-widest text-[#ffd27a]">{tr("Đang phát đoạn", "Extrait", "Playing clip")} {dangPhat + 1}/{n}…</p>
          ) : (
            <>
              <p className="m-0 mt-4 text-center text-xs text-[#d9b98a]">{buoc === "xep" ? tr(`Chạm thẻ theo thứ tự đã nghe (${thuTu.length}/${n})`, `Touchez dans l'ordre entendu (${thuTu.length}/${n})`, `Tap in the order heard (${thuTu.length}/${n})`) : null}</p>
              <div className="mt-3 grid gap-2">
                {the.map((c) => {
                  const so = thuTu.indexOf(c.id);
                  const laLac = !doan.some((d) => d.id === c.id);
                  const dungCho = buoc === "xong" ? doan.findIndex((d) => d.id === c.id) : -1;
                  return (
                    <button key={c.id} type="button" onClick={() => cham(c.id)} disabled={buoc !== "xep"} lang="fr"
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 border-solid px-3 py-2.5 text-left font-sans text-sm disabled:cursor-default ${so >= 0 ? "border-[#ffb347] bg-[#3a281b] text-[#f6e7c8]" : "border-[#6b4a2f] bg-[#241811] text-[#f6e7c8] hover:border-[#ffb347]"}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${so >= 0 ? "bg-[#ffb347] text-[#2b1d14]" : "bg-[#3a281b] text-[#8a6a4a]"}`}>{so >= 0 ? so + 1 : "·"}</span>
                      <span className="flex-1">{c.cau}{buoc === "xong" && <span className="mt-0.5 block text-xs text-[#d9b98a]">{laLac ? `📡 ${tr("lạc sóng, không phát", "jamais diffusé", "never played")}` : `${tr("Đúng vị trí", "Place", "Position")}: ${dungCho + 1} · ${c.nghia ?? ""}`}</span>}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {buoc === "xep" && !daPhatLai && (
                  <button type="button" onClick={() => { setDaPhatLai(true); phatChuoi(); }} className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-solid border-[#6b4a2f] bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase text-[#d9b98a]"><RotateCcw size={14} /> {tr("Phát lại (−30)", "Rejouer (−30)", "Replay (−30)")}</button>
                )}
                {buoc === "xep" && thuTu.length > 0 && (
                  <button type="button" onClick={() => setThuTu(thuTu.slice(0, -1))} className="cursor-pointer rounded-full border-2 border-solid border-[#6b4a2f] bg-transparent px-4 py-2 font-mono text-xs font-bold uppercase text-[#d9b98a]">↶ {tr("Gỡ thẻ cuối", "Annuler", "Undo")}</button>
                )}
                {buoc === "xong" && (
                  <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-[#ffb347] px-7 py-2.5 font-mono text-sm font-extrabold uppercase tracking-widest text-[#2b1d14]">{v + 1 >= VONG ? tr("Kết thúc", "Terminer", "Finish") : tr("Cuộn tiếp", "Bobine suivante", "Next reel")} →</button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────── 3. Mưa chữ ─────────── */
/* Ba cách chơi (28/10, theo chủ dự án), chung một vòng rơi:
   · nghia: từ Pháp rơi, chọn NGHĨA của giọt thấp nhất (cách cũ);
   · bat:   nghĩa tiếng Việt hiện ở dưới, CHẠM đúng giọt tiếng Pháp đang rơi; giọt khác
            chạm đất thì thôi, chỉ để rơi mất giọt cần bắt mới mất mạng;
   · go:    NGHĨA rơi, GÕ từ tiếng Pháp; mạo từ không bắt buộc, dấu vẫn tính. */
const boMao = (x) => String(x ?? "").toLowerCase().replace(/\(.*?\)/g, " ").replace(/\s+/g, " ").trim()
  .replace(/^(le|la|les|un|une|des|se|s')\s+/, "").replace(/^l['’]\s*/, "").replace(/^s['’]\s*/, "");
function MuaChu({ cap, he, kieu = "nghia", onXong }) {
  const [du, setDu] = useState(null);             // { kho, tatCa }
  const [roi, setRoi] = useState([]);              // [{ id, tu, x, y }]
  const [mang, setMang] = useState(3);
  const [diem, setDiem] = useState(0);
  const [pa, setPa] = useState([]);
  const [dich, setDich] = useState(null);          // id giọt cần bắt (kiểu bat)
  const [go, setGo] = useState("");
  const [nhay, setNhay] = useState(null);
  const o = useRef(null);
  const s = useRef({ roi: [], mang: 3, diem: 0, dung: 0, tong: 0, k: 0, sinh: 0, het: false, khoaPa: null, dich: null });
  const toc = he?.toc ?? 1;

  useEffect(() => { docMuaChu(cap).then(setDu, () => setDu({ kho: [], tatCa: [] })); }, [cap]);
  useEffect(() => { if (kieu === "go") o.current?.focus(); }, [du, kieu]);

  const duoiCung = () => s.current.roi.reduce((a, b) => (!a || b.y > a.y ? b : a), null);
  const ketThuc = () => { const st = s.current; st.het = true; onXong({ diem: st.diem, dung: st.dung, tong: Math.max(1, st.tong) }); };
  const matMang = () => { const st = s.current; st.mang--; setMang(st.mang); phat("sai"); if (st.mang <= 0) ketThuc(); };
  const capNhat = () => {
    const st = s.current;
    if (kieu === "nghia") {
      const d = duoiCung();
      if (d && d.id !== st.khoaPa) { st.khoaPa = d.id; setPa(phuongAnNghia(d.tu, du.tatCa)); }
      if (!d) { st.khoaPa = null; setPa([]); }
    } else if (kieu === "bat" && !st.roi.some((w) => w.id === st.dich)) {
      const ung = st.roi.filter((w) => w.y > 4);
      st.dich = ung.length ? ung[Math.floor(Math.random() * ung.length)].id : null;
      setDich(st.dich);
    }
  };

  useEffect(() => {
    if (!du?.kho?.length) return;
    let raf, truoc = performance.now();
    const vong = (now) => {
      const st = s.current; if (st.het) return;
      const dt = Math.min(50, now - truoc); truoc = now;
      st.sinh -= dt;
      const toiDa = kieu === "bat" ? 5 : 4;
      if (st.sinh <= 0 && st.roi.length < toiDa) {
        // Kiểu bat: không cho hai giọt cùng nghĩa rơi một lúc, kẻo bắt « đúng » mà bị chấm sai.
        let tu = du.kho[st.k++ % du.kho.length];
        for (let n = 0; n < 5 && st.roi.some((w) => w.tu.vi === tu.vi); n++) tu = du.kho[st.k++ % du.kho.length];
        st.roi.push({ id: st.k, tu, x: 6 + Math.random() * 66, y: -6 });
        st.sinh = Math.max(800, (kieu === "bat" ? 1900 : 2600) - st.dung * 60) / toc;
      }
      const tocDo = (kieu === "go" ? 0.032 : 0.045) * toc + st.dung * 0.0015;
      let mat = false;
      st.roi = st.roi.filter((w) => {
        w.y += tocDo * dt / 10;
        if (w.y < 92) return true;
        if (kieu !== "bat" || w.id === st.dich) { mat = true; st.tong++; }
        return false;
      });
      setRoi(st.roi.map((w) => ({ ...w })));
      if (mat) { matMang(); if (st.het) return; }
      capNhat();
      raf = requestAnimationFrame(vong);
    };
    raf = requestAnimationFrame(vong);
    return () => { cancelAnimationFrame(raf); };
  }, [du]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!du) return <Dang chu={tr("Đang chuẩn bị từ…", "Préparation…", "Preparing…")} />;
  if (du.kho.length < 10) return <TrongKho />;

  const trung = (w) => {
    const st = s.current;
    st.dung++; st.tong++; st.diem += 10 + Math.round(w.y / 4) + (kieu === "go" ? 10 : 0);
    st.roi = st.roi.filter((x) => x.id !== w.id);
    setDiem(st.diem); setNhay({ id: w.id, ok: true }); phat("ghep");
    st.khoaPa = null; capNhat();
    setTimeout(() => setNhay(null), 300);
  };
  const tra = (vi) => {
    const st = s.current; const d = duoiCung(); if (!d || st.het) return;
    if (vi === d.tu.vi) return trung(d);
    st.tong++; setNhay({ id: d.id, ok: false }); setTimeout(() => setNhay(null), 300);
    st.khoaPa = null; capNhat(); matMang();
  };
  const bat = (w) => {
    const st = s.current; if (st.het) return;
    const can = st.roi.find((x) => x.id === st.dich);
    if (can && w.tu.vi === can.tu.vi) { st.dich = null; return trung(w); }
    st.tong++; setNhay({ id: w.id, ok: false }); setTimeout(() => setNhay(null), 300); matMang();
  };
  const goChu = (v) => {
    setGo(v);
    const st = s.current; if (st.het) return;
    const g = boMao(v); if (!g) return;
    const w = st.roi.filter((x) => boMao(x.tu.fr) === g).sort((a, b) => b.y - a.y)[0];
    if (w) { trung(w); setGo(""); }
  };

  const dichId = kieu === "nghia" ? duoiCung()?.id : kieu === "bat" ? dich : null;
  const can = kieu === "bat" ? roi.find((w) => w.id === dich) : null;
  const MAU = { nghia: "#0b1530", bat: "#2a0f2f", go: "#06251f" }[kieu];
  return (
    <div className="mt-6 overflow-hidden rounded-[2rem] shadow-[0_20px_40px_rgba(11,21,48,0.35)]" style={{ background: MAU }}>
      <div className={`relative h-[360px] overflow-hidden ${kieu === "bat" ? "bg-[radial-gradient(circle_at_50%_0,#86198f_0,transparent_55%)]" : kieu === "go" ? "bg-[radial-gradient(circle_at_30%_0,#047857_0,transparent_50%)]" : "bg-[radial-gradient(circle_at_20%_10%,#1e3a8a_0,transparent_45%),radial-gradient(circle_at_80%_0,#155e75_0,transparent_40%)]"}`}>
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 text-sm font-bold text-white">
          <span className="flex gap-1">{[0, 1, 2].map((k) => <Heart key={k} size={18} className={k < mang ? "fill-rose-400 text-rose-400" : "text-white/25"} />)}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 tabular-nums">{diem}</span>
        </div>
        {roi.map((w) => {
          const sang = w.id === dichId, nham = nhay?.id === w.id && !nhay.ok;
          const chu = kieu === "go" ? w.tu.vi : w.tu.fr;
          const lop = `absolute whitespace-nowrap rounded-b-full rounded-t-[60%] border-0 px-3 pb-2 pt-3 font-sans text-sm font-extrabold ${nham ? "!bg-rose-500 text-white" : sang && kieu === "nghia" ? "bg-cyan-300 text-[#0b1530] shadow-[0_0_24px_rgba(103,232,249,0.8)]" : kieu === "go" ? "bg-emerald-300/90 text-[#06251f]" : "bg-white/15 text-white backdrop-blur"}`;
          return kieu === "bat"
            ? <button key={w.id} type="button" lang="fr" onClick={() => bat(w)} className={`${lop} cursor-pointer hover:bg-fuchsia-300 hover:text-[#2a0f2f]`} style={{ left: `${w.x}%`, top: `${w.y}%` }}>{chu}</button>
            : <span key={w.id} lang={kieu === "go" ? undefined : "fr"} className={lop} style={{ left: `${w.x}%`, top: `${w.y}%` }}>{chu}</span>;
        })}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[8%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_18px,rgba(255,255,255,0.05)_18px_36px)]" />
      </div>
      {kieu === "nghia" && (
        <div className="grid grid-cols-2 gap-2 bg-black/20 p-3">
          {pa.map((vi) => (
            <button key={vi} type="button" onClick={() => tra(vi)}
              className="cursor-pointer rounded-xl border border-solid border-cyan-300/30 bg-white/5 px-3 py-3 font-sans text-sm font-bold text-white transition-colors duration-150 hover:bg-cyan-300/20 active:scale-[0.97]">
              {vi}
            </button>
          ))}
        </div>
      )}
      {kieu === "bat" && (
        <div className="bg-black/25 p-4 text-center">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-200/80">{tr("Bắt giọt mang nghĩa", "Attrapez le mot qui veut dire", "Catch the word meaning")}</p>
          <p className="m-0 mt-1 min-h-[32px] text-2xl font-extrabold text-white">{can ? can.tu.vi : "…"}</p>
        </div>
      )}
      {kieu === "go" && (
        <div className="bg-black/25 p-3">
          <input ref={o} lang="fr" value={go} onChange={(e) => goChu(e.target.value)} autoComplete="off" spellCheck={false}
            placeholder={tr("Gõ từ tiếng Pháp (mạo từ không bắt buộc)…", "Tapez le mot français (article facultatif)…", "Type the French word (article optional)…")}
            className="w-full rounded-xl border-2 border-solid border-emerald-300/40 bg-black/30 px-4 py-3 font-mono text-base text-white caret-emerald-300 outline-none placeholder:text-emerald-100/50 focus:border-emerald-300" />
        </div>
      )}
      <p className="m-0 bg-black/25 pb-3 text-center text-xs text-white/60">
        {kieu === "nghia" ? tr("Chọn nghĩa của giọt đang sáng (thấp nhất) trước khi nó chạm đất.", "Choisissez le sens de la goutte lumineuse avant qu'elle tombe.", "Pick the glowing drop's meaning before it lands.")
          : kieu === "bat" ? tr("Chạm đúng giọt tiếng Pháp. Chạm nhầm hoặc để nó rơi mất là mất mạng.", "Touchez le bon mot. Erreur ou mot perdu : une vie en moins.", "Tap the right French drop. Wrong tap or missed drop costs a life.")
          : tr("Gõ đúng là giọt vỡ ngay, không cần Enter.", "Bien tapé, la goutte éclate, sans Entrée.", "Type it right and the drop pops, no Enter needed.")}
      </p>
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
function XepCau({ cap, he, onXong }) {
  const GIAY = Math.round(90 * (he?.gio ?? 1));
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
function DungSai({ cap, he, onXong }) {
  const GIAY = Math.round(60 * (he?.gio ?? 1));
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
function CauTracNghiem({ pa, onTra, daChon, laPhap, kieu, bo }) {
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
      {thuTu.filter(({ k }) => !bo?.includes(k)).map(({ x, k }) => {
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

/* ─────────── 7. « Mật thư của P.G. » (chép chính tả) ───────────
   Cách chơi riêng (28/10): Léon chặn được 5 bức điện của kẻ bí ẩn P.G. (cùng mạch truyện với
   Thám tử). Máy thu chỉ còn một lượng PIN cho CẢ nhiệm vụ: mỗi lần nghe tốn 1 vạch, nên phải
   tính xem nghe lại ở bức nào. Bảng giải mã hiện SẴN số ô theo số từ (mức Dễ hiện cả chữ đầu),
   chữ gõ tới đâu điền vào ô tới đó. Pin còn lại cuối nhiệm vụ được cộng điểm. */
const PIN = { de: 10, vua: 8, kho: 6 };
function ChepNhanh({ cap, muc = "vua", onXong }) {
  const SO = 5;
  const [kho, setKho] = useState(null);
  const [i, setI] = useState(0);
  const [go, setGo] = useState("");
  const [kq, setKq] = useState(null);
  const [pin, setPin] = useState(PIN[muc] ?? 8);
  const [daNghe, setDaNghe] = useState(false);
  const tong = useRef({ diem: 0, dung: 0 });
  const am = useRef(null);
  const o = useRef(null);
  useEffect(() => { docCauNghe(cap, ["chinh_ta"]).then((d) => setKho(d ? d.filter((c) => c.cau.length <= 90) : []), () => setKho([])); }, [cap]);
  useEffect(() => () => am.current?.pause(), []);
  const cau = kho?.[i];
  useEffect(() => { setGo(""); setKq(null); setDaNghe(false); }, [i]);
  if (!kho) return <Dang chu={tr("Đang dò tần số…", "Recherche de la fréquence…", "Scanning frequencies…")} />;
  if (kho.length < SO) return <TrongKho />;

  const nghe = () => {
    if (pin <= 0 || kq) return;
    setPin(pin - 1); setDaNghe(true); phat("bam");
    am.current?.pause(); am.current = new Audio(cau.audio_url); am.current.play().catch(() => {});
    setTimeout(() => o.current?.focus(), 50);
  };
  const tuGoc = cau.cau.split(/\s+/).filter(Boolean);
  const tuGo = go.trim() ? go.trim().split(/\s+/) : [];
  const nop = () => {
    if (kq || !go.trim()) return;
    const r = soCau(cau.cau, go, { dau: true });
    const them = Math.round(r.diem * 100);
    tong.current.diem += them; if (r.diem >= 0.8) tong.current.dung++;
    setKq({ ...r, them }); phat(r.diem >= 0.8 ? "dung" : "sai");
  };
  const tiep = () => {
    if (i + 1 >= SO) { const thuong = pin * 20; onXong({ diem: tong.current.diem + thuong, dung: tong.current.dung, tong: SO }); }
    else setI(i + 1);
  };
  const LOI = [
    tr("Ta bắt được tín hiệu lạ ký tên « P.G. ». Máy thu yếu pin lắm, nghe tiết kiệm thôi nhé!", "J'ai capté un signal signé « P.G. ». La batterie est faible, économise-la !", "I've caught a signal signed “P.G.”. The battery is low, use it wisely!"),
    tr("Bức thứ hai. Có vẻ hắn đang hẹn ai đó…", "Deuxième message. Il donne rendez-vous à quelqu'un…", "Second message. He seems to be meeting someone…"),
    tr("Giải được nửa mạng lưới rồi. Tiếp tục!", "La moitié du réseau est décodée. Continue !", "Half the network decoded. Keep going!"),
    tr("Tín hiệu nhiễu hơn. Bình tĩnh nghe từng từ.", "Le signal se brouille. Mot par mot.", "The signal's getting noisy. Word by word."),
    tr("Bức cuối! Giải xong là ta có đủ bằng chứng.", "Dernier message ! Ensuite on aura les preuves.", "Last message! Then we'll have the evidence."),
  ];
  return (
    /* Màn hình máy thu điện tín: nền xanh đen, chữ phốt-pho xanh. Màu viết thẳng, cố ý một thế giới. */
    <div className="mt-6 rounded-[2rem] bg-[#07140d] p-5 font-mono text-[#7ef0a8] shadow-[inset_0_0_40px_rgba(0,255,120,0.08),0_20px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#4fbf7c]">
        <span>{tr("Bức điện", "Message", "Message")} #{i + 1}/{SO} · {cau.cap}</span>
        <span className="tabular-nums">{tong.current.diem} pts</span>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <Leon cam="lam-viec" size={52} className="shrink-0" />
        <p className="m-0 rounded-2xl rounded-tl-md border border-solid border-[#1f5236] bg-[#0b2015] px-3 py-2 font-sans text-sm text-[#c9f7d9]">{LOI[i]}</p>
      </div>

      {/* Pin máy thu */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-widest text-[#4fbf7c]">{tr("Pin", "Batterie", "Battery")}</span>
        <span className="flex flex-1 gap-1" aria-label={`${pin}/${PIN[muc] ?? 8}`}>
          {Array.from({ length: PIN[muc] ?? 8 }, (_, k) => <span key={k} className={`h-3 flex-1 rounded-sm ${k < pin ? (pin <= 2 ? "bg-[#ff6b6b]" : "bg-[#7ef0a8]") : "bg-[#163322]"}`} />)}
        </span>
        <button type="button" onClick={nghe} disabled={pin <= 0 || !!kq}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-[#2f7a50] bg-[#0f2a1b] px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-[#7ef0a8] disabled:cursor-not-allowed disabled:opacity-40">
          <Volume2 size={14} /> {daNghe ? tr("Nghe lại", "Réécouter", "Replay") : tr("Bắt sóng", "Capter", "Tune in")}
        </button>
      </div>

      {/* Bảng giải mã: một ô cho mỗi từ */}
      <div className="mt-5 flex flex-wrap gap-2" onClick={() => o.current?.focus()} lang="fr">
        {tuGoc.map((w, k) => {
          const t = kq?.tu[k];
          const go_ = tuGo[k];
          return (
            <span key={k} style={{ minWidth: `${Math.max(3, w.length) * 0.75}em` }}
              className={`rounded border border-solid px-2 py-1.5 text-center text-base ${kq ? (t?.khop === "dung" ? "border-[#7ef0a8] bg-[#123a24] text-[#c9f7d9]" : t?.khop === "sai_dau" ? "border-[#f5c451] bg-[#3a3012] text-[#f5c451]" : "border-[#ff6b6b] bg-[#3a1414] text-[#ffb4b4]") : go_ ? "border-[#2f7a50] bg-[#0f2a1b]" : "border-dashed border-[#1f5236] text-[#2f7a50]"}`}>
              {kq ? (t?.goc ?? w) : go_ ?? (muc === "de" ? w[0] + "·".repeat(Math.max(0, w.length - 1)) : "·".repeat(w.length))}
            </span>
          );
        })}
      </div>
      <input ref={o} lang="fr" value={go} onChange={(e) => setGo(e.target.value)} disabled={!!kq || !daNghe} spellCheck={false} autoComplete="off"
        onKeyDown={(e) => { if (e.key === "Enter") (kq ? tiep() : nop()); }}
        placeholder={daNghe ? tr("gõ nội dung bức điện…", "tapez le message…", "type the message…") : tr("bấm « Bắt sóng » trước", "« Capter » d'abord", "press “Tune in” first")}
        className="mt-4 w-full rounded-lg border border-solid border-[#1f5236] bg-[#04100a] px-3 py-2.5 font-mono text-base text-[#c9f7d9] caret-[#7ef0a8] outline-none placeholder:text-[#2f7a50] focus:border-[#4fbf7c] disabled:opacity-60" />
      {kq && <p className="m-0 mt-3 font-sans text-sm text-[#9fe3b8]">{cau.nghia} · <strong className="text-[#c9f7d9]">+{kq.them}</strong></p>}
      <div className="mt-4 flex justify-end">
        <button type="button" onClick={kq ? tiep : nop} disabled={!kq && !go.trim()}
          className="cursor-pointer rounded-lg border-0 bg-[#7ef0a8] px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-widest text-[#07140d] disabled:opacity-40">
          {kq ? (i + 1 >= SO ? tr(`Kết thúc (+${pin * 20} pin)`, `Terminer (+${pin * 20})`, `Finish (+${pin * 20})`) : tr("Bức tiếp ↵", "Suivant ↵", "Next ↵")) : tr("Giải mã ↵", "Décoder ↵", "Decode ↵")}
        </button>
      </div>
    </div>
  );
}

/* ─────────── 8. « Sân khấu Léon: Diễn viên quên thoại » (phát âm) ───────────
   Cách chơi riêng (28/10): khác đọc to nhìn chữ. Mỗi cảnh, câu thoại hiện trên kịch bản trong
   vài giây (Dễ 9 s, Vừa 6 s, Khó 4 s) rồi màn nhung KÉO KÍN; người chơi phải đọc thuộc lòng.
   Mức Khó không có nút nghe mẫu. « Nhắc tuồng » mở lại kịch bản 2 giây, mỗi lần −15. Chấm
   bằng PhatAm (Edge Function cham-phat-am, dùng lượt phát âm trong ngày); chỉ lần đọc đầu được
   tính. Tràng pháo tay theo % từ máy nghe ra. */
const GIAY_THOAI = { de: 9, vua: 6, kho: 4 };
function NoiMoKhoa({ cap, muc = "vua", onXong }) {
  const SO = 3;
  const [kho, setKho] = useState(null);
  const [i, setI] = useState(0);
  const [kq, setKq] = useState([]);               // điểm từng cảnh
  const [lo, setLo] = useState(true);             // kịch bản đang mở
  const [con, setCon] = useState(GIAY_THOAI[muc] ?? 6);
  const nhac = useRef(0);
  useEffect(() => { docCauNghe(cap, ["phat_am"]).then((d) => setKho(d ? d.filter((c) => c.cau.length <= 70) : []), () => setKho([])); }, [cap]);
  useEffect(() => {
    if (!kho || !lo || kq.length > i) return undefined;
    const t = setInterval(() => setCon((c) => { if (c <= 1) { setLo(false); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [kho, lo, i, kq.length]);
  if (!kho) return <Dang chu={tr("Đang dựng sân khấu…", "Montage de la scène…", "Setting the stage…")} />;
  if (kho.length < SO) return <TrongKho />;
  const cau = kho[i];
  const daDoc = kq.length > i;
  const xongCanh = (d) => {
    if (daDoc) return;
    const ds = [...kq, d]; setKq(ds); setLo(true); setCon(99);
  };
  const tiep = () => {
    if (kq.length >= SO) {
      const diem = Math.max(0, Math.round(kq.reduce((a, b) => a + b, 0) * 100 * (muc === "kho" ? 1.5 : muc === "de" ? 1 : 1.2)) - nhac.current * 15);
      onXong({ diem, dung: kq.filter((d) => d >= 0.7).length, tong: SO });
    } else { setI(i + 1); setLo(true); setCon(GIAY_THOAI[muc] ?? 6); }
  };
  const nhacTuong = () => { if (lo || daDoc) return; nhac.current++; phat("bam"); setLo(true); setCon(2); };
  const vo = (d) => (d >= 0.9 ? "👏👏👏👏" : d >= 0.7 ? "👏👏👏" : d >= 0.4 ? "👏" : "🍅");
  const CANH = [
    tr("Cảnh 1: quán cà phê. Bạn là nhân vật chính, nhớ thoại nhé!", "Scène 1 : le café. Retiens bien ta réplique !", "Scene 1: the café. Remember your line!"),
    tr("Cảnh 2: ga tàu đông người. Nói rõ cho khán giả hàng cuối nghe.", "Scène 2 : la gare. Articule pour le dernier rang !", "Scene 2: the station. Speak up for the back row!"),
    tr("Cảnh cuối: màn hạ. Câu này mà hay là cả rạp đứng dậy!", "Scène finale : réussis-la et la salle se lève !", "Final scene: nail it and the house stands up!"),
  ];
  return (
    /* Sân khấu: màn nhung đỏ hai bên, đèn rọi giữa. Màu viết thẳng, một thế giới riêng. */
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-[#1a0606] shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between bg-[#3b0a0a] px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-[#fcd9a8]">
        <span>🎭 Théâtre Léon · {tr("Cảnh", "Scène", "Scene")} {i + 1}/{SO}</span>
        <span className="tracking-normal">{kq.map((d, k) => <span key={k} title={`${Math.round(d * 100)}%`}>{vo(d)} </span>)}</span>
      </div>
      <div className="relative px-5 pb-5 pt-4">
        <div className="flex items-start gap-3">
          <Leon cam={daDoc ? (kq[i] >= 0.7 ? "yeah" : "co-len") : "lam-viec"} size={56} className="shrink-0" />
          <p className="m-0 rounded-2xl rounded-tl-md bg-[#2a0b0b] px-3 py-2 text-sm text-[#fde7c7]">
            {daDoc ? (kq[i] >= 0.7 ? tr("Bravo! Khán giả vỗ tay rần rần.", "Bravo ! La salle applaudit.", "Bravo! The audience loves it.") : tr("Hơi lúng túng chút, nhưng diễn tiếp nào!", "Un petit trou, mais on continue !", "A little stumble, but the show goes on!")) : CANH[i]}
          </p>
        </div>
        {/* Kịch bản + màn nhung */}
        <div className="relative mt-4 min-h-[120px] overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_top,#fff7e0_0%,#f3dca8_60%,#d9b56f_100%)] px-5 py-5 text-center">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c4a12]">{tr("Kịch bản", "Le script", "Script")}{lo && !daDoc && con < 99 ? ` · ${con}s` : ""}</p>
          <p lang="fr" className="m-0 mt-2 font-serif text-2xl text-[#3b1d06]">{cau.cau}</p>
          {(muc === "de" || daDoc) && cau.nghia && <p className="m-0 mt-1 text-sm text-[#7c4a12]">{cau.nghia}</p>}
          <span aria-hidden className={`absolute inset-y-0 left-0 w-1/2 bg-[repeating-linear-gradient(90deg,#7f1d1d_0_14px,#991b1b_14px_28px)] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.4)] transition-transform duration-700 ${lo ? "-translate-x-full" : "translate-x-0"}`} />
          <span aria-hidden className={`absolute inset-y-0 right-0 w-1/2 bg-[repeating-linear-gradient(90deg,#991b1b_0_14px,#7f1d1d_14px_28px)] shadow-[inset_10px_0_20px_rgba(0,0,0,0.4)] transition-transform duration-700 ${lo ? "translate-x-full" : "translate-x-0"}`} />
          {!lo && <span className="absolute inset-0 grid place-items-center text-sm font-extrabold uppercase tracking-widest text-[#fcd9a8]">{tr("Đến lượt bạn: đọc thuộc lòng!", "À toi : de mémoire !", "Your turn: from memory!")}</span>}
        </div>
        {!lo && !daDoc && (
          <button type="button" onClick={nhacTuong} className="mt-3 cursor-pointer rounded-full border border-solid border-[#7f1d1d] bg-transparent px-4 py-1.5 font-sans text-xs font-bold text-[#fcd9a8]">🤫 {tr("Nhắc tuồng (−15)", "Souffleur (−15)", "Prompter (−15)")}</button>
        )}
        {(!lo || daDoc) && (
          <div className="mt-4 rounded-2xl bg-surface p-3"><PhatAm key={cau.id} cau={cau} anNghe={muc === "kho"} onXong={xongCanh} /></div>
        )}
        {daDoc && (
          <div className="mt-4 text-right">
            <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-[#fcd9a8] px-6 py-2.5 font-sans text-sm font-extrabold text-[#3b0a0a]">{kq.length >= SO ? tr("Hạ màn", "Rideau", "Curtain call") : tr("Cảnh tiếp", "Scène suivante", "Next scene")} →</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── 9. Thám tử đọc: « Những vụ án của Thanh tra Léon » ───────────
   Chọn mức xong thì vào BẢNG VỤ ÁN của mức đó; mỗi vụ: mở hồ sơ → các cảnh (đọc tài
   liệu, trả lời) → phá án. Tiến độ (vụ đã phá) chỉ lưu ở trình duyệt: đây là tiện ích
   mở khoá vụ kế tiếp, điểm thật vẫn ghi qua ghi_tro_choi như mọi trò. */
const KHOA_TT = "mcf-tham-tu-v1";
const docTienDo = () => { try { return JSON.parse(localStorage.getItem(KHOA_TT)) || {}; } catch { return {}; } };
const luuTienDo = (id, diem) => { try { const t = docTienDo(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_TT, JSON.stringify(t)); } catch { /* chế độ riêng tư: bỏ qua */ } };

function TaiLieu({ tl }) {
  const dong = tl.van.split("\n").map((d, k) => <span key={k} className="block min-h-[1em]">{d}</span>);
  if (tl.loai === "sms") return (
    <div className="mx-auto max-w-sm rounded-[1.75rem] bg-[#111827] p-3 shadow-xl">
      <p className="m-0 pb-2 text-center text-xs font-bold text-white/70">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 max-w-[85%] rounded-2xl rounded-bl-md bg-[#e5e7eb] px-4 py-2.5 text-[15px] leading-snug text-[#111]">{dong}</p>
    </div>
  );
  if (tl.loai === "ve" || tl.loai === "hoaDon") return (
    <div className="mx-auto max-w-sm border-0 border-y-4 border-dotted border-[#9ca3af] bg-[#fff] px-5 py-4 font-mono text-sm text-[#111] shadow-lg">
      <p className="m-0 mb-2 text-center font-bold uppercase tracking-widest">{tl.tieuDe}</p><div lang="fr">{dong}</div>
    </div>
  );
  if (tl.loai === "email") return (
    <div className="overflow-hidden rounded-xl bg-[#fff] text-[#111] shadow-lg">
      <p className="m-0 bg-[#e0e7ff] px-4 py-2 text-sm font-bold text-[#3730a3]">✉ {tl.tieuDe}</p>
      <div lang="fr" className="px-4 py-3 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "bao") return (
    <div className="bg-[#f5f1e6] px-5 py-4 text-[#1f1f1f] shadow-lg">
      <p className="m-0 border-0 border-b-2 border-solid border-[#1f1f1f] pb-1 font-serif text-sm font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <p lang="fr" className="m-0 mt-3 font-serif text-[15px] leading-relaxed [column-gap:1.5rem] sm:columns-2">{tl.van}</p>
    </div>
  );
  if (tl.loai === "affiche" || tl.loai === "bien") return (
    <div className={`mx-auto max-w-md rounded-lg px-5 py-4 text-center shadow-lg ${tl.loai === "affiche" ? "bg-[#fde047] text-[#111]" : "bg-[#1e3a8a] text-white"}`}>
      <p className="m-0 text-lg font-black uppercase tracking-wider">{tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
  if (tl.loai === "loa") return (
    <div className="rounded-2xl bg-[#0f172a] px-5 py-4 text-[#e2e8f0] shadow-lg">
      <p className="m-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300"><Volume2 size={14} /> {tl.tieuDe}</p>
      <div lang="fr" className="mt-2 text-[15px] italic leading-relaxed">{dong}</div>
    </div>
  );
  // note · loiKhai · thu · bang · the · bai: tờ giấy viết tay / đánh máy
  return (
    <div className={`px-5 py-4 text-[#1f2937] shadow-lg ${tl.loai === "thu" ? "bg-[#fdf6e3] font-serif" : tl.loai === "bang" ? "bg-[#fff] font-mono text-sm" : "bg-[#fffbeb]"}`}>
      <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-wider text-[#92400e]">{tl.loai === "loiKhai" ? "🗣 " : "📄 "}{tl.tieuDe}</p>
      <div lang="fr" className="text-[15px] leading-relaxed">{dong}</div>
    </div>
  );
}

function ThamTu({ muc = "vua", onXong }) {
  const [td, setTd] = useState(docTienDo);
  const [vu, setVu] = useState(null);             // vụ đang chơi
  const [buoc, setBuoc] = useState("mo");         // mo | canh | ket | xong
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const [so, setSo] = useState([]);               // sổ manh mối
  const kq = useRef({ diem: 0, dung: 0 });
  const ds = VU_AN.filter((v) => v.muc === muc);

  if (!vu) return (
    <div className="mt-6 rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-start gap-3">
        <Leon cam="lam-viec" size={72} className="shrink-0" />
        <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm text-[#2b2118]">
          {muc === "de" ? tr("Chào trợ lý mới! Ta là Thanh tra Léon. Mấy vụ nhỏ trong khu phố đang chờ chúng ta. Bắt đầu từ hồ sơ số 1 nhé.", "Bienvenue, assistant ! Je suis l'inspecteur Léon. De petites affaires du quartier nous attendent. Commençons par le dossier 1.", "Welcome, assistant! I'm Inspector Léon. Some small neighbourhood cases await. Let's start with case 1.")
            : muc === "vua" ? tr("Gần đây hiện trường nào cũng có một chiếc lông vũ xám và chữ ký « P.G. ». Không phải trùng hợp đâu, trợ lý.", "Ces derniers temps, chaque scène de crime cache une plume grise et la signature « P.G. ». Ce n'est pas un hasard.", "Lately every crime scene has a grey feather and the signature “P.G.”. That's no coincidence.")
            : tr("Đã đến lúc lần ra P.G. Ba hồ sơ cuối, khó nhất. Ta tin ở cậu.", "Il est temps de démasquer P.G. Trois derniers dossiers, les plus durs. Je compte sur vous.", "Time to unmask P.G. Three final cases, the hardest. I'm counting on you.")}
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ds.map((v, k) => {
          const xong = td[v.id] != null, khoa = k > 0 && td[ds[k - 1].id] == null;
          return (
            <button key={v.id} type="button" disabled={khoa} onClick={() => { phat("batDau"); setVu(v); setBuoc("mo"); setI(0); setSo([]); kq.current = { diem: 0, dung: 0 }; }}
              className="relative cursor-pointer rounded-sm border-0 bg-[#e8d3a5] p-4 pt-6 text-left font-sans text-[#2b2118] shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              <span className="absolute -top-3 left-4 rounded-t-lg bg-[#e8d3a5] px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#7c5c2e]">{tr("Hồ sơ", "Dossier", "Case")} {v.so}</span>
              <span lang="fr" className="block font-serif text-lg font-bold">{v.ten}</span>
              <span className="mt-1 block text-xs text-[#6b5435]">{v.tenVi}</span>
              <span className="mt-3 block text-xs font-bold">
                {khoa ? `🔒 ${tr("Phá vụ trước để mở", "Résolvez l'affaire précédente", "Solve the previous case")}` : xong ? `✅ ${tr("Đã phá", "Résolue", "Solved")} · ${td[v.id]}` : `🔎 ${tr("Chưa phá", "À résoudre", "Unsolved")}`}
              </span>
              {xong && <span className="mcf-dong absolute right-2 top-3 rounded border-2 border-solid border-red-700 px-1 font-mono text-[10px] font-black text-red-700">{tr("ĐÃ PHÁ", "RÉSOLU", "SOLVED")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const khung = (noi, con) => (
    <div className="mt-6 rounded-[2rem] bg-[#3f3a36] bg-[radial-gradient(#57504a_1px,transparent_1px)] bg-[length:10px_10px] p-5">
      <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-widest text-[#e7dcc8]">
        <span>🔎 {tr("Hồ sơ", "Dossier", "Case")} {vu.so} · <span lang="fr">{vu.ten}</span></span><span className="tabular-nums">{kq.current.diem} pts</span>
      </div>
      {noi && <p className="m-0 mt-2 text-xs font-bold text-amber-300">📍 {noi}</p>}
      {con}
    </div>
  );
  const LoiLeon = ({ cam, children }) => (
    <div className="mcf-cau-vao mt-4 flex items-start gap-3">
      <Leon cam={cam} size={64} className="shrink-0" />
      <p className="m-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-sm leading-relaxed text-[#2b2118]">{children}</p>
    </div>
  );
  const SoManhMoi = () => so.length > 0 && (
    <details className="mt-4 rounded-xl bg-black/25 px-4 py-2 text-sm text-[#fef3c7]" open={buoc === "ket"}>
      <summary className="cursor-pointer font-bold">📒 {tr("Sổ manh mối", "Carnet d'indices", "Clue notebook")} ({so.length})</summary>
      <ul className="m-0 mt-2 grid gap-1 pl-5">{so.map((m, k) => <li key={k}>{m}</li>)}</ul>
    </details>
  );

  if (buoc === "mo") return khung(null, <>
    <LoiLeon cam="lam-viec">{vu.mo}</LoiLeon>
    <p className="m-0 mt-5 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{vu.muc === "kho" && vu.so === 7 ? tr("Giả thuyết", "Hypothèses", "Hypotheses") : tr("Những người liên quan", "Personnes impliquées", "People involved")}</p>
    <div className="mt-2 grid gap-3 sm:grid-cols-3">
      {vu.nghiPham.map((n, k) => (
        <div key={n.ten} className="bg-[#fff] p-3 text-[#1f2937] shadow-md" style={{ rotate: `${[-2, 1.5, -1, 2][k % 4]}deg` }}>
          <div className="grid h-16 place-items-center bg-[#e5e7eb] text-2xl" aria-hidden>❔</div>
          <p lang="fr" className="m-0 mt-2 text-sm font-bold">{n.ten}</p>
          <p className="m-0 text-xs text-[#6b7280]">{n.vai}</p>
        </div>
      ))}
    </div>
    <div className="mt-5 text-right">
      <button type="button" onClick={() => { phat("bam"); setBuoc("canh"); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Điều tra ngay", "Enquêter", "Investigate")} →</button>
    </div>
  </>);

  if (buoc === "canh") {
    const c = vu.canh[i];
    const tra = (k) => {
      if (chon != null) return;
      setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
      if (ok) { kq.current.dung++; kq.current.diem += 100; }
      setSo((s) => [...s, c.manh]);
    };
    const tiep = () => { setChon(null); if (i + 1 >= vu.canh.length) setBuoc("ket"); else setI(i + 1); };
    return khung(c.noi, <>
      <LoiLeon key={`l${i}`} cam={c.cam}>{c.leon}</LoiLeon>
      <div key={`t${i}`} className="mcf-cau-vao mt-4"><TaiLieu tl={c.tl} /></div>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 font-mono text-base font-bold text-[#fef3c7]">❓ {c.q}</p>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="manh" />
      {chon != null && <>
        <LoiLeon cam={chon === 0 ? "duoc-do" : "hum"}>{chon === 0 ? tr("Chính xác! ", "Exact ! ", "Exactly! ") : tr("Chưa đúng, nhưng không sao, ta vẫn ghi manh mối vào sổ. ", "Raté, mais je note quand même l'indice. ", "Not quite, but I'll still note the clue. ")}{c.gt}</LoiLeon>
        <div className="mt-4 text-right">
          <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">
            {i + 1 >= vu.canh.length ? tr("Phá án", "Résoudre", "Solve") : tr("Manh mối tiếp", "Indice suivant", "Next clue")} →
          </button>
        </div>
      </>}
      <SoManhMoi />
    </>);
  }

  if (buoc === "ket") {
    const k_ = vu.ket;
    const tra = (k) => {
      if (chon != null) return;
      setChon(k); const ok = k === 0; phat(ok ? "thang" : "sai");
      if (ok) { kq.current.dung++; kq.current.diem += 300; }
    };
    return khung(tr("Phá án", "Résolution", "Solving"), <>
      <SoManhMoi />
      <LoiLeon cam={k_.cam}>{k_.leon}</LoiLeon>
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-red-900/60 px-4 py-3 text-center font-serif text-xl font-bold text-[#fef3c7]">{k_.q}</p>
      <CauTracNghiem pa={k_.pa} onTra={tra} daChon={chon} laPhap kieu="manh" />
      {chon != null && <>
        <LoiLeon cam={chon === 0 ? vu.loiKet.cam : "buon"}>{chon === 0 ? vu.loiKet.loi : <>{tr("Ôi không, ta bắt nhầm người rồi! ", "Oh non, ce n'est pas le bon suspect ! ", "Oh no, wrong suspect! ")}{k_.gt}</>}</LoiLeon>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {chon !== 0 && <button type="button" onClick={() => { setChon(null); kq.current.diem = Math.max(0, kq.current.diem - 100); }} className="cursor-pointer rounded-full border-0 bg-white/15 px-5 py-2.5 font-sans text-sm font-bold text-white">{tr("Suy luận lại (−100)", "Réfléchir encore (−100)", "Think again (−100)")}</button>}
          <button type="button" onClick={() => {
            const ok = chon === 0;
            if (ok) { luuTienDo(vu.id, kq.current.diem); setTd(docTienDo()); }
            onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: vu.canh.length + 1 });
          }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{tr("Đóng hồ sơ", "Classer le dossier", "Close the case")} →</button>
        </div>
      </>}
    </>);
  }
  return null;
}

/* ─────────── 10. Đố vui: « Le Grand Quiz de France » ───────────
   Chọn mức → hộ chiếu ba chặng của mức đó → một tập gameshow: 5 câu, mỗi câu có đồng hồ,
   MC là Léon, người chơi đấu bà Minette. Đạt `dat` câu thì thắng chặng, được đóng dấu. Tiến độ chặng
   chỉ lưu ở trình duyệt (mở khoá chặng sau); điểm thật ghi qua ghi_tro_choi. */
const KHOA_DV = "mcf-do-vui-v1";
const docDauDV = () => { try { return JSON.parse(localStorage.getItem(KHOA_DV)) || {}; } catch { return {}; } };
const luuDauDV = (id, diem) => { try { const t = docDauDV(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_DV, JSON.stringify(t)); } catch { /* bỏ qua */ } };

function DoVui({ muc = "vua", he, onXong }) {
  const GIAY = Math.round(20 * (he?.gio ?? 1));
  const [dau, setDau] = useState(docDauDV);
  const [ch, setCh] = useState(null);             // chặng đang chơi
  const [buoc, setBuoc] = useState("mo");         // mo | hoi | xong
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);         // chỉ số đã chọn, -1 = hết giờ
  const [con, setCon] = useState(GIAY);
  const [minette, setMinette] = useState(0);
  const kq = useRef({ diem: 0, dung: 0 });
  const batDau = useRef(Date.now());
  const ds = CHANG.filter((c) => c.muc === muc);

  const tra = useCallback((k) => {
    if (chon != null || !ch) return;
    setChon(k); const ok = k === 0; phat(ok ? "dung" : "sai");
    if (ok) { kq.current.dung++; kq.current.diem += 100 + Math.max(0, Math.round(con * 5)); }
    // Bà Minette trả lời đúng khoảng 60%: đủ để là đối thủ, không đủ để không thể thắng.
    if (Math.random() < 0.6) setMinette((m) => m + 1);
  }, [chon, ch, con]);

  useEffect(() => {
    if (buoc !== "hoi" || chon != null) return;
    batDau.current = Date.now(); setCon(GIAY);
    const t = setInterval(() => {
      const c = Math.max(0, GIAY - Math.floor((Date.now() - batDau.current) / 1000));
      setCon(c);
      if (c === 0) { clearInterval(t); tra(-1); }
    }, 250);
    return () => clearInterval(t);
  }, [buoc, i, chon == null]); // eslint-disable-line react-hooks/exhaustive-deps

  const LoiLeon = ({ cam, children }) => (
    <div className="mcf-cau-vao mt-4 flex items-start gap-3">
      <Leon cam={cam} size={60} className="shrink-0" />
      <p className="m-0 rounded-3xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed text-white">{children}</p>
    </div>
  );
  const nen = "mt-6 rounded-[2rem] bg-[#140b33] bg-[radial-gradient(ellipse_at_top,#3b1d8f_0,transparent_60%)] p-5 text-white";

  /* Hộ chiếu: ba trang = ba chặng của mức, dấu đóng lên chặng đã thắng. */
  if (!ch) return (
    <div className={nen}>
      <LoiLeon cam="phap">{muc === "de" ? tr("Chào mừng tới « Le Grand Quiz de France »! Ta là Léon, MC của chương trình. Thí sinh mới là bạn, đối đầu bà Minette, vô địch ba mùa liền.", "Bienvenue au « Grand Quiz de France » ! Je suis Léon, votre animateur. Face à vous : Mme Minette, triple championne.", "Welcome to « Le Grand Quiz de France »! I'm Léon, your host. Your rival: Mme Minette, three-time champion.")
        : muc === "vua" ? tr("Hạng « Moyen »: từ giờ MC Léon hỏi bằng tiếng Pháp. Bình tĩnh đọc kỹ nhé.", "Niveau « Moyen » : je pose maintenant les questions en français.", "“Medium” tier: I now ask in French.")
        : tr("Hạng « Difficile »: lịch sử, văn học, và trận chung kết với bà Minette!", "Niveau « Difficile » : histoire, littérature, et la grande finale !", "“Hard” tier: history, literature, and the grand final!")}</LoiLeon>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ds.map((c, k) => {
          const thang = dau[c.id] != null, khoa = k > 0 && dau[ds[k - 1].id] == null;
          return (
            <button key={c.id} type="button" disabled={khoa}
              onClick={() => { phat("batDau"); setCh(c); setBuoc("mo"); setI(0); setChon(null); setMinette(0); kq.current = { diem: 0, dung: 0 }; }}
              className="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-solid border-[#7c2d12] bg-[#fef3c7] p-4 text-left font-sans text-[#431407] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#9a3412]">{tr("Hộ chiếu · chặng", "Passeport · étape", "Passport · stage")} {c.so}</span>
              <span className="mt-2 block text-3xl" aria-hidden>{c.co}</span>
              <span className="mt-1 block text-base font-extrabold">{c.noi}</span>
              <span lang="fr" className="block text-xs italic text-[#9a3412]">{c.ten}</span>
              <span className="mt-2 block text-xs font-bold">{khoa ? `🔒 ${tr("Thắng chặng trước để mở", "Gagnez l'étape précédente", "Win the previous stage")}` : thang ? `${tr("Kỷ lục", "Record", "Best")}: ${dau[c.id]}` : tr(`Cần đúng ${c.dat}/5`, `${c.dat}/5 pour gagner`, `${c.dat}/5 to win`)}</span>
              {thang && <span className="mcf-dong absolute right-2 top-6 grid h-16 w-16 place-items-center rounded-full border-4 border-double border-[#b91c1c] text-center font-mono text-[10px] font-black uppercase leading-tight text-[#b91c1c]">{c.noi.split(" ")[0]}<br />✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (buoc === "mo") return (
    <div className={nen}>
      <p className="m-0 text-center font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Le Grand Quiz de France · {ch.co} {ch.noi}</p>
      <LoiLeon cam="quyet-tam">{ch.mo}</LoiLeon>
      <div className="mt-5 text-center">
        <button type="button" onClick={() => { phat("batDau"); setBuoc("hoi"); }} className="cursor-pointer rounded-full border-0 bg-amber-400 px-8 py-3 font-sans text-base font-extrabold text-[#140b33] shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none">{tr("Bắt đầu ghi hình!", "Moteur, ça tourne !", "Roll the cameras!")}</button>
      </div>
    </div>
  );

  const c = ch.cau[i];
  if (buoc === "hoi") {
    const tiep = () => {
      if (i + 1 < ch.cau.length) { setChon(null); setI(i + 1); return; }
      const thang = kq.current.dung >= ch.dat;
      if (thang) { luuDauDV(ch.id, kq.current.diem); setDau(docDauDV()); phat("thang"); }
      setBuoc("xong");
    };
    return (
      <div className={nen}>
        {/* Bục thi: Léon (người chơi) và bà Minette */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <Leon cam={chon == null ? "hoi" : chon === 0 ? "yeah" : "hum"} size={48} />
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">MC Léon · {ch.co} {ch.noi}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <div className="rounded-xl bg-amber-400/90 p-2 text-center text-[#140b33]">
            <span className="mx-auto block text-[34px] leading-[44px]" aria-hidden>{chon == null ? "🙋" : chon === 0 ? "🤩" : "😣"}</span>
            <p className="m-0 text-xs font-extrabold">{tr("Bạn", "Vous", "You")} · {kq.current.dung}</p>
          </div>
          <span className="relative grid h-14 w-14 place-items-center">
            <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" stroke="rgba(255,255,255,0.15)" /><circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round" stroke={con <= 5 ? "#f87171" : "#fbbf24"} strokeDasharray="94.2" strokeDashoffset={94.2 * (1 - con / GIAY)} /></svg>
            <span className="text-sm font-extrabold tabular-nums">{con}</span>
          </span>
          <div className="rounded-xl bg-white/15 p-2 text-center">
            <span className="mx-auto block text-[34px] leading-[44px]" aria-hidden>🐱</span>
            <p className="m-0 text-xs font-extrabold">Minette · {minette}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {ch.cau.map((_, k) => <span key={k} className={`h-2 flex-1 rounded-full ${k < i ? "bg-amber-400" : k === i ? "bg-white" : "bg-white/15"}`} />)}
        </div>
        <div className="mt-4 rounded-2xl border-2 border-solid border-violet-400/60 bg-[#22145a] px-5 py-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.35)]">
          <p lang={ch.muc === "de" ? undefined : "fr"} className="m-0 text-xl font-extrabold leading-snug">{c.q}</p>
        </div>
        <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="tv" />
        {chon != null && <>
          <LoiLeon cam={chon === 0 ? "tuyet-voi" : chon === -1 ? "ngac-nhien" : "xin-loi"}>
            {chon === 0 ? tr("Chính xác! ", "Exact ! ", "Correct! ") : chon === -1 ? tr("Hết giờ rồi! ", "Temps écoulé ! ", "Time's up! ") : tr("Tiếc quá! ", "Dommage ! ", "Too bad! ")}
            {chon !== 0 && <><strong lang="fr">{c.pa[0]}</strong>. </>}{c.gt}
          </LoiLeon>
          <div className="mt-4 text-right">
            <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">
              {i + 1 < ch.cau.length ? tr("Câu tiếp", "Question suivante", "Next question") : tr("Kết quả tập", "Résultat", "Results")} →
            </button>
          </div>
        </>}
      </div>
    );
  }

  const thang = kq.current.dung >= ch.dat;
  return (
    <div className={nen}>
      <p className="m-0 text-center font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-300">{ch.co} {ch.noi}</p>
      <div className="mt-4 flex items-center justify-center gap-6 text-center">
        <div><span className="block text-[54px] leading-[72px]" aria-hidden>{thang ? "🏆" : "🙋"}</span><p className="m-0 text-xs font-bold text-white/70">{tr("Bạn", "Vous", "You")}</p><p className="m-0 text-3xl font-extrabold tabular-nums">{kq.current.dung}</p></div>
        <span className="text-xl font-black text-white/50">VS</span>
        <div><span className="block text-[54px] leading-[72px]" aria-hidden>🐱</span><p className="m-0 text-xs font-bold text-white/70">Minette</p><p className="m-0 text-3xl font-extrabold tabular-nums">{minette}</p></div>
      </div>
      {thang && <p className="mcf-dong mx-auto mt-3 w-fit rounded-md border-4 border-double border-amber-300 px-3 py-1 font-mono text-sm font-black uppercase tracking-widest text-amber-300">{tr("Đã đóng dấu", "Tampon obtenu", "Stamped")} {ch.co}</p>}
      <LoiLeon cam={thang ? "cuoi-lon" : "co-len"}>{thang ? ch.thang : `${ch.thua} ${tr(`(Cần ${ch.dat}/5 câu đúng.)`, `(Il faut ${ch.dat}/5.)`, `(You need ${ch.dat}/5.)`)}`}</LoiLeon>
      <div className="mt-5 text-right">
        <button type="button" onClick={() => onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: ch.cau.length })}
          className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#140b33]">{tr("Lưu điểm", "Enregistrer", "Save score")} →</button>
      </div>
    </div>
  );
}

/* ─────────── 11. Phiêu lưu: « Một năm ở Paris » ───────────
   Chọn mức → bản đồ ba chương của mức đó → một chương: 4 cảnh hội thoại, 3 tim. Léon là
   bạn đồng hành, có thể « nhắc nhỏ » (bỏ bớt 2 câu sai, trừ 50 điểm). Tiến độ chương chỉ
   lưu ở trình duyệt (mở khoá chương sau); điểm thật ghi qua ghi_tro_choi. */
const KHOA_PL = "mcf-phieu-luu-v1";
const docPL = () => { try { return JSON.parse(localStorage.getItem(KHOA_PL)) || {}; } catch { return {}; } };
const luuPL = (id, diem) => { try { const t = docPL(); t[id] = Math.max(t[id] ?? 0, diem); localStorage.setItem(KHOA_PL, JSON.stringify(t)); } catch { /* bỏ qua */ } };

function PhieuLuu({ muc = "vua", onXong }) {
  const [td, setTd] = useState(docPL);
  const [ch, setCh] = useState(null);
  const [buoc, setBuoc] = useState("mo");         // mo | canh | xong
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const [mang, setMang] = useState(3);
  const [bo, setBo] = useState(null);             // phương án Léon đã gạch
  const kq = useRef({ diem: 0, dung: 0, tong: 0 });
  const ds = CHUONG.filter((c) => c.muc === muc);

  const LoiLeon = ({ cam, children }) => (
    <div className="mcf-cau-vao mt-4 flex items-start gap-3">
      <Leon cam={cam} size={56} className="shrink-0" />
      <p className="m-0 rounded-3xl rounded-tl-md bg-orange-50 px-4 py-3 text-sm leading-relaxed text-ink dark:bg-orange-950/40">{children}</p>
    </div>
  );

  if (!ch) return (
    <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="bg-[#fef3c7] p-5 dark:bg-amber-950/40">
        <LoiLeon cam="chao">{muc === "de" ? tr("Chào bạn! Ta là Léon, người Paris chính gốc. Năm nay ta sẽ đi cùng bạn từ ngày đầu tiên ở sân bay.", "Salut ! Moi, c'est Léon, Parisien pur jus. Je t'accompagne dès ton premier jour.", "Hi! I'm Léon, a true Parisian. I'll be with you from day one.")
          : muc === "vua" ? tr("Bạn đã quen Paris rồi. Giờ là chuyện thật: tìm nhà, giấy tờ, bạn bè người Pháp.", "Tu connais Paris maintenant. Place à la vraie vie : logement, papiers, amis.", "You know Paris now. Time for real life: housing, paperwork, friends.")
          : tr("Phỏng vấn, tranh luận, thư từ trang trọng: tiếng Pháp của người đi làm. Ta tin ở bạn!", "Entretien, débat, courrier formel : le français professionnel. Je crois en toi !", "Interviews, debates, formal letters: professional French. I believe in you!")}</LoiLeon>
      </div>
      <div className="relative grid gap-4 p-5 sm:grid-cols-3">
        <span aria-hidden className="absolute left-10 right-10 top-1/2 hidden border-0 border-t-2 border-dashed border-orange-300 sm:block" />
        {ds.map((c, k) => {
          const xong = td[c.id] != null, khoa = k > 0 && td[ds[k - 1].id] == null;
          return (
            <button key={c.id} type="button" disabled={khoa}
              onClick={() => { phat("batDau"); setCh(c); setBuoc("mo"); setI(0); setChon(null); setMang(3); setBo(null); kq.current = { diem: 0, dung: 0, tong: 0 }; }}
              className="relative cursor-pointer rounded-3xl border-2 border-solid border-orange-300 bg-surface p-4 text-left font-sans shadow-sm transition-transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">{tr("Chương", "Chapitre", "Chapter")} {c.so}</span>
              <span className="mt-1 block text-3xl" aria-hidden>{c.co}</span>
              <span lang="fr" className="mt-1 block text-base font-extrabold text-ink">{c.ten}</span>
              <span className="block text-xs text-soft">{c.tenVi}</span>
              <span className="mt-2 block text-xs font-bold text-ink">{khoa ? `🔒 ${tr("Xong chương trước để mở", "Terminez le chapitre précédent", "Finish the previous chapter")}` : xong ? `✅ ${td[c.id]}` : `▶ ${tr("Chưa chơi", "À jouer", "Not played")}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const dau = (
    <div className="bg-[#fef3c7] px-5 pb-4 pt-4 dark:bg-amber-950/40">
      <div className="flex items-center justify-between text-sm font-bold">
        <Tim mang={mang} />
        <span lang="fr" className="text-xs font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-300">{ch.co} {ch.ten}</span>
        <span className="rounded-full bg-surface px-3 py-1 tabular-nums text-ink">{kq.current.diem}</span>
      </div>
      <div className="relative mt-4 flex items-center justify-between" aria-hidden>
        <span className="absolute inset-x-2 top-1/2 border-0 border-t-2 border-dashed border-orange-400" />
        {ch.canh.map((_, k) => <span key={k} className={`relative rounded-full ${k < i || buoc === "xong" ? "h-3 w-3 bg-orange-500" : k === i ? "h-5 w-5 bg-orange-600 ring-4 ring-orange-300" : "h-3 w-3 bg-surface ring-2 ring-orange-300"}`} />)}
        <span className="relative text-lg">{ch.co}</span>
      </div>
    </div>
  );
  const khung = (con) => <div className="mt-6 overflow-hidden rounded-[2rem] bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.06)]">{dau}<div className="p-5">{con}</div></div>;

  if (buoc === "mo") return khung(<>
    <LoiLeon cam="nhay-mat">{ch.mo}</LoiLeon>
    <div className="mt-5 text-right">
      <button type="button" onClick={() => { phat("bam"); setBuoc("canh"); }} className="cursor-pointer rounded-full border-0 bg-orange-500 px-6 py-2.5 font-sans text-sm font-extrabold text-white">{tr("Lên đường", "C'est parti", "Let's go")} →</button>
    </div>
  </>);

  if (buoc === "canh") {
    const c = ch.canh[i];
    const tra = (k) => {
      const st = kq.current; if (chon != null) return;
      setChon(k); const ok = k === 0; st.tong++; phat(ok ? "dung" : "sai");
      if (ok) { st.dung++; st.diem += 100; } else { setMang((m) => m - 1); }
    };
    const nhac = () => {
      if (bo || chon != null) return;
      // Gạch 2 phương án sai (chỉ số khác 0), trừ 50 điểm, không xuống dưới 0.
      setBo(tron([1, 2, 3].filter((k) => k < c.pa.length)).slice(0, 2));
      kq.current.diem = Math.max(0, kq.current.diem - 50); phat("bam");
    };
    const tiep = () => {
      setChon(null); setBo(null);
      if (mang <= 0 || i + 1 >= ch.canh.length) {
        const qua = mang > 0;
        if (qua) { kq.current.diem += mang * 50; luuPL(ch.id, kq.current.diem); setTd(docPL()); phat("thang"); }
        setBuoc("xong");
      } else setI(i + 1);
    };
    return khung(<>
      <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-orange-600">📍 <span lang="fr">{c.noi}</span></p>
      <p className="m-0 mt-1 text-sm text-soft">{c.tinh}</p>
      {/* Người đối thoại nói trước (trái), câu trả lời của người chơi là bong bóng bên phải */}
      <div key={i} className="mcf-cau-vao mt-4 flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface2 text-2xl" aria-hidden>{c.hinh}</span>
        <div>
          <p className="m-0 text-xs font-bold text-soft" lang="fr">{c.ai}</p>
          <p lang="fr" className="m-0 mt-1 rounded-3xl rounded-tl-md bg-surface2 px-4 py-3 text-base text-ink">{c.noi_}</p>
        </div>
      </div>
      <CauTracNghiem key={i} pa={c.pa} onTra={tra} daChon={chon} laPhap kieu="thoai" bo={bo} />
      {chon == null && !bo && (
        <button type="button" onClick={nhac} className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-solid border-orange-300 bg-surface px-3 py-1.5 font-sans text-xs font-bold text-orange-700 dark:text-orange-300">
          <Leon cam="nhay-mat" size={22} /> {tr("Léon nhắc nhỏ (−50)", "Léon souffle (−50)", "Léon whispers (−50)")}
        </button>
      )}
      {chon != null && <>
        <div className="mcf-cau-vao mt-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface2 text-xl" aria-hidden>{c.hinh}</span>
          <p lang="fr" className="m-0 rounded-3xl rounded-tl-md bg-surface2 px-4 py-2.5 text-base text-ink">{chon === 0 ? c.dap : "… Pardon ?"}</p>
        </div>
        <LoiLeon cam={chon === 0 ? "duoc-do" : "hum"}>{chon === 0 ? tr("Chuẩn luôn! ", "Parfait ! ", "Spot on! ") : <>{tr("Câu hợp hơn là: ", "Il valait mieux dire : ", "Better to say: ")}<strong lang="fr">« {c.pa[0]} »</strong>. </>}{c.gt}</LoiLeon>
        <div className="mt-4 text-right">
          <button type="button" onClick={tiep} className="cursor-pointer rounded-full border-0 bg-orange-500 px-6 py-2.5 font-sans text-sm font-extrabold text-white">
            {mang <= 0 || i + 1 >= ch.canh.length ? tr("Kết thúc chương", "Fin du chapitre", "End of chapter") : tr("Tiếp tục", "Continuer", "Continue")} →
          </button>
        </div>
      </>}
    </>);
  }

  const qua = mang > 0;
  return khung(<>
    <LoiLeon cam={qua ? "yeu-qua" : "co-len"}>{qua ? ch.ket : tr("Hết tim rồi! Không sao, ở Paris ai cũng từng lúng túng. Thử lại chương này nhé, ta vẫn ở đây.", "Plus de cœurs ! Pas grave, tout le monde a ses débuts. On recommence ?", "Out of hearts! No worries, everyone stumbles at first. Try again?")}</LoiLeon>
    {qua && <p className="mcf-dong mx-auto mt-4 w-fit rounded-md border-4 border-double border-orange-500 px-3 py-1 font-mono text-sm font-black uppercase tracking-widest text-orange-600">{ch.co} {tr("Hoàn thành", "Terminé", "Complete")}</p>}
    <div className="mt-5 text-right">
      <button type="button" onClick={() => onXong({ diem: kq.current.diem, dung: kq.current.dung, tong: Math.max(1, kq.current.tong) })}
        className="cursor-pointer rounded-full border-0 bg-orange-500 px-6 py-2.5 font-sans text-sm font-extrabold text-white">{tr("Lưu điểm", "Enregistrer", "Save score")} →</button>
    </div>
  </>);
}
