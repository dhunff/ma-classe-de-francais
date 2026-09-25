import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, User, Loader2 } from "lucide-react";
import { useGlobalSearch } from "../shared/timKiem.js";

/* Ô tìm kiếm ở thanh trên + danh sách kết quả thả xuống (25/09).
 *
 * Bấm một bài → mở thẳng bài đó ở màn Luyện tập (state `moBai`).
 * Bấm một học sinh (chỉ giáo viên thấy) → mở hồ sơ ở Theo dõi học sinh
 * (state `moHocSinh`). Khách chưa đăng nhập: ô vẫn hiện nhưng không gọi máy
 * chủ — RPC chỉ cấp cho `authenticated`. */
export default function SearchBox({ session, query, onQuery, t }) {
  const nav = useNavigate();
  const [mo, setMo] = useState(false);
  const [chon, setChon] = useState(-1);
  const goc = useRef(null);
  const gv = session?.role === "prof";
  const { data, isLoading, error } = useGlobalSearch(query, { bat: !!session });

  const ds = [
    ...data.exercises.map((x) => ({ ...x, loai: "bai" })),
    ...data.students.map((x) => ({ ...x, loai: "hs" })),
  ];
  const coTu = (query || "").trim().length >= 2;

  useEffect(() => { setChon(-1); }, [query]);
  useEffect(() => {
    const ngoai = (e) => { if (goc.current && !goc.current.contains(e.target)) setMo(false); };
    document.addEventListener("mousedown", ngoai);
    return () => document.removeEventListener("mousedown", ngoai);
  }, []);

  const moKetQua = (x) => {
    setMo(false); onQuery("");
    if (x.loai === "hs") nav("/professeur/eleves", { state: { moHocSinh: x.name } });
    else nav(gv ? "/professeur/entrainement" : "/etudiant/entrainement", { state: { moBai: x.id } });
  };

  const phim = (e) => {
    if (!ds.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setMo(true); setChon((i) => (i + 1) % ds.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setChon((i) => (i <= 0 ? ds.length - 1 : i - 1)); }
    else if (e.key === "Enter" && chon >= 0) { e.preventDefault(); moKetQua(ds[chon]); }
    else if (e.key === "Escape") setMo(false);
  };

  const Nhom = ({ ten, loai }) => {
    const muc = ds.map((x, i) => ({ x, i })).filter(({ x }) => x.loai === loai);
    if (!muc.length) return null;
    return (
      <div className="py-1">
        <p className="m-0 px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-soft">{ten}</p>
        {muc.map(({ x, i }) => (
          <button key={x.loai + x.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => moKetQua(x)}
            onMouseEnter={() => setChon(i)}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border-0 px-3 py-2 text-left font-sans ${chon === i ? "bg-surface2" : "bg-transparent"}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              {x.loai === "hs" ? <User size={15} /> : <BookOpen size={15} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{x.loai === "hs" ? x.name : x.title}</span>
              <span className="block truncate text-xs text-soft">
                {x.loai === "hs" ? x.email : [x.level, gv && x.store === "assignment" ? t("nav.todo") : null].filter(Boolean).join(" · ")}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={goc} className="relative hidden lg:block">
      <label className="relative flex items-center">
        <Search size={16} className="pointer-events-none absolute left-3 text-soft" />
        <span className="sr-only">{t("header.search")}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => { onQuery(e.target.value); setMo(true); }}
          onFocus={() => setMo(true)}
          onKeyDown={phim}
          placeholder={t("header.search")}
          role="combobox" aria-expanded={mo && coTu} aria-autocomplete="list"
          className="h-10 w-56 rounded-md border border-solid border-line bg-surface2 pl-9 pr-9 font-sans text-sm text-ink transition-colors placeholder:text-soft focus:border-primary focus:outline-none xl:w-72"
        />
        {isLoading && <Loader2 size={15} className="absolute right-3 animate-spin text-soft" />}
      </label>

      {mo && coTu && (
        <div role="listbox"
          className="absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-solid border-line bg-surface p-1.5 shadow-[0_20px_50px_rgb(0,0,0,0.22)] xl:w-96">
          {!session ? (
            <p className="m-0 px-3 py-3 text-sm text-soft">{t("search.need_login")}</p>
          ) : error ? (
            <p className="m-0 px-3 py-3 text-sm text-danger">{t("search.error")}</p>
          ) : !ds.length ? (
            <p className="m-0 px-3 py-3 text-sm text-soft">{isLoading ? t("loading") : t("search.empty")}</p>
          ) : (
            <>
              <Nhom ten={t("search.exercises")} loai="bai" />
              <Nhom ten={t("search.students")} loai="hs" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
