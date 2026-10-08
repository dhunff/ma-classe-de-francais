import React, { useEffect, useRef } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

/* Lượt thi thử (07/10, migration 120): 2 lượt/ngày, bấm « Bắt đầu » là tiêu
 * một lượt, thoát giữa chừng KHÔNG hoàn lại. Ba mảnh giao diện:
 *
 *   · HopBatDau  : cảnh báo trước khi vào thi (mô phỏng thời gian thật, trách
 *                  nhiệm làm bài, số lượt còn lại).
 *   · HopThoat   : khi học sinh định rời bài thi đang dở.
 *   · useGiuPhongThi : chặn nút Back của trình duyệt (mở HopThoat thay vì rời
 *                  trang) và hiện hộp xác nhận của trình duyệt khi đóng tab/F5.
 *                  Trình duyệt KHÔNG cho tự viết chữ trong hộp đóng tab, nên
 *                  câu « mất lượt » đã nói trước ở HopBatDau. */

function Nen({ children }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[300] grid place-items-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl">{children}</div>
    </div>
  );
}

export function HopBatDau({ tongPhut, luot, dangMo, loi, onHuy, onDongY }) {
  const conLai = luot && !luot.khong_gioi_han ? Math.max(0, luot.gioi_han - luot.da_dung) : null;
  return (
    <Nen>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-warn-soft text-warn"><ShieldCheck size={22} /></span>
        <h2 className="m-0 text-lg font-extrabold text-ink">Mô phỏng phòng thi DELF thật</h2>
      </div>
      <ul className="m-0 mt-4 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-ink">
        <li>Thời gian từng phần giống kỳ thi thật, tổng <strong>{tongPhut} phút</strong>. Đồng hồ không dừng lại.</li>
        <li>Bài nghe chỉ phát theo số lượt của đề thi, không tua lại được.</li>
        <li>Hãy làm bài nghiêm túc và có trách nhiệm như đang ở phòng thi: chuẩn bị chỗ yên tĩnh, tắt thông báo.</li>
        {luot?.vip
          ? <li>Bạn đang là <strong>VIP</strong>: không giới hạn số lượt thi. Thoát giữa chừng thì bài thi dừng lại.</li>
          : <li><strong>Mỗi ngày chỉ có 2 lượt thi.</strong> Bấm bắt đầu là dùng một lượt; thoát ra giữa chừng sẽ <strong>mất lượt đó</strong>.</li>}
      </ul>
      {conLai != null && (
        <p className="m-0 mt-4 rounded-xl bg-surface2 px-4 py-2.5 text-sm font-bold text-ink">
          Hôm nay bạn còn {conLai}/{luot.gioi_han} lượt.
        </p>
      )}
      {loi && <p className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onHuy}
          className="h-10 cursor-pointer rounded-full border border-solid border-line bg-surface px-5 font-sans text-sm font-bold text-ink">Để sau</button>
        <button type="button" onClick={onDongY} disabled={dangMo || conLai === 0}
          className="h-10 cursor-pointer rounded-full border-0 bg-primary px-5 font-sans text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {dangMo ? "Đang mở bài thi…" : conLai === 0 ? "Hết lượt hôm nay" : "Tôi hiểu, bắt đầu thi"}
        </button>
      </div>
    </Nen>
  );
}

export function HopThoat({ onO, onThoat }) {
  return (
    <Nen>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-danger-soft text-danger"><AlertTriangle size={22} /></span>
        <h2 className="m-0 text-lg font-extrabold text-ink">Bạn vẫn chưa làm xong bài thi</h2>
      </div>
      <p className="m-0 mt-3 text-sm leading-relaxed text-ink">
        Nếu thoát bây giờ, bài thi sẽ dừng lại và <strong>bạn mất lượt thi này trong ngày</strong>.
        Phần đã nộp vẫn được lưu, phần đang làm thì không.
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onThoat}
          className="h-10 cursor-pointer rounded-full border border-solid border-danger bg-surface px-5 font-sans text-sm font-bold text-danger">Vẫn thoát</button>
        <button type="button" onClick={onO}
          className="h-10 cursor-pointer rounded-full border-0 bg-primary px-5 font-sans text-sm font-bold text-white">Tiếp tục làm bài</button>
      </div>
    </Nen>
  );
}

export function useGiuPhongThi(dangThi, onMuonThoat) {
  const cb = useRef(onMuonThoat);
  cb.current = onMuonThoat;
  useEffect(() => {
    if (!dangThi) return;
    const truocKhiDong = (e) => { e.preventDefault(); e.returnValue = ""; };
    /* Đẩy một mốc lịch sử giả: bấm Back chỉ lùi về mốc đó, ta mở hộp cảnh
       báo và đẩy mốc lại — trang không rời đi. */
    window.history.pushState({ phongThi: true }, "");
    const quayLai = () => { window.history.pushState({ phongThi: true }, ""); cb.current?.(); };
    window.addEventListener("beforeunload", truocKhiDong);
    window.addEventListener("popstate", quayLai);
    return () => {
      window.removeEventListener("beforeunload", truocKhiDong);
      window.removeEventListener("popstate", quayLai);
    };
  }, [dangThi]);
}
