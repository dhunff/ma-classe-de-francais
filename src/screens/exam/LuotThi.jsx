import React, { useEffect, useRef } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

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
        <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Mô phỏng phòng thi DELF thật", "Simulation d'une vraie salle d'examen DELF", "A real DELF exam room simulation")}</h2>
      </div>
      <ul className="m-0 mt-4 grid list-disc gap-2 pl-5 text-sm leading-relaxed text-ink">
        <li>{tr("Thời gian từng phần giống kỳ thi thật, tổng", "La durée de chaque partie est celle de l'examen réel, au total", "Each part is timed like the real exam, in total")} <strong>{tongPhut} phút</strong>{tr(". Đồng hồ không dừng lại.", ". Le chronomètre ne s'arrête pas.", ". The timer never stops.")}</li>
        <li>{tr("Bài nghe chỉ phát theo số lượt của đề thi, không tua lại được.", "Les documents audio ne passent que le nombre de fois prévu, sans retour en arrière.", "Audio plays only the number of times the exam allows, with no rewinding.")}</li>
        <li>{tr("Hãy làm bài nghiêm túc và có trách nhiệm như đang ở phòng thi: chuẩn bị chỗ yên tĩnh, tắt thông báo.", "Travaillez sérieusement, comme en salle d'examen : installez-vous au calme et coupez les notifications.", "Take it seriously, as in a real exam room: find a quiet place and turn off notifications.")}</li>
        {luot?.vip
          ? <li>{tr("Bạn đang là", "Vous êtes", "You are a")} <strong>VIP</strong>{tr(": không giới hạn số lượt thi. Thoát giữa chừng thì bài thi dừng lại.", " : nombre d'examens illimité. Si vous quittez en cours, l'examen s'arrête.", " member: unlimited mock exams. Leaving midway stops the exam.")}</li>
          : <li><strong>{tr("Mỗi ngày chỉ có 2 lượt thi.", "Seulement 2 examens par jour.", "Only 2 exams per day.")}</strong> {tr("Bấm bắt đầu là dùng một lượt; thoát ra giữa chừng sẽ", "Commencer utilise un essai ; quitter en cours fait", "Starting uses one attempt; leaving midway means you")} <strong>{tr("mất lượt đó", "perdre cet essai", "lose that attempt")}</strong>.</li>}
      </ul>
      {conLai != null && (
        <p className="m-0 mt-4 rounded-xl bg-surface2 px-4 py-2.5 text-sm font-bold text-ink">
          {tr("Hôm nay bạn còn", "Il vous reste aujourd'hui", "Attempts left today:")} {conLai}/{luot.gioi_han} {tr("lượt.", "essai(s).", "")}
        </p>
      )}
      {loi && <p className="m-0 mt-3 text-sm font-semibold text-danger">{loi}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onHuy}
          className="h-10 cursor-pointer rounded-full border border-solid border-line bg-surface px-5 font-sans text-sm font-bold text-ink">{tr("Để sau", "Plus tard", "Later")}</button>
        <button type="button" onClick={onDongY} disabled={dangMo || conLai === 0}
          className="h-10 cursor-pointer rounded-full border-0 bg-primary px-5 font-sans text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          {dangMo ? tr("Đang mở bài thi…", "Ouverture de l'examen…", "Opening the exam…") : conLai === 0 ? tr("Hết lượt hôm nay", "Plus d'essai aujourd'hui", "No attempts left today") : tr("Tôi hiểu, bắt đầu thi", "J'ai compris, commencer", "I understand, start")}
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
        <h2 className="m-0 text-lg font-extrabold text-ink">{tr("Bạn vẫn chưa làm xong bài thi", "Vous n'avez pas terminé l'examen", "You haven't finished the exam")}</h2>
      </div>
      <p className="m-0 mt-3 text-sm leading-relaxed text-ink">
        {tr("Nếu thoát bây giờ, bài thi sẽ dừng lại và", "Si vous quittez maintenant, l'examen s'arrête et", "If you leave now, the exam stops and")} <strong>{tr("bạn mất lượt thi này trong ngày", "vous perdez cet essai pour aujourd'hui", "you lose today's attempt")}</strong>{tr(". Phần đã nộp vẫn được lưu, phần đang làm thì không.", ". Les parties déjà rendues sont enregistrées, pas celle en cours.", ". Parts already submitted are saved; the current one is not.")}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onThoat}
          className="h-10 cursor-pointer rounded-full border border-solid border-danger bg-surface px-5 font-sans text-sm font-bold text-danger">{tr("Vẫn thoát", "Quitter quand même", "Leave anyway")}</button>
        <button type="button" onClick={onO}
          className="h-10 cursor-pointer rounded-full border-0 bg-primary px-5 font-sans text-sm font-bold text-white">{tr("Tiếp tục làm bài", "Continuer l'examen", "Keep going")}</button>
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
