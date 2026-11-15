import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thử micro trước khi vào thi thử (15/11, chủ dự án). Chỉ hiện khi học sinh tích « Làm cả phần thi
 * nói ». Ghi thử vài giây NGAY TRÊN MÁY (không tải lên đâu cả), đo độ lớn tiếng bằng AnalyserNode
 * để biết micro có thu được tiếng không, rồi cho nghe lại. Đạt khi có tiếng đủ to; ManCho khoá nút
 * « Bắt đầu thi » cho tới khi đạt, vì hỏng micro mà phát hiện ở phần nói (sau gần hai giờ) là mất
 * trắng phần đó. Bỏ tích phần nói thì không cần thử. */

const GIAY_THU = 5;
const NGUONG = 0.06; // biên độ đỉnh (0..1) coi là có tiếng nói, tiếng ồn nền thường dưới 0.02

export default function KiemTraMic({ onKetQua }) {
  const [tt, setTt] = useState("cho"); // cho · dangGhi · dat · nho · loi
  const [loi, setLoi] = useState("");
  const [muc, setMuc] = useState(0);
  const [conLai, setConLai] = useState(GIAY_THU);
  const [nghe, setNghe] = useState(null);
  const ref = useRef({});

  const donDep = () => {
    const r = ref.current;
    cancelAnimationFrame(r.khung); clearInterval(r.dem); clearTimeout(r.hen);
    try { r.may?.state === "recording" && r.may.stop(); } catch { /* đã dừng */ }
    r.luong?.getTracks().forEach((t) => t.stop());
    r.ctx?.close?.().catch(() => {});
  };
  /* Vừa hiện (tích lại phần nói) thì coi như chưa thử, kể cả khi lần trước đã đạt. */
  useEffect(() => { onKetQua?.(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { donDep(); if (ref.current.url) URL.revokeObjectURL(ref.current.url); }, []);

  const thu = async () => {
    setLoi(""); setMuc(0); onKetQua?.(false);
    if (ref.current.url) { URL.revokeObjectURL(ref.current.url); ref.current.url = null; setNghe(null); }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setTt("loi");
      setLoi(tr("Trình duyệt này không cho ghi âm. Hãy dùng Chrome, Edge, Firefox hoặc Safari bản mới.", "Ce navigateur ne permet pas l'enregistrement. Utilisez un navigateur récent.", "This browser can't record. Use an up-to-date browser."));
      return;
    }
    try {
      const luong = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const phan = ctx.createAnalyser();
      phan.fftSize = 1024;
      ctx.createMediaStreamSource(luong).connect(phan);
      const may = new MediaRecorder(luong);
      const manh = [];
      let dinh = 0;
      ref.current = { ...ref.current, luong, ctx, may };
      const buf = new Float32Array(phan.fftSize);
      const ve = () => {
        phan.getFloatTimeDomainData(buf);
        let m = 0;
        for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i]));
        dinh = Math.max(dinh, m);
        setMuc(m);
        ref.current.khung = requestAnimationFrame(ve);
      };
      may.ondataavailable = (e) => { if (e.data?.size) manh.push(e.data); };
      may.onstop = () => {
        const blob = new Blob(manh, { type: may.mimeType });
        donDep();
        setMuc(0);
        if (blob.size) { ref.current.url = URL.createObjectURL(blob); setNghe(ref.current.url); }
        const dat = dinh >= NGUONG && blob.size > 0;
        setTt(dat ? "dat" : "nho");
        onKetQua?.(dat);
      };
      may.start();
      setTt("dangGhi"); setConLai(GIAY_THU);
      ve();
      ref.current.dem = setInterval(() => setConLai((c) => Math.max(0, c - 1)), 1000);
      ref.current.hen = setTimeout(() => { try { may.stop(); } catch { /* đã dừng */ } }, GIAY_THU * 1000);
    } catch (e) {
      donDep();
      setTt("loi");
      setLoi(e?.name === "NotAllowedError"
        ? tr("Bạn đã chặn quyền dùng micro. Bấm biểu tượng ổ khoá cạnh địa chỉ trang, cho phép micro rồi thử lại.", "L'accès au micro est bloqué. Autorisez-le dans les réglages du site (cadenas), puis réessayez.", "Microphone access is blocked. Allow it in the site settings (padlock), then retry.")
        : e?.name === "NotFoundError"
          ? tr("Không tìm thấy micro nào. Cắm tai nghe có micro hoặc bật micro của máy rồi thử lại.", "Aucun micro détecté. Branchez ou activez un micro, puis réessayez.", "No microphone found. Plug in or enable one, then retry.")
          : tr("Không mở được micro: ", "Impossible d'ouvrir le micro : ", "Couldn't open the microphone: ") + (e?.message ?? e));
    }
  };

  const dung = () => { try { ref.current.may?.stop(); } catch { /* đã dừng */ } };
  const dangGhi = tt === "dangGhi";

  return (
    <div className="mt-3 rounded-2xl border border-solid border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tt === "dat" ? "bg-ok text-white" : dangGhi ? "bg-danger text-white" : "bg-primary-soft text-primary"}`}>
          {tt === "dat" ? <CheckCircle2 size={20} aria-hidden /> : <Mic size={19} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-bold text-ink">{tr("Thử micro trước khi thi", "Testez votre micro", "Test your microphone")}</p>
          <p className="m-0 text-xs text-soft">
            {dangGhi ? tr(`Hãy nói một câu bằng tiếng Pháp… còn ${conLai} giây`, `Dites une phrase en français… ${conLai} s`, `Say a sentence in French… ${conLai}s left`)
              : tt === "dat" ? tr("Micro thu tiếng tốt. Nghe lại để chắc giọng rõ.", "Le micro fonctionne. Réécoutez pour vérifier.", "Your microphone works. Listen back to check.")
              : tr("Bấm thử, nói vài giây rồi nghe lại. Bản thử chỉ ở trên máy bạn, không lưu.", "Enregistrez quelques secondes puis réécoutez. Rien n'est envoyé.", "Record a few seconds, then listen back. Nothing is uploaded.")}
          </p>
        </div>
        {dangGhi ? (
          <button type="button" onClick={dung}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-danger px-4 py-2 font-sans text-xs font-extrabold text-white">
            <Square size={13} className="fill-current" aria-hidden /> {tr("Dừng", "Arrêter", "Stop")}
          </button>
        ) : (
          <button type="button" onClick={thu}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-xs font-extrabold text-white">
            {tt === "cho" ? <Mic size={13} aria-hidden /> : <RotateCcw size={13} aria-hidden />} {tt === "cho" ? tr("Thử micro", "Tester", "Test") : tr("Thử lại", "Recommencer", "Retry")}
          </button>
        )}
      </div>

      {dangGhi && (
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface2" role="meter" aria-label={tr("Độ lớn tiếng", "Niveau sonore", "Input level")}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, muc / 0.5) * 100)}>
          <div className={`h-full rounded-full transition-[width] duration-75 ${muc >= NGUONG ? "bg-ok" : "bg-warn"}`} style={{ width: `${Math.min(100, (muc / 0.5) * 100)}%` }} />
        </div>
      )}

      {tt === "nho" && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-warn-soft p-3 text-xs font-bold text-ink">
          <AlertTriangle size={14} className="mt-px shrink-0 text-warn" aria-hidden />
          {tr("Gần như không thu được tiếng. Kiểm tra micro có bị tắt tiếng, chọn đúng micro trong cài đặt máy, nói to hơn rồi thử lại.", "Presque aucun son capté. Vérifiez que le micro n'est pas coupé, choisissez le bon micro, parlez plus fort et réessayez.", "Almost no sound captured. Check the mic isn't muted, pick the right one, speak louder and retry.")}
        </p>
      )}
      {tt === "loi" && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
          <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {loi}
        </p>
      )}
      {nghe && !dangGhi && <audio key={nghe} controls src={nghe} className="mt-3 w-full" />}
    </div>
  );
}
