import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thử micro trước khi vào thi thử (15/11, chủ dự án). Chỉ hiện khi học sinh tích « Làm cả phần thi
 * NÓI ». Chỉ ghi « Thử mic » và mức, không giải thích (chủ dự án). Không ghi âm, không nghe lại: chỉ mở micro vài giây, đo độ lớn tiếng bằng
 * AnalyserNode rồi báo MỨC (quá nhỏ, hơi nhỏ, tốt, quá to). Quá nhỏ thì không đạt; ManCho khoá nút
 * « Bắt đầu thi » cho tới khi đạt, vì hỏng micro mà phát hiện ở phần nói (sau gần hai giờ) là mất
 * trắng phần đó. Bỏ tích phần nói thì không cần thử.
 *
 * Đo: RMS từng khung (~60 lần/giây), lấy khung to nhất sau khi làm mượt (bỏ tiếng « cạch » lẻ).
 * Ngưỡng RMS: lời nói ở cự ly thường khoảng 0,05 đến 0,3; tiếng ồn nền dưới 0,01. */

const GIAY_THU = 5;
const QUA_NHO = 0.02, HOI_NHO = 0.05, QUA_TO = 0.5;

const mucCua = (v) => (v < QUA_NHO ? "quaNho" : v < HOI_NHO ? "hoiNho" : v > QUA_TO ? "quaTo" : "tot");

export default function KiemTraMic({ onKetQua }) {
  const [tt, setTt] = useState("cho"); // cho · dangDo · xong · loi
  const [loi, setLoi] = useState("");
  const [muc, setMuc] = useState(0);   // mức tức thời, để vẽ thanh lúc đang nói
  const [kq, setKq] = useState(null);  // mức to nhất đo được
  const [conLai, setConLai] = useState(GIAY_THU);
  const ref = useRef({});

  const donDep = () => {
    const r = ref.current;
    cancelAnimationFrame(r.khung); clearInterval(r.dem); clearTimeout(r.hen);
    r.luong?.getTracks().forEach((t) => t.stop());
    r.ctx?.close?.().catch(() => {});
    ref.current = {};
  };
  /* Vừa hiện (tích lại phần nói) thì coi như chưa thử, kể cả khi lần trước đã đạt. */
  useEffect(() => { onKetQua?.(false); return donDep; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ketThuc = () => {
    const dinh = ref.current.dinh ?? 0;
    donDep();
    setMuc(0); setKq(dinh); setTt("xong");
    onKetQua?.(mucCua(dinh) !== "quaNho");
  };

  const thu = async () => {
    setLoi(""); setKq(null); setMuc(0); onKetQua?.(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setTt("loi");
      setLoi(tr("Trình duyệt này không cho dùng micro. Hãy dùng Chrome, Edge, Firefox hoặc Safari bản mới.", "Ce navigateur ne permet pas d'utiliser le micro. Utilisez un navigateur récent.", "This browser can't use the microphone. Use an up-to-date browser."));
      return;
    }
    try {
      const luong = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const phan = ctx.createAnalyser();
      phan.fftSize = 1024;
      ctx.createMediaStreamSource(luong).connect(phan);
      ref.current = { luong, ctx, dinh: 0, muot: 0 };
      const buf = new Float32Array(phan.fftSize);
      const ve = () => {
        phan.getFloatTimeDomainData(buf);
        let tong = 0;
        for (let i = 0; i < buf.length; i++) tong += buf[i] * buf[i];
        const rms = Math.sqrt(tong / buf.length);
        const r = ref.current;
        r.muot = r.muot * 0.7 + rms * 0.3;
        r.dinh = Math.max(r.dinh, r.muot);
        setMuc(r.muot);
        r.khung = requestAnimationFrame(ve);
      };
      setTt("dangDo"); setConLai(GIAY_THU);
      ve();
      ref.current.dem = setInterval(() => setConLai((c) => Math.max(0, c - 1)), 1000);
      ref.current.hen = setTimeout(ketThuc, GIAY_THU * 1000);
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

  const dangDo = tt === "dangDo";
  const m = kq == null ? null : mucCua(kq);
  const dat = m && m !== "quaNho";
  /* Thanh đo: 0 đến 0,3 RMS trải hết chiều ngang. */
  const rong = (v) => `${Math.min(100, (v / 0.3) * 100)}%`;
  const KQ = {
    quaNho: { mau: "bg-danger", chu: "text-danger", nhan: tr("Quá nhỏ", "Trop faible", "Too quiet") },
    hoiNho: { mau: "bg-warn", chu: "text-warn", nhan: tr("Hơi nhỏ", "Un peu faible", "A bit quiet") },
    tot: { mau: "bg-ok", chu: "text-ok", nhan: tr("Tốt", "Bon niveau", "Good") },
    quaTo: { mau: "bg-warn", chu: "text-warn", nhan: tr("Hơi to", "Un peu fort", "A bit loud") },
  };

  /* Gọn một dòng (15/11, chủ dự án): nút « Thử mic » → lúc đo: thanh nhỏ + giây → xong: chữ báo mức. */
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-2 text-xs">
      {dangDo ? (
        <button type="button" onClick={ketThuc}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-danger px-3 py-1.5 font-sans text-xs font-bold text-white">
          <Square size={11} className="fill-current" aria-hidden /> {conLai}s
        </button>
      ) : (
        <button type="button" onClick={thu}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 py-1.5 font-sans text-xs font-bold ${dat ? "bg-surface2 text-ink" : "bg-primary text-white"}`}>
          {tt === "cho" ? <Mic size={12} aria-hidden /> : <RotateCcw size={12} aria-hidden />} {tt === "cho" ? tr("Thử mic", "Tester le micro", "Test mic") : tr("Thử lại", "Recommencer", "Retry")}
        </button>
      )}
      {dangDo && (
        <span className="relative h-2 w-24 overflow-hidden rounded-full bg-surface2" role="meter" aria-label={tr("Độ lớn tiếng", "Niveau sonore", "Input level")}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, muc / 0.3) * 100)}>
          <span className={`block h-full rounded-full transition-[width] duration-75 ${muc >= HOI_NHO ? "bg-ok" : muc >= QUA_NHO ? "bg-warn" : "bg-danger"}`} style={{ width: rong(muc) }} />
        </span>
      )}
      {m && !dangDo && (
        <span className={`inline-flex items-center gap-1 font-bold ${KQ[m].chu}`}>
          {dat ? <CheckCircle2 size={14} aria-hidden /> : <AlertTriangle size={14} aria-hidden />} {KQ[m].nhan}
        </span>
      )}
      {tt === "loi" && (
        <span className="inline-flex items-start gap-1 font-bold text-danger">
          <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {loi}
        </span>
      )}
    </div>
  );
}
