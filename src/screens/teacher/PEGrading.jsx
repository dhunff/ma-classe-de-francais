import React, { useEffect, useState } from "react";
import { PenLine, Check, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { loadPEAnswers, loadNames, gradePE, demTu } from "../../shared/peGrading.js";

/* Chấm bài viết — màn hình của giáo viên.
 *
 * Máy chấm được trắc nghiệm, điền từ, sắp xếp. Bài viết thì không, và giả vờ
 * chấm được còn tệ hơn không chấm — nên Edge Function `grade` để câu `open` ở
 * trạng thái "chưa chấm", và chỗ này là nơi con người vào cuộc.
 *
 * ══ HAI QUYẾT ĐỊNH GIAO DIỆN ══
 *
 * 1. MỞ SẴN BÀI CHƯA CHẤM, không bắt bấm tìm. Đây là màn hình có đúng một
 *    việc; danh sách "tất cả" là việc phụ, phải bấm mới hiện.
 *
 * 2. HIỆN ĐỀ BÀI CẠNH BÀI LÀM. Chấm một bài viết mà không thấy đề là chấm mù —
 *    người chấm không biết học sinh được yêu cầu làm gì, nên không biết bài có
 *    lạc đề không.
 */

const NGUONG = 5;      // dưới 5/25 là trượt riêng phần này, dù tổng có cao

function TheBaiViet({ row, ten, onXong }) {
  const [diem, setDiem] = useState(row.score ?? "");
  const [nhanXet, setNhanXet] = useState(row.feedback ?? "");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const max = Number(row.max_score) || 25;
  const baiLam = String(row.raw ?? "");
  const soTu = demTu(baiLam);
  const daCham = row.score != null;

  const luu = async () => {
    const n = Number(diem);
    if (!Number.isFinite(n) || n < 0 || n > max) {
      setLoi(`Điểm phải trong khoảng 0–${max}.`);
      return;
    }
    setDangLuu(true); setLoi("");
    const r = await gradePE(row.id, n, nhanXet, max);
    setDangLuu(false);
    if (!r.ok) { setLoi("Không lưu được: " + r.reason); return; }
    onXong(row.id, n);
  };

  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <PenLine size={15} className="text-primary" />
        <span className="text-sm font-bold text-ink">{ten}</span>
        <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-semibold text-soft">
          {row.attempts?.mode === "exam" ? "Thi thử" : "Luyện tập"}
        </span>
        {daCham
          ? <span className="inline-flex items-center gap-1 text-xs font-bold text-ok">
              <Check size={12} /> đã chấm {row.score}/{max}
            </span>
          : <span className="inline-flex items-center gap-1 text-xs font-bold text-warn">
              <Clock size={12} /> chờ chấm
            </span>}
        <span className="ml-auto text-xs text-soft">{soTu} mots</span>
      </div>

      {/* Đề bài. Không có nó thì người chấm không biết bài có lạc đề không. */}
      <p className="m-0 mt-3 rounded-xl bg-surface2 p-3 text-xs italic leading-relaxed text-soft">
        {row.questions?.prompt || "(đề bài trống)"}
      </p>

      {/* Bài làm. `whitespace-pre-wrap` để giữ nguyên xuống dòng của học sinh —
          bố cục đoạn văn là một phần của bài viết, gộp lại thành một khối là
          làm mất thứ đang chấm. */}
      <div className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-bg p-4 text-sm leading-relaxed text-ink">
        {baiLam.trim() || <span className="italic text-soft">(học sinh nộp bài trống)</span>}
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-soft">Điểm /{max}</span>
          <input type="number" min={0} max={max} step={0.5}
            value={diem} onChange={(e) => setDiem(e.target.value)}
            className="mt-1 w-24 rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-ink" />
        </label>

        <label className="block min-w-0 flex-1">
          {/* Nhãn này từng ghi "màn hình cho học sinh xem chưa làm" — đúng vào
              lúc đó. Màn hình ấy nay đã có (`/etudiant/resultats`), nên câu chữ
              phải đổi theo. Để nguyên cảnh báo cũ thì giáo viên tưởng nhận xét
              rơi vào hư không và thôi không viết nữa. */}
          <span className="text-xs font-bold uppercase tracking-wide text-soft">
            Nhận xét <span className="font-normal normal-case">(học sinh đọc được ở mục « Kết quả thi »)</span>
          </span>
          <input value={nhanXet} onChange={(e) => setNhanXet(e.target.value)}
            placeholder="Điều làm được, và một điều nên sửa lần sau."
            className="mt-1 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-ink" />
        </label>

        <button type="button" onClick={luu} disabled={dangLuu}
          className="rounded-full border-0 bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {dangLuu ? "Đang lưu…" : daCham ? "Sửa điểm" : "Lưu điểm"}
        </button>
      </div>

      {/* Ngưỡng 5/25 đáng nhắc ngay lúc chấm: người ta trượt DELF vì một kỹ
          năng chết chứ hiếm khi vì tổng điểm, nên cho dưới ngưỡng là một quyết
          định nặng hơn con số trông có vẻ. */}
      {diem !== "" && Number(diem) < NGUONG && (
        <p className="m-0 mt-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
          <AlertTriangle size={12} /> Dưới {NGUONG}/{max} — riêng phần này đã đủ làm trượt cả bài thi.
        </p>
      )}
      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
    </li>
  );
}

export default function PEGrading() {
  const [rows, setRows] = useState(null);
  const [ten, setTen] = useState({});
  const [chuaCham, setChuaCham] = useState(true);
  const [loi, setLoi] = useState("");

  const tai = async (chi) => {
    setRows(null); setLoi("");
    const { rows: r, error } = await loadPEAnswers({ chuaCham: chi });
    if (error) {
      /* Nói rõ đây là lỗi ĐỌC, không phải "chưa có bài nào" — hai trạng thái
         trông giống nhau trên màn hình mà cần hai hành động khác hẳn. */
      setLoi("Không đọc được danh sách bài viết. Kiểm tra mạng, và chắc chắn "
           + "tài khoản này có vai giáo viên.");
      setRows([]); return;
    }
    setRows(r);
    setTen(await loadNames(r.map((x) => x.attempts?.user_id)));
  };

  useEffect(() => { tai(chuaCham); }, [chuaCham]);

  const xong = (id, diem) => {
    /* Chấm xong thì gỡ khỏi danh sách "chưa chấm" — nếu để lại, giáo viên
       không phân biệt được bài nào còn phải làm. Ở chế độ "tất cả" thì cập
       nhật tại chỗ. */
    setRows((p) => chuaCham
      ? p.filter((x) => x.id !== id)
      : p.map((x) => (x.id === id ? { ...x, score: diem } : x)));
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Chấm bài viết</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Máy không chấm được Production écrite. Phần này chờ bạn.
          </p>
        </div>
        <button type="button" onClick={() => tai(chuaCham)}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      <div className="mt-5 flex gap-2">
        {[[true, "Chờ chấm"], [false, "Tất cả"]].map(([v, nhan]) => (
          <button key={nhan} type="button" onClick={() => setChuaCham(v)}
            className={`rounded-full border-0 px-5 py-2 text-sm font-bold ${
              chuaCham === v ? "bg-primary text-white" : "bg-surface2 text-soft"}`}>
            {nhan}
          </button>
        ))}
      </div>

      {loi && (
        <p className="m-0 mt-5 rounded-xl bg-dangerSoft p-4 text-sm font-semibold text-ink">{loi}</p>
      )}

      {rows === null ? (
        <p className="mt-8 text-center text-sm text-soft">Đang tải…</p>
      ) : rows.length === 0 && !loi ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">
            {chuaCham ? "Không còn bài nào chờ chấm" : "Chưa có bài viết nào"}
          </p>
          <p className="m-0 mt-1 text-sm text-soft">
            {chuaCham
              ? "Bài viết mới của học sinh sẽ hiện ở đây."
              : "Khi học sinh làm một bài có phần Production écrite, bài sẽ vào đây."}
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-4 p-0">
          {rows.map((r) => (
            <TheBaiViet key={r.id} row={r}
              ten={ten[r.attempts?.user_id] ?? "…"} onXong={xong} />
          ))}
        </ul>
      )}
    </div>
  );
}
