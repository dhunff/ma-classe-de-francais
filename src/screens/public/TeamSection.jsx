import React from "react";
import { Code2, BadgeCheck } from "lucide-react";
import { DOI_NGU } from "./doiNgu.js";

/* Khối « Đội ngũ chuyên môn » của trang giới thiệu.
 *
 * ══ RỖNG THÌ KHÔNG HIỆN GÌ ══
 *
 * `DOI_NGU` bắt đầu là mảng rỗng (xem doiNgu.js để biết vì sao), và khi rỗng
 * thì cả khối biến mất. Không có ô giữ chỗ, không có "đang cập nhật", không có
 * gương mặt mượn. Một trang bán hàng thiếu một mục thì chỉ là ngắn hơn; một
 * trang bán hàng có ba giáo viên không tồn tại thì là chuyện khác.
 *
 * Nhận `ds` qua props để /preview.html bơm dữ liệu giả vào mà không phải chạm
 * tệp thật — cùng nếp với `chuoiFixture` ở StudentDashboard.
 *
 * ══ ẢNH: TỰ CHỤP, HOẶC CHỮ CÁI ĐẦU ══
 *
 * Không dùng dịch vụ ảnh đại diện ngẫu nhiên. Chúng phục vụ chân dung của
 * người thật, và gắn nhãn "giáo viên của chúng tôi" lên khuôn mặt một người
 * không quen biết là chuyện không làm được.
 *
 * Thiếu ảnh thì hiện chữ cái đầu trên nền gradient — trung thực, và trông vẫn
 * gọn. Đây cũng đúng cách `avatars.jsx` đã xử lý cho học sinh từ lâu.
 */

/* Sáu sắc cho ảnh giữ chỗ, chọn theo tên nên mỗi người luôn ra cùng một màu.
   Ngẫu nhiên mỗi lần dựng thì cùng một giáo viên đổi màu sau mỗi lần tải, và
   mắt đọc đó là "trang bị lỗi".

   NGOẠI LỆ có chủ ý với quy tắc 2, cùng loại với STAT_GRADIENTS: đây là màu
   nhận dạng, chữ luôn trắng nên tương phản không phụ thuộc sáng/tối. */
const SAC = [
  "from-indigo-500 to-purple-600",
  "from-blue-400 to-blue-600",
  "from-fuchsia-500 to-purple-500",
  "from-pink-400 to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
];
const sacCua = (ten) => {
  let n = 0;
  for (const c of String(ten)) n = (n + c.codePointAt(0)) % SAC.length;
  return SAC[n];
};

/* Chữ cái đầu của hai từ CUỐI — tiếng Việt để tên sau họ, nên "Nguyễn Thu Hà"
   ra "TH" chứ không phải "NT".

   Lọc những từ không bắt đầu bằng CHỮ. Bản đầu không lọc, và một tên có phần
   trong ngoặc — "Nguyễn Thu Hà (giả)" — cho ra « H( », vì dấu ngoặc cũng được
   tính là một từ. Chỉ ảnh chụp mới thấy; không bộ kiểm nào của tôi nhìn vào
   hai ký tự đó. */
const chuCaiDau = (ten) =>
  String(ten || "?")
    .trim()
    .split(/\s+/)
    .filter((t) => /^\p{L}/u.test(t))
    .slice(-2)
    .map((t) => t[0])
    .join("")
    .toUpperCase() || "?";

function TheNguoi({ n, mot = false }) {
  return (
    <div className={`group rounded-3xl border border-line bg-surface p-6
      ${mot ? "flex flex-col gap-5 sm:flex-row sm:items-center" : ""}
      transition-all duration-300 ease-out
      hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20
      motion-reduce:transition-none motion-reduce:hover:translate-y-0`}>

      {/* `overflow-hidden` ở vỏ để ảnh phóng to không tràn khỏi góc bo. Thiếu
          nó thì lúc hover ảnh lấn ra ngoài viền và trông như lỗi dựng. */}
      <div className={`overflow-hidden rounded-2xl ${mot ? "h-32 w-32 shrink-0" : "h-24 w-24"}`}>
        {n.anh ? (
          <img src={n.anh} alt=""
            className="h-full w-full object-cover transition-transform duration-300 ease-out
              group-hover:scale-105 motion-reduce:transition-none" />
        ) : (
          <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${sacCua(n.ten)}
            text-2xl font-extrabold text-white transition-transform duration-300 ease-out
            group-hover:scale-105 motion-reduce:transition-none`}>
            {chuCaiDau(n.ten)}
          </div>
        )}
      </div>

      <div>
        <h3 className={`m-0 font-bold text-ink ${mot ? "text-2xl" : "mt-4 text-lg"}`}>{n.ten}</h3>

        <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <BadgeCheck size={14} /> {n.chucDanh}
        </p>

        {n.gioiThieu && (
          <p className="m-0 mt-3 text-sm leading-relaxed text-soft">{n.gioiThieu}</p>
        )}
      </div>
    </div>
  );
}

export default function TeamSection({ ds = DOI_NGU }) {
  if (!Array.isArray(ds) || ds.length === 0) return null;

  /* Một người thì câu chữ số nhiều đọc ra như đang phóng đại, và lưới ba cột
     để lại hai ô trống — mắt đọc đó là "đội ngũ đang thiếu người". Đội ngũ một
     người không phải điểm yếu cần giấu; nó chỉ cần được trình bày đúng như nó
     là. */
  const mot = ds.length === 1;

  return (
    <section className="mt-20">
      <div className="flex items-center gap-2">
        <Code2 size={20} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-wide text-soft">Đội ngũ</span>
      </div>

      <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-ink">
        Ai đứng sau FRACILE
      </h2>

      {/* Câu phụ nói về việc XÂY sản phẩm, không về việc dạy.
          Bản trước viết "bài của bạn được một giáo viên đọc" — đúng với một
          khối « đội ngũ chuyên môn », nhưng khi người duy nhất trong danh sách
          tự nhận là « đội ngũ phát triển » thì câu đó khẳng định một vai mà
          chính danh sách không đỡ. Đổi khung, không đổi mỗi cái nhãn. */}
      <p className="m-0 mt-3 max-w-2xl text-base leading-relaxed text-soft">
        {mot
          ? "FRACILE không phải một kho bài tập mua sẵn. Nó được viết, chạy và sửa mỗi ngày bởi một người — nên mỗi thứ trên đây đều có người chịu trách nhiệm."
          : "FRACILE không phải một kho bài tập mua sẵn. Nó được viết, chạy và sửa mỗi ngày bởi một nhóm nhỏ — nên mỗi thứ trên đây đều có người chịu trách nhiệm."}
      </p>

      <div className={`mt-8 grid gap-4 ${mot ? "max-w-2xl" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {ds.map((n) => <TheNguoi key={n.ten} n={n} mot={mot} />)}
      </div>
    </section>
  );
}
