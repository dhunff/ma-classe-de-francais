import React, { useState } from "react";
import { Volume2, BookMarked, Check, ChevronDown } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { themTu } from "../../shared/soTu.js";

/* Nội dung hai cửa sổ « Từ vựng » và « Giải thích và mẹo » của bài luyện tập
 * (làm lại 23/10, theo chủ dự án: trước là một khối chữ trơn, đơn điệu, khó đọc).
 *
 * Dữ liệu vẫn là chuỗi giáo viên soạn (meta.vocabulaire / meta.explications),
 * mỗi ý một dòng bắt đầu bằng « • ». Không đổi cách lưu: chỉ tách lúc HIỆN.
 * Dòng nào không đúng khuôn thì hiện nguyên văn, không bỏ. */

const dong = (s) => String(s ?? "").split(/\r?\n/).map((x) => x.replace(/^\s*[•\-–]\s*/, "").trim()).filter(Boolean);

/* « le changement climatique (nom masculin) : biến đổi khí hậu » */
function tachTu(d) {
  const m = d.match(/^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/) || d.match(/^(.+?)\s+:\s+(.+)$/);
  if (!m) return null;
  return m.length === 4 ? { fr: m[1], loai: m[2], vi: m[3] } : { fr: m[1], loai: "", vi: m[2] };
}

function docTo(chu) {
  try { const s = window.speechSynthesis; if (!s) return; s.cancel(); const u = new window.SpeechSynthesisUtterance(chu); u.lang = "fr-FR"; u.rate = 0.9; s.speak(u); } catch { /* không hỗ trợ */ }
}

function nhanLoai(loai) {
  const l = loai.toLowerCase();
  if (l.includes("féminin")) return { chu: tr("danh từ · cái", "nom fém.", "noun · f."), cls: "bg-danger-soft text-danger" };
  if (l.includes("masculin")) return { chu: tr("danh từ · đực", "nom masc.", "noun · m."), cls: "bg-primary-soft text-primary" };
  if (l.startsWith("verbe")) return { chu: tr("động từ", "verbe", "verb"), cls: "bg-ok-soft text-ok" };
  if (l.startsWith("adj")) return { chu: tr("tính từ", "adjectif", "adjective"), cls: "bg-warn-soft text-warn" };
  return { chu: loai, cls: "bg-surface2 text-soft" };
}

export function TuVungBai({ noiDung, ex }) {
  const [daGhi, setDaGhi] = useState({});
  const ds = dong(noiDung);
  return (
    <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
      {ds.map((d, i) => {
        const t = tachTu(d);
        if (!t) return <li key={i} className="rounded-2xl bg-surface2 px-4 py-3 text-sm text-ink sm:col-span-2">{d}</li>;
        const nl = t.loai ? nhanLoai(t.loai) : null;
        return (
          <li key={i} className="flex items-start gap-2 rounded-2xl border border-solid border-line bg-surface px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <p lang="fr" className="m-0 break-words text-[15px] font-extrabold leading-snug text-ink">{t.fr}</p>
              <p className="m-0 mt-1 flex flex-wrap items-center gap-1.5 text-sm text-soft">
                {nl && <span className={`rounded-md px-1.5 py-px text-[10px] font-bold uppercase ${nl.cls}`}>{nl.chu}</span>}
                <span className="break-words">{t.vi}</span>
              </p>
            </div>
            <button type="button" onClick={() => docTo(t.fr)} title={tr("Nghe đọc", "Écouter", "Listen")}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-primary"><Volume2 size={15} /></button>
            <button type="button" title={daGhi[i] ? tr("Đã ghi vào sổ từ", "Ajouté au carnet", "Added") : tr("Ghi vào sổ từ", "Ajouter au carnet", "Add to word list")}
              onClick={async () => { if (daGhi[i]) return; if (await themTu({ exerciseId: ex.id, tenBai: ex.title, tu: t.fr, nghia: t.vi })) setDaGhi((x) => ({ ...x, [i]: true })); }}
              className={"grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 " + (daGhi[i] ? "bg-ok-soft text-ok" : "bg-surface2 text-soft hover:text-primary")}>
              {daGhi[i] ? <Check size={15} /> : <BookMarked size={15} />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* Tô « … » thành chip tiếng Pháp. */
function chip(van) {
  return String(van).split(/(«[^»]+»)/g).map((p, i) => p.startsWith("«")
    ? <span key={i} lang="fr" className="mx-0.5 rounded-md bg-primary-soft px-1.5 py-px font-semibold text-primary">{p.slice(1, -1).trim()}</span>
    : p);
}

/* Cô đọng: mỗi mẹo hiện CÂU ĐẦU (ý chính); phần còn lại gập lại, bấm mới mở. */
export function GiaiThichBai({ noiDung }) {
  const [mo, setMo] = useState({});
  const ds = dong(noiDung);
  return (
    <ol className="m-0 grid list-none gap-2.5 p-0">
      {ds.map((d, i) => {
        const cat = d.search(/[.!?](\s|$)/);
        const chinh = cat > 0 ? d.slice(0, cat + 1) : d;
        const them = cat > 0 ? d.slice(cat + 1).trim() : "";
        return (
          <li key={i} className="flex gap-3 rounded-2xl bg-surface2 px-4 py-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-extrabold text-white">{i + 1}</span>
            <div className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-ink">
              <p className="m-0 font-semibold">{chip(chinh)}</p>
              {them && (mo[i]
                ? <p className="m-0 mt-1 text-soft">{chip(them)}</p>
                : <button type="button" onClick={() => setMo((x) => ({ ...x, [i]: true }))}
                    className="mt-1 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-sans text-xs font-bold text-primary">
                    {tr("Chi tiết", "Détails", "Details")} <ChevronDown size={13} />
                  </button>)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
