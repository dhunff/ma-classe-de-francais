import React, { useEffect, useState } from "react";
import { ArrowLeft, Volume2, RotateCcw, Check, X, AlertTriangle } from "lucide-react";
import { docTheTrongBo } from "../../shared/boThe.js";

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
          {/* ══ THẺ CHÍNH ══
              Bấm cả thẻ để lật — nút riêng thì phải ngắm, mà thao tác này lặp
              lại vài chục lần trong một buổi. `<button>` chứ không phải `<div
              onClick>`: bàn phím và trình đọc màn hình cần một phần tử bấm
              được thật. */}
          <button
            type="button"
            onClick={() => setLat((v) => !v)}
            aria-expanded={lat}
            className="mt-6 w-full rounded-3xl border-0 bg-surface p-8 text-left font-sans shadow-lg ring-1 ring-line transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/10"
          >
            <p className="m-0 text-center text-2xl font-extrabold leading-snug text-ink">
              {the.matTruoc}
            </p>

            {the.phienAm && (
              <p className="m-0 mt-2 text-center text-sm italic text-soft">{the.phienAm}</p>
            )}

            {/* Mặt sau hiện tại chỗ, không đổi trang: người học phải thấy được
                cả câu hỏi lẫn lời giải cùng lúc để đối chiếu. */}
            {lat ? (
              <div className="mt-6 rounded-2xl bg-surface2 p-5">
                <p className="m-0 text-sm leading-relaxed text-ink">{the.matSau}</p>
                {the.viDu && (
                  <p className="m-0 mt-3 border-l-2 border-primary pl-3 text-xs italic leading-relaxed text-soft">
                    {the.viDu}
                  </p>
                )}
              </div>
            ) : (
              <p className="m-0 mt-6 text-center text-xs font-semibold text-soft">
                bấm để xem nghĩa
              </p>
            )}
          </button>

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
