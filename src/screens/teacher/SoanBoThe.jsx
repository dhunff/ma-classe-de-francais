import React, { useEffect, useState } from "react";
import {
  Plus, Trash2, ArrowLeft, Eye, EyeOff, AlertTriangle, RefreshCw, Layers,
} from "lucide-react";
import { KY_NANG } from "../../shared/kyNang.js";
import { laGiaoVien } from "../../shared/lienHe.js";
import {
  docBoDeSoan, taoBo, suaBo, xoaBo,
  docTheDeSoan, themThe, xoaThe, bocDong,
} from "../../shared/boTheGiaoVien.js";

/* Soạn bộ thẻ — màn của giáo viên.
 *
 * ══ BA TRẠNG THÁI, KHÔNG HAI ══
 *
 * Danh sách rỗng KHÔNG phân biệt được "chưa soạn bộ nào" với "không phải giáo
 * viên" hay "mất mạng". Dự án đã dính cái nhập nhằng này BỐN lần trong một
 * ngày (cau_can_loi_giai, docLienHe, rồi hai lần ở màn xem liên hệ), nên vai
 * được hỏi RIÊNG bằng `laGiaoVien()` chứ không suy ra từ dữ liệu.
 *
 * ══ HAI TẦNG TRONG MỘT ROUTE ══
 *
 * Danh sách bộ → soạn một bộ. Giữ trong state như bên học sinh, cùng lý do:
 * hai tầng phải cùng tồn tại một khoảnh khắc thì mới chuyển mượt được. Đánh
 * đổi cũng y hệt — nút Back của trình duyệt không quay lại danh sách, nên có
 * nút Back rõ ràng ở đây.
 */

function OTaoBo({ onXong }) {
  const [ten, setTen] = useState("");
  const [kyNang, setKyNang] = useState("CO");
  const [moTa, setMoTa] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");

  const luu = async () => {
    if (!ten.trim()) { setLoi("Bộ Flashcard cần một cái tên."); return; }
    setDangLuu(true); setLoi("");
    const kq = await taoBo({ ten, kyNang, moTa });
    setDangLuu(false);
    if (!kq.ok) { setLoi(kq.loi); return; }
    setTen(""); setMoTa("");
    onXong();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="m-0 text-sm font-bold text-ink">Bộ Flashcard mới</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên bộ — ví dụ: Thông báo ở nhà ga"
          className="rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-ink"
        />
        <select
          value={kyNang}
          onChange={(e) => setKyNang(e.target.value)}
          className="rounded-xl border border-line bg-surface2 px-3 py-2 text-sm font-semibold text-ink"
        >
          {KY_NANG.map((k) => <option key={k.ma} value={k.ma}>{k.ten}</option>)}
        </select>
      </div>
      <input
        value={moTa}
        onChange={(e) => setMoTa(e.target.value)}
        placeholder="Mô tả ngắn (tuỳ chọn)"
        className="mt-3 w-full rounded-xl border border-line bg-surface2 px-3 py-2 text-sm text-ink"
      />
      {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}
      <button
        type="button" onClick={luu} disabled={dangLuu}
        className="mt-3 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 text-left font-sans text-sm font-bold text-white disabled:opacity-60"
      >
        <Plus size={14} /> {dangLuu ? "Đang tạo…" : "Tạo bộ"}
      </button>
    </div>
  );
}

function SoanMotBo({ bo, onQuay, onDoi }) {
  const [ds, setDs] = useState(undefined);
  const [van, setVan] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [hong, setHong] = useState([]);

  const tai = async () => setDs(await docTheDeSoan(bo.id));
  useEffect(() => { let c = true; docTheDeSoan(bo.id).then((v) => { if (c) setDs(v); }); return () => { c = false; }; }, [bo.id]);

  const themLo = async () => {
    const { duoc, hong: h } = bocDong(van);
    setHong(h);
    if (!duoc.length) { setLoi("Không có dòng nào hợp lệ."); return; }
    setDangLuu(true); setLoi("");

    /* Chèn TUẦN TỰ và dừng ở lỗi đầu tiên. PostgREST không có transaction, nên
       một lô chèn hỏng giữa chừng để lại trạng thái nửa vời — đúng cái đã cắn
       `saveExam` một lần. Dừng sớm thì ít nhất số thẻ vào được là con số nói
       ra được. */
    const batDau = (ds?.length ?? 0);
    let vao = 0;
    for (const t of duoc) {
      const kq = await themThe(bo.id, t, batDau + vao);
      if (!kq.ok) { setLoi(`${kq.loi} (dừng sau ${vao} thẻ)`); break; }
      vao += 1;
    }
    setDangLuu(false);
    if (vao) { setVan(""); await tai(); onDoi(); }
  };

  const bo1The = async (id) => {
    const kq = await xoaThe(id);
    if (!kq.ok) { setLoi(kq.loi); return; }
    await tai(); onDoi();
  };

  return (
    <div>
      <button
        type="button" onClick={onQuay}
        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 text-left font-sans text-xs font-bold text-ink"
      >
        <ArrowLeft size={13} /> Tất cả Flashcard
      </button>

      <h2 className="m-0 mt-4 text-xl font-extrabold tracking-tight text-ink">{bo.ten}</h2>
      <p className="m-0 mt-1 text-xs text-soft">
        {KY_NANG.find((k) => k.ma === bo.kyNang)?.ten} · {ds?.length ?? "…"} thẻ
        {!bo.congKhai && " · nháp, học sinh chưa thấy"}
      </p>

      {/* ══ NHẬP HÀNG LOẠT ══
          Gõ từng thẻ qua form là việc không ai làm quá mười lần — cùng lý do
          Builder nhận cả khối JSON thay vì bắt bấm từng ô. */}
      <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <h3 className="m-0 text-sm font-bold text-ink">Thêm thẻ</h3>
        <p className="m-0 mt-1 text-xs leading-relaxed text-soft">
          Mỗi dòng một thẻ, ngăn bằng dấu <code className="font-bold text-ink">|</code>:{" "}
          <span className="font-semibold text-ink">mặt trước | mặt sau | phiên âm</span>.
          Phiên âm để trống được.
        </p>
        <textarea
          value={van}
          onChange={(e) => setVan(e.target.value)}
          rows={5}
          placeholder={"Le train entre en gare | Tàu đang vào ga | lə tʁɛ̃ ɑ̃tʁ ɑ̃ ɡaʁ\nVoie 12 | Đường ray số 12"}
          className="mt-3 w-full rounded-xl border border-line bg-surface2 px-3 py-2 font-mono text-xs leading-relaxed text-ink"
        />

        {/* Dòng hỏng phải được GỌI TÊN kèm số dòng. Dán 30 dòng mà vào 28 thẻ,
            không ai nói gì, là hai thẻ mất tích không dấu vết. */}
        {hong.length > 0 && (
          <div className="mt-2 rounded-xl bg-warn-soft px-3 py-2">
            <p className="m-0 text-xs font-bold text-warn">
              {hong.length} dòng bị bỏ qua vì thiếu dấu | hoặc thiếu một vế:
            </p>
            <ul className="m-0 mt-1 list-none p-0">
              {hong.slice(0, 5).map((h) => (
                <li key={h.dong} className="text-[11px] text-warn">dòng {h.dong}: {h.van}</li>
              ))}
            </ul>
          </div>
        )}
        {loi && <p className="m-0 mt-2 text-xs font-semibold text-danger">{loi}</p>}

        <button
          type="button" onClick={themLo} disabled={dangLuu}
          className="mt-3 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 text-left font-sans text-sm font-bold text-white disabled:opacity-60"
        >
          <Plus size={14} /> {dangLuu ? "Đang thêm…" : "Thêm vào bộ"}
        </button>
      </div>

      {/* ══ DANH SÁCH THẺ ══ */}
      {ds === undefined ? (
        <p className="m-0 mt-6 text-center text-sm text-soft">Đang tải…</p>
      ) : ds === null ? (
        <div className="mt-6 rounded-2xl bg-danger-soft p-5 text-center">
          <AlertTriangle size={18} className="mx-auto text-danger" />
          <p className="m-0 mt-2 text-sm font-bold text-ink">Không đọc được thẻ của bộ này</p>
        </div>
      ) : ds.length === 0 ? (
        <p className="m-0 mt-6 rounded-2xl border border-line bg-surface p-6 text-center text-sm text-soft">
          Bộ này chưa có thẻ nào. Dán vài dòng ở ô trên.
        </p>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-2 p-0">
          {ds.map((t, i) => (
            <li key={t.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
              <span className="mt-0.5 w-5 shrink-0 text-right text-xs font-bold tabular-nums text-soft">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm font-bold text-ink">{t.matTruoc}</p>
                {t.phienAm && <p className="m-0 text-xs italic text-soft">{t.phienAm}</p>}
                <p className="m-0 mt-0.5 text-xs leading-relaxed text-soft">{t.matSau}</p>
              </div>
              <button
                type="button" onClick={() => bo1The(t.id)}
                aria-label={`Xoá thẻ ${i + 1}`}
                className="shrink-0 rounded-full border-0 bg-surface2 p-2 text-left text-danger"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SoanBoThe() {
  const [laGV, setLaGV] = useState(undefined);   // undefined tải · null không hỏi được
  const [ds, setDs] = useState(undefined);
  const [dangMo, setDangMo] = useState(null);
  const [loi, setLoi] = useState("");

  const tai = async () => {
    setDs(undefined); setLaGV(undefined);
    const [vai, rows] = await Promise.all([laGiaoVien(), docBoDeSoan()]);
    setLaGV(vai); setDs(rows);
  };
  useEffect(() => { tai(); }, []);

  const doiCongKhai = async (b) => {
    const kq = await suaBo(b.id, { congKhai: !b.congKhai });
    if (!kq.ok) { setLoi(kq.loi); return; }
    setLoi(""); tai();
  };

  const bo1Bo = async (b) => {
    /* Xoá bộ là xoá cả thẻ trong nó (CASCADE). Hỏi lại — và nói ra con số,
       không hỏi chung chung: « xoá 30 thẻ » đọc khác hẳn « bạn có chắc? ». */
    if (!window.confirm(`Xoá bộ « ${b.ten} » và ${b.soThe} thẻ trong đó? Không hoàn lại được.`)) return;
    const kq = await xoaBo(b.id);
    if (!kq.ok) { setLoi(kq.loi); return; }
    setLoi(""); setDangMo(null); tai();
  };

  if (dangMo) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <SoanMotBo bo={dangMo} onQuay={() => { setDangMo(null); tai(); }} onDoi={tai} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">Soạn Flashcard</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Bộ thẻ bạn soạn ở đây là thứ học sinh thấy ở mục Flashcard.
          </p>
        </div>
        <button
          type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left font-sans text-sm font-semibold text-ink"
        >
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {loi && (
        <p className="m-0 mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{loi}</p>
      )}

      {ds === undefined ? (
        <p className="mt-10 text-center text-sm text-soft">Đang tải…</p>
      ) : laGV === null ? (
        /* KHÔNG HỎI ĐƯỢC vai — khác cả "không phải giáo viên" lẫn "chưa có bộ
           nào". Ba sự thật, ba nhánh; gộp là nói sai với hai trong ba. */
        <div className="mt-8 rounded-2xl bg-warn-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-warn" />
          <p className="m-0 mt-2 font-bold text-ink">Không hỏi được vai của bạn</p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-ink">
            Danh sách bên dưới có thể trống vì lý do đó chứ không phải vì bạn chưa
            soạn bộ nào. Đừng kết luận gì cho tới khi tải lại được.
          </p>
        </div>
      ) : laGV === false ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Máy chủ không coi bạn là giáo viên</p>
          <p className="m-0 mt-1 text-sm leading-relaxed text-ink">
            Bạn xem được nhưng mọi lệnh ghi sẽ bị từ chối. Đăng xuất rồi đăng nhập
            lại; nếu vẫn vậy thì báo người quản trị.
          </p>
        </div>
      ) : ds === null ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được danh sách</p>
        </div>
      ) : (
        <>
          <div className="mt-5"><OTaoBo onXong={tai} /></div>

          {ds.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-line bg-surface p-8 text-center">
              <Layers size={22} className="mx-auto text-soft" />
              <p className="m-0 mt-2 font-bold text-ink">Chưa có bộ thẻ nào</p>
              <p className="m-0 mt-1 text-sm leading-relaxed text-soft">
                Học sinh đang mở mục Flashcard và thấy trống. Tạo bộ đầu tiên ở ô trên.
              </p>
            </div>
          ) : (
            <ul className="m-0 mt-5 list-none space-y-3 p-0">
              {ds.map((b) => (
                <li key={b.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button" onClick={() => setDangMo(b)}
                      className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left font-sans"
                    >
                      <span className="block truncate text-sm font-bold text-ink">{b.ten}</span>
                      <span className="block text-xs text-soft">
                        {KY_NANG.find((k) => k.ma === b.kyNang)?.ten} · {b.soThe} thẻ
                      </span>
                    </button>

                    {/* Công khai / nháp: nhãn nói TRẠNG THÁI ĐANG CÓ, nút nói
                        VIỆC SẼ XẢY RA. Trộn hai thứ là chỗ người ta bấm nhầm. */}
                    <button
                      type="button" onClick={() => doiCongKhai(b)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-0 px-3 py-1.5 text-left font-sans text-xs font-bold ${
                        b.congKhai ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
                      }`}
                    >
                      {b.congKhai ? <><Eye size={12} /> đang hiện</> : <><EyeOff size={12} /> nháp</>}
                    </button>

                    <button
                      type="button" onClick={() => bo1Bo(b)}
                      aria-label={`Xoá bộ ${b.ten}`}
                      className="shrink-0 rounded-full border-0 bg-surface2 p-2 text-left text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {b.moTa && <p className="m-0 mt-2 text-xs leading-relaxed text-soft">{b.moTa}</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
