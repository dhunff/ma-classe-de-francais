import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Heart, Star, Flame, RotateCcw, Check, XCircle, CheckCircle2 } from "lucide-react";
import { sinhLuot, tinhSao, SO_TIM } from "../../shared/troChoiThe.js";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";

/* Một màn chơi của Lộ trình — phủ kín màn hình, dựng từ thẻ THẬT của bộ.
 *
 * Làm lại 09/10 (chủ dự án: « còn đơn điệu »): Leon đứng cạnh câu hỏi và phản
 * ứng theo từng câu, câu mới trượt vào, chọn đúng thì nảy + pháo giấy, sai thì
 * rung + tim rơi, dải phản hồi trồi lên kèm lời Leon. Phím 1–4 chọn phương án,
 * Enter để tiếp tục. Mọi hoạt ảnh tắt khi bật giảm chuyển động (base.css).
 *
 * Không import storageShim: nhận thẻ và hàm `onXong` từ cha, nên xem thử được
 * ở /preview.html với thẻ giả.
 *
 * `onXong(sao)` phải trả Promise<{sao}|{loi}> — màn kết quả chờ biên nhận
 * của máy chủ rồi mới nói « đã lưu ». */

const chonNgauNhien = (ds) => ds[Math.floor(Math.random() * ds.length)];
const LOI_DUNG = () => [
  ["tuyet-voi", tr("C'est super !", "C'est super !", "C'est super!")],
  ["yeah", tr("Chính xác! Leon vẫy đuôi rồi nè.", "Exact ! Leon remue la queue.", "Exactly! Leon is wagging his tail.")],
  ["duoc-do", tr("Bravo ! Giỏi lắm!", "Bravo ! Bien joué !", "Bravo! Well done!")],
  ["haha", tr("Dễ như ăn bánh croissant!", "Facile comme un croissant !", "Easy as a croissant!")],
  ["ok", tr("Parfait ! Tiếp nào!", "Parfait ! On continue !", "Parfait! Keep going!")],
];
const LOI_SAI = () => [
  ["buon", tr("Ohlala… gần đúng rồi!", "Ohlala… presque !", "Ohlala… so close!")],
  ["hum", tr("Hửm, chưa phải rồi. Nhớ lại nhé!", "Hmm, pas tout à fait. Retiens bien !", "Hmm, not quite. Remember this one!")],
  ["co-len", tr("Không sao, allez, courage !", "Pas grave, allez, courage !", "No worries, allez, courage!")],
];

export default function TroChoiMan({ tieuDe, the, kho, soCau = 8, ghep = true, onXong, onDong, t }) {
  const [hat, setHat] = useState(0);                 // đổi để chơi lại → xáo mới
  const luot = useMemo(() => sinhLuot(the, { soCau, ghep, kho }), [the, kho, soCau, ghep, hat]);
  const [i, setI] = useState(0);
  const [tim, setTim] = useState(SO_TIM);
  const [sai, setSai] = useState(0);
  const [chuoi, setChuoi] = useState(0);
  const [chon, setChon] = useState(null);            // phương án vừa bấm
  const [ketThuc, setKetThuc] = useState(null);      // null | { sao }
  const [luu, setLuu] = useState(null);              // null | "dang" | {sao} | {loi}
  const [timMat, setTimMat] = useState(-1);          // chỉ số tim vừa mất (để chạy hoạt ảnh)
  const [loiLeon, setLoiLeon] = useState(null);      // [cảm xúc, câu] cho dải phản hồi

  const choiLai = () => {
    setHat((n) => n + 1); setI(0); setTim(SO_TIM); setSai(0); setChuoi(0);
    setChon(null); setKetThuc(null); setLuu(null); setTimMat(-1); setLoiLeon(null);
  };

  const xong = (sao) => {
    setKetThuc({ sao });
    if (sao > 0) {
      setLuu("dang");
      Promise.resolve(onXong(sao)).then(setLuu, (e) => setLuu({ loi: String(e?.message || e) }));
    }
  };

  const tru = () => {
    setSai((n) => n + 1); setChuoi(0);
    setTimMat(tim - 1);
    setTim((n) => n - 1);
  };

  const tiep = () => {
    setChon(null); setLoiLeon(null);
    if (tim <= 0) return xong(0);
    if (i + 1 >= luot.length) return xong(tinhSao(sai, tim));
    setI(i + 1);
  };

  const traLoi = (p) => {
    if (chon) return;
    const cau = luot[i];
    setChon(p);
    if (p === cau.dung) { setChuoi((n) => n + 1); setLoiLeon(chonNgauNhien(LOI_DUNG())); }
    else { tru(); setLoiLeon(chonNgauNhien(LOI_SAI())); }
  };

  /* Câu ghép không có dải « Tiếp tục » sau mỗi lần sai, nên hết tim giữa câu
     ghép phải tự kết thúc lượt ở đây. */
  useEffect(() => {
    if (tim <= 0 && !ketThuc && luot[i]?.kieu === "ghep") {
      const h = setTimeout(() => xong(0), 650);
      return () => clearTimeout(h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tim]);

  /* Phím tắt: Esc thoát · 1–4 chọn · Enter tiếp tục. */
  const refPhim = useRef({});
  refPhim.current = { chon, ketThuc, cau: luot[i], tiep, traLoi };
  useEffect(() => {
    const k = (e) => {
      const s = refPhim.current;
      if (e.key === "Escape") { onDong(); return; }
      if (s.ketThuc) return;
      if (e.key === "Enter" && s.chon) { e.preventDefault(); s.tiep(); return; }
      if (!s.chon && s.cau?.kieu !== "ghep" && /^[1-4]$/.test(e.key)) {
        const p = s.cau?.luaChon?.[Number(e.key) - 1];
        if (p) s.traLoi(p);
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onDong]);

  const cau = luot[i];
  const tiLe = luot.length ? ((i + (chon ? 1 : 0)) / luot.length) * 100 : 0;
  const dungCau = chon === "ghep" || chon === cau?.dung;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg font-sans" role="dialog" aria-modal="true" aria-label={tieuDe}>
      {/* Thanh trên: thoát · tiến độ · tim */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 pt-5">
        <button type="button" onClick={onDong} aria-label={t("path.g_quit")}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft transition-colors hover:bg-surface2 hover:text-ink">
          <X size={22} />
        </button>
        <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={Math.round(tiLe)} aria-valuemin={0} aria-valuemax={100}>
          <div className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-ok transition-[width] duration-700 ease-out" style={{ width: `${Math.max(tiLe, 4)}%` }}>
            <span aria-hidden className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/40" />
            <span aria-hidden className="mcf-anh-sang absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-danger" aria-label={`${tim}/${SO_TIM}`}>
          {Array.from({ length: SO_TIM }, (_, k) => (
            <Heart key={`${k}-${k === timMat ? sai : 0}`} size={22} fill={k < tim ? "currentColor" : "none"}
              className={k < tim ? "drop-shadow-[0_2px_4px_rgba(220,38,38,0.35)]" : k === timMat ? "mcf-tim-mat" : "opacity-30"} />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {!luot.length ? (
          <p className="m-auto text-center text-soft">{t("path.g_too_few")}</p>
        ) : ketThuc ? (
          <KetQua ketThuc={ketThuc} luu={luu} sai={sai} tieuDe={tieuDe} tongCau={luot.length}
            onLai={choiLai} onDong={onDong} t={t} />
        ) : cau.kieu === "ghep" ? (
          <CauGhep key={`${hat}-${i}`} cau={cau} t={t} chuoi={chuoi}
            onSai={tru} onXong={() => { setChuoi((n) => n + 1); setLoiLeon(chonNgauNhien(LOI_DUNG())); setChon("ghep"); }} />
        ) : (
          <CauChon key={`${hat}-${i}`} cau={cau} chon={chon} t={t} chuoi={chuoi} so={i + 1} tong={luot.length}
            onChon={traLoi} />
        )}
      </div>

      {/* Dải phản hồi trồi lên từ đáy, có Leon */}
      {!ketThuc && chon && (
        <PhanHoi key={`${hat}-${i}`} dung={dungCau} dapAn={cau?.dung} leon={loiLeon} onTiep={tiep} t={t} />
      )}
    </div>
  );
}

/* Pháo giấy nhỏ quanh phương án đúng — chỉ là CSS, không thư viện. */
function PhaoGiay() {
  const mau = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#06b6d4"];
  const manh = useMemo(() => Array.from({ length: 18 }, (_, k) => {
    const goc = (k / 18) * Math.PI * 2 + Math.random() * 0.4;
    const xa = 60 + Math.random() * 70;
    return { k, c: mau[k % mau.length], dx: `${Math.cos(goc) * xa}px`, dy: `${Math.sin(goc) * xa - 20}px`, r: `${Math.random() * 540 - 270}deg`, tron: k % 3 === 0 };
  }), []);
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {manh.map((m) => (
        <span key={m.k} className={`mcf-phao absolute h-2 w-2 ${m.tron ? "rounded-full" : "rounded-[2px]"}`}
          style={{ background: m.c, "--dx": m.dx, "--dy": m.dy, "--r": m.r }} />
      ))}
    </span>
  );
}

function Combo({ chuoi, t }) {
  if (chuoi < 2) return null;
  return (
    <span key={chuoi} className="mcf-nay inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-extrabold text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)]">
      <Flame size={14} className="mcf-lua-nhun fill-white" />{t("path.g_combo", { n: chuoi })}
    </span>
  );
}

function CauChon({ cau, chon, onChon, chuoi, so, tong, t }) {
  const camLeon = !chon ? "suy-nghi" : chon === cau.dung ? "tuyet-voi" : "buon";
  return (
    <div className="mcf-cau-vao flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-soft">
          {tr("Câu", "Question", "Question")} {so}/{tong}
        </span>
        <Combo chuoi={chuoi} t={t} />
      </div>

      {/* Leon + bong bóng chứa câu hỏi */}
      <div className="flex items-end gap-3 sm:gap-5">
        <Leon key={camLeon} cam={camLeon} size={112} className="mcf-nay shrink-0 drop-shadow-[0_10px_16px_rgba(0,0,0,0.12)] max-sm:h-20 max-sm:w-20" />
        <div className="relative mb-4 min-w-0 flex-1 rounded-3xl rounded-bl-md border-2 border-solid border-line bg-surface px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <p className="m-0 text-sm font-bold text-soft">
            {cau.kieu === "nghia" ? t("path.g_meaning") : t("path.g_french")}
          </p>
          <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight text-ink" lang={cau.kieu === "nghia" ? "fr" : "vi"}>{cau.de}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cau.luaChon.map((p, k) => {
          const laDung = p === cau.dung;
          const daChon = p === chon;
          const kieu = !chon ? "cursor-pointer border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_8px_20px_rgba(37,99,235,0.12)]"
            : laDung ? "mcf-nay border-ok bg-ok-soft text-ink shadow-[0_8px_24px_rgba(34,197,94,0.25)]"
              : daChon ? "mcf-rung border-danger bg-danger-soft text-ink"
                : "border-line bg-surface text-soft opacity-50";
          return (
            <button key={p} type="button" disabled={!!chon} onClick={() => onChon(p)}
              lang={cau.kieu === "nghia" ? "vi" : "fr"}
              className={`relative flex items-center gap-3 rounded-2xl border-2 border-b-4 border-solid px-4 py-4 text-left font-sans text-base font-semibold transition-all duration-200 active:translate-y-0.5 active:border-b-2 ${kieu}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-solid text-xs font-extrabold ${
                chon && laDung ? "border-ok bg-ok text-white" : chon && daChon ? "border-danger bg-danger text-white" : "border-line text-soft"}`}>
                {chon && laDung ? <Check size={16} strokeWidth={3} /> : chon && daChon ? <X size={16} strokeWidth={3} /> : k + 1}
              </span>
              <span className="min-w-0 flex-1">{p}</span>
              {chon === cau.dung && laDung && <PhaoGiay />}
            </button>
          );
        })}
      </div>
      {!chon && (
        <p className="m-0 hidden text-center text-xs text-soft sm:block">
          {tr("Mẹo: bấm phím 1–4 để chọn, Enter để tiếp tục", "Astuce : touches 1 à 4 pour choisir, Entrée pour continuer", "Tip: press 1–4 to choose, Enter to continue")}
        </p>
      )}
    </div>
  );
}

function CauGhep({ cau, onSai, onXong, chuoi, t }) {
  const [trai, setTrai] = useState(null);
  const [xong, setXong] = useState(() => new Set());
  const [loi, setLoi] = useState(null);   // [idTrai, idPhai] vừa ghép sai
  const [vuaGhep, setVuaGhep] = useState(null);

  const bamPhai = (id) => {
    if (!trai || xong.has(id)) return;
    if (trai === id) {
      const moi = new Set(xong); moi.add(id); setXong(moi); setTrai(null); setVuaGhep(id);
      if (moi.size === cau.trai.length) onXong();
    } else {
      setLoi([trai, id]); onSai(); setTrai(null);
      setTimeout(() => setLoi(null), 600);
    }
  };

  const o = (id, dangChon, bamDuoc, onClick, chu, lang, sideSai) => (
    <button key={id} type="button" onClick={onClick} disabled={!bamDuoc} lang={lang}
      className={`relative min-h-14 rounded-2xl border-2 border-b-4 border-solid px-3 py-3 font-sans text-sm font-semibold transition-all duration-200
        ${xong.has(id) ? `border-ok bg-ok-soft text-soft ${vuaGhep === id ? "mcf-nay" : "opacity-50"}`
          : sideSai ? "mcf-rung border-danger bg-danger-soft text-ink"
            : dangChon ? "-translate-y-0.5 border-primary bg-primary-soft text-ink shadow-[0_8px_20px_rgba(37,99,235,0.18)]"
              : "cursor-pointer border-line bg-surface text-ink hover:-translate-y-0.5 hover:border-primary/50"}`}>
      {xong.has(id) && <CheckCircle2 size={14} className="absolute right-2 top-2 text-ok" />}
      {chu}
    </button>
  );

  return (
    <div className="mcf-cau-vao flex flex-col gap-6">
      <div className="flex items-end gap-3">
        <Leon cam={xong.size === cau.trai.length ? "yeah" : loi ? "hum" : "lam-viec"} size={88} className="shrink-0" />
        <div className="mb-3 flex-1 rounded-3xl rounded-bl-md border-2 border-solid border-line bg-surface px-5 py-4">
          <h2 className="m-0 text-lg font-extrabold text-ink">{t("path.g_match")}</h2>
          <p className="m-0 mt-0.5 text-xs text-soft">{xong.size}/{cau.trai.length}</p>
        </div>
        <Combo chuoi={chuoi} t={t} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {cau.trai.map((x) => o(x.id, trai === x.id, !xong.has(x.id), () => setTrai(x.id), x.chu, "fr", loi?.[0] === x.id))}
        </div>
        <div className="flex flex-col gap-3">
          {cau.phai.map((x) => o(x.id, false, !!trai && !xong.has(x.id), () => bamPhai(x.id), x.chu, "vi", loi?.[1] === x.id))}
        </div>
      </div>
    </div>
  );
}

function PhanHoi({ dung, dapAn, leon, onTiep, t }) {
  const [cam, loi] = leon ?? (dung ? ["tuyet-voi", t("path.g_correct")] : ["buon", t("path.g_wrong")]);
  return (
    <div className={`mcf-dai-len border-0 border-t-2 border-solid ${dung ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft"}`}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-4 py-4">
        <Leon cam={cam} size={72} className="mcf-nay shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={`m-0 flex items-center gap-1.5 text-xl font-extrabold ${dung ? "text-ok" : "text-danger"}`}>
            {dung ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
            {dung ? t("path.g_correct") : t("path.g_wrong")}
          </p>
          <p className="m-0 mt-0.5 text-sm font-semibold text-ink">{loi}</p>
          {!dung && (
            <p className="m-0 mt-1 text-sm text-ink">
              {tr("Đáp án đúng:", "Bonne réponse :", "Correct answer:")} <strong>{dapAn}</strong>
            </p>
          )}
        </div>
        <button type="button" onClick={onTiep} autoFocus
          className={`cursor-pointer rounded-2xl border-0 border-b-4 border-solid px-8 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0 ${dung ? "border-green-700 bg-ok" : "border-red-800 bg-danger"}`}>
          {t("path.g_continue")}
        </button>
      </div>
    </div>
  );
}

function KetQua({ ketThuc, luu, sai, tieuDe, tongCau, onLai, onDong, t }) {
  const { sao } = ketThuc;
  const dung = Math.max(0, tongCau - sai);
  return (
    <div className="mcf-cau-vao m-auto flex w-full max-w-sm flex-col items-center gap-5 text-center">
      <div className="relative">
        <Leon cam={sao === 3 ? "yeah" : sao > 0 ? "tuyet-voi" : "co-len"} size={150} className="mcf-nay drop-shadow-[0_14px_20px_rgba(0,0,0,0.15)]" />
        {sao > 0 && <PhaoGiay />}
      </div>
      <div className="flex items-end gap-2">
        {[1, 2, 3].map((k) => (
          <Star key={k} size={k === 2 ? 60 : 46} strokeWidth={1.5}
            className={`${k <= sao ? "text-warn drop-shadow-[0_6px_10px_rgba(245,158,11,0.45)]" : "text-line"} mcf-sao-no`}
            style={{ animationDelay: `${200 + k * 180}ms` }}
            fill={k <= sao ? "currentColor" : "none"} />
        ))}
      </div>
      <div>
        <h2 className="m-0 text-2xl font-extrabold text-ink">{sao > 0 ? t("path.g_win") : t("path.g_lose")}</h2>
        <p className="m-0 mt-1 text-sm text-soft">{tieuDe}</p>
        <p className="m-0 mt-2 text-sm font-semibold text-ink">
          {sao > 0 ? t("path.g_mistakes", { n: sai }) : t("path.g_lose_body")}
        </p>
      </div>
      {sao > 0 && (
        <div className="grid w-full grid-cols-2 gap-2">
          <div className="rounded-2xl border-2 border-solid border-ok/40 bg-ok-soft px-3 py-2">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-ok">{tr("Đúng", "Justes", "Correct")}</p>
            <p className="m-0 text-xl font-extrabold tabular-nums text-ink">{dung}</p>
          </div>
          <div className="rounded-2xl border-2 border-solid border-danger/30 bg-danger-soft px-3 py-2">
            <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-danger">{tr("Sai", "Erreurs", "Mistakes")}</p>
            <p className="m-0 text-xl font-extrabold tabular-nums text-ink">{sai}</p>
          </div>
        </div>
      )}
      {sao > 0 && (
        <p className={`m-0 text-xs font-semibold ${luu?.loi ? "text-danger" : "text-soft"}`}>
          {luu === "dang" ? t("path.g_saving")
            : luu?.loi ? t("path.g_save_err", { msg: luu.loi })
              : <span className="inline-flex items-center gap-1"><Check size={13} className="text-ok" />{t("path.g_saved")}
                  {luu?.xp > 0 && <strong className="mcf-nay ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-ink">+{luu.xp} XP</strong>}</span>}
        </p>
      )}
      <div className="flex w-full flex-col gap-2">
        <button type="button" onClick={onDong}
          className="cursor-pointer rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-primary px-6 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-on-primary transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0">
          {t("path.g_back")}
        </button>
        <button type="button" onClick={onLai}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-solid border-line bg-surface px-6 py-3 font-sans text-sm font-bold text-ink hover:bg-surface2">
          <RotateCcw size={15} />{t("path.g_retry")}
        </button>
      </div>
    </div>
  );
}
