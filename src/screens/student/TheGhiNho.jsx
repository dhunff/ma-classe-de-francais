import React, { useEffect, useState } from "react";
import { Layers, Sparkles, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { docTheDenHan, sinhTheTuLoiSai, chamThe } from "../../shared/theGhiNho.js";
import { MUC } from "../../shared/sm2.js";

/* Thẻ ghi nhớ — buổi ôn của học sinh.
 *
 * ══ MỘT THẺ MỘT MÀN HÌNH ══
 *
 * Không hiện danh sách. Thấy trước mười thẻ tiếp theo là biết mình còn bao lâu
 * nữa mới xong, và cả buổi ôn biến thành việc phải làm cho hết. Một thẻ mỗi
 * lần thì mỗi lần là một câu hỏi thật.
 *
 * ══ LẬT THẺ TRƯỚC, CHẤM SAU ══
 *
 * Bốn nút chỉ hiện SAU khi lật. Hiện sớm thì người học liếc thấy chúng và bắt
 * đầu chọn theo cảm giác trước cả khi thử nhớ — mà chính lúc cố nhớ mới là lúc
 * trí nhớ được củng cố. Toàn bộ giá trị của thẻ ghi nhớ nằm ở khoảnh khắc đó.
 *
 * ══ KHÔNG NÓI "ĐÚNG" HAY "SAI" ══
 *
 * Bốn nút mô tả CẢM GIÁC nhớ, không phải kết quả. SM-2 cần biết "khó hay dễ",
 * và đó là thứ chỉ người học tự biết. Hỏi "bạn có đúng không" thì nhận về một
 * câu trả lời khác hẳn câu thuật toán cần.
 */

const THU_TU = ["lai", "kho", "tot", "de"];

/* Màu mang NGHĨA, không trang trí: từ "quên" tới "dễ" là một dải liên tục, nên
   màu cũng phải là một dải. Bốn màu ngẫu nhiên thì người dùng phải đọc chữ mỗi
   lần thay vì nhận ra vị trí. */
const MAU = {
  lai: "bg-danger-soft text-ink",
  kho: "bg-warn-soft text-ink",
  tot: "bg-primary text-white",
  de:  "bg-ok-soft text-ink",
};

export default function TheGhiNho() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [i, setI] = useState(0);
  const [lat, setLat] = useState(false);
  const [dangGhi, setDangGhi] = useState(false);
  const [loi, setLoi] = useState("");
  const [daOn, setDaOn] = useState(0);
  const [dangSinh, setDangSinh] = useState(false);
  const [tinSinh, setTinSinh] = useState("");

  const tai = async () => {
    setDs(undefined); setLoi(""); setI(0); setLat(false);
    setDs(await docTheDenHan());
  };

  useEffect(() => { tai(); }, []);

  const the = Array.isArray(ds) ? ds[i] : null;

  const cham = async (khoa) => {
    if (!the || dangGhi) return;
    setDangGhi(true); setLoi("");
    const kq = await chamThe(the, MUC[khoa].q);
    setDangGhi(false);
    /* Đọc kết quả TRƯỚC khi sang thẻ tiếp. Bỏ qua thì thẻ biến mất khỏi màn
       hình, người học tin đã ôn xong, và ngày mai nó quay lại y nguyên. */
    if (!kq.ok) {
      setLoi("Không ghi được kết quả. Kiểm tra mạng rồi bấm lại — thẻ này chưa được tính.");
      return;
    }
    setDaOn((n) => n + 1);
    setLat(false);
    setI((n) => n + 1);
  };

  const sinh = async () => {
    setDangSinh(true); setTinSinh("");
    const kq = await sinhTheTuLoiSai(20);
    setDangSinh(false);
    if (!kq.ok) { setTinSinh("Không tạo được thẻ. Thử lại sau."); return; }
    setTinSinh(kq.soThe > 0
      ? `Đã tạo ${kq.soThe} thẻ mới từ những câu bạn làm sai.`
      : "Chưa có câu sai nào chưa thành thẻ. Làm thêm vài bài rồi quay lại.");
    if (kq.soThe > 0) tai();
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Thẻ ghi nhớ</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Thẻ sinh từ chính những câu bạn làm sai. Ôn đúng lúc sắp quên.
          </p>
        </div>
        <button type="button" onClick={tai}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <RefreshCw size={14} /> Tải lại
        </button>
      </div>

      {ds === undefined ? (
        <p className="mt-10 text-center text-sm text-soft">Đang tải…</p>
      ) : ds === null ? (
        /* "Không đọc được" KHÁC "không còn thẻ nào". Gộp lại là chúc mừng
           người vừa gặp sự cố. */
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">Không đọc được danh sách thẻ</p>
          <p className="m-0 mt-1 text-sm text-ink">
            Kiểm tra kết nối, và chắc chắn bạn còn đang đăng nhập.
          </p>
        </div>
      ) : !the ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <CheckCircle2 size={24} className="mx-auto text-ok" />
          <p className="m-0 mt-2 font-bold text-ink">
            {daOn > 0 ? `Xong rồi — ${daOn} thẻ hôm nay.` : "Hôm nay không có thẻ nào tới hạn."}
          </p>
          <p className="m-0 mt-1 text-sm text-soft">
            {daOn > 0
              ? "Thẻ tiếp theo sẽ tự hiện đúng ngày cần ôn lại."
              : "Thẻ mới sinh ra từ câu bạn làm sai. Bấm bên dưới để tìm."}
          </p>
          <button type="button" onClick={sinh} disabled={dangSinh}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 text-left text-sm font-bold text-white disabled:opacity-50">
            <Sparkles size={14} /> {dangSinh ? "Đang tìm…" : "Tạo thẻ từ lỗi sai"}
          </button>
          {tinSinh && <p className="m-0 mt-3 text-sm text-soft">{tinSinh}</p>}
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-soft">
            <Layers size={13} />
            Còn {ds.length - i} thẻ
            {daOn > 0 && <span>· đã ôn {daOn}</span>}
          </div>

          {/* `key` để React dựng lại thẻ khi sang thẻ mới — thiếu nó thì trạng
              thái lật có thể dính lại từ thẻ trước. */}
          <div key={the.card_id}
            className="mt-3 rounded-2xl border border-line bg-surface p-8">
            <p className="m-0 text-center text-lg font-bold leading-relaxed text-ink">
              {the.front}
            </p>

            {lat ? (
              <>
                <hr className="my-6 border-0 border-t border-line" />
                <p className="m-0 text-center text-sm leading-relaxed text-ink">{the.back}</p>
              </>
            ) : (
              <button type="button" onClick={() => setLat(true)}
                className="mt-6 w-full rounded-full border-0 bg-surface2 px-6 py-3 text-center text-sm font-bold text-ink">
                Lật thẻ
              </button>
            )}
          </div>

          {lat && (
            <>
              <p className="m-0 mt-5 text-center text-xs text-soft">
                Bạn nhớ nó dễ hay khó? Câu trả lời quyết định bao giờ gặp lại.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {THU_TU.map((k) => (
                  <button key={k} type="button" onClick={() => cham(k)} disabled={dangGhi}
                    className={`rounded-2xl border-0 px-4 py-3 text-center text-sm font-bold disabled:opacity-50 ${MAU[k]}`}>
                    {MUC[k].nhan}
                  </button>
                ))}
              </div>
            </>
          )}

          {loi && (
            <p className="m-0 mt-4 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-ink">{loi}</p>
          )}
        </>
      )}
    </div>
  );
}
