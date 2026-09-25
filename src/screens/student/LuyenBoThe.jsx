import React, { useEffect, useState } from "react";
import { ArrowLeft, Check, AlertTriangle, CalendarClock } from "lucide-react";
import { hocBo } from "../../shared/boThe.js";
import { chamThe } from "../../shared/theGhiNho.js";
import { MUC, xepLichOn, ngayCong } from "../../shared/sm2.js";
/* Dùng lại thẻ lật 3D đã có thay vì dựng bản lật tại chỗ thứ hai. Nó là thành
   phần trình bày thuần — nhận mọi thứ qua props, không chạm storageShim — và
   đã được check:css canh đủ bốn lớp 3D, check:sm2 canh chồng thẻ.

   Đây là lý do TheLat3D.jsx sống sót đợt gỡ « Thẻ ghi nhớ » ngày 09/09: thứ
   bị bỏ là màn ôn SM-2 cũ, không phải cách vẽ một cái thẻ. */
import TheLat3D from "./TheLat3D.jsx";

/* Màn luyện một bộ Flashcard — CÓ LỊCH ÔN từ 21/09 (migration 089).
 *
 * ══ VÌ SAO ══
 *
 * Bản trước có hai nút « Chưa nhớ » / « Nhớ rồi » mà KHÔNG GHI GÌ: bấm xong là
 * quên. Hai cái nút trông như đang theo dõi việc học mà thật ra không. Bộ máy
 * SM-2 thì đã có sẵn và đã kiểm (`shared/sm2.js`, 57 ca) — nó chỉ mất màn hình
 * khi thẻ-sinh-từ-lỗi-sai bị gỡ. Nối lại vào đây thay vì viết bộ máy thứ hai.
 *
 * ══ CHỈ HIỆN THẺ ĐẾN HẠN ══
 *
 * Mở bộ là thấy những thẻ đến hạn HÔM NAY, không phải cả bộ. Hiện cả bộ mỗi
 * lần thì lịch ôn thành đồ trang trí: người ta ôn lại thẻ vừa nhớ hôm qua, và
 * thẻ sắp quên chìm giữa đám thẻ đã thuộc. Hết thẻ đến hạn thì nói lần ôn tới
 * là ngày nào — "xong" mà không nói bao giờ quay lại là để người ta tự đoán.
 *
 * ══ BỐN NÚT, KHÔNG PHẢI HAI ══
 *
 * Quyết định đã ghi ở CLAUDE.md từ 02/09: ba nút thì nút thấp nhất vẫn là "nhớ
 * được, hơi khó", và không có cách nói "quên sạch" — mà chính vế đó (q < 3) mới
 * đặt lại quãng và tăng `lapses`. Hai nút còn tệ hơn: "Nhớ rồi" không phân biệt
 * được nhớ ngay với nhớ sau mười giây vật lộn, nên thẻ khó được xếp lịch thưa
 * như thẻ dễ.
 *
 * Nút CHỈ hiện SAU khi lật. Hiện sớm thì người học chọn theo cảm giác trước cả
 * khi thử nhớ — mà chính lúc cố nhớ mới là lúc trí nhớ được củng cố.
 *
 * ══ KHÔNG CHẤM ĐIỂM PHÁT ÂM ══
 *
 * Bản thiết kế gốc có ô « SCORE 68 ». Không dựng: không có mô hình giọng nói nào
 * trong dự án, và một con số vẽ ra ở đó là số bịa (quy tắc 1).
 *
 * ══ KHÔNG CÓ NÚT « NGHE » ══
 *
 * Bản trước có một nút Nghe không gắn `onClick` — nó chưa lộ ra chỉ vì chưa thẻ
 * nào có file âm thanh. Màn soạn cũng chưa có chỗ tải âm thanh lên. Một nút phát
 * bấm vào im lặng là ngõ cụt; nên gỡ hẳn, dựng lại cùng lúc với đường tải lên.
 */

const THU_TU = ["lai", "kho", "tot", "de"];

/* Màu cho bốn nút — token, tự đảo sáng/tối. "Quên rồi" mang màu nguy hiểm vì
   đó là nút duy nhất đặt lại quãng ôn; người bấm nên biết nó nặng hơn ba nút kia. */
const KIEU_NUT = {
  lai: "bg-danger-soft text-danger",
  kho: "bg-warn-soft text-warn",
  tot: "bg-primary-soft text-primary",
  de:  "bg-ok-soft text-ok",
};

function ThanhTienDo({ xong, tong }) {
  const pct = tong ? Math.round((xong / tong) * 100) : 0;
  return (
    <div className="mt-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="m-0 mt-1 text-right text-[11px] font-bold tabular-nums text-soft">
        {xong}/{tong} thẻ đến hạn hôm nay
      </p>
    </div>
  );
}

/* "2026-09-24" → "24/09". Cắt chuỗi, KHÔNG qua `new Date()`: parse một chuỗi
   ngày trần là parse theo UTC, và ở Việt Nam trước 7 giờ sáng nó lùi mất một
   ngày — cùng họ với bẫy `toISOString` mà `check:sm2` đang canh. */
const ngayNgan = (s) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "");

export default function LuyenBoThe({ bo, onThoat }) {
  const [tatCa, setTatCa] = useState(undefined);   // undefined tải · null lỗi · [] rỗng
  const [hang, setHang] = useState([]);            // thẻ đến hạn, theo thứ tự SM-2
  const [lat, setLat] = useState(false);
  const [xong, setXong] = useState(0);
  const [tongPhien, setTongPhien] = useState(0);
  const [dangGhi, setDangGhi] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    let con = true;
    setTatCa(undefined); setHang([]); setLat(false); setXong(0); setLoi("");
    hocBo(bo?.id).then((v) => {
      if (!con) return;
      setTatCa(v);
      if (Array.isArray(v)) {
        const denHan = xepLichOn(v, ngayCong(0));
        setHang(denHan);
        setTongPhien(denHan.length);
      }
    });
    return () => { con = false; };
  }, [bo?.id]);

  const the = hang[0] ?? null;

  const cham = async (khoa) => {
    if (!the || dangGhi) return;
    setDangGhi(true); setLoi("");
    const kq = await chamThe(the, MUC[khoa].q);
    setDangGhi(false);

    /* Ghi hỏng thì DỪNG LẠI ở thẻ này, không lật sang thẻ sau. Lật sang là nói
       với người học rằng lần ôn đã được ghi — và ngày mai thẻ đó vẫn đến hạn
       mà không ai hiểu vì sao. Đọc kết quả trước khi nói đã xong: lần thứ năm
       trong dự án. */
    if (!kq.ok) { setLoi("Không lưu được lần ôn này: " + kq.loi); return; }

    /* Cập nhật lịch trong bộ nhớ luôn, để màn « hết thẻ » tính được lần ôn tới
       mà không phải gọi lại máy chủ. */
    setTatCa((ds) => ds.map((x) => (x.card_id === the.card_id ? { ...x, ...kq.moi } : x)));
    /* "Quên rồi" đưa thẻ về CUỐI hàng trong buổi này — gặp lại trước khi rời
       màn, lúc vừa kịp quên. Ba nút kia đưa thẻ ra khỏi buổi hôm nay. */
    setHang((h) => (khoa === "lai" ? [...h.slice(1), { ...the, ...kq.moi }] : h.slice(1)));
    if (khoa !== "lai") setXong((v) => v + 1);
    setLat(false);
  };

  /* Lần ôn gần nhất trong tương lai — cho màn « xong hôm nay ». */
  const lanToi = Array.isArray(tatCa) && tatCa.length
    ? tatCa.map((x) => x.due_at).filter(Boolean).sort()[0]
    : null;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <button
        type="button"
        onClick={onThoat}
        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 text-left font-sans text-xs font-bold text-ink"
      >
        <ArrowLeft size={13} /> Flashcard
      </button>

      <h1 className="m-0 mt-4 text-2xl font-extrabold tracking-tight text-ink">{bo?.ten}</h1>
      {tongPhien > 0 && <ThanhTienDo xong={xong} tong={tongPhien} />}

      {tatCa === undefined ? (
        <p className="m-0 py-16 text-center text-sm text-soft">Đang tải thẻ…</p>
      ) : tatCa === null ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không mở được bộ thẻ này</p>
          <p className="m-0 mt-1 text-sm text-ink">Kiểm tra kết nối rồi thử lại.</p>
        </div>
      ) : tatCa.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="m-0 font-bold text-ink">Bộ này chưa có thẻ nào</p>
          <p className="m-0 mt-1 text-sm text-soft">Giáo viên chưa thêm thẻ vào đây.</p>
        </div>
      ) : !the ? (
        /* Hết thẻ đến hạn. Nói NGÀY quay lại — "xong" mà không nói bao giờ
           quay lại thì người ta hoặc mở lại liên tục, hoặc quên luôn bộ này. */
        <div className="mt-8 rounded-3xl border border-line bg-surface p-10 text-center">
          {tongPhien > 0
            ? <Check size={26} className="mx-auto text-ok" />
            : <CalendarClock size={26} className="mx-auto text-primary" />}
          <p className="m-0 mt-3 text-lg font-extrabold text-ink">
            {tongPhien > 0 ? "Xong phần hôm nay" : "Hôm nay không có thẻ nào đến hạn"}
          </p>
          <p className="m-0 mt-1 text-sm text-soft">
            {tongPhien > 0 && `Bạn đã ôn ${xong} thẻ. `}
            {lanToi && `Lần ôn tới: ${ngayNgan(lanToi)}.`}
          </p>
        </div>
      ) : (
        <>
          {/* `conLai` vẽ chồng thẻ phía sau theo SỐ THẺ CÒN LẠI thật, không vẽ
              cứng hai cái — vẽ cứng là nói dối bằng hình ảnh khi chỉ còn một thẻ. */}
          <TheLat3D
            mat={the.matTruoc /* phiên âm gỡ khỏi mặt thẻ 25/09 theo chủ dự án */}
            sau={the.matSau}
            viDu={the.viDu}
            daLat={lat}
            onLat={() => setLat((v) => !v)}
            conLai={hang.length - 1}
          />

          {loi && (
            <p className="m-0 mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{loi}</p>
          )}

          {lat && (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {THU_TU.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => cham(k)}
                  disabled={dangGhi}
                  className={`rounded-2xl border-0 px-3 py-3 text-center font-sans text-sm font-bold disabled:opacity-60 ${KIEU_NUT[k]}`}
                >
                  {MUC[k].nhan}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
