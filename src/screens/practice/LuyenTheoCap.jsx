import React, { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, BookOpen, PenLine, Mic, Check, Lock, LockOpen, Play, Clock, ArrowRight, ChevronLeft, Sparkles, RotateCcw, Crown, Flag, ListChecks, AlertTriangle, XCircle, Lightbulb, Award } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import { FloatingLayer } from "../../shared/ui.jsx";
import { GHI_CHU } from "../../content/luyenTap/ghiChuKyNang.js";
import { CAP_DO, KY_LON, tongCap, duongKyLon, dsBaiKyNho, timKyNho, NGUONG_DAT, NGUONG_F } from "../../shared/tienTrinhLuyenTap.js";
import { hangBai, hangKyNho, hangSau, tinhKyLon } from "../../shared/hangLuyenTap.js";
import HuyHieuHang from "./HuyHieuHang.jsx";

/* Màn Luyện tập theo trình độ (01/11/2026): trình độ → kỹ năng lớn → kỹ năng nhỏ
 * → bài. Mọi số đếm từ `exercises` + `hist`; số bài kế hoạch (`duKien`) không hiện cho học sinh.
 * Luật khoá ở shared/tienTrinhLuyenTap.js. */

/* Cùng bốn dải màu với lưới kỹ năng cũ (ngoại lệ màu nhận dạng, chữ trắng trên nền đậm). */
export const KY = () => ({
  CO: { ten: tr("Nghe", "Compréhension de l'oral", "Listening"), Icon: Headphones, nen: "linear-gradient(135deg,#60A5FA,#2563EB)", dam: "#1D4ED8" },
  CE: { ten: tr("Đọc", "Compréhension des écrits", "Reading"), Icon: BookOpen, nen: "linear-gradient(135deg,#34D399,#059669)", dam: "#047857" },
  PE: { ten: tr("Viết", "Production écrite", "Writing"), Icon: PenLine, nen: "linear-gradient(135deg,#FB7185,#E11D48)", dam: "#BE123C" },
  PO: { ten: tr("Nói", "Production orale", "Speaking"), Icon: Mic, nen: "linear-gradient(135deg,#A78BFA,#7C3AED)", dam: "#6D28D9" },
});
const tenKn = (kn) => tr(kn.vi, kn.fr, kn.en);
const BANG = (cap) => (cap.startsWith("C") ? "DALF" : "DELF");

const Vong = ({ pct, children, nen = "rgba(255,255,255,0.28)", mau = "rgba(255,255,255,0.95)" }) => (
  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${mau} ${pct * 3.6}deg, ${nen} 0)` }}>
    {children}
  </span>
);

/* Nhãn trạng thái một bước trên đường đi. */
function NhanBuoc({ o }) {
  if (o.buoc === "xong") return <span className="text-xs font-bold text-ok">{tr("Đã đạt", "Validé", "Passed")}</span>;
  if (o.buoc === "hienTai") {
    return <span className="text-xs font-bold text-primary">{o.xong.length ? tr(`Đang luyện · ${o.xong.length}/${o.coTheLam.length} bài`, `En cours · ${o.xong.length}/${o.coTheLam.length}`, `In progress · ${o.xong.length}/${o.coTheLam.length}`) : tr("Học tiếp ở đây", "Continuez ici", "Continue here")}</span>;
  }
  if (o.buoc === "khoa") return <span className="text-xs font-semibold text-soft">{tr(`${o.bai.length} bài · chờ bước trước`, `${o.bai.length} ex. · après l'étape précédente`, `${o.bai.length} ex. · after the previous step`)}</span>;
  if (o.buoc === "tuDo") {
    return <span className="text-xs font-bold text-warn">{o.xong.length ? tr(`Đang luyện · ${o.xong.length}/${o.coTheLam.length} bài`, `En cours · ${o.xong.length}/${o.coTheLam.length}`, `In progress · ${o.xong.length}/${o.coTheLam.length}`) : tr(`${o.bai.length} bài · VIP mở sẵn`, `${o.bai.length} ex. · ouvert par le VIP`, `${o.bai.length} ex. · open with VIP`)}</span>;
  }
  if (o.buoc === "vip") return <span className="text-xs font-bold text-warn">{tr(`${o.phi.length} bài VIP · không chặn đường đi`, `${o.phi.length} ex. VIP · n'empêche pas d'avancer`, `${o.phi.length} VIP ex. · doesn't block your path`)}</span>;
  return <span className="text-xs font-semibold text-soft">{tr("Đang soạn", "En préparation", "Being prepared")}</span>;
}

/* Dấu tròn trên đường: nối dọc bằng một vạch, nên thấy ngay mình đang ở đâu. */
function DauBuoc({ o, stt, dam }) {
  if (o.buoc === "xong" && hangKyNho(o)) return <HuyHieuHang hang={hangKyNho(o)} size={32} />;
  if (o.buoc === "xong") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ok text-white"><Check size={16} strokeWidth={3} /></span>;
  if (o.buoc === "hienTai") return <span className="mcf-lt-nhip grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style={{ background: dam }}><Play size={13} className="ml-0.5 fill-current" /></span>;
  if (o.buoc === "khoa") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-soft"><Lock size={14} /></span>;
  if (o.buoc === "tuDo") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warn-soft text-warn"><LockOpen size={14} /></span>;
  if (o.buoc === "vip") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warn-soft text-warn"><Crown size={15} /></span>;
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-line-strong bg-surface text-xs font-bold text-soft">{stt}</span>;
}

function TheKyLon({ ky, m, duong, hist, onMo, onThanhTuu }) {
  const cn = tinhKyLon(duong, hist);
  const coBai = duong.filter((o) => o.muc !== "trong");
  const dat = coBai.filter((o) => o.muc === "dat").length;
  const pct = coBai.length ? Math.round((dat / coBai.length) * 100) : 0;
  return (
    <section className="mcf-cau-vao flex flex-col overflow-hidden rounded-3xl border border-solid border-line bg-surface shadow-sm">
      <header className="relative flex items-center gap-3 overflow-hidden px-5 py-4 text-white" style={{ background: m.nen }}>
        <span aria-hidden className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15" />
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/25"><m.Icon size={22} /></span>
        <span className="relative min-w-0 flex-1">
          <h3 className="m-0 truncate text-lg font-extrabold">{m.ten}</h3>
          <span className="block text-xs font-bold text-white/85">{duong.length} {tr("kỹ năng nhỏ", "sous-compétences", "sub-skills")}{coBai.length ? ` · ${tr(`đạt ${dat}/${coBai.length}`, `${dat}/${coBai.length} validées`, `${dat}/${coBai.length} passed`)}` : ""}</span>
        </span>
        <span className="relative"><Vong pct={pct}><span className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-extrabold tabular-nums" style={{ background: m.dam }}>{pct}%</span></Vong></span>
      </header>
      <ol className="m-0 flex list-none flex-col p-3">
        {duong.map((o, i) => (
          <li key={o.kn.ma} className="relative">
            {i < duong.length - 1 && <span aria-hidden className={`absolute bottom-[-10px] left-[27px] top-[38px] w-0.5 ${o.buoc === "xong" ? "bg-ok" : "bg-line"}`} />}
            <button type="button" onClick={() => onMo(o, m)} aria-label={`${i + 1}. ${tenKn(o.kn)}`}
              className={`relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 bg-transparent px-3 py-2 text-left font-sans transition-colors hover:bg-surface2 ${o.buoc === "hienTai" ? "bg-primary-soft" : ""}`}>
              <DauBuoc o={o} stt={i + 1} dam={m.dam} />
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-bold leading-snug ${o.buoc === "khoa" || o.buoc === "sapCo" ? "text-soft" : "text-ink"}`}>{tenKn(o.kn)}</span>
                <NhanBuoc o={o} />
                {o.phi.length > 0 && o.buoc !== "vip" && <span className="ml-2 inline-flex items-center gap-1 align-[-1px] text-xs font-bold text-warn"><Crown size={12} /> +{o.phi.length} VIP</span>}
              </span>
              {o.buoc !== "xong" && <HuyHieuHang hang={hangKyNho(o)} size={26} />}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={onThanhTuu} className="mt-auto flex w-full cursor-pointer items-center gap-2 border-0 border-t border-solid border-line bg-transparent px-5 py-3 text-left font-sans text-xs font-bold text-soft hover:text-primary">
        <Award size={15} className={`shrink-0 ${cn.du ? "text-warn" : ""}`} />
        <span className="min-w-0 flex-1">
          {cn.du
            ? tr("Đã nhận chứng nhận, bấm để xem", "Certificat obtenu, cliquez pour le voir", "Certificate earned, click to view")
            : cn.sapCo
              ? tr(`Chứng nhận: đạt ${cn.dat}/${cn.tong}, còn kỹ năng đang soạn`, `Certificat : ${cn.dat}/${cn.tong}, compétences en préparation`, `Certificate: ${cn.dat}/${cn.tong}, skills being prepared`)
              : tr(`Chứng nhận: đạt ${cn.dat}/${cn.tong} kỹ năng nhỏ`, `Certificat : ${cn.dat}/${cn.tong} sous-compétences`, `Certificate: ${cn.dat}/${cn.tong} sub-skills`)}
        </span>
        {cn.hang && <HuyHieuHang hang={cn.hang} size={24} />}
      </button>
    </section>
  );
}

/* Báo bước đang khoá, kèm lối vào thẳng bằng VIP. Dùng ở trang trình độ và trang kỹ năng.
   Bước vừa bấm có thể ở cuối trang, nên tự cuộn tới để học sinh thấy được. */
function CanhBaoKhoa({ noiDung, onMuaVip, giaVip }) {
  const ref = useRef(null);
  useEffect(() => {
    const giam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "center", behavior: giam ? "auto" : "smooth" });
  }, [noiDung]);
  return (
    <div ref={ref} role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-warn-soft px-4 py-3">
      <Lock size={18} className="shrink-0 text-warn" />
      <p className="m-0 min-w-[12rem] flex-1 text-sm font-semibold text-warn">
        {noiDung}
        <span className="block font-medium text-ink">{tr("Hoặc mở VIP để vào thẳng mọi kỹ năng nhỏ.", "Ou passez VIP pour accéder directement à toutes les sous-compétences.", "Or go VIP to open every sub-skill right away.")}</span>
      </p>
      <NutVip onClick={onMuaVip} gia={giaVip} />
    </div>
  );
}

/* Lời báo bài vướng thứ tự, dùng cho kết quả của khoaThuTu. */
const loiKhoa = (k) => (k.loai === "buoc"
  ? tr(`Làm xong « ${tenKn(k.kn)} » trước để mở bài này`, `Terminez d'abord « ${tenKn(k.kn)} » pour ouvrir cet exercice`, `Finish "${tenKn(k.kn)}" first to unlock this exercise`)
  : k.doF ? tr(`Bài « ${k.doF.title} » đang điểm F. Làm lại đạt từ ${NGUONG_F * 100}% để mở bài này`, `L'exercice « ${k.doF.title} » est noté F. Refaites-le avec au moins ${NGUONG_F * 100} % pour ouvrir celui-ci`, `"${k.doF.title}" is graded F. Redo it with at least ${NGUONG_F * 100}% to unlock this one`)
  : tr(`Làm xong bài trước trong « ${tenKn(k.kn)} » để mở`, `Terminez l'exercice précédent de « ${tenKn(k.kn)} »`, `Finish the previous exercise in "${tenKn(k.kn)}"`));

/* Mở thẳng một bài chưa tới lượt (ô tìm kiếm): chặn ở màn làm bài và chỉ đường. */
export function ManKhoaThuTu({ khoa, onDi, onBack, laVip, onMuaVip, giaVip }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-solid border-line bg-surface px-6 py-8 text-center shadow-sm">
      <Leon cam="quyet-tam" size={88} />
      <h2 className="m-0 mt-3 text-xl font-extrabold text-ink">{tr("Bài này chưa tới lượt", "Cet exercice n'est pas encore ouvert", "This exercise isn't open yet")}</h2>
      <p className="m-0 mt-1 text-sm text-soft">{loiKhoa(khoa)}.</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onDi} className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border-0 bg-primary px-5 py-3 font-sans text-sm font-extrabold text-on-primary">
          {tr("Tới bước đang học", "Aller à l'étape en cours", "Go to my current step")} <ArrowRight size={16} />
        </button>
        {khoa.loai === "buoc" && !laVip && <NutVip onClick={onMuaVip} gia={giaVip} />}
      </div>
      <button type="button" onClick={onBack} className="mt-4 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-1 font-sans text-sm font-bold text-soft hover:text-primary">
        <ChevronLeft size={16} /> {tr("Quay lại", "Retour", "Back")}
      </button>
    </div>
  );
}

/* Trang một trình độ: chọn trình độ, bước tiếp theo, bốn kỹ năng lớn. */
export function LuyenTheoCap({ cap, capHoSo, onDoiCap, exercises, hist, biKhoa, onMoKyNho, canhBao, laVip, onMuaVip, giaVip, onThanhTuu }) {
  const moiCap = useMemo(() => Object.fromEntries(CAP_DO.map((c) => [c, tongCap(c, exercises, hist, biKhoa, laVip)])), [exercises, hist, biKhoa, laVip]);
  const tong = moiCap[cap];
  const KYN = KY();
  const tiep = tong.tiepTheo;
  /* Trên điện thoại dải trình độ tràn ngang: kéo trình độ đang chọn vào giữa khung. */
  const dai = useRef(null);
  useEffect(() => {
    const d = dai.current, o = d?.querySelector('[aria-selected="true"]');
    if (o) d.scrollLeft = o.offsetLeft - d.offsetLeft - (d.clientWidth - o.clientWidth) / 2;
  }, [cap]);
  const kyTiep = tiep ? KYN[tiep.kn.ma.split("-")[1]] : null;
  return (
    <div>
      <div ref={dai} role="tablist" aria-label={tr("Trình độ", "Niveau", "Level")} className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {CAP_DO.map((c) => {
          const dang = c === cap;
          const x = moiCap[c];
          return (
            <button key={c} type="button" role="tab" aria-selected={dang} onClick={() => { phat("bam"); onDoiCap(c); }}
              className={`flex min-w-[92px] flex-1 cursor-pointer flex-col items-start rounded-2xl border border-solid px-4 py-2.5 text-left font-sans transition-all ${dang ? "border-primary bg-primary text-on-primary shadow-md" : "border-line bg-surface text-ink hover:border-primary"}`}>
              <span className="text-lg font-extrabold leading-none">{c}</span>
              <span className={`mt-1 text-[11px] font-semibold ${dang ? "text-on-primary" : "text-soft"}`}>
                {c === capHoSo ? tr("Trình độ của bạn", "Votre niveau", "Your level") : tr(`${x.baiXong}/${x.soBai} bài`, `${x.baiXong}/${x.soBai} ex.`, `${x.baiXong}/${x.soBai} ex.`)}
              </span>
            </button>
          );
        })}
      </div>

      {!laVip && (
        <p className="m-0 mb-4 flex items-start gap-2 text-xs font-semibold text-soft">
          <Crown size={14} className="mt-px shrink-0 text-warn" />
          {tr("Miễn phí: bài nền của mọi kỹ năng ở mọi trình độ, mở lần lượt từng bước. VIP: vào thẳng mọi kỹ năng nhỏ, thêm bài luyện sâu để nhớ lâu và sát đề thi.", "Gratuit : les exercices de base de chaque compétence, à tous les niveaux, étape par étape. VIP : accès direct à toutes les sous-compétences et exercices en plus pour mieux retenir et coller à l'examen.", "Free: core exercises for every skill at every level, one step at a time. VIP: open any sub-skill right away, plus extra practice to remember longer and match the exam.")}
        </p>
      )}

      {canhBao && !laVip && <CanhBaoKhoa noiDung={canhBao} onMuaVip={onMuaVip} giaVip={giaVip} />}

      {tiep ? (
        <button id="tour-xp-start" type="button" onClick={() => onMoKyNho(tiep, kyTiep)}
          className="mcf-cau-vao group mb-6 flex w-full cursor-pointer flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-4 text-left font-sans shadow-sm transition-shadow hover:shadow-md">
          <Leon cam="lam-viec" size={64} className="shrink-0" />
          <span className="min-w-[12rem] flex-1">
            <span className="block text-xs font-bold uppercase tracking-wide text-primary">{tr("Bước tiếp theo của bạn", "Votre prochaine étape", "Your next step")}</span>
            <span className="mt-0.5 block text-lg font-extrabold leading-snug text-ink">{tenKn(tiep.kn)}</span>
            <span className="block text-sm text-soft">{BANG(cap)} {cap} · {kyTiep.ten}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-extrabold text-on-primary">
            {tiep.xong.length ? tr("Học tiếp", "Continuer", "Continue") : tr("Bắt đầu", "Commencer", "Start")} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      ) : (
        <div id="tour-xp-start" className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-solid border-line bg-surface p-4">
          <Leon cam={tong.dat > 0 ? "yeah" : "lam-viec"} size={64} className="shrink-0" />
          <p className="m-0 min-w-[12rem] flex-1 text-sm font-semibold text-ink">
            {tong.coBai === 0
              ? tr(`Bài tập ${cap} đang được soạn. Bạn xem trước các kỹ năng cần có ở dưới nhé.`, `Les exercices ${cap} sont en préparation. Découvrez les compétences ci-dessous.`, `${cap} exercises are being prepared. Preview the skills below.`)
              : tr(`Bạn đã đạt mọi kỹ năng đang có bài ở ${cap}. Bài mới sẽ hiện ở đây.`, `Vous avez validé toutes les compétences disponibles en ${cap}.`, `You've passed every available ${cap} skill. New exercises will appear here.`)}
          </p>
        </div>
      )}

      <div id="tour-xp-grid" className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {KY_LON.map((ky) => {
          const k = tong.cacKy.find((x) => x.ky === ky);
          return <TheKyLon key={ky} ky={ky} m={KYN[ky]} duong={k.duong} hist={hist} onMo={onMoKyNho} onThanhTuu={onThanhTuu} />;
        })}
      </div>
    </div>
  );
}

/* Ba vòng ba màu riêng, tách khỏi bốn màu kỹ năng (ngoại lệ màu nhận dạng, chữ trắng trên nền đậm). */
const VONG = () => [
  ["hoc", tr("Học", "Découverte", "Learn"), tr("Gặp kỹ năng lần đầu, mỗi bài một chủ đề", "Première rencontre, un thème par exercice", "First contact, one topic per exercise"), tr("Làm ngay", "Maintenant", "Start now"), BookOpen, "linear-gradient(160deg,#0284C7,#075985)"],
  ["on", tr("Ôn", "Révision", "Review"), tr("Quay lại để nhớ lâu hơn", "Revenez pour mieux retenir", "Come back to remember longer"), tr("Sau khoảng 3 ngày", "Environ 3 jours après", "About 3 days later"), RotateCcw, "linear-gradient(160deg,#7C3AED,#5B21B6)"],
  ["chot", tr("Chốt", "Bilan", "Final check"), tr("Từ 85% là nắm chắc", "85 % pour maîtriser", "85% means mastered"), tr("Sau khoảng 10 ngày", "Environ 10 jours après", "About 10 days later"), Flag, "linear-gradient(160deg,#EA580C,#9A3412)"],
];

/* Dải tiến độ: mỗi bài một vạch, nhìn là biết còn mấy bài và mình đang ở đâu. */
function DaiBai({ ds }) {
  const xong = ds.filter((b) => b.tt === "xong").length;
  return (
    <div className="flex gap-1" role="img" aria-label={tr(`${xong} trên ${ds.length} bài đã làm`, `${xong} exercices faits sur ${ds.length}`, `${xong} of ${ds.length} exercises done`)}>
      {ds.map(({ ex, tt }) => (
        <span key={ex.id} className={`h-2 min-w-0 flex-1 rounded-full ${tt === "xong" ? "bg-white" : tt === "tiepTheo" ? "mcf-lt-vach bg-white/70" : tt === "phi" ? "border border-dashed border-white/70" : "bg-white/30"}`} />
      ))}
    </div>
  );
}

/* Mẹo của một kỹ năng nhỏ: chỉ là nút bóng đèn, bấm mới mở. Dùng ở trang kỹ năng (nằm trên
   dải màu, `tren="mau"`) và trong màn làm bài (nằm trên nền thường). */
export function MeoKyNho({ ma, tren = "nen" }) {
  const ref = useRef(null);
  const [mo, setMo] = useState(false);
  const f = timKyNho(ma);
  const ghi = GHI_CHU[ma];
  if (!f || !ghi) return null;
  const m = KY()[f.ky];
  const ten = tr("Mẹo làm bài", "Conseils", "Tips");
  const muc = [
    [ListChecks, tr("Cần có", "Il faut connaître", "You need"), ghi.can, "bg-primary-soft", "bg-primary text-on-primary", "text-primary"],
    [AlertTriangle, tr("Lưu ý", "Attention", "Note"), ghi.luu, "bg-warn-soft", "bg-warn text-white", "text-warn"],
    [XCircle, tr("Lỗi hay mắc", "Erreur fréquente", "Common mistake"), ghi.loi, "bg-danger-soft", "bg-danger text-white", "text-danger"],
    [Lightbulb, tr("Mẹo", "Astuce", "Tip"), ghi.meo, "bg-ok-soft", "bg-ok text-white", "text-ok"],
  ];
  return (
    <span ref={ref} className="inline-flex shrink-0">
      <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo} aria-label={ten} title={ten}
        className={tren === "mau"
          ? "grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border-0 bg-white/25 text-2xl leading-none"
          : "inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink hover:border-primary"}>
        <span aria-hidden className={`mcf-den ${tren === "mau" ? "" : "text-lg leading-none"} ${mo ? "mcf-den-bat" : ""}`}>💡</span>
        {tren !== "mau" && ten}
      </button>
      <FloatingLayer anchorRef={ref} open={mo} onClose={() => setMo(false)} width={Math.min(360, window.innerWidth - 16)} align={tren === "mau" ? "right" : "left"} radius={22} padding={0} animate>
        <div className="overflow-hidden rounded-[21px]">
          <div className="relative flex items-center gap-3 overflow-hidden px-4 py-3 text-white" style={{ background: m.nen }}>
            <Leon cam="hoc" size={52} className="shrink-0" />
            <div className="min-w-0">
              <p className="m-0 text-base font-extrabold leading-tight">{ten}</p>
              <p className="m-0 text-xs font-semibold text-white/90">{tenKn(f.kn)}</p>
            </div>
          </div>
          <div className="flex max-h-[min(60vh,28rem)] flex-col gap-2 overflow-y-auto p-3">
            {muc.map(([Icon, nhan, noiDung, nen, oIcon, chu], i) => (
              <div key={nhan} className={`mcf-meo-dong flex gap-3 rounded-2xl p-3 ${nen}`} style={{ animationDelay: `${i * 60}ms` }}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${oIcon}`}><Icon size={16} /></span>
                <div className="min-w-0">
                  <p className={`m-0 text-sm font-extrabold ${chu}`}>{nhan}</p>
                  <p className="m-0 text-sm leading-relaxed text-ink">{noiDung}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FloatingLayer>
    </span>
  );
}

/* Nút mở gói VIP trên dải màu: vàng kim để tách khỏi nút làm bài, kèm giá thật của gói. */
function NutVip({ onClick, gia }) {
  return (
    <button type="button" onClick={onClick} className="mcf-nut-vip inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-2xl border-0 py-2 pl-2 pr-4 text-left font-sans">
      <span className="mcf-nut-vip-mu grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-950 text-amber-300"><Crown size={16} className="fill-current" /></span>
      <span className="block leading-tight">
        <span className="block text-sm font-extrabold">{tr("Mở VIP", "Passer VIP", "Go VIP")}</span>
        {gia && <span className="block text-[11px] font-bold">{tr(`${gia}/tháng`, `${gia}/mois`, `${gia}/month`)}</span>}
      </span>
    </button>
  );
}

/* Tiêu đề một vòng: tấm màu riêng, biểu tượng mờ làm nền, ghi đã làm tới đâu.
   Đi hết bài trong vòng thì biểu tượng thành dấu tích. */
function TieuDeVong({ ten, moTa, Icon, nen, xong, tong, soVip }) {
  const het = tong > 0 && xong === tong;
  return (
    <div className="relative overflow-hidden rounded-3xl p-4 text-white shadow-md" style={{ background: nen }}>
      <Icon aria-hidden size={92} strokeWidth={1.5} className="pointer-events-none absolute -bottom-4 -right-4 text-white/15" />
      {/* 04/11 (chủ dự án): bỏ nhãn khi nào làm (Làm ngay, Sau khoảng 3 ngày, Sau khoảng 10 ngày). */}
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/25">{het ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}</span>
      <h3 className="relative m-0 mt-3 text-2xl font-extrabold leading-none">{ten}</h3>
      <p className="relative m-0 mt-1.5 text-[13px] font-medium leading-snug">{moTa}</p>
      {tong > 0 && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
          <span className="block h-full rounded-full bg-white" style={{ width: `${(xong / tong) * 100}%` }} />
        </div>
      )}
      <p className="relative m-0 mt-1.5 flex flex-wrap items-center gap-x-2 text-xs font-bold">
        {tong > 0 && <span className="tabular-nums">{tr(`${xong}/${tong} bài`, `${xong}/${tong} ex.`, `${xong}/${tong} ex.`)}</span>}
        {soVip > 0 && <span className="inline-flex items-center gap-1"><Crown size={12} /> {soVip} VIP</span>}
      </p>
    </div>
  );
}

/* Dấu thứ tự ở góc thẻ: thẻ bài giữ nguyên như Thư viện, dấu này nói bài đang ở đâu. */
function DauBai({ tt, stt, hang }) {
  if (tt === "xong" && hang) return <HuyHieuHang hang={hang} size={36} className="absolute -left-2 -top-2 z-10 shadow-md" />;
  return (
    <span className={`absolute -left-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold shadow-md ${tt === "xong" ? "bg-ok text-white" : tt === "tiepTheo" ? "bg-primary text-on-primary" : tt === "phi" ? "bg-warn-soft text-warn" : "bg-surface2 text-soft"}`}>
      {tt === "xong" ? <Check size={17} strokeWidth={3} /> : tt === "khoa" ? <Lock size={14} /> : tt === "phi" ? <Crown size={15} /> : stt}
    </span>
  );
}

/* Trang một kỹ năng nhỏ: thẻ bài giữ nguyên như Thư viện. Ba vòng Học, Ôn, Chốt xếp thành
   đường dọc: cột trái là mốc thời gian, cột phải là bài. Trong mỗi vòng, bài trên đường đi
   đứng trước, bài VIP đứng sau. Thẻ chưa tới lượt vẫn nhìn thấy, nhưng che lại và nói rõ
   cần làm gì trước. */
export function ChiTietKyNho({ ma, exercises, hist, biKhoa, onBack, onMoKyNho, canhBao, laVip, onMuaVip, giaVip, onLam, renderThe }) {
  const f = timKyNho(ma);
  if (!f) return null;
  const m = KY()[f.ky];
  const duong = duongKyLon(f.cap, f.ky, exercises, hist, biKhoa, laVip);
  const i = duong.findIndex((o) => o.kn.ma === ma);
  const o = duong[i];
  const ds = dsBaiKyNho(o, hist, biKhoa);
  const truoc = duong[i - 1], sau = duong[i + 1];
  const tiep = ds.find((b) => b.tt === "tiepTheo");
  const pct = o.tb === null ? null : Math.round(o.tb * 100);
  const trenDuong = ds.filter((b) => b.tt !== "phi");
  const nhom = VONG().map(([k, ten, moTa, , Icon, nen]) => {
    const bai = ds.filter((b) => (b.ex.vong || "hoc") === k);
    return { k, ten, moTa, Icon, nen, bai: [...bai.filter((b) => b.tt !== "phi"), ...bai.filter((b) => b.tt === "phi")] };
  }).filter((n) => n.bai.length);
  const moiVip = !laVip && o.phi.length > 0;
  const hang = hangKyNho(o);
  const len = hang ? hangSau(o.tb) : null;
  const NutBuoc = ({ b, huong }) => (
    <button type="button" onClick={() => onMoKyNho(b, m)} className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-4 py-3 font-sans text-sm font-bold text-ink hover:border-primary ${huong === "sau" ? "justify-end text-right" : "text-left"}`}>
      {huong === "truoc" && <ChevronLeft size={16} className="shrink-0" />}
      <span className="min-w-0 truncate">{tenKn(b.kn)}</span>
      {huong === "sau" && <ArrowRight size={16} className="shrink-0" />}
    </button>
  );
  return (
    <div className="mx-auto max-w-6xl">
      <button type="button" onClick={onBack} className="mb-3 inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent p-1 font-sans text-sm font-bold text-soft hover:text-primary">
        <ChevronLeft size={16} /> {BANG(f.cap)} {f.cap}: {m.ten}
      </button>

      <header className="mcf-cau-vao mb-6 rounded-3xl px-6 py-5 text-white" style={{ background: m.nen }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <HuyHieuHang hang={hang} size={60} />
          <div className="min-w-[14rem] flex-1">
            <p className="m-0 text-sm font-bold text-white/85">{tr(`Bước ${i + 1} trên ${duong.length}`, `Étape ${i + 1} sur ${duong.length}`, `Step ${i + 1} of ${duong.length}`)}</p>
            <h2 className="m-0 mt-0.5 text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance]">{tenKn(o.kn)}</h2>
          </div>
          <MeoKyNho ma={ma} tren="mau" />
          {/* Chỉ mời khi kỹ năng này THẬT SỰ có bài VIP đang khoá: không bán thứ chưa soạn. */}
          {moiVip && <NutVip onClick={onMuaVip} gia={giaVip} />}
          {tiep && (
            <button type="button" onClick={() => onLam(tiep.ex)} className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border-0 bg-white px-5 py-3 font-sans text-sm font-extrabold shadow-md transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0" style={{ color: m.dam }}>
              <Play size={14} className="fill-current" /> {o.xong.length ? tr("Làm bài tiếp theo", "Exercice suivant", "Next exercise") : tr("Làm bài đầu tiên", "Premier exercice", "First exercise")}
            </button>
          )}
        </div>
        {ds.length > 0 && (
          <div className="mt-4">
            <DaiBai ds={ds} />
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm font-semibold text-white/90">
              <span>
                {o.coTheLam.length
                  ? tr(`Đã làm ${o.xong.length} trên ${o.coTheLam.length} bài${pct !== null ? `, trung bình ${pct}%` : ""}`, `${o.xong.length} exercices faits sur ${o.coTheLam.length}${pct !== null ? `, moyenne ${pct} %` : ""}`, `${o.xong.length} of ${o.coTheLam.length} exercises done${pct !== null ? `, average ${pct}%` : ""}`)
                  : tr(`${o.phi.length} bài VIP`, `${o.phi.length} exercices VIP`, `${o.phi.length} VIP exercises`)}
                {len && tr(`. Còn ${len.con}% để lên hạng ${len.hang}`, `. Encore ${len.con} % pour le rang ${len.hang}`, `. ${len.con}% more for rank ${len.hang}`)}
              </span>
              {moiVip && (
                <span className="inline-flex items-center gap-1.5">
                  <Crown size={14} className="shrink-0" />
                  {o.buoc === "vip"
                    ? tr("Kỹ năng này hiện chỉ có bài VIP. Bạn vẫn sang được bước sau.", "Uniquement des exercices VIP pour l'instant. Vous pouvez quand même continuer.", "Only VIP exercises for now. You can still move on.")
                    : tr(`Thêm ${o.phi.length} bài VIP để nhớ lâu hơn, không bắt buộc`, `${o.phi.length} exercices VIP en plus, facultatifs`, `${o.phi.length} extra VIP exercises, optional`)}
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      {canhBao && !laVip && <CanhBaoKhoa noiDung={canhBao} onMuaVip={onMuaVip} giaVip={giaVip} />}
      {o.buoc === "xong" && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-ok-soft px-4 py-3">
          <Sparkles size={18} className="shrink-0 text-ok" />
          <span className="min-w-[10rem] flex-1 text-sm font-bold text-ok">{tr("Bạn đã đạt kỹ năng này.", "Compétence validée.", "You've passed this skill.")}</span>
        </div>
      )}
      {o.baiF.length > 0 && (
        <p className="m-0 mb-4 flex items-start gap-2 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
          <RotateCcw size={16} className="mt-0.5 shrink-0" />
          {tr(`Bài « ${o.baiF[0].title} » đang điểm F. Làm lại đạt từ ${NGUONG_F * 100}% để đi tiếp.`, `L'exercice « ${o.baiF[0].title} » est noté F. Refaites-le avec au moins ${NGUONG_F * 100} % pour continuer.`, `"${o.baiF[0].title}" is graded F. Redo it with at least ${NGUONG_F * 100}% to continue.`)}
        </p>
      )}
      {!o.baiF.length && o.xong.length > 0 && o.xong.length === o.coTheLam.length && o.buoc !== "xong" && (
        <p className="m-0 mb-4 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-sm font-semibold text-warn">
          <RotateCcw size={16} className="mt-0.5 shrink-0" />
          {laVip
            ? tr(`Cần trung bình từ ${NGUONG_DAT * 100}% để đạt kỹ năng này. Xem lại lỗi rồi làm lại bài điểm thấp nhé.`, `Il faut ${NGUONG_DAT * 100} % de moyenne pour valider cette compétence. Revoyez vos erreurs et refaites l'exercice le plus faible.`, `You need a ${NGUONG_DAT * 100}% average to pass this skill. Review your mistakes and retry your weakest exercise.`)
            : tr(`Cần trung bình từ ${NGUONG_DAT * 100}% để sang bước sau. Xem lại lỗi rồi làm lại bài điểm thấp nhé.`, `Il faut ${NGUONG_DAT * 100} % de moyenne pour continuer. Revoyez vos erreurs et refaites l'exercice le plus faible.`, `You need a ${NGUONG_DAT * 100}% average to continue. Review your mistakes and retry your weakest exercise.`)}
        </p>
      )}

      {ds.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-solid border-line bg-surface px-6 py-12 text-center">
          <Clock size={38} strokeWidth={1.5} className="mb-3 text-soft" />
          <p className="m-0 text-lg font-extrabold text-ink">{tr("Bài tập đang được soạn", "Exercices en préparation", "Exercises are being prepared")}</p>
          <p className="m-0 mt-1 max-w-md text-sm text-soft">{tr("Kỹ năng này chưa có bài nên không chặn đường của bạn. Bạn có thể sang bước khác.", "Cette compétence n'a pas encore d'exercice : elle ne bloque pas votre parcours.", "This skill has no exercises yet, so it doesn't block your path.")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {nhom.map(({ k, ten, moTa, Icon, nen, bai }, iv) => {
            const conLaiDuong = bai.filter((b) => b.tt !== "phi");
            return (
              <section key={k} className="relative grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-6">
                {iv < nhom.length - 1 && <span aria-hidden className="absolute -bottom-8 left-[5.5rem] top-0 hidden border-0 border-l-2 border-dashed border-line lg:block" />}
                <div className="relative self-start lg:sticky lg:top-3">
                  <TieuDeVong ten={ten} moTa={moTa} Icon={Icon} nen={nen} tong={conLaiDuong.length} xong={conLaiDuong.filter((b) => b.tt === "xong").length} soVip={bai.length - conLaiDuong.length} />
                </div>
                <ol className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-5 p-0">
                  {bai.map(({ ex, tt, doF }) => (
                    <li key={ex.id} className="relative min-w-0">
                      <DauBai tt={tt} stt={trenDuong.findIndex((b) => b.ex.id === ex.id) + 1} hang={hangBai(hist[ex.id])} />
                      {tt === "khoa" ? (
                        /* 04/11 (chủ dự án): bài chưa tới lượt không lộ tên, ảnh, nhãn. Thẻ thật vẫn
                           dựng nhưng ẩn hẳn, chỉ để giữ chiều cao cho hàng thẻ thẳng nhau. */
                        <div className="relative h-full">
                          <div aria-hidden inert="" className="pointer-events-none invisible h-full">{renderThe(ex)}</div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line bg-surface2 p-4 text-center">
                            <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-soft shadow-sm"><Lock size={20} /></span>
                            <p className="m-0 text-sm font-bold text-soft">{doF ? tr("Làm lại bài điểm F để mở", "Refaites l'exercice noté F", "Redo the F-graded exercise") : tr("Làm xong bài trước để mở", "Terminez l'exercice précédent", "Finish the previous exercise")}</p>
                          </div>
                        </div>
                      ) : renderThe(ex)}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      {(truoc || sau) && (
        <nav aria-label={tr("Kỹ năng khác", "Autres compétences", "Other skills")} className="mt-6 flex gap-3">
          {truoc ? <NutBuoc b={truoc} huong="truoc" /> : <span className="flex-1" />}
          {sau ? <NutBuoc b={sau} huong="sau" /> : <span className="flex-1" />}
        </nav>
      )}
    </div>
  );
}
