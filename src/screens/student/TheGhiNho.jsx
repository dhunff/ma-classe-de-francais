import React, { useEffect, useMemo, useState } from "react";
import {
  Layers, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Plus,
  BookOpen, Headphones, PenLine, Lightbulb, ChevronRight, ArrowLeft,
} from "lucide-react";
import { docTheDenHan, sinhTheTuLoiSai, chamThe } from "../../shared/theGhiNho.js";
import { MUC } from "../../shared/sm2.js";
import TheLat3D from "./TheLat3D.jsx";
import OTaoThe from "./OTaoThe.jsx";

/* Thẻ ghi nhớ — buổi ôn của học sinh.
 *
 * ══ HAI MÀN, KHÔNG PHẢI MỘT ══
 *
 * Danh sách BỘ THẺ trước, rồi mới vào ôn. Vào thẳng một thẻ ngẫu nhiên trong
 * cả đống là không cho người học chọn hôm nay muốn ôn gì — mà "hôm nay tôi tập
 * trung phần nghe" là một quyết định học tập tử tế.
 *
 * ══ BỘ THẺ SUY RA TỪ DỮ LIỆU, KHÔNG CÓ BẢNG `decks` ══
 *
 * Bản mô tả vẽ danh sách bộ thẻ như một khái niệm riêng. Ở đây thẻ sinh từ câu
 * làm sai, nên nhóm tự nhiên đã có sẵn: theo NGUỒN (`kind` / `nguon`). Dựng
 * thêm bảng `decks` nghĩa là phải có màn tạo bộ, màn gán thẻ vào bộ, và một
 * quyết định "thẻ này thuộc bộ nào" mà không ai muốn trả lời.
 *
 * Suy từ dữ liệu thì bộ thẻ luôn đúng và luôn tự cập nhật. Đánh đổi: không tự
 * đặt tên bộ được. Chấp nhận, cho tới khi có ai đó thật sự cần.
 *
 * ══ MỘT THẺ MỘT MÀN HÌNH, LẬT TRƯỚC CHẤM SAU ══
 *
 * Bốn nút chỉ hiện SAU khi lật. Hiện sớm thì người học liếc thấy chúng và bắt
 * đầu chọn theo cảm giác trước cả khi thử nhớ — mà chính lúc cố nhớ mới là lúc
 * trí nhớ được củng cố.
 *
 * ══ BỐN NÚT, KHÔNG PHẢI BA ══
 *
 * Bản mô tả đề nghị ba nút (Hard / Medium / Easy). Ba nút thì nút thấp nhất
 * vẫn là "nhớ được, hơi khó" — không có cách nào nói "tôi QUÊN SẠCH". Trong
 * SM-2, chính vế đó (q < 3) mới đặt lại quãng về 1 ngày và tăng `lapses`.
 * Thiếu nó thì một thẻ đã quên vẫn được xếp lịch thưa dần, và người học gặp
 * lại nó đúng vào lúc đã quên lần nữa.
 *
 * Nên giữ bốn: Quên rồi · Khó · Tốt · Dễ. Đây là khác biệt CÓ CHỦ ĐÍCH so với
 * bản mô tả, không phải bỏ sót. */

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

/* Gradient cho thẻ bộ. NGOẠI LỆ có chủ ý với quy tắc 2 (màu đi qua token),
   cùng loại với `STAT_GRADIENTS` và `LEVEL_COLORS` đã có: đây là mã màu nhận
   dạng của từng bộ, không phải màu giao diện, nên không đảo theo bản tối.
   Chữ luôn trắng nên tương phản không phụ thuộc chủ đề. */
const BO = {
  loi_sai:  { ten: "Từ lỗi sai", Icon: Lightbulb,
              nen: "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30" },
  tu_tao:   { ten: "Thẻ tự tạo", Icon: PenLine,
              nen: "bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-500/30" },
  nghe:     { ten: "Nghe hiểu", Icon: Headphones,
              nen: "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30" },
  doc:      { ten: "Đọc hiểu", Icon: BookOpen,
              nen: "bg-gradient-to-br from-fuchsia-500 to-purple-500 shadow-lg shadow-fuchsia-500/30" },
};

/* Xếp thẻ vào bộ. Thẻ tự tạo đứng riêng; còn lại gom theo nguồn.
   Bộ RỖNG bị loại: một thẻ bộ ghi "0 thẻ" chỉ tổ làm người ta bấm vào rồi
   quay ra. */
function chiaBo(ds) {
  const nhom = new Map();
  for (const t of ds ?? []) {
    const k = t.nguon === "tu_tao" ? "tu_tao" : "loi_sai";
    if (!nhom.has(k)) nhom.set(k, []);
    nhom.get(k).push(t);
  }
  return [...nhom.entries()]
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => ({ khoa: k, ...BO[k], the: v }))
    .sort((a, b) => b.the.length - a.the.length);
}

function TheBo({ bo, onMo }) {
  const { Icon } = bo;
  return (
    <button type="button" onClick={onMo}
      className={`relative w-full overflow-hidden rounded-3xl border-0 p-5 text-left ${bo.nen}`}>
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
        <Icon size={20} className="text-white" />
      </div>
      <div className="mt-14 text-xs font-bold uppercase tracking-wide text-white/70">Thẻ ghi nhớ</div>
      <div className="text-lg font-extrabold text-white">{bo.ten}</div>
      <div className="text-sm text-white/80">{bo.the.length} thẻ tới hạn</div>

      <span aria-hidden
        className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white/25">
        <ChevronRight size={18} className="text-white" />
      </span>
    </button>
  );
}

export default function TheGhiNho() {
  const [ds, setDs] = useState(undefined);   // undefined = đang tải, null = lỗi
  const [boDangOn, setBoDangOn] = useState(null);
  const [i, setI] = useState(0);
  const [lat, setLat] = useState(false);
  const [dangGhi, setDangGhi] = useState(false);
  const [loi, setLoi] = useState("");
  const [daOn, setDaOn] = useState(0);
  const [dangSinh, setDangSinh] = useState(false);
  const [tinSinh, setTinSinh] = useState("");
  const [moTao, setMoTao] = useState(false);

  const tai = async () => {
    setDs(undefined); setLoi(""); setI(0); setLat(false);
    setDs(await docTheDenHan());
  };

  /* ── LẦN ĐẦU MỞ MÀN: TỰ TÌM THẺ, KHÔNG BẮT BẤM NÚT ──
   *
   * Người đã làm hàng trăm câu TRƯỚC khi có tính năng này mở màn ra và thấy
   * "không có thẻ nào" — đúng chữ, sai hoàn toàn về ý: lỗi sai của họ nằm sẵn
   * trong database, chỉ là chưa ai đi lấy. Đo được 02/09: tài khoản có 111 câu
   * trả lời, database 0 thẻ.
   *
   * `daTuTim` chặn vòng lặp: thiếu nó thì mỗi lần trả về 0 thẻ lại kích một
   * lượt tìm nữa, mãi mãi. */
  const [daTuTim, setDaTuTim] = useState(false);
  useEffect(() => {
    if (daTuTim || !Array.isArray(ds) || ds.length > 0) return;
    setDaTuTim(true);
    (async () => {
      const kq = await sinhTheTuLoiSai(50);
      if (kq.ok && kq.soThe > 0) tai();
    })();
  }, [ds, daTuTim]);

  useEffect(() => { tai(); }, []);

  const cacBo = useMemo(() => chiaBo(Array.isArray(ds) ? ds : []), [ds]);
  const dsOn = boDangOn ? (cacBo.find((b) => b.khoa === boDangOn)?.the ?? []) : [];
  const the = dsOn[i];

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

  /* ── Đang ôn một bộ ── */
  if (boDangOn) {
    const bo = cacBo.find((b) => b.khoa === boDangOn);
    return (
      <div className="mx-auto max-w-2xl py-6">
        <button type="button" onClick={() => { setBoDangOn(null); setI(0); setLat(false); }}
          className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
          <ArrowLeft size={14} /> Tất cả bộ thẻ
        </button>

        {!the ? (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
            <CheckCircle2 size={24} className="mx-auto text-ok" />
            <p className="m-0 mt-2 font-bold text-ink">
              {daOn > 0 ? `Xong rồi — ${daOn} thẻ hôm nay.` : "Bộ này không còn thẻ nào tới hạn."}
            </p>
            <p className="m-0 mt-1 text-sm text-soft">
              Thẻ tiếp theo sẽ tự hiện đúng ngày cần ôn lại.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-soft">
              <Layers size={13} /> {bo?.ten} · còn {dsOn.length - i} thẻ
              {daOn > 0 && <span>· đã ôn {daOn}</span>}
            </div>

            {/* `key` để React dựng lại thẻ khi sang thẻ mới — thiếu nó thì
                trạng thái lật dính lại từ thẻ trước. */}
            <TheLat3D key={the.card_id}
              mat={the.front} sau={the.back} viDu={the.viDu}
              daLat={lat} onLat={() => setLat((v) => !v)}
              conLai={dsOn.length - i} />

            {lat && (
              <>
                <p className="m-0 mt-6 text-center text-xs text-soft">
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

  /* ── Danh sách bộ thẻ ── */
  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-ink">Thẻ ghi nhớ</h1>
          <p className="m-0 mt-1 text-sm text-soft">
            Thẻ sinh từ chính những câu bạn làm sai. Ôn đúng lúc sắp quên.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMoTao(true)}
            className="inline-flex items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 text-left text-sm font-bold text-white">
            <Plus size={14} /> Thẻ mới
          </button>
          <button type="button" onClick={tai}
            className="inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-4 py-2 text-left text-sm font-semibold text-ink">
            <RefreshCw size={14} /> Tải lại
          </button>
        </div>
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
      ) : cacBo.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-8 text-center">
          <CheckCircle2 size={24} className="mx-auto text-ok" />
          <p className="m-0 mt-2 font-bold text-ink">
            {daOn > 0 ? `Xong rồi — ${daOn} thẻ hôm nay.` : "Hôm nay không có thẻ nào tới hạn."}
          </p>
          <p className="m-0 mt-1 text-sm text-soft">
            {daOn > 0
              ? "Thẻ tiếp theo sẽ tự hiện đúng ngày cần ôn lại."
              : daTuTim
                ? "Đã tìm trong những bài bạn từng làm: không còn câu sai nào chưa thành thẻ. Làm thêm vài bài, hoặc tự tạo một thẻ."
                : "Đang tìm trong những câu bạn từng làm sai…"}
          </p>
          <button type="button" onClick={sinh} disabled={dangSinh}
            className="mt-4 inline-flex items-center gap-2 rounded-full border-0 bg-surface2 px-5 py-2.5 text-left text-sm font-bold text-ink disabled:opacity-50">
            <Sparkles size={14} /> {dangSinh ? "Đang tìm…" : "Tìm lại trong bài đã làm"}
          </button>
          {tinSinh && <p className="m-0 mt-3 text-sm text-soft">{tinSinh}</p>}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {cacBo.map((b) => (
            <TheBo key={b.khoa} bo={b} onMo={() => { setBoDangOn(b.khoa); setI(0); setLat(false); }} />
          ))}
        </div>
      )}

      <OTaoThe mo={moTao} onDong={() => setMoTao(false)} onXong={() => { setMoTao(false); tai(); }} />
    </div>
  );
}
