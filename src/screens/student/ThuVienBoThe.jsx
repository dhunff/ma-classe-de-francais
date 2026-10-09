import React, { useMemo, useState } from "react";
import { ChevronsRight, AlertTriangle, Layers, Lock, Unlock } from "lucide-react";
import TourGioiThieu from "../../shared/TourGioiThieu.jsx";
import { useT, tr } from "../../shared/i18n.jsx";
import { KY_NANG } from "../../shared/kyNang.js";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import NutTieng from "../../shared/NutTieng.jsx";

/* Thư viện bộ thẻ — cột tab dọc bên trái, lưới thẻ bên phải.
 *
 * ══ TAB DỌC HOẠT ĐỘNG THẾ NÀO ══
 *
 * `[writing-mode:vertical-lr]` xoay DÒNG CHỮ, không xoay hộp: chữ chạy từ trên
 * xuống nhưng mỗi ký tự vẫn đứng thẳng. Đọc được, nhưng ngược chiều quen thuộc
 * của mắt — nên thêm `rotate-180` để dòng chạy từ dưới lên, đúng kiểu gáy sách.
 *
 * Hai lớp phải đi CÙNG NHAU. Chỉ `writing-mode` thì chữ đọc từ trên xuống và
 * nhãn cuối cùng nằm sát đáy; chỉ `rotate-180` thì cả khối chữ lộn ngược.
 *
 * `rotate-180` xoay quanh TÂM phần tử, nên nút phải có bề rộng cố định
 * (`w-11`) — để chiều rộng tự co theo chữ thì mỗi tab rộng một kiểu và sau khi
 * xoay chúng lệch nhau vài pixel theo trục ngang.
 *
 * `check:css` canh hai lớp này thật sự sinh ra CSS: Tailwind BỎ QUA lớp không
 * tồn tại mà không báo gì, và một tab dọc hỏng trông y hệt một tab thường.
 *
 * ══ VÌ SAO KHÔNG PHẢI `bg-gray-800/80` ══
 *
 * Bản mô tả yêu cầu màu tối viết cứng. Không dùng, vì dự án đã có token tự đảo
 * theo bản sáng/tối (`styles/tokens.css`): `bg-surface` là #FFFFFF ở bản sáng
 * và #1E1E27 ở bản tối. Viết `bg-gray-800/80` thì bản tối trông đúng ý còn bản
 * sáng thành thẻ xám than trên nền trắng — và `check:design` đo tương phản
 * WCAG sẽ đỏ. Token cho ra đúng cái "Premium Dark Soft UI" mong muốn, và không
 * đánh đổi bản sáng để lấy nó.
 */

/* Màu nhấn theo kỹ năng. NGOẠI LỆ có chủ ý với quy tắc 2, cùng loại với
   `STAT_GRADIENTS` và `LEVEL_COLORS`: đây là màu NHẬN DẠNG, và chữ đặt trên
   nó luôn là trắng nên tương phản không phụ thuộc sáng/tối. */
const SAC = {
  CO: "from-indigo-500 to-blue-600",
  CE: "from-emerald-500 to-teal-600",
  PE: "from-rose-500 to-pink-600",
  PO: "from-amber-500 to-orange-600",
};
const VIEN = {
  CO: "hover:shadow-indigo-500/25",
  CE: "hover:shadow-emerald-500/25",
  PE: "hover:shadow-rose-500/25",
  PO: "hover:shadow-amber-500/25",
};

function ChuCaiDau({ ten, avatar }) {
  if (avatar) {
    return <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />;
  }
  /* Không dùng dịch vụ ảnh đại diện ngẫu nhiên — chúng phục vụ chân dung người
     thật. Thiếu ảnh thì chữ cái đầu, đúng cách avatars.jsx đã làm từ lâu. */
  const chu = String(ten || "?").trim().split(/\s+/).slice(-1)[0]?.[0] ?? "?";
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-[10px] font-extrabold text-primary">
      {chu.toUpperCase()}
    </span>
  );
}

/* `dau`: thẻ ĐẦU TIÊN trong lưới mang id cho tour giới thiệu. */
function TheBo({ b, onMo, dau = false, thuTu = 0 }) {
  return (
    <button
      id={dau ? "tour-fc-deck" : undefined}
      type="button"
      onClick={() => { phat("lat"); onMo(b); }}
      style={{ animationDelay: `${100 + thuTu * 70}ms` }}
      /* preflight TẮT ⇒ `border-0` + nền rõ ràng + `text-left` + `font-sans`.
         `<button>` KHÔNG kế thừa font, nên thiếu `font-sans` thì cả thẻ rơi về
         font mặc định của trình duyệt và trông như của trang khác.

         Bóng: phải ghi CẢ hình dạng lẫn màu. Tailwind tách `--tw-shadow` khỏi
         `--tw-shadow-color`, nên `hover:shadow-2xl` một mình làm bóng màu thành
         TRONG SUỐT — đo được `rgba(0,0,0,0)`. Đã dính một lần. */
      className={`mcf-cau-vao group relative w-full overflow-hidden rounded-3xl border-0 bg-surface
        p-0 text-left font-sans ring-1 ring-line transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-2xl ${VIEN[b.kyNang] ?? ""}
        motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      {/* Mảng màu góc trên — nhắc lại hình khối của bản thiết kế mà không phải
          tô nền cả thẻ, nhờ vậy chữ vẫn đặt trên `bg-surface` và tương phản
          không đổi giữa hai bản màu. */}
      {/* Bìa màu theo kỹ năng: chồng ba thẻ nghiêng + số thẻ to. */}
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${SAC[b.kyNang] ?? SAC.CO}`}>
        <span aria-hidden className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/15 transition-transform duration-500 group-hover:scale-125" />
        <span aria-hidden className="absolute bottom-3 right-16 h-16 w-12 rotate-[-12deg] rounded-xl bg-white/25 shadow-lg transition-transform duration-300 group-hover:rotate-[-20deg]" />
        <span aria-hidden className="absolute bottom-3 right-10 h-16 w-12 rotate-[-2deg] rounded-xl bg-white/35 shadow-lg transition-transform duration-300 group-hover:-translate-y-1" />
        <span aria-hidden className="absolute bottom-3 right-4 grid h-16 w-12 rotate-[10deg] place-items-center rounded-xl bg-white text-sm font-extrabold text-ink shadow-lg transition-transform duration-300 group-hover:rotate-[16deg]">{b.soThe}</span>
        <span className="absolute left-5 top-4 rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">{b.kyNang}</span>
        {b.traPhi && (
          <span className={`absolute left-5 top-11 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${b.khoa ? "bg-amber-400 text-amber-950" : "bg-white/90 text-ok"}`}>
            {b.khoa ? <Lock size={10} /> : <Unlock size={10} />}
            {b.khoa ? (b.gia ? `${b.gia.toLocaleString("vi-VN")}đ` : tr("Trả phí", "Payant", "Paid")) : tr("Đã mở khoá", "Débloqué", "Unlocked")}
          </span>
        )}
      </div>
      <div className="p-5">
      <h3 className="m-0 text-lg font-extrabold tracking-tight text-ink">{b.ten}</h3>

      {b.moTa && (
        <p className="m-0 mt-1 line-clamp-2 text-xs leading-relaxed text-soft">{b.moTa}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-soft">{tr("Soạn bởi", "Créé par", "By")}</span>
        <ChuCaiDau ten={b.tacGia.ten} avatar={b.tacGia.avatar} />
        <span className="truncate text-[11px] font-bold text-ink">{b.tacGia.ten}</span>
      </div>

      {/* Bộ nháp chỉ giáo viên mới thấy (RLS). Nói ra để họ không tưởng học
          sinh đang nhìn thấy một bộ chưa xong. */}
      {!b.congKhai && (
        <span className="mt-3 inline-block rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">
          {tr("nháp — học sinh chưa thấy", "brouillon, invisible pour les élèves", "draft, not visible to students")}
        </span>
      )}

      <span id={dau ? "tour-fc-count" : undefined} className="mt-4 flex w-fit items-center gap-2 rounded-full bg-surface2 px-3 py-1.5 text-xs font-bold text-ink">
        {b.soThe} {tr("thẻ", "cartes", "cards")}
        <ChevronsRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      </div>
    </button>
  );
}

export default function ThuVienBoThe({ ds, onMo }) {
  const [kyNang, setKyNang] = useState("CO");
  const t = useT();

  const hien = useMemo(
    () => (Array.isArray(ds) ? ds.filter((b) => b.kyNang === kyNang) : []),
    [ds, kyNang],
  );

  return (
    <div className="mx-auto max-w-5xl py-6">
      {/* Tour chỉ bắt đầu khi đã có ít nhất một bộ thẻ — hai bước sau chỉ vào
          thẻ đầu tiên, mà Joyride lặng lẽ bỏ bước không tìm thấy đích. */}
      <TourGioiThieu khoa="hasSeenFlashcardTour" choXong="hasSeenGiaoDienTour" sanSang={Array.isArray(hien) && hien.length > 0} steps={[
        { target: "#tour-fc-tabs", title: t("tour.fc1_title"), content: t("tour.fc1_body"), placement: "right-start" },
        { target: "#tour-fc-deck", title: t("tour.fc2_title"), content: t("tour.fc2_body") },
        { target: "#tour-fc-count", title: t("tour.fc3_title"), content: t("tour.fc3_body") },
      ]} />
      <header className="mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-6 text-white shadow-[0_20px_50px_rgba(99,102,241,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <span aria-hidden className="absolute bottom-4 right-28 hidden h-20 w-14 rotate-[-14deg] rounded-xl bg-white/20 sm:block" />
        <span aria-hidden className="absolute bottom-6 right-20 hidden h-20 w-14 rotate-[8deg] rounded-xl bg-white/30 sm:block" />
        <div className="relative flex items-center gap-4">
          <Leon cam="hoc" size={108} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">Flashcard</h1>
            <p className="m-0 mt-1 text-sm text-white/85">
              {tr("Chọn một bộ để luyện. Các bộ này do giáo viên soạn.", "Choisissez un paquet. Ils sont créés par les enseignants.", "Pick a deck to practise. Decks are made by teachers.")}
            </p>
            {Array.isArray(ds) && (
              <p className="m-0 mt-3 inline-flex flex-wrap gap-2 text-xs font-extrabold">
                <span className="rounded-full bg-white/20 px-3 py-1">{ds.length} {tr("bộ", "paquets", "decks")}</span>
                <span className="rounded-full bg-white/20 px-3 py-1">{ds.reduce((n, b) => n + (b.soThe || 0), 0)} {tr("thẻ", "cartes", "cards")}</span>
              </p>
            )}
          </div>
          <NutTieng className="border-white/30 bg-white/15 text-white hover:border-white hover:text-white" />
        </div>
      </header>

      <div className="mt-6 flex gap-4">
        {/* ══ CỘT TAB DỌC ══ */}
        <div id="tour-fc-tabs" className="flex shrink-0 flex-col gap-2">
          {KY_NANG.map((k) => {
            const chon = k.ma === kyNang;
            return (
              <button
                key={k.ma}
                type="button"
                onClick={() => { if (!chon) phat("tiep"); setKyNang(k.ma); }}
                aria-pressed={chon}
                /* `w-11` cố định: rotate-180 xoay quanh tâm, nên bề rộng co
                   theo chữ sẽ làm các tab lệch nhau sau khi xoay. */
                className={`flex w-11 items-center justify-center rounded-2xl border-0 py-6
                  font-sans text-xs font-bold uppercase tracking-widest
                  [writing-mode:vertical-lr] -rotate-180
                  transition-colors duration-300 ${
                    chon ? `bg-gradient-to-b ${SAC[k.ma] ?? SAC.CO} text-white shadow-lg` : "bg-surface2 text-soft hover:text-ink"
                  }`}
              >
                {k.ten}
              </button>
            );
          })}
        </div>

        {/* ══ LƯỚI THẺ ══ */}
        <div className="min-w-0 flex-1">
          {ds === undefined ? (
            <p className="m-0 py-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
          ) : ds === null ? (
            /* KHÔNG ĐỌC ĐƯỢC ≠ CHƯA CÓ BỘ NÀO. Gộp lại là báo tin vui cho một
               sự cố — người dùng sẽ đi tìm bộ thẻ ở chỗ khác. */
            <div className="rounded-2xl bg-danger-soft p-6 text-center">
              <AlertTriangle size={20} className="mx-auto text-danger" />
              <p className="m-0 mt-2 font-bold text-ink">{tr("Không đọc được thư viện", "Impossible de charger la bibliothèque", "Couldn't load the library")}</p>
              <p className="m-0 mt-1 text-sm text-ink">
                {tr("Danh sách trống ở đây KHÔNG có nghĩa là chưa có bộ nào — kiểm tra kết nối rồi tải lại.", "Une liste vide ne veut pas dire qu'il n'y a aucun paquet : vérifiez la connexion et rechargez.", "An empty list doesn't mean there are no decks: check your connection and reload.")}
              </p>
            </div>
          ) : hien.length === 0 ? (
            <div className="rounded-3xl border border-solid border-line bg-surface p-8 text-center">
              <Leon cam="buon-ngu" size={96} className="mx-auto block" />
              <p className="m-0 mt-2 font-bold text-ink">{tr("Chưa có bộ thẻ nào cho kỹ năng này", "Aucun paquet pour cette compétence", "No decks for this skill yet")}</p>
              <p className="m-0 mt-1 text-sm leading-relaxed text-soft">
                {tr("Bộ thẻ do giáo viên soạn. Khi có bộ mới cho phần", "Les paquets sont créés par les enseignants. Quand il y en aura pour", "Decks are made by teachers. When a new one exists for")}{" "}
                {KY_NANG.find((k) => k.ma === kyNang)?.ten.toLowerCase()}{tr(", nó sẽ hiện ở đây.", ", il apparaîtra ici.", ", it will show up here.")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hien.map((b, i) => <TheBo key={b.id} b={b} onMo={onMo} dau={i === 0} thuTu={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
