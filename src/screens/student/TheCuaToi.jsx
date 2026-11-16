import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Plus, Search, Volume2, Pencil, Trash2, Check, X, Eye, EyeOff, Layers, ChevronDown, Loader2, Sparkles, FolderOpen } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";

/* Tab « Flashcard » của Học tập: thẻ của CHÍNH học sinh (bảng so_tu, RLS chỉ chủ dòng).
 * Làm lại 17/11 (chủ dự án: « dễ dùng hơn và cá nhân hoá hơn »), KHÔNG đổi lược đồ:
 *
 *   Dễ dùng   · thêm thẻ ngay trên trang (Enter để lưu, con trỏ về ô đầu để thêm liên tiếp), không
 *               còn hộp thoại; sửa thẻ tại chỗ (trước chỉ xoá được); tìm, lọc, sắp xếp; nghe từ.
 *   Cá nhân   · lời chào theo tên và việc của HÔM NAY; mỗi thẻ mang trạng thái nhớ của riêng bạn,
 *               suy từ lịch ôn SM-2 đã có (reps, lapses, interval_days): Mới, Đang học, Hay quên,
 *               Đã thuộc; NHÓM tự đặt (dùng lại cột ten_bai: thẻ ghi từ bài tập mang sẵn tên bài);
 *               ôn riêng đúng các thẻ đang lọc; « Che nghĩa » và cách sắp xếp nhớ theo máy.
 *
 * Không thêm số đếm mới: hai con số có từ trước (tổng thẻ, cần ôn hôm nay) giữ nguyên, phần còn
 * lại là dải tỉ lệ và nhãn. */

const LO_XO = { type: "spring", stiffness: 420, damping: 32 };
const homNay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const boDau = (x) => String(x ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

/* Trạng thái nhớ của một thẻ, suy từ lịch ôn. Thứ tự xét: hay quên thắng đã thuộc. */
export const trangThaiThe = (x) => (!x.reps ? "moi" : (x.lapses ?? 0) >= 2 ? "quen" : (x.interval_days ?? 0) >= 21 ? "thuoc" : "hoc");
const TT = () => ({
  moi: [tr("Mới", "Nouvelle", "New"), "bg-primary-soft text-primary", "bg-primary"],
  hoc: [tr("Đang học", "En cours", "Learning"), "bg-warn-soft text-warn", "bg-warn"],
  quen: [tr("Hay quên", "Souvent oubliée", "Often forgotten"), "bg-danger-soft text-danger", "bg-danger"],
  thuoc: [tr("Đã thuộc", "Acquise", "Mastered"), "bg-ok-soft text-ok", "bg-ok"],
});

const doc = (chu) => {
  try {
    const s = window.speechSynthesis; if (!s) return;
    s.cancel();
    const u = new window.SpeechSynthesisUtterance(chu); u.lang = "fr-FR"; u.rate = 0.9;
    s.speak(u);
  } catch { /* máy không có giọng đọc thì thôi */ }
};
const nho = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { /* bỏ qua */ } return null; };

const O_NHAP = "min-w-0 rounded-xl border-2 border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-[15px] text-ink outline-none transition-colors placeholder:text-soft focus:border-primary";

/* Thêm thẻ ngay trên trang. Lưu xong xoá ô, con trỏ về ô đầu: thêm mười từ không rời bàn phím. */
function ThemNhanh({ onThem, nhom }) {
  const [tu, setTu] = useState(""); const [nghia, setNghia] = useState(""); const [viDu, setViDu] = useState("");
  const [nh, setNh] = useState(() => nho("mcf-fc-nhom") || "");
  const [mo, setMo] = useState(false);
  const [tt, setTT] = useState(null);      // null | "dang" | { ok } | { loi }
  const oDau = useRef(null);
  const luu = async (e) => {
    e.preventDefault();
    if (!tu.trim() || !nghia.trim()) { setTT({ loi: tr("Cần cả từ tiếng Pháp và nghĩa.", "Il faut le mot et son sens.", "Both the French word and its meaning are needed.") }); return; }
    setTT("dang");
    const ok = await onThem({ tu, nghia, viDu, nhom: nh });
    if (!ok) { setTT({ loi: tr("Chưa lưu được, thử lại nhé.", "Échec, réessayez.", "Couldn't save, try again.") }); return; }
    phat("dung"); nho("mcf-fc-nhom", nh.trim());
    setTT({ ok: tu.trim() }); setTu(""); setNghia(""); setViDu("");
    oDau.current?.focus();
  };
  return (
    <form onSubmit={luu} className="rounded-3xl border border-solid border-line bg-surface p-4 shadow-sm">
      <p className="m-0 mb-2.5 flex items-center gap-2 text-sm font-extrabold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-ok-soft text-ok"><Plus size={16} strokeWidth={3} /></span>{tr("Thêm thẻ mới", "Nouvelle carte", "New card")}</p>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input ref={oDau} lang="fr" maxLength={120} value={tu} onChange={(e) => { setTu(e.target.value); setTT(null); }} className={`${O_NHAP} font-semibold`}
          placeholder={tr("Từ hoặc câu tiếng Pháp", "Mot ou phrase en français", "French word or phrase")} aria-label={tr("Mặt trước: tiếng Pháp", "Recto : français", "Front: French")} />
        <input maxLength={300} value={nghia} onChange={(e) => { setNghia(e.target.value); setTT(null); }} className={O_NHAP}
          placeholder={tr("Nghĩa", "Sens", "Meaning")} aria-label={tr("Mặt sau: nghĩa", "Verso : sens", "Back: meaning")} />
        <motion.button type="submit" disabled={tt === "dang"} whileTap={{ scale: 0.96 }}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary shadow-md disabled:opacity-60">
          {tt === "dang" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />} {tr("Thêm", "Ajouter", "Add")}
        </motion.button>
      </div>
      {mo && (
        <div className="mcf-cau-vao mt-2 grid gap-2 sm:grid-cols-2">
          <input lang="fr" maxLength={300} value={viDu} onChange={(e) => setViDu(e.target.value)} className={`${O_NHAP} text-sm`}
            placeholder={tr("Câu ví dụ (không bắt buộc)", "Exemple (facultatif)", "Example (optional)")} aria-label={tr("Câu ví dụ", "Exemple", "Example")} />
          <input list="mcf-fc-ds-nhom" maxLength={60} value={nh} onChange={(e) => setNh(e.target.value)} className={`${O_NHAP} text-sm`}
            placeholder={tr("Nhóm, ví dụ: Du lịch, Đề B1…", "Groupe, ex. : Voyage, Sujet B1…", "Group, e.g. Travel, B1 paper…")} aria-label={tr("Nhóm của thẻ", "Groupe de la carte", "Card group")} />
          <datalist id="mcf-fc-ds-nhom">{nhom.map((n) => <option key={n} value={n} />)}</datalist>
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo}
          className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-sans text-xs font-bold text-soft hover:text-primary">
          <ChevronDown size={14} className={`transition-transform duration-200 ${mo ? "rotate-180" : ""}`} /> {tr("Thêm ví dụ, xếp vào nhóm", "Exemple et groupe", "Example and group")}
        </button>
        {tt?.loi && <span className="mcf-rung text-xs font-bold text-danger">{tt.loi}</span>}
        {tt?.ok && <span className="text-xs font-bold text-ok">{tr(`Đã thêm « ${tt.ok} ». Gõ tiếp thẻ sau nhé.`, `« ${tt.ok} » ajoutée. Continuez.`, `Added « ${tt.ok} ». Keep going.`)}</span>}
        {!tt && <span className="text-xs text-soft">{tr("Nhấn Enter để lưu.", "Entrée pour enregistrer.", "Press Enter to save.")}</span>}
      </div>
    </form>
  );
}

/* Một thẻ: xem, nghe, che/hiện nghĩa, sửa tại chỗ, xoá. */
function MotThe({ x, i, che, nhom, onSua, onXoa }) {
  const [sua, setSua] = useState(null);     // null | { tu, nghia, viDu, nhom, dang, loi }
  const [hien, setHien] = useState(false);
  useEffect(() => { setHien(false); }, [che]);
  const ds = TT();
  const tt = trangThaiThe(x);
  const denHan = String(x.due_at) <= homNay();
  const luu = async (e) => {
    e.preventDefault();
    if (!sua.tu.trim() || !sua.nghia.trim()) { setSua({ ...sua, loi: true }); return; }
    setSua({ ...sua, dang: true, loi: false });
    const ok = await onSua(x, { tu: sua.tu, nghia: sua.nghia, viDu: sua.viDu, nhom: sua.nhom });
    if (ok) { phat("dung"); setSua(null); } else setSua((s) => ({ ...s, dang: false, loi: true }));
  };
  if (sua) return (
    <li className="rounded-2xl border-2 border-solid border-primary/50 bg-surface p-3 shadow-md">
      <form onSubmit={luu} className="grid gap-2">
        <input lang="fr" autoFocus maxLength={120} value={sua.tu} onChange={(e) => setSua({ ...sua, tu: e.target.value })} className={`${O_NHAP} py-2 font-semibold`} aria-label={tr("Tiếng Pháp", "Français", "French")} />
        <input maxLength={300} value={sua.nghia} onChange={(e) => setSua({ ...sua, nghia: e.target.value })} className={`${O_NHAP} py-2`} aria-label={tr("Nghĩa", "Sens", "Meaning")} />
        <input lang="fr" maxLength={300} value={sua.viDu} onChange={(e) => setSua({ ...sua, viDu: e.target.value })} className={`${O_NHAP} py-2 text-sm`} placeholder={tr("Câu ví dụ", "Exemple", "Example")} aria-label={tr("Câu ví dụ", "Exemple", "Example")} />
        <input list="mcf-fc-ds-nhom" maxLength={60} value={sua.nhom} onChange={(e) => setSua({ ...sua, nhom: e.target.value })} className={`${O_NHAP} py-2 text-sm`} placeholder={tr("Nhóm", "Groupe", "Group")} aria-label={tr("Nhóm", "Groupe", "Group")} />
        {sua.loi && <p className="m-0 text-xs font-bold text-danger">{tr("Chưa lưu được. Cần cả từ và nghĩa; nếu đủ rồi thì thử lại.", "Non enregistré. Il faut le mot et le sens.", "Not saved. Both word and meaning are needed.")}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setSua(null)} className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-sm font-bold text-ink"><X size={15} /> {tr("Huỷ", "Annuler", "Cancel")}</button>
          <button type="submit" disabled={sua.dang} className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-0 bg-primary px-3 py-2 font-sans text-sm font-extrabold text-on-primary disabled:opacity-60">{sua.dang ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} strokeWidth={3} />} {tr("Lưu", "Enregistrer", "Save")}</button>
        </div>
      </form>
    </li>
  );
  const giau = che && !hien;
  return (
    <li style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
      className={`mcf-cau-vao group relative flex flex-col overflow-hidden rounded-2xl border border-solid bg-surface p-3.5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${denHan ? "border-warn/50" : "border-line"}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${ds[tt][2]}`} />
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p lang="fr" className="m-0 break-words text-base font-extrabold leading-snug text-ink">{x.matTruoc}</p>
          {giau ? (
            <button type="button" onClick={() => { phat("lat"); setHien(true); }}
              className="mt-1 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-line-strong bg-surface2 px-2.5 py-1 font-sans text-xs font-bold text-soft hover:border-primary hover:text-primary">
              <Eye size={13} /> {tr("Bấm để xem nghĩa", "Voir le sens", "Show meaning")}
            </button>
          ) : <p className={`m-0 mt-0.5 break-words text-sm text-soft ${che ? "mcf-cau-vao" : ""}`}>{x.matSau}</p>}
          {x.ghiChu && !giau && <p lang="fr" className="m-0 mt-1 break-words text-xs italic text-soft">{x.ghiChu}</p>}
        </div>
        <button type="button" onClick={() => doc(x.matTruoc)} title={tr("Nghe", "Écouter", "Listen")} aria-label={tr("Nghe từ này", "Écouter ce mot", "Listen to this word")}
          className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-primary-soft text-primary transition-transform hover:scale-110 active:scale-95"><Volume2 size={15} /></button>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${ds[tt][1]}`}>{ds[tt][0]}</span>
        <span className={`text-[11px] font-bold ${denHan ? "text-warn" : "text-soft"}`}>
          {denHan ? tr("Cần ôn hôm nay", "À réviser aujourd'hui", "Due today") : tr(`Ôn lại ${String(x.due_at).split("-").reverse().slice(0, 2).join("/")}`, `Révision le ${String(x.due_at).split("-").reverse().slice(0, 2).join("/")}`, `Next ${String(x.due_at).split("-").reverse().slice(0, 2).join("/")}`)}
        </span>
        {x.nhom && <span className="inline-flex min-w-0 max-w-[9rem] items-center gap-1 truncate rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-bold text-soft" title={x.nhom}><FolderOpen size={11} className="shrink-0" /><span className="truncate">{x.nhom}</span></span>}
        <span className="ml-auto flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button type="button" onClick={() => setSua({ tu: x.matTruoc, nghia: x.nghia ?? "", viDu: x.ghiChu ?? "", nhom: x.nhom ?? "" })} title={tr("Sửa thẻ", "Modifier", "Edit")} aria-label={tr("Sửa thẻ", "Modifier la carte", "Edit card")}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-primary-soft hover:text-primary"><Pencil size={13} /></button>
          <button type="button" onClick={() => onXoa(x)} title={tr("Xoá thẻ", "Supprimer", "Delete")} aria-label={tr("Xoá thẻ", "Supprimer la carte", "Delete card")}
            className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-danger-soft hover:text-danger"><Trash2 size={13} /></button>
        </span>
      </div>
    </li>
  );
}

export default function TheCuaToi({ soTu, ten, onOn, onOnLoc, onThem, onSua, onXoa }) {
  const [tim, setTim] = useState("");
  const [loc, setLoc] = useState("tat");                 // tat | han | moi | hoc | quen | thuoc
  const [nhomChon, setNhomChon] = useState("");
  const [sap, setSap] = useState(() => nho("mcf-fc-sap") || "moi");   // moi | han | az
  const [che, setChe] = useState(() => nho("mcf-fc-che") === "1");
  const nay = homNay();
  const ds = Array.isArray(soTu) ? soTu : [];
  const nhom = useMemo(() => [...new Set(ds.map((x) => x.nhom).filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi")), [ds]);
  const hien = useMemo(() => {
    const k = boDau(tim.trim());
    const r = ds.filter((x) => (loc === "tat" || (loc === "han" ? String(x.due_at) <= nay : trangThaiThe(x) === loc))
      && (!nhomChon || x.nhom === nhomChon)
      && (!k || boDau(x.matTruoc).includes(k) || boDau(x.matSau).includes(k)));
    if (sap === "az") r.sort((a, b) => a.matTruoc.localeCompare(b.matTruoc, "fr"));
    else if (sap === "han") r.sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)));
    else r.sort((a, b) => String(b.taoLuc ?? "").localeCompare(String(a.taoLuc ?? "")));
    return r;
  }, [ds, tim, loc, nhomChon, sap, nay]);

  if (soTu === undefined) return <p className="m-0 flex items-center justify-center gap-2 py-10 text-sm text-soft"><Loader2 size={16} className="animate-spin" /> {tr("Đang tải thẻ của bạn…", "Chargement de vos cartes…", "Loading your cards…")}</p>;
  if (soTu === null) return <p className="m-0 rounded-2xl bg-danger-soft p-5 text-center text-sm font-semibold text-danger">{tr("Không đọc được thẻ của bạn. Tải lại trang thử nhé.", "Chargement impossible.", "Couldn't load your cards.")}</p>;

  const denHan = ds.filter((x) => String(x.due_at) <= nay).length;
  const quen = ds.some((x) => trangThaiThe(x) === "quen");
  const TTs = TT();
  const tiLe = ["moi", "hoc", "quen", "thuoc"].map((k) => [k, ds.filter((x) => trangThaiThe(x) === k).length]).filter((p) => p[1]);
  const goi = ten ? String(ten).trim().split(/\s+/)[0] : "";
  const dangLoc = loc !== "tat" || !!nhomChon || !!tim.trim();
  const LOC = [["tat", tr("Tất cả", "Toutes", "All")], ["han", tr("Cần ôn hôm nay", "À réviser", "Due today")], ["moi", TTs.moi[0]], ["hoc", TTs.hoc[0]], ["quen", TTs.quen[0]], ["thuoc", TTs.thuoc[0]]];

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-4">
        {/* Việc của hôm nay, nói với đúng người đang học. */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={LO_XO}
          className="flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-4 shadow-sm">
          <Leon cam={!ds.length ? "chao" : denHan ? "quyet-tam" : "yeah"} size={72} className="shrink-0" />
          <div className="min-w-[12rem] flex-1">
            <p className="m-0 text-lg font-extrabold leading-snug text-ink">
              {!ds.length ? tr(`${goi ? goi + " ơi, " : ""}tạo thẻ đầu tiên của bạn nhé`, `${goi ? goi + ", " : ""}créez votre première carte`, `${goi ? goi + ", " : ""}make your first card`)
                : denHan ? tr(`${goi ? goi + " ơi, " : ""}hôm nay có ${denHan} thẻ đến lúc ôn`, `${goi ? goi + ", " : ""}${denHan} carte(s) à réviser aujourd'hui`, `${goi ? goi + ", " : ""}${denHan} card(s) to review today`)
                  : tr(`${goi ? goi + " ơi, " : ""}hôm nay bạn đã ôn đủ rồi`, `${goi ? goi + ", " : ""}rien à réviser aujourd'hui`, `${goi ? goi + ", " : ""}nothing left to review today`)}
            </p>
            <p className="m-0 mt-0.5 text-sm text-soft">
              {!ds.length ? tr("Gõ một từ ở ô bên dưới, hoặc bôi đen một từ khi làm bài rồi chọn « Ghi vào sổ từ ».", "Tapez un mot ci-dessous, ou sélectionnez un mot pendant un exercice.", "Type a word below, or select a word while doing an exercise.")
                : denHan ? tr("Ôn đúng lúc sắp quên thì nhớ lâu nhất. Mất vài phút thôi.", "Réviser juste avant d'oublier, c'est ce qui fixe le mieux.", "Reviewing just before you forget is what sticks best.")
                  : quen ? tr("Còn vài thẻ bạn hay quên: luyện thêm riêng các thẻ đó cho chắc.", "Quelques cartes vous échappent encore : travaillez-les à part.", "A few cards keep slipping: practise just those.")
                    : tr("Thêm từ mới gặp hôm nay, hoặc luyện thêm cho chắc.", "Ajoutez les mots du jour, ou entraînez-vous encore.", "Add today's new words, or practise some more.")}
            </p>
            {tiLe.length > 0 && (
              <div className="mt-3">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-surface2" role="img" aria-label={tr("Tỉ lệ thẻ theo mức nhớ", "Répartition des cartes par niveau de mémoire", "Cards by memory level")}>
                  {tiLe.map(([k, n], j) => <motion.span key={k} initial={{ flexGrow: 0 }} animate={{ flexGrow: n }} transition={{ ...LO_XO, delay: 0.15 + j * 0.08 }} className={`h-full ${TTs[k][2]}`} style={{ flexBasis: 0 }} />)}
                </div>
                <p className="m-0 mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-soft">
                  {tiLe.map(([k]) => <span key={k} className="inline-flex items-center gap-1"><span aria-hidden className={`h-2 w-2 rounded-full ${TTs[k][2]}`} />{TTs[k][0]}</span>)}
                </p>
              </div>
            )}
          </div>
          {ds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <motion.button type="button" onClick={onOn} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border-0 px-5 py-3 font-sans text-sm font-extrabold shadow-md ${denHan ? "mcf-lt-nhip bg-primary text-on-primary" : "bg-surface2 text-ink"}`}>
                <Layers size={17} /> {denHan ? tr("Ôn ngay", "Réviser", "Review now") : tr("Luyện thêm", "S'entraîner", "Practise")}
              </motion.button>
              {quen && (
                <motion.button type="button" onClick={() => onOnLoc(ds.filter((x) => trangThaiThe(x) === "quen").map((x) => x.id), TTs.quen[0])} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border-0 bg-danger-soft px-5 py-3 font-sans text-sm font-extrabold text-danger">
                  <Sparkles size={16} /> {tr("Luyện thẻ hay quên", "Cartes difficiles", "Tricky cards")}
                </motion.button>
              )}
            </div>
          )}
        </motion.section>

        <ThemNhanh onThem={onThem} nhom={nhom} />

        {ds.length > 0 && (
          <section className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-[12rem] flex-1 items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-3 py-2 shadow-sm transition-colors focus-within:border-primary">
                <Search size={15} className="shrink-0 text-soft" />
                <input type="search" value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm trong thẻ của bạn", "Chercher dans vos cartes", "Search your cards")}
                  aria-label={tr("Tìm trong thẻ của bạn", "Chercher dans vos cartes", "Search your cards")} className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-soft" />
              </label>
              <select value={sap} onChange={(e) => { setSap(e.target.value); nho("mcf-fc-sap", e.target.value); }} aria-label={tr("Sắp xếp", "Trier", "Sort")}
                className="cursor-pointer rounded-2xl border border-solid border-line bg-surface px-3 py-2.5 font-sans text-sm font-bold text-ink shadow-sm outline-none focus:border-primary">
                <option value="moi">{tr("Mới thêm trước", "Les plus récentes", "Newest first")}</option>
                <option value="han">{tr("Sắp đến hạn ôn trước", "À réviser d'abord", "Due soonest first")}</option>
                <option value="az">{tr("Theo chữ cái", "Ordre alphabétique", "Alphabetical")}</option>
              </select>
              <button type="button" onClick={() => { const v = !che; setChe(v); nho("mcf-fc-che", v ? "1" : "0"); phat("bam"); }} aria-pressed={che}
                title={tr("Che nghĩa để tự kiểm tra", "Masquer le sens pour se tester", "Hide meanings to test yourself")}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-solid px-3.5 py-2.5 font-sans text-sm font-bold shadow-sm transition-colors ${che ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-ink hover:border-primary"}`}>
                {che ? <EyeOff size={15} /> : <Eye size={15} />} {tr("Che nghĩa", "Masquer le sens", "Hide meanings")}
              </button>
            </div>
            <div role="tablist" aria-label={tr("Lọc theo mức nhớ", "Filtrer par mémoire", "Filter by memory")} className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-surface p-1 shadow-sm">
              {LOC.map(([k, nhan]) => {
                const chon = loc === k;
                return (
                  <button key={k} type="button" role="tab" aria-selected={chon} onClick={() => { if (!chon) phat("bam"); setLoc(k); }}
                    className={`relative shrink-0 cursor-pointer rounded-xl border-0 bg-transparent px-3.5 py-2 font-sans text-sm font-bold transition-colors ${chon ? "text-on-primary" : "text-soft hover:text-ink"}`}>
                    {chon && <motion.span layoutId="fc-loc" aria-hidden transition={LO_XO} className="absolute inset-0 rounded-xl bg-primary shadow-sm" />}
                    <span className="relative">{nhan}</span>
                  </button>
                );
              })}
            </div>
            {nhom.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide text-soft"><FolderOpen size={13} /> {tr("Nhóm của bạn", "Vos groupes", "Your groups")}</span>
                {nhom.map((n) => {
                  const chon = nhomChon === n;
                  return (
                    <button key={n} type="button" aria-pressed={chon} onClick={() => { phat("bam"); setNhomChon(chon ? "" : n); }} title={n}
                      className={`max-w-[12rem] cursor-pointer truncate rounded-full border border-solid px-3 py-1 font-sans text-xs font-bold transition-colors ${chon ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-soft hover:border-primary hover:text-ink"}`}>{n}</button>
                  );
                })}
              </div>
            )}
            {!hien.length ? (
              <div className="flex items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-4">
                <Leon cam="hum" size={56} className="shrink-0" />
                <p className="m-0 text-sm text-soft">{tr("Không có thẻ nào khớp bộ lọc này. Đổi bộ lọc hoặc xoá chữ đang tìm.", "Aucune carte ne correspond. Changez de filtre.", "No card matches. Change the filter.")}</p>
              </div>
            ) : (
              <>
                {dangLoc && (
                  <button type="button" onClick={() => onOnLoc(hien.map((x) => x.id), nhomChon || LOC.find((l) => l[0] === loc)?.[1] || "")}
                    className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-extrabold text-primary shadow-sm transition-colors hover:border-primary">
                    <Layers size={15} /> {tr("Luyện riêng các thẻ đang lọc", "S'entraîner sur ces cartes", "Practise just these cards")}
                  </button>
                )}
                <ul key={`${loc}|${nhomChon}|${sap}`} className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {hien.map((x, i) => <MotThe key={x.id} x={x} i={i} che={che} nhom={nhom} onSua={onSua} onXoa={onXoa} />)}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </MotionConfig>
  );
}
