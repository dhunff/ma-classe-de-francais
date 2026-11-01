import React, { useEffect, useMemo, useRef } from "react";
import { Headphones, BookOpen, PenLine, Mic, Check, Lock, Play, Clock, ArrowRight, ChevronLeft, Sparkles, RotateCcw, Crown } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import { CAP_DO, KY_LON, tongCap, duongKyLon, dsBaiKyNho, timKyNho, NGUONG_DAT } from "../../shared/tienTrinhLuyenTap.js";

/* Màn Luyện tập theo trình độ (01/11/2026): trình độ → kỹ năng lớn → kỹ năng nhỏ
 * → bài. Mọi số đếm từ `exercises` + `hist`; `duKien` là số bài trong kế hoạch và
 * luôn được ghi rõ là kế hoạch. Luật khoá ở shared/tienTrinhLuyenTap.js. */

/* Cùng bốn dải màu với lưới kỹ năng cũ (ngoại lệ màu nhận dạng, chữ trắng trên nền đậm). */
const KY = () => ({
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
  if (o.buoc === "vip") return <span className="text-xs font-bold text-warn">{tr(`${o.phi.length} bài VIP · không chặn đường đi`, `${o.phi.length} ex. VIP · n'empêche pas d'avancer`, `${o.phi.length} VIP ex. · doesn't block your path`)}</span>;
  return <span className="text-xs font-semibold text-soft">{tr(`Đang soạn bài · kế hoạch ${o.kn.duKien} bài`, `En préparation · ${o.kn.duKien} ex. prévus`, `Being prepared · ${o.kn.duKien} ex. planned`)}</span>;
}

/* Dấu tròn trên đường: nối dọc bằng một vạch, nên thấy ngay mình đang ở đâu. */
function DauBuoc({ o, stt, dam }) {
  if (o.buoc === "xong") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ok text-white"><Check size={16} strokeWidth={3} /></span>;
  if (o.buoc === "hienTai") return <span className="mcf-lt-nhip grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style={{ background: dam }}><Play size={13} className="ml-0.5 fill-current" /></span>;
  if (o.buoc === "khoa") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-soft"><Lock size={14} /></span>;
  if (o.buoc === "vip") return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-warn-soft text-warn"><Crown size={15} /></span>;
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-line-strong bg-surface text-xs font-bold text-soft">{stt}</span>;
}

function TheKyLon({ ky, m, duong, onMo }) {
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
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* Trang một trình độ: chọn trình độ, bước tiếp theo, bốn kỹ năng lớn. */
export function LuyenTheoCap({ cap, capHoSo, onDoiCap, exercises, hist, biKhoa, onMoKyNho, canhBao, laVip }) {
  const moiCap = useMemo(() => Object.fromEntries(CAP_DO.map((c) => [c, tongCap(c, exercises, hist, biKhoa)])), [exercises, hist, biKhoa]);
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
          {tr("Miễn phí: bài nền của mọi kỹ năng ở mọi trình độ. VIP: thêm bài luyện sâu để nhớ lâu và sát đề thi.", "Gratuit : les exercices de base de chaque compétence, à tous les niveaux. VIP : des exercices en plus pour mieux retenir et coller à l'examen.", "Free: core exercises for every skill at every level. VIP: extra practice to remember longer and match the exam.")}
        </p>
      )}

      {canhBao && <p role="status" className="mb-4 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-sm font-semibold text-warn"><Lock size={16} className="mt-0.5 shrink-0" /> {canhBao}</p>}

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
          return <TheKyLon key={ky} ky={ky} m={KYN[ky]} duong={k.duong} onMo={onMoKyNho} />;
        })}
      </div>
    </div>
  );
}

/* Trang một kỹ năng nhỏ: các bài theo thứ tự, thẻ bài dùng lại ExerciseCard qua renderThe. */
export function ChiTietKyNho({ ma, exercises, hist, biKhoa, onBack, onMoKyNho, renderThe, laVip, onMuaVip }) {
  const f = timKyNho(ma);
  if (!f) return null;
  const m = KY()[f.ky];
  const duong = duongKyLon(f.cap, f.ky, exercises, hist, biKhoa);
  const i = duong.findIndex((o) => o.kn.ma === ma);
  const o = duong[i];
  const ds = dsBaiKyNho(o, hist, biKhoa);
  const sau = duong.slice(i + 1).find((x) => x.buoc !== "sapCo" && x.buoc !== "vip");
  const pct = o.tb === null ? null : Math.round(o.tb * 100);
  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onBack} className="mb-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink hover:border-primary">
        <ChevronLeft size={16} /> {BANG(f.cap)} {f.cap}
      </button>

      <header className="mcf-cau-vao relative mb-5 overflow-hidden rounded-3xl p-5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]" style={{ background: m.nen }}>
        <span aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15" />
        <p className="relative m-0 flex items-center gap-2 text-xs font-bold text-white/85"><m.Icon size={15} /> {f.cap} · {m.ten} · {tr(`Bước ${i + 1}/${duong.length}`, `Étape ${i + 1}/${duong.length}`, `Step ${i + 1}/${duong.length}`)}</p>
        <h2 className="relative m-0 mt-1 text-2xl font-extrabold leading-tight tracking-tight">{tenKn(o.kn)}</h2>
        <p className="relative m-0 mt-1 text-sm font-semibold text-white/90">
          {o.buoc === "vip"
            ? tr(`${o.phi.length} bài VIP`, `${o.phi.length} ex. VIP`, `${o.phi.length} VIP ex.`)
            : o.bai.length
            ? tr(`Đã làm ${o.xong.length}/${o.coTheLam.length} bài${pct !== null ? ` · điểm trung bình ${pct}%` : ""}`, `${o.xong.length}/${o.coTheLam.length} faits${pct !== null ? ` · moyenne ${pct} %` : ""}`, `${o.xong.length}/${o.coTheLam.length} done${pct !== null ? ` · average ${pct}%` : ""}`)
            : tr(`Kế hoạch ${o.kn.duKien} bài`, `${o.kn.duKien} exercices prévus`, `${o.kn.duKien} exercises planned`)}
        </p>
      </header>

      {o.buoc === "xong" && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-ok-soft px-4 py-3">
          <Sparkles size={18} className="shrink-0 text-ok" />
          <span className="min-w-[10rem] flex-1 text-sm font-bold text-ok">{tr("Bạn đã đạt kỹ năng này.", "Compétence validée.", "You've passed this skill.")}</span>
          {sau && <button type="button" onClick={() => onMoKyNho(sau, m)} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border-0 bg-ok px-3 py-2 font-sans text-sm font-bold text-white">{tr("Sang bước sau", "Étape suivante", "Next step")} <ArrowRight size={15} /></button>}
        </div>
      )}
      {/* Chỉ mời khi kỹ năng này THẬT SỰ có bài VIP đang khoá: không bán thứ chưa soạn. */}
      {!laVip && o.phi.length > 0 && (o.buoc === "xong" || o.buoc === "vip") && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-warn-soft px-4 py-3">
          <Crown size={18} className="shrink-0 text-warn" />
          <span className="min-w-[10rem] flex-1 text-sm font-bold text-warn">
            {o.buoc === "xong"
              ? tr(`Còn ${o.phi.length} bài VIP để luyện sâu và nhớ lâu hơn.`, `Encore ${o.phi.length} ex. VIP pour approfondir et mieux retenir.`, `${o.phi.length} more VIP ex. to go deeper and remember longer.`)
              : tr("Kỹ năng này hiện chỉ có bài VIP. Bạn vẫn sang được bước sau.", "Cette compétence n'a pour l'instant que des exercices VIP. Vous pouvez quand même continuer.", "This skill only has VIP exercises for now. You can still move on.")}
          </span>
          <button type="button" onClick={onMuaVip} className="inline-flex cursor-pointer items-center gap-1 rounded-xl border-0 bg-primary px-3 py-2 font-sans text-sm font-bold text-on-primary"><Crown size={15} /> {tr("Mở VIP", "Passer VIP", "Go VIP")}</button>
        </div>
      )}
      {o.xong.length > 0 && o.xong.length === o.coTheLam.length && o.buoc !== "xong" && (
        <p className="m-0 mb-4 flex items-start gap-2 rounded-2xl bg-warn-soft px-4 py-3 text-sm font-semibold text-warn">
          <RotateCcw size={16} className="mt-0.5 shrink-0" />
          {tr(`Cần trung bình từ ${NGUONG_DAT * 100}% để sang bước sau. Xem lại lỗi rồi làm lại bài điểm thấp nhé.`, `Il faut ${NGUONG_DAT * 100} % de moyenne pour continuer. Revoyez vos erreurs et refaites l'exercice le plus faible.`, `You need a ${NGUONG_DAT * 100}% average to continue. Review your mistakes and retry your weakest exercise.`)}
        </p>
      )}

      {ds.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-solid border-line bg-surface px-6 py-12 text-center">
          <Clock size={38} strokeWidth={1.5} className="mb-3 text-soft" />
          <p className="m-0 text-lg font-extrabold text-ink">{tr("Bài tập đang được soạn", "Exercices en préparation", "Exercises are being prepared")}</p>
          <p className="m-0 mt-1 max-w-md text-sm text-soft">{tr("Kỹ năng này chưa có bài nên không chặn đường của bạn. Bạn có thể sang bước khác.", "Cette compétence n'a pas encore d'exercice : elle ne bloque pas votre parcours.", "This skill has no exercises yet, so it doesn't block your path.")}</p>
        </div>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {ds.map(({ ex, tt }, n) => (
            <li key={ex.id} className="flex gap-3">
              <span className={`mt-3 grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${tt === "xong" ? "bg-ok text-white" : tt === "tiepTheo" ? "bg-primary text-on-primary" : tt === "phi" ? "bg-warn-soft text-warn" : "bg-surface2 text-soft"}`}>
                {tt === "xong" ? <Check size={16} strokeWidth={3} /> : tt === "khoa" ? <Lock size={14} /> : tt === "phi" ? <Crown size={15} /> : n + 1}
              </span>
              <div className="min-w-0 max-w-sm flex-1">
                {tt === "khoa" ? (
                  <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-4 py-4">
                    <p className="m-0 text-sm font-bold text-soft">{ex.title}</p>
                    <p className="m-0 mt-0.5 text-xs text-soft">{tr("Làm xong bài trước để mở bài này", "Terminez l'exercice précédent pour l'ouvrir", "Finish the previous exercise to unlock this one")}</p>
                  </div>
                ) : renderThe(ex)}
              </div>
            </li>
          ))}
        </ol>
      )}

      {o.bai.length < o.kn.duKien && (
        <p className="m-0 mt-4 text-center text-xs text-soft">{tr(`Đang có ${o.bai.length} bài. Kế hoạch ${o.kn.duKien} bài: ${o.kn.mienPhi} miễn phí, ${o.kn.duKien - o.kn.mienPhi} VIP.`, `${o.bai.length} ex. disponibles. Prévu : ${o.kn.duKien}, dont ${o.kn.mienPhi} gratuits et ${o.kn.duKien - o.kn.mienPhi} VIP.`, `${o.bai.length} ex. available. Planned: ${o.kn.duKien}, ${o.kn.mienPhi} free and ${o.kn.duKien - o.kn.mienPhi} VIP.`)}</p>
      )}
    </div>
  );
}
