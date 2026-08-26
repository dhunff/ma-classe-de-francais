import React from "react";
import { Plus, Trash2, RotateCcw, AlertTriangle, Info, Database } from "lucide-react";
import { grilleToRubric, grilleLuuDuoc, giongThangChuan, chuanHoaGrille }
  from "../../shared/grilleRubric.js";
import { TEN_NHOM, THU_TU_NHOM } from "../../shared/peBareme.js";

/* Soạn thang chấm Production écrite cho một đề.
 *
 * ══ VÌ SAO CÓ HAI CHẾ ĐỘ ══
 *
 * Grille DELF là CHUẨN NGOÀI, không phải tuỳ chọn sản phẩm. Đổi `argumenter`
 * từ 4 xuống 2 thì con số "15/25" học sinh tự chấm không còn nghĩa "sát ngưỡng
 * B2" nữa — nhưng màn hình vẫn hiện y hệt.
 *
 * Nên: mặc định là thang chuẩn, và đổi sang thang riêng là một hành động có ý
 * thức, có cảnh báo, và có nhãn hiện trên màn hình học sinh. Giáo viên vẫn làm
 * được mọi thứ; chỉ là con số không lặng lẽ nói dối.
 *
 * ══ VÌ SAO KHÔNG SỬA ĐƯỢC MỐC CHO ĐIỂM ══
 *
 * Sửa `max_score` thì mốc cũ hết đúng — thang 4 điểm có mốc cao nhất là 4, hạ
 * xuống 3 thì mốc ấy không bao giờ với tới. Ở đây mốc bị GỠ khi điều đó xảy ra
 * và giao diện học sinh lùi về phần mô tả. Nói ra tại chỗ, vì mất lặng lẽ thì
 * giáo viên tưởng vẫn còn.
 *
 * Cho sửa từng mốc là một trình soạn lồng trong trình soạn. Chưa làm, và chưa
 * chắc nên làm — mô tả tiêu chí viết kỹ thì đã đủ dùng.
 */

const NHOM_CHON = THU_TU_NHOM.map((k) => ({ k, ten: TEN_NHOM[k] }));

/* Tổng của DELF là 25. Không chặn số khác — giáo viên có thể đang soạn dở —
   nhưng nói rõ, vì một thang cộng ra 23 sẽ khiến mọi bài tự chấm lệch 8%. */
const TONG_DELF = 25;

const lamTron = (n) => Math.round(n * 2) / 2;

/* Xuất lại để ExamComposer chỉ cần import một chỗ. Định nghĩa nằm ở
   shared/grilleRubric.js vì bộ kiểm chạy bằng node không đọc được JSX. */
export { grilleLuuDuoc };

export default function GrilleEditor({ level, grille, onChange, cotSanSang = true }) {
  const chuan = grilleToRubric(level);
  const tuyChinh = !!grille;
  /* Nâng thang cũ ngay khi mở: không thì giáo viên thấy tên và mô tả tiếng Pháp
     trong khi học sinh đã thấy tiếng Việt — hai người nhìn hai thang khác nhau. */
  const g = grille ? chuanHoaGrille(grille, level) : chuan;

  const tong = lamTron(g.criteria.reduce((n, c) => n + (Number(c.max_score) || 0), 0));
  const lechDelf = tong !== TONG_DELF;

  /* `total` luôn được tính LẠI từ `max_score`, không bao giờ do người dùng gõ.
     Hai con số do hai nguồn thì sớm muộn lệch nhau, và ràng buộc ở migration
     035 sẽ từ chối lưu — đúng lúc giáo viên đã soạn xong và không hiểu vì sao. */
  const capNhat = (criteria) => {
    const moi = {
      ...g,
      schema_version: 1,
      level,
      adapted: false,
      criteria,
      total: lamTron(criteria.reduce((n, c) => n + (Number(c.max_score) || 0), 0)),
    };
    /* `official` tính từ NỘI DUNG, không từ chuyện đã bấm sửa hay chưa. Chọn
       « Thang riêng » rồi không đổi gì thì nó vẫn đúng là thang chuẩn, và học
       sinh không đáng phải đọc một cảnh báo sai — cảnh báo sai vài lần là người
       ta bỏ qua nó, kể cả lần thang lệch thật. Xem giongThangChuan(). */
    moi.official = giongThangChuan(moi, level);
    onChange(moi);
  };

  const doiTieuChi = (id, thayDoi) => capNhat(g.criteria.map((c) => {
    if (c.id !== id) return c;
    const moi = { ...c, ...thayDoi };
    /* Mốc chỉ còn đúng khi mốc cao nhất bằng đúng thang. Không thì gỡ — giữ lại
       nghĩa là học sinh chấm điểm tối đa mà thấy mô tả của một nấc thấp hơn. */
    if (moi.bareme && moi.bareme[0]?.[0] !== Number(moi.max_score)) moi.bareme = null;
    return moi;
  }));

  const themTieuChi = () => capNhat([...g.criteria, {
    id: `tc_${Date.now().toString(36)}`,
    key: `tuychinh_${g.criteria.length + 1}`,
    category: "pragmatique",
    name: "",
    description: "",
    max_score: 1,
    step: 0.5,
    bareme: null,
    order: g.criteria.length + 1,
  }]);

  const xoaTieuChi = (id) => capNhat(g.criteria.filter((c) => c.id !== id));

  if (!cotSanSang) {
    return (
      <div className="rounded-2xl border border-warn bg-warn-soft p-5">
        <p className="m-0 flex items-start gap-2 text-sm font-bold text-warn">
          <Database size={15} className="mt-0.5 shrink-0" />
          Chưa chạy migration 035
        </p>
        <p className="m-0 mt-2 text-sm leading-relaxed text-ink">
          Cột <code>exams.grille</code> chưa có trong database, nên thang riêng chưa
          lưu được. Dán <code>supabase/migrations/035_exam_grille.sql</code> vào
          SQL Editor rồi mở lại màn này.
        </p>
        <p className="m-0 mt-2 text-xs text-soft">
          Trong lúc đó mọi đề vẫn chấm bằng thang chuẩn DELF theo trình độ — đúng
          như trước. Không đề nào hỏng.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Chọn chế độ ── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full border-0 px-4 py-2 text-sm font-bold ${
            tuyChinh ? "bg-surface2 text-soft" : "bg-primary text-white"}`}
        >
          Thang chuẩn DELF
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...chuan, adapted: false })}
          className={`rounded-full border-0 px-4 py-2 text-sm font-bold ${
            tuyChinh ? "bg-primary text-white" : "bg-surface2 text-soft"}`}
        >
          Thang riêng cho đề này
        </button>
      </div>

      {!tuyChinh ? (
        <p className="m-0 mt-4 flex items-start gap-2 rounded-xl bg-surface2 p-4 text-sm leading-relaxed text-soft">
          <Info size={15} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Đề dùng thang chuẩn {level} của France Éducation international —{" "}
            <strong className="text-ink">{chuan.criteria.length} tiêu chí, {chuan.total} điểm</strong>.
            Thang này sửa ở <code>src/screens/exam/delfGrille.js</code> và áp dụng cho
            mọi đề, nên sửa một lỗi ở đó là sửa cho tất cả. Chỉ chọn thang riêng khi đề
            này thật sự cần khác.
          </span>
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-warn bg-warn-soft p-4">
            <p className="m-0 flex items-start gap-2 text-sm leading-relaxed text-ink">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />
              <span>
                Màn tự chấm của học sinh sẽ hiện dòng{" "}
                <strong>« Thang này do giáo viên tuỳ chỉnh, không phải thang DELF chính thức »</strong>.
                Đó là chủ ý: điểm tự chấm hay được đem so với ngưỡng đạt của kỳ thi thật.
              </span>
            </p>
          </div>

          {/* Tổng — đặt TRÊN danh sách, không ở dưới. Nó là con số quyết định
              đúng/sai của cả thang, nên phải thấy được trong lúc sửa chứ không
              phải sau khi cuộn hết danh sách. */}
          <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 ${
            lechDelf ? "bg-danger-soft" : "bg-ok-soft"}`}>
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-soft">Tổng thang</span>
              <p className={`m-0 text-2xl font-extrabold tabular-nums leading-none ${
                lechDelf ? "text-danger" : "text-ok"}`}>
                {tong}<span className="ml-1 text-sm text-soft">/ {TONG_DELF} điểm DELF</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-soft">
                {g.criteria.length} tiêu chí
              </span>
              <button type="button" onClick={() => onChange({ ...chuan, adapted: false })}
                className="inline-flex items-center gap-1.5 rounded-full border-0 bg-surface px-3 py-2 text-xs font-bold text-soft hover:text-ink">
                <RotateCcw size={13} /> Về thang chuẩn
              </button>
            </div>
          </div>

          {lechDelf && (
            <p className="m-0 mt-2 text-xs font-bold text-danger">
              Thang DELF cộng đúng {TONG_DELF}. Cộng ra {tong} nghĩa là mọi điểm tự chấm
              đều lệch so với thang thật — học sinh sẽ so nhầm với ngưỡng đạt.
            </p>
          )}

          {/* ── Danh sách tiêu chí ── */}
          <ul className="m-0 mt-5 list-none space-y-3 p-0">
            {g.criteria.map((c) => {
              const thieuTen = !String(c.name || "").trim();
              return (
                <li key={c.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        value={c.name ?? ""}
                        onChange={(e) => doiTieuChi(c.id, { name: e.target.value })}
                        placeholder="Tên tiêu chí — ví dụ: Lập luận"
                        className={`w-full rounded-xl border bg-surface2 px-3 py-2 text-sm font-bold text-ink ${
                          thieuTen ? "border-danger" : "border-line"}`}
                      />
                      <textarea
                        value={c.description ?? ""}
                        onChange={(e) => doiTieuChi(c.id, { description: e.target.value })}
                        rows={2}
                        placeholder="Mô tả: người chấm tìm gì ở tiêu chí này?"
                        className="w-full resize-y rounded-xl border border-line bg-surface2 px-3 py-2 text-xs leading-relaxed text-ink"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={c.category}
                          onChange={(e) => doiTieuChi(c.id, { category: e.target.value })}
                          className="rounded-full border border-line bg-surface2 px-3 py-1.5 text-xs font-semibold text-ink"
                        >
                          {NHOM_CHON.map((n) => (
                            <option key={n.k} value={n.k}>{n.ten}</option>
                          ))}
                        </select>

                        <label className="flex items-center gap-1.5 text-xs font-semibold text-soft">
                          Điểm tối đa
                          <input
                            type="number" min={0.5} max={25} step={0.5}
                            value={c.max_score}
                            onChange={(e) => doiTieuChi(c.id, { max_score: lamTron(Number(e.target.value) || 0) })}
                            className="w-20 rounded-lg border border-line bg-surface2 px-2 py-1.5 text-right text-xs font-bold tabular-nums text-ink"
                          />
                        </label>

                        {c.bareme
                          ? <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[11px] font-bold text-ok">
                              có {c.bareme.length} mốc cho điểm
                            </span>
                          : <span className="rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-bold text-soft">
                              không mốc — học sinh đọc phần mô tả
                            </span>}
                      </div>
                    </div>

                    <button type="button" onClick={() => xoaTieuChi(c.id)}
                      title="Xoá tiêu chí"
                      className="shrink-0 rounded-full border-0 bg-surface2 p-2 text-soft hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {thieuTen && (
                    <p className="m-0 mt-2 text-xs font-bold text-danger">
                      Tiêu chí phải có tên — học sinh chỉ thấy dòng này khi chấm.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <button type="button" onClick={themTieuChi}
            className="mt-3 inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-sm font-bold text-ink">
            <Plus size={15} /> Thêm tiêu chí
          </button>

          {g.criteria.length === 0 && (
            <p className="m-0 mt-3 text-xs font-bold text-danger">
              Thang không có tiêu chí nào thì không lưu được.
            </p>
          )}
        </>
      )}
    </div>
  );
}

