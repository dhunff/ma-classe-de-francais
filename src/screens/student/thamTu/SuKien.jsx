import React, { useEffect, useRef, useState } from "react";
import { Flame, ShieldAlert, MessageSquareWarning, Drama, DoorClosed, Shuffle, Siren, Feather, Eye, Timer, ArrowRight, Check, X, Hourglass, FlaskConical } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { phat } from "../../../shared/amThanh.js";
import CauTracNghiem from "../CauTracNghiem.jsx";
import TaiLieu from "./TaiLieu.jsx";

/* Cản trở của P.G. (31/10, giai đoạn 3). Mỗi loại có bìa và hiệu ứng riêng, không emoji.
   SU_KIEN là hàm vì tr() phải chạy lúc dựng. */
export const SU_KIEN = () => ({
  chay: { Icon: Flame, nen: "from-orange-600 to-red-900", ten: tr("Tài liệu bị đốt", "Document brûlé", "Burnt document"), mo: tr("P.G. đã châm lửa. Một phần tài liệu kế tiếp cháy mất, phải đoán từ ngữ cảnh hoặc nhờ Inès phục hồi.", "P.G. y a mis le feu. Une partie du prochain document est brûlée : devinez d'après le contexte ou demandez à Inès.", "P.G. set it alight. Part of the next document is burnt: infer from context or ask Inès to restore it.") },
  bruno: { Icon: ShieldAlert, nen: "from-blue-700 to-indigo-950", ten: tr("Bruno phá đám", "Bruno s'en mêle", "Bruno interferes"), mo: tr("Cảnh sát Bruno chặn đường và đòi kiểm tra tiếng Pháp. Trả lời sai thì mất 2 giờ giải trình.", "L'agent Bruno vous bloque et teste votre français. Une erreur coûte 2 heures de paperasse.", "Officer Bruno blocks you and tests your French. A mistake costs 2 hours of paperwork.") },
  tin_gia: { Icon: MessageSquareWarning, nen: "from-fuchsia-700 to-purple-950", ten: tr("Tin nhắn giả", "Faux message", "Fake message"), mo: tr("Một tin nhắn ký tên Léon vừa tới. Léon không bao giờ viết sai tiếng Pháp. Bị lừa thì mất 1 giờ đi nhầm chỗ.", "Un message signé Léon arrive. Léon ne fait jamais de faute. Tombez dans le piège et vous perdez 1 heure.", "A message signed Léon arrives. Léon never makes a French mistake. Fall for it and you lose 1 hour.") },
  nhan_chung: { Icon: Drama, nen: "from-slate-600 to-slate-900", ten: tr("Nhân chứng khả nghi", "Témoin douteux", "Dubious witness"), mo: tr("Có người tự xưng nhân chứng. Đối chiếu lời khai với tài liệu: tin nhầm hay bác nhầm đều mất 1 giờ.", "Quelqu'un se dit témoin. Comparez avec le document : se tromper coûte 1 heure.", "Someone claims to be a witness. Check against the document: a wrong call costs 1 hour.") },
  den_truoc: { Icon: DoorClosed, nen: "from-stone-600 to-stone-900", ten: tr("P.G. đến trước", "P.G. est passé avant", "P.G. got there first"), mo: tr("Cánh cửa khoá chặt, một chiếc lông xám mắc ở ổ khoá. Chọn cách đi tiếp.", "La porte est verrouillée, une plume grise dans la serrure. Choisissez comment continuer.", "The door is locked, a grey feather in the lock. Choose how to go on.") },
  trao: { Icon: Shuffle, nen: "from-rose-700 to-rose-950", ten: tr("Bằng chứng bị tráo", "Preuve échangée", "Evidence swapped"), mo: tr("Có kẻ lục sổ của ta. Một manh mối và một vật chứng đã biến mất.", "Quelqu'un a fouillé le carnet. Un indice et une preuve ont disparu.", "Someone went through the notebook. A clue and a piece of evidence are gone.") },
  khan: { Icon: Siren, nen: "from-red-600 to-red-950", ten: tr("Tình huống khẩn", "Urgence", "Emergency"), mo: tr("P.G. sắp tẩu thoát! Câu tiếp theo có đếm ngược, hết giờ tính là sai.", "P.G. va s'enfuir ! La prochaine question est chronométrée, le temps écoulé compte comme une erreur.", "P.G. is about to escape! The next question is timed; running out counts as wrong.") },
});

function BiaSuKien({ ma, chan }) {
  const D = SU_KIEN()[ma];
  return (
    <div className={`mcf-tt-bia mcf-tt-bia-${ma} relative overflow-hidden rounded-3xl bg-gradient-to-br ${D.nen} p-5 text-white shadow-2xl`}>
      {ma === "chay" && <><span aria-hidden className="mcf-tt-lua absolute inset-x-0 bottom-0 h-16" />{[8, 22, 37, 55, 71, 88].map((x, k) => <span key={x} aria-hidden style={{ left: `${x}%`, animationDelay: `${k * 0.27}s` }} className="mcf-tt-tan absolute bottom-2 h-1.5 w-1.5 rounded-full bg-amber-300" />)}</>}
      {ma === "bruno" && <><span aria-hidden className="mcf-tt-coi absolute -left-10 -top-10 h-40 w-40 rounded-full bg-sky-400" /><span aria-hidden className="mcf-tt-coi mcf-tt-coi2 absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500" /></>}
      {ma === "tin_gia" && <span aria-hidden className="mcf-tt-quet-dong absolute inset-0" />}
      {ma === "nhan_chung" && <span aria-hidden className="mcf-tt-den absolute -top-10 h-64 w-40" />}
      {ma === "trao" && <><span aria-hidden className="mcf-tt-doi absolute right-16 top-5 hidden h-20 w-14 rounded bg-[#fef9c3] sm:block" /><span aria-hidden className="mcf-tt-doi mcf-tt-doi2 absolute right-6 top-5 hidden h-20 w-14 rounded bg-[#fecdd3] sm:block" /></>}
      {ma === "khan" && <span aria-hidden className="mcf-tt-bao absolute inset-0" />}
      <Feather aria-hidden size={30} className="mcf-tt-long absolute right-6 top-0 text-white/70" />
      <div className="relative flex items-center gap-4">
        <span className="mcf-tt-bia-icon grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-black/30"><D.Icon size={34} /></span>
        <span className="min-w-0">
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-white/75">{tr("Nước đi của P.G.", "Le coup de P.G.", "P.G.'s move")}</span>
          <span className="mt-0.5 block text-xl font-black leading-tight">{D.ten}</span>
          <span className="mt-1 block text-sm leading-snug text-white/90">{chan ? tr("Ta đã theo dõi từ trước nên đón đầu được. Nước này vô hiệu!", "Nous l'avions suivi : ce coup est déjoué !", "We were tailing him: this move is foiled!") : D.mo}</span>
        </span>
      </div>
      {chan && <span className="mcf-dong absolute bottom-3 right-4 flex items-center gap-1 rounded border-2 border-solid border-emerald-300 px-2 py-0.5 text-xs font-black uppercase text-emerald-300"><Eye size={14} /> {tr("Đã chặn", "Déjoué", "Foiled")}</span>}
    </div>
  );
}

const NutTiep = ({ onClick, chu }) => (
  <div className="mt-4 text-right">
    <button type="button" onClick={onClick} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2b2118]">{chu ?? tr("Điều tra tiếp", "Continuer", "Carry on")} <ArrowRight size={15} className="inline align-[-3px]" /></button>
  </div>
);
const KetLuan = ({ tot, phat: mat, children }) => (
  <p className={`mcf-cau-vao m-0 mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed ${tot ? "bg-[#d1fae5] text-[#064e3b]" : "bg-[#ffe4e6] text-[#881337]"}`}>
    <b>{tot ? tr("Hoá giải! +1 vật chứng. ", "Déjoué ! +1 preuve. ", "Foiled! +1 evidence. ") : mat}</b>{children}
  </p>
);

/* Một cản trở từ đầu tới cuối. onChot ghi hậu quả đúng một lần, onTiep rời màn. */
export default function ManSuKien({ sk, vu, vatChung, onChot, onTiep }) {
  const [da, setDa] = useState(null);
  useEffect(() => { phat(sk.ma === "khan" ? "sapHet" : "canhBao"); }, [sk.ma]);
  const { ma, du, chan } = sk;

  const chot = (k, gio) => {
    if (da != null) return;
    setDa(k); const tot = k === 0; phat(tot ? "dung" : "sai");
    onChot({ tot, gio: tot ? 0 : gio });
  };

  if (chan) return <div className="mcf-cau-vao mt-4"><BiaSuKien ma={ma} chan /><NutTiep onClick={onTiep} /></div>;

  if (ma === "bruno") return (
    <div className="mcf-cau-vao mt-4">
      <BiaSuKien ma={ma} />
      <p lang="fr" className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 text-base font-bold text-[#fef3c7]">{du.q}</p>
      <CauTracNghiem pa={du.pa} onTra={(k) => chot(k, 2)} daChon={da} laPhap kieu="manh" />
      {da != null && <><KetLuan tot={da === 0} phat={tr("Bị giữ lại, mất tới 2 giờ. ", "Retenu : jusqu'à 2 h perdues. ", "Held up: up to 2 h lost. ")}>{du.gt}</KetLuan><NutTiep onClick={onTiep} /></>}
    </div>
  );

  if (ma === "tin_gia") return (
    <div className="mcf-cau-vao mt-4">
      <BiaSuKien ma={ma} />
      <div className="mcf-tt-rung-may mt-4"><TaiLieu tl={{ loai: "sms", tieuDe: "Léon", van: du.van }} /></div>
      <p className="m-0 mt-5 rounded-lg bg-black/30 px-4 py-2 text-sm font-bold text-[#fef3c7]">{tr("Câu nào sai tiếng Pháp?", "Quelle phrase contient une faute ?", "Which sentence has a French mistake?")}</p>
      <CauTracNghiem pa={du.pa} onTra={(k) => chot(k, 1)} daChon={da} laPhap kieu="manh" />
      {da != null && <><KetLuan tot={da === 0} phat={tr("Mắc bẫy, mất tới 1 giờ. ", "Piégé : jusqu'à 1 h perdue. ", "Tricked: up to 1 h lost. ")}>{du.gt}</KetLuan><NutTiep onClick={onTiep} /></>}
    </div>
  );

  if (ma === "nhan_chung") {
    const tra = (ghi) => {
      if (da != null) return;
      const tot = ghi === du.that; setDa(ghi ? "ghi" : "bac"); phat(tot ? "dung" : "sai");
      onChot({ tot, gio: tot ? 0 : 1, khai: ghi ? du : null });
    };
    return (
      <div className="mcf-cau-vao mt-4">
        <BiaSuKien ma={ma} />
        <p lang="fr" className="m-0 mt-4 rounded-2xl bg-[#fef3c7] px-4 py-3 text-base font-bold italic text-[#2b2118]">« {du.fr} »</p>
        <p className="m-0 mt-4 mb-2 text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{tr("Tài liệu để đối chiếu", "Document à comparer", "Document to compare")}</p>
        <TaiLieu tl={vu.canh[0].tl} />
        {da == null
          ? <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => tra(true)} className="mcf-tt-la cursor-pointer rounded-2xl border-0 bg-emerald-600 px-4 py-3 font-sans text-sm font-extrabold text-white"><Check size={16} className="mr-1 inline align-[-3px]" />{tr("Khớp, ghi vào sổ", "Ça colle, je note", "It matches, note it")}</button>
              <button type="button" onClick={() => tra(false)} className="mcf-tt-la cursor-pointer rounded-2xl border-0 bg-rose-700 px-4 py-3 font-sans text-sm font-extrabold text-white"><X size={16} className="mr-1 inline align-[-3px]" />{tr("Không khớp, bác bỏ", "Ça ne colle pas, je rejette", "It doesn't, reject it")}</button>
            </div>
          : <><KetLuan tot={(da === "ghi") === du.that} phat={tr("Nhầm rồi, mất tới 1 giờ. ", "Erreur : jusqu'à 1 h perdue. ", "Wrong call: up to 1 h lost. ")}>{du.vi}</KetLuan><NutTiep onClick={onTiep} /></>}
      </div>
    );
  }

  if (ma === "den_truoc") {
    const chon = (doi) => { phat("bam"); onChot(doi); onTiep(); };
    return (
      <div className="mcf-cau-vao mt-4">
        <BiaSuKien ma={ma} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => chon({ gio: 1 })} className="mcf-tt-la cursor-pointer rounded-2xl border-0 bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-left font-sans text-white">
            <span className="flex items-center gap-2 text-sm font-extrabold"><Hourglass size={18} /> {tr("Đi đường vòng", "Faire le détour", "Take the detour")}</span>
            <span className="mt-1 block text-xs font-bold text-white/90">−1 {tr("giờ", "h", "h")}</span>
          </button>
          <button type="button" disabled={vatChung < 1} onClick={() => chon({ vat: 1 })} className="mcf-tt-la cursor-pointer rounded-2xl border-0 bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-left font-sans text-white disabled:cursor-not-allowed disabled:opacity-45">
            <span className="flex items-center gap-2 text-sm font-extrabold"><FlaskConical size={18} /> {tr("Xin lệnh khám", "Demander un mandat", "Get a warrant")}</span>
            <span className="mt-1 block text-xs font-bold text-white/90">{vatChung < 1 ? tr("Chưa có vật chứng", "Aucune preuve", "No evidence yet") : tr("−1 vật chứng", "−1 preuve", "−1 evidence")}</span>
          </button>
        </div>
      </div>
    );
  }

  /* chay · khan · trao: hậu quả đã định, chỉ cần báo cho người chơi. */
  return (
    <div className="mcf-cau-vao mt-4">
      <BiaSuKien ma={ma} />
      {ma === "trao" && sk.mat && <p className="m-0 mt-4 rounded-xl bg-black/30 px-4 py-2.5 text-sm text-[#fecdd3] line-through decoration-rose-400">{sk.mat}</p>}
      <NutTiep onClick={onTiep} chu={ma === "khan" ? tr("Vào ngay", "Foncer", "Go now") : undefined} />
    </div>
  );
}

/* Đếm ngược cho tình huống khẩn. Tính theo mốc giờ nên tab nền không làm lệch. */
export function DemNguoc({ giay, onHet }) {
  const [con, setCon] = useState(giay);
  const het = useRef(onHet); het.current = onHet;
  useEffect(() => {
    const moc = Date.now() + giay * 1000; let baoRoi = false;
    const t = setInterval(() => {
      const c = Math.max(0, Math.ceil((moc - Date.now()) / 1000));
      setCon(c);
      if (c <= 15 && !baoRoi) { baoRoi = true; phat("sapHet"); }
      if (c <= 0) { clearInterval(t); het.current(); }
    }, 250);
    return () => clearInterval(t);
  }, [giay]);
  const gap = con <= 15;
  return (
    <div className={`mt-3 flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-2 ${gap ? "mcf-tt-gap" : ""}`} role="timer" aria-label={tr(`Còn ${con} giây`, `${con} secondes restantes`, `${con} seconds left`)}>
      <Timer size={18} className={gap ? "text-red-300" : "text-amber-300"} />
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"><span className={`block h-full rounded-full transition-[width] duration-300 ease-linear ${gap ? "bg-red-400" : "bg-amber-400"}`} style={{ width: `${(con / giay) * 100}%` }} /></span>
      <span className="w-9 text-right text-sm font-black tabular-nums text-white">{con}s</span>
    </div>
  );
}
