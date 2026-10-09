import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus, Trash2, ArrowLeft, Eye, EyeOff, AlertTriangle, RefreshCw, Layers, Pencil, Check, X, Search, Lock, Unlock,
} from "lucide-react";
import { KY_NANG } from "../../shared/kyNang.js";
import { laGiaoVien } from "../../shared/lienHe.js";
import {
  docBoDeSoan, taoBo, suaBo, xoaBo, docChuDe,
  docTheDeSoan, themThe, suaThe, xoaThe, bocDong, dsHocSinhCapQuyen, dsQuyenBo, datQuyenBo,
} from "../../shared/boTheGiaoVien.js";
import { tr } from "../../shared/i18n.jsx";

/* Soạn Flashcard — màn của giáo viên. Làm lại giao diện 07/10.
 *
 *   Danh sách: lưới thẻ bộ, lọc theo kỹ năng, nút « Bộ mới » mở khung tạo.
 *   Soạn một bộ: trái là khung thêm (từng thẻ hoặc dán nhiều dòng), phải là
 *   lưới thẻ sửa/xoá TẠI CHỖ, có ô tìm. Tên, mô tả, kỹ năng của bộ sửa được
 *   ngay ở đầu trang.
 *
 * ══ BA TRẠNG THÁI, KHÔNG HAI ══ (giữ từ bản cũ)
 * Danh sách rỗng không phân biệt được "chưa soạn bộ nào" với "không phải giáo
 * viên" hay "mất mạng", nên vai được hỏi RIÊNG bằng `laGiaoVien()`.
 */

const o = "w-full rounded-xl border border-solid border-line bg-surface2 px-3 py-2 font-sans text-sm text-ink outline-none focus:border-primary";
const nutChinh = "inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60";
const nutPhu = "inline-flex cursor-pointer items-center gap-2 rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-primary";
const tenKN = (ma) => KY_NANG.find((k) => k.ma === ma)?.ten ?? ma;

/* Chủ đề cho Thách đấu (127). Nạp một lần, dùng chung cho hai ô chọn. */
let _chuDe = null;
function useChuDe() {
  const [ds, setDs] = useState(_chuDe);
  useEffect(() => { if (!_chuDe) docChuDe().then((v) => { _chuDe = v || []; setDs(_chuDe); }); }, []);
  return ds || [];
}
const tenCD = (c) => (c ? tr(c.ten_vi, c.ten_fr, c.ten_en) : "");
function ChonChuDe({ value, onChange, className }) {
  const ds = useChuDe();
  return (
    <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={className}
      aria-label={tr("Chủ đề thách đấu", "Thème des défis", "Duel topic")}>
      <option value="">{tr("Chủ đề thách đấu: chưa chọn", "Thème des défis : aucun", "Duel topic: none")}</option>
      {["tu_vung", "ngu_phap"].map((n) => (
        <optgroup key={n} label={n === "tu_vung" ? tr("Từ vựng", "Vocabulaire", "Vocabulary") : tr("Ngữ pháp và diễn đạt", "Grammaire et expression", "Grammar and expression")}>
          {ds.filter((c) => c.nhom === n).map((c) => <option key={c.ma} value={c.ma}>{tenCD(c)}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

/* ─────────────── Tạo bộ mới ─────────────── */
function KhungTaoBo({ onXong, onHuy }) {
  const [ten, setTen] = useState("");
  const [kyNang, setKyNang] = useState("CO");
  const [chuDe, setChuDe] = useState("");
  const [moTa, setMoTa] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const luu = async () => {
    if (!ten.trim()) { setLoi(tr("Bộ Flashcard cần một cái tên.", "Le paquet a besoin d'un nom.", "The deck needs a name.")); return; }
    setDangLuu(true); setLoi("");
    const kq = await taoBo({ ten, kyNang, chuDe, moTa });
    setDangLuu(false);
    if (!kq.ok) { setLoi(kq.loi); return; }
    onXong();
  };
  return (
    <div className="mt-5 rounded-3xl border border-solid border-primary/40 bg-surface p-5 shadow-sm">
      <h2 className="m-0 text-base font-extrabold text-ink">{tr("Bộ Flashcard mới", "Nouveau paquet", "New deck")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_160px]">
        <input autoFocus value={ten} onChange={(e) => setTen(e.target.value)} placeholder={tr("Tên bộ, ví dụ: Thông báo ở nhà ga", "Nom du paquet, ex. : Annonces en gare", "Deck name, e.g. Station announcements")} className={o} />
        <select value={kyNang} onChange={(e) => setKyNang(e.target.value)} className={`${o} font-semibold`}>
          {KY_NANG.map((k) => <option key={k.ma} value={k.ma}>{k.ten}</option>)}
        </select>
      </div>
      <input value={moTa} onChange={(e) => setMoTa(e.target.value)} placeholder={tr("Mô tả ngắn (tuỳ chọn)", "Courte description (facultatif)", "Short description (optional)")} className={`${o} mt-3`} />
      <ChonChuDe value={chuDe} onChange={setChuDe} className={`${o} mt-3`} />
      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onHuy} className={nutPhu}>{tr("Huỷ", "Annuler", "Cancel")}</button>
        <button type="button" onClick={luu} disabled={dangLuu} className={nutChinh}><Plus size={14} /> {dangLuu ? tr("Đang tạo…", "Création…", "Creating…") : tr("Tạo bộ", "Créer le paquet", "Create deck")}</button>
      </div>
    </div>
  );
}

/* ─────────────── Trả phí + cấp quyền (128) ───────────────
   Giống thư viện bài tập: bộ trả phí thì học sinh thấy bộ nhưng không mở được
   thẻ, trừ khi là VIP hoặc được giáo viên cấp quyền ở đây. */
function TraPhiVaQuyen({ bo, onDoi, onLoi }) {
  const [mo, setMo] = useState(false);
  const [traPhi, setTraPhi] = useState(!!bo.traPhi);
  const [gia, setGia] = useState(bo.gia || 0);
  const [hs, setHs] = useState(undefined);
  const [co, setCo] = useState(new Set());
  const [tim, setTim] = useState("");
  const [dang, setDang] = useState(false);
  useEffect(() => { setTraPhi(!!bo.traPhi); setGia(bo.gia || 0); }, [bo.traPhi, bo.gia]);
  useEffect(() => {
    if (!mo) return;
    dsHocSinhCapQuyen().then(setHs);
    dsQuyenBo(bo.id).then((v) => setCo(v || new Set()));
  }, [mo, bo.id]);
  const luuGia = async () => {
    setDang(true);
    const kq = await suaBo(bo.id, { traPhi, gia });
    setDang(false);
    if (!kq.ok) { onLoi(kq.loi); return; }
    onDoi({ traPhi, gia: Math.max(0, Math.round(Number(gia) || 0)) });
  };
  const doi = async (id) => {
    const bat = !co.has(id);
    const kq = await datQuyenBo(bo.id, id, bat);
    if (!kq.ok) { onLoi(kq.loi); return; }
    const m = new Set(co); if (bat) m.add(id); else m.delete(id); setCo(m);
  };
  const hien = (hs || []).filter((h) => !tim.trim() || `${h.ten} ${h.username ?? ""}`.toLowerCase().includes(tim.trim().toLowerCase()));
  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setMo(!mo)}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-4 py-2 font-sans text-sm font-bold ${bo.traPhi ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-surface2 text-ink"}`}>
        {bo.traPhi ? <Lock size={14} /> : <Unlock size={14} />}
        {bo.traPhi ? tr(`Trả phí · ${(bo.gia || 0).toLocaleString("vi-VN")}đ`, `Payant · ${(bo.gia || 0).toLocaleString("vi-VN")} ₫`, `Paid · ${(bo.gia || 0).toLocaleString("vi-VN")} VND`) : tr("Miễn phí", "Gratuit", "Free")}
        <span className="text-soft">· {tr("cấp quyền", "accès", "access")}</span>
      </button>
      {mo && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(92vw,380px)] rounded-3xl border border-solid border-line bg-surface p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <p className="m-0 text-sm font-extrabold text-ink">{tr("Trả phí", "Accès payant", "Paid access")}</p>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={traPhi} onChange={(e) => setTraPhi(e.target.checked)} />
            {tr("Bộ này là bản trả phí", "Ce paquet est payant", "This deck is paid")}
          </label>
          {traPhi && (
            <label className="mt-2 grid gap-1 text-xs font-bold text-soft">{tr("Giá (VNĐ)", "Prix (VND)", "Price (VND)")}
              <input type="number" min={0} step={1000} value={gia} onChange={(e) => setGia(e.target.value)} className={o} /></label>
          )}
          <p className="m-0 mt-2 text-[11px] leading-relaxed text-soft">{tr("Học sinh thấy bộ kèm ổ khoá; VIP và học sinh được cấp quyền mở được. Bộ trả phí không vào Thách đấu.", "Les élèves voient le paquet verrouillé ; les VIP et les élèves autorisés peuvent l'ouvrir. Les paquets payants ne sont pas utilisés dans les défis.", "Students see the deck locked; VIPs and granted students can open it. Paid decks aren't used in duels.")}</p>
          <button type="button" onClick={luuGia} disabled={dang} className={`${nutChinh} mt-3 w-full justify-center`}><Check size={14} /> {tr("Lưu", "Enregistrer", "Save")}</button>

          <div className="mt-4 border-0 border-t border-solid border-line pt-3">
            <p className="m-0 text-sm font-extrabold text-ink">{tr("Cấp quyền cho học sinh", "Accès des élèves", "Grant access")} <span className="font-semibold text-soft">· {co.size}</span></p>
            <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm học sinh…", "Rechercher un élève…", "Find a student…")} className={`${o} mt-2`} />
            <ul className="mcf-scroll m-0 mt-2 grid max-h-56 list-none gap-1 overflow-y-auto p-0">
              {hs === undefined && <li className="text-xs text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</li>}
              {hs === null && <li className="text-xs text-danger">{tr("Không đọc được danh sách học sinh.", "Liste des élèves indisponible.", "Couldn't load students.")}</li>}
              {hien.map((h) => (
                <li key={h.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-ink hover:bg-surface2">
                    <input type="checkbox" checked={co.has(h.id)} onChange={() => doi(h.id)} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{h.ten}</span>
                    {h.username && <span className="text-xs text-soft">@{h.username}</span>}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Một thẻ trong lưới (xem / sửa tại chỗ) ─────────────── */
function OThe({ t, so, onDoi, onLoi }) {
  const [sua, setSua] = useState(false);
  const [b, setB] = useState(t);
  const [dang, setDang] = useState(false);
  useEffect(() => setB(t), [t]);
  const luu = async () => {
    if (!b.matTruoc.trim() || !b.matSau.trim()) { onLoi(tr("Thẻ cần đủ mặt trước và mặt sau.", "La carte doit avoir un recto et un verso.", "A card needs a front and a back.")); return; }
    setDang(true);
    const kq = await suaThe(t.id, b);
    setDang(false);
    if (!kq.ok) { onLoi(kq.loi); return; }
    setSua(false); onDoi();
  };
  const xoa = async () => {
    if (!window.confirm(tr(`Xoá thẻ « ${t.matTruoc} »?`, `Supprimer la carte « ${t.matTruoc} » ?`, `Delete card « ${t.matTruoc} »?`))) return;
    const kq = await xoaThe(t.id);
    if (!kq.ok) { onLoi(kq.loi); return; }
    onDoi();
  };
  if (sua) {
    return (
      <li className="grid gap-2 rounded-2xl border border-solid border-primary bg-surface p-3">
        <input value={b.matTruoc} onChange={(e) => setB({ ...b, matTruoc: e.target.value })} className={o} placeholder={tr("Mặt trước", "Recto", "Front")} />
        <input value={b.phienAm ?? ""} onChange={(e) => setB({ ...b, phienAm: e.target.value })} className={o} placeholder={tr("Phiên âm (tuỳ chọn)", "Phonétique (facultatif)", "Pronunciation (optional)")} />
        <input value={b.matSau} onChange={(e) => setB({ ...b, matSau: e.target.value })} className={o} placeholder={tr("Mặt sau", "Verso", "Back")} />
        <input value={b.viDu ?? ""} onChange={(e) => setB({ ...b, viDu: e.target.value })} className={o} placeholder={tr("Câu ví dụ (tuỳ chọn)", "Phrase d'exemple (facultatif)", "Example sentence (optional)")} />
        <input value={Array.isArray(b.nhieu) ? b.nhieu.join(" | ") : (b.nhieu ?? "")} onChange={(e) => setB({ ...b, nhieu: e.target.value })} className={o}
          placeholder={tr("3 nghĩa sai cho Thách đấu: a | b | c", "3 mauvais sens pour les défis : a | b | c", "3 wrong meanings for duels: a | b | c")} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setB(t); setSua(false); }} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft" aria-label={tr("Huỷ", "Annuler", "Cancel")}><X size={14} /></button>
          <button type="button" onClick={luu} disabled={dang} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-primary text-white" aria-label={tr("Lưu", "Enregistrer", "Save")}><Check size={14} /></button>
        </div>
      </li>
    );
  }
  return (
    <li className="group relative flex min-h-[112px] flex-col rounded-2xl border border-solid border-line bg-surface p-4 transition-shadow hover:shadow-md">
      <span className="text-[11px] font-bold tabular-nums text-soft">#{so}</span>
      <p className="m-0 mt-1 text-[15px] font-extrabold leading-snug text-ink">{t.matTruoc}</p>
      {t.phienAm && <p className="m-0 text-xs italic text-soft">{t.phienAm}</p>}
      <div className="my-2 h-px bg-line" />
      <p className="m-0 text-sm leading-relaxed text-ink">{t.matSau}</p>
      {t.viDu && <p className="m-0 mt-1 text-xs italic leading-relaxed text-soft">{t.viDu}</p>}
      {t.nhieu?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1" title={tr("Phương án sai dùng trong Thách đấu", "Mauvaises réponses utilisées dans les défis", "Wrong options used in duels")}>
          {t.nhieu.map((x, k) => <span key={k} className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger line-through decoration-danger/40">{x}</span>)}
        </div>
      )}
      <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button type="button" onClick={() => setSua(true)} aria-label={tr("Sửa thẻ", "Modifier la carte", "Edit card")} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-ink"><Pencil size={13} /></button>
        <button type="button" onClick={xoa} aria-label={tr("Xoá thẻ", "Supprimer la carte", "Delete card")} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-danger"><Trash2 size={13} /></button>
      </div>
    </li>
  );
}

/* ─────────────── Soạn một bộ ─────────────── */
function SoanMotBo({ bo: boGoc, onQuay, onDoi }) {
  const [bo, setBo] = useState(boGoc);
  const [ds, setDs] = useState(undefined);
  const [che, setChe] = useState("mot");          // mot | lo
  const [moi, setMoi] = useState({ matTruoc: "", matSau: "", phienAm: "", viDu: "", nhieu: "" });
  const [van, setVan] = useState("");
  const [hong, setHong] = useState([]);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [tb, setTb] = useState("");
  const [tim, setTim] = useState("");
  const [suaTT, setSuaTT] = useState(false);
  const [tt, setTT] = useState({ ten: boGoc.ten, moTa: boGoc.moTa ?? "", kyNang: boGoc.kyNang, chuDe: boGoc.chuDe ?? "" });
  const oDau = useRef(null);

  const tai = async () => setDs(await docTheDeSoan(bo.id));
  useEffect(() => { let c = true; docTheDeSoan(bo.id).then((v) => { if (c) setDs(v); }); return () => { c = false; }; }, [bo.id]);
  const bao = (s) => { setTb(s); setTimeout(() => setTb(""), 2500); };

  const them1 = async () => {
    if (!moi.matTruoc.trim() || !moi.matSau.trim()) { setLoi(tr("Cần đủ mặt trước và mặt sau.", "Recto et verso obligatoires.", "Front and back are required.")); return; }
    setDangLuu(true); setLoi("");
    const kq = await themThe(bo.id, moi, ds?.length ?? 0);
    setDangLuu(false);
    if (!kq.ok) { setLoi(kq.loi); return; }
    setMoi({ matTruoc: "", matSau: "", phienAm: "", viDu: "", nhieu: "" });
    oDau.current?.focus();
    await tai(); onDoi(); bao(tr("Đã thêm 1 thẻ", "1 carte ajoutée", "1 card added"));
  };

  const themLo = async () => {
    const { duoc, hong: h } = bocDong(van);
    setHong(h);
    if (!duoc.length) { setLoi(tr("Không có dòng nào hợp lệ.", "Aucune ligne valide.", "No valid lines.")); return; }
    setDangLuu(true); setLoi("");
    /* Chèn TUẦN TỰ và dừng ở lỗi đầu tiên: PostgREST không có transaction,
       dừng sớm thì số thẻ vào được là con số nói ra được. */
    const batDau = ds?.length ?? 0;
    let vao = 0;
    for (const t of duoc) {
      const kq = await themThe(bo.id, t, batDau + vao);
      if (!kq.ok) { setLoi(tr(`${kq.loi} (dừng sau ${vao} thẻ)`, `${kq.loi} (arrêt après ${vao} carte(s))`, `${kq.loi} (stopped after ${vao} card(s))`)); break; }
      vao += 1;
    }
    setDangLuu(false);
    if (vao) { setVan(""); await tai(); onDoi(); bao(tr(`Đã thêm ${vao} thẻ`, `${vao} carte(s) ajoutée(s)`, `${vao} card(s) added`)); }
  };

  const luuTT = async () => {
    if (!tt.ten.trim()) { setLoi(tr("Bộ cần một cái tên.", "Le paquet a besoin d'un nom.", "The deck needs a name.")); return; }
    const kq = await suaBo(bo.id, tt);
    if (!kq.ok) { setLoi(kq.loi); return; }
    setBo({ ...bo, ...tt }); setSuaTT(false); onDoi(); bao(tr("Đã lưu thông tin bộ", "Paquet enregistré", "Deck saved"));
  };
  const doiCongKhai = async () => {
    const kq = await suaBo(bo.id, { congKhai: !bo.congKhai });
    if (!kq.ok) { setLoi(kq.loi); return; }
    setBo({ ...bo, congKhai: !bo.congKhai }); onDoi();
  };

  const loc = useMemo(() => {
    const k = tim.trim().toLowerCase();
    return (ds ?? []).map((t, i) => ({ t, so: i + 1 }))
      .filter(({ t }) => !k || `${t.matTruoc} ${t.matSau} ${t.phienAm ?? ""}`.toLowerCase().includes(k));
  }, [ds, tim]);
  const xemLo = useMemo(() => bocDong(van), [van]);

  return (
    <div>
      <button type="button" onClick={onQuay} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-bold text-ink">
        <ArrowLeft size={13} /> {tr("Tất cả Flashcard", "Tous les paquets", "All decks")}
      </button>

      {/* Đầu trang: thông tin bộ, sửa tại chỗ */}
      <div className="mt-4 flex flex-wrap items-start gap-4">
        {suaTT ? (
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_140px]">
            <input value={tt.ten} onChange={(e) => setTT({ ...tt, ten: e.target.value })} className={`${o} text-base font-bold`} />
            <select value={tt.kyNang} onChange={(e) => setTT({ ...tt, kyNang: e.target.value })} className={o}>
              {KY_NANG.map((k) => <option key={k.ma} value={k.ma}>{k.ten}</option>)}
            </select>
            <input value={tt.moTa} onChange={(e) => setTT({ ...tt, moTa: e.target.value })} placeholder={tr("Mô tả ngắn", "Courte description", "Short description")} className={`${o} sm:col-span-2`} />
            <ChonChuDe value={tt.chuDe} onChange={(v) => setTT({ ...tt, chuDe: v })} className={`${o} sm:col-span-2`} />
            <div className="flex gap-2 sm:col-span-2">
              <button type="button" onClick={luuTT} className={nutChinh}><Check size={14} /> {tr("Lưu", "Enregistrer", "Save")}</button>
              <button type="button" onClick={() => { setTT({ ten: bo.ten, moTa: bo.moTa ?? "", kyNang: bo.kyNang, chuDe: bo.chuDe ?? "" }); setSuaTT(false); }} className={nutPhu}>{tr("Huỷ", "Annuler", "Cancel")}</button>
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <h2 className="m-0 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink">
              {bo.ten}
              <button type="button" onClick={() => setSuaTT(true)} aria-label={tr("Sửa thông tin bộ", "Modifier le paquet", "Edit deck")} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><Pencil size={14} /></button>
            </h2>
            <p className="m-0 mt-1 text-sm text-soft">{tenKN(bo.kyNang)} · {ds?.length ?? "…"} {tr("thẻ", "cartes", "cards")}{bo.moTa ? ` · ${bo.moTa}` : ""}</p>
          </div>
        )}
        <TraPhiVaQuyen bo={bo} onDoi={(m) => { setBo({ ...bo, ...m }); onDoi(); }} onLoi={setLoi} />
        <button type="button" onClick={doiCongKhai}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 px-4 py-2 font-sans text-sm font-bold ${bo.congKhai ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
          {bo.congKhai ? <><Eye size={14} /> {tr("Học sinh đang thấy", "Visible par les élèves", "Visible to students")}</> : <><EyeOff size={14} /> {tr("Nháp · bấm để công khai", "Brouillon · cliquer pour publier", "Draft · click to publish")}</>}
        </button>
      </div>

      {loi && <p className="m-0 mt-4 rounded-xl bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger">{loi}</p>}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[340px_1fr]">
        {/* ── Thêm thẻ ── */}
        <section className="rounded-3xl border border-solid border-line bg-surface p-5 lg:sticky lg:top-4">
          <div role="tablist" className="inline-flex gap-1 rounded-full bg-surface2 p-1">
            {[["mot", tr("Từng thẻ", "Carte par carte", "One card")], ["lo", tr("Dán nhiều dòng", "Coller plusieurs lignes", "Paste many lines")]].map(([k, n]) => (
              <button key={k} type="button" role="tab" aria-selected={che === k} onClick={() => setChe(k)}
                className={`h-8 cursor-pointer rounded-full border-0 px-3 font-sans text-xs font-bold ${che === k ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft"}`}>{n}</button>
            ))}
          </div>
          {che === "mot" ? (
            <form className="mt-4 grid gap-2.5" onSubmit={(e) => { e.preventDefault(); them1(); }}>
              <label className="grid gap-1 text-xs font-bold text-soft">{tr("Mặt trước", "Recto", "Front")}
                <input ref={oDau} value={moi.matTruoc} onChange={(e) => setMoi({ ...moi, matTruoc: e.target.value })} className={o} placeholder="Le train entre en gare" /></label>
              <label className="grid gap-1 text-xs font-bold text-soft">{tr("Phiên âm", "Phonétique", "Pronunciation")} <span className="font-normal">{tr("(tuỳ chọn)", "(facultatif)", "(optional)")}</span>
                <input value={moi.phienAm} onChange={(e) => setMoi({ ...moi, phienAm: e.target.value })} className={o} placeholder="lə tʁɛ̃ ɑ̃tʁ ɑ̃ ɡaʁ" /></label>
              <label className="grid gap-1 text-xs font-bold text-soft">{tr("Mặt sau", "Verso", "Back")}
                <input value={moi.matSau} onChange={(e) => setMoi({ ...moi, matSau: e.target.value })} className={o} placeholder="Tàu đang vào ga" /></label>
              <label className="grid gap-1 text-xs font-bold text-soft">{tr("Câu ví dụ", "Phrase d'exemple", "Example sentence")} <span className="font-normal">{tr("(tuỳ chọn)", "(facultatif)", "(optional)")}</span>
                <input value={moi.viDu} onChange={(e) => setMoi({ ...moi, viDu: e.target.value })} className={o} /></label>
              <label className="grid gap-1 text-xs font-bold text-soft">{tr("Phương án sai cho Thách đấu", "Mauvaises réponses (défis)", "Wrong options (duels)")} <span className="font-normal">{tr("(3 nghĩa sai, cách nhau bằng |; bỏ trống thì máy tự chọn)", "(3 mauvais sens séparés par | ; vide = choix automatique)", "(3 wrong meanings separated by |; empty = automatic)")}</span>
                <input value={moi.nhieu} onChange={(e) => setMoi({ ...moi, nhieu: e.target.value })} className={o} placeholder="Tàu rời ga | Tàu bị huỷ | Tàu đến muộn" /></label>
              <button type="submit" disabled={dangLuu} className={`${nutChinh} mt-1 justify-center`}><Plus size={14} /> {dangLuu ? tr("Đang thêm…", "Ajout…", "Adding…") : tr("Thêm thẻ", "Ajouter la carte", "Add card")}</button>
              <p className="m-0 text-[11px] text-soft">{tr("Nhấn Enter để thêm nhanh; con trỏ quay về ô đầu.", "Entrée pour ajouter vite ; le curseur revient au premier champ.", "Press Enter to add quickly; the cursor returns to the first field.")}</p>
            </form>
          ) : (
            <div className="mt-4">
              <p className="m-0 text-xs leading-relaxed text-soft">
                {tr("Mỗi dòng một thẻ:", "Une carte par ligne :", "One card per line:")} <span className="font-semibold text-ink">{tr("mặt trước | mặt sau | phiên âm", "recto | verso | phonétique", "front | back | pronunciation")}</span>{tr(". Phiên âm để trống được.", ". La phonétique est facultative.", ". Pronunciation is optional.")}
              </p>
              <textarea value={van} onChange={(e) => setVan(e.target.value)} rows={8}
                placeholder={"Le train entre en gare | Tàu đang vào ga\nVoie 12 | Đường ray số 12"}
                className={`${o} mt-2 font-mono text-xs leading-relaxed`} />
              <p className="m-0 mt-1 text-xs text-soft">
                {xemLo.duoc.length} {tr("thẻ hợp lệ", "carte(s) valide(s)", "valid card(s)")}{xemLo.hong.length ? tr(` · ${xemLo.hong.length} dòng lỗi`, ` · ${xemLo.hong.length} ligne(s) en erreur`, ` · ${xemLo.hong.length} invalid line(s)`) : ""}
              </p>
              {hong.length > 0 && (
                <ul className="m-0 mt-2 list-none rounded-xl bg-warn-soft p-2.5 text-[11px] text-warn">
                  {hong.slice(0, 5).map((h) => <li key={h.dong}>dòng {h.dong}: {h.van}</li>)}
                </ul>
              )}
              <button type="button" onClick={themLo} disabled={dangLuu || !xemLo.duoc.length} className={`${nutChinh} mt-3 w-full justify-center`}>
                <Plus size={14} /> {dangLuu ? tr("Đang thêm…", "Ajout…", "Adding…") : tr(`Thêm ${xemLo.duoc.length || ""} thẻ`, `Ajouter ${xemLo.duoc.length || ""} carte(s)`, `Add ${xemLo.duoc.length || ""} card(s)`)}
              </button>
            </div>
          )}
          {tb && <p role="status" className="m-0 mt-3 text-center text-xs font-bold text-ok">{tb}</p>}
        </section>

        {/* ── Lưới thẻ ── */}
        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
              <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm trong bộ…", "Rechercher dans le paquet…", "Search this deck…")} className={`${o} pl-9`} />
            </div>
          </div>
          {ds === undefined ? (
            <p className="m-0 py-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
          ) : ds === null ? (
            <div className="rounded-2xl bg-danger-soft p-5 text-center">
              <AlertTriangle size={18} className="mx-auto text-danger" />
              <p className="m-0 mt-2 text-sm font-bold text-ink">{tr("Không đọc được thẻ của bộ này", "Impossible de lire les cartes", "Couldn't load this deck's cards")}</p>
            </div>
          ) : ds.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line p-10 text-center">
              <Layers size={22} className="mx-auto text-soft" />
              <p className="m-0 mt-2 font-bold text-ink">{tr("Bộ này chưa có thẻ nào", "Ce paquet est vide", "This deck is empty")}</p>
              <p className="m-0 mt-1 text-sm text-soft">{tr("Thêm thẻ ở khung bên trái.", "Ajoutez des cartes à gauche.", "Add cards on the left.")}</p>
            </div>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {loc.map(({ t, so }) => <OThe key={t.id} t={t} so={so} onDoi={tai} onLoi={setLoi} />)}
              {!loc.length && <p className="m-0 text-sm text-soft">{tr("Không có thẻ nào khớp «", "Aucune carte ne correspond à «", "No card matches «")} {tim} ».</p>}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ─────────────── Danh sách bộ ─────────────── */
export default function SoanBoThe() {
  const [laGV, setLaGV] = useState(undefined);
  const [ds, setDs] = useState(undefined);
  const [dangMo, setDangMo] = useState(null);
  const [tao, setTao] = useState(false);
  const [loc, setLoc] = useState("tat");
  const [loi, setLoi] = useState("");

  const tai = async () => {
    const [vai, rows] = await Promise.all([laGiaoVien(), docBoDeSoan()]);
    setLaGV(vai); setDs(rows);
  };
  useEffect(() => { tai(); }, []);

  const doiCongKhai = async (b) => {
    const kq = await suaBo(b.id, { congKhai: !b.congKhai });
    if (!kq.ok) { setLoi(kq.loi); return; }
    setLoi(""); tai();
  };
  const bo1Bo = async (b) => {
    /* Xoá bộ là xoá cả thẻ (CASCADE): hỏi lại và NÓI RA con số. */
    if (!window.confirm(tr(`Xoá bộ « ${b.ten} » và ${b.soThe} thẻ trong đó? Không hoàn lại được.`, `Supprimer le paquet « ${b.ten} » et ses ${b.soThe} cartes ? Irréversible.`, `Delete deck « ${b.ten} » and its ${b.soThe} cards? This can't be undone.`))) return;
    const kq = await xoaBo(b.id);
    if (!kq.ok) { setLoi(kq.loi); return; }
    setLoi(""); tai();
  };

  if (dangMo) {
    return (
      <div className="mx-auto max-w-6xl py-6">
        <SoanMotBo bo={dangMo} onQuay={() => { setDangMo(null); tai(); }} onDoi={tai} />
      </div>
    );
  }

  const hien = (ds ?? []).filter((b) => loc === "tat" || b.kyNang === loc);
  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{tr("Soạn Flashcard", "Créer des flashcards", "Flashcard editor")}</h1>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Bộ đang công khai hiện ở mục Flashcard của học sinh.", "Les paquets publiés apparaissent dans « Flashcards » chez les élèves.", "Published decks appear in students' Flashcards.")}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={tai} className={nutPhu}><RefreshCw size={14} /> {tr("Tải lại", "Recharger", "Reload")}</button>
          <button type="button" onClick={() => setTao(true)} className={nutChinh}><Plus size={14} /> {tr("Bộ mới", "Nouveau paquet", "New deck")}</button>
        </div>
      </div>

      {tao && <KhungTaoBo onHuy={() => setTao(false)} onXong={() => { setTao(false); tai(); }} />}
      {loi && <p className="m-0 mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{loi}</p>}

      {ds === undefined ? (
        <p className="mt-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
      ) : laGV === null ? (
        <div className="mt-8 rounded-2xl bg-warn-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-warn" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Không hỏi được vai của bạn", "Impossible de vérifier votre rôle", "Couldn't check your role")}</p>
          <p className="m-0 mt-1 text-sm text-ink">{tr("Danh sách có thể trống vì lý do đó. Đừng kết luận gì cho tới khi tải lại được.", "La liste peut être vide pour cette raison. Rechargez avant de conclure.", "The list may be empty because of that. Reload before drawing conclusions.")}</p>
        </div>
      ) : laGV === false ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Máy chủ không coi bạn là giáo viên", "Le serveur ne vous reconnaît pas comme enseignant", "The server doesn't see you as a teacher")}</p>
          <p className="m-0 mt-1 text-sm text-ink">{tr("Mọi lệnh ghi sẽ bị từ chối. Đăng xuất rồi đăng nhập lại.", "Toute modification sera refusée. Déconnectez-vous puis reconnectez-vous.", "All changes will be refused. Sign out and back in.")}</p>
        </div>
      ) : ds === null ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Không đọc được danh sách", "Impossible de lire la liste", "Couldn't load the list")}</p>
        </div>
      ) : (
        <>
          <div role="tablist" className="mt-6 flex flex-wrap gap-2">
            {[{ ma: "tat", ten: tr("Tất cả", "Tous", "All") }, ...KY_NANG].map((k) => {
              const n = k.ma === "tat" ? ds.length : ds.filter((b) => b.kyNang === k.ma).length;
              return (
                <button key={k.ma} type="button" role="tab" aria-selected={loc === k.ma} onClick={() => setLoc(k.ma)}
                  className={`cursor-pointer rounded-full border border-solid px-4 py-1.5 font-sans text-sm font-bold ${loc === k.ma ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-primary"}`}>
                  {k.ten} <span className={loc === k.ma ? "text-white/75" : "text-soft"}>· {n}</span>
                </button>
              );
            })}
          </div>
          {hien.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-line p-10 text-center">
              <Layers size={22} className="mx-auto text-soft" />
              <p className="m-0 mt-2 font-bold text-ink">{tr("Chưa có bộ thẻ nào ở đây", "Aucun paquet ici", "No decks here yet")}</p>
              <p className="m-0 mt-1 text-sm text-soft">{tr("Bấm « Bộ mới » để tạo.", "Cliquez sur « Nouveau paquet ».", "Click « New deck » to create one.")}</p>
            </div>
          ) : (
            <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {hien.map((b) => (
                <li key={b.id} className="flex flex-col rounded-3xl border border-solid border-line bg-surface p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{tenKN(b.kyNang)}</span>
                    <button type="button" onClick={() => doiCongKhai(b)} title={b.congKhai ? tr("Bấm để chuyển về nháp", "Cliquer pour repasser en brouillon", "Click to make it a draft") : tr("Bấm để công khai", "Cliquer pour publier", "Click to publish")}
                      className={`ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border-0 px-2.5 py-1 font-sans text-xs font-bold ${b.congKhai ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
                      {b.congKhai ? <><Eye size={12} /> {tr("Công khai", "Publié", "Published")}</> : <><EyeOff size={12} /> Nháp</>}
                    </button>
                  </div>
                  <button type="button" onClick={() => setDangMo(b)} className="mt-3 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left font-sans">
                    <span className="block text-lg font-extrabold leading-snug text-ink">{b.ten}</span>
                    {b.moTa && <span className="mt-1 block text-sm leading-relaxed text-soft">{b.moTa}</span>}
                  </button>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-ink">{b.soThe} {tr("thẻ", "cartes", "cards")}</span>
                    <button type="button" onClick={() => bo1Bo(b)} aria-label={tr(`Xoá bộ ${b.ten}`, `Supprimer le paquet ${b.ten}`, `Delete deck ${b.ten}`)}
                      className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-danger"><Trash2 size={14} /></button>
                    <button type="button" onClick={() => setDangMo(b)} className={nutChinh}>{tr("Mở", "Ouvrir", "Open")}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
