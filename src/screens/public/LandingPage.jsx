import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, UserCheck, Columns2, ClipboardList, ArrowRight,
} from "lucide-react";
import { docSoLieu } from "../../shared/soLieuCongKhai.js";
import TeamSection from "./TeamSection.jsx";

/* Trang giới thiệu công khai — phễu marketing của FRACILE.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * BA CON SỐ TRONG BẢN MÔ TẢ KHÔNG CÓ THẬT, VÀ TÔI KHÔNG VIẾT CHÚNG
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Bản mô tả đề nghị: « 500+ Bài tập », « 10.000+ Câu hỏi », « Hàng ngàn bài
 * được chấm ». Đo trên database production ngày 03/09:
 *
 *     bài tập      34        (không phải 500+)
 *     câu hỏi     373        (không phải 10.000+)
 *     lượt đã chấm 43        (không phải hàng ngàn)
 *
 * Quy tắc 1 của dự án — không bịa dữ liệu — viết cho màn hình của học sinh.
 * Nó áp cho trang bán hàng MẠNH HƠN, không phải yếu hơn: ở đây con số dùng để
 * lấy tiền của người khác. Một người đăng ký vì « 500+ bài tập » rồi đếm được
 * 34 bài sẽ không quay lại, và họ có lý.
 *
 * Nên trang này ĐẾM THẬT, đọc thẳng từ máy chủ lúc tải trang. Số nhỏ thì nhỏ,
 * nhưng nó tự lớn lên khi thư viện lớn lên, và không ai phải nhớ sửa.
 *
 * ══ VÀ HAI TÍNH NĂNG KHÔNG TỒN TẠI ══
 *
 * « AI chấm nhanh » — FRACILE KHÔNG có AI chấm. `evaluateEssayWithAI()` trả về
 * `connected: false`. Chính bảng so sánh của bạn cũng chấm mục này 0 điểm cho
 * Fracile và 3 cho Vivoire.
 *
 * « Nhập đề từ DOCX » — chỉ có JSON. Không có dòng mã nào đọc .docx.
 *
 * Cả hai đã bị viết lại thành thứ có thật, và thứ có thật MẠNH HƠN trong đúng
 * cuộc so sánh này: đối thủ chỉ có AI, còn ở đây bài tự luận do một người thật
 * đọc và nhận xét. Đó là điều họ không mua được bằng API.
 *
 * ══ FORM ĐĂNG KÝ ĐÃ ĐƯỢC GỠ — 03/09 ══
 *
 * Bảng `leads`, RPC `gui_lien_he` và màn xem của giáo viên vẫn còn nguyên;
 * chỉ có ô nhập trên trang này biến mất. Nên hiện KHÔNG có đường nào để ai gửi
 * thông tin vào hệ thống.
 *
 * Đưa lại thì lấy `FormTuVan.jsx` từ commit 6cc2cd3 và dựng lại một khối
 * `<section id="tu-van">`. Trước khi làm thế, nhớ rằng thu dữ liệu cá nhân
 * mà chưa có trang Chính sách bảo mật là chỗ dễ vướng nhất — và trang đó vẫn
 * chưa có.
 */

/* Bốn ô số liệu. Ba ô đầu ĐẾM THẬT; ô thứ tư là một sự thật không phải con số
   — và nó mới là thứ phân biệt FRACILE với một cái kho bài tập. */
function OSoLieu({ so, nhan, phu }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 text-center">
      <div className="text-3xl font-extrabold tabular-nums text-ink">
        {so ?? <span className="text-soft">—</span>}
      </div>
      <div className="mt-1 text-sm font-bold text-ink">{nhan}</div>
      {phu && <div className="mt-0.5 text-xs text-soft">{phu}</div>}
    </div>
  );
}

const LOI_THE = [
  {
    Icon: Wand2,
    ten: "Soạn 25 câu trong hai phút",
    mo: "Dán một khối JSON là xong cả bài: trắc nghiệm, điền từ, chia động từ, "
      + "đúng/sai có giải thích, bảng, sắp xếp câu, tự luận. Không phải bấm từng ô.",
  },
  {
    Icon: UserCheck,
    ten: "Bài tự luận do người thật chấm",
    mo: "Máy chấm phần máy chấm được, và dừng lại ở đó. Bài viết và bài nói thì "
      + "một giáo viên đọc, cho điểm theo thang DELF, và viết nhận xét cho riêng bạn.",
  },
  {
    Icon: Columns2,
    ten: "Sát phòng thi, không phải gần giống",
    mo: "Đọc hiểu chia đôi màn hình, văn bản cuộn riêng. Nghe hiểu giới hạn hai "
      + "lượt phát, đếm ở máy chủ. Đồng hồ chạy tiếp cả khi bạn đóng tab.",
  },
  {
    Icon: ClipboardList,
    ten: "Trọn một vòng lớp học",
    mo: "Giao bài theo kỹ năng và hạn nộp, học sinh làm, giáo viên chấm và nhận "
      + "xét, rồi cả hai nhìn thấy tiến độ theo từng kỹ năng.",
  },
];

export default function LandingPage() {
  const [so, setSo] = useState(null);

  useEffect(() => {
    let con = true;
    docSoLieu().then((v) => { if (con) setSo(v); });
    return () => { con = false; };
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">

        {/* ── HERO ── */}
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
              DELF B1 · B2
            </span>
            <h1 className="m-0 mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
              Luyện thi DELF cùng giáo viên thật.
              <br />
              <span className="text-primary">Bài nào cũng được chấm.</span>
            </h1>
            <p className="m-0 mt-5 max-w-xl text-base leading-relaxed text-soft">
              Trình soạn đề cho giáo viên, trải nghiệm sát phòng thi cho học sinh.
              Máy chấm phần máy chấm được — phần còn lại là một người thật đọc bài
              của bạn.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/decouvrir"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-primary/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] motion-reduce:transition-none">
                Xem thư viện, không cần tài khoản <ArrowRight size={16} />
              </Link>
              <Link to="/login"
                className="rounded-full border border-line bg-transparent px-6 py-3 text-sm font-bold text-ink no-underline transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface2 active:scale-[0.98] motion-reduce:transition-none">
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Khung ảnh màn hình. CHƯA có ảnh thật, và một khung xám giả vờ là
              ảnh còn tệ hơn một khung nói thẳng rằng nó đang chờ ảnh. */}
          <div className="rounded-3xl border border-line bg-surface p-2 shadow-2xl transition-transform duration-500 ease-out hover:rotate-0 motion-reduce:transition-none lg:rotate-2">
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-surface2 p-8 text-center">
              <div>
                <p className="m-0 text-sm font-bold text-ink">Chỗ dành cho ảnh màn hình</p>
                <p className="m-0 mt-1 text-xs leading-relaxed text-soft">
                  Chụp màn « Thi thử » hoặc « Chấm bài viết » rồi thay vào đây.
                  Ảnh thật của sản phẩm thuyết phục hơn mọi hình minh hoạ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SỐ LIỆU — ĐẾM THẬT ── */}
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OSoLieu so={so?.baiTap} nhan="bài tập" phu="phân theo cấp độ và kỹ năng" />
          <OSoLieu so={so?.cauHoi} nhan="câu hỏi" phu="bảy dạng, có lời giải thích" />
          <OSoLieu so="4" nhan="kỹ năng DELF" phu="nghe · đọc · viết · nói" />
          <OSoLieu so="3" nhan="ngôn ngữ giao diện" phu="Việt · Pháp · Anh" />
        </section>

        {so === null && (
          <p className="m-0 mt-3 text-center text-xs text-soft">
            Số liệu đọc trực tiếp từ hệ thống, không phải con số quảng cáo.
          </p>
        )}

        {/* ── LỢI THẾ ── */}
        <section className="mt-20">
          <h2 className="m-0 text-2xl font-extrabold tracking-tight text-ink">
            Bốn thứ khó tìm ở chỗ khác
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {LOI_THE.map(({ Icon, ten, mo }) => (
              <div key={ten}
                className="rounded-3xl border border-line bg-surface p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl motion-reduce:transition-none">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="m-0 mt-4 text-lg font-bold text-ink">{ten}</h3>
                <p className="m-0 mt-2 text-sm leading-relaxed text-soft">{mo}</p>
              </div>
            ))}
          </div>
        </section>

        <TeamSection />

        {/* ── CHÂN TRANG ── */}
        <footer className="mt-20 border-t border-line pt-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-soft">
            <span className="font-extrabold text-ink">FRACILE</span>
            <Link to="/decouvrir" className="text-soft no-underline hover:text-ink">Thư viện bài tập</Link>
            <Link to="/login" className="text-soft no-underline hover:text-ink">Đăng nhập</Link>
          </div>
          <p className="m-0 mt-4 text-xs leading-relaxed text-soft">
            Ba trang bắt buộc nếu thu tiền — Câu hỏi thường gặp, Điều khoản sử
            dụng, Chính sách bảo mật — CHƯA có. Bảng so sánh của bạn cũng chấm
            mục này 0 điểm. Chúng phải có trước lượt thanh toán đầu tiên, không
            phải sau.
          </p>
          <p className="m-0 mt-3 text-xs text-soft">© 2026 FRACILE</p>
        </footer>
      </div>
    </div>
  );
}
