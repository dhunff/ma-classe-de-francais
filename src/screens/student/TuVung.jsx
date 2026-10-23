import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, EyeOff, BookMarked, Check, Volume2 } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { docLoTrinh } from "../../shared/loTrinhStore.js";
import { themTu } from "../../shared/soTu.js";
import HocTapTab from "./HocTapTab.jsx";

/* « Từ vựng » trong mục Học tập (23/10, theo chủ dự án).
 *
 * Nguồn là kho từ của Lộ trình (lo_trinh_tu, 800 mục có loại từ, 16 chủ đề), không
 * dựng kho thứ hai: thêm từ ở Lộ trình là có ngay ở đây. Học theo chủ đề và theo
 * màn; « Che nghĩa » để tự kiểm tra (bấm từng thẻ để lật); nút đọc dùng giọng
 * tiếng Pháp của trình duyệt; nút sổ ghi từ vào Sổ từ (bảng so_tu, migration 151). */

const LOAI = () => ({ n: tr("danh từ", "nom", "noun"), v: tr("động từ", "verbe", "verb"), a: tr("tính từ", "adjectif", "adjective"), x: tr("cụm từ", "expression", "phrase") });

function docTo(chu) {
  try {
    const s = window.speechSynthesis; if (!s) return;
    s.cancel(); const u = new window.SpeechSynthesisUtterance(chu); u.lang = "fr-FR"; u.rate = 0.9; s.speak(u);
  } catch { /* trình duyệt không hỗ trợ: im lặng */ }
}

export default function TuVung() {
  const [lt, setLt] = useState(undefined);       // undefined = đang tải, null = lỗi
  const [cd, setCd] = useState(null);
  const [q, setQ] = useState("");
  const [che, setChe] = useState(false);
  const [lat, setLat] = useState({});
  const [daGhi, setDaGhi] = useState({});

  useEffect(() => { let con = true; docLoTrinh().then((d) => { if (con) { setLt(d); setCd(d?.chuDe?.[0]?.id ?? null); } }); return () => { con = false; }; }, []);

  const chuDe = lt?.chuDe ?? [];
  const dangXem = chuDe.find((c) => c.id === cd);
  const timKiem = q.trim().toLowerCase();
  const nhom = useMemo(() => {
    if (!lt) return [];
    if (timKiem) {
      const tu = lt.kho.filter((t) => t.matTruoc?.toLowerCase().includes(timKiem) || t.matSau?.toLowerCase().includes(timKiem)).slice(0, 120);
      return [{ id: "tim", ten: tr(`${tu.length} kết quả`, `${tu.length} résultat(s)`, `${tu.length} result(s)`), tu }];
    }
    return (dangXem?.man ?? []).filter((m) => m.tu.length).map((m) => ({ id: m.id, ten: m.ten, cap: m.cap, tu: m.tu }));
  }, [lt, timKiem, dangXem]);

  const ghiSo = async (t) => {
    if (daGhi[t.id]) return;
    const d = await themTu({ tu: t.matTruoc, nghia: t.matSau, tenBai: tr("Từ vựng", "Vocabulaire", "Vocabulary") + (dangXem ? `: ${dangXem.tenVi}` : "") });
    if (d) setDaGhi((x) => ({ ...x, [t.id]: true }));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6">
      <HocTapTab />

      <div className="mb-5 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white shadow-[0_14px_34px_rgba(79,70,229,0.3)]">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight">{tr("Từ vựng theo chủ đề", "Vocabulaire par thème", "Vocabulary by topic")}</h1>
        <p className="m-0 mt-1 text-sm text-white/85">
          {lt ? tr(`${lt.kho.length} từ · ${chuDe.length} chủ đề, cùng kho với Lộ trình`, `${lt.kho.length} mots · ${chuDe.length} thèmes, les mêmes que le Parcours`, `${lt.kho.length} words · ${chuDe.length} topics, shared with the Path`) : " "}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2">
            <Search size={16} className="shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Tìm từ tiếng Pháp hoặc tiếng Việt…", "Chercher un mot…", "Search a word…")}
              className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-white outline-none placeholder:text-white/70" />
          </label>
          <button type="button" onClick={() => { setChe((x) => !x); setLat({}); }} aria-pressed={che}
            className={"inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 px-3 py-2 font-sans text-sm font-bold " + (che ? "bg-white text-indigo-700" : "bg-white/15 text-white hover:bg-white/25")}>
            {che ? <EyeOff size={16} /> : <Eye size={16} />} {tr("Che nghĩa", "Cacher le sens", "Hide meanings")}
          </button>
        </div>
      </div>

      {lt === undefined && <p className="text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>}
      {lt === null && <p className="text-sm font-semibold text-danger">{tr("Không đọc được kho từ vựng. Tải lại trang thử nhé.", "Impossible de charger le vocabulaire.", "Could not load the vocabulary.")}</p>}

      {lt && !timKiem && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {chuDe.map((c) => (
            <button key={c.id} type="button" onClick={() => { setCd(c.id); setLat({}); }}
              className={"shrink-0 cursor-pointer rounded-full border border-solid px-4 py-2 font-sans text-sm font-bold transition-colors "
                + (c.id === cd ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-ink hover:bg-surface2")}>
              {c.tenVi}
            </button>
          ))}
        </div>
      )}

      {lt && nhom.length === 0 && <p className="text-sm text-soft">{tr("Không có từ nào.", "Aucun mot.", "No words.")}</p>}

      <div className="grid gap-6">
        {nhom.map((m) => (
          <section key={m.id}>
            <h2 className="m-0 mb-3 flex items-center gap-2 text-base font-extrabold text-ink">
              {m.ten}
              {m.cap && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary">{m.cap}</span>}
              <span className="text-xs font-semibold text-soft">· {m.tu.length} {tr("từ", "mots", "words")}</span>
            </h2>
            <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {m.tu.map((t) => {
                const an = che && !lat[t.id];
                return (
                  <li key={t.id} className="flex items-center gap-2 rounded-2xl border border-solid border-line bg-surface px-3 py-2.5 shadow-sm">
                    <button type="button" onClick={() => che && setLat((x) => ({ ...x, [t.id]: !x[t.id] }))}
                      className={"min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-sans " + (che ? "cursor-pointer" : "cursor-default")}>
                      <span lang="fr" className="block break-words text-[15px] font-bold text-ink">{t.matTruoc}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm">
                        {t.loai && LOAI()[t.loai] && <span className="rounded-md bg-surface2 px-1.5 text-[10px] font-bold uppercase text-soft">{LOAI()[t.loai]}</span>}
                        <span className={an ? "select-none rounded bg-surface2 text-transparent" : "text-soft"}>{t.matSau}</span>
                      </span>
                    </button>
                    <button type="button" onClick={() => docTo(t.matTruoc)} title={tr("Nghe đọc", "Écouter", "Listen")}
                      className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-primary"><Volume2 size={15} /></button>
                    <button type="button" onClick={() => ghiSo(t)} title={daGhi[t.id] ? tr("Đã ghi vào sổ từ", "Ajouté au carnet", "Added") : tr("Ghi vào sổ từ", "Ajouter au carnet", "Add to word list")}
                      className={"grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 " + (daGhi[t.id] ? "bg-ok-soft text-ok" : "bg-surface2 text-soft hover:text-primary")}>
                      {daGhi[t.id] ? <Check size={15} /> : <BookMarked size={15} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
