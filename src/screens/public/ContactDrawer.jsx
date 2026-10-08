import React, { useEffect, useRef, useState } from "react";
import { X, Send, CheckCircle2 } from "lucide-react";
import { guiLienHe } from "../../shared/lienHe.js";
import { tr } from "../../shared/i18n.jsx";

/* Ngăn kéo « Gửi câu hỏi » của trang giới thiệu (25/09).
 *
 * GỬI THẬT, không giả lập: đi qua RPC `gui_lien_he` (migration 077–080) — nơi
 * có kiểm email, chặn lũ 3 lượt/ngày/email và 10 lượt/giờ/IP. Giáo viên đọc ở
 * /professeur/lien-he. Một form báo "đã gửi" mà không lưu gì là nói dối đúng
 * người đang muốn tin mình.
 *
 * Bảng `leads` không có cột năm sinh — năm sinh ghép vào đầu `noi_dung`, để
 * không phải thêm cột cho một trường chỉ cần đọc bằng mắt. */

const VAI = () => [["hoc_sinh", tr("Học sinh", "Élève", "Student")], ["phu_huynh", tr("Phụ huynh", "Parent", "Parent")], ["giao_vien", tr("Giáo viên", "Enseignant", "Teacher")]];
const MUC_TIEU = [["A2", "DELF A2"], ["B1", "DELF B1"], ["B2", "DELF B2"], ["C1", "DALF C1"]];

const O = "w-full rounded-xl border border-solid border-line bg-bg px-3.5 py-2.5 font-sans text-sm text-ink "
  + "placeholder:text-soft outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const NHAN = "mb-1.5 block text-xs font-bold text-ink";

const TRONG = { hoTen: "", sdt: "", namSinh: "", email: "", vai: "hoc_sinh", mucTieu: "", noiDung: "" };

export default function ContactDrawer({ isOpen, onClose }) {
  const [f, setF] = useState(TRONG);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState(false);
  const dauTien = useRef(null);
  const dat = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => dauTien.current?.focus(), 250);
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); };
  }, [isOpen, onClose]);

  const dong = () => {
    onClose();
    if (xong) setTimeout(() => { setF(TRONG); setXong(false); }, 300);
  };

  const gui = async (e) => {
    e.preventDefault();
    setLoi("");
    const nam = Number(f.namSinh);
    if (!/^\d{4}$/.test(f.namSinh) || nam < 1920 || nam > new Date().getFullYear()) {
      setLoi(tr("Năm sinh cần là 4 chữ số, ví dụ 2008.", "L'année de naissance doit comporter 4 chiffres, ex. 2008.", "Birth year must be 4 digits, e.g. 2008.")); return;
    }
    if (!/^\d{8,11}$/.test(f.sdt.replace(/[\s.-]/g, ""))) {
      setLoi(tr("Số điện thoại chưa đúng — nhập 9–10 chữ số, có thể bỏ số 0 đầu.", "Numéro invalide : 9 à 10 chiffres.", "Invalid phone number: 9 to 10 digits.")); return;
    }
    setDangGui(true);
    const kq = await guiLienHe({
      hoTen: f.hoTen,
      email: f.email,
      dienThoai: "+84 " + f.sdt.replace(/[\s.-]/g, "").replace(/^0/, ""),
      vai: f.vai,
      mucTieu: f.mucTieu,
      noiDung: tr(`Năm sinh: ${f.namSinh}`, `Année de naissance : ${f.namSinh}`, `Birth year: ${f.namSinh}`) + (f.noiDung.trim() ? `\n\n${f.noiDung.trim()}` : ""),
      nguon: "gioi-thieu",
    });
    setDangGui(false);
    if (kq.ok) { setXong(true); return; }
    setLoi(kq.loi === "qua_nhieu"
      ? tr("Email này đã gửi 3 câu hỏi trong hôm nay. FRACILE sẽ trả lời các câu đã gửi — mai bạn gửi tiếp được.", "Cet e-mail a déjà envoyé 3 questions aujourd'hui. Réessayez demain.", "This email has already sent 3 questions today. Try again tomorrow.")
      : kq.loi === "thieu_hoac_sai"
        ? tr("Tên hoặc email chưa hợp lệ — kiểm tra lại giúp FRACILE nhé.", "Nom ou e-mail invalide, vérifiez-les.", "Invalid name or email, please check.")
        : tr("Không gửi được vì lỗi mạng. Kiểm tra kết nối rồi bấm gửi lại.", "Erreur réseau. Vérifiez la connexion et réessayez.", "Network error. Check your connection and try again."));
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div onClick={dong}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${isOpen ? "opacity-100" : "opacity-0"}`} />

      <aside role="dialog" aria-modal="true" aria-labelledby="tieu-de-hoi"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-solid border-line bg-surface shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        <div className="flex items-start justify-between gap-4 border-b border-solid border-line px-6 py-5">
          <div>
            <h2 id="tieu-de-hoi" className="m-0 text-xl font-extrabold text-ink">{tr("Gửi câu hỏi", "Poser une question", "Ask a question")}</h2>
            <p className="m-0 mt-1 text-sm text-soft">{tr("FRACILE trả lời qua email hoặc điện thoại bạn để lại.", "FRACILE répond par e-mail ou téléphone.", "FRACILE replies by email or phone.")}</p>
          </div>
          <button type="button" onClick={dong} aria-label={tr("Đóng", "Fermer", "Close")}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft transition-colors hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {xong ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <CheckCircle2 size={44} className="text-ok" />
            <p className="m-0 text-lg font-bold text-ink">{tr("Đã nhận câu hỏi của bạn", "Question reçue", "Question received")}</p>
            <p className="m-0 text-sm leading-relaxed text-soft">
              {tr("FRACILE sẽ liên hệ lại qua", "FRACILE vous recontactera par", "FRACILE will get back to you at")} <b className="text-ink">{f.email}</b>.
            </p>
            <button type="button" onClick={dong}
              className="mt-2 cursor-pointer rounded-full border-0 bg-primary px-6 py-2.5 font-sans text-sm font-bold text-white">
              {tr("Đóng", "Fermer", "Close")}
            </button>
          </div>
        ) : (
          <form onSubmit={gui} className="flex flex-1 flex-col overflow-y-auto">
            <div className="grid gap-4 px-6 py-5">
              <div>
                <label className={NHAN} htmlFor="lh-ten">{tr("Họ và tên *", "Nom et prénom *", "Full name *")}</label>
                <input id="lh-ten" ref={dauTien} required className={O} value={f.hoTen} onChange={dat("hoTen")} placeholder={tr("Nguyễn Văn A", "Jean Dupont", "Jane Smith")} autoComplete="name" />
              </div>

              <div>
                <label className={NHAN} htmlFor="lh-sdt">{tr("Số điện thoại *", "Téléphone *", "Phone *")}</label>
                <div className="flex gap-2">
                  <select aria-label={tr("Mã quốc gia", "Indicatif pays", "Country code")} className={`${O.replace("w-full ", "")} w-24 shrink-0`} defaultValue="+84">
                    <option value="+84">+84</option>
                  </select>
                  <input id="lh-sdt" required inputMode="tel" className={`${O} min-w-0`} value={f.sdt} onChange={dat("sdt")} placeholder="912 345 678" autoComplete="tel-national" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={NHAN} htmlFor="lh-nam">{tr("Năm sinh *", "Année de naissance *", "Birth year *")}</label>
                  <input id="lh-nam" required inputMode="numeric" maxLength={4} className={O} value={f.namSinh} onChange={dat("namSinh")} placeholder="2008" />
                </div>
                <div>
                  <label className={NHAN} htmlFor="lh-email">Email *</label>
                  <input id="lh-email" required type="email" className={O} value={f.email} onChange={dat("email")} placeholder="ban@email.com" autoComplete="email" />
                </div>
              </div>

              <div>
                <label className={NHAN} htmlFor="lh-vai">{tr("Bạn là", "Vous êtes", "You are")}</label>
                <select id="lh-vai" className={O} value={f.vai} onChange={dat("vai")}>
                  {VAI().map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={NHAN} htmlFor="lh-muc">{tr("Khóa học / Mục tiêu quan tâm *", "Cours / objectif *", "Course / goal *")}</label>
                <select id="lh-muc" required className={O} value={f.mucTieu} onChange={dat("mucTieu")}>
                  <option value="" disabled>{tr("Chọn mục tiêu", "Choisir un objectif", "Choose a goal")}</option>
                  {MUC_TIEU.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className={NHAN} htmlFor="lh-nd">{tr("Nội dung", "Message", "Message")}</label>
                <textarea id="lh-nd" rows={4} maxLength={1900} className={`${O} resize-y`} value={f.noiDung} onChange={dat("noiDung")}
                  placeholder={tr("Bạn có câu hỏi gì? Hãy cho FRACILE biết trình độ hiện tại và mục tiêu mong muốn.", "Votre question ? Indiquez votre niveau actuel et votre objectif.", "What's your question? Tell us your current level and goal.")} />
              </div>

              <p className="m-0 text-xs leading-relaxed text-soft">
                {tr("Bằng việc gửi câu hỏi, bạn đã đồng ý với", "En envoyant, vous acceptez la", "By sending, you agree to the")}{" "}
                <a href="/bao-mat" target="_blank" rel="noreferrer" className="text-primary underline">{tr("Chính sách bảo mật", "politique de confidentialité", "privacy policy")}</a>{" "}
                {tr("thông tin của FRACILE.", "de FRACILE.", "of FRACILE.")}
              </p>

              {loi && <p role="alert" className="m-0 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{loi}</p>}
            </div>

            <div className="mt-auto border-t border-solid border-line px-6 py-4">
              <button type="submit" disabled={dangGui}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-primary px-5 py-3 font-sans text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                {dangGui ? tr("Đang gửi…", "Envoi…", "Sending…") : <>{tr("Gửi câu hỏi", "Poser une question", "Ask a question")} <Send size={16} /></>}
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
