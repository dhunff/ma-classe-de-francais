import React, { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, RotateCcw, Frown, ThumbsUp, Zap, Repeat, Layers, CalendarClock, Loader2, PartyPopper } from "lucide-react";
import NutTieng from "../../shared/NutTieng.jsx";
import { hocBo } from "../../shared/boThe.js";
import { chamThe } from "../../shared/theGhiNho.js";
import { MUC, xepLichOn, ngayCong, onLai } from "../../shared/sm2.js";
/* Dùng lại thẻ lật 3D đã có thay vì dựng bản lật tại chỗ thứ hai. Nó là thành
   phần trình bày thuần — nhận mọi thứ qua props, không chạm storageShim — và
   đã được check:css canh đủ bốn lớp 3D, check:sm2 canh chồng thẻ.

   Đây là lý do TheLat3D.jsx sống sót đợt gỡ « Thẻ ghi nhớ » ngày 09/09: thứ
   bị bỏ là màn ôn SM-2 cũ, không phải cách vẽ một cái thẻ. */
import TheLat3D from "./TheLat3D.jsx";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";

/* Âm thanh khi chấm thẻ (09/10). */
const TIENG_CHAM = { lai: "timMat", kho: "bam", tot: "dung", de: "combo" };

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
const NHAN_NUT = () => ({
  lai: tr("Quên rồi", "Oublié", "Forgot"),
  kho: tr("Khó", "Difficile", "Hard"),
  tot: tr("Tốt", "Bien", "Good"),
  de: tr("Dễ", "Facile", "Easy"),
});
const ICON_NUT = { lai: RotateCcw, kho: Frown, tot: ThumbsUp, de: Zap };
const NUT_3D = {
  lai: "border-red-700 bg-gradient-to-b from-rose-500 to-red-600",
  kho: "border-orange-700 bg-gradient-to-b from-amber-400 to-orange-500",
  tot: "border-blue-800 bg-gradient-to-b from-blue-500 to-primary",
  de: "border-green-700 bg-gradient-to-b from-emerald-400 to-green-600",
};
const CAM_SAU = { lai: "buon", kho: "hum", tot: "duoc-do", de: "tuyet-voi" };
/* 17/11: nút chấm là thẻ nền nhạt theo màu ngữ nghĩa (token), rê chuột thì tô đậm. Dưới nhãn là
   LẦN ÔN TỚI nếu bấm nút đó, tính bằng chính onLai của SM-2 trên lịch của thẻ này: người học thấy
   lựa chọn của mình dẫn tới đâu. Luyện thêm không ghi lịch nên không hiện. */
const NUT_MOI = {
  lai: ["bg-danger-soft text-danger hover:bg-danger hover:text-white", "bg-danger"],
  kho: ["bg-warn-soft text-warn hover:bg-warn hover:text-white", "bg-warn"],
  tot: ["bg-primary-soft text-primary hover:bg-primary hover:text-on-primary", "bg-primary"],
  de: ["bg-ok-soft text-ok hover:bg-ok hover:text-white", "bg-ok"],
};
const lanToiNeu = (the, k) => {
  try {
    const n = onLai(the, MUC[k].q)?.interval_days;
    if (!(n >= 1)) return "";
    return k === "lai" ? tr("Gặp lại ngay", "Revient tout de suite", "Comes back now")
      : n === 1 ? tr("Ôn lại mai", "Demain", "Tomorrow") : tr(`Ôn lại sau ${n} ngày`, `Dans ${n} jours`, `In ${n} days`);
  } catch { return ""; }
};
const docTo = (chu) => {
  try {
    const sp = window.speechSynthesis; if (!sp) return;
    sp.cancel();
    const u = new window.SpeechSynthesisUtterance(chu); u.lang = "fr-FR"; u.rate = 0.9;
    sp.speak(u);
  } catch { /* máy không có giọng đọc thì thôi */ }
};
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
        {xong}/{tong} {tr("thẻ đến hạn hôm nay", "cartes à réviser aujourd'hui", "cards due today")}
      </p>
    </div>
  );
}

/* "2026-09-24" → "24/09". Cắt chuỗi, KHÔNG qua `new Date()`: parse một chuỗi
   ngày trần là parse theo UTC, và ở Việt Nam trước 7 giờ sáng nó lùi mất một
   ngày — cùng họ với bẫy `toISOString` mà `check:sm2` đang canh. */
/* Mức tệ nhất của một thẻ trong buổi (15/10): thẻ bấm « Quên rồi » rồi gặp lại
   bấm « Tốt » vẫn tính là đã sai một lần. */
const HANG_MUC = { lai: 0, kho: 1, tot: 2, de: 3 };
const tronNgauNhien = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const ngayNgan = (s) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : "");

/* `theMau`: chỉ /preview.html dùng: thẻ mẫu, KHÔNG gọi máy chủ, không ghi. */
/* `nguon` (23/10): nguồn thẻ khác bộ giáo viên, vd Sổ từ: { doc(): Promise<thẻ[]|null>, cham(the, q): Promise<{ok, moi, loi}> }. */
export default function LuyenBoThe({ bo, onThoat, theMau, nguon }) {
  const [tatCa, setTatCa] = useState(undefined);   // undefined tải · null lỗi · [] rỗng
  const [hang, setHang] = useState([]);            // thẻ đến hạn, theo thứ tự SM-2
  const [lat, setLat] = useState(false);
  const [xong, setXong] = useState(0);
  const [tongPhien, setTongPhien] = useState(0);
  const [dangGhi, setDangGhi] = useState(false);
  const [loi, setLoi] = useState("");
  const [camLeon, setCamLeon] = useState("suy-nghi");
  /* 15/10 (chủ dự án): biết thẻ nào sai và làm lại được.
     ketQua: card_id → { the, muc } (mức tệ nhất trong vòng này).
     cheDo "on" = ôn theo lịch SM-2 (ghi máy chủ); "luyen" = luyện thêm, KHÔNG ghi,
     để làm lại nhiều lần trong ngày không làm xáo lịch ôn. */
  const [ketQua, setKetQua] = useState(() => new Map());
  const [cheDo, setCheDo] = useState("on");

  useEffect(() => {
    let con = true;
    setTatCa(undefined); setHang([]); setLat(false); setXong(0); setLoi(""); setKetQua(new Map()); setCheDo("on");
    (theMau ? Promise.resolve(theMau) : nguon ? nguon.doc() : hocBo(bo?.id)).then((v) => {
      if (!con) return;
      setTatCa(v);
      if (Array.isArray(v)) {
        const denHan = xepLichOn(v, ngayCong(0));
        setHang(denHan);
        setTongPhien(denHan.length);
      }
    });
    return () => { con = false; };
  }, [bo?.id, theMau]);

  const the = hang[0] ?? null;

  const cham = async (khoa) => {
    if (!the || dangGhi) return;
    const id = the.card_id ?? the.id;
    setKetQua((m) => { const n = new Map(m); const cu = n.get(id); if (!cu || HANG_MUC[khoa] < HANG_MUC[cu.muc]) n.set(id, { the, muc: khoa }); return n; });
    if (cheDo === "luyen") {
      /* Luyện thêm: không ghi máy chủ, chỉ xoay hàng như buổi ôn. */
      phat(TIENG_CHAM[khoa] ?? "bam");
      setCamLeon(CAM_SAU[khoa] ?? "ok");
      setHang((h) => (khoa === "lai" ? [...h.slice(1), the] : h.slice(1)));
      if (khoa !== "lai") setXong((v) => v + 1);
      setLat(false);
      return;
    }
    setDangGhi(true); setLoi("");
    const kq = theMau ? { ok: true, moi: {} } : nguon ? await nguon.cham(the, MUC[khoa].q) : await chamThe(the, MUC[khoa].q);
    setDangGhi(false);

    /* Ghi hỏng thì DỪNG LẠI ở thẻ này, không lật sang thẻ sau. Lật sang là nói
       với người học rằng lần ôn đã được ghi — và ngày mai thẻ đó vẫn đến hạn
       mà không ai hiểu vì sao. Đọc kết quả trước khi nói đã xong: lần thứ năm
       trong dự án. */
    if (!kq.ok) { phat("sai"); setLoi(tr("Không lưu được lần ôn này: ", "Révision non enregistrée : ", "Couldn't save this review: ") + kq.loi); return; }

    /* Cập nhật lịch trong bộ nhớ luôn, để màn « hết thẻ » tính được lần ôn tới
       mà không phải gọi lại máy chủ. */
    phat(TIENG_CHAM[khoa] ?? "bam");
    setCamLeon(CAM_SAU[khoa] ?? "ok");
    if (khoa !== "lai" && hang.length === 1) setTimeout(() => phat("thang"), 350);
    setTatCa((ds) => ds.map((x) => (x.card_id === the.card_id ? { ...x, ...kq.moi } : x)));
    /* "Quên rồi" đưa thẻ về CUỐI hàng trong buổi này — gặp lại trước khi rời
       màn, lúc vừa kịp quên. Ba nút kia đưa thẻ ra khỏi buổi hôm nay. */
    setHang((h) => (khoa === "lai" ? [...h.slice(1), { ...the, ...kq.moi }] : h.slice(1)));
    if (khoa !== "lai") setXong((v) => v + 1);
    setLat(false);
  };

  const refPhim = React.useRef({});
  refPhim.current = { the, lat, cham };
  useEffect(() => {
    const k = (e) => {
      const st = refPhim.current;
      if (!st.the || /INPUT|TEXTAREA/.test(e.target?.tagName || "")) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); phat("lat"); setLat((v) => !v); return; }
      if (st.lat && /^[1-4]$/.test(e.key)) st.cham(THU_TU[Number(e.key) - 1]);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const batDauLuyen = (ds) => {
    if (!ds?.length) return;
    phat("batDau");
    setCheDo("luyen"); setHang(tronNgauNhien(ds)); setTongPhien(ds.length); setXong(0);
    setKetQua(new Map()); setLat(false); setLoi(""); setCamLeon("suy-nghi");
  };
  const dsKetQua = [...ketQua.values()];
  const dsSai = dsKetQua.filter((x) => x.muc === "lai" || x.muc === "kho");
  const demMuc = (k) => dsKetQua.filter((x) => x.muc === k).length;

  /* Lần ôn gần nhất trong tương lai — cho màn « xong hôm nay ». */
  const lanToi = Array.isArray(tatCa) && tatCa.length
    ? tatCa.map((x) => x.due_at).filter(Boolean).sort()[0]
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* 17/11: đầu màn gọn một hàng (lối ra, tên bộ, tiếng), tiến độ là một thanh mảnh ngay dưới:
          nhường chỗ cho tấm thẻ, thứ duy nhất cần nhìn ở màn này. */}
      <div className="mcf-cau-vao flex items-center gap-3">
        <button type="button" onClick={onThoat} aria-label={tr("Về Flashcard", "Retour aux flashcards", "Back to flashcards")}
          className="group grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-solid border-line bg-surface text-ink shadow-sm transition-colors hover:border-primary hover:text-primary">
          <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-lg font-extrabold leading-tight text-ink">{bo?.ten}</h1>
          <p className="m-0 text-xs font-bold text-soft">{cheDo === "luyen" ? tr("Luyện thêm, không đổi lịch ôn", "Entraînement libre, planning inchangé", "Extra practice, schedule unchanged") : tr("Ôn theo lịch nhắc", "Révision programmée", "Scheduled review")}</p>
        </div>
        <NutTieng />
      </div>
      {tongPhien > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface2">
            <div className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${Math.round((xong / tongPhien) * 100)}%` }}>
              <span aria-hidden className="mcf-anh-sang absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-extrabold tabular-nums text-ink shadow-sm">{xong}/{tongPhien}</span>
        </div>
      )}

      {tatCa === undefined ? (
        <p className="m-0 flex items-center justify-center gap-2 py-16 text-sm text-soft"><Loader2 size={16} className="animate-spin" /> {tr("Đang tải thẻ…", "Chargement des cartes…", "Loading cards…")}</p>
      ) : tatCa === null ? (
        <div className="mt-8 rounded-2xl bg-danger-soft p-6 text-center">
          <AlertTriangle size={20} className="mx-auto text-danger" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Không mở được bộ thẻ này", "Impossible d'ouvrir ce paquet", "Couldn't open this deck")}</p>
          <p className="m-0 mt-1 text-sm text-ink">{tr("Kiểm tra kết nối rồi thử lại.", "Vérifiez la connexion et réessayez.", "Check your connection and try again.")}</p>
        </div>
      ) : tatCa.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-solid border-line bg-surface p-8 text-center shadow-sm">
          <p className="m-0 font-bold text-ink">{tr("Bộ này chưa có thẻ nào", "Ce paquet est vide", "This deck has no cards yet")}</p>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Giáo viên chưa thêm thẻ vào đây.", "L'enseignant n'a pas encore ajouté de cartes.", "The teacher hasn't added cards yet.")}</p>
        </div>
      ) : !the ? (
        /* Hết thẻ đến hạn. Nói NGÀY quay lại — "xong" mà không nói bao giờ
           quay lại thì người ta hoặc mở lại liên tục, hoặc quên luôn bộ này. */
        <div className="mcf-cau-vao relative mt-8 overflow-hidden rounded-[2rem] border border-solid border-line bg-surface p-6 text-center shadow-sm sm:p-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
          <Leon cam={tongPhien > 0 ? (dsSai.length ? "hum" : "yeah") : "buon-ngu"} size={110} className="mcf-nay mx-auto block" />
          <p className="m-0 mt-3 text-lg font-extrabold text-ink">
            {tongPhien === 0 ? tr("Hôm nay không có thẻ nào đến hạn", "Aucune carte à réviser aujourd'hui", "No cards due today")
              : cheDo === "luyen" ? tr("Xong vòng luyện thêm", "Entraînement terminé", "Practice round done")
                : tr("Xong phần hôm nay", "Terminé pour aujourd'hui", "Done for today")}
          </p>
          <p className="m-0 mt-1 text-sm text-soft">
            {tongPhien > 0 && cheDo === "on" && tr(`Bạn đã ôn ${xong} thẻ. `, `Vous avez révisé ${xong} carte(s). `, `You reviewed ${xong} card(s). `)}
          </p>
          {cheDo === "on" && lanToi && (
            <p className="m-0 mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-extrabold text-primary">
              <CalendarClock size={15} /> {tr(`Lần ôn tới: ${ngayNgan(lanToi)}`, `Prochaine révision : ${ngayNgan(lanToi)}`, `Next review: ${ngayNgan(lanToi)}`)}
            </p>
          )}

          {dsKetQua.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {THU_TU.map((k) => (
                <div key={k} className={`rounded-2xl px-2 py-2.5 ${KIEU_NUT[k]}`}>
                  <p className="m-0 text-xl font-extrabold tabular-nums">{demMuc(k)}</p>
                  <p className="m-0 text-[11px] font-bold">{NHAN_NUT()[k]}</p>
                </div>
              ))}
            </div>
          )}

          {dsSai.length > 0 ? (
            <div className="mt-5 text-left">
              <p className="m-0 mb-2 text-sm font-extrabold text-ink">{tr(`Thẻ bạn chưa nhớ (${dsSai.length})`, `Cartes à retravailler (${dsSai.length})`, `Cards to work on (${dsSai.length})`)}</p>
              <ul className="m-0 grid list-none gap-2 p-0">
                {dsSai.map(({ the: t, muc }) => (
                  <li key={t.card_id ?? t.id} className="flex items-start gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold ${KIEU_NUT[muc]}`}>{NHAN_NUT()[muc]}</span>
                    <span className="min-w-0 flex-1">
                      <span lang="fr" className="block text-sm font-bold text-ink">{t.matTruoc}</span>
                      <span className="block text-sm text-soft">{t.matSau}</span>
                      {t.viDu && <span lang="fr" className="mt-0.5 block text-xs italic text-soft">{t.viDu}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : dsKetQua.length > 0 && (
            <p className="m-0 mt-4 flex items-center justify-center gap-2 rounded-2xl bg-ok-soft p-3 text-sm font-bold text-ok"><PartyPopper size={16} />{tr("Không thẻ nào bị quên. Tuyệt vời!", "Aucune carte oubliée. Bravo !", "No forgotten cards. Great job!")}</p>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {dsSai.length > 0 && (
              <button type="button" onClick={() => batDauLuyen(dsSai.map((x) => x.the))}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border-0 bg-primary px-5 py-3 font-sans text-sm font-extrabold text-on-primary shadow-md transition-transform hover:-translate-y-0.5 active:scale-[0.97]">
                <Repeat size={15} /> {tr(`Làm lại ${dsSai.length} thẻ sai`, `Refaire les ${dsSai.length} cartes ratées`, `Redo ${dsSai.length} missed cards`)}
              </button>
            )}
            {Array.isArray(tatCa) && tatCa.length > 0 && (
              <button type="button" onClick={() => batDauLuyen(tatCa)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-solid border-line bg-surface px-5 py-3 font-sans text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
                <Layers size={15} /> {tr(`Luyện lại cả bộ (${tatCa.length} thẻ)`, `Revoir tout le paquet (${tatCa.length})`, `Practice the whole deck (${tatCa.length})`)}
              </button>
            )}
          </div>
          <p className="m-0 mt-2 text-[11px] text-soft">{tr("Luyện thêm không làm thay đổi lịch ôn tập.", "L'entraînement libre ne modifie pas le planning de révision.", "Extra practice doesn't change your review schedule.")}</p>
        </div>
      ) : (
        <>
          {/* `conLai` vẽ chồng thẻ phía sau theo SỐ THẺ CÒN LẠI thật, không vẽ
              cứng hai cái — vẽ cứng là nói dối bằng hình ảnh khi chỉ còn một thẻ. */}
          <div className="mt-6 flex items-end justify-center gap-2">
            <Leon key={camLeon + xong} cam={lat ? (camLeon === "suy-nghi" ? "nhay-mat" : camLeon) : "suy-nghi"} size={72} className="mcf-nay shrink-0" />
            <span key={lat ? "sau" : "truoc"} className="mcf-cau-vao mb-3 rounded-2xl rounded-bl-md border border-solid border-line bg-surface px-3.5 py-2 text-sm font-bold text-ink shadow-sm">
              {lat ? tr("Bạn nhớ tới đâu? Chấm thật lòng nhé!", "Tu t'en souvenais ? Sois honnête !", "Did you remember? Be honest!") : tr("Đoán nghĩa trước rồi lật thẻ nhé!", "Devine d'abord, puis retourne la carte !", "Guess first, then flip the card!")}
            </span>
          </div>
          <div key={the.card_id ?? the.id} className="mcf-cau-vao">
          <TheLat3D
            mat={the.matTruoc /* phiên âm gỡ khỏi mặt thẻ 25/09 theo chủ dự án */}
            sau={the.matSau}
            viDu={the.viDu}
            daLat={lat}
            onLat={() => { phat("lat"); setLat((v) => !v); }}
            onNghe={() => docTo(the.matTruoc)}
            conLai={hang.length - 1}
          />
          </div>

          {loi && (
            <p className="mcf-rung m-0 mt-4 rounded-2xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{loi}</p>
          )}

          {!lat && (
            <p className="m-0 mt-6 hidden items-center justify-center gap-2 text-xs font-semibold text-soft sm:flex">
              <kbd className="rounded-lg border border-solid border-line bg-surface px-2 py-1 font-sans text-[11px] font-extrabold text-ink shadow-sm">{tr("Phím cách", "Espace", "Space")}</kbd> {tr("để lật thẻ", "pour retourner", "to flip")}
              <span aria-hidden className="mx-1 h-1 w-1 rounded-full bg-line-strong" />
              <kbd className="rounded-lg border border-solid border-line bg-surface px-2 py-1 font-sans text-[11px] font-extrabold text-ink shadow-sm">1</kbd>
              <span>{tr("đến", "à", "to")}</span>
              <kbd className="rounded-lg border border-solid border-line bg-surface px-2 py-1 font-sans text-[11px] font-extrabold text-ink shadow-sm">4</kbd> {tr("để chấm", "pour noter", "to rate")}
            </p>
          )}
          {lat && (
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {THU_TU.map((k, j) => {
                const du = cheDo === "on" ? lanToiNeu(the, k) : "";
                return (
                  <button key={k} type="button" onClick={() => cham(k)} disabled={dangGhi}
                    className={`mcf-cau-vao group relative flex cursor-pointer flex-col items-center gap-1.5 overflow-hidden rounded-3xl border-0 px-3 pb-3.5 pt-4 text-center font-sans shadow-sm transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${NUT_MOI[k][0]}`}
                    style={{ animationDelay: `${j * 60}ms` }}>
                    <span aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${NUT_MOI[k][1]}`} />
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface/70 transition-transform duration-200 group-hover:scale-110 group-hover:bg-white/25">{React.createElement(ICON_NUT[k], { size: 20 })}</span>
                    <span className="text-[15px] font-extrabold leading-tight">{NHAN_NUT()[k]}</span>
                    {du && <span className="text-[11px] font-bold opacity-85">{du}</span>}
                    <kbd className="absolute right-2.5 top-3.5 hidden rounded-md bg-surface/70 px-1.5 font-sans text-[10px] font-extrabold group-hover:bg-white/25 sm:block">{j + 1}</kbd>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
