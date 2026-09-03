import React, { useEffect, useMemo, useState } from "react";
import { Anchor, AlertTriangle, Check, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
import { loadPractice, loadAssignments } from "../../shared/exerciseStore.js";
import { docNeo, luuNeo, quenNeo } from "../../shared/neoStore.js";
import { chuThuan, kiemNeo } from "../../shared/neoNguLieu.js";
import NeoNguLieu from "../student/NeoNguLieu.jsx";
import ChonDoanVan from "./ChonDoanVan.jsx";

/* Đặt neo — màn hình của giáo viên.
 *
 * ══ BÔI ĐEN, KHÔNG GÕ LẠI ══
 *
 * Neo lưu ĐOẠN TRÍCH nguyên văn (xem neoNguLieu.js). Bắt giáo viên gõ lại đoạn
 * đó là mời một lỗi chính tả vào đúng chỗ không chịu được lỗi chính tả: sai một
 * ký tự thì `viTriTrich` trả null, và học sinh nhận một cảnh báo "chỗ đánh dấu
 * không còn khớp" cho một bài chưa ai sửa.
 *
 * Nên: bôi đen ngay trên đoạn văn, `window.getSelection()` trả về đúng chuỗi
 * người đọc thấy. Không có đường nào để gõ sai.
 *
 * ══ KIỂM TRƯỚC KHI LƯU, KHÔNG PHẢI SAU ══
 *
 * `kiemNeo` chạy ngay lúc chọn. Neo hỏng thì nút Lưu khoá và nói rõ vì sao —
 * chứ không lưu xong rồi để học sinh phát hiện hộ.
 *
 * ══ XEM TRƯỚC BẰNG ĐÚNG THÀNH PHẦN HỌC SINH THẤY ══
 *
 * Khối xem trước dùng thẳng `NeoNguLieu`, không dựng lại một bản gần giống.
 * Hai bản dựng cho cùng một dữ liệu là hai chỗ để trôi khỏi nhau, và chỗ trôi
 * đó sẽ chỉ lộ ra ở phía học sinh — nơi không ai đang nhìn.
 */

function SoanNeo({ bai, cau, neoCu, onXong }) {
  const van = useMemo(() => chuThuan(bai.readingText), [bai.readingText]);
  const [neo, setNeo] = useState(neoCu ?? { trich: "", pieges: [] });
  const [dangChon, setDangChon] = useState("");
  const [dangLuu, setDangLuu] = useState(false);
  const [tin, setTin] = useState("");
  const [loi, setLoi] = useState("");

  const tinh = useMemo(() => kiemNeo(van, neo), [van, neo]);
  const luuDuoc = !!neo.trich && tinh.ok;

  const datChinh = () => {
    if (!dangChon.trim()) return;
    setNeo((p) => ({ ...p, trich: dangChon.trim() }));
    setTin(""); setLoi("");
  };

  const themBay = (option) => {
    if (!dangChon.trim()) return;
    setNeo((p) => ({
      ...p,
      pieges: [...(p.pieges ?? []).filter((b) => b.option !== option),
        { option, trich: dangChon.trim(), vi_sao: "" }],
    }));
  };

  const suaViSao = (option, chu) => setNeo((p) => ({
    ...p,
    pieges: (p.pieges ?? []).map((b) => (b.option === option ? { ...b, vi_sao: chu } : b)),
  }));

  const boBay = (option) => setNeo((p) => ({
    ...p, pieges: (p.pieges ?? []).filter((b) => b.option !== option),
  }));

  const luu = async (xoa = false) => {
    setDangLuu(true); setLoi(""); setTin("");
    const kq = await luuNeo(cau.id, xoa ? null : neo);
    setDangLuu(false);
    /* Đọc kết quả TRƯỚC khi báo xong. Lần thứ sáu trong dự án. */
    if (!kq.ok) {
      setLoi(kq.loi === "khong_phai_giao_vien"
        ? "Tài khoản này không có quyền đặt neo."
        : "Không lưu được. Kiểm tra mạng rồi thử lại.");
      return;
    }
    /* Bộ nhớ của `docNeo` giữ theo bài — không quên thì học sinh (và chính màn
       này) còn đọc bản cũ cho tới khi tải lại trang. */
    quenNeo(bai.id);
    setTin(xoa ? "Đã gỡ neo khỏi câu này." : "Đã lưu neo.");
    onXong(cau.id, xoa ? null : neo);
  };

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-soft">
          Bôi đen một đoạn trong bài
        </div>
        <div className="mt-2">
          <ChonDoanVan vanBan={bai.readingText} onChon={setDangChon} />
        </div>

        <p className="m-0 mt-2 min-h-10 rounded-xl bg-surface2 p-3 text-xs leading-relaxed text-ink">
          {dangChon.trim()
            ? <>Đang chọn: <em>« {dangChon.trim().slice(0, 120)} »</em></>
            : <span className="text-soft">Chưa chọn đoạn nào. Bôi đen bằng chuột hoặc bàn phím.</span>}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={datChinh} disabled={!dangChon.trim()}
            className="rounded-full border-0 bg-primary px-4 py-2 text-left text-sm font-bold text-white disabled:opacity-50">
            Đoạn chứa đáp án
          </button>
          {(cau.options ?? []).map((o, j) => (
            <button key={j} type="button" onClick={() => themBay(j)} disabled={!dangChon.trim()}
              className="rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink disabled:opacity-50">
              Bẫy cho « {String(o).slice(0, 18)} »
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-soft">Neo hiện tại</div>

        <div className="mt-2 rounded-2xl border border-line bg-surface p-4">
          <div className="text-xs font-bold text-soft">ĐOẠN CHỨA ĐÁP ÁN</div>
          <p className="m-0 mt-1 text-sm leading-relaxed text-ink">
            {neo.trich ? `« ${neo.trich} »` : <span className="text-soft">chưa đặt</span>}
          </p>

          {(neo.pieges ?? []).map((b) => (
            <div key={b.option} className="mt-3 rounded-xl bg-surface2 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-soft">
                  BẪY · {cau.options?.[b.option] ?? `đáp án ${b.option}`}
                </span>
                <button type="button" onClick={() => boBay(b.option)} title="Gỡ bẫy này"
                  className="ml-auto rounded-full border-0 bg-surface p-1.5 text-danger">
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="m-0 mt-1 text-xs italic leading-relaxed text-ink">« {b.trich} »</p>
              {/* Câu "vì sao nó hấp dẫn" mới là thứ dạy được. Không có nó thì
                  neo chỉ tô màu, và tô màu một mình không giải thích gì. */}
              <input value={b.vi_sao ?? ""} onChange={(e) => suaViSao(b.option, e.target.value)}
                placeholder="Vì sao đáp án này hấp dẫn nhưng sai?"
                className="mt-2 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-ink" />
            </div>
          ))}
        </div>

        {/* Neo hỏng thì khoá nút Lưu và nói rõ — đừng để học sinh phát hiện hộ. */}
        {neo.trich && !tinh.ok && (
          <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-semibold text-ink">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-danger" />
            Đoạn đã chọn không tìm thấy trong bài. Bôi đen lại trực tiếp trên đoạn văn.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => luu(false)} disabled={dangLuu || !luuDuoc}
            className="rounded-full border-0 bg-primary px-5 py-2.5 text-left text-sm font-bold text-white disabled:opacity-50">
            {dangLuu ? "Đang lưu…" : "Lưu neo"}
          </button>
          {neoCu && (
            <button type="button" onClick={() => luu(true)} disabled={dangLuu}
              className="rounded-full border-0 bg-surface2 px-4 py-2.5 text-left text-sm font-semibold text-danger disabled:opacity-50">
              Gỡ neo
            </button>
          )}
        </div>

        {tin && (
          <p className="m-0 mt-3 inline-flex items-center gap-2 text-sm font-bold text-ok">
            <Check size={14} /> {tin}
          </p>
        )}
        {loi && <p className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}

        {/* Xem trước bằng ĐÚNG thành phần học sinh thấy. */}
        {neo.trich && tinh.ok && (
          <div className="mt-4">
            <div className="text-xs font-bold uppercase tracking-wide text-soft">
              Học sinh sẽ thấy (khi họ chọn bẫy đầu tiên)
            </div>
            <div className="mt-2">
              <NeoNguLieu vanBan={bai.readingText} evidence={neo}
                chonSai={neo.pieges?.[0]?.option ?? null} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatNeo() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [baiId, setBaiId] = useState(null);
  const [neoTheoCau, setNeoTheoCau] = useState({});
  const [cauId, setCauId] = useState(null);

  const tai = async () => {
    setDs(undefined);
    try {
      const [a, b] = await Promise.all([loadPractice(), loadAssignments()]);
      /* Chỉ bài CÓ ngữ liệu. Neo là "chỗ nào trong bài chứa câu trả lời", nên
         bài không có đoạn văn thì không có gì để neo vào — bày nó ra chỉ tổ
         làm giáo viên bấm vào rồi quay ra. */
      setDs([...(a ?? []), ...(b ?? [])].filter((x) => String(x.readingText ?? "").trim()));
    } catch {
      setDs(null);
    }
  };

  useEffect(() => { tai(); }, []);

  const bai = useMemo(() => (ds ?? []).find((x) => x.id === baiId) ?? null, [ds, baiId]);

  useEffect(() => {
    if (!bai) return;
    let con = true;
    docNeo(bai.id).then((n) => { if (con) setNeoTheoCau(n ?? {}); });
    return () => { con = false; };
  }, [bai]);

  const cau = useMemo(
    () => (bai?.questions ?? []).find((q) => q.id === cauId) ?? null, [bai, cauId]);

  if (ds === undefined) return <p className="mt-10 text-center text-sm text-soft">Đang tải…</p>;

  if (ds === null) {
    return (
      <div className="mx-auto max-w-3xl py-6">
        <div className="rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được thư viện</p>
          <p className="m-0 mt-1 text-sm text-ink">
            Kiểm tra kết nối, và chắc chắn tài khoản này có vai giáo viên.
          </p>
        </div>
      </div>
    );
  }

  /* ── Đang soạn một bài ── */
  if (bai) {
    return (
      <div className="mx-auto max-w-6xl py-6">
        <button type="button" onClick={() => { setBaiId(null); setCauId(null); }}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <ArrowLeft size={14} /> Tất cả bài có ngữ liệu
        </button>

        <h1 className="m-0 mt-4 text-2xl font-extrabold text-ink">{bai.title}</h1>
        <p className="m-0 mt-1 text-sm text-soft">
          Chọn một câu, rồi bôi đen đoạn trong bài chứa câu trả lời.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(bai.questions ?? []).map((q, i) => (
            <button key={q.id} type="button" onClick={() => setCauId(q.id)}
              className={`rounded-full border-0 px-4 py-2 text-left text-sm font-bold ${
                cauId === q.id ? "bg-primary text-white"
                  : neoTheoCau[q.id] ? "bg-ok-soft text-ink" : "bg-surface2 text-soft"}`}>
              {i + 1}
              {neoTheoCau[q.id] && <Anchor size={12} className="ml-1.5 inline" />}
            </button>
          ))}
        </div>

        {cau ? (
          <>
            <p className="m-0 mt-5 rounded-xl bg-surface2 p-4 text-sm font-bold text-ink">
              {cau.prompt}
            </p>
            {/* `key` để React dựng lại trình soạn khi đổi câu — thiếu nó thì
                đoạn trích của câu trước dính lại sang câu sau. */}
            <SoanNeo key={cau.id} bai={bai} cau={cau} neoCu={neoTheoCau[cau.id] ?? null}
              onXong={(id, n) => setNeoTheoCau((p) => ({ ...p, [id]: n }))} />
          </>
        ) : (
          <p className="m-0 mt-6 text-sm text-soft">Chọn một câu ở trên để bắt đầu.</p>
        )}
      </div>
    );
  }

  /* ── Danh sách bài ── */
  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Neo đáp án vào ngữ liệu</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Chỉ ra chỗ trong bài chứa câu trả lời, và chỗ đã dụ học sinh chọn sai.
          </p>
        </div>
        <button type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {ds.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Chưa có bài nào có ngữ liệu</p>
          <p className="m-0 mt-1 text-sm text-soft">
            Neo chỉ đặt được cho bài có đoạn văn hoặc bài nghe kèm lời thoại.
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-3 p-0">
          {ds.map((x) => (
            <li key={x.id}>
              <button type="button" onClick={() => { setBaiId(x.id); setCauId(null); }}
                className="w-full rounded-2xl border border-line bg-surface p-4 text-left">
                <span className="text-sm font-bold text-ink">{x.title}</span>
                <span className="ml-2 rounded-full bg-surface2 px-2 py-0.5 text-xs font-bold text-soft">
                  {x.level}
                </span>
                <span className="mt-1 block text-xs text-soft">
                  {(x.questions ?? []).length} câu · {chuThuan(x.readingText).length} ký tự ngữ liệu
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
