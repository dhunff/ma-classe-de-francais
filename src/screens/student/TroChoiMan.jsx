import React, { useEffect, useMemo, useState } from "react";
import { X, Heart, Star, Flame, RotateCcw, Check } from "lucide-react";
import { sinhLuot, tinhSao, SO_TIM } from "../../shared/troChoiThe.js";

/* Một màn chơi của Lộ trình — phủ kín màn hình, dựng từ thẻ THẬT của bộ.
 *
 * Không import storageShim: nhận thẻ và hàm `onXong` từ cha, nên xem thử được
 * ở /preview.html với thẻ giả.
 *
 * `onXong(sao)` phải trả Promise<{sao}|{loi}> — màn kết quả chờ biên nhận
 * của máy chủ rồi mới nói « đã lưu ». */
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

  const choiLai = () => {
    setHat((n) => n + 1); setI(0); setTim(SO_TIM); setSai(0); setChuoi(0);
    setChon(null); setKetThuc(null); setLuu(null);
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
    setTim((n) => n - 1);
  };

  const tiep = () => {
    setChon(null);
    if (tim <= 0) return xong(0);
    if (i + 1 >= luot.length) return xong(tinhSao(sai, tim));
    setI(i + 1);
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

  /* Esc để thoát — màn phủ kín không có nút Back của trình duyệt. */
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onDong(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onDong]);

  const cau = luot[i];
  const tiLe = luot.length ? ((i + (chon ? 1 : 0)) / luot.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg font-sans" role="dialog" aria-modal="true" aria-label={tieuDe}>
      {/* Thanh trên: thoát · tiến độ · tim */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-4 px-4 pt-5">
        <button type="button" onClick={onDong} aria-label={t("path.g_quit")}
          className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-surface2 hover:text-ink">
          <X size={22} />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-ok transition-all duration-500" style={{ width: `${tiLe}%` }} />
        </div>
        <div className="flex items-center gap-1 text-danger" aria-label={`${tim}/${SO_TIM}`}>
          {Array.from({ length: SO_TIM }, (_, k) => (
            <Heart key={k} size={20} fill={k < tim ? "currentColor" : "none"} className={k < tim ? "" : "opacity-30"} />
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {!luot.length ? (
          <p className="m-auto text-center text-soft">{t("path.g_too_few")}</p>
        ) : ketThuc ? (
          <KetQua ketThuc={ketThuc} luu={luu} sai={sai} tieuDe={tieuDe}
            onLai={choiLai} onDong={onDong} t={t} />
        ) : cau.kieu === "ghep" ? (
          <CauGhep key={`${hat}-${i}`} cau={cau} t={t}
            onSai={tru} onXong={() => { setChuoi((n) => n + 1); setChon("ghep"); }} />
        ) : (
          <CauChon key={`${hat}-${i}`} cau={cau} chon={chon} t={t} chuoi={chuoi}
            onChon={(p) => {
              if (chon) return;
              setChon(p);
              if (p === cau.dung) setChuoi((n) => n + 1); else tru();
            }} />
        )}
      </div>

      {/* Dải phản hồi dưới đáy, kiểu Duolingo */}
      {!ketThuc && chon && (
        <PhanHoi dung={chon === "ghep" || chon === cau?.dung} dapAn={cau?.dung} onTiep={tiep} t={t} />
      )}
    </div>
  );
}

function CauChon({ cau, chon, onChon, chuoi, t }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-lg font-extrabold text-ink">
          {cau.kieu === "nghia" ? t("path.g_meaning") : t("path.g_french")}
        </h2>
        {chuoi >= 2 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-extrabold text-ink">
            <Flame size={14} className="text-warn" />{t("path.g_combo", { n: chuoi })}
          </span>
        )}
      </div>
      <div className="rounded-2xl border-2 border-solid border-line bg-surface px-5 py-8 text-center">
        <p className="m-0 text-2xl font-bold text-ink" lang={cau.kieu === "nghia" ? "fr" : "vi"}>{cau.de}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cau.luaChon.map((p) => {
          const laDung = p === cau.dung;
          const kieu = !chon ? "border-line bg-surface text-ink hover:bg-surface2 cursor-pointer"
            : laDung ? "border-ok bg-ok-soft text-ink"
              : p === chon ? "border-danger bg-danger-soft text-ink"
                : "border-line bg-surface text-soft opacity-60";
          return (
            <button key={p} type="button" disabled={!!chon} onClick={() => onChon(p)}
              lang={cau.kieu === "nghia" ? "vi" : "fr"}
              className={`rounded-2xl border-2 border-b-4 border-solid px-4 py-4 text-left font-sans text-base font-semibold transition active:translate-y-0.5 ${kieu}`}>
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CauGhep({ cau, onSai, onXong, t }) {
  const [trai, setTrai] = useState(null);
  const [xong, setXong] = useState(() => new Set());
  const [loi, setLoi] = useState(null);   // [idTrai, idPhai] vừa ghép sai

  const bamPhai = (id) => {
    if (!trai || xong.has(id)) return;
    if (trai === id) {
      const moi = new Set(xong); moi.add(id); setXong(moi); setTrai(null);
      if (moi.size === cau.trai.length) onXong();
    } else {
      setLoi([trai, id]); onSai(); setTrai(null);
      setTimeout(() => setLoi(null), 600);
    }
  };

  const o = (id, dangChon, bamDuoc, onClick, chu, lang, sideSai) => (
    <button key={id} type="button" onClick={onClick} disabled={!bamDuoc} lang={lang}
      className={`min-h-14 rounded-2xl border-2 border-b-4 border-solid px-3 py-3 font-sans text-sm font-semibold transition
        ${xong.has(id) ? "border-ok bg-ok-soft text-soft opacity-60"
          : sideSai ? "border-danger bg-danger-soft text-ink"
            : dangChon ? "border-primary bg-primary-soft text-ink"
              : "cursor-pointer border-line bg-surface text-ink hover:bg-surface2"}`}>
      {chu}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="m-0 text-lg font-extrabold text-ink">{t("path.g_match")}</h2>
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

function PhanHoi({ dung, dapAn, onTiep, t }) {
  return (
    <div className={`border-0 border-t-2 border-solid ${dung ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft"}`}>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-4 px-4 py-5">
        <div className="min-w-0 flex-1">
          <p className={`m-0 text-lg font-extrabold ${dung ? "text-ok" : "text-danger"}`}>
            {dung ? t("path.g_correct") : t("path.g_wrong")}
          </p>
          {!dung && <p className="m-0 mt-1 text-sm font-semibold text-ink">{dapAn}</p>}
        </div>
        <button type="button" onClick={onTiep} autoFocus
          className={`cursor-pointer rounded-2xl border-0 px-8 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-white shadow-sm ${dung ? "bg-ok" : "bg-danger"}`}>
          {t("path.g_continue")}
        </button>
      </div>
    </div>
  );
}

function KetQua({ ketThuc, luu, sai, tieuDe, onLai, onDong, t }) {
  const { sao } = ketThuc;
  return (
    <div className="m-auto flex max-w-sm flex-col items-center gap-5 text-center">
      <div className="flex items-end gap-2">
        {[1, 2, 3].map((k) => (
          <Star key={k} size={k === 2 ? 64 : 48} strokeWidth={1.5}
            className={`${k <= sao ? "text-warn" : "text-line"} mcf-rise`}
            style={{ animationDelay: `${k * 150}ms` }}
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
        <p className={`m-0 text-xs font-semibold ${luu?.loi ? "text-danger" : "text-soft"}`}>
          {luu === "dang" ? t("path.g_saving")
            : luu?.loi ? t("path.g_save_err", { msg: luu.loi })
              : <span className="inline-flex items-center gap-1"><Check size={13} className="text-ok" />{t("path.g_saved")}
                  {luu?.xp > 0 && <strong className="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-ink">+{luu.xp} XP</strong>}</span>}
        </p>
      )}
      <div className="flex w-full flex-col gap-2">
        <button type="button" onClick={onDong}
          className="cursor-pointer rounded-2xl border-0 bg-primary px-6 py-3 font-sans text-sm font-extrabold uppercase tracking-wide text-on-primary">
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
