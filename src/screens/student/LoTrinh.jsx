import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Play, Trophy, Zap, Headphones, BookOpen, PenLine, Mic } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { loadPractice } from "../../shared/exerciseStore.js";
import { loadSubmissions } from "../../shared/submissions.js";
import { loadExams } from "../../shared/examStore.js";
import { loadAccess, canOpen } from "../../shared/access.js";
import { isPremium } from "../../shared/premium.js";
import { docXp } from "../../shared/xp.js";
import { LEVEL_COLORS } from "../../shared/tokens.js";
import { useT } from "../../shared/i18n.jsx";

/* Lộ trình học tập — cây kỹ năng mở khoá tuần tự A1 → C1.
 *
 * ══ KHÔNG CÓ DỮ LIỆU GIẢ Ở ĐÂY ══
 *
 * Bản đặc tả ban đầu đề nghị một mảng `MOCK_CHAPTERS` để dựng bố cục. Dữ liệu
 * giả chỉ sống trong src/preview.jsx (CLAUDE.md, nguyên tắc 1), và ở màn này
 * thì không cần đến nó: mọi khái niệm trong bản vẽ đều đã có nguồn thật.
 *
 *   chương   ← trình độ CEFR của bài (exercises.level)
 *   nút      ← một bài trong thư viện luyện tập (loadPractice)
 *   đã xong  ← có bài nộp của chính em đó (loadSubmissions)
 *   cột mốc  ← đề thi thử ĐÃ PHÁT HÀNH cùng trình độ (loadExams)
 *   huy hiệu ← ex.xpCost do giáo viên đặt + số dư thật từ docXp()
 *
 * Chương nào không có đề thi phát hành thì KHÔNG có cột mốc. Vẽ một cái cổng
 * không mở được ra thì đẹp hơn, nhưng nó hứa một kỳ thi không tồn tại.
 *
 * ══ "KHOÁ" Ở ĐÂY CHỈ LÀ GIAO DIỆN ══
 *
 * Có hai loại khoá trên màn này và chúng khác hẳn nhau:
 *
 *   - khoá TUẦN TỰ (chưa tới lượt): thuần trình bày, để người học biết đi
 *     đâu tiếp. Không phải hàng rào — ai cũng vào thẳng thư viện luyện tập
 *     làm bài bất kỳ được, và như thế là đúng.
 *   - khoá TRẢ PHÍ: hàng rào thật, nhưng hàng rào nằm ở RLS 019 và
 *     redeem_exercise_with_xp, không nằm ở đây. `canOpen` chỉ quyết định vẽ
 *     ổ khoá hay không.
 *
 * Nên bấm vào nút trả phí vẫn đi tới thư viện luyện tập — nơi đã có sẵn thẻ
 * mở khoá, modal đổi XP và mã chuyển khoản. Dựng lại ba thứ đó ở đây là chép
 * luồng thanh toán ra thành hai bản.
 */

/* Thứ tự chương. Chỉ dùng để XẾP, không dùng để sinh: chương nào không có bài
   nào thì không xuất hiện. Khớp với LEVEL_COLORS trong shared/tokens.js. */
const THU_TU_CAP = ["A1", "A2", "B1", "B2", "B2+", "C1"];

const ICON_KY_NANG = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };

/* ── Hình học của con đường ──
   Một cột duy nhất rộng RONG px, các nút lệch trái/phải theo chu kỳ 4 để
   thành hình rắn bò. Đường nối và nút đọc CÙNG mảng toạ độ này — tách ra hai
   nguồn là đường đi một nơi, nút nằm một nẻo. */
/* ── VÌ SAO CÁC SỐ NÀY LÀ THẾ ──
   Bản đầu đặt CAO_HANG = 108 cho một nút cao 60 + nhãn hai dòng, và các nút
   ĐÈ LÊN NHAU thật. Phép tính bị bỏ sót: một mục chiếm

       đường kính nút + KHE_NHAN + NHAN_CAO

   chứ không phải chỉ đường kính. Với nút 60 thì mục cao 96, sát ngưỡng; nhãn
   dài hai dòng là chạm vòng tròn hàng dưới.

   Nay NHAN_CAO là chiều cao CỐ ĐỊNH (nhãn tràn thì cắt bằng line-clamp), nên
   chiều cao một mục là hằng số tính được, và ràng buộc trở nên kiểm được:

       CAO_HANG >= DK_NUT + KHE_NHAN + NHAN_CAO

   Cột mốc cao hơn nút thường VÀ có thêm dòng gợi ý, nên nó tràn xuống dưới
   đáy hàng cuối — đó là lý do có DU_CUOI. Thiếu nó thì chữ của cột mốc đâm
   vào tiêu đề chương kế tiếp. */
const RONG = 300;
const CAO_HANG = 124;
const LECH = [0, 76, 0, -76];
const DK_NUT = 64;      // đường kính nút bài tập
const DK_MOC = 84;      // đường kính cột mốc — to hơn vì nó là đích của chương
const KHE_NHAN = 8;
const NHAN_CAO = 30;    // 2 dòng × 11px × 1.25, làm tròn lên
const RONG_NHAN = 104;
const MOC_CHU_CAO = 56; // nhãn + dòng gợi ý của cột mốc
const DU_CUOI = 24;     // chừa chỗ cho nhãn của hàng cuối

/* Kiểm ngay lúc tải module: một hằng số bị sửa lệch sẽ nói ra ở console,
   không đợi tới lúc có người nhìn thấy chữ chồng lên nhau. */
if (CAO_HANG < DK_NUT + KHE_NHAN + NHAN_CAO) {
  console.error("[lo-trinh] CAO_HANG quá nhỏ — nhãn sẽ đè lên nút hàng dưới.");
}

const toaDo = (i, to) => ({
  x: RONG / 2 + LECH[i % LECH.length],
  y: CAO_HANG / 2 + i * CAO_HANG,
  r: (to ? DK_MOC : DK_NUT) / 2,
});

/* Đường cong nối các tâm nút. Điểm điều khiển đặt thẳng đứng nên chỗ nối luôn
   mượt, không gãy góc ở nút giữa. */
function duong(diem) {
  if (diem.length < 2) return "";
  let d = `M ${diem[0].x} ${diem[0].y}`;
  for (let i = 1; i < diem.length; i++) {
    const a = diem[i - 1], b = diem[i];
    d += ` C ${a.x} ${a.y + CAO_HANG / 2}, ${b.x} ${b.y - CAO_HANG / 2}, ${b.x} ${b.y}`;
  }
  return d;
}

export default function LoTrinh({ name = "" }) {
  const t = useT();
  const nav = useNavigate();

  const [chuongs, setChuongs] = useState(null);   // null = đang tải
  const [xp, setXp] = useState(null);             // null = không hỏi được máy chủ
  const [loi, setLoi] = useState("");

  useEffect(() => {
    let huy = false;
    (async () => {
      /* Cờ mở toàn quyền của chính em đang đăng nhập. Cùng cách PracticeHub
         hỏi: RLS 003 cho mỗi người đọc đúng dòng của mình. Bảng chưa có thì
         cờ ở lại false, tức ổ khoá vẫn hoạt động — sai về phía đóng. */
      const hoSo = supabase.from("profiles").select("has_premium_access").limit(1)
        .maybeSingle().then(({ data }) => !!data?.has_premium_access).catch(() => false);

      const [bai, nop, deThi, quyen, toanQuyen] = await Promise.all([
        loadPractice(), loadSubmissions(), loadExams(), loadAccess(), hoSo,
      ]);
      if (huy) return;

      if (!bai.length) {
        setChuongs([]);
        setLoi(t("path.empty_body"));
        return;
      }

      const daXong = new Set(
        nop.filter((s) => s.student === name).map((s) => String(s.exerciseId)),
      );

      /* Gom bài theo trình độ. Trình độ lạ (giáo viên gõ tay một giá trị không
         có trong THU_TU_CAP) vẫn được giữ và xếp xuống cuối — bỏ đi là giấu
         mất bài của giáo viên. */
      const theoCap = new Map();
      for (const ex of bai) {
        const cap = String(ex.level || "").trim() || "?";
        if (!theoCap.has(cap)) theoCap.set(cap, []);
        theoCap.get(cap).push(ex);
      }

      const xepCap = [...theoCap.keys()].sort((a, b) => {
        const ia = THU_TU_CAP.indexOf(a), ib = THU_TU_CAP.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
      });

      /* Đề thi đã phát hành, tra theo trình độ. RLS đã lọc bản nháp trước khi
         tới đây; không lọc lại ở client. */
      const deTheoCap = new Map();
      for (const d of deThi) {
        const cap = String(d.level || "").trim();
        if (cap && !deTheoCap.has(cap)) deTheoCap.set(cap, d);
      }

      /* « Bài hiện tại » là bài CHƯA LÀM đầu tiên của cả lộ trình, không phải
         của từng chương. Mỗi chương một mũi tên "làm tiếp" thì có sáu chỗ để
         tiếp tục, tức là không có chỗ nào cả. */
      let daGapHienTai = false;
      const ra = xepCap.map((cap) => {
        const dsBai = [...theoCap.get(cap)]
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        const nodes = dsBai.map((ex) => {
          const xong = daXong.has(String(ex.id));
          let trangThai = "khoa";
          if (xong) trangThai = "xong";
          else if (!daGapHienTai) { trangThai = "hienTai"; daGapHienTai = true; }

          const moDuoc = canOpen(ex, quyen, name, toanQuyen);
          const gia = Number(ex.xpCost) > 0 ? Number(ex.xpCost) : null;
          return {
            id: String(ex.id),
            tieuDe: ex.title || t("path.untitled"),
            kyNang: ex.skill || "",
            soCau: ex.questions?.length ?? 0,
            trangThai,
            traPhi: isPremium(ex) && !moDuoc,
            giaXp: gia,
          };
        });

        const de = deTheoCap.get(cap) || null;
        const xongHet = nodes.length > 0 && nodes.every((n) => n.trangThai === "xong");
        return {
          cap,
          mau: LEVEL_COLORS[cap] || null,
          nodes,
          /* Cột mốc chỉ tồn tại khi có đề thật. */
          motCot: de ? { tieuDe: de.title || t("path.exam_generic", { cap }), moDuoc: xongHet } : null,
        };
      });

      setChuongs(ra);
    })();

    docXp().then((v) => { if (!huy) setXp(v); });
    return () => { huy = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const tongXong = useMemo(
    () => (chuongs || []).reduce(
      (n, c) => n + c.nodes.filter((x) => x.trangThai === "xong").length, 0),
    [chuongs],
  );
  const tongBai = useMemo(
    () => (chuongs || []).reduce((n, c) => n + c.nodes.length, 0),
    [chuongs],
  );

  const moBai = (id) => nav("/etudiant/entrainement", { state: { moBai: id } });

  if (chuongs === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-8 w-48 animate-pulse rounded-full bg-surface2" />
        <div className="mt-8 space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="mx-auto h-16 w-16 animate-pulse rounded-full bg-surface2" />
          ))}
        </div>
      </div>
    );
  }

  if (!chuongs.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface2">
          <Trophy size={28} className="text-soft" />
        </div>
        <h2 className="m-0 mt-4 text-lg font-extrabold text-ink">{t("path.empty_title")}</h2>
        <p className="mt-2 text-sm text-soft">{loi || t("path.empty_body")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-6">
        <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t("nav.path")}</h1>
        <p className="mt-1 text-sm text-soft">
          {t("path.progress", { xong: tongXong, tong: tongBai })}
          {xp !== null && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle font-bold text-ink">
              <Zap size={13} className="text-warn" />{xp} XP
            </span>
          )}
        </p>
      </header>

      {chuongs.map((c) => (
        <Chuong key={c.cap} chuong={c} xp={xp} onMo={moBai}
          onThi={() => nav("/etudiant/examen")} t={t} />
      ))}
    </div>
  );
}

/* ── Một chương ── */
function Chuong({ chuong, xp, onMo, onThi, t }) {
  const { cap, mau, nodes, motCot } = chuong;
  /* Cột mốc là một nút nữa trên cùng con đường, nên nó phải nằm trong mảng
     toạ độ chứ không treo bên dưới. */
  const diem = [...nodes.map((_, i) => toaDo(i, false))];
  if (motCot) diem.push(toaDo(nodes.length, true));
  /* Hàng cuối cần chỗ cho phần chữ nằm DƯỚI tâm nút, vốn không nằm trong
     diem.length * CAO_HANG. Cột mốc có thêm dòng gợi ý nên cần nhiều hơn. */
  const cao = diem.length * CAO_HANG
    + (motCot ? DK_MOC / 2 + KHE_NHAN + MOC_CHU_CAO - CAO_HANG / 2 + DU_CUOI : DU_CUOI);

  /* Đoạn đường đã đi: tô màu tới nút "đã xong" cuối cùng. Một sợi dây xám
     suốt cả trang thì không cho biết mình đang ở đâu. */
  const soXong = nodes.filter((n) => n.trangThai === "xong").length;
  const diemXong = diem.slice(0, Math.max(soXong, 0) + (soXong > 0 ? 1 : 0));

  return (
    <section className="mb-4">
      {/* Tiêu đề chương dính trên khi cuộn — biết mình đang ở cấp nào mà không
          phải cuộn ngược lên. `top-0` ăn theo <main>, vốn là phần tử cuộn duy
          nhất của vỏ app (xem AppLayout.jsx). */}
      <div className="sticky top-0 z-10 -mx-4 mb-2 bg-surface/90 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2 rounded-md border border-solid border-line bg-surface2 px-3 py-2">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-extrabold text-white"
            style={mau ? { backgroundColor: mau } : undefined}>
            {cap}
          </span>
          <span className="text-sm font-bold text-ink">
            {t("path.chapter_count", { n: nodes.length })}
          </span>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: RONG, height: cao }}>
        <svg width={RONG} height={cao} className="absolute inset-0" aria-hidden="true">
          <path d={duong(diem)} fill="none" strokeWidth="6" strokeLinecap="round"
            className="stroke-line" strokeDasharray="1 14" />
          {diemXong.length > 1 && (
            <path d={duong(diemXong)} fill="none" strokeWidth="6" strokeLinecap="round"
              className="stroke-ok" />
          )}
        </svg>

        {nodes.map((n, i) => (
          <Nut key={n.id} node={n} pos={toaDo(i, false)} xp={xp}
            onClick={() => onMo(n.id)} t={t} />
        ))}

        {motCot && (
          <CotMoc moc={motCot} pos={toaDo(nodes.length, true)} onClick={onThi} t={t} />
        )}
      </div>
    </section>
  );
}

/* ── Một nút bài tập ──
   Preflight tắt: <button> phải tự khai `border-0` và nền, nếu không trình
   duyệt vẽ viền outset 3D mặc định. */
function Nut({ node, pos, xp, onClick, t }) {
  const { trangThai, traPhi, giaXp, tieuDe, kyNang, soCau } = node;
  const Icon = ICON_KY_NANG[kyNang] || BookOpen;

  const nen =
    trangThai === "xong" ? "bg-ok text-white"
      : trangThai === "hienTai" ? "bg-primary text-on-primary ring-8 ring-primary-soft"
        : "bg-surface2 text-soft";

  /* Đủ XP hay không đổi cách vẽ huy hiệu. `xp === null` nghĩa là KHÔNG HỎI
     ĐƯỢC máy chủ — khác hẳn 0 XP, nên lúc đó không dám nói là thiếu. */
  const du = xp !== null && giaXp !== null && xp >= giaXp;

  return (
    <div className="absolute flex flex-col items-center"
      style={{ left: pos.x - RONG_NHAN / 2, top: pos.y - pos.r, width: RONG_NHAN }}>
      <button type="button" onClick={onClick}
        title={`${tieuDe} — ${t("path.q_count", { n: soCau })}`}
        aria-label={tieuDe}
        className={`relative flex items-center justify-center rounded-full border-0 shadow-sm transition
          hover:brightness-105 active:scale-95 ${nen}`}
        style={{ width: pos.r * 2, height: pos.r * 2 }}>
        {traPhi ? <Lock size={24} />
          : trangThai === "xong" ? <Check size={26} strokeWidth={3} />
            : trangThai === "hienTai" ? <Play size={24} fill="currentColor" />
              : <Icon size={22} />}

        {traPhi && giaXp !== null && (
          <span className={`absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-0.5
            whitespace-nowrap rounded-full border border-solid px-1.5 py-0.5 text-[10px] font-extrabold
            ${du ? "border-warn bg-warn-soft text-ink" : "border-line bg-surface text-soft"}`}>
            <Zap size={9} />{giaXp}
          </span>
        )}
      </button>

      {/* Chiều cao CỐ ĐỊNH, không để nội dung quyết định: phép tính CAO_HANG
          ở đầu file dựa vào con số này. Tiêu đề dài thì cắt, chứ không đẩy
          nhãn tràn xuống nút hàng dưới. */}
      <span className={`line-clamp-2 overflow-hidden text-center text-[11px] font-semibold leading-tight
        ${trangThai === "khoa" ? "text-soft" : "text-ink"}`}
        style={{ marginTop: KHE_NHAN, height: NHAN_CAO }}>
        {tieuDe}
      </span>
    </div>
  );
}

/* ── Cột mốc: đề thi thử có thật của trình độ này ──
   `moDuoc` chỉ đổi cách vẽ. Nút vẫn bấm được: phòng thi mở cho mọi học sinh,
   và chặn em đó lại ở đây chỉ để cho đẹp thì là một hàng rào giả. */
function CotMoc({ moc, pos, onClick, t }) {
  return (
    <div className="absolute flex flex-col items-center"
      style={{ left: pos.x - RONG_NHAN / 2 - 16, top: pos.y - pos.r, width: RONG_NHAN + 32 }}>
      <button type="button" onClick={onClick} aria-label={moc.tieuDe}
        className={`flex items-center justify-center rounded-full border-0 shadow-md transition
          hover:brightness-105 active:scale-95
          ${moc.moDuoc ? "bg-warn text-white" : "bg-surface2 text-soft"}`}
        style={{ width: pos.r * 2, height: pos.r * 2 }}>
        <Trophy size={34} />
      </button>
      {/* Cũng cố định chiều cao, vì MOC_CHU_CAO nằm trong phép tính `cao`. */}
      <span className="line-clamp-2 overflow-hidden text-center text-xs font-extrabold leading-tight text-ink"
        style={{ marginTop: KHE_NHAN, height: 30 }}>
        {moc.tieuDe}
      </span>
      {!moc.moDuoc && (
        <span className="line-clamp-2 overflow-hidden text-center text-[10px] font-semibold leading-tight text-soft"
          style={{ height: 26 }}>
          {t("path.milestone_hint")}
        </span>
      )}
    </div>
  );
}
