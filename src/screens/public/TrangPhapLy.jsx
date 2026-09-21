import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/* Ba trang công khai: Câu hỏi thường gặp · Điều khoản sử dụng · Chính sách bảo mật.
 *
 * ══ MỌI CÂU Ở ĐÂY PHẢI ĐÚNG VỚI MÃ NGUỒN ══
 *
 * Quy tắc 1 của dự án — không bịa dữ liệu — áp cho ba trang này MẠNH HƠN mọi
 * màn hình khác: đây là lời cam kết pháp lý với người dùng. Nên không có câu
 * mẫu chép từ nơi khác. Mỗi khẳng định đối chiếu được, đo ngày 21/09/2026:
 *
 *   · Không có công cụ quảng cáo / phân tích nào: grep gtag, analytics,
 *     posthog, mixpanel, amplitude, hotjar, pixel trên src/ + index.html = 0.
 *   · Bản ghi âm ở bucket RIÊNG `bai-noi` (migration 057).
 *   · Bài viết CHỈ gửi cho Anthropic khi học sinh bấm « Xin gợi ý »
 *     (Edge Function `cham-pe`) — không tự động.
 *   · Thanh toán là CHUYỂN KHOẢN qua mã VietQR, SePay báo về; hệ thống không
 *     bao giờ thấy số thẻ.
 *   · Không có cơ chế tự xoá dữ liệu theo thời hạn — nên chính sách nói thẳng
 *     điều đó, không hứa "xoá sau 12 tháng".
 *
 * Thêm tính năng thu dữ liệu mới (form, tracking, nhà cung cấp mới) mà không
 * sửa trang này là làm trang này nói sai. Đó là việc phải nhớ.
 *
 * ══ ĐÂY LÀ BẢN NHÁP, KHÔNG PHẢI TƯ VẤN PHÁP LÝ ══
 *
 * Viết để ĐÚNG VỚI SẢN PHẨM, chưa qua luật sư. Đặc biệt: Nghị định 13/2023/NĐ-CP
 * về bảo vệ dữ liệu cá nhân có những nghĩa vụ (đánh giá tác động, thông báo
 * khi chuyển dữ liệu ra nước ngoài…) mà một trang văn bản không tự làm thay.
 * Trang này không TUYÊN BỐ đã tuân thủ — nó chỉ mô tả trung thực việc đang làm.
 */

/* Email liên hệ — ĐỂ TRỐNG CÓ CHỦ Ý.
   Chính sách bảo mật bắt buộc có một địa chỉ để người dùng đòi quyền của họ,
   nhưng đưa email cá nhân của ai lên một trang công khai là quyết định của
   người đó, không phải của người viết mã. Điền vào đây là mọi trang tự đổi.
   Trống thì trang HIỆN RÕ là còn thiếu — một chính sách không có chỗ liên hệ
   mà trông như hoàn chỉnh còn tệ hơn một chính sách tự nói nó thiếu. */
export const EMAIL_LIEN_HE = "";

const CAP_NHAT = "21/09/2026";

function LienHe() {
  if (EMAIL_LIEN_HE) {
    return <a href={`mailto:${EMAIL_LIEN_HE}`} className="font-bold text-primary">{EMAIL_LIEN_HE}</a>;
  }
  return (
    <span className="rounded bg-warn-soft px-1.5 py-0.5 font-bold text-warn">
      [chưa công bố email liên hệ]
    </span>
  );
}

function Khung({ tieuDe, children }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link to="/gioi-thieu" className="text-sm font-bold text-primary no-underline">← FRACILE</Link>
        <h1 className="m-0 mt-4 text-3xl font-extrabold tracking-tight text-ink">{tieuDe}</h1>
        <p className="m-0 mt-2 text-xs text-soft">Cập nhật lần cuối: {CAP_NHAT}</p>

        {!EMAIL_LIEN_HE && (
          <p className="m-0 mt-5 flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-3 text-xs leading-relaxed text-warn">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Trang này chưa có địa chỉ liên hệ chính thức. Trong lúc chờ, bạn có thể nhắn cho giáo viên qua tài khoản của mình.</span>
          </p>
        )}

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink">{children}</div>

        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-0 border-t border-solid border-line pt-6 text-sm">
          <Link to="/faq" className="text-soft no-underline hover:text-ink">Câu hỏi thường gặp</Link>
          <Link to="/dieu-khoan" className="text-soft no-underline hover:text-ink">Điều khoản sử dụng</Link>
          <Link to="/bao-mat" className="text-soft no-underline hover:text-ink">Chính sách bảo mật</Link>
        </nav>
      </div>
    </div>
  );
}

function Muc({ ten, children }) {
  return (
    <section>
      <h2 className="m-0 text-lg font-extrabold text-ink">{ten}</h2>
      <div className="mt-2 space-y-3 text-soft [&_strong]:text-ink">{children}</div>
    </section>
  );
}

const P = ({ children }) => <p className="m-0">{children}</p>;
const UL = ({ children }) => <ul className="m-0 list-disc space-y-1.5 pl-5">{children}</ul>;

/* ═══════════════════════════════ FAQ ═══════════════════════════════ */

const HOI_DAP = [
  ["FRACILE là gì?",
   "Một nền tảng luyện thi tiếng Pháp DELF, tập trung vào trình độ B1 và B2: bài tập theo kỹ năng, đề thi thử có đồng hồ, và thẻ Flashcard do giáo viên soạn."],
  ["Điểm thi thử có phải điểm DELF chính thức không?",
   "Không. Đề thi thử mô phỏng cấu trúc và thời gian của kỳ thi thật, nhưng điểm ở đây chỉ để bạn tự đánh giá. Điểm DELF chính thức chỉ do các trung tâm khảo thí được công nhận cấp."],
  ["Ai chấm bài viết của tôi?",
   "Chính bạn — theo thang chấm DELF chính thức, từng tiêu chí một. Bạn có thể xin thêm gợi ý chấm từ AI; gợi ý đó chỉ để đối chiếu, điểm cuối cùng do bạn chốt. Máy chấm tự động các câu trắc nghiệm, điền từ và chia động từ."],
  ["Bài nói có được chấm điểm không?",
   "Không. Kỳ thi thật chấm phần nói qua hội thoại trực tiếp với giám khảo, điều một ứng dụng tự học không mô phỏng được. Bạn ghi âm để tự nghe lại; chúng tôi không đưa ra một con số không có cơ sở."],
  ["Nghe hiểu được nghe mấy lần?",
   "Hai lần, giống kỳ thi thật. Số lần nghe được đếm ở máy chủ nên tải lại trang không làm lại từ đầu."],
  ["Đóng trình duyệt giữa giờ thi thì sao?",
   "Đồng hồ vẫn chạy. Thời điểm bắt đầu được lưu ở máy chủ, như trong phòng thi thật."],
  ["Làm sao để mở khoá bài trả phí?",
   "Chuyển khoản theo mã QR hiện trên bài, giữ nguyên nội dung chuyển khoản. Bài được mở khi hệ thống nhận thông báo giao dịch từ ngân hàng. Nếu đã chuyển mà bài chưa mở, hãy liên hệ để được kiểm tra."],
  ["Tôi có tự tạo Flashcard được không?",
   "Không. Các bộ Flashcard do giáo viên soạn để bảo đảm nội dung chính xác. Bạn chọn một bộ theo kỹ năng rồi luyện."],
  ["Dữ liệu của tôi được dùng vào việc gì?",
   "Chỉ để vận hành việc học của bạn. Chúng tôi không bán dữ liệu và không dùng công cụ quảng cáo hay theo dõi nào. Chi tiết ở trang Chính sách bảo mật."],
];

export function TrangFAQ() {
  return (
    <Khung tieuDe="Câu hỏi thường gặp">
      {HOI_DAP.map(([hoi, dap]) => (
        <Muc key={hoi} ten={hoi}><P>{dap}</P></Muc>
      ))}
      <Muc ten="Chưa thấy câu trả lời?"><P>Liên hệ: <LienHe />.</P></Muc>
    </Khung>
  );
}

/* ═══════════════════════════ ĐIỀU KHOẢN ═══════════════════════════ */

export function TrangDieuKhoan() {
  return (
    <Khung tieuDe="Điều khoản sử dụng">
      <Muc ten="1. Về dịch vụ">
        <P>FRACILE là nền tảng luyện thi tiếng Pháp DELF, do Đỗ Quốc Hùng xây dựng và vận hành. Khi tạo tài khoản hoặc sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây.</P>
      </Muc>

      <Muc ten="2. Tài khoản">
        <UL>
          <li>Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập của mình.</li>
          <li>Mỗi tài khoản dành cho một người học. Không chia sẻ tài khoản cho người khác dùng chung.</li>
          <li>Nếu bạn dưới 16 tuổi, cha mẹ hoặc người giám hộ cần biết và đồng ý cho bạn sử dụng dịch vụ.</li>
        </UL>
      </Muc>

      <Muc ten="3. Điểm số và kết quả">
        <P><strong>Điểm trên FRACILE không phải kết quả DELF chính thức</strong> và không có giá trị thay thế chứng chỉ. Đề thi thử mô phỏng cấu trúc kỳ thi để bạn luyện tập.</P>
        <P>Bài viết do bạn tự chấm theo thang DELF. Gợi ý chấm từ AI chỉ mang tính tham khảo và có thể sai. Bài nói không được chấm điểm.</P>
      </Muc>

      <Muc ten="4. Thanh toán">
        <UL>
          <li>Một số bài tập là nội dung trả phí. Giá hiển thị trên từng bài.</li>
          <li>Thanh toán bằng <strong>chuyển khoản ngân hàng</strong> theo mã QR. Bài được mở khoá sau khi hệ thống nhận thông báo giao dịch.</li>
          <li>Cần giữ nguyên nội dung chuyển khoản để hệ thống nhận ra giao dịch của bạn.</li>
          <li>Nếu chuyển nhầm, chuyển thiếu, hoặc đã chuyển mà bài chưa mở, hãy liên hệ (<LienHe />) để được xử lý.</li>
        </UL>
      </Muc>

      <Muc ten="5. Nội dung">
        <P>Bài tập, đề thi và bộ Flashcard trên FRACILE thuộc về người soạn. Không sao chép hoặc phát tán lại khi chưa được đồng ý.</P>
        <P>Bài viết và bản ghi âm bạn tạo ra vẫn là của bạn.</P>
      </Muc>

      <Muc ten="6. Sử dụng đúng mục đích">
        <P>Không được cố truy cập nội dung trả phí khi chưa mua, can thiệp vào hệ thống chấm điểm, hoặc truy cập dữ liệu của người khác. Tài khoản vi phạm có thể bị khoá.</P>
      </Muc>

      <Muc ten="7. Thay đổi">
        <P>Điều khoản có thể được cập nhật khi dịch vụ thay đổi. Ngày cập nhật ghi ở đầu trang.</P>
      </Muc>

      <Muc ten="8. Liên hệ"><P><LienHe /></P></Muc>
    </Khung>
  );
}

/* ═══════════════════════════ BẢO MẬT ═══════════════════════════ */

export function TrangBaoMat() {
  return (
    <Khung tieuDe="Chính sách bảo mật">
      <Muc ten="Tóm tắt">
        <UL>
          <li>Chúng tôi chỉ thu những gì cần để bạn học.</li>
          <li><strong>Không bán dữ liệu. Không có công cụ quảng cáo hay theo dõi nào.</strong></li>
          <li>Bài viết của bạn chỉ được gửi cho dịch vụ AI khi <strong>chính bạn</strong> bấm « Xin gợi ý ».</li>
          <li>Bạn có quyền xem, sửa và yêu cầu xoá dữ liệu của mình.</li>
        </UL>
      </Muc>

      <Muc ten="1. Chúng tôi thu những gì">
        <P><strong>Tài khoản:</strong> email, tên, tên hiển thị và tên người dùng, ảnh đại diện bạn chọn. Nếu đăng nhập bằng Google, chúng tôi nhận email và tên từ Google.</P>
        <P><strong>Hồ sơ (không bắt buộc):</strong> họ tên, ngày sinh, giới tính, trường, địa chỉ, số điện thoại, trình độ và mục tiêu DELF — chỉ khi bạn tự điền.</P>
        <P><strong>Việc học:</strong> câu trả lời, điểm, thời gian làm bài, kết quả tự chấm, và những ngày bạn học.</P>
        <P><strong>Bản ghi âm bài nói:</strong> lưu ở kho riêng tư, chỉ bạn và giáo viên nghe được — không có đường dẫn công khai.</P>
        <P><strong>Thanh toán:</strong> số tiền, nội dung chuyển khoản và thời điểm giao dịch. Chúng tôi <strong>không</strong> nhận và không lưu số thẻ hay thông tin tài khoản ngân hàng của bạn.</P>
        <P><strong>Trên thiết bị của bạn:</strong> trình duyệt lưu phiên đăng nhập, ngôn ngữ và chế độ sáng/tối để bạn không phải chọn lại. Không dùng cookie quảng cáo.</P>
      </Muc>

      <Muc ten="2. Dùng vào việc gì">
        <UL>
          <li>Cho bạn đăng nhập và lưu tiến độ.</li>
          <li>Chấm các câu tự động, hiện kết quả và lời giải.</li>
          <li>Cho giáo viên theo dõi việc học và mở khoá bài đã mua.</li>
        </UL>
        <P>Không dùng cho quảng cáo, không bán, không chia sẻ cho bên thứ ba vì mục đích thương mại.</P>
      </Muc>

      <Muc ten="3. Những dịch vụ xử lý dữ liệu thay chúng tôi">
        <UL>
          <li><strong>Supabase</strong> — lưu cơ sở dữ liệu, tài khoản và bản ghi âm.</li>
          <li><strong>Vercel</strong> — phục vụ trang web.</li>
          <li><strong>Anthropic</strong> — chỉ khi bạn bấm « Xin gợi ý » ở màn tự chấm bài viết: đề bài và bài viết của bạn được gửi đi để nhận gợi ý chấm. Không có gì được gửi nếu bạn không bấm.</li>
          <li><strong>SePay</strong> — báo cho hệ thống khi có giao dịch chuyển khoản.</li>
          <li><strong>Google</strong> — chỉ khi bạn chọn đăng nhập bằng Google.</li>
        </UL>
        <P>Một số dịch vụ trên đặt máy chủ ở ngoài Việt Nam, nên dữ liệu có thể được lưu trữ hoặc xử lý ở nước ngoài.</P>
      </Muc>

      <Muc ten="4. Lưu trong bao lâu">
        <P>Hiện chưa có cơ chế tự động xoá theo thời hạn: dữ liệu được giữ trong suốt thời gian tài khoản còn tồn tại, hoặc cho tới khi bạn yêu cầu xoá.</P>
      </Muc>

      <Muc ten="5. Quyền của bạn">
        <P>Bạn có quyền xem, sửa, và yêu cầu xoá dữ liệu cá nhân của mình, cũng như rút lại sự đồng ý. Nhiều thông tin hồ sơ bạn tự sửa được ở trang Tài khoản; với các yêu cầu khác, liên hệ: <LienHe />.</P>
      </Muc>

      <Muc ten="6. Người dùng dưới 16 tuổi">
        <P>Nhiều người học DELF là học sinh. Nếu bạn dưới 16 tuổi, cha mẹ hoặc người giám hộ cần biết và đồng ý với việc bạn sử dụng dịch vụ và với chính sách này. Bản ghi âm giọng nói được lưu ở kho riêng tư vì lý do này.</P>
      </Muc>

      <Muc ten="7. Thay đổi">
        <P>Khi dịch vụ bắt đầu thu thêm loại dữ liệu mới hoặc dùng thêm nhà cung cấp mới, trang này sẽ được cập nhật trước. Ngày cập nhật ghi ở đầu trang.</P>
      </Muc>
    </Khung>
  );
}
