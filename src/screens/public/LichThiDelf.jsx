import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ExternalLink, Sparkles, Info } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { useSeo } from "../../shared/seo.js";
import { DOT_THI, LE_PHI, TRUNG_TAM, NGUON, DOI_CHIEU } from "../../content/lichThi.js";

/* Trang công khai « Lịch thi DELF » (18/10, việc G1 trong kế hoạch quảng bá).
 * Dữ liệu ở content/lichThi.js, chép nguyên văn từ ifv.vn. Đếm ngược tính theo
 * ngày của MÁY người xem (ngày địa phương), không theo giờ máy chủ. */
const LOAI = () => [
  ["tp", tr("DELF–DALF (từ 18 tuổi)", "DELF–DALF tout public", "DELF–DALF (adults)")],
  ["junior", tr("DELF Junior (12–18 tuổi)", "DELF Junior", "DELF Junior (12–18)")],
  ["prim", tr("DELF Prim (7–11 tuổi)", "DELF Prim", "DELF Prim (7–11)")],
];

const ngayVN = (s) => { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; };
const soNgay = (s, homNay) => Math.round((new Date(`${s}T00:00:00`) - homNay) / 86400000);
const tien = (n) => `${n.toLocaleString("vi-VN")} đ`;

function NhanConLai({ n }) {
  if (n < 0) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${n <= 7 ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary"}`}>
      {n === 0 ? tr("hôm nay", "aujourd'hui", "today") : tr(`còn ${n} ngày`, `J-${n}`, `${n} days left`)}
    </span>
  );
}

export default function LichThiDelf() {
  const [loai, setLoai] = useState("tp");
  const homNay = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  useSeo({
    tieuDe: tr("Lịch thi DELF, DALF 2026 tại Việt Nam: ngày thi, hạn đăng ký, lệ phí | FRACILE", "Calendrier DELF DALF 2026 au Vietnam | FRACILE", "DELF DALF 2026 exam dates in Vietnam | FRACILE"),
    moTa: tr("Lịch thi DELF A1, A2, B1, B2 và DALF C1, C2 năm 2026 tại Viện Pháp Hà Nội: ngày mở và đóng đăng ký, ngày thi từng cấp, lệ phí, các trung tâm thi trên cả nước. Kèm DELF Junior và DELF Prim.",
      "Dates des sessions DELF et DALF 2026 à l'Institut français de Hanoï : inscriptions, épreuves, tarifs, centres d'examen.",
      "DELF and DALF 2026 sessions at the French Institute in Hanoi: registration, exam dates, fees, test centres."),
    duongDan: "/lich-thi-delf",
    jsonLd: {
      "@context": "https://schema.org", "@type": "WebPage", name: "Lịch thi DELF, DALF tại Việt Nam", inLanguage: "vi",
      url: "https://www.fracile.vn/lich-thi-delf", isBasedOn: NGUON,
      publisher: { "@type": "Organization", name: "FRACILE", url: "https://www.fracile.vn" },
    },
  });

  const dsLoai = DOT_THI.filter((d) => d.loai === loai);
  const sapToi = dsLoai.filter((d) => Object.values(d.ngay).some((n) => soNgay(n, homNay) >= 0));
  const daQua = dsLoai.filter((d) => !sapToi.includes(d));
  const ke = sapToi[0];

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-5 sm:py-14">
        <Link to="/" className="text-sm font-bold text-primary no-underline">← FRACILE</Link>
        <h1 className="m-0 mt-4 text-3xl font-extrabold tracking-tight text-ink [text-wrap:balance]">
          {tr("Lịch thi DELF, DALF tại Việt Nam", "Calendrier du DELF et du DALF au Vietnam", "DELF and DALF exam calendar in Vietnam")}
        </h1>
        <p className="m-0 mt-3 max-w-2xl text-sm leading-relaxed text-soft">
          {tr("Ngày thi, hạn đăng ký và lệ phí theo bảng chính thức của Viện Pháp tại Hà Nội. Trung tâm khác có thể khác ngày và lệ phí: hãy hỏi trực tiếp trung tâm bạn định thi.",
            "Dates et tarifs officiels de l'Institut français de Hanoï. Les autres centres peuvent différer.",
            "Official dates and fees of the French Institute in Hanoi. Other centres may differ.")}
        </p>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist">
          {LOAI().map(([ma, ten]) => (
            <button key={ma} type="button" role="tab" aria-selected={loai === ma} onClick={() => setLoai(ma)}
              className={`cursor-pointer rounded-xl border-0 px-4 py-2 font-sans text-sm font-extrabold ${loai === ma ? "bg-primary text-white" : "bg-surface2 text-ink hover:bg-primary-soft"}`}>{ten}</button>
          ))}
        </div>

        {ke ? (
          <section className="mt-5 rounded-3xl border border-solid border-line bg-surface p-5">
            <p className="m-0 flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
              <CalendarDays size={14} /> {tr("Đợt gần nhất", "Prochaine session", "Next session")}: {tr("tháng", "", "")} {ke.thang}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface2 p-3">
                <p className="m-0 text-xs font-bold text-soft">{tr("Đăng ký", "Inscriptions", "Registration")}</p>
                <p className="m-0 mt-1 text-sm font-extrabold text-ink">{ngayVN(ke.mo)} → {ngayVN(ke.dong)}</p>
                <p className="m-0 mt-1 flex flex-wrap items-center gap-1.5 text-xs text-soft">
                  <Clock size={12} />
                  {soNgay(ke.mo, homNay) > 0 ? (soNgay(ke.mo, homNay) === 1 ? tr("mở đăng ký từ ngày mai", "ouverture demain", "opens tomorrow") : tr(`mở đăng ký sau ${soNgay(ke.mo, homNay)} ngày`, `ouverture dans ${soNgay(ke.mo, homNay)} jours`, `opens in ${soNgay(ke.mo, homNay)} days`))
                    : soNgay(ke.dong, homNay) >= 0 ? <>{tr("đang mở, hạn chót", "ouvertes, clôture", "open, closes")} <NhanConLai n={soNgay(ke.dong, homNay)} /></>
                    : tr("đã đóng (đăng ký muộn cần Phòng Khảo thí đồng ý)", "clôturées (inscription tardive sur accord)", "closed (late registration needs approval)")}
                </p>
              </div>
              <div className="rounded-2xl bg-surface2 p-3">
                <p className="m-0 text-xs font-bold text-soft">{tr("Ngày thi theo cấp", "Épreuves par niveau", "Exam date by level")}</p>
                <ul className="m-0 mt-1 list-none space-y-1 p-0">
                  {Object.entries(ke.ngay).map(([cap, n]) => (
                    <li key={cap} className="flex flex-wrap items-center gap-2 text-sm text-ink">
                      <span className="w-10 font-extrabold">{cap}</span><span className="tabular-nums">{ngayVN(n)}</span><NhanConLai n={soNgay(n, homNay)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : (
          <p className="m-0 mt-5 flex items-start gap-2 rounded-2xl bg-warn-soft p-4 text-sm text-warn">
            <Info size={16} className="mt-0.5 shrink-0" />
            {tr("Các đợt năm 2026 đã qua. Viện Pháp chưa công bố ngày thi năm 2027; trang sẽ cập nhật khi có lịch chính thức.", "Les sessions 2026 sont passées ; le calendrier 2027 n'est pas encore publié.", "2026 sessions are over; the 2027 calendar is not published yet.")}
          </p>
        )}

        <section className="mt-8">
          <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Lệ phí năm 2026 (Viện Pháp Hà Nội)", "Tarifs 2026 (IF Hanoï)", "2026 fees (IF Hanoi)")}</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border border-solid border-line">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-surface2 text-left text-xs text-soft">
                <th className="px-3 py-2">{tr("Cấp", "Niveau", "Level")}</th>
                <th className="px-3 py-2">{tr("Ngày thi trong năm", "Dates", "Dates")}</th>
                <th className="px-3 py-2 text-right">{tr("Lệ phí", "Tarif", "Fee")}</th>
                <th className="px-3 py-2 text-right">{tr("Đăng ký muộn", "Tardif", "Late")}</th>
              </tr></thead>
              <tbody>
                {Object.keys(dsLoai[0]?.ngay ?? {}).map((cap) => (
                  <tr key={cap} className="border-0 border-t border-solid border-line">
                    <td className="px-3 py-2 font-extrabold text-ink">{cap}</td>
                    <td className="px-3 py-2 text-xs text-soft">
                      {dsLoai.map((d) => d.ngay[cap]).filter(Boolean).map((n) => (
                        <span key={n} className={`mr-2 inline-block tabular-nums ${soNgay(n, homNay) < 0 ? "line-through opacity-60" : "font-bold text-ink"}`}>{ngayVN(n)}</span>
                      ))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink">{LE_PHI[cap] ? tien(LE_PHI[cap][0]) : "–"}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-soft">{LE_PHI[cap] ? tien(LE_PHI[cap][1]) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {daQua.length > 0 && <p className="m-0 mt-2 text-xs text-soft">{tr("Ngày gạch ngang là đợt đã qua.", "Dates barrées : sessions passées.", "Struck-through dates have passed.")}</p>}
        </section>

        {loai === "tp" && (
          <section className="mt-8">
            <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Các trung tâm thi DELF–DALF", "Centres d'examen", "Test centres")}</h2>
            <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2">
              {TRUNG_TAM.map(([tp, ten, dc, email, thang]) => (
                <li key={ten + tp} className="min-w-0 rounded-2xl border border-solid border-line bg-surface p-3 text-sm">
                  <p className="m-0 flex items-center gap-1.5 font-extrabold text-ink"><MapPin size={14} className="shrink-0 text-primary" />{tp} · {ten}</p>
                  <p className="m-0 mt-1 text-xs text-soft">{dc}</p>
                  <p className="m-0 mt-1 truncate text-xs text-soft">{email}</p>
                  <p className="m-0 mt-1 text-xs font-bold text-ink">{tr("Tháng thi", "Mois", "Months")}: {thang}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="m-0 mt-6 flex flex-wrap items-center gap-1.5 text-xs text-soft">
          {tr("Nguồn", "Source", "Source")}: <a href={NGUON} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-primary">ifv.vn <ExternalLink size={11} /></a>
          · {tr("đối chiếu ngày", "vérifié le", "checked on")} {DOI_CHIEU}. {tr("Luôn xác nhận lại với trung tâm trước khi nộp lệ phí.", "Confirmez toujours auprès du centre.", "Always confirm with the centre.")}
        </p>

        <div className="mt-10 grid gap-3 rounded-3xl border border-solid border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="m-0 text-base font-extrabold text-ink">{tr("Thi thử trước khi đóng lệ phí", "Faites un examen blanc avant de vous inscrire", "Take a mock exam before you pay")}</p>
            <p className="m-0 mt-1 text-sm text-soft">{tr("Đề DELF A1 đến DALF C1 đủ bốn kỹ năng, chấm theo thang và ngưỡng đạt chính thức. Đề 1 mỗi trình độ miễn phí.", "Sujets DELF A1 à DALF C1, notés comme à l'examen. Sujet 1 gratuit.", "DELF A1 to DALF C1 papers, scored like the real exam. Paper 1 is free.")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-extrabold text-white no-underline"><Sparkles size={15} /> {tr("Thi thử miễn phí", "Essai gratuit", "Free mock exam")}</Link>
            <Link to="/grille-delf" className="inline-flex items-center gap-1.5 rounded-xl bg-surface2 px-4 py-2.5 text-sm font-extrabold text-ink no-underline">Grille DELF</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
