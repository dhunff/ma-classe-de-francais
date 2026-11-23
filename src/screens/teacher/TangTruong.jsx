import React, { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, Loader2, Info, Target, CircleAlert } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { nhanHoSo } from "../../shared/nhanHoSo.js";

/* « Tăng trưởng » (23/11, theo chủ dự án, migration 239).
 *
 * Bước 1 của phân tích thị trường trước khi khai trương: đọc số liệu THẬT của chính FRACILE. Mọi
 * con số đến từ RPC thong_ke_tang_truong() (chỉ giáo viên gọi được, chỉ trả số đếm, không trả tên
 * hay email ai). Không có số ước lượng: thứ chưa đo được thì nói thẳng ở khối cuối trang.
 *
 * Nhóm mũi nhọn chủ dự án chọn 23/11: người làm hồ sơ định cư Canada và người đi du học Pháp;
 * học sinh song ngữ, chuyên Pháp, sinh viên ngành Pháp là nhóm phụ. Nhóm của mỗi học sinh là SUY
 * ĐOÁN từ mục tiêu hồ sơ + bài đã làm (định nghĩa ở đầu migration 239), trang này in lại định nghĩa.
 * `thu`: dữ liệu dựng sẵn cho /preview.html. */

const NHOM = () => ({
  canada: { ten: tr("Định cư Canada", "Immigration au Canada", "Immigrating to Canada"), vai: "chinh",
    dinhNghia: tr("Mục tiêu « TCF Canada » hoặc đã làm bài, đề TCF Canada.", "Objectif « TCF Canada » ou a fait un exercice / examen TCF Canada.", "Goal “TCF Canada” or has done TCF Canada work.") },
  du_hoc: { ten: tr("Du học Pháp", "Études en France", "Studying in France"), vai: "chinh",
    dinhNghia: tr("Mục tiêu du học Pháp, TCF tout public, DELF B2, DALF C1 hoặc C2, hoặc đã làm TCF Pháp.", "Objectif études en France, TCF tout public, DELF B2, DALF C1/C2, ou a fait le TCF tout public.", "Goal study in France, TCF tout public, DELF B2, DALF C1/C2, or has done TCF tout public.") },
  hoc_duong: { ten: tr("Học sinh, sinh viên", "Lycéens, étudiants", "School & university"), vai: "phu",
    dinhNghia: tr("Mục tiêu DELF A1 đến B1 (lớp song ngữ, chuyên Pháp, sinh viên ngành Pháp).", "Objectif DELF A1 à B1 (classes bilingues, spécialisées, filière française).", "Goal DELF A1 to B1 (bilingual classes, French majors).") },
  khac: { ten: tr("Mục tiêu khác", "Autres objectifs", "Other goals"), vai: "",
    dinhNghia: tr("Đi làm, du lịch, giao tiếp, sở thích.", "Travail, voyage, communication, loisir.", "Work, travel, conversation, hobby.") },
  chua_ro: { ten: tr("Chưa rõ", "Inconnu", "Unknown"), vai: "",
    dinhNghia: tr("Chưa khai mục tiêu và chưa làm bài TCF nào.", "Pas d'objectif renseigné ni de TCF effectué.", "No goal set and no TCF work yet.") },
});
const THU_TU = ["canada", "du_hoc", "hoc_duong", "khac", "chua_ro"];
const HO = () => ({ delf: "DELF · DALF", tcf_ca: "TCF Canada", tcf_tp: tr("TCF Pháp", "TCF tout public", "TCF tout public") });

const vnd = (n) => `${Number(n || 0).toLocaleString("vi-VN")} đ`;
const tiLe = (a, b) => (b ? `${Math.round((a / b) * 100)} %` : "–");
const ngayNgan = (s) => { const [, m, d] = String(s).split("-"); return `${Number(d)}/${Number(m)}`; };

function O({ nhan, so, phu, mau = "text-ink" }) {
  return (
    <div className="rounded-2xl border border-solid border-line bg-surface p-4">
      <p className="m-0 text-xs font-bold text-soft">{nhan}</p>
      <p className={`m-0 mt-1 whitespace-nowrap text-2xl font-extrabold tabular-nums ${mau}`}>{so}</p>
      {phu && <p className="m-0 mt-1 text-xs text-soft">{phu}</p>}
    </div>
  );
}

function Khoi({ tieuDe, moTa, children }) {
  return (
    <section className="mt-6 rounded-2xl border border-solid border-line bg-surface p-5">
      <h2 className="m-0 text-base font-extrabold text-ink">{tieuDe}</h2>
      {moTa && <p className="m-0 mt-1 text-xs text-soft">{moTa}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DanhSachThanh({ ds, nhan }) {
  const max = Math.max(1, ...ds.map((x) => x.n));
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {ds.map((x) => (
        <li key={x.k || "_"} className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3 text-sm">
          <span className={`truncate ${x.k ? "text-ink" : "italic text-soft"}`}>{x.k ? nhan(x.k) : tr("Chưa khai", "Non renseigné", "Not set")}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-bg"><span className={`block h-full rounded-full ${x.k ? "bg-primary" : "bg-line-strong"}`} style={{ width: `${(x.n / max) * 100}%` }} /></span>
          <span className="text-right font-bold tabular-nums text-ink">{x.n}</span>
        </li>
      ))}
    </ul>
  );
}

const TRUC = { fontSize: 11, fill: "rgb(var(--mcf-soft-rgb))" };
const GOI_Y = { contentStyle: { background: "rgb(var(--mcf-surface-rgb))", border: "1px solid rgb(var(--mcf-line-rgb))", borderRadius: 12, fontSize: 12, color: "rgb(var(--mcf-ink-rgb))" } };

export default function TangTruong({ thu }) {
  const [d, setD] = useState(thu ?? null);
  const [loi, setLoi] = useState("");
  const [dang, setDang] = useState(!thu);
  const [luc, setLuc] = useState(thu ? new Date() : null);

  const tai = async () => {
    if (thu) return;
    setDang(true); setLoi("");
    const { data, error } = await supabase.rpc("thong_ke_tang_truong");
    setDang(false);
    if (error) {
      setLoi(/thong_ke_tang_truong|PGRST202|does not exist/.test(error.message)
        ? tr("Chưa có hàm thống kê trên database. Chạy migration 239 (npx supabase db push --remote) rồi tải lại.", "La fonction de statistiques manque. Exécutez la migration 239 puis rechargez.", "The stats function is missing. Run migration 239, then reload.")
        : error.message);
      return;
    }
    setD(data); setLuc(new Date());
  };
  useEffect(() => { tai(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const nhom = NHOM();
  const t = d?.tong;
  const ho = HO();
  const nhomTheo = new Map((d?.nhom ?? []).map((x) => [x.nhom, x]));
  const noiDung = Object.keys(ho).map((k) => {
    const r = (d?.noi_dung_30 ?? []).filter((x) => x.ho === k);
    const lay = (m) => r.find((x) => x.mode === m) ?? { luot: 0, nguoi: 0 };
    return { k, thi: lay("exam"), luyen: lay("practice") };
  });
  const chuaKhai = (d?.muc_tieu ?? []).find((x) => !x.k)?.n ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><TrendingUp size={22} className="text-primary" /> {tr("Tăng trưởng", "Croissance", "Growth")}</h1>
          <p className="m-0 mt-1 max-w-2xl text-sm text-soft">{tr("Số liệu thật của FRACILE: ai đến, ai ở lại, ai trả tiền, họ học gì. Chỉ có số đếm, không hiện tên hay email học sinh.", "Chiffres réels de FRACILE : qui arrive, qui reste, qui paie, ce qu'ils étudient. Uniquement des comptages, sans nom ni e-mail.", "FRACILE's real numbers: who arrives, who stays, who pays, what they study. Counts only, no names or emails.")}</p>
        </div>
        <button type="button" onClick={tai} disabled={dang}
          className="flex items-center gap-2 rounded-xl border-0 bg-primary-soft px-3 py-2 text-sm font-bold text-primary disabled:opacity-60">
          {dang ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} {tr("Tải lại", "Actualiser", "Refresh")}
        </button>
      </div>
      {luc && <p className="m-0 mt-2 text-xs text-soft">{tr("Cập nhật lúc", "Mis à jour à", "Updated at")} {luc.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · {tr("tính từ", "depuis le", "since")} {d?.tong?.dau_tien ? ngayNgan(d.tong.dau_tien) + "/" + String(d.tong.dau_tien).slice(0, 4) : "–"}</p>}

      {loi && <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><CircleAlert size={16} className="mt-0.5 shrink-0" /> {loi}</p>}
      {!d && !loi && <p className="m-0 mt-8 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="animate-spin" /> {tr("Đang tính…", "Calcul…", "Computing…")}</p>}

      {d && t && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
            <O nhan={tr("Học sinh", "Élèves", "Students")} so={t.hoc_sinh} phu={tr(`+${t.moi_30} trong 30 ngày`, `+${t.moi_30} en 30 jours`, `+${t.moi_30} in 30 days`)} />
            <O nhan={tr("Học trong 7 ngày", "Actifs 7 jours", "Active 7 days")} so={t.hd7} phu={tiLe(t.hd7, t.hoc_sinh)} />
            <O nhan={tr("Học trong 30 ngày", "Actifs 30 jours", "Active 30 days")} so={t.hd30} phu={tiLe(t.hd30, t.hoc_sinh)} />
            <O nhan={tr("Quay lại tuần 2", "Reviennent sem. 2", "Back in week 2")} so={tiLe(t.giu7, t.du7)} phu={tr(`${t.giu7} trên ${t.du7} người`, `${t.giu7} sur ${t.du7}`, `${t.giu7} of ${t.du7}`)} mau={t.du7 && t.giu7 / t.du7 < 0.2 ? "text-danger" : "text-ink"} />
            <O nhan={tr("Đã trả tiền VIP", "Ont payé le VIP", "Paid for VIP")} so={t.da_tra} phu={tr(`${t.vip} VIP còn hạn`, `${t.vip} VIP actifs`, `${t.vip} active VIP`)} />
            <O nhan={tr("Doanh thu", "Chiffre d'affaires", "Revenue")} so={vnd((d.doanh_thu?.vip ?? 0) + (d.doanh_thu?.bai ?? 0))} phu={tr(`30 ngày: ${vnd(d.doanh_thu?.vip_30)} VIP`, `30 jours : ${vnd(d.doanh_thu?.vip_30)} VIP`, `30 days: ${vnd(d.doanh_thu?.vip_30)} VIP`)} />
          </div>

          <Khoi tieuDe={tr("Nhóm người học", "Profils d'apprenants", "Learner segments")}
            moTa={tr("Nhóm là suy đoán từ mục tiêu trong hồ sơ và bài đã làm, không phải học sinh tự chọn. Định nghĩa ở dòng nhỏ dưới tên nhóm.", "Profil déduit de l'objectif du profil et des exercices faits, pas choisi par l'élève.", "Segment inferred from profile goal and work done, not self-selected.")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs text-soft">
                    <th className="pb-2 pr-3 font-bold">{tr("Nhóm", "Profil", "Segment")}</th>
                    {[tr("Số người", "Élèves", "Students"), tr("Học 30 ngày", "Actifs 30 j", "Active 30d"), tr("Quay lại tuần 2", "Retour sem. 2", "Back wk 2"), tr("Đã trả tiền", "Payants", "Paid"), tr("VIP còn hạn", "VIP actifs", "Active VIP")].map((h) => <th key={h} className="pb-2 pr-3 text-right font-bold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {THU_TU.map((k) => {
                    const x = nhomTheo.get(k) ?? { n: 0, hd30: 0, du7: 0, giu7: 0, da_tra: 0, vip: 0 };
                    const m = nhom[k];
                    return (
                      <tr key={k} className="border-0 border-t border-solid border-line align-top">
                        <td className="py-3 pr-3">
                          <span className="flex flex-wrap items-center gap-2 font-bold text-ink">{m.ten}
                            {m.vai === "chinh" && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">{tr("Mũi nhọn", "Prioritaire", "Priority")}</span>}
                            {m.vai === "phu" && <span className="rounded-full bg-bg px-2 py-0.5 text-[11px] font-bold text-soft">{tr("Phụ", "Secondaire", "Secondary")}</span>}
                          </span>
                          <span className="mt-0.5 block text-xs text-soft">{m.dinhNghia}</span>
                        </td>
                        <td className="py-3 pr-3 text-right font-extrabold tabular-nums text-ink">{x.n}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink">{x.hd30}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink">{x.du7 ? `${x.giu7}/${x.du7}` : "–"}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink">{x.da_tra}</td>
                        <td className="py-3 pr-3 text-right tabular-nums text-ink">{x.vip}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Khoi>

          <div className="grid gap-x-6 lg:grid-cols-2">
            <Khoi tieuDe={tr("Đăng ký mới mỗi tuần", "Inscriptions par semaine", "Sign-ups per week")} moTa={tr("12 tuần gần nhất, tuần tính từ thứ Hai.", "12 dernières semaines, à partir du lundi.", "Last 12 weeks, starting Monday.")}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(d.dang_ky_tuan ?? []).map((x) => ({ ...x, nhan: ngayNgan(x.tuan) }))} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgb(var(--mcf-line-rgb))" />
                    <XAxis dataKey="nhan" tick={TRUC} tickLine={false} axisLine={false} interval={1} />
                    <YAxis allowDecimals={false} tick={TRUC} tickLine={false} axisLine={false} />
                    <Tooltip {...GOI_Y} cursor={{ fill: "rgb(var(--mcf-primarysoft-rgb))" }} formatter={(v) => [v, tr("học sinh", "élèves", "students")]} labelFormatter={(l) => tr(`Tuần từ ${l}`, `Semaine du ${l}`, `Week of ${l}`)} />
                    <Bar dataKey="n" fill="rgb(var(--mcf-primary-rgb))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Khoi>
            <Khoi tieuDe={tr("Người học mỗi ngày", "Apprenants actifs par jour", "Daily active learners")} moTa={tr("30 ngày gần nhất: số học sinh có nộp bài hoặc có hoạt động học trong ngày.", "30 derniers jours : élèves ayant rendu un exercice ou étudié ce jour-là.", "Last 30 days: students who submitted work or studied that day.")}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(d.hoat_dong_ngay ?? []).map((x) => ({ ...x, nhan: ngayNgan(x.ngay) }))} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="rgb(var(--mcf-line-rgb))" />
                    <XAxis dataKey="nhan" tick={TRUC} tickLine={false} axisLine={false} interval={4} />
                    <YAxis allowDecimals={false} tick={TRUC} tickLine={false} axisLine={false} />
                    <Tooltip {...GOI_Y} formatter={(v) => [v, tr("học sinh", "élèves", "students")]} />
                    <Area type="monotone" dataKey="n" stroke="rgb(var(--mcf-primary-rgb))" strokeWidth={2} fill="rgb(var(--mcf-primary-rgb) / 0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Khoi>
          </div>

          <Khoi tieuDe={tr("Học sinh đang dùng gì (30 ngày)", "Ce qu'ils utilisent (30 jours)", "What they use (30 days)")} moTa={tr("Lượt nộp bài theo kỳ thi; trong ngoặc là số người khác nhau.", "Rendus par examen ; entre parenthèses, nombre d'élèves distincts.", "Submissions by exam; distinct students in brackets.")}>
            <div className="grid gap-3 sm:grid-cols-3">
              {noiDung.map((x) => (
                <div key={x.k} className="rounded-xl bg-bg p-3">
                  <p className="m-0 text-sm font-extrabold text-ink">{ho[x.k]}</p>
                  <p className="m-0 mt-2 flex justify-between text-sm text-soft">{tr("Thi thử", "Examens blancs", "Mock exams")}<span className="font-bold tabular-nums text-ink">{x.thi.luot} ({x.thi.nguoi})</span></p>
                  <p className="m-0 mt-1 flex justify-between text-sm text-soft">{tr("Luyện tập", "Entraînement", "Practice")}<span className="font-bold tabular-nums text-ink">{x.luyen.luot} ({x.luyen.nguoi})</span></p>
                </div>
              ))}
            </div>
            <p className="m-0 mt-3 text-xs text-soft">{tr(
              `AI: ${d.ai_30?.hoi_leon ?? 0} câu hỏi Léon từ ${d.ai_30?.hoi_leon_nguoi ?? 0} người, ${d.ai_30?.cham_viet ?? 0} lượt AI chấm bài viết.`,
              `IA : ${d.ai_30?.hoi_leon ?? 0} questions à Léon (${d.ai_30?.hoi_leon_nguoi ?? 0} élèves), ${d.ai_30?.cham_viet ?? 0} corrections IA de rédaction.`,
              `AI: ${d.ai_30?.hoi_leon ?? 0} questions to Léon from ${d.ai_30?.hoi_leon_nguoi ?? 0} students, ${d.ai_30?.cham_viet ?? 0} AI writing reviews.`)}</p>
          </Khoi>

          <div className="grid gap-x-6 lg:grid-cols-2">
            <Khoi tieuDe={tr("Mục tiêu trong hồ sơ", "Objectifs déclarés", "Stated goals")}>
              <DanhSachThanh ds={d.muc_tieu ?? []} nhan={nhanHoSo} />
            </Khoi>
            <Khoi tieuDe={tr("Trình độ tự khai", "Niveau déclaré", "Stated level")}>
              <DanhSachThanh ds={d.trinh_do ?? []} nhan={nhanHoSo} />
            </Khoi>
          </div>

          <Khoi tieuDe={<span className="flex items-center gap-2"><Info size={16} className="text-primary" /> {tr("Chưa đo được", "Pas encore mesuré", "Not measured yet")}</span>}>
            <ul className="m-0 grid gap-2 pl-5 text-sm text-ink">
              <li>{tr("Học sinh biết FRACILE từ đâu (Facebook, TikTok, bạn bè, Google): website chưa ghi nguồn truy cập lúc đăng ký.", "D'où viennent les élèves (Facebook, TikTok, bouche-à-oreille, Google) : la source n'est pas enregistrée à l'inscription.", "Where students come from (Facebook, TikTok, friends, Google): sign-up source isn't recorded.")}</li>
              <li>{tr(`${chuaKhai} trên ${t.hoc_sinh} học sinh chưa khai mục tiêu, nên nhóm « Chưa rõ » còn lớn. Hỏi mục tiêu ngay lúc đăng ký sẽ chia nhóm chính xác hơn.`, `${chuaKhai} élèves sur ${t.hoc_sinh} n'ont pas d'objectif : le profil « Inconnu » reste important.`, `${chuaKhai} of ${t.hoc_sinh} students have no goal, so “Unknown” stays large.`)}</li>
              <li>{tr("Người xem trang giới thiệu mà không đăng ký: chưa có công cụ đếm lượt truy cập.", "Visiteurs de la page d'accueil qui ne s'inscrivent pas : aucun compteur de visites.", "Landing-page visitors who don't sign up: no visit counter yet.")}</li>
            </ul>
          </Khoi>

          <p className="m-0 mt-4 flex items-start gap-2 text-xs text-soft"><Target size={14} className="mt-0.5 shrink-0" />{tr(
            "Doanh thu gồm giao dịch VIP có tiền (VIP giáo viên cấp không tính) và bài mua lẻ. Học sinh là mọi tài khoản vai học sinh, kể cả tài khoản thử nếu có. Một ngày « có học » là ngày nộp ít nhất một bài hoặc có hoạt động học, theo giờ Việt Nam.",
            "Le chiffre d'affaires comprend les VIP payés (pas ceux offerts par l'enseignant) et les exercices achetés. Tous les comptes élèves sont comptés, y compris d'éventuels comptes de test.",
            "Revenue counts paid VIP (not teacher-granted) and single-exercise purchases. All student accounts are counted, including any test accounts.")}</p>
        </>
      )}
    </div>
  );
}
