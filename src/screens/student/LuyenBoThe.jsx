import React, { useEffect, useState } from "react";
import { ArrowLeft, Volume2, RotateCcw, Check, X, AlertTriangle } from "lucide-react";
import { docTheTrongBo } from "../../shared/boThe.js";
/* Dùng lại thẻ lật 3D đã có thay vì dựng bản lật tại chỗ thứ hai. Nó là thành
   phần trình bày thuần — nhận mọi thứ qua props, không chạm storageShim — và
   đã được check:css canh đủ bốn lớp 3D, check:sm2 canh chồng thẻ. Hai bộ kiểm
   đó lập tức có ích cho màn này mà không phải viết thêm gì.

   Đây là lý do TheLat3D.jsx sống sót đợt gỡ « Thẻ ghi nhớ » ngày 09/09: thứ
   bị bỏ là màn ôn SM-2, không phải cách vẽ một cái thẻ. */
import TheLat3D from "./TheLat3D.jsx";

/* Màn luyện một bộ thẻ.
 *
 * ══ KHÔNG CHẤM ĐIỂM, VÀ ĐÓ LÀ CHỦ ĐÍCH ══
 *
 * Bản thiết kế gốc có ô « SCORE 68 » cho một câu nói thu âm. Không dựng con số
 * đó: hệ thống hiện KHÔNG đo được độ chính xác phát âm — không có mô hình
 * giọng nói nào trong dự án (đo 09/09: không Edge Function nào gọi tới). Một
 * con số 68 vẽ ra ở đây là số bịa, và quy tắc 1 cấm đúng việc đó. Cùng lý do
 * Production Orale trong bài thi thử cố ý không cho điểm.
 *
 * Thay vào là thứ đo được thật: người học TỰ nói mình nhớ hay quên, và con số
 * duy nhất trên màn là số thẻ đã đi qua — đếm được, không cần đoán.
 *
 * Ai muốn ô SCORE thành thật thì phải dựng chấm phát âm trước; khi đó chỗ này
 * nhận thêm một trường, không phải viết lại.
 */

function ThanhTienDo({ i, tong }) {
  const pct = tong ? Math.round((i / tong) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="m-0 mt-1 text-right text-[11px] font-bold tabular-nums text-soft">
        {i}/{tong}
      </p>
    </div>
  );
}

export default function LuyenBoThe({ bo, onThoat }) {
  const [ds, setDs] = useState(undefined);   // undefined tải · null lỗi · [] rỗng
  const [i, setI] = useState(0);
  const [lat, setLat] = useState(false);
  const [xong, setXong] = useState(0);

  useEffect(() => {
    let con = true;
    setDs(undefined); setI(0); setLat(false); setXong(0);
    docTheTrongBo(bo?.id).then((v) => { if (con) setDs(v); });
    return () => { con = false; };
  }, [bo?.id]);

  const the = Array.isArray(ds) ? ds[i] : null;
  const het = Array.isArray(ds) && i >= ds.length;

  const sang = () => { setLat(false); setI((v) => v + 1); setXong((v) => v + 1); };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <button
        type="button"
        onClick={onThoat}
        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 text-left font-sans text-xs font-bold text-ink"
      >
        <ArrowLeft size={13} /> Bộ thẻ
      </button>

      <h1 className="m-0 mt-4 text-2xl font-extrabold tracking-tight text-ink">{bo?.ten}</h1>
      {Array.isArray(ds) && ds.length > 0 && (
        <ThanhTienDo i={Math.min(xong, ds.length)} tong={ds.length} />
      )}

      {ds === undefined ? (
        <p className="m-0 py-16 text-center text-sm text-soft">Đang tải thẻ…</p>
      ) : ds === null ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được bộ thẻ này</p>
        </div>
      ) : ds.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Bộ này chưa có thẻ nào</p>
          <p className="m-0 mt-1 text-sm text-soft">Giáo viên chưa thêm thẻ vào đây.</p>
        </div>
      ) : het ? (
        <div className="mt-8 rounded-3xl border border-line bg-surface p-10 text-center">
          <Check size={26} className="mx-auto text-ok" />
          <p className="m-0 mt-3 text-lg font-extrabold text-ink">Xong bộ này</p>
          <p className="m-0 mt-1 text-sm text-soft">Bạn đã đi qua {ds.length} thẻ.</p>
          <button
            type="button"
            onClick={() => { setI(0); setXong(0); setLat(false); }}
            className="mt-5 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-left font-sans text-sm font-bold text-white"
          >
            <RotateCcw size={14} /> Luyện lại
          </button>
        </div>
      ) : (
        <>
          {/* Thẻ lật 3D. `conLai` vẽ chồng thẻ phía sau, và nó đọc SỐ THẺ CÒN
              LẠI thật chứ không vẽ cứng hai cái — vẽ cứng là nói dối bằng hình
              ảnh khi chỉ còn một thẻ. */}
          <TheLat3D
            mat={the.phienAm ? `${the.matTruoc}\n${the.phienAm}` : the.matTruoc}
            sau={the.matSau}
            viDu={the.viDu}
            daLat={lat}
            onLat={() => setLat((v) => !v)}
            conLai={ds.length - i - 1}
          />

          {/* Nút nghe chỉ hiện khi thẻ THẬT SỰ có file. Một nút phát luôn hiện
              rồi im lặng khi bấm là ngõ cụt — người dùng tưởng máy hỏng. */}
          {the.amThanh && (
            <button
              type="button"
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left font-sans text-xs font-bold text-ink"
            >
              <Volume2 size={14} /> Nghe
            </button>
          )}

          {lat && (
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={sang}
                className="flex-1 rounded-2xl border-0 bg-surface2 px-4 py-3 text-center font-sans text-sm font-bold text-ink ring-1 ring-line"
              >
                <X size={14} className="mr-1.5 inline text-danger" /> Chưa nhớ
              </button>
              <button
                type="button"
                onClick={sang}
                className="flex-1 rounded-2xl border-0 bg-primary px-4 py-3 text-center font-sans text-sm font-bold text-white"
              >
                <Check size={14} className="mr-1.5 inline" /> Nhớ rồi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
