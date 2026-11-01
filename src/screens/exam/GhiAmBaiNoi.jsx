import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { luuBaiNoi, duongNghe, dsBaiNoi, aiNhanXet } from "../../shared/baiNoi.js";
import { tr } from "../../shared/i18n.jsx";
import { loiTranVip } from "../../shared/loiTranVip.js";
import { LeonNoi } from "../../shared/leon.jsx";

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

/* Sóng trang trí của nút ghi, chỉ chuyển động khi đang ghi. */
const SONG_GHI = [40, 70, 100, 60, 85, 45, 75, 100, 55, 80, 40, 65];

/* Nút ghi nằm trong thẻ câu hỏi: cả dải là nút bấm, màu theo kỹ năng, chuyển đỏ khi đang ghi.
   Có bản ghi rồi thì ẩn, bấm Ghi lại mới hiện; chỉ bản mới nhất được hiện và được tính điểm. */
function NutGhiGon({ trangThai, giay, toiDa, mau, onBam }) {
  const dangGhi = trangThai === "dangGhi", dangLuu = trangThai === "dangLuu";
  const nhan = dangGhi ? tr("Đang ghi, bấm để dừng", "Enregistrement, cliquez pour arrêter", "Recording, click to stop")
    : dangLuu ? tr("Đang lưu…", "Enregistrement…", "Saving…") : tr("Bấm để ghi âm", "Cliquez pour enregistrer", "Click to record");
  return (
    <button type="button" onClick={onBam} disabled={dangLuu}
      className={`flex w-full items-center gap-3 rounded-2xl border-0 p-2 pr-4 text-left font-sans transition-colors ${dangGhi ? "bg-danger-soft" : "bg-surface2"} ${dangLuu ? "cursor-wait" : "cursor-pointer"}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-md ${dangGhi ? "mcf-ghi-nhip bg-danger" : ""}`} style={dangGhi ? undefined : { background: mau }}>
        {dangGhi ? <Square size={15} className="fill-current" aria-hidden /> : dangLuu ? <Loader2 size={18} className="mcf-spin" aria-hidden /> : <Mic size={20} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-bold ${dangGhi ? "text-danger" : "text-ink"}`}>{nhan}</span>
        {dangGhi && <span className="block text-xs font-bold tabular-nums text-danger">{dongHo(giay)} / {dongHo(toiDa)}</span>}
      </span>
      <span aria-hidden className={`hidden h-7 w-24 shrink-0 items-center gap-[3px] sm:flex ${dangGhi ? "mcf-song-chay text-danger" : "opacity-40"}`} style={dangGhi ? undefined : { color: mau }}>
        {SONG_GHI.map((cao, i) => <span key={i} className="min-w-0 flex-1 rounded-full bg-current" style={{ height: `${cao}%`, "--i": i }} />)}
      </span>
    </button>
  );
}

/* Một lúc chỉ một bộ ghi chạy: bài Luyện tập có nhiều bộ ghi, mỗi câu một bộ. */
let mayDangChay = null;

/* `cauId`: ghi riêng cho một câu. `gon`: bản nằm trong thẻ câu hỏi, bỏ khung và tiêu đề. */
/* Luyện tập: `tuLuc` chỉ tính bản ghi từ lượt làm lại này, `khoa` cấm ghi thêm sau khi đã nộp,
   `onDiem(cauId, "cho" | số | null)` báo điểm cho màn làm bài. */
export default function GhiAmBaiNoi({ examId, exerciseId, cauId, gon = false, mau = "var(--mcf-primary)", gioiHanGiay = 900, moTa = null, tuLuc = 0, khoa = false, onDiem = null }) {
  const [trangThai, setTrangThai] = useState("cho");   // cho · dangGhi · dangLuu · xong · loi
  const [loi, setLoi] = useState("");
  const [giay, setGiay] = useState(0);
  const [dsCu, setDsCu] = useState([]);
  const [daTai, setDaTai] = useState(false);
  const [ghiLai, setGhiLai] = useState(false);
  const [nghe, setNghe] = useState(null);
  /* AI nhận xét (27/09): { [duongDan]: { dang } | { ok, nhan_xet, chep_loi } | { ok:false, ma, thong_bao } } */
  const [nx, setNx] = useState({});
  const xinNhanXet = async (duongDan) => {
    setNx((x) => ({ ...x, [duongDan]: { dang: true } }));
    onDiem?.(cauId, "cho");
    const kq = await aiNhanXet(duongDan);
    setNx((x) => ({ ...x, [duongDan]: kq }));
    onDiem?.(cauId, Number.isInteger(kq?.nhan_xet?.diem) ? kq.nhan_xet.diem : null);
  };

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
    dsBaiNoi({ examId, exerciseId, cauId }).then((ds) => {
      const con = gon ? ds.filter((b) => (b.luc ?? 0) >= tuLuc) : ds;
      setDsCu(con); setDaTai(true);
      if (gon && con[0]) xinNhanXet(con[0].duongDan);   // đã chấm rồi thì máy chủ trả lại, không tốn lượt
    });
  }, [examId, exerciseId, cauId]); // eslint-disable-line react-hooks/exhaustive-deps

  const batDau = async () => {
    setLoi("");
    /* `getUserMedia` chỉ chạy trên HTTPS (hoặc localhost). Nói rõ, vì lỗi mặc
       định của trình duyệt là "NotAllowedError" — đọc xong không ai biết phải
       làm gì. */
    if (!navigator.mediaDevices?.getUserMedia) {
      setTrangThai("loi");
      setLoi(tr("Trình duyệt này không cho ghi âm. Cần HTTPS và một trình duyệt hiện đại.", "Ce navigateur ne permet pas l'enregistrement. HTTPS et un navigateur récent sont nécessaires.", "This browser can't record. HTTPS and a modern browser are required."));
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
        const kq = await luuBaiNoi({ blob, examId, exerciseId, cauId });
        if (!kq.ok) {
          setTrangThai("loi");
          setLoi({
            trong: tr("Không thu được âm thanh nào. Kiểm tra micro rồi thử lại.", "Aucun son capté. Vérifiez le micro et réessayez.", "No sound captured. Check your microphone and try again."),
            dinh_dang: tr("Trình duyệt ghi ra định dạng máy chủ không nhận: ", "Format d'enregistrement refusé par le serveur : ", "The server doesn't accept this recording format: ") + (kq.chiTiet ?? ""),
            chua_dang_nhap: tr("Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử lại.", "Session expirée. Reconnectez-vous et réessayez.", "Session expired. Sign in again and retry."),
            mang: tr("Không tải lên được. Kiểm tra kết nối rồi thử lại.", "Envoi impossible. Vérifiez la connexion et réessayez.", "Upload failed. Check your connection and retry."),
          }[kq.loi] ?? tr("Không lưu được, chưa rõ lý do.", "Enregistrement impossible, raison inconnue.", "Couldn't save, unknown reason."));
          return;
        }
        setTrangThai("xong");
        setDsCu(await dsBaiNoi({ examId, exerciseId, cauId }));
        if (gon) { setGhiLai(false); xinNhanXet(kq.duongDan); }
      };
      try { mayDangChay?.stop(); } catch { /* đã dừng */ }
      mayDangChay = may;
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
        ? tr("Bạn đã từ chối quyền dùng micro. Bật lại trong cài đặt trang của trình duyệt.", "Vous avez refusé l'accès au micro. Réactivez-le dans les réglages du site.", "You denied microphone access. Re-enable it in the site settings.")
        : tr("Không mở được micro: ", "Impossible d'ouvrir le micro : ", "Couldn't open the microphone: ") + (e?.message ?? e));
    }
  };

  const dung = () => { try { mayRef.current?.stop(); } catch { /* đã dừng */ } };

  const moNghe = async (duongDan) => setNghe(await duongNghe(duongDan));

  return (
    <div className={gon ? "" : "rounded-2xl border border-solid border-line bg-surface p-5"}>
      {!gon && <div className="flex items-center gap-2">
        <Mic size={18} className="text-primary" aria-hidden />
        <h3 className="m-0 text-base font-bold text-ink">{tr("Ghi âm bài nói", "Enregistrer la production orale", "Record your speaking")}</h3>
      </div>}

      {/* Nói thẳng là KHÔNG chấm. Im lặng ở đây thì người học chờ một con số
          không bao giờ tới, và nghĩ hệ thống hỏng. */}
      {!gon && <p className="m-0 mt-2 text-sm text-soft">
        {/* 14/10: phần nói ĐƯỢC CHẤM (AI chấm theo grille ở trang Kết quả thi, hoặc tự chấm). */}
        {moTa ?? tr("Ghi âm bài nói của bạn. Nộp xong, AI chấm theo thang DELF chính thức ở trang « Kết quả thi »; bạn cũng có thể tự chấm lại theo từng tiêu chí.", "Enregistrez-vous. Après l’envoi, l’IA vous note avec la grille DELF officielle dans « Mes résultats » ; vous pouvez aussi vous auto-évaluer.", "Record yourself. After submitting, the AI grades you with the official DELF grid in « My results »; you can also self-assess.")}
      </p>}

      {gon ? daTai && (!dsCu.length || ghiLai) && !khoa && <NutGhiGon trangThai={trangThai} giay={giay} toiDa={gioiHanGiay} mau={mau} onBam={trangThai === "dangGhi" ? dung : batDau} /> : (
<div className="mt-4 flex flex-wrap items-center gap-3">
        {trangThai !== "dangGhi" ? (
          <button type="button" onClick={batDau} disabled={trangThai === "dangLuu"}
            className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5
                       text-sm font-bold text-on-primary transition hover:opacity-90
                       disabled:cursor-not-allowed disabled:opacity-60">
            {trangThai === "dangLuu"
              ? <><Loader2 size={15} className="mcf-spin" aria-hidden /> {tr("Đang lưu…", "Enregistrement…", "Saving…")}</>
              : <><Mic size={15} aria-hidden /> {dsCu.length ? tr("Ghi lại", "Réenregistrer", "Record again") : tr("Bắt đầu ghi", "Commencer l'enregistrement", "Start recording")}</>}
          </button>
        ) : (
          <button type="button" onClick={dung}
            className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-danger px-5 py-2.5
                       text-sm font-bold text-white transition hover:opacity-90">
            <Square size={15} aria-hidden /> {tr("Dừng", "Arrêter", "Stop")}
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
            <CheckCircle2 size={15} aria-hidden /> {tr("Đã lưu", "Enregistré", "Saved")}
          </span>
        )}
      </div>
      )}

      {loi && (
        <p className="m-0 mt-3 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-bold text-danger">
          <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden /> {loi}
        </p>
      )}

      {/* Danh sách bản ghi. Mới nhất trước, và giữ lại tất cả — nghe lại ba lần
          thu cách nhau vài tuần là cách duy nhất tự thấy mình tiến bộ. */}
      {dsCu.length > 0 && (
        <div className={gon ? "" : "mt-4 border-0 border-t border-solid border-line pt-4"}>
          {!gon && <p className="m-0 text-xs font-bold uppercase tracking-wider text-soft">
            {tr("Bản đã ghi (", "Enregistrements (", "Recordings (")}{dsCu.length})
          </p>}
          <ul className="m-0 mt-2 list-none space-y-2 p-0">
            {(gon ? dsCu.slice(0, 1) : dsCu).map((b) => (
              <li key={b.duongDan} className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => moNghe(b.duongDan)}
                  className="cursor-pointer rounded-lg border-0 bg-surface2 px-3 py-1.5 text-xs
                             font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
                  {tr("Nghe lại", "Réécouter", "Listen again")}
                </button>
                {gon && !khoa && !ghiLai && (
                  <button type="button" onClick={() => { setLoi(""); setGhiLai(true); }}
                    className="cursor-pointer rounded-lg border-0 bg-surface2 px-3 py-1.5 font-sans text-xs font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
                    {tr("Ghi lại", "Réenregistrer", "Record again")}
                  </button>
                )}
                {gon ? <DiemCau nx={nx[b.duongDan]} onLai={() => xinNhanXet(b.duongDan)} /> : (
                <button type="button" onClick={() => xinNhanXet(b.duongDan)} disabled={nx[b.duongDan]?.dang}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs
                             font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60">
                  {nx[b.duongDan]?.dang ? <Loader2 size={13} className="mcf-spin" aria-hidden /> : null}
                  {tr("AI nhận xét", "Avis de l'IA", "AI feedback")}
                </button>
                )}
                {!gon && <span className="text-xs text-soft">
                  {b.luc ? new Date(b.luc).toLocaleString("vi-VN") : b.ten}
                  {b.bytes ? ` · ${Math.round(b.bytes / 1024)} KB` : ""}
                </span>}
                {nx[b.duongDan] && !nx[b.duongDan].dang && <KhungNhanXet kq={nx[b.duongDan]} />}
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

/* Điểm một câu ở Luyện tập. Chấm lỗi thì cho chấm lại: bản ghi vẫn còn, lần lỗi không tốn lượt. */
function DiemCau({ nx, onLai }) {
  if (!nx || nx.dang) return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-soft"><Loader2 size={13} className="mcf-spin" aria-hidden /> {tr("Đang chấm…", "Correction…", "Scoring…")}</span>;
  if (!Number.isInteger(nx.nhan_xet?.diem)) {
    return <button type="button" onClick={onLai} className="cursor-pointer rounded-lg border-0 bg-primary-soft px-3 py-1.5 font-sans text-xs font-semibold text-primary">{tr("Chấm lại", "Réessayer", "Try again")}</button>;
  }
  const d = nx.nhan_xet.diem;
  return <span className={`rounded-lg px-3 py-1.5 text-sm font-extrabold tabular-nums ${d >= 7 ? "bg-ok-soft text-ok" : d >= 5 ? "bg-warn-soft text-warn" : "bg-danger-soft text-danger"}`}>{d}/10</span>;
}

/* Khung hiện nhận xét của AI cho một bản ghi. Không có điểm số — cố ý. */
/* Hàm, không phải hằng: phải đọc ngôn ngữ lúc HIỂN THỊ, không lúc nạp file. */
const LOI = () => ({
  HET_LUOT_VIP: loiTranVip(),
  HET_LUOT: tr("Bạn đã dùng hết 6 lượt AI nhận xét trong 24 giờ. Gói VIP tới 100 lượt AI/ngày.", "Vous avez utilisé vos 6 avis IA des dernières 24 h. Illimité en VIP.", "You've used 6 AI feedbacks in 24 h. Unlimited with VIP."),
  DINH_DANG_KHONG_HO_TRO: tr("Định dạng ghi âm này (thường từ Firefox) chưa nhận xét được, hãy ghi lại bằng Chrome hoặc Edge.", "Ce format (souvent Firefox) n'est pas pris en charge : réenregistrez avec Chrome ou Edge.", "This format (usually Firefox) isn't supported: record again with Chrome or Edge."),
  KHONG_NGHE_RO: tr("AI không nghe được lời nói nào trong bản ghi. Kiểm tra micro rồi ghi lại.", "L'IA n'entend aucune parole. Vérifiez le micro et réenregistrez.", "The AI heard no speech. Check your microphone and record again."),
  CHUA_CAU_HINH_KHOA: tr("Máy chủ chưa bật AI nhận xét, đây là việc của người quản trị.", "L'avis IA n'est pas activé sur le serveur (administrateur).", "AI feedback isn't enabled on the server (admin task)."),
  BAN_GHI_QUA_LON: tr("Bản ghi quá dài để AI nhận xét (tối đa 25 MB).", "Enregistrement trop long pour l'IA (25 Mo max).", "Recording too long for AI feedback (25 MB max)."),
});
function KhungNhanXet({ kq }) {
  if (!kq.ok) {
    return (
      <p className="m-0 flex w-full items-start gap-2 rounded-xl bg-danger-soft p-3 text-xs font-semibold text-danger">
        <AlertTriangle size={14} className="mt-px shrink-0" aria-hidden />
        {LOI()[kq.ma] ?? kq.thong_bao ?? tr(`Không nhận xét được (${kq.ma ?? tr("lỗi", "erreur", "error")}${kq.trang_thai ? " · " + kq.trang_thai : ""}).`, `Avis impossible (${kq.ma ?? tr("lỗi", "erreur", "error")}${kq.trang_thai ? " · " + kq.trang_thai : ""}).`, `Couldn't give feedback (${kq.ma ?? tr("lỗi", "erreur", "error")}${kq.trang_thai ? " · " + kq.trang_thai : ""}).`)}
      </p>
    );
  }
  const n = kq.nhan_xet ?? {};
  return (
    <div className="w-full rounded-xl border border-solid border-line bg-surface2 p-4 text-sm text-ink">
      <p className="m-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
{tr("AI nhận xét · không phải điểm DELF", "Avis de l'IA · pas une note DELF", "AI feedback · not a DELF score")}
      </p>
      <p className="m-0 mt-2 leading-relaxed">{n.tong_quat}</p>
      {n.diem_manh?.length > 0 && (
        <div className="mt-3">
          <p className="m-0 text-xs font-bold text-ok">{tr("Điểm mạnh", "Points forts", "Strengths")}</p>
          <ul className="m-0 mt-1 pl-5 leading-relaxed">{n.diem_manh.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </div>
      )}
      {n.can_sua?.length > 0 && (
        <div className="mt-3">
          <p className="m-0 text-xs font-bold text-warn">{tr("Nên sửa", "À corriger", "To fix")}</p>
          <ul className="m-0 mt-1 space-y-1.5 pl-5 leading-relaxed">
            {n.can_sua.map((x, i) => (
              <li key={i}>{x.trich && <em className="text-soft">« {x.trich} » → </em>}{x.goi_y}</li>
            ))}
          </ul>
        </div>
      )}
      {n.phat_am && <p className="m-0 mt-3"><strong className="text-xs">{tr("Phát âm (phỏng đoán từ bản chép lời):", "Prononciation (déduite de la transcription) :", "Pronunciation (inferred from the transcript):")}</strong> {n.phat_am}</p>}
      {n.luyen_tiep && <p className="m-0 mt-2"><strong className="text-xs">{tr("Luyện tiếp:", "Pour progresser :", "Practice next:")}</strong> {n.luyen_tiep}</p>}
      {n.loi_leon && <LeonNoi cam="co-len" size={56} className="mt-3">{n.loi_leon}</LeonNoi>}
      {kq.chep_loi && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-soft">{tr("Bản chép lời của AI", "Transcription de l'IA", "AI transcript")}</summary>
          <p className="m-0 mt-1 whitespace-pre-wrap text-xs italic text-soft">{kq.chep_loi}</p>
        </details>
      )}
    </div>
  );
}
