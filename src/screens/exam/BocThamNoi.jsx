import React, { useEffect, useState } from "react";
import { Shuffle, Hourglass, Mic } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";

/* Bốc thăm đề nói + thời gian chuẩn bị (13/10), như phòng thi DELF/DALF thật.
 *
 * Ba bước: BỐC (lật thẻ, bốc 2 chọn 1 từ A2, bốc 1 ở A1) → CHUẨN BỊ (đếm ngược
 * `bocTham.chuanBi` phút, có giấy nháp) → NÓI (bộ ghi âm, `children`).
 *
 * Trạng thái giữ trong sessionStorage theo attempt: F5 không cho bốc lại để
 * « chọn đề dễ », và không đặt lại đồng hồ chuẩn bị (đồng hồ neo vào MỐC THẬT,
 * cùng lý do với đồng hồ phần thi). ExamMode đọc lại khoá này lúc nộp để gửi
 * đề đã chọn lên máy chủ (ket_thuc_po). */
export const khoaBoc = (id) => `po-boc:${id}`;
const doc = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch { return null; } };
const ghi = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* bộ nhớ bị chặn: vẫn chạy */ } };

/* Đề đã chọn, dạng gửi lên máy chủ: [{ phan, ma, html }]. */
export function deDaChon(ex, id) {
  const st = doc(khoaBoc(id));
  if (!st || !ex?.bocTham) return null;
  return ex.bocTham.phan.map((ph, i) => {
    const s = ph.sujets.find((x) => x.ma === st.chon?.[i]);
    return s ? { phan: ph.ten, ma: s.ma, html: s.html } : null;
  }).filter(Boolean);
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const BOC_GIAY = 30;

export default function BocThamNoi({ ex, khoa, children }) {
  const bt = ex?.bocTham;
  const k = khoaBoc(khoa);
  const [st, setSt] = useState(() => doc(k) ?? { rut: {}, chon: {}, batDau: null, noi: false });
  const [conLai, setConLai] = useState(null);
  const capNhat = (moi) => { setSt(moi); ghi(k, moi); };

  useEffect(() => { setSt(doc(k) ?? { rut: {}, chon: {}, batDau: null, noi: false }); }, [k]);

  /* Đếm ngược chuẩn bị, neo vào mốc bắt đầu thật. */
  useEffect(() => {
    if (!bt || !st.batDau || st.noi) return;
    const het = st.batDau + bt.chuanBi * 60_000;
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((het - Date.now()) / 1000));
      setConLai(s);
      if (s === 0) { clearInterval(t); phat("batDau"); capNhat({ ...st, noi: true }); }
    }, 250);
    return () => clearInterval(t);
  }, [bt, st.batDau, st.noi]); // eslint-disable-line react-hooks/exhaustive-deps

  /* 26/10 (chủ dự án): bốc thăm + chọn đề chỉ trong 30 giây. Mốc lưu cùng trạng thái
     nên tải lại trang không được thêm giờ. Hết giờ: phần nào chưa bốc thì bốc hộ,
     chưa chọn thì lấy đề đầu, rồi tự vào giờ chuẩn bị. */
  const [conBoc, setConBoc] = useState(BOC_GIAY);
  useEffect(() => {
    if (!bt || st.batDau) return;
    if (!st.bocLuc) { capNhat({ ...st, bocLuc: Date.now() }); return; }
    const het = st.bocLuc + BOC_GIAY * 1000;
    const t = setInterval(() => {
      const c = Math.max(0, Math.ceil((het - Date.now()) / 1000));
      setConBoc(c);
      if (c === 0) {
        clearInterval(t);
        const rutMoi = { ...st.rut }, chonMoi = { ...st.chon };
        bt.phan.forEach((ph, i) => {
          if (!rutMoi[i]) rutMoi[i] = [...ph.sujets].sort(() => Math.random() - 0.5).slice(0, ph.soRut).map((x) => x.ma);
          if (!chonMoi[i]) chonMoi[i] = rutMoi[i][0];
        });
        phat("batDau");
        capNhat({ ...st, rut: rutMoi, chon: chonMoi, batDau: Date.now() });
      }
    }, 250);
    return () => clearInterval(t);
  }, [bt, st]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bt) return children;

  const rut = (i, ph) => {
    const tron = [...ph.sujets].sort(() => Math.random() - 0.5).slice(0, ph.soRut).map((s) => s.ma);
    phat("lat");
    capNhat({ ...st, rut: { ...st.rut, [i]: tron }, chon: { ...st.chon, [i]: ph.soRut === 1 ? tron[0] : undefined } });
  };
  const xongBoc = bt.phan.every((_, i) => st.chon?.[i]);
  const daChon = bt.phan.map((ph, i) => ({ ph, s: ph.sujets.find((x) => x.ma === st.chon?.[i]) }));

  const TheDe = ({ ph, s }) => (
    <div className="border-[1.5px] border-solid border-[#111] bg-white p-4">
      <p className="m-0 text-[12px] font-bold uppercase tracking-wide text-[#555]">{ph.ten} · Sujet {s.ma}</p>
      <div lang="fr" className="mt-1 text-[15.5px] leading-snug text-[#111] [&_p]:m-0 [&_p+p]:mt-2" dangerouslySetInnerHTML={{ __html: s.html }} />
    </div>
  );

  /* ── 3. NÓI ── */
  if (st.noi) {
    return (
      <div className="grid gap-5">
        <div className="grid gap-3">{daChon.map(({ ph, s }, i) => s && <TheDe key={i} ph={ph} s={s} />)}</div>
        {children}
      </div>
    );
  }

  /* ── 2. CHUẨN BỊ ── */
  if (st.batDau) {
    return (
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center gap-4 border-[1.5px] border-solid border-[#111] bg-[#f4f4f4] p-4">
          <Hourglass size={22} />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[13px] font-bold uppercase tracking-wide">Préparation</p>
            <p className="m-0 text-[13px] text-[#444]">{tr("Đọc đề, ghi dàn ý. Hết giờ chuẩn bị sẽ tự chuyển sang phần nói.", "Lisez le sujet et notez votre plan. À la fin, l'épreuve commence.", "Read the task and plan. Speaking starts when time is up.")}</p>
          </div>
          <span className="text-[34px] font-bold tabular-nums">{mmss(conLai ?? bt.chuanBi * 60)}</span>
        </div>
        <div className="grid gap-3">{daChon.map(({ ph, s }, i) => s && <TheDe key={i} ph={ph} s={s} />)}</div>
        <label className="grid gap-1">
          <span className="text-[13px] font-bold">Brouillon <span className="font-normal italic text-[#555]">({tr("không chấm, không lưu", "non noté, non enregistré", "not graded, not saved")})</span></span>
          <textarea lang="fr" rows={8} className="de-dong-ke block w-full resize-y text-[15px]" />
        </label>
        <button type="button" onClick={() => { phat("batDau"); capNhat({ ...st, noi: true }); }}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-none border-0 bg-[#111] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white">
          <Mic size={15} /> {tr("Tôi sẵn sàng: bắt đầu nói", "Je suis prêt(e) : commencer", "I'm ready: start speaking")}
        </button>
      </div>
    );
  }

  /* ── 1. BỐC THĂM ── */
  return (
    <div className="grid gap-6">
      <div className={`flex items-center gap-3 border-[1.5px] border-solid p-3 ${conBoc <= 10 ? "border-[#c00] bg-[#fff1f1] text-[#c00]" : "border-[#111] bg-[#f4f4f4] text-[#111]"}`}>
        <Shuffle size={18} />
        <p className="m-0 min-w-0 flex-1 text-[13px] font-bold">{tr("Bốc thăm và chọn đề trong 30 giây. Hết giờ sẽ tự chọn đề đầu tiên.", "Tirez et choisissez en 30 secondes. Ensuite, le premier sujet est retenu.", "Draw and choose within 30 seconds. Then the first task is kept.")}</p>
        <span className="text-[26px] font-bold tabular-nums">{mmss(conBoc)}</span>
      </div>
      {bt.phan.map((ph, i) => {
        const daRut = st.rut?.[i];
        return (
          <section key={i}>
            <p className="m-0 text-[16px] font-bold">{ph.ten}</p>
            <p className="m-0 text-[13.5px] italic text-[#444]">
              {ph.soRut === 1 ? tr("Bốc thăm một đề.", "Tirez au sort un sujet.", "Draw one task.") : tr("Bốc thăm hai đề rồi chọn một.", "Tirez au sort deux sujets, puis choisissez-en un.", "Draw two tasks, then choose one.")} {ph.cachLam}
            </p>
            {!daRut ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* 29/10: kho có thể tới 15 đề, chỉ vẽ tối đa 4 lá úp làm tượng trưng. */}
                {ph.sujets.slice(0, 4).map((s) => (
                  <span key={s.ma} aria-hidden className="grid h-24 w-16 place-items-center border-[1.5px] border-solid border-[#111] bg-[repeating-linear-gradient(45deg,#222_0_6px,#3a3a3a_6px_12px)] text-lg font-bold text-white shadow">?</span>
                ))}
                <button type="button" onClick={() => rut(i, ph)}
                  className="ml-2 inline-flex cursor-pointer items-center gap-2 rounded-none border-0 bg-[#111] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white">
                  <Shuffle size={15} /> {tr("Bốc thăm", "Tirer au sort", "Draw")}
                </button>
              </div>
            ) : (
              <div className={`mt-3 grid gap-3 ${daRut.length > 1 ? "grid-cols-2" : ""}`}>
                {daRut.map((ma) => {
                  const s = ph.sujets.find((x) => x.ma === ma);
                  const chon = st.chon?.[i] === ma;
                  return (
                    <button key={ma} type="button" disabled={ph.soRut === 1}
                      onClick={() => capNhat({ ...st, chon: { ...st.chon, [i]: ma } })}
                      className={`mcf-cau-vao cursor-pointer rounded-none border-[1.5px] border-solid p-4 text-left text-[#111] disabled:cursor-default ${chon ? "border-[#111] bg-[#eef3ff] shadow-[4px_4px_0_#111]" : "border-[#999] bg-white hover:border-[#111]"}`}>
                      <span className="block text-[12px] font-bold uppercase tracking-wide text-[#555]">Sujet {ma}{chon ? ` · ${tr("đã chọn", "choisi", "chosen")}` : ""}</span>
                      <span lang="fr" className="mt-1 block text-[15px] leading-snug [&_p]:m-0 [&_p+p]:mt-1.5" dangerouslySetInnerHTML={{ __html: s?.html ?? "" }} />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
      <button type="button" disabled={!xongBoc}
        onClick={() => { phat("batDau"); capNhat({ ...st, batDau: Date.now() }); }}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-none border-0 bg-[#111] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:bg-[#bbb]">
        <Hourglass size={15} /> {xongBoc ? tr(`Bắt đầu chuẩn bị (${bt.chuanBi} phút)`, `Commencer la préparation (${bt.chuanBi} min)`, `Start preparation (${bt.chuanBi} min)`) : tr("Bốc thăm và chọn đề trước", "Tirez et choisissez d'abord", "Draw and choose first")}
      </button>
    </div>
  );
}
