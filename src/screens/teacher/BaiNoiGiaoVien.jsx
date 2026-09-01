import React, { useEffect, useState } from "react";
import { Mic, RefreshCw, Send, Check, Clock } from "lucide-react";
import { dsBaiNoiMoiNguoi, duongNghe } from "../../shared/baiNoi.js";
import { loadNames } from "../../shared/peGrading.js";
import { guiThongBao } from "../../shared/notifications.js";

/* Nghe bài nói — màn hình của giáo viên.
 *
 * ══ VÌ SAO Ở ĐÂY KHÔNG CÓ Ô NHẬP ĐIỂM ══
 *
 * Màn « Chấm bài viết » có ô điểm; màn này cố ý không. Production orale của
 * DELF được chấm qua đối thoại với giám khảo — người chấm hỏi lại, đổi hướng,
 * đo phản ứng. Nghe một file ghi âm một chiều rồi cho một con số /25 là gán
 * cái vỏ của một kỳ thi lên một thứ không phải kỳ thi ấy.
 *
 * Nên ở đây chỉ có NGHE và NHẬN XÉT. Một câu nhận xét của giáo viên có ích
 * hơn một con số bịa, và nó trung thực về việc hệ thống đang làm được gì.
 *
 * ══ NHẬN XÉT ĐI ĐƯỜNG THÔNG BÁO ══
 *
 * Không dựng bảng `nhan_xet_bai_noi`. Lý do giống hệt lý do không dựng bảng
 * cho bản ghi âm (xem baiNoi.js): một bảng nữa là một nguồn sự thật nữa để
 * lệch, và ở đây nó còn thừa — hệ thống ĐÃ có đường đưa chữ từ giáo viên tới
 * đúng một học sinh, có chuông báo, có đánh dấu đã đọc. Viết lại đường đó chỉ
 * để chữ nằm ở bảng khác là làm thêm việc và làm hỏng chỗ đang chạy tốt.
 *
 * Đánh đổi thật, nói thẳng: nhận xét không dính vào bản ghi âm. Học sinh nhận
 * được câu chữ ở chuông chứ không thấy nó bên cạnh file. Nên phần mở đầu tin
 * nhắn phải tự nói rõ nó nói về bài nào — xem `soanTin`.
 */

const gio = (ms) =>
  ms ? new Date(ms).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const kb = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB");

/* Tên bài nằm trong tên file: `<exercise_id>-<mốc>.webm`. Hiện id thô thì vô
   nghĩa với người đọc, nhưng giấu hẳn thì hai bản ghi khác bài trông y hệt
   nhau. Nên hiện đoạn đầu, đủ để phân biệt. */
const maBai = (ten) => String(ten).replace(/-\d{10,}\.[a-z0-9]+$/i, "");

/* Mở đầu tin nhắn phải tự đứng được: học sinh đọc nó ở chuông, cách xa màn
   hình bài nói, có khi vài ngày sau. "Bài nói của em rất tốt" mà không nói bài
   nào thì với em nào có ba bản ghi là một câu vô dụng. */
const soanTin = (bai, chu) =>
  `Nhận xét bài nói (${maBai(bai.ten)}, ghi lúc ${gio(bai.luc)}): ${chu.trim()}`;

function TheHocSinh({ nhom, ten }) {
  const [nghe, setNghe] = useState(null);
  const [dangMo, setDangMo] = useState(null);
  const [chon, setChon] = useState(null);          // bài đang được nhận xét
  const [chu, setChu] = useState("");
  const [guiXong, setGuiXong] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const moNghe = async (b) => {
    setDangMo(b.duongDan); setNghe(null);
    const url = await duongNghe(b.duongDan);
    setDangMo(null);
    /* URL ký có thể hỏng vì hết hạn phiên hoặc vì file đã bị dọn tay. Im lặng
       ở đây thì bấm "Nghe" xong không có gì xảy ra và không ai hiểu vì sao. */
    if (!url) { setLoi("Không mở được bản ghi này. Thử tải lại trang."); return; }
    setNghe({ duongDan: b.duongDan, url });
  };

  const gui = async () => {
    if (!chu.trim()) return;
    setDangGui(true); setLoi(""); setGuiXong(false);
    const kq = await guiThongBao({ noiDung: soanTin(chon, chu), ids: [nhom.userId] });
    setDangGui(false);
    /* Đọc kết quả TRƯỚC khi báo thành công. Đây là lỗi đã sống trên production
       ba lần trong dự án này (saveExam, saveExercise, gửi thông báo) — xem
       check-notifs.mjs. */
    if (!kq.ok) {
      setLoi(kq.loi === "khong_phai_giao_vien"
        ? "Tài khoản này không có quyền gửi thông báo."
        : "Không gửi được nhận xét. Kiểm tra mạng rồi thử lại.");
      return;
    }
    setGuiXong(true); setChu(""); setChon(null);
  };

  return (
    <li className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Mic size={15} className="text-primary" />
        <span className="text-sm font-bold text-ink">{ten}</span>
        <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-semibold text-soft">
          {nhom.bai.length} bản ghi
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-soft">
          <Clock size={12} /> mới nhất {gio(nhom.bai[0]?.luc)}
        </span>
      </div>

      <ul className="m-0 mt-4 list-none space-y-2 p-0">
        {nhom.bai.map((b) => (
          <li key={b.duongDan} className="rounded-xl bg-surface2 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink">{maBai(b.ten)}</span>
              <span className="text-xs text-soft">{gio(b.luc)} · {kb(b.bytes)}</span>
              <button type="button" onClick={() => moNghe(b)}
                className="ml-auto rounded-full border-0 bg-surface px-3 py-1.5 text-left text-xs font-bold text-primary">
                {dangMo === b.duongDan ? "Đang mở…" : "Nghe"}
              </button>
              <button type="button" onClick={() => { setChon(b); setGuiXong(false); }}
                className="rounded-full border-0 bg-surface px-3 py-1.5 text-left text-xs font-bold text-ink">
                Nhận xét
              </button>
            </div>

            {/* `key` để React dựng lại thẻ audio khi đổi bản ghi — thiếu nó thì
                nó giữ nguồn cũ và bấm "Nghe" bản khác không đổi gì. */}
            {nghe?.duongDan === b.duongDan && (
              <audio key={nghe.url} controls src={nghe.url} className="mt-2 w-full" />
            )}

            {chon?.duongDan === b.duongDan && (
              <div className="mt-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wide text-soft">
                    Nhận xét <span className="font-normal normal-case">(học sinh nhận ở chuông thông báo)</span>
                  </span>
                  <textarea rows={3} value={chu} onChange={(e) => setChu(e.target.value)}
                    placeholder="Điều em làm được, và một điều nên sửa lần sau."
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink" />
                </label>
                <button type="button" onClick={gui} disabled={dangGui || !chu.trim()}
                  className="mt-2 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2 text-left text-sm font-bold text-white disabled:opacity-50">
                  <Send size={13} /> {dangGui ? "Đang gửi…" : "Gửi nhận xét"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {guiXong && (
        <p className="m-0 mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ok">
          <Check size={12} /> Đã gửi nhận xét tới {ten}.
        </p>
      )}
      {loi && <p className="m-0 mt-3 text-xs font-semibold text-danger">{loi}</p>}
    </li>
  );
}

export default function BaiNoiGiaoVien() {
  const [nhoms, setNhoms] = useState(null);
  const [ten, setTen] = useState({});
  const [loi, setLoi] = useState("");

  const tai = async () => {
    setNhoms(null); setLoi("");
    const ds = await dsBaiNoiMoiNguoi();
    setNhoms(ds);
    setTen(await loadNames(ds.map((x) => x.userId)));
  };

  useEffect(() => { tai(); }, []);

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Bài nói của học sinh</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Phần nói không được chấm điểm. Bạn nghe và nhận xét — thế là đủ.
          </p>
        </div>
        <button type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {loi && (
        <p className="m-0 mt-5 rounded-xl bg-danger-soft p-4 text-sm font-semibold text-ink">{loi}</p>
      )}

      {nhoms === null ? (
        <p className="mt-8 text-center text-sm text-soft">Đang tải…</p>
      ) : nhoms.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Chưa có bản ghi nào</p>
          <p className="m-0 mt-1 text-sm text-soft">
            Bài nói xuất hiện ở đây sau khi một đề thi thử có phần « Production
            orale » và học sinh ghi âm phần đó.
          </p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none space-y-4 p-0">
          {nhoms.map((n) => (
            <TheHocSinh key={n.userId} nhom={n} ten={ten[n.userId] ?? "Học sinh"} />
          ))}
        </ul>
      )}
    </div>
  );
}
