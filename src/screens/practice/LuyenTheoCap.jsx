import React, { useEffect, useMemo, useRef, useState } from "react";
import { Headphones, BookOpen, PenLine, Mic, Check, Lock, Play, Clock, ArrowRight, ChevronLeft, Sparkles, RotateCcw, Crown } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import { FloatingLayer } from "../../shared/ui.jsx";
import { GHI_CHU } from "../../content/luyenTap/ghiChuKyNang.js";
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

const VONG = () => [
  ["hoc", tr("Học", "Découverte", "Learn"), tr("Gặp kỹ năng lần đầu, mỗi bài một chủ đề", "Première rencontre, un thème par exercice", "First contact, one topic per exercise")],
  ["on", tr("Ôn", "Révision", "Review"), tr("Quay lại sau khoảng 3 ngày để nhớ lâu hơn", "À refaire environ 3 jours plus tard", "Come back about 3 days later")],
  ["chot", tr("Chốt", "Bilan", "Final check"), tr("Sau khoảng 10 ngày, từ 85% là nắm chắc", "Environ 10 jours plus tard, 85 % pour maîtriser", "About 10 days later, 85% means mastered")],
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

/* Mẹo trước khi làm: chỉ là nút bóng đèn, bấm mới mở. */
function NutMeo({ ghi }) {
  const ref = useRef(null);
  const [mo, setMo] = useState(false);
  return (
    <span ref={ref} className="inline-flex shrink-0">
      <button type="button" onClick={() => setMo((v) => !v)} aria-expanded={mo} aria-label={tr("Mẹo trước khi làm", "Conseils avant de commencer", "Tips before you start")} title={tr("Mẹo trước khi làm", "Conseils avant de commencer", "Tips before you start")}
        className="grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border-0 bg-white/25 text-2xl leading-none transition-transform hover:scale-110 motion-reduce:hover:scale-100">
        <span aria-hidden>💡</span>
      </button>
      <FloatingLayer anchorRef={ref} open={mo} onClose={() => setMo(false)} width={320} radius={18} padding={16}>
        <dl className="m-0 flex flex-col gap-3 text-sm leading-relaxed">
          {[[tr("Cần có", "Il faut connaître", "You need"), ghi.can], [tr("Lưu ý", "Attention", "Note"), ghi.luu], [tr("Lỗi hay mắc", "Erreur fréquente", "Common mistake"), ghi.loi], [tr("Mẹo", "Astuce", "Tip"), ghi.meo]].map(([t, n]) => (
            <div key={t}>
              <dt className="font-bold text-ink">{t}</dt>
              <dd className="m-0 text-soft">{n}</dd>
            </div>
          ))}
        </dl>
      </FloatingLayer>
    </span>
  );
}

/* Dấu thứ tự ở góc thẻ: thẻ bài giữ nguyên như Thư viện, dấu này nói bài đang ở đâu. */
function DauBai({ tt, stt }) {
  return (
    <span className={`absolute -left-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold shadow-md ${tt === "xong" ? "bg-ok text-white" : tt === "tiepTheo" ? "bg-primary text-on-primary" : tt === "phi" ? "bg-warn-soft text-warn" : "bg-surface2 text-soft"}`}>
      {tt === "xong" ? <Check size={17} strokeWidth={3} /> : tt === "khoa" ? <Lock size={14} /> : tt === "phi" ? <Crown size={15} /> : stt}
    </span>
  );
}

/* Trang một kỹ năng nhỏ: thẻ bài giữ nguyên như Thư viện, xếp lưới theo vòng Học, Ôn,
   Chốt. Thẻ chưa tới lượt vẫn nhìn thấy, nhưng che lại và nói rõ cần làm gì trước. */
export function ChiTietKyNho({ ma, exercises, hist, biKhoa, onBack, onMoKyNho, laVip, onMuaVip, onLam, renderThe }) {
  const f = timKyNho(ma);
  if (!f) return null;
  const m = KY()[f.ky];
  const duong = duongKyLon(f.cap, f.ky, exercises, hist, biKhoa);
  const i = duong.findIndex((o) => o.kn.ma === ma);
  const o = duong[i];
  const ds = dsBaiKyNho(o, hist, biKhoa);
  const truoc = duong[i - 1], sau = duong[i + 1];
  const tiep = ds.find((b) => b.tt === "tiepTheo");
  const ghi = GHI_CHU[ma];
  const pct = o.tb === null ? null : Math.round(o.tb * 100);
  const nhom = VONG().map(([k, ten, moTa]) => [k, ten, moTa, ds.filter((b) => (b.ex.vong || "hoc") === k)]).filter((n) => n[3].length);
  const NutBuoc = ({ b, huong }) => (
    <button type="button" onClick={() => onMoKyNho(b, m)} className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-4 py-3 font-sans text-sm font-bold text-ink hover:border-primary ${huong === "sau" ? "justify-end text-right" : "text-left"}`}>
      {huong === "truoc" && <ChevronLeft size={16} className="shrink-0" />}
      <span className="min-w-0 truncate">{tenKn(b.kn)}</span>
      {huong === "sau" && <ArrowRight size={16} className="shrink-0" />}
    </button>
  );
  return (
    <div className="mx-auto max-w-5xl">
      <button type="button" onClick={onBack} className="mb-3 inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent p-1 font-sans text-sm font-bold text-soft hover:text-primary">
        <ChevronLeft size={16} /> {BANG(f.cap)} {f.cap}: {m.ten}
      </button>

      <header className="mcf-cau-vao mb-4 rounded-3xl px-6 py-5 text-white" style={{ background: m.nen }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-[14rem] flex-1">
            <p className="m-0 text-sm font-bold text-white/85">{tr(`Bước ${i + 1} trên ${duong.length}`, `Étape ${i + 1} sur ${duong.length}`, `Step ${i + 1} of ${duong.length}`)}</p>
            <h2 className="m-0 mt-0.5 text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance]">{tenKn(o.kn)}</h2>
          </div>
          {ghi && <NutMeo ghi={ghi} />}
          {tiep && (
            <button type="button" onClick={() => onLam(tiep.ex)} className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border-0 bg-white px-5 py-3 font-sans text-sm font-extrabold shadow-md transition-transform hover:-translate-y-0.5 motion-reduce:hover:translate-y-0" style={{ color: m.dam }}>
              <Play size={14} className="fill-current" /> {o.xong.length ? tr("Làm bài tiếp theo", "Exercice suivant", "Next exercise") : tr("Làm bài đầu tiên", "Premier exercice", "First exercise")}
            </button>
          )}
        </div>
        {ds.length > 0 && (
          <div className="mt-4">
            <DaiBai ds={ds} />
            <p className="m-0 mt-2 text-sm font-semibold text-white/90">
              {o.coTheLam.length
                ? tr(`Đã làm ${o.xong.length} trên ${o.coTheLam.length} bài${pct !== null ? `, trung bình ${pct}%` : ""}`, `${o.xong.length} exercices faits sur ${o.coTheLam.length}${pct !== null ? `, moyenne ${pct} %` : ""}`, `${o.xong.length} of ${o.coTheLam.length} exercises done${pct !== null ? `, average ${pct}%` : ""}`)
                : tr(`${o.phi.length} bài VIP`, `${o.phi.length} exercices VIP`, `${o.phi.length} VIP exercises`)}
            </p>
          </div>
        )}
      </header>

      {o.buoc === "xong" && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-ok-soft px-4 py-3">
          <Sparkles size={18} className="shrink-0 text-ok" />
          <span className="min-w-[10rem] flex-1 text-sm font-bold text-ok">{tr("Bạn đã đạt kỹ năng này.", "Compétence validée.", "You've passed this skill.")}</span>
        </div>
      )}
      {/* Chỉ mời khi kỹ năng này THẬT SỰ có bài VIP đang khoá: không bán thứ chưa soạn. */}
      {!laVip && o.phi.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-warn-soft px-4 py-3">
          <Crown size={18} className="shrink-0 text-warn" />
          <span className="min-w-[10rem] flex-1 text-sm font-bold text-warn">
            {o.buoc === "vip"
              ? tr("Kỹ năng này hiện chỉ có bài VIP. Bạn vẫn sang được bước sau.", "Cette compétence n'a pour l'instant que des exercices VIP. Vous pouvez quand même continuer.", "This skill only has VIP exercises for now. You can still move on.")
              : tr(`VIP mở thêm ${o.phi.length} bài để luyện sâu và nhớ lâu hơn. Không có vẫn đi tiếp được.`, `VIP ouvre ${o.phi.length} exercices de plus pour approfondir. Vous pouvez continuer sans.`, `VIP unlocks ${o.phi.length} more exercises. You can continue without them.`)}
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
        <div className="flex flex-col gap-6">
          {nhom.map(([k, ten, moTa, bai]) => (
            <section key={k}>
              <h3 className="m-0 text-lg font-extrabold text-ink">{ten}</h3>
              <p className="m-0 mb-3 text-sm text-soft">{moTa}</p>
              <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {bai.map(({ ex, tt }) => (
                  <li key={ex.id} className="relative min-w-0">
                    <DauBai tt={tt} stt={ds.findIndex((b) => b.ex.id === ex.id) + 1} />
                    {tt === "khoa" ? (
                      <div className="relative h-full">
                        <div aria-hidden inert="" className="pointer-events-none h-full opacity-50">{renderThe(ex)}</div>
                        <p className="absolute inset-x-3 bottom-3 m-0 rounded-2xl bg-surface2 px-3 py-2.5 text-center text-sm font-bold text-ink shadow-sm">{tr("Làm xong bài trước để mở", "Terminez l'exercice précédent", "Finish the previous exercise")}</p>
                      </div>
                    ) : renderThe(ex)}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
      {o.bai.length < o.kn.duKien && (
        <p className="m-0 mt-4 text-sm text-soft">{tr(`Đang có ${o.bai.length} bài. Kế hoạch ${o.kn.duKien} bài: ${o.kn.mienPhi} miễn phí, ${o.kn.duKien - o.kn.mienPhi} VIP.`, `${o.bai.length} ex. disponibles. Prévu : ${o.kn.duKien}, dont ${o.kn.mienPhi} gratuits et ${o.kn.duKien - o.kn.mienPhi} VIP.`, `${o.bai.length} ex. available. Planned: ${o.kn.duKien}, ${o.kn.mienPhi} free and ${o.kn.duKien - o.kn.mienPhi} VIP.`)}</p>
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
