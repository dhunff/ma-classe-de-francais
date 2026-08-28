import React, { useEffect, useRef, useState } from "react";
import { AtSign, Check, Loader2, X, AlertTriangle, WifiOff } from "lucide-react";
import { useT } from "../../shared/i18n.jsx";
import { Avatar, DS_AVATAR, tenConVat } from "../../shared/avatars.jsx";
import {
  chuanHoaUsername, kiemUsername, USERNAME_TOI_DA, TEN_HIEN_THI_TOI_DA,
} from "../../shared/identityRules.js";

/* Ba trường danh tính của trang Tài khoản: ảnh đại diện, tên hiển thị,
   @username. Tách khỏi AccountPage.jsx vì phần kiểm tra trùng username có
   vòng đời riêng (hẹn giờ, huỷ, chống đua) và nhồi vào một file 300 dòng thì
   không ai đọc ra được luồng nào thuộc về đâu. */

const INPUT =
  "w-full rounded-xl border-0 bg-surface2 px-4 py-3 text-sm font-medium text-ink " +
  "outline-none transition placeholder:text-soft focus:ring-2 focus:ring-primary/50";
const LABEL = "mb-1.5 block text-sm text-soft";

/* ════════════════════════════════════════════════════════════════════════
   Kiểm tra @username còn trống — có hoãn
   ════════════════════════════════════════════════════════════════════════

   TRẢ VỀ NĂM TRẠNG THÁI, không phải hai:

     "trong"      còn trống, dùng được
     "da_co"      đã có người lấy
     "sai"        sai khuôn (ngắn, ký tự lạ, bắt đầu bằng số)
     "khong_ro"   HỎI KHÔNG ĐƯỢC — mất mạng, hoặc 046 chưa chạy
     "cua_minh"   chính là username đang dùng, không cần hỏi

   `khong_ro` là trạng thái quan trọng nhất và cũng là cái dễ bị bỏ nhất. Gộp
   nó vào "còn trống" thì lúc mạng chập chờn giao diện hiện dấu tích xanh cho
   một cái tên có thể đã có người lấy; gộp vào "đã có" thì người dùng bị chặn
   khỏi cái tên hợp lệ của chính họ. Cả hai đều là nói dối. Nói "chưa kiểm
   được" thì xấu hơn nhưng đúng.

   ══ CHỐNG ĐUA ══

   Gõ "ma" rồi "marie" nhanh tay có thể tạo hai lời gọi, và lời gọi cho "ma"
   về SAU. Không đánh số thì kết quả của "ma" ghi đè kết quả của "marie" và ô
   nhập hiện trạng thái của một chuỗi không còn tồn tại trên màn hình.

   Đếm bằng số thứ tự chứ không so chuỗi: hai lần gõ ra cùng một chuỗi (gõ
   thừa rồi xoá) vẫn là hai lời gọi, và so chuỗi thì cả hai đều "khớp". */

const HOAN_MS = 500;

/* `hoiConTrong` được TRUYỀN VÀO, không import.
 *
 * File này cố ý không `import { usernameConTrong } from identity.js` — vì
 * identity.js kéo theo storageShim.js, tức là mở một kết nối Supabase thật
 * ngay lúc nạp module. Trang xem thử `/preview.html` sinh ra chính để xem các
 * màn hình sau cổng đăng nhập mà KHÔNG chạm vào dữ liệu thật (xem đầu
 * preview.jsx), nên một import như thế sẽ khiến ô nhập này thành thứ duy nhất
 * không xem thử được — đúng thứ cần nhìn tận mắt nhất, vì nó có năm trạng thái
 * và bốn trong số đó chỉ hiện ra khi mạng trả lời. */
function useKiemUsername(nhap, usernameHienTai, hoiConTrong) {
  const [trangThai, setTrangThai] = useState("cua_minh");
  const soThuTu = useRef(0);

  useEffect(() => {
    const u = chuanHoaUsername(nhap);
    const cu = chuanHoaUsername(usernameHienTai);

    if (!u || u === cu) { setTrangThai("cua_minh"); return; }

    const dang = kiemUsername(u);
    if (!dang.ok) { setTrangThai("sai"); return; }

    setTrangThai("dang_hoi");
    const lan = ++soThuTu.current;

    /* Hoãn 500ms rồi mới hỏi. Không hoãn thì gõ "marie" là sáu lời gọi mạng,
       năm cái đầu vô nghĩa. */
    const hen = setTimeout(async () => {
      const con = await hoiConTrong(u);
      /* Đã có lần gõ mới hơn → bỏ kết quả này. */
      if (lan !== soThuTu.current) return;
      setTrangThai(con === null ? "khong_ro" : con ? "trong" : "da_co");
    }, HOAN_MS);

    /* Dọn hẹn giờ khi người dùng gõ tiếp hoặc rời trang. Thiếu dòng này thì
       mỗi phím bấm để lại một hẹn giờ, và React cảnh báo đặt state sau khi
       component đã gỡ. */
    return () => clearTimeout(hen);
  }, [nhap, usernameHienTai, hoiConTrong]);

  return trangThai;
}

/* Ô nhập @username. Dấu « @ » nằm trong khung, không phải trong giá trị —
   người dùng gõ thêm « @ » thì `chuanHoaUsername` cắt đi, để dán từ chỗ khác
   vẫn chạy. */
export function ONhapUsername({ giaTri, datGiaTri, usernameHienTai, tuTro, hoiConTrong }) {
  const t = useT();
  const trangThai = useKiemUsername(giaTri, usernameHienTai, hoiConTrong);
  const dang = kiemUsername(giaTri);

  const bao = {
    dang_hoi: { Icon: Loader2, mau: "text-soft", quay: true, chu: t("identity.checking") },
    trong: { Icon: Check, mau: "text-ok", chu: t("identity.free") },
    da_co: { Icon: X, mau: "text-danger", chu: t("identity.taken") },
    khong_ro: { Icon: WifiOff, mau: "text-warn", chu: t("identity.unknown") },
    sai: { Icon: AlertTriangle, mau: "text-danger", chu: t(`identity.bad_${dang.loi}`) },
    cua_minh: null,
  }[trangThai];

  return (
    <div>
      <span className={LABEL}>{t("identity.username")}</span>
      <span className="relative block">
        <AtSign size={15} aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soft" />
        <input
          ref={tuTro}
          className={`${INPUT} pl-10 pr-10`}
          value={giaTri}
          maxLength={USERNAME_TOI_DA + 1}
          autoComplete="off"
          spellCheck={false}
          placeholder={t("identity.username_ph")}
          onChange={(e) => datGiaTri(chuanHoaUsername(e.target.value))}
          aria-describedby="username-bao"
          aria-invalid={trangThai === "da_co" || trangThai === "sai"}
        />
        {bao && (
          <bao.Icon size={16} aria-hidden
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${bao.mau} ${bao.quay ? "mcf-spin" : ""}`} />
        )}
      </span>

      {/* `aria-live` để trình đọc màn hình đọc kết quả — người dùng bàn phím
          không thấy được dấu tích xanh. `min-h` giữ chỗ sẵn để dòng chữ hiện
          ra không đẩy cả biểu mẫu nhảy xuống một dòng. */}
      <p id="username-bao" aria-live="polite"
         className={`m-0 mt-1 min-h-[1.1rem] text-xs font-semibold ${bao ? bao.mau : "text-soft"}`}>
        {bao ? bao.chu : t("identity.username_help")}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Chọn ảnh đại diện
   ════════════════════════════════════════════════════════════════════════ */

export function ChonAvatar({ dangChon, chon, dong, ten }) {
  const t = useT();
  const hop = useRef(null);

  /* Esc để đóng, và đưa tiêu điểm vào hộp khi mở. Thiếu cái sau thì người dùng
     bàn phím mở hộp xong vẫn đang đứng ở nút phía sau nó. */
  useEffect(() => {
    hop.current?.focus();
    const phim = (e) => { if (e.key === "Escape") dong(); };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  }, [dong]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      /* Bấm ra ngoài thì đóng — nhưng chỉ khi bấm đúng lớp phủ, không phải khi
         bấm vào hộp rồi thả chuột ra ngoài. */
      onMouseDown={(e) => { if (e.target === e.currentTarget) dong(); }}
    >
      <div ref={hop} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t("identity.avatar_pick")}
           className="w-full max-w-lg rounded-3xl bg-surface p-6 shadow-2xl outline-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-ink">{t("identity.avatar_pick")}</h2>
            <p className="m-0 mt-1 text-sm text-soft">{t("identity.avatar_help")}</p>
          </div>
          <button type="button" onClick={dong} aria-label={t("identity.close")}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft transition-colors hover:bg-danger-soft hover:text-danger">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {/* Ô đầu tiên là "không dùng con vật" — quay về chữ cái đầu. Thiếu nó
              thì chọn xong một con vật là không có đường lùi, và người dùng
              phải đoán rằng xoá ô nào đó sẽ trả lại như cũ. */}
          <NutAvatar khoa="" ten={ten} nhan={t("identity.avatar_letter")}
                     dangChon={!dangChon} chon={() => chon("")} />
          {DS_AVATAR.map((k) => (
            <NutAvatar key={k} khoa={k} ten={ten} nhan={tenConVat(k)}
                       dangChon={dangChon === k} chon={() => chon(k)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NutAvatar({ khoa, ten, nhan, dangChon, chon }) {
  return (
    <button
      type="button"
      onClick={chon}
      aria-pressed={dangChon}
      className={[
        "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-0 p-3 transition",
        dangChon ? "bg-primary-soft ring-2 ring-primary" : "bg-surface2 hover:bg-primary-soft",
      ].join(" ")}
    >
      <Avatar khoa={khoa} ten={ten} size={56} />
      <span className={`truncate text-xs font-bold ${dangChon ? "text-primary" : "text-soft"}`}>
        {nhan}
      </span>
    </button>
  );
}

export { TEN_HIEN_THI_TOI_DA };
