import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookA, Check, XCircle, Volume2, AlertTriangle, Lightbulb, RotateCcw, Dumbbell, CircleCheck, Lock, LogIn, Mic } from "lucide-react";
import { PhatAm } from "./NgheNoi.jsx";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";
import { usePracticeStore } from "../dashboard/PracticeRail.jsx";
import { CHU_CAI, DAU, IPA } from "../../content/nguPhap/nhapMon.js";
import { TAT_CA, CAP, chiaPhan, BAI_CONG_KHAI, napSuaNguPhap } from "../../content/nguPhap/index.js";
import SuaCauNguPhap from "../teacher/SuaCauNguPhap.jsx";
import { ngayHomNay } from "../../shared/hoatDong.js";
import { useSeo } from "../../shared/seo.js";
import AM from "../../content/nguPhap/amThanh.json";
import HocTapTab from "./HocTapTab.jsx";
import AM_VD from "../../content/nguPhap/amThanhViDu.json";
import { choTrong } from "../../shared/choTrong.jsx";

/* « Học ngữ pháp » (15/10, theo chủ dự án): học LÝ THUYẾT trước rồi mới luyện.
 *
 * Nội dung bài học nằm trong mã nguồn (src/content/nguPhap), không trong database:
 * đây là tài liệu đọc, không phải đề thi, nên đáp án phần thực hành đi cùng bài là
 * chấp nhận được (học sinh tự học). Kết quả lưu qua RPC ghi_bai_hoc (migration 148).
 * Âm thanh Nhập môn: giọng tổng hợp, tạo bằng scripts/ngu-phap/tao-am.mjs. */

const MAU_CAP = { A0: "from-emerald-500 to-teal-600", A1: "from-amber-500 to-orange-600", A2: "from-sky-500 to-blue-600", B1: "from-violet-500 to-indigo-600", B2: "from-rose-500 to-pink-600", C1: "from-slate-600 to-slate-800" };
const tenCap = (c) => (c === "A0" ? tr("A0 · Nhập môn", "A0 · Débutant", "A0 · Beginner") : c);

const chuan = (s) => String(s ?? "").normalize("NFC").replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
const boDau = (s) => chuan(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
/* Chấm linh hoạt (16/10): bỏ qua khác biệt dấu câu cuối câu, khoảng trắng quanh dấu
 * câu, ngoặc kép, gạch nối thừa. Dấu thanh (é, è…) VẪN tính. */
const chuanCham = (s) => chuan(s).replace(/[«»"“”]/g, "").replace(/\s*([?!:;,.])\s*/g, "$1 ").replace(/[.!?…\s]+$/, "").replace(/\s+/g, " ").trim();
/* Khoảng cách sửa (Levenshtein) để báo « gần đúng: sai một ký tự ». */
const khoangCach = (a, b) => {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let truoc = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const nay = [i];
    for (let j = 1; j <= b.length; j++) nay[j] = Math.min(truoc[j] + 1, nay[j - 1] + 1, truoc[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    truoc = nay;
  }
  return truoc[b.length];
};

let amDangPhat = null;
const phatAm = (khoa) => phatUrl(AM[khoa]);
/* Âm thanh câu ví dụ / câu đúng A1–A2 (17/10, scripts/ngu-phap/tao-am-vidu.mjs):
   tra theo chính câu tiếng Pháp; câu chưa có âm thanh thì không hiện nút loa. */
function NutNghe({ cau }) {
  const url = AM_VD[cau];
  if (!url) return null;
  return (
    <button type="button" onClick={() => phatUrl(url)} aria-label={tr("Nghe câu này", "Écouter", "Listen")} title={tr("Nghe câu này", "Écouter", "Listen")}
      className="ml-1.5 inline-grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-primary-soft align-middle text-primary hover:bg-primary hover:text-on-primary">
      <Volume2 size={13} />
    </button>
  );
}
function phatUrl(url) {
  if (!url) return;
  try { amDangPhat?.pause(); amDangPhat = new Audio(url); amDangPhat.play().catch(() => {}); } catch { /* bỏ qua */ }
};

/* Danh sách bài, chia phần: content/nguPhap/index.js. */
/* Đảo thứ tự phương án trắc nghiệm mỗi lượt: đa số câu soạn với đáp án ở vị trí A. */
/* Dạng bài (16/10): qcm, dien, vf (đúng/sai), sap (sắp xếp từ thành câu), sua (tìm và
 * sửa lỗi). vf quy về qcm hai phương án; sua là dien có câu sai điền sẵn; sap xáo ô từ. */
const tronPa = (ds) => ds.map((c) => {
  if (c.loai === "vf") return { ...c, loai: "qcm", dang: "vf", pa: [tr("Đúng", "Vrai", "True"), tr("Sai", "Faux", "False")], dap: c.dung ? 0 : 1 };
  if (c.loai === "sua") return { ...c, loai: "dien", dang: "sua" };
  if (c.loai === "sap") {
    const tu = c.dap[0].split(" ");
    let thuTu = tu.map((_, i) => i);
    for (let n = 0; n < 5 && thuTu.every((x, i) => x === i); n++) thuTu = [...thuTu].sort(() => Math.random() - 0.5);
    return { ...c, tu, thuTu };
  }
  if (c.loai !== "qcm") return c;
  const thuTu = c.pa.map((_, i) => i).sort(() => Math.random() - 0.5);
  return { ...c, pa: thuTu.map((i) => c.pa[i]), dap: thuTu.indexOf(c.dap) };
});

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

/* Luyện nói trong bài phát âm A0 (25/10). Câu và audio mẫu ở bảng cau_luyen (161, nạp bởi
   scripts/nghe-noi/nap-a0.mjs); chấm bằng cham-phat-am qua đúng component PhatAm của
   « Nghe & Nói » (máy chép lại, tô từ nghe sai, mẹo chữa). Cần đăng nhập để chấm. */
function KhoiLuyenNoi({ k }) {
  const [ds, setDs] = useState(null);
  const [chon, setChon] = useState(0);
  const [dangNhap, setDangNhap] = useState(null);
  const [xong, setXong] = useState({});
  useEffect(() => {
    let con = true;
    supabase.from("cau_luyen").select("id, ma, cau, nghia, meo, audio_url").in("ma", k.ds.map((x) => x.ma))
      .then(({ data }) => { if (con) setDs(Array.isArray(data) ? k.ds.map((x) => data.find((d) => d.ma === x.ma)).filter(Boolean) : []); });
    supabase.auth.getSession().then(({ data }) => { if (con) setDangNhap(!!data?.session); });
    return () => { con = false; };
  }, [k]);
  const cau = ds?.[chon];
  return (
    <div className="mt-5 rounded-2xl border-2 border-solid border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300"><Mic size={14} /> {tr("Luyện nói", "À vous de parler", "Speaking practice")}</p>
      <p className="m-0 mt-1 text-sm text-soft">{tr("Nghe mẫu, bấm ghi âm và đọc. Máy chép lại những gì nó nghe được, từ đỏ là chỗ cần sửa.", "Écoutez, enregistrez-vous : la machine transcrit, les mots en rouge sont à corriger.", "Listen, record yourself: red words need fixing.")}</p>
      {ds === null ? <p className="m-0 mt-3 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p> : !ds.length ? null : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ds.map((c, i) => (
              <button key={c.id} type="button" onClick={() => setChon(i)}
                className={"cursor-pointer rounded-xl border-2 border-solid px-3 py-1.5 font-sans text-sm font-bold transition-colors " + (i === chon ? "border-rose-500 bg-rose-500 text-white" : "border-line bg-surface text-ink hover:border-rose-300")}>
                <span lang="fr">{c.cau}</span>{xong[c.id] != null && <span className="ml-1">{xong[c.id] >= 0.9 ? "✓" : "·"}</span>}
              </button>
            ))}
          </div>
          {cau && (
            <div className="mt-4 rounded-2xl bg-surface p-4">
              <p lang="fr" className="m-0 text-2xl font-extrabold text-ink">{cau.cau}</p>
              <p className="m-0 mt-0.5 text-sm text-soft">{cau.nghia}</p>
              <div className="mt-3">
                {dangNhap === false ? (
                  <>
                    {cau.audio_url && <audio controls src={cau.audio_url} className="w-full" />}
                    <p className="m-0 mt-2 text-sm font-semibold text-primary">{tr("Đăng nhập để ghi âm và được chữa phát âm.", "Connectez-vous pour être corrigé.", "Sign in to record and get feedback.")}</p>
                  </>
                ) : <PhatAm key={cau.id} cau={cau} onXong={(d) => setXong((x) => ({ ...x, [cau.id]: d }))} />}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Khoi({ k }) {
  if (k.loai === "doan") return <div className="mcf-bai-hoc text-[15px] leading-relaxed text-ink [&_h3]:m-0 [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-extrabold [&_p]:m-0 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: k.html }} />;
  if (k.loai === "bang") return <KhoiBang k={k} />;
  if (k.loai === "luyenNoi") return <KhoiLuyenNoi k={k} />;
  if (k.loai === "chuCai") return <KhoiChuCai />;
  if (k.loai === "dau") return <KhoiDau />;
  if (k.loai === "ipa") return <KhoiIpa />;
  if (k.loai === "vidu") return (
    <>
    {k.nhan && <p className="m-0 mt-5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ok"><Volume2 size={14} /> {tr("Ví dụ", "Exemples", "Examples")}</p>}
    <ul className={"grid list-none gap-1.5 p-0 " + (k.nhan ? "mb-2 mt-2" : "my-4")}>
      {k.ds.map(([fr, vi], i) => (
        <li key={i} className={"rounded-xl px-4 py-2.5 text-sm " + (k.nhan ? "border-0 border-l-4 border-solid border-ok bg-ok-soft/60" : "bg-surface2")}><span lang="fr" className="font-bold text-ink">{fr}</span><NutNghe cau={fr} /> <span className="text-soft">· {vi}</span></li>
      ))}
    </ul>
    </>
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
            <span lang="fr" className="text-danger line-through">{sai}</span> → <span lang="fr" className="font-bold text-ok">{dung}</span><NutNghe cau={dung} />
            <span className="block text-xs text-soft">{vi}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return null;
}

/* ─────────── Thực hành ───────────
 * Mỗi màn MỘT câu: chọn/gõ → « Kiểm tra » → báo đúng/sai ngay kèm lời giải →
 * « Tiếp tục ». Hết lượt thì tổng kết + làm lại câu sai. Chỉ lượt ĐẦU, làm đủ
 * mọi câu mới gọi onXong (lượt làm lại câu sai không ghi điểm). */
export function ThucHanh({ bai, cau, tieuDe, onXong, onKetQua }) {
  const tatCa = useMemo(() => tronPa(cau ?? bai.baiTap), [cau, bai]);
  const [ds, setDs] = useState(() => tatCa.map((_, i) => i));   // chỉ số câu trong lượt này
  const [vong, setVong] = useState(0);                          // 0 = lượt đầu
  const [vt, setVt] = useState(0);
  const [tl, setTl] = useState(null);
  const [kq, setKq] = useState([]);                             // [{ i, ok, tl }]
  const [xem, setXem] = useState(false);
  const oNhap = useRef(null);
  const [baoLoi, setBaoLoi] = useState(null);                   // null | { ghiChu, trangThai }
  /* Giáo viên (đường /professeur) sửa câu ngay tại chỗ (25/10, migration 166). */
  const laGv = useLocation().pathname.startsWith("/professeur");
  const [suaCau, setSuaCau] = useState(false);
  const guiBaoLoi = async () => {
    setBaoLoi((x) => ({ ...x, trangThai: "dang" }));
    const { data, error } = await supabase.rpc("bao_loi_ngu_phap", { p_ma: c.__ma ?? bai?.ma, p_cau: c.__goc ?? c.de, p_ghi_chu: baoLoi?.ghiChu ?? "" });
    setBaoLoi((x) => ({ ...x, trangThai: data?.ok ? "xong" : String(error?.message ?? "").includes("HET_LUOT") ? "het" : String(error?.message ?? "").includes("CHUA_DANG_NHAP") ? "loi" : "hong", chiTiet: error?.message ?? "" }));
  };
  const ghepSap = (c, v) => (v ?? []).map((k) => c.tu[k]).join(" ");
  const dungCau = (c, v) => (c.loai === "qcm" ? v === c.dap
    : c.loai === "sap" ? c.dap.some((d) => chuanCham(d) === chuanCham(ghepSap(c, v)))
    : v != null && c.dap.some((d) => chuanCham(d) === chuanCham(v)));
  /* « gần đúng »: chỉ sai dấu thanh, hoặc câu dài sai đúng một ký tự. Vẫn tính SAI. */
  const gan = (c, v) => (c.loai === "dien" && v != null && !dungCau(c, v) && c.dap.some((d) => chuanCham(boDau(d)) === chuanCham(boDau(v))));
  const motKyTu = (c, v) => (c.loai === "dien" && v != null && !dungCau(c, v) && !gan(c, v) && c.dap.some((d) => chuanCham(d).length >= 8 && khoangCach(chuanCham(d), chuanCham(v)) === 1));

  const xong = vt >= ds.length;
  const i = ds[vt];
  const c = tatCa[i];
  const ok = xem && dungCau(c, tl);
  const coTl = c?.loai === "sap" ? (tl ?? []).length === c.tu.length : tl != null && tl !== "" && tl !== c?.de;

  useEffect(() => {
    if (xong) return;
    if (c?.dang === "sua") setTl(c.de);       // câu sai điền sẵn để học sinh sửa tại chỗ
    if (c?.loai === "dien") oNhap.current?.focus();
  }, [vt, xong, c]);

  const kiem = () => {
    if (!coTl || xem) return;
    const d = dungCau(c, tl);
    setXem(true);
    setKq((x) => [...x, { i, ok: d, tl }]);
    phat(d ? "dung" : "sai");
    /* Ôn câu sai (149): sai → vào danh sách ôn; đúng → giãn lịch nếu đã có. Chưa
     * đăng nhập (trang công khai) thì RPC từ chối, bỏ qua im lặng. */
    supabase.rpc("ghi_cau_ngu_phap", { p_ma: c.__ma ?? bai?.ma, p_cau: c.__goc ?? c.de, p_dung: d, p_ngay: ngayHomNay() }).then(() => {}, () => {});
  };
  const tiep = () => {
    setXem(false); setTl(null); setBaoLoi(null);
    const sau = vt + 1;
    setVt(sau);
    if (sau >= ds.length) {
      const diem = kq.filter((k) => k.ok).length;
      phat(diem === ds.length ? "thang" : "bam");
      if (vong === 0) onXong?.(diem, ds.length);
      /* Kết quả từng câu của lượt đầu (bài xếp trình độ cần biết câu nào đúng). */
      if (vong === 0) onKetQua?.([...kq].map((k) => ({ i: k.i, ok: k.ok })));
    }
  };
  const batDau = (moi) => { setDs(moi); setVong((v) => v + 1); setVt(0); setTl(null); setKq([]); setXem(false); phat("bam"); };
  const phim = (e) => { if (e.key === "Enter" && !xem) { e.preventDefault(); kiem(); } };
  /* Đang xem lời giải: ô nhập đã khoá nên mất focus, bắt Enter ở cấp cửa sổ. */
  const tiepRef = useRef(tiep);
  tiepRef.current = tiep;
  useEffect(() => {
    if (!xem) return;
    const h = (e) => { if (e.key === "Enter" && e.target?.tagName !== "TEXTAREA") { e.preventDefault(); tiepRef.current(); } };
    const t = setTimeout(() => window.addEventListener("keydown", h), 0);
    return () => { clearTimeout(t); window.removeEventListener("keydown", h); };
  }, [xem]);

  const diem = kq.filter((k) => k.ok).length;
  const sai = kq.filter((k) => !k.ok);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-solid border-line bg-surface">
      <div className="flex items-center gap-3 border-0 border-b border-solid border-line px-5 py-4">
        <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><Dumbbell size={18} className="text-primary" /> {tieuDe ?? tr("Thực hành", "Entraînement", "Practice")}</h2>
        {vong > 0 && <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-xs font-bold text-warn">{tr("Làm lại", "Reprise", "Retry")}</span>}
        <span className="ml-auto text-sm font-bold tabular-nums text-soft">{Math.min(vt + 1, ds.length)}/{ds.length}</span>
      </div>
      {/* Thanh tiến độ: mỗi câu một đoạn, tô theo kết quả */}
      <div className="flex gap-1 px-5 pt-4">
        {ds.map((_, k) => {
          const r = kq[k];
          return <span key={k} className={`h-1.5 flex-1 rounded-full ${r ? (r.ok ? "bg-ok" : "bg-danger") : k === vt ? "bg-primary" : "bg-surface2"}`} />;
        })}
      </div>

      {!xong ? (
        <div className="p-5" onKeyDown={phim}>
          <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-soft">
            {c.dang === "vf" ? tr("Đúng hay sai?", "Vrai ou faux ?", "True or false?")
              : c.dang === "sua" ? tr("Tìm và sửa lỗi trong câu", "Trouvez et corrigez l'erreur", "Find and fix the mistake")
              : c.loai === "sap" ? tr("Sắp xếp các từ thành câu đúng", "Remettez les mots dans l'ordre", "Put the words in order")
              : c.loai === "qcm" ? tr("Chọn đáp án đúng", "Choisissez la bonne réponse", "Choose the right answer")
              : tr("Điền vào chỗ trống", "Complétez", "Fill in the blank")}
          </p>
          <p lang="fr" className={`m-0 mt-2 text-xl font-bold leading-snug ${c.dang === "sua" ? "text-danger" : "text-ink"}`}>{choTrong(c.loai === "sap" ? c.goiY : c.de)}</p>

          {c.loai === "sap" ? (
            <div className="mt-5">
              <div className={`flex min-h-[3.5rem] flex-wrap gap-2 rounded-2xl border-2 border-dashed p-2.5 ${xem ? (ok ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft") : "border-line"}`}>
                {(tl ?? []).length === 0 && <span className="self-center px-2 text-sm text-soft">{tr("Bấm các từ bên dưới theo đúng thứ tự…", "Touchez les mots dans l'ordre…", "Tap the words below in order…")}</span>}
                {(tl ?? []).map((k, j) => (
                  <button key={j} type="button" disabled={xem} lang="fr" onClick={() => setTl((x) => x.filter((_, n) => n !== j))}
                    className="cursor-pointer rounded-xl border-0 bg-primary px-3 py-2 font-sans text-base font-semibold text-on-primary disabled:cursor-default">{c.tu[k]}</button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.thuTu.map((k) => {
                  const daDung = (tl ?? []).includes(k);
                  return (
                    <button key={k} type="button" disabled={xem || daDung} lang="fr" onClick={() => { setTl((x) => [...(x ?? []), k]); phat("bam"); }}
                      className={`rounded-xl border border-solid px-3 py-2 font-sans text-base font-semibold ${daDung ? "border-line bg-surface2 text-transparent" : "cursor-pointer border-line bg-surface text-ink hover:border-primary"}`}>{c.tu[k]}</button>
                  );
                })}
              </div>
            </div>
          ) : c.loai === "qcm" ? (
            <div className="mt-5 grid gap-2.5">
              {c.pa.map((p, k) => {
                const chon = tl === k, laDung = xem && k === c.dap, laSai = xem && chon && !laDung;
                return (
                  <button key={k} type="button" disabled={xem} onClick={() => { setTl(k); phat("bam"); }}
                    className={`flex items-center gap-3 rounded-2xl border-2 border-solid px-4 py-3 text-left font-sans text-base transition-colors ${laDung ? "border-ok bg-ok-soft" : laSai ? "border-danger bg-danger-soft" : chon ? "border-primary bg-primary-soft" : "border-line bg-surface"} ${xem ? "" : "cursor-pointer hover:border-primary/50"}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${laDung ? "bg-ok text-white" : laSai ? "bg-danger text-white" : chon ? "bg-primary text-on-primary" : "bg-surface2 text-soft"}`}>
                      {laDung ? <Check size={16} /> : laSai ? <XCircle size={16} /> : String.fromCharCode(65 + k)}
                    </span>
                    <span lang="fr" className="font-semibold text-ink">{p}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <input ref={oNhap} lang="fr" value={tl ?? ""} disabled={xem} onChange={(e) => setTl(e.target.value)}
              placeholder={tr("Gõ câu trả lời rồi nhấn Enter…", "Tapez votre réponse puis Entrée…", "Type your answer, then Enter…")}
              className={`mt-5 w-full rounded-2xl border-2 border-solid px-4 py-3.5 font-sans text-lg text-ink outline-none ${xem ? (ok ? "border-ok bg-ok-soft" : "border-danger bg-danger-soft") : "border-line bg-surface2 focus:border-primary"}`} />
          )}

          {xem && (
            <div className={`mt-4 rounded-2xl p-4 ${ok ? "bg-ok-soft" : "bg-danger-soft"}`}>
              <p className={`m-0 flex items-center gap-2 font-extrabold ${ok ? "text-ok" : "text-danger"}`}>
                {ok ? <CircleCheck size={18} /> : <XCircle size={18} />}
                {ok ? tr("Chính xác!", "Exact !", "Correct!") : tr("Chưa đúng", "Pas tout à fait", "Not quite")}
              </p>
              {!ok && c.loai !== "qcm" && (
                <p className="m-0 mt-1.5 text-sm text-ink">{tr("Đáp án", "Réponse", "Answer")}: <strong lang="fr">{c.dap[0]}</strong>
                  {gan(c, tl) && <span className="ml-2 text-xs font-bold text-warn">{tr("(gần đúng: kiểm tra lại dấu)", "(presque : vérifiez les accents)", "(close: check the accents)")}</span>}
                  {motKyTu(c, tl) && <span className="ml-2 text-xs font-bold text-warn">{tr("(gần đúng: sai một ký tự)", "(presque : une lettre de différence)", "(close: one letter off)")}</span>}</p>
              )}
              {c.giai && <p className="m-0 mt-1.5 flex gap-1.5 text-sm text-soft"><Lightbulb size={15} className="mt-0.5 shrink-0" />{c.giai}</p>}
              {/* Báo lỗi câu (149): giáo viên xem ở /professeur/bao-loi-ngu-phap. */}
              {baoLoi?.trangThai === "xong" ? (
                <p className="m-0 mt-2 text-xs font-bold text-ok">{tr("Đã gửi báo lỗi. Cảm ơn bạn!", "Signalement envoyé. Merci !", "Report sent. Thank you!")}</p>
              ) : baoLoi ? (
                <div className="mt-3 grid gap-2">
                  <textarea value={baoLoi.ghiChu ?? ""} maxLength={1000} rows={2} onChange={(e) => setBaoLoi((x) => ({ ...x, ghiChu: e.target.value }))}
                    placeholder={tr("Câu này sai ở đâu? (đề, đáp án, lời giải…)", "Qu'est-ce qui ne va pas ? (énoncé, réponse, explication…)", "What is wrong? (question, answer, explanation…)")}
                    className="w-full resize-y rounded-xl border border-solid border-line bg-surface px-3 py-2 font-sans text-sm text-ink outline-none focus:border-primary" />
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={guiBaoLoi} disabled={baoLoi.trangThai === "dang"}
                      className="cursor-pointer rounded-full border-0 bg-primary px-4 py-1.5 font-sans text-xs font-bold text-on-primary disabled:opacity-50">{tr("Gửi báo lỗi", "Envoyer", "Send report")}</button>
                    <button type="button" onClick={() => setBaoLoi(null)} className="cursor-pointer rounded-full border-0 bg-transparent px-2 py-1.5 font-sans text-xs font-bold text-soft">{tr("Huỷ", "Annuler", "Cancel")}</button>
                    {baoLoi.trangThai === "hong" && <span className="text-xs font-semibold text-danger">{tr("Không gửi được", "Échec de l'envoi", "Could not send")}{baoLoi.chiTiet ? ` (${baoLoi.chiTiet})` : ""}</span>}
            {baoLoi.trangThai === "loi" && <span className="text-xs font-bold text-danger">{tr("Không gửi được. Bạn cần đăng nhập.", "Échec de l'envoi. Connexion requise.", "Could not send. Please sign in.")}</span>}
                    {baoLoi.trangThai === "het" && <span className="text-xs font-bold text-danger">{tr("Bạn đã gửi 20 báo lỗi trong 24 giờ.", "20 signalements en 24 h atteints.", "20 reports in 24 h reached.")}</span>}
                  </div>
                </div>
              ) : (
                <span className="flex flex-wrap items-center gap-3">
                {laGv && <button type="button" onClick={() => setSuaCau(true)} className="mt-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-sans text-xs font-bold text-primary underline">{tr("Sửa câu này", "Modifier", "Edit")}</button>}
                {suaCau && <SuaCauNguPhap ma={c.__ma ?? bai?.ma} goc={c.__goc ?? c.de} onDong={() => setSuaCau(false)} onXong={() => { setSuaCau(false); window.location.reload(); }} />}
                <button type="button" onClick={() => setBaoLoi({ ghiChu: "" })}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-sans text-xs font-semibold text-soft underline hover:text-ink">
                  <AlertTriangle size={12} /> {tr("Báo lỗi câu này", "Signaler une erreur", "Report a mistake")}
                </button>
                </span>
              )}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            {!xem ? (
              <button type="button" onClick={kiem} disabled={!coTl}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-7 py-3 font-sans text-sm font-extrabold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                {tr("Kiểm tra", "Vérifier", "Check")}
              </button>
            ) : (
              <button type="button" onClick={tiep}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-0 px-7 py-3 font-sans text-sm font-extrabold text-white transition-opacity hover:opacity-90 ${ok ? "bg-ok" : "bg-danger"}`}>
                {vt + 1 >= ds.length ? tr("Xem kết quả", "Voir le résultat", "See results") : tr("Tiếp tục", "Continuer", "Continue")} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-4">
            <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-extrabold tabular-nums ${diem === ds.length ? "bg-ok-soft text-ok" : "bg-primary-soft text-primary"}`}>{diem}/{ds.length}</span>
            <div>
              <p className="m-0 text-lg font-extrabold text-ink">
                {diem === ds.length ? tr("Hoàn hảo!", "Parfait !", "Perfect!") : diem >= ds.length / 2 ? tr("Khá lắm!", "Bien joué !", "Well done!") : tr("Cố thêm chút nữa!", "Encore un effort !", "Keep going!")}
              </p>
              {vong > 0 && <p className="m-0 mt-0.5 text-xs text-soft">{tr("Lượt làm lại không thay đổi điểm đã lưu.", "La reprise ne modifie pas le score enregistré.", "Retries don't change the saved score.")}</p>}
            </div>
          </div>
          {sai.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-2 p-0">
              {sai.map((r) => {
                const q = tatCa[r.i];
                return (
                  <li key={r.i} className="rounded-2xl border border-solid border-line p-3 text-sm">
                    <p lang="fr" className="m-0 font-semibold text-ink">{choTrong(q.de)}</p>
                    <p className="m-0 mt-1"><span lang="fr" className="text-danger line-through">{q.loai === "qcm" ? q.pa[r.tl] : q.loai === "sap" ? ghepSap(q, r.tl) : r.tl}</span> → <strong lang="fr" className="text-ok">{q.loai === "qcm" ? q.pa[q.dap] : q.dap[0]}</strong></p>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {sai.length > 0 && (
              <button type="button" onClick={() => batDau(sai.map((r) => r.i))}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
                <RotateCcw size={15} /> {tr("Làm lại câu sai", "Refaire les erreurs", "Retry mistakes")} ({sai.length})
              </button>
            )}
            <button type="button" onClick={() => batDau(tatCa.map((_, k) => k))}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-5 py-2.5 font-sans text-sm font-bold text-ink hover:border-primary">
              <RotateCcw size={15} /> {tr("Làm lại từ đầu", "Tout recommencer", "Start over")}
            </button>
          </div>
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

function TrangBai({ bai, ketQua, onGhi, goc, congKhai }) {
  const i = TAT_CA.findIndex((b) => b.ma === bai.ma);
  const sau = TAT_CA[i + 1];
  const dau = useRef(null);
  useEffect(() => { dau.current?.scrollIntoView({ block: "start" }); }, [bai.ma]);
  const cacPhan = useMemo(() => chiaPhan(bai), [bai]);
  const [daLam, setDaLam] = useState({});
  const [dangXem, setDangXem] = useState("a");
  useEffect(() => { setDaLam({}); setDangXem("a"); }, [bai.ma]);
  /* Mục lục tô phần đang đọc: phần nào chạm vùng trên màn hình thì sáng lên. */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) setDangXem(e.target.dataset.phan);
    }, { rootMargin: "-15% 0px -70% 0px" });
    document.querySelectorAll("[data-phan]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [bai.ma, cacPhan]);
  const toi = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const mucLuc = [
    ...cacPhan.map((ph) => ({ id: `phan-${ph.chu}`, khoa: ph.chu, ten: ph.ten, nhan: ph.chu, xong: daLam[ph.chu],
      phu: daLam[ph.chu] ? `${daLam[ph.chu].diem}/${daLam[ph.chu].tong}` : `${ph.cau.length} ${tr("câu", "q.", "q.")}` })),
    { id: "phan-on-tap", khoa: "on", ten: tr("Ôn tập cả bài", "Révision de la leçon", "Lesson review"), nhan: null, phu: `${bai.baiTap.length} ${tr("câu", "q.", "q.")}` },
  ];

  return (
    <div ref={dau} className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <Link to={goc} className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft no-underline hover:text-ink">
        <ArrowLeft size={15} /> {tr("Tất cả bài học", "Toutes les leçons", "All lessons")}
      </Link>
      <header className={`mt-4 rounded-3xl bg-gradient-to-br ${MAU_CAP[bai.cap]} p-6 text-white shadow-lg`}>
        <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">{tenCap(bai.cap)} · {tr("Bài", "Leçon", "Lesson")} {TAT_CA.filter((b) => b.cap === bai.cap).findIndex((b) => b.ma === bai.ma) + 1}</p>
        <h1 className="m-0 mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{bai.ten}</h1>
        <p lang="fr" className="m-0 mt-1 text-sm font-semibold italic text-white/85">{bai.tenFr}</p>
        <p className="m-0 mt-3 text-sm text-white/90">{bai.tomTat}</p>
        {ketQua && <p className="m-0 mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold"><Check size={13} /> {tr("Điểm tốt nhất", "Meilleur score", "Best score")}: {ketQua.diem}/{ketQua.tong}</p>}
      </header>

      {/* Màn hẹp: dải chữ cái dính trên đầu khi cuộn */}
      <nav className="no-scrollbar sticky top-0 z-10 -mx-4 mt-4 flex gap-2 overflow-x-auto bg-bg px-4 py-2 lg:hidden">
        {mucLuc.map((m) => (
          <button key={m.khoa} type="button" onClick={() => toi(m.id)} title={m.ten}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 py-1.5 font-sans text-sm font-extrabold ${dangXem === m.khoa ? "bg-primary text-on-primary" : m.xong ? "bg-ok-soft text-ok" : "bg-surface text-ink"}`}>
            {m.nhan ? (m.xong ? <Check size={13} /> : m.nhan) : <Dumbbell size={13} />}
            <span className="max-w-[9rem] truncate font-semibold">{m.ten}</span>
          </button>
        ))}
      </nav>

      <div className="lg:mt-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
        {/* Màn rộng: mục lục cột trái, dính theo khi cuộn */}
        <aside className="hidden lg:sticky lg:top-4 lg:block">
          <nav className="rounded-3xl border border-solid border-line bg-surface p-4">
            <p className="m-0 px-2 text-xs font-extrabold uppercase tracking-wider text-soft">{tr("Các phần của bài", "Plan de la leçon", "Lesson outline")}</p>
            <ol className="m-0 mt-2 grid list-none gap-1 p-0">
              {mucLuc.map((m) => {
                const dang = dangXem === m.khoa;
                return (
                  <li key={m.khoa}>
                    <button type="button" onClick={() => toi(m.id)}
                      className={`flex w-full cursor-pointer items-start gap-2.5 rounded-xl border-0 px-2 py-2 text-left font-sans transition-colors ${dang ? "bg-primary-soft" : "bg-transparent hover:bg-surface2"}`}>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${m.xong ? "bg-ok text-white" : dang ? "bg-primary text-on-primary" : m.nhan ? "bg-primary-soft text-primary" : "bg-surface2 text-soft"}`}>
                        {m.nhan ? (m.xong ? <Check size={12} /> : m.nhan) : <Dumbbell size={12} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-snug ${dang ? "font-extrabold text-ink" : "font-semibold text-ink"}`}>{m.ten}</span>
                        <span className="block text-xs text-soft">{m.phu}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0">
          {cacPhan.map((ph) => (
            <div key={`${bai.ma}-${ph.chu}`} id={`phan-${ph.chu}`} data-phan={ph.chu} className="scroll-mt-16 lg:scroll-mt-4">
              <article className="mt-6 rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] first:mt-0 sm:p-7">
                <h2 className="m-0 flex items-center gap-3 text-lg font-extrabold text-ink">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-sm text-on-primary">{ph.chu}</span>{ph.ten}
                </h2>
                {ph.giai && (
                  <div className="mt-4 rounded-2xl border border-solid border-primary/20 bg-primary-soft/50 p-4">
                    <p className="m-0 mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary"><Lightbulb size={14} /> {tr("Giải thích", "Explication", "Explanation")}</p>
                    <div className="leading-relaxed text-ink [&_h4]:m-0 [&_h4]:mt-3 [&_h4]:text-[13px] [&_h4]:font-extrabold [&_h4]:uppercase [&_h4]:tracking-wide [&_h4]:text-primary [&_h4:first-child]:mt-0 [&_p]:m-0 [&_p]:mt-1" dangerouslySetInnerHTML={{ __html: ph.giai }} />
                  </div>
                )}
                {ph.khoi.map((k, j) => <Khoi key={j} k={j === 0 && k.tieuDe === ph.ten ? { ...k, tieuDe: null } : k} />)}
              </article>
              {ph.cau.length > 0 && (
                <ThucHanh bai={bai} cau={ph.cau} tieuDe={`${tr("Luyện tập phần", "Exercices partie", "Practice part")} ${ph.chu}`}
                  onXong={(diem, tong) => setDaLam((x) => ({ ...x, [ph.chu]: { diem, tong } }))} />
              )}
            </div>
          ))}
          <div id="phan-on-tap" data-phan="on" className="mt-10 scroll-mt-16 lg:scroll-mt-4">
            <ThucHanh key={bai.ma} bai={bai} tieuDe={tr("Ôn tập cả bài", "Révision de la leçon", "Lesson review")} onXong={onGhi} />
          </div>
          {!congKhai && <LuyenThem bai={bai} />}
          {sau && (
            <Link to={`${goc}/${sau.ma}`} className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-primary-soft p-4 text-primary no-underline hover:opacity-90">
              <span><span className="block text-xs font-bold uppercase tracking-wide">{tr("Bài tiếp theo", "Leçon suivante", "Next lesson")}</span><span className="block font-extrabold">{sau.ten}</span></span>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* Khung trang công khai (16/10): khách chưa đăng nhập đọc được 2–3 bài đầu mỗi trình độ
 * (BAI_CONG_KHAI) ở /ngu-phap, ngoài vỏ app. Bài khác hiện khoá + nút đăng nhập. */
function KhungCongKhai({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="sticky top-0 z-20 border-0 border-b border-solid border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/gioi-thieu" className="flex items-center gap-2 text-lg font-extrabold text-primary no-underline"><Leon cam="dau" size={32} /> FRACILE</Link>
          <Link to="/ngu-phap" className="text-sm font-bold text-ink no-underline">{tr("Ngữ pháp tiếng Pháp", "Grammaire française", "French grammar")}</Link>
          <Link to="/login" className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary no-underline hover:opacity-90"><LogIn size={15} /> {tr("Đăng nhập", "Connexion", "Sign in")}</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
function BaiKhoa({ bai }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary"><Lock size={26} /></span>
      <h1 className="m-0 mt-4 text-2xl font-extrabold text-ink">{bai.cap} · {bai.ten}</h1>
      <p className="m-0 mt-2 text-sm text-soft">{tr(`Bài này dành cho tài khoản FRACILE. Đăng nhập miễn phí để học toàn bộ ${TAT_CA.length} bài, luyện tập và lưu tiến độ.`, `Cette leçon est réservée aux comptes FRACILE. Connectez-vous gratuitement pour accéder aux ${TAT_CA.length} leçons.`, `This lesson is for FRACILE accounts. Sign in for free to access all ${TAT_CA.length} lessons.`)}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/login" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary no-underline"><LogIn size={15} /> {tr("Đăng nhập", "Connexion", "Sign in")}</Link>
        <Link to="/ngu-phap" className="inline-flex items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink no-underline">{tr("Xem bài mở miễn phí", "Leçons gratuites", "Free lessons")}</Link>
      </div>
    </div>
  );
}

/* ─────────── Bài kiểm tra xếp trình độ (17/10) ───────────
 * 4 câu trắc nghiệm / đúng-sai ngẫu nhiên mỗi trình độ A1 → C1 (20 câu), lấy từ chính
 * ngân hàng câu luyện. Trình độ đầu tiên có dưới 3/4 câu đúng là nơi nên bắt đầu;
 * đúng hết thì gợi ý ôn C1. Kết quả lưu ở máy (localStorage) để trang chủ dùng khi
 * hồ sơ chưa có trình độ. Đây là GỢI Ý, không đổi trình độ trong hồ sơ. */
const CAP_XEP = ["A1", "A2", "B1", "B2", "C1"];
export const KHOA_XEP = "mcf-xep-trinh-do";
function XepTrinhDo({ goc }) {
  const de = useMemo(() => CAP_XEP.flatMap((c) => {
    const kho = TAT_CA.filter((b) => b.cap === c).flatMap((b) => chiaPhan(b).flatMap((p) => p.cau.map((q) => ({ ...q, __ma: q.__ma ?? b.ma }))))
      .filter((q) => q.loai === "qcm" || q.loai === "vf");
    return [...kho].sort(() => Math.random() - 0.5).slice(0, 4).map((q) => ({ ...q, __cap: c }));
  }), []);
  const [kq, setKq] = useState(null);
  const ketQua = (ds) => {
    const theoCap = CAP_XEP.map((c) => ({ c, dung: ds.filter((r) => r.ok && de[r.i].__cap === c).length, tong: de.filter((q) => q.__cap === c).length }));
    const yeu = theoCap.find((x) => x.dung < 3);
    const nen = yeu ? yeu.c : "C1";
    setKq({ theoCap, nen, vung: !yeu });
    try { localStorage.setItem(KHOA_XEP, JSON.stringify({ cap: nen, luc: Date.now() })); } catch { /* bỏ qua */ }
  };
  const dau = kq && TAT_CA.find((b) => b.cap === kq.nen);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <Link to={goc} className="inline-flex items-center gap-1.5 text-sm font-semibold text-soft no-underline hover:text-ink"><ArrowLeft size={15} /> {tr("Tất cả bài học", "Toutes les leçons", "All lessons")}</Link>
      <h1 className="m-0 mt-4 text-2xl font-extrabold text-ink">{tr("Kiểm tra xếp trình độ ngữ pháp", "Test de niveau en grammaire", "Grammar placement test")}</h1>
      <p className="m-0 mt-1 text-sm text-soft">{tr("20 câu, 4 câu mỗi trình độ từ A1 đến C1. Làm trong khoảng 10 phút. Kết quả chỉ là gợi ý nơi nên bắt đầu học.", "20 questions, 4 par niveau de A1 à C1, environ 10 minutes. Le résultat indique où commencer.", "20 questions, 4 per level from A1 to C1, about 10 minutes. The result suggests where to start.")}</p>
      {!kq ? (
        <ThucHanh cau={de} tieuDe={tr("Bài xếp trình độ", "Test de niveau", "Placement test")} onKetQua={ketQua} />
      ) : (
        <section className="mt-6 rounded-3xl bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="m-0 text-xs font-extrabold uppercase tracking-wider text-soft">{tr("Kết quả", "Résultat", "Result")}</p>
          <p className="m-0 mt-1 text-2xl font-extrabold text-ink">
            {kq.vung ? tr("Bạn đã vững đến C1. Hãy ôn các bài C1.", "Vous maîtrisez jusqu'au C1. Révisez le C1.", "You are solid up to C1. Review C1.") : tr(`Bạn nên bắt đầu ở trình độ ${kq.nen}`, `Commencez au niveau ${kq.nen}`, `Start at level ${kq.nen}`)}
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {kq.theoCap.map((x) => (
              <div key={x.c} className={`rounded-xl p-2 text-center ${x.c === kq.nen ? "bg-primary-soft" : "bg-surface2"}`}>
                <p className="m-0 text-xs font-extrabold text-ink">{x.c}</p>
                <p className={`m-0 text-lg font-extrabold tabular-nums ${x.dung >= 3 ? "text-ok" : "text-danger"}`}>{x.dung}/{x.tong}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {dau && <Link to={`${goc}/${dau.ma}`} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary no-underline">{tr("Học bài đầu tiên", "Première leçon", "First lesson")}: {dau.ten} <ArrowRight size={15} /></Link>}
            <Link to={goc} className="inline-flex items-center rounded-full border border-solid border-line bg-surface px-5 py-2.5 text-sm font-bold text-ink no-underline">{tr("Xem tất cả bài", "Toutes les leçons", "All lessons")}</Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default function NguPhap({ congKhai = false }) {
  const goc = congKhai ? "/ngu-phap" : "/etudiant/ngu-phap";
  const { ma } = useParams();
  const [ketQua, setKetQua] = useState({});
  /* Lớp đè giáo viên sửa (migration 166): nạp xong thì dựng lại bài bằng key. */
  const [pbSua, setPbSua] = useState(0);
  useEffect(() => { napSuaNguPhap(supabase).then(setPbSua); }, []);
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
  const moDuoc = (b) => !congKhai || BAI_CONG_KHAI.has(b.ma);
  /* SEO chỉ cho trang công khai (17/10). Nội dung tiếng Việt cho người Việt học
     tiếng Pháp, nên tiêu đề / mô tả viết tiếng Việt, kèm tên bài tiếng Pháp. */
  useSeo(!congKhai ? {} : bai ? {
    tieuDe: `${bai.ten} (${bai.tenFr}) · Ngữ pháp tiếng Pháp ${bai.cap} | FRACILE`,
    moTa: `${bai.tomTat} Bài học miễn phí có giải thích dễ hiểu, ví dụ và bài luyện chấm ngay.`,
    duongDan: `/ngu-phap/${bai.ma}`,
    jsonLd: moDuoc(bai) ? {
      "@context": "https://schema.org", "@type": "LearningResource",
      name: `${bai.ten} (${bai.tenFr})`, description: bai.tomTat, inLanguage: "vi",
      educationalLevel: bai.cap === "A0" ? "A1" : bai.cap, learningResourceType: "Lesson",
      teaches: bai.tenFr, isAccessibleForFree: true,
      url: `https://www.fracile.vn/ngu-phap/${bai.ma}`,
      provider: { "@type": "Organization", name: "FRACILE", url: "https://www.fracile.vn" },
    } : null,
  } : {
    tieuDe: "Ngữ pháp tiếng Pháp miễn phí từ A1 đến C1 | FRACILE",
    moTa: `Học ngữ pháp tiếng Pháp bằng tiếng Việt: ${TAT_CA.length} bài từ nhập môn đến C1, giải thích dễ hiểu, ví dụ, lỗi người Việt hay mắc và bài luyện chấm ngay. ${BAI_CONG_KHAI.size} bài học miễn phí không cần đăng nhập.`,
    duongDan: "/ngu-phap",
    jsonLd: {
      "@context": "https://schema.org", "@type": "Course",
      name: "Ngữ pháp tiếng Pháp từ A1 đến C1", inLanguage: "vi",
      description: `${TAT_CA.length} bài ngữ pháp tiếng Pháp giải thích bằng tiếng Việt, kèm bài luyện.`,
      provider: { "@type": "Organization", name: "FRACILE", url: "https://www.fracile.vn" },
      hasPart: TAT_CA.filter((b) => BAI_CONG_KHAI.has(b.ma)).map((b) => ({ "@type": "LearningResource", name: b.ten, url: `https://www.fracile.vn/ngu-phap/${b.ma}` })),
    },
  });
  /* Bài xếp trình độ (17/10): sau mọi hook để giữ thứ tự hook. */
  if (ma === "xep-trinh-do") return congKhai ? <KhungCongKhai><XepTrinhDo key={pbSua} goc={goc} /></KhungCongKhai> : <XepTrinhDo key={pbSua} goc={goc} />;
  if (ma && bai) {
    const trang = moDuoc(bai) ? <TrangBai key={pbSua} bai={bai} ketQua={ketQua[bai.ma]} onGhi={(d, t) => ghi(bai.ma, d, t)} goc={goc} congKhai={congKhai} /> : <BaiKhoa bai={bai} />;
    return congKhai ? <KhungCongKhai>{trang}</KhungCongKhai> : trang;
  }

  const daHoc = TAT_CA.filter((b) => ketQua[b.ma]).length;
  const danhSach = (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      {!congKhai && <HocTapTab />}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-primary to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
        <div className="relative flex items-center gap-4">
          <Leon cam="hoc" size={110} className="mcf-leon-bay shrink-0 max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><BookA size={14} /> {tr("Học trước, luyện sau", "Apprendre puis pratiquer", "Learn, then practise")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{tr("Học ngữ pháp", "Grammaire", "Grammar")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{tr("Mỗi bài: lý thuyết dễ hiểu, ví dụ, lỗi hay mắc và vài câu thực hành ngay bên dưới.", "Chaque leçon : explications claires, exemples, erreurs fréquentes et exercices.", "Each lesson: clear explanations, examples, common mistakes and quick practice.")}</p>
            {congKhai
              ? <p className="m-0 mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">{tr(`${BAI_CONG_KHAI.size} bài học miễn phí, không cần đăng nhập`, `${BAI_CONG_KHAI.size} leçons gratuites, sans compte`, `${BAI_CONG_KHAI.size} free lessons, no account needed`)}</p>
              : <p className="m-0 mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tabular-nums">{tr("Đã học", "Leçons faites", "Done")}: {daHoc}/{TAT_CA.length}</p>}
          </div>
        </div>
      </header>
      <Link to={`${goc}/xep-trinh-do`} className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-solid border-primary/30 bg-primary-soft p-4 text-primary no-underline hover:opacity-90">
        <span><span className="block font-extrabold">{tr("Chưa biết bắt đầu từ đâu?", "Vous ne savez pas par où commencer ?", "Not sure where to start?")}</span><span className="block text-sm">{tr("Làm bài kiểm tra xếp trình độ 20 câu.", "Faites le test de niveau (20 questions).", "Take the 20-question placement test.")}</span></span>
        <ArrowRight size={18} />
      </Link>
      {CAP.map((cap) => (
        <section key={cap} className="mt-8">
          <h2 className="m-0 mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <span className={`rounded-xl bg-gradient-to-br ${MAU_CAP[cap]} px-3 py-1 text-sm text-white`}>{tenCap(cap)}</span>
            {cap === "A0" && <span className="text-sm font-semibold text-soft">{tr("Bảng chữ cái, phát âm, quy tắc đọc", "Alphabet, sons, règles de lecture", "Alphabet, sounds, reading rules")}</span>}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TAT_CA.filter((b) => b.cap === cap).map((b, stt) => {
              const kq = ketQua[b.ma];
              const khoa = !moDuoc(b);
              return (
                <Link key={b.ma} to={`${goc}/${b.ma}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-solid border-line bg-surface p-4 no-underline transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                  <span className="flex items-start gap-2.5"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${MAU_CAP[b.cap]} text-sm font-extrabold tabular-nums text-white`}>{stt + 1}</span><span className="text-base font-extrabold text-ink">{b.ten}</span></span>
                  <span lang="fr" className="text-xs italic text-soft">{b.tenFr}</span>
                  <span className="line-clamp-2 text-sm text-soft">{b.tomTat}</span>
                  <span className="mt-auto flex items-center justify-between pt-1">
                    {khoa ? <span className="inline-flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft"><Lock size={11} /> {tr("Cần đăng nhập", "Compte requis", "Sign-in required")}</span>
                      : congKhai ? <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-extrabold text-ok">{tr("Miễn phí", "Gratuit", "Free")}</span>
                      : kq ? <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-extrabold text-ok"><Check size={12} /> {kq.diem}/{kq.tong}</span>
                      : <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] font-bold text-soft">{tr("Chưa học", "À découvrir", "Not started")}</span>}
                    <ArrowRight size={15} className="text-primary transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
  return congKhai ? <KhungCongKhai>{danhSach}</KhungCongKhai> : danhSach;
}
