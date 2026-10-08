import React, { useEffect, useMemo, useState } from "react";
import { Anchor, AlertTriangle, Check, Trash2, ArrowLeft, RefreshCw, Search, Target, Eye } from "lucide-react";
import { loadPractice, loadAssignments } from "../../shared/exerciseStore.js";
import { docNeo, luuNeo, quenNeo } from "../../shared/neoStore.js";
import { chuThuan, kiemNeo } from "../../shared/neoNguLieu.js";
import NeoNguLieu from "../student/NeoNguLieu.jsx";
import ChonDoanVan from "./ChonDoanVan.jsx";
import { tr } from "../../shared/i18n.jsx";

/* Đặt neo — màn của giáo viên. Làm lại giao diện 07/10.
 *
 *   Danh sách: lưới bài có ngữ liệu, tìm theo tên, lọc theo trình độ.
 *   Soạn: ba cột. Trái: danh sách câu (đã neo / chưa). Giữa: đoạn văn để BÔI
 *   ĐEN, kèm thanh hành động ngay dưới. Phải: neo hiện tại + bẫy + xem trước.
 *
 * Giữ nguyên ba nguyên tắc của bản cũ:
 *   · BÔI ĐEN, KHÔNG GÕ LẠI: neo lưu đoạn trích nguyên văn, gõ lại là mời lỗi
 *     chính tả vào đúng chỗ không chịu được lỗi chính tả.
 *   · KIỂM TRƯỚC KHI LƯU: `kiemNeo` chạy ngay lúc chọn, neo hỏng thì khoá Lưu.
 *   · XEM TRƯỚC BẰNG ĐÚNG `NeoNguLieu` học sinh thấy, không dựng bản gần giống.
 */

const nutChinh = "inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";
const nutPhu = "inline-flex cursor-pointer items-center gap-2 rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-semibold text-ink hover:border-primary disabled:cursor-not-allowed disabled:opacity-50";
const nhan = "m-0 text-xs font-bold uppercase tracking-wide text-soft";

function SoanNeo({ bai, cau, so, neoCu, onXong }) {
  const [neo, setNeo] = useState(neoCu ?? { trich: "", pieges: [] });
  const [dangChon, setDangChon] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [tin, setTin] = useState("");
  const [loi, setLoi] = useState("");
  const van = useMemo(() => chuThuan(bai.readingText), [bai.readingText]);
  const tinh = useMemo(() => kiemNeo(van, neo), [van, neo]);
  const luuDuoc = !!neo.trich && tinh.ok;
  const chon = dangChon.trim();

  const datChinh = () => { if (chon) { setNeo((p) => ({ ...p, trich: chon })); setTin(""); setLoi(""); } };
  const themBay = (option) => {
    if (!chon) return;
    setNeo((p) => ({ ...p, pieges: [...(p.pieges ?? []).filter((b) => b.option !== option), { option, trich: chon, vi_sao: "" }] }));
  };
  const suaViSao = (option, chu) => setNeo((p) => ({ ...p, pieges: (p.pieges ?? []).map((b) => (b.option === option ? { ...b, vi_sao: chu } : b)) }));
  const boBay = (option) => setNeo((p) => ({ ...p, pieges: (p.pieges ?? []).filter((b) => b.option !== option) }));

  const luu = async (xoa = false) => {
    setDangLuu(true); setLoi(""); setTin("");
    const kq = await luuNeo(cau.id, xoa ? null : neo);
    setDangLuu(false);
    /* Đọc kết quả TRƯỚC khi báo xong (biên nhận 092). */
    if (!kq.ok) {
      setLoi(kq.loi === "khong_phai_giao_vien" ? tr("Tài khoản này không có quyền đặt neo.", "Ce compte ne peut pas placer de repères.", "This account can't set anchors.")
        : kq.loi === "khong_xac_nhan" ? tr("Chưa lưu được: ", "Non enregistré : ", "Not saved: ") + kq.chiTiet
          : tr("Không lưu được. Kiểm tra mạng rồi thử lại.", "Enregistrement impossible. Vérifiez la connexion.", "Couldn't save. Check your connection."));
      return;
    }
    quenNeo(bai.id);
    if (xoa) setNeo({ trich: "", pieges: [] });
    setTin(xoa ? tr("Đã gỡ neo khỏi câu này.", "Repère retiré de cette question.", "Anchor removed from this question.") : tr("Đã lưu neo.", "Repère enregistré.", "Anchor saved."));
    onXong(cau.id, xoa ? null : neo);
  };

  return (
    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[1fr_380px]">
      {/* ── Giữa: câu hỏi + đoạn văn ── */}
      <div className="min-w-0">
        <div className="rounded-2xl bg-surface2 p-4">
          <p className={nhan}>{tr("Câu", "Question", "Question")} {so}</p>
          <p className="m-0 mt-1 text-base font-bold leading-snug text-ink">{cau.prompt}</p>
          {(cau.options ?? []).length > 0 && (
            <ol className="m-0 mt-2 grid list-none gap-1 p-0 text-sm text-ink">
              {cau.options.map((o, j) => <li key={j}><strong className="mr-1.5 text-soft">{String.fromCharCode(65 + j)}.</strong>{o}</li>)}
            </ol>
          )}
        </div>
        <p className={`${nhan} mt-4`}>{tr("Bôi đen một đoạn trong bài", "Surlignez un passage du texte", "Highlight a passage in the text")}</p>
        <div className="mt-2"><ChonDoanVan vanBan={bai.readingText} onChon={setDangChon} /></div>

        {/* Thanh hành động gắn ngay dưới đoạn văn: chọn xong là bấm, không phải đi tìm nút. */}
        <div className="sticky bottom-0 mt-3 rounded-2xl border border-solid border-line bg-surface/95 p-3 shadow-sm backdrop-blur">
          <p className="m-0 text-xs leading-relaxed text-ink">
            {chon ? <>{tr("Đang chọn:", "Sélection :", "Selected:")} <em>« {chon.slice(0, 140)}{chon.length > 140 ? "…" : ""} »</em></>
              : <span className="text-soft">{tr("Chưa chọn đoạn nào. Bôi đen bằng chuột hoặc bàn phím.", "Aucune sélection. Surlignez à la souris ou au clavier.", "Nothing selected. Highlight with mouse or keyboard.")}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={datChinh} disabled={!chon} className={nutChinh}><Target size={14} /> {tr("Đoạn chứa đáp án", "Passage de la réponse", "Answer passage")}</button>
            {(cau.options ?? []).map((o, j) => (
              <button key={j} type="button" onClick={() => themBay(j)} disabled={!chon} className={nutPhu}>
                {tr("Bẫy", "Piège", "Trap")} {String.fromCharCode(65 + j)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Phải: neo hiện tại ── */}
      <aside className="grid gap-4 xl:sticky xl:top-4">
        <section className="rounded-3xl border border-solid border-line bg-surface p-5">
          <p className={nhan}>{tr("Đoạn chứa đáp án", "Passage de la réponse", "Answer passage")}</p>
          <p className="m-0 mt-1.5 text-sm leading-relaxed text-ink">
            {neo.trich ? <span className="rounded bg-ok-soft px-1">« {neo.trich} »</span> : <span className="text-soft">{tr("Chưa đặt.", "Non défini.", "Not set.")}</span>}
          </p>
          {neo.trich && !tinh.ok && (
            <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-semibold text-ink">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-danger" />
              {tr("Đoạn đã chọn không tìm thấy trong bài. Bôi đen lại trực tiếp trên đoạn văn.", "Passage introuvable dans le texte. Surlignez-le directement dans le texte.", "Passage not found in the text. Highlight it directly in the text.")}
            </p>
          )}

          <p className={`${nhan} mt-5`}>{tr("Bẫy (", "Pièges (", "Traps (")}{(neo.pieges ?? []).length})</p>
          {(neo.pieges ?? []).length === 0 && <p className="m-0 mt-1.5 text-xs text-soft">{tr("Chưa có bẫy. Bôi đen đoạn đã dụ học sinh chọn sai rồi bấm « Bẫy A/B/C ».", "Aucun piège. Surlignez le passage trompeur puis cliquez « Piège A/B/C ».", "No traps. Highlight the misleading passage then click « Trap A/B/C ».")}</p>}
          {(neo.pieges ?? []).map((b) => (
            <div key={b.option} className="mt-2 rounded-xl bg-surface2 p-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-warn-soft px-2 py-0.5 text-xs font-bold text-warn">{String.fromCharCode(65 + b.option)}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-soft">{cau.options?.[b.option]}</span>
                <button type="button" onClick={() => boBay(b.option)} aria-label={tr("Gỡ bẫy này", "Retirer ce piège", "Remove this trap")} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-surface text-danger"><Trash2 size={12} /></button>
              </div>
              <p className="m-0 mt-1.5 text-xs italic leading-relaxed text-ink">« {b.trich} »</p>
              {/* Câu « vì sao hấp dẫn » mới là thứ dạy được; tô màu một mình không giải thích gì. */}
              <input value={b.vi_sao ?? ""} onChange={(e) => suaViSao(b.option, e.target.value)}
                placeholder={tr("Vì sao đáp án này hấp dẫn nhưng sai?", "Pourquoi cette réponse est tentante mais fausse ?", "Why is this answer tempting but wrong?")}
                className="mt-2 w-full rounded-lg border border-solid border-line bg-surface px-2.5 py-1.5 font-sans text-xs text-ink outline-none focus:border-primary" />
            </div>
          ))}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => luu(false)} disabled={dangLuu || !luuDuoc} className={nutChinh}>
              <Check size={14} /> {dangLuu ? tr("Đang lưu…", "Enregistrement…", "Saving…") : tr("Lưu neo", "Enregistrer le repère", "Save anchor")}
            </button>
            {neoCu && (
              <button type="button" onClick={() => luu(true)} disabled={dangLuu} className={`${nutPhu} text-danger`}>{tr("Gỡ neo", "Retirer le repère", "Remove anchor")}</button>
            )}
          </div>
          {tin && <p role="status" className="m-0 mt-3 inline-flex items-center gap-2 text-sm font-bold text-ok"><Check size={14} /> {tin}</p>}
          {loi && <p className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}
        </section>

        {neo.trich && tinh.ok && (
          <section className="rounded-3xl border border-solid border-line bg-surface p-5">
            <p className={`${nhan} flex items-center gap-1.5`}><Eye size={13} /> {tr("Học sinh sẽ thấy", "Ce que verra l'élève", "What students will see")}</p>
            <p className="m-0 mt-1 text-xs text-soft">{tr("Khi học sinh chọn bẫy đầu tiên.", "Quand l'élève choisit le premier piège.", "When a student picks the first trap.")}</p>
            <div className="mcf-scroll mt-3 max-h-80 overflow-y-auto">
              <NeoNguLieu vanBan={bai.readingText} evidence={neo} chonSai={neo.pieges?.[0]?.option ?? null} />
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

export default function DatNeo() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [baiId, setBaiId] = useState(null);
  const [neoTheoCau, setNeoTheoCau] = useState({});
  const [cauId, setCauId] = useState(null);
  const [tim, setTim] = useState("");
  const [cap, setCap] = useState("tat");

  const tai = async () => {
    setDs(undefined);
    try {
      const [a, b] = await Promise.all([loadPractice(), loadAssignments()]);
      /* Chỉ bài CÓ ngữ liệu: bài không có đoạn văn thì không có gì để neo vào. */
      setDs([...(a ?? []), ...(b ?? [])].filter((x) => String(x.readingText ?? "").trim()));
    } catch { setDs(null); }
  };
  useEffect(() => { tai(); }, []);

  const bai = useMemo(() => (ds ?? []).find((x) => x.id === baiId) ?? null, [ds, baiId]);
  useEffect(() => {
    if (!bai) return;
    let con = true;
    docNeo(bai.id).then((n) => { if (con) setNeoTheoCau(n ?? {}); });
    return () => { con = false; };
  }, [bai]);
  const dsCau = bai?.questions ?? [];
  const cau = dsCau.find((q) => q.id === cauId) ?? null;

  const capDo = useMemo(() => [...new Set((ds ?? []).map((x) => x.level).filter(Boolean))].sort(), [ds]);
  const loc = useMemo(() => {
    const k = tim.trim().toLowerCase();
    return (ds ?? []).filter((x) => (cap === "tat" || x.level === cap) && (!k || String(x.title).toLowerCase().includes(k)));
  }, [ds, tim, cap]);

  if (ds === undefined) return <p className="mt-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>;
  if (ds === null) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Không đọc được thư viện", "Impossible de charger la bibliothèque", "Couldn't load the library")}</p>
          <p className="m-0 mt-1 text-sm text-ink">{tr("Kiểm tra kết nối, và chắc chắn tài khoản này có vai giáo viên.", "Vérifiez la connexion et que ce compte est enseignant.", "Check the connection and that this account is a teacher.")}</p>
        </div>
      </div>
    );
  }

  /* ── Đang soạn một bài ── */
  if (bai) {
    const daNeo = dsCau.filter((q) => neoTheoCau[q.id]).length;
    return (
      <div className="mx-auto max-w-[1400px] py-6">
        <button type="button" onClick={() => { setBaiId(null); setCauId(null); }} className={nutPhu}>
          <ArrowLeft size={14} /> {tr("Tất cả bài có ngữ liệu", "Tous les exercices avec texte", "All exercises with a text")}
        </button>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{bai.title}</h1>
            <p className="m-0 mt-1 text-sm text-soft">{tr("Chọn một câu, bôi đen đoạn chứa đáp án, thêm bẫy nếu cần, rồi lưu.", "Choisissez une question, surlignez la réponse, ajoutez des pièges si besoin, puis enregistrez.", "Pick a question, highlight the answer, add traps if needed, then save.")}</p>
          </div>
          <span className="rounded-full bg-ok-soft px-3 py-1 text-sm font-bold text-ok">{daNeo}/{dsCau.length} {tr("câu đã neo", "questions repérées", "questions anchored")}</span>
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[220px_1fr]">
          <nav aria-label={tr("Câu hỏi", "Questions", "Questions")} className="grid gap-1.5 lg:sticky lg:top-4">
            {dsCau.map((q, i) => {
              const dang = cauId === q.id;
              return (
                <button key={q.id} type="button" onClick={() => setCauId(q.id)}
                  className={`flex cursor-pointer items-start gap-2 rounded-xl border border-solid px-3 py-2 text-left font-sans ${dang ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary"}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${neoTheoCau[q.id] ? "bg-ok text-white" : "bg-surface2 text-soft"}`}>
                    {neoTheoCau[q.id] ? <Anchor size={11} /> : i + 1}
                  </span>
                  <span className="line-clamp-2 min-w-0 text-xs leading-snug text-ink">{q.prompt}</span>
                </button>
              );
            })}
          </nav>
          {cau ? (
            <SoanNeo key={cau.id} bai={bai} cau={cau} so={dsCau.indexOf(cau) + 1} neoCu={neoTheoCau[cau.id] ?? null}
              onXong={(id, n) => setNeoTheoCau((p) => ({ ...p, [id]: n }))} />
          ) : (
            <div className="rounded-3xl border border-dashed border-line p-10 text-center">
              <Anchor size={22} className="mx-auto text-soft" />
              <p className="m-0 mt-2 font-bold text-ink">{tr("Chọn một câu ở cột trái để bắt đầu", "Choisissez une question à gauche", "Pick a question on the left to start")}</p>
              <p className="m-0 mt-1 text-sm text-soft">{tr("Câu đã có neo mang dấu neo xanh.", "Les questions repérées portent une ancre verte.", "Anchored questions show a green anchor.")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Danh sách bài ── */
  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{tr("Neo ngữ liệu", "Repères dans le texte", "Text anchors")}</h1>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Chỉ ra chỗ trong bài chứa câu trả lời, và chỗ đã dụ học sinh chọn sai.", "Montrez où se trouve la réponse et ce qui a induit l'élève en erreur.", "Show where the answer is and what misled the student.")}</p>
        </div>
        <button type="button" onClick={tai} className={nutPhu}><RefreshCw size={14} /> {tr("Tải lại", "Recharger", "Reload")}</button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
          <input value={tim} onChange={(e) => setTim(e.target.value)} placeholder="Tìm bài…"
            className="w-full rounded-full border border-solid border-line bg-surface py-2 pl-9 pr-4 font-sans text-sm text-ink outline-none focus:border-primary" />
        </div>
        {["tat", ...capDo].map((c) => (
          <button key={c} type="button" onClick={() => setCap(c)} aria-pressed={cap === c}
            className={`cursor-pointer rounded-full border border-solid px-4 py-1.5 font-sans text-sm font-bold ${cap === c ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-primary"}`}>
            {c === "tat" ? tr("Tất cả", "Tous", "All") : c}
          </button>
        ))}
      </div>

      {loc.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-10 text-center">
          <p className="m-0 font-bold text-ink">{ds.length ? tr("Không có bài nào khớp", "Aucun exercice ne correspond", "No matching exercises") : tr("Chưa có bài nào có ngữ liệu", "Aucun exercice avec texte", "No exercises with a text yet")}</p>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Neo chỉ đặt được cho bài có đoạn văn.", "Les repères ne s'appliquent qu'aux exercices avec un texte.", "Anchors only apply to exercises with a text.")}</p>
        </div>
      ) : (
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {loc.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => { setBaiId(x.id); setCauId(null); }}
                className="flex h-full w-full cursor-pointer flex-col rounded-3xl border border-solid border-line bg-surface p-5 text-left font-sans transition-shadow hover:shadow-md">
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{x.level}</span>
                  <span className="text-xs text-soft">{(x.questions ?? []).length} {tr("câu", "questions", "questions")}</span>
                </span>
                <span className="mt-3 block text-base font-extrabold leading-snug text-ink">{x.title}</span>
                <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-soft">{chuThuan(x.readingText).slice(0, 160)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
