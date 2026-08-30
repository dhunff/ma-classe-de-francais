import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { luuBaiNoi, duongNghe, dsBaiNoi } from "../../shared/baiNoi.js";

/* Ghi âm phần nói.
 *
 * ══ KHÔNG CHẤM ĐIỂM, VÀ NÓI RÕ ĐIỀU ĐÓ ══
 *
 * DELF chấm phần nói bằng đối thoại với giám khảo. App tự học không mô phỏng
 * được, và cho ra một con số ở đây là bịa — quy tắc 1 của dự án. Nên màn này
 * cho đề bài, đồng hồ, và bản ghi để tự nghe lại; không có điểm, và giao diện
 * nói thẳng như vậy thay vì để người học tự đoán.
 *
 * ══ CHO PHÉP GHI LẠI, KHÔNG GHI ĐÈ ══
 *
 * Mỗi lần ghi tạo một file mới. Trong phòng thi thật không có lần hai, nhưng
 * đây là luyện tập — và nghe lại ba lần thu của chính mình cách nhau vài tuần
 * là cách duy nhất người học tự thấy mình tiến bộ. */

const dongHo = (giay) =>
  `${String(Math.floor(giay / 60)).padStart(2, "0")}:${String(giay % 60).padStart(2, "0")}`;

export default function GhiAmBaiNoi({ examId, exerciseId, gioiHanGiay = 900 }) {
  const [trangThai, setTrangThai] = useState("cho");   // cho · dangGhi · dangLuu · xong · loi
  const [loi, setLoi] = useState("");
  const [giay, setGiay] = useState(0);
  const [dsCu, setDsCu] = useState([]);
  const [nghe, setNghe] = useState(null);

  const mayRef = useRef(null);
  const manhRef = useRef([]);
  const dongHoRef = useRef(null);

  /* Dừng mọi thứ khi rời màn. Thiếu phần này thì micro vẫn sáng đèn sau khi
     người dùng đã chuyển trang — vừa đáng sợ, vừa là rò rỉ thật. */
  useEffect(() => () => {
    try { mayRef.current?.stop(); } catch { /* đã dừng rồi */ }
    mayRef.current?.stream?.getTracks?.().forEach((t) => t.stop());
    clearInterval(dongHoRef.current);
  }, []);

  useEffect(() => {
    dsBaiNoi({ examId, exerciseId }).then(setDsCu);
  }, [examId, exerciseId]);

  const batDau = async () => {
    setLoi("");
    /* `getUserMedia` chỉ chạy trên HTTPS (hoặc localhost). Nói rõ, vì lỗi mặc
       định của trình duyệt là "NotAllowedError" — đọc xong không ai biết phải
       làm gì. */
    if (!navigator.mediaDevices?.getUserMedia) {
      setTrangThai("loi");
      setLoi("Trình duyệt này không cho ghi âm. Cần HTTPS và một trình duyệt hiện đại.");
      return;
    }
    try {
      const luong = await navigator.mediaDevices.getUserMedia({ audio: true });
      const may = new MediaRecorder(luong);
      manhRef.current = [];
      may.ondataavailable = (e) => { if (e.data?.size) manhRef.current.push(e.data); };
      may.onstop = async () => {
        luong.getTracks().forEach((t) => t.stop());
        clearInterval(dongHoRef.current);
        const blob = new Blob(manhRef.current, { type: may.mimeType });
        setTrangThai("dangLuu");
        const kq = await luuBaiNoi({ blob, examId, exerciseId });
        if (!kq.ok) {
          setTrangThai("loi");
          setLoi({
            trong: "Không thu được âm thanh nào. Kiểm tra micro rồi thử lại.",
            dinh_dang: "Trình duyệt ghi ra định dạng máy chủ không nhận: " + (kq.chiTiet ?? ""),
            chua_dang_nhap: "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.",
            mang: "Không tải lên được. Kiểm tra kết nối rồi thử lại.",
          }[kq.loi] ?? "Không lưu được, chưa rõ lý do.");
          return;
        }
        setTrangThai("xong");
        setDsCu(await dsBaiNoi({ examId, exerciseId }));
      };
      mayRef.current = may;
      may.start();
      setGiay(0);
      setTrangThai("dangGhi");
      dongHoRef.current = setInterval(() => {
        setGiay((g) => {
          /* Tự dừng khi chạm giới hạn. Không có nó thì một tab bị quên sẽ ghi
             tới khi hết bộ nhớ, và file vượt 25 MB bị máy chủ từ chối — tức là
             mất trắng cả bản thu. */
          if (g + 1 >= gioiHanGiay) { try { may.stop(); } catch { /* đã dừng */ } }
          return g + 1;
        });
      }, 1000);
    } catch (e) {
      setTrangThai("loi");
      setLoi(e?.name === "NotAllowedError"
        ? "Bạn đã từ chối quyền dùng micro. Bật lại trong cài đặt trang của trình duyệt."
        : "Không mở được micro: " + (e?.message ?? e));
    }
  };

  const dung = () => { try { mayRef.current?.stop(); } catch { /* đã dừng */ } };

  const moNghe = async (duongDan) => setNghe(await duongNghe(duongDan));

  return (
    <div className="rounded-2xl border border-solid border-line bg-surface p-5">
      <div className="flex items-center gap-2">
        <Mic size={18} className="text-primary" aria-hidden />
        <h3 className="m-0 text-base font-bold text-ink">Ghi âm bài nói</h3>
      </div>

      {/* Nói thẳng là KHÔNG chấm. Im lặng ở đây thì người học chờ một con số
          không bao giờ tới, và nghĩ hệ thống hỏng. */}
      <p className="m-0 mt-2 text-sm text-soft">
        Phần này <strong className="text-ink">không được chấm điểm</strong>. DELF chấm phần nói
        qua đối thoại với giám khảo, nên ở đây bản ghi chỉ để bạn tự nghe lại —
        và để giáo viên nghe nếu bạn muốn được nhận xét.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {trangThai !== "dangGhi" ? (
          <button type="button" onClick={batDau} disabled={trangThai === "dangLuu"}
            className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5
                       text-sm font-bold text-on-primary transition hover:opacity-90
                       disabled:cursor-not-allowed disabled:opacity-60">
            {trangThai === "dangLuu"
              ? <><Loader2 size={15} className="mcf-spin" aria-hidden /> Đang lưu…</>
              : <><Mic size={15} aria-hidden /> {dsCu.length ? "Ghi lại" : "Bắt đầu ghi"}</>}
          </button>
        ) : (
          <button type="button" onClick={dung}
            className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-danger px-5 py-2.5
                       text-sm font-bold text-white transition hover:opacity-90">
            <Square size={15} aria-hidden /> Dừng
          </button>
        )}

        {trangThai === "dangGhi" && (
          <span className="flex items-center gap-2 text-sm font-bold tabular-nums text-danger">
            <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />
            {dongHo(giay)} / {dongHo(gioiHanGiay)}
          </span>
        )}

        {trangThai === "xong" && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-ok">
            <CheckCircle2 size={15} aria-hidden /> Đã lưu
          </span>
        )}
      </div>

      {loi && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
          <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {loi}
        </p>
      )}

      {/* Danh sách bản ghi. Mới nhất trước, và giữ lại tất cả — nghe lại ba lần
          thu cách nhau vài tuần là cách duy nhất tự thấy mình tiến bộ. */}
      {dsCu.length > 0 && (
        <div className="mt-4 border-0 border-t border-solid border-line pt-4">
          <p className="m-0 text-xs font-bold uppercase tracking-wider text-soft">
            Bản đã ghi ({dsCu.length})
          </p>
          <ul className="m-0 mt-2 list-none space-y-2 p-0">
            {dsCu.map((b) => (
              <li key={b.duongDan} className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => moNghe(b.duongDan)}
                  className="cursor-pointer rounded-lg border-0 bg-surface2 px-3 py-1.5 text-xs
                             font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
                  Nghe lại
                </button>
                <span className="text-xs text-soft">
                  {b.luc ? new Date(b.luc).toLocaleString("vi-VN") : b.ten}
                  {b.bytes ? ` · ${Math.round(b.bytes / 1024)} KB` : ""}
                </span>
              </li>
            ))}
          </ul>
          {nghe && (
            /* `key` để React dựng lại thẻ audio khi đổi bản ghi — thiếu nó thì
               nó giữ nguyên nguồn cũ và bấm "Nghe lại" bản khác không đổi gì. */
            <audio key={nghe} controls src={nghe} className="mt-3 w-full" />
          )}
        </div>
      )}
    </div>
  );
}
