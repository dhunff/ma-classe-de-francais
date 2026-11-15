import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thử micro trước khi vào thi thử (15/11, chủ dự án). Chỉ hiện khi học sinh tích « Làm cả phần thi
 * nói ». Không ghi âm, không nghe lại (chủ dự án): chỉ mở micro vài giây, đo độ lớn tiếng bằng
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
    quaNho: { mau: "bg-danger", chu: "text-danger", nhan: tr("Quá nhỏ", "Trop faible", "Too quiet"),
      loi: tr("Micro gần như không thu được tiếng. Kiểm tra micro có bị tắt tiếng, chọn đúng micro trong cài đặt máy, nói to hơn rồi thử lại.", "Le micro ne capte presque rien. Vérifiez qu'il n'est pas coupé, choisissez le bon micro, parlez plus fort et réessayez.", "The mic barely picks up anything. Check it isn't muted, pick the right one, speak louder and retry.") },
    hoiNho: { mau: "bg-warn", chu: "text-warn", nhan: tr("Hơi nhỏ", "Un peu faible", "A bit quiet"),
      loi: tr("Vẫn thi được, nhưng khi thi hãy ngồi gần micro hơn và nói to, rõ để máy chấm nghe rõ.", "C'est suffisant, mais rapprochez-vous du micro et parlez fort pendant l'épreuve.", "Good enough, but sit closer and speak up during the exam.") },
    tot: { mau: "bg-ok", chu: "text-ok", nhan: tr("Tốt", "Bon niveau", "Good"),
      loi: tr("Micro thu tiếng tốt. Khi thi giữ khoảng cách và âm lượng như vừa rồi.", "Le micro fonctionne bien. Gardez la même distance et le même volume.", "Your mic works well. Keep the same distance and volume.") },
    quaTo: { mau: "bg-warn", chu: "text-warn", nhan: tr("Hơi to", "Un peu fort", "A bit loud"),
      loi: tr("Vẫn thi được, nhưng tiếng có thể bị rè: ngồi lùi khỏi micro một chút.", "C'est suffisant, mais le son peut saturer : éloignez-vous un peu du micro.", "Good enough, but it may distort: move back a little.") },
  };

  return (
    <div className="mt-3 rounded-2xl border border-solid border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${dat ? "bg-ok text-white" : dangDo ? "bg-danger text-white" : "bg-primary-soft text-primary"}`}>
          {dat ? <CheckCircle2 size={20} aria-hidden /> : <Mic size={19} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-bold text-ink">{tr("Thử micro trước khi thi", "Testez votre micro", "Test your microphone")}</p>
          <p className="m-0 text-xs text-soft">
            {dangDo ? tr(`Nói một câu bằng tiếng Pháp với giọng như khi thi… còn ${conLai} giây`, `Dites une phrase en français comme à l'épreuve… ${conLai} s`, `Say a sentence in French as in the exam… ${conLai}s left`)
              : tr("Bấm thử rồi nói vài giây, máy báo micro thu tiếng to hay nhỏ. Không ghi âm, không lưu.", "Parlez quelques secondes : on vous indique si le micro capte assez fort. Rien n'est enregistré.", "Speak for a few seconds to check your mic level. Nothing is recorded.")}
          </p>
        </div>
        {dangDo ? (
          <button type="button" onClick={ketThuc}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-danger px-4 py-2 font-sans text-xs font-extrabold text-white">
            <Square size={13} className="fill-current" aria-hidden /> {tr("Xong", "Terminer", "Done")}
          </button>
        ) : (
          <button type="button" onClick={thu}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 py-2 font-sans text-xs font-extrabold text-white">
            {tt === "cho" ? <Mic size={13} aria-hidden /> : <RotateCcw size={13} aria-hidden />} {tt === "cho" ? tr("Thử micro", "Tester", "Test") : tr("Thử lại", "Recommencer", "Retry")}
          </button>
        )}
      </div>

      {(dangDo || m) && (
        <div className="mt-3">
          {/* Vạch mốc: dưới vạch thứ nhất là quá nhỏ, giữa hai vạch là hơi nhỏ. */}
          <div className="relative h-3 overflow-hidden rounded-full bg-surface2" role="meter" aria-label={tr("Độ lớn tiếng", "Niveau sonore", "Input level")}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, (dangDo ? muc : kq) / 0.3) * 100)}>
            <div className={`h-full rounded-full ${dangDo ? "transition-[width] duration-75" : ""} ${dangDo ? (muc >= HOI_NHO ? "bg-ok" : muc >= QUA_NHO ? "bg-warn" : "bg-danger") : KQ[m].mau}`}
              style={{ width: rong(dangDo ? muc : kq) }} />
            <span aria-hidden className="absolute inset-y-0 w-0.5 bg-line" style={{ left: rong(QUA_NHO) }} />
            <span aria-hidden className="absolute inset-y-0 w-0.5 bg-line" style={{ left: rong(HOI_NHO) }} />
          </div>
          {m && (
            <p className="m-0 mt-2 flex items-start gap-2 text-xs text-ink">
              {m === "quaNho" && <AlertTriangle size={14} className="mt-px shrink-0 text-danger" aria-hidden />}
              <span><strong className={KQ[m].chu}>{KQ[m].nhan}.</strong> {KQ[m].loi}</span>
            </p>
          )}
        </div>
      )}

      {tt === "loi" && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
          <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {loi}
        </p>
      )}
    </div>
  );
}
