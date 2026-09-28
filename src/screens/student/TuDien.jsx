import React, { useEffect, useMemo, useState } from "react";
import { Search, BookA } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { useT } from "../../shared/i18n.jsx";

/* Từ điển Pháp–Việt tra nhanh (29/09).
 *
 * NGUỒN DUY NHẤT là thẻ trong các bộ flashcard giáo viên đã công khai
 * (the_bo_the, RLS lọc bộ nháp). Không nhúng từ điển ngoài, không sinh nghĩa
 * bằng AI: mỗi mục ở đây đều do một người soạn và duyệt. Hệ quả: từ điển NHỎ
 * (bằng số thẻ), và trang nói thẳng con số đó thay vì giả làm từ điển đầy đủ.
 *
 * Tra hai chiều, bỏ dấu khi so (gõ « deja » vẫn ra « déjà », gõ « chinh vi
 * vay » vẫn ra « chính vì vậy ») — người gõ trên bàn phím không có dấu Pháp
 * là người dùng chính của trang này.
 */

const boDau = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();

export default function TuDien() {
  const t = useT();
  const [muc, setMuc] = useState(null);   // null = đang tải, false = lỗi
  const [q, setQ] = useState("");

  useEffect(() => {
    let huy = false;
    supabase.from("the_bo_the")
      .select("id, mat_truoc, mat_sau, phien_am, vi_du, the_bo!inner(ten, ky_nang)")
      .order("mat_truoc")
      .then(({ data, error }) => {
        if (huy) return;
        if (error) { setMuc(false); return; }
        setMuc((data ?? []).map((x) => ({
          id: x.id, fr: x.mat_truoc, vi: x.mat_sau, phienAm: x.phien_am, viDu: x.vi_du,
          bo: x.the_bo?.ten, kyNang: x.the_bo?.ky_nang,
          khoa: boDau(x.mat_truoc) + " " + boDau(x.mat_sau),
        })));
      });
    return () => { huy = true; };
  }, []);

  const ketQua = useMemo(() => {
    if (!Array.isArray(muc)) return [];
    const k = boDau(q);
    if (!k) return muc;
    /* Khớp ở đầu cụm tiếng Pháp xếp trước — tra « à » thì « à mon avis » lên
       trên « c'est à dire ». */
    return muc.filter((m) => m.khoa.includes(k))
      .sort((a, b) => Number(!boDau(a.fr).startsWith(k)) - Number(!boDau(b.fr).startsWith(k)));
  }, [muc, q]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-5">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t("nav.dict")}</h1>
        <p className="m-0 mt-1 text-sm text-soft">
          {Array.isArray(muc) ? t("dict.subtitle", { n: muc.length }) : t("dict.subtitle_loading")}
        </p>
      </header>

      <label className="sticky top-0 z-10 -mx-4 mb-4 block bg-surface/90 px-4 py-2 backdrop-blur">
        <span className="flex items-center gap-2 rounded-2xl border-2 border-solid border-line bg-surface px-4 py-3 focus-within:border-primary">
          <Search size={18} className="shrink-0 text-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
            placeholder={t("dict.placeholder")} aria-label={t("dict.placeholder")}
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-base text-ink outline-none placeholder:text-soft" />
        </span>
      </label>

      {muc === null ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface2" />)}</div>
      ) : muc === false ? (
        <p className="text-sm text-danger">{t("dict.load_error")}</p>
      ) : !ketQua.length ? (
        <div className="py-12 text-center">
          <BookA size={32} className="mx-auto text-soft" />
          <p className="m-0 mt-3 text-sm font-semibold text-ink">{t("dict.none", { q })}</p>
          <p className="m-0 mt-1 text-xs text-soft">{t("dict.none_hint")}</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {ketQua.slice(0, 200).map((m) => (
            <li key={m.id} className="rounded-2xl border border-solid border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span lang="fr" className="text-base font-bold text-ink">{m.fr}</span>
                {m.phienAm && <span className="text-xs text-soft">{m.phienAm}</span>}
                <span className="ml-auto rounded-full bg-surface2 px-2 py-0.5 text-[11px] font-semibold text-soft">{m.bo}</span>
              </div>
              <p lang="vi" className="m-0 mt-1 text-sm text-ink">{m.vi}</p>
              {m.viDu && <p lang="fr" className="m-0 mt-1 text-xs italic text-soft">{m.viDu}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
