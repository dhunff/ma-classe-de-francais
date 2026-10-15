import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookA, Check, XCircle, Volume2, AlertTriangle, Lightbulb, RotateCcw, Dumbbell, CircleCheck } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";
import { usePracticeStore } from "../dashboard/PracticeRail.jsx";
import { CHU_CAI, DAU, IPA, BAI_NHAP_MON } from "../../content/nguPhap/nhapMon.js";
import { BAI_A2_B1 } from "../../content/nguPhap/a2b1.js";
import AM from "../../content/nguPhap/amThanh.json";

/* « Học ngữ pháp » (15/10, theo chủ dự án): học LÝ THUYẾT trước rồi mới luyện.
 *
 * Nội dung bài học nằm trong mã nguồn (src/content/nguPhap), không trong database:
 * đây là tài liệu đọc, không phải đề thi, nên đáp án phần thực hành đi cùng bài là
 * chấp nhận được (học sinh tự học). Kết quả lưu qua RPC ghi_bai_hoc (migration 148).
 * Âm thanh Nhập môn: giọng tổng hợp, tạo bằng scripts/ngu-phap/tao-am.mjs. */

const TAT_CA = [...BAI_NHAP_MON, ...BAI_A2_B1];
const CAP = ["Nhập môn", "A2", "B1"];
const MAU_CAP = { "Nhập môn": "from-emerald-500 to-teal-600", A2: "from-sky-500 to-blue-600", B1: "from-violet-500 to-indigo-600" };
const tenCap = (c) => (c === "Nhập môn" ? tr("Nhập môn", "Débutant", "Beginner") : c);

const chuan = (s) => String(s ?? "").normalize("NFC").replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
const boDau = (s) => chuan(s).normalize("NFD").replace(/[̀-ͯ]/g, "");

let amDangPhat = null;
const phatAm = (khoa) => {
  const url = AM[khoa];
  if (!url) return;
  try { amDangPhat?.pause(); amDangPhat = new Audio(url); amDangPhat.play().catch(() => {}); } catch { /* bỏ qua */ }
};

/* ─────────── Các khối lý thuyết ─────────── */
function KhoiBang({ k }) {
  return (
    <div className="my-4">
      {k.tieuDe && <p className="m-0 mb-2 text-sm font-extrabold text-ink">{k.tieuDe}</p>}
      <div className="overflow-x-auto rounded-2xl border border-solid border-line">
        <table className="w-full border-collapse text-sm">
          {k.cot?.some(Boolean) && (
            <thead><tr>{k.cot.map((c, i) => <th key={i} className="border-0 border-b border-solid border-line bg-surface2 px-3 py-2 text-left font-bold text-ink">{c}</th>)}</tr></thead>
          )}
          <tbody>
            {k.hang.map((h, i) => (
              <tr key={i} className="align-top">
                {h.map((o, j) => <td key={j} className="border-0 border-b border-solid border-line px-3 py-2 text-ink last:border-b-0">{o}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KhoiChuCai() {
  return (
    <div className="my-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
      {CHU_CAI.map(([chu, ten, ipa, vd]) => (
        <button key={chu} type="button" onClick={() => { phat("bam"); phatAm(`chu-${chu}`); }}
          className="group flex cursor-pointer flex-col items-center gap-0.5 rounded-2xl border border-solid border-line bg-surface p-2.5 font-sans transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
          <span className="text-2xl font-extrabold text-ink">{chu}<span className="text-lg text-soft">{chu.toLowerCase()}</span></span>
          <span lang="fr" className="text-xs font-bold text-primary">{ten}</span>
          <span className="text-[11px] text-soft">{ipa}</span>
          <span lang="fr" className="inline-flex items-center gap-1 text-[11px] italic text-soft"><Volume2 size={11} className="opacity-60 group-hover:opacity-100" />{vd}</span>
        </button>
      ))}
    </div>
  );
}

function KhoiDau() {
  return <KhoiBang k={{ tieuDe: tr("5 loại dấu", "Les 5 accents", "The 5 accents"), cot: [tr("Dấu", "Accent", "Accent"), tr("Tên", "Nom", "Name"), tr("Cách dùng", "Usage", "Use"), tr("Ví dụ", "Exemples", "Examples")], hang: DAU.map(([a, b, c, d]) => [<strong key="a" className="text-lg">{a}</strong>, b, c, <em key="d" lang="fr">{d}</em>]) }} />;
}

function KhoiIpa() {
  return (
    <div className="my-4 grid gap-4">
      {IPA.map((n, i) => (
        <div key={n.nhom}>
          <p className="m-0 mb-2 text-sm font-extrabold text-ink">{n.nhom}</p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {n.ds.map(([ky, vd, meo], j) => (
              <button key={ky} type="button" onClick={() => { phat("bam"); phatAm(`ipa-${i}-${j}`); }}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-solid border-line bg-surface px-3 py-2 text-left font-sans transition-colors hover:border-primary">
                <span className="w-12 shrink-0 text-lg font-extrabold text-primary">{ky}</span>
                <span className="min-w-0 flex-1">
                  <span lang="fr" className="inline-flex items-center gap-1 text-sm font-bold text-ink"><Volume2 size={12} className="text-soft" />{vd}</span>
                  <span className="block text-xs text-soft">{meo}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Khoi({ k }) {
  if (k.loai === "doan") return <div className="mcf-bai-hoc text-[15px] leading-relaxed text-ink [&_h3]:m-0 [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-extrabold [&_p]:m-0 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: k.html }} />;
  if (k.loai === "bang") return <KhoiBang k={k} />;
  if (k.loai === "chuCai") return <KhoiChuCai />;
  if (k.loai === "dau") return <KhoiDau />;
  if (k.loai === "ipa") return <KhoiIpa />;
  if (k.loai === "vidu") return (
    <ul className="my-4 grid list-none gap-1.5 p-0">
      {k.ds.map(([fr, vi], i) => (
        <li key={i} className="rounded-xl bg-surface2 px-4 py-2.5 text-sm"><span lang="fr" className="font-bold text-ink">{fr}</span> <span className="text-soft">· {vi}</span></li>
      ))}
    </ul>
  );
  if (k.loai === "luuY") return (
    <div className="my-4 rounded-2xl bg-primary-soft p-4">
      <p className="m-0 mb-1.5 flex items-center gap-1.5 text-sm font-extrabold text-primary"><Lightbulb size={15} /> {tr("Ghi nhớ", "À retenir", "Remember")}</p>
      <ul className="m-0 grid gap-1 pl-5 text-sm text-ink">{k.ds.map((x, i) => <li key={i} dangerouslySetInnerHTML={{ __html: x }} />)}</ul>
    </div>
  );
  if (k.loai === "loi") return (
    <div className="my-4 rounded-2xl border border-solid border-danger/30 bg-danger-soft p-4">
      <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-extrabold text-danger"><AlertTriangle size={15} /> {tr("Lỗi người Việt hay mắc", "Erreurs fréquentes", "Common mistakes")}</p>
      <ul className="m-0 grid list-none gap-2 p-0">
        {k.ds.map(([sai, dung, vi], i) => (
          <li key={i} className="text-sm">
            <span lang="fr" className="text-danger line-through">{sai}</span> → <span lang="fr" className="font-bold text-ok">{dung}</span>
            <span className="block text-xs text-soft">{vi}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return null;
}

/* ─────────── Thực hành ─────────── */
function ThucHanh({ bai, onXong }) {
  const [tl, setTl] = useState({});
  const [cham, setCham] = useState(null);       // null | { dung:[bool], diem }
  const dungCau = (c, v) => (c.loai === "qcm" ? v === c.dap : v != null && c.dap.some((d) => chuan(d) === chuan(v)));
  const gan = (c, v) => (c.loai === "dien" && v != null && !dungCau(c, v) && c.dap.some((d) => boDau(d) === boDau(v)));

  const kiem = () => {
    const dung = bai.baiTap.map((c, i) => dungCau(c, tl[i]));
    const diem = dung.filter(Boolean).length;
    setCham({ dung, diem });
    phat(diem === dung.length ? "thang" : diem >= dung.length / 2 ? "dung" : "sai");
    onXong(diem, dung.length);
  };
  const lamLai = () => { setTl({}); setCham(null); phat("bam"); };
  const thieu = bai.baiTap.some((_, i) => tl[i] == null || tl[i] === "");

  return (
    <section className="mt-8 rounded-3xl border border-solid border-line bg-surface p-5">
      <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><Dumbbell size={18} className="text-primary" /> {tr("Thực hành", "Entraînement", "Practice")}</h2>
      <ol className="m-0 mt-4 grid list-none gap-5 p-0">
        {bai.baiTap.map((c, i) => {
          const ok = cham?.dung[i];
          return (
            <li key={i} className={`rounded-2xl border-2 border-solid p-4 ${cham ? (ok ? "border-ok/40 bg-ok-soft/40" : "border-danger/40 bg-danger-soft/40") : "border-line"}`}>
              <p className="m-0 flex gap-2 text-sm font-bold text-ink"><span className="text-soft">{i + 1}.</span><span lang="fr" className="min-w-0 flex-1">{c.de}</span>
                {cham && (ok ? <Check size={18} className="shrink-0 text-ok" /> : <XCircle size={18} className="shrink-0 text-danger" />)}</p>
              {c.loai === "qcm" ? (
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {c.pa.map((p, k) => {
                    const chon = tl[i] === k, laDung = cham && k === c.dap;
                    return (
                      <button key={k} type="button" disabled={!!cham} onClick={() => setTl((x) => ({ ...x, [i]: k }))} lang="fr"
                        className={`rounded-xl border-2 border-solid px-3 py-2 text-left font-sans text-sm transition-colors ${laDung ? "border-ok bg-ok-soft font-bold text-ink" : chon ? (cham ? "border-danger bg-danger-soft text-ink" : "border-primary bg-primary-soft font-bold text-ink") : "border-line bg-surface text-ink"} ${cham ? "" : "cursor-pointer hover:border-primary/50"}`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div lang="fr" className="mt-2">
                  <input value={tl[i] ?? ""} disabled={!!cham} onChange={(e) => setTl((x) => ({ ...x, [i]: e.target.value }))}
                    placeholder={tr("Viết câu trả lời…", "Votre réponse…", "Your answer…")}
                    className="w-full rounded-xl border border-solid border-line bg-surface2 px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-primary" />
                  {cham && !ok && <p className="m-0 mt-1.5 text-sm"><span className="text-soft">{tr("Đáp án", "Réponse", "Answer")}:</span> <strong lang="fr" className="text-ok">{c.dap[0]}</strong>
                    {gan(c, tl[i]) && <span className="ml-2 text-xs font-bold text-warn">{tr("(gần đúng: kiểm tra lại dấu)", "(presque : vérifiez les accents)", "(close: check the accents)")}</span>}</p>}
                </div>
              )}
              {cham && <p className="m-0 mt-2 text-xs text-soft">{c.giai}</p>}
            </li>
          );
        })}
      </ol>
      {!cham ? (
        <button type="button" onClick={kiem} disabled={thieu}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 font-sans text-sm font-extrabold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          <CircleCheck size={16} /> {thieu ? tr("Trả lời hết các câu để kiểm tra", "Répondez à tout pour vérifier", "Answer all to check") : tr("Kiểm tra", "Vérifier", "Check")}
        </button>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-surface2 px-4 py-2 text-sm font-extrabold tabular-nums text-ink">{cham.diem}/{cham.dung.length}</span>
          <button type="button" onClick={lamLai}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-5 py-2.5 font-sans text-sm font-bold text-ink hover:border-primary">
            <RotateCcw size={15} /> {tr("Làm lại", "Recommencer", "Try again")}
          </button>
        </div>
      )}
    </section>
  );
}

/* Bài luyện thêm: tìm trong thư viện THẬT theo từ khoá chủ điểm. */
function LuyenThem({ bai }) {
  const kho = usePracticeStore();
  const navigate = useNavigate();
  const ds = useMemo(() => {
    if (!Array.isArray(kho)) return null;
    const tk = (bai.tuKhoa ?? []).map(boDau);
    return kho.filter((ex) => (ex.questions ?? []).length && tk.some((k) => boDau(`${ex.title} ${ex.topic ?? ""} ${ex.consigne ?? ""}`).includes(k))).slice(0, 4);
  }, [kho, bai]);
  if (!ds?.length) return null;
  return (
    <section className="mt-6">
      <h2 className="m-0 mb-3 text-base font-extrabold text-ink">{tr("Luyện thêm trong thư viện", "S'entraîner davantage", "More practice")}</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {ds.map((ex) => (
          <button key={ex.id} type="button" onClick={() => navigate("/etudiant/entrainement", { state: { moBai: ex.id } })}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-3 text-left font-sans hover:border-primary">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Dumbbell size={16} /></span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{ex.title}</span><span className="text-xs text-soft">{ex.level}</span></span>
            <ArrowRight size={15} className="text-primary transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </section>
  );
}

function TrangBai({ bai, ketQua, onGhi }) {
  const i = TAT_CA.findIndex((b) => b.ma === bai.ma);
  const sau = TAT_CA[i + 1];
  const dau = useRef(null);
  useEffect(() => { dau.current?.scrollIntoView({ block: "start" }); }, [bai.ma]);
  return (
    <div ref={dau} className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <Link to="/etudiant/ngu-phap" className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft no-underline hover:text-ink">
        <ArrowLeft size={15} /> {tr("Tất cả bài học", "Toutes les leçons", "All lessons")}
      </Link>
      <header className={`mt-4 rounded-3xl bg-gradient-to-br ${MAU_CAP[bai.cap]} p-6 text-white shadow-lg`}>
        <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">{tenCap(bai.cap)}</p>
        <h1 className="m-0 mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{bai.ten}</h1>
        <p lang="fr" className="m-0 mt-1 text-sm font-semibold italic text-white/85">{bai.tenFr}</p>
        <p className="m-0 mt-3 text-sm text-white/90">{bai.tomTat}</p>
        {ketQua && <p className="m-0 mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold"><Check size={13} /> {tr("Điểm tốt nhất", "Meilleur score", "Best score")}: {ketQua.diem}/{ketQua.tong}</p>}
      </header>
      <article className="mt-6 rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-7">
        {bai.phan.map((k, j) => <Khoi key={j} k={k} />)}
      </article>
      <ThucHanh key={bai.ma} bai={bai} onXong={onGhi} />
      <LuyenThem bai={bai} />
      {sau && (
        <Link to={`/etudiant/ngu-phap/${sau.ma}`} className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-primary-soft p-4 text-primary no-underline hover:opacity-90">
          <span><span className="block text-xs font-bold uppercase tracking-wide">{tr("Bài tiếp theo", "Leçon suivante", "Next lesson")}</span><span className="block font-extrabold">{sau.ten}</span></span>
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}

export default function NguPhap() {
  const { ma } = useParams();
  const [ketQua, setKetQua] = useState({});
  useEffect(() => {
    let con = true;
    supabase.from("bai_hoc_ket_qua").select("ma_bai, diem, tong").then(({ data }) => {
      if (con && Array.isArray(data)) setKetQua(Object.fromEntries(data.map((r) => [r.ma_bai, r])));
    }).catch(() => {});
    return () => { con = false; };
  }, []);

  const ghi = async (maBai, diem, tong) => {
    setKetQua((k) => ({ ...k, [maBai]: { ma_bai: maBai, diem: Math.max(diem, k[maBai]?.diem ?? 0), tong } }));
    try { await supabase.rpc("ghi_bai_hoc", { p_ma: maBai, p_diem: diem, p_tong: tong }); } catch { /* chưa đăng nhập: vẫn học được, chỉ không lưu */ }
  };

  const bai = ma ? TAT_CA.find((b) => b.ma === ma) : null;
  if (ma && bai) return <TrangBai bai={bai} ketQua={ketQua[bai.ma]} onGhi={(d, t) => ghi(bai.ma, d, t)} />;

  const daHoc = TAT_CA.filter((b) => ketQua[b.ma]).length;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-primary to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
        <div className="relative flex items-center gap-4">
          <Leon cam="hoc" size={110} className="mcf-leon-bay shrink-0 max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><BookA size={14} /> {tr("Học trước, luyện sau", "Apprendre puis pratiquer", "Learn, then practise")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{tr("Học ngữ pháp", "Grammaire", "Grammar")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{tr("Mỗi bài: lý thuyết dễ hiểu, ví dụ, lỗi hay mắc và vài câu thực hành ngay bên dưới.", "Chaque leçon : explications claires, exemples, erreurs fréquentes et exercices.", "Each lesson: clear explanations, examples, common mistakes and quick practice.")}</p>
            <p className="m-0 mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tabular-nums">{tr("Đã học", "Leçons faites", "Done")}: {daHoc}/{TAT_CA.length}</p>
          </div>
        </div>
      </header>
      {CAP.map((cap) => (
        <section key={cap} className="mt-8">
          <h2 className="m-0 mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <span className={`rounded-xl bg-gradient-to-br ${MAU_CAP[cap]} px-3 py-1 text-sm text-white`}>{tenCap(cap)}</span>
            {cap === "Nhập môn" && <span className="text-sm font-semibold text-soft">{tr("Bảng chữ cái, phát âm, quy tắc đọc", "Alphabet, sons, règles de lecture", "Alphabet, sounds, reading rules")}</span>}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TAT_CA.filter((b) => b.cap === cap).map((b) => {
              const kq = ketQua[b.ma];
              return (
                <Link key={b.ma} to={`/etudiant/ngu-phap/${b.ma}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-solid border-line bg-surface p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <span className="text-base font-extrabold text-ink">{b.ten}</span>
                  <span lang="fr" className="text-xs italic text-soft">{b.tenFr}</span>
                  <span className="line-clamp-2 text-sm text-soft">{b.tomTat}</span>
                  <span className="mt-auto flex items-center justify-between pt-1">
                    {kq ? <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-extrabold text-ok"><Check size={12} /> {kq.diem}/{kq.tong}</span>
                      : <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">{tr("Chưa học", "À découvrir", "Not started")}</span>}
                    <ArrowRight size={15} className="text-primary transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
      <p className="m-0 mt-8 text-center text-xs text-soft">{tr("Các bài A1, B2, C1 đang được soạn.", "Les leçons A1, B2 et C1 sont en préparation.", "A1, B2 and C1 lessons are coming soon.")}</p>
    </div>
  );
}
