import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { loadHoSo, luuHoSo } from "./profileStore.js";
import { emptyProfile, validateProfile, LEVELS_PROFILE, GOALS_PROFILE } from "./profile.js";
import { Leon } from "./leon.jsx";
import { tr } from "./i18n.jsx";
import { supabase } from "../storageShim.js";
import ChonNgay from "./ChonNgay.jsx";
import { hoSoBatDauXet, hoSoKetQua } from "./hoSoCho.js";

/* Hoàn thiện hồ sơ ngay khi vào (13/10, theo chủ dự án).
 *
 * Học sinh vừa lập tài khoản (hoặc hồ sơ còn thiếu) gặp một hộp điền thông tin
 * trước khi học. BẮT BUỘC: họ, tên, trình độ, mục tiêu (giáo viên cần để xếp
 * lớp và gợi ý bài). Các ô khác tuỳ chọn. Ghi qua đúng đường của trang Tài
 * khoản (`luuHoSo` → RPC update_my_profile), không có đường ghi thứ hai.
 *
 * « Để sau » chỉ ẩn trong PHIÊN này (sessionStorage): lần mở app sau hộp lại
 * hiện cho tới khi điền đủ. Không hiện giữa giờ thi (/etudiant/examen). */
const BAT_BUOC = ["prenom", "nom", "level", "goal"];
const KHOA_HOAN = "mcf-hoan-ho-so";
/* Tài khoản tạo từ thời điểm này (giờ VN, ngày ra mắt hộp hoàn thiện hồ sơ) mới bị hỏi. */
const MOC_TAI_KHOAN_MOI = Date.parse("2026-10-13T00:00:00+07:00");

export default function HoanThienHoSo({ fixture }) {
  const viTri = useLocation();
  const [p, setP] = useState(null);
  const [mo, setMo] = useState(false);
  const [loi, setLoi] = useState({});
  const [tt, setTt] = useState(null);

  useEffect(() => {
    if (fixture) { setP({ ...emptyProfile(), ...fixture }); setMo(true); hoSoKetQua(true); return; }
    let con = true;
    try { if (sessionStorage.getItem(KHOA_HOAN)) { hoSoKetQua(false); return; } } catch { /* */ }
    /* Báo « đang xét » để phần hướng dẫn chờ (hoSoCho.js), tránh hai hộp đè nhau. */
    hoSoBatDauXet();
    /* 13/10 (chủ dự án): CHỈ hỏi tài khoản đăng ký từ ngày tính năng ra mắt.
       Học sinh cũ không bị chặn bằng hộp này; họ vẫn tự điền ở trang Tài khoản. */
    Promise.all([supabase.auth.getUser(), loadHoSo()]).then(([{ data: u }, h]) => {
      if (!con) return;
      if (!h || !(Date.parse(u?.user?.created_at ?? "") >= MOC_TAI_KHOAN_MOI)) { hoSoKetQua(false); return; }
      setP({ ...emptyProfile(), ...h });
      const canHoi = BAT_BUOC.some((k) => !String(h[k] ?? "").trim());
      if (canHoi) setMo(true);
      hoSoKetQua(canHoi);
    }, () => { if (con) hoSoKetQua(false); });
    return () => { con = false; hoSoKetQua(false); };
  }, [fixture]);

  if (!mo || !p || viTri.pathname.startsWith("/etudiant/examen")) return null;

  const doi = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const thieu = BAT_BUOC.filter((k) => !String(p[k] ?? "").trim());

  const luu = async () => {
    const e = validateProfile(p);
    for (const k of thieu) e[k] = tr("Bắt buộc", "Obligatoire", "Required");
    setLoi(e);
    if (Object.keys(e).length) return;
    setTt("dang");
    const kq = await luuHoSo(p);
    if (!kq.ok) { setTt(kq.chiTiet || kq.loi || "loi"); return; }
    setTt("xong");
    setTimeout(() => { setMo(false); hoSoKetQua(false); }, 900);
  };
  const deSau = () => { try { sessionStorage.setItem(KHOA_HOAN, "1"); } catch { /* */ } setMo(false); hoSoKetQua(false); };

  const O = "w-full rounded-xl border border-solid border-line bg-surface px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-primary";
  const Nhan = ({ k, children, bb }) => (
    <label className="grid gap-1">
      <span className="text-xs font-bold text-ink">{children}{bb && <span className="text-danger"> *</span>}</span>
      {loi[k] && <span className="text-[11px] font-semibold text-danger">{loi[k]}</span>}
    </label>
  );

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[400] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="mcf-cau-vao w-full max-w-xl rounded-3xl bg-surface p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <Leon cam="chao" size={84} className="shrink-0" />
          <div>
            <h2 className="m-0 text-xl font-extrabold text-ink">{tr("Chào mừng bạn! Hoàn thiện hồ sơ nhé", "Bienvenue ! Complétez votre profil", "Welcome! Complete your profile")}</h2>
            <p className="m-0 mt-1 text-sm text-soft">{tr("Giáo viên dùng thông tin này để xếp trình độ và gợi ý bài phù hợp. Ô có dấu * là bắt buộc.", "Votre professeur s'en sert pour situer votre niveau et vous proposer des exercices. * = obligatoire.", "Your teacher uses this to place your level and suggest exercises. * = required.")}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1"><Nhan k="nom" bb>{tr("Họ", "Nom", "Last name")}</Nhan>
            <input data-khong-bang-dau value={p.nom} onChange={(e) => doi("nom", e.target.value)} className={O} autoComplete="family-name" /></div>
          <div className="grid gap-1"><Nhan k="prenom" bb>{tr("Tên", "Prénom", "First name")}</Nhan>
            <input data-khong-bang-dau value={p.prenom} onChange={(e) => doi("prenom", e.target.value)} className={O} autoComplete="given-name" /></div>
          <div className="grid gap-1"><Nhan k="level" bb>{tr("Trình độ hiện tại", "Niveau actuel", "Current level")}</Nhan>
            <select value={p.level} onChange={(e) => doi("level", e.target.value)} className={O}>
              <option value="">{tr("Chọn trình độ", "Choisir", "Choose")}</option>
              {LEVELS_PROFILE.map((l) => <option key={l} value={l}>{l}</option>)}
            </select></div>
          <div className="grid gap-1"><Nhan k="goal" bb>{tr("Mục tiêu", "Objectif", "Goal")}</Nhan>
            <select value={p.goal} onChange={(e) => doi("goal", e.target.value)} className={O}>
              <option value="">{tr("Chọn mục tiêu", "Choisir", "Choose")}</option>
              {GOALS_PROFILE.map((g) => <option key={g} value={g}>{g}</option>)}
            </select></div>
          <div className="grid gap-1"><Nhan k="dob">{tr("Ngày sinh", "Date de naissance", "Date of birth")}</Nhan>
            {/* Bộ chọn ngày của dự án (cùng kiểu thẻ Lịch, chọn được năm) thay hộp mặc định của trình duyệt. */}
            <ChonNgay value={p.dob || ""} onChange={(v) => doi("dob", v)} className={O} max={new Date().toISOString().slice(0, 10)} macDinh={`${new Date().getFullYear() - 16}-01-01`} /></div>
          <div className="grid gap-1"><Nhan k="phone">{tr("Số điện thoại", "Téléphone", "Phone")}</Nhan>
            <input data-khong-bang-dau type="tel" value={p.phone} onChange={(e) => doi("phone", e.target.value)} className={O} autoComplete="tel" /></div>
          <div className="grid gap-1 sm:col-span-2"><Nhan k="school">{tr("Trường / nơi làm việc", "École / travail", "School / workplace")}</Nhan>
            <input data-khong-bang-dau value={p.school} onChange={(e) => doi("school", e.target.value)} className={O} maxLength={120} /></div>
          <div className="grid gap-1 sm:col-span-2">
            <span className="text-xs font-bold text-ink">{tr("Giới tính", "Genre", "Gender")}</span>
            <div className="flex flex-wrap gap-4">
              {[["homme", tr("Nam", "Homme", "Male")], ["femme", tr("Nữ", "Femme", "Female")], ["autre", tr("Khác", "Autre", "Other")]].map(([v, l]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input type="radio" name="hs-genre" checked={p.genre === v} onChange={() => doi("genre", v)} className="h-4 w-4 accent-[color:var(--mcf-primary)]" /> {l}
                </label>
              ))}
            </div>
          </div>
        </div>

        {typeof tt === "string" && !["dang", "xong"].includes(tt) && (
          <p className="m-0 mt-4 text-sm font-bold text-danger">{tr("Không lưu được", "Échec de l'enregistrement", "Couldn't save")}: {tt}</p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button type="button" onClick={deSau} className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-2 font-sans text-sm font-bold text-soft hover:text-ink">
            {tr("Để sau", "Plus tard", "Later")}
          </button>
          <button type="button" onClick={luu} disabled={tt === "dang" || tt === "xong"}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 font-sans text-sm font-extrabold text-white disabled:opacity-60">
            {tt === "dang" ? <Loader2 size={16} className="animate-spin" /> : tt === "xong" ? <Check size={16} /> : null}
            {tt === "xong" ? tr("Đã lưu", "Enregistré", "Saved") : tr("Lưu và bắt đầu học", "Enregistrer et commencer", "Save and start")}
          </button>
        </div>
      </div>
    </div>
  );
}
