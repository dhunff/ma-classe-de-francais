import React, { useEffect, useMemo, useState } from "react";
import { Check, Lock, Play, Crown, Star, Headphones, BookOpen, PenLine, Mic } from "lucide-react";
import { docCacBo, docTheTrongBo } from "../../shared/boThe.js";
import { KY_NANG } from "../../shared/kyNang.js";
import { docKetQua, ghiKetQua, docCauHinh } from "../../shared/loTrinhStore.js";
import { useT } from "../../shared/i18n.jsx";
import TroChoiMan from "./TroChoiMan.jsx";

/* Lộ trình học tập — DẠNG GAME (28/09), không còn dẫn sang thư viện luyện tập.
 *
 * ══ NGUỒN DỮ LIỆU ══
 *   chương  ← bốn kỹ năng DELF (KY_NANG), chỉ hiện kỹ năng có bộ thẻ
 *   màn     ← một bộ flashcard công khai giáo viên soạn (the_bo)
 *   câu hỏi ← thẻ thật trong bộ (the_bo_the), xem shared/troChoiThe.js
 *   trùm    ← câu hỏi trộn từ MỌI bộ của chương
 *   sao     ← lo_trinh_ket_qua (migration 108/109), máy chủ giữ sao cao nhất
 *
 * Không có dữ liệu giả. XP (migration 110): máy chủ cộng MỘT lần mỗi màn khi
 * lần đầu đạt ≥1 sao — 5 XP màn thường, 15 XP thử thách — nên không cày được.
 *
 * ══ KHOÁ TUẦN TỰ ══
 * Màn kế mở khi màn trước có ≥1 sao; trùm mở khi mọi màn của chương có sao.
 * Khoá chỉ ở giao diện — thẻ trong bộ vẫn luyện tự do ở màn Flashcard.
 */

const ICON = { CO: Headphones, CE: BookOpen, PE: PenLine, PO: Mic };
const MAU = { CO: "#0EA5E9", CE: "#10B981", PE: "#8B5CF6", PO: "#F97316" };  // ngoại lệ có chủ ý như LEVEL_COLORS: dải màu kỹ năng

/* Hình học: cột rộng RONG, nút lệch theo chu kỳ để thành đường rắn bò.
   CAO_HANG >= DK_NUT + KHE + NHAN_CAO + SAO_CAO — kiểm ngay dưới. */
const RONG = 300;
const CAO_HANG = 132;
const LECH = [0, 70, 90, 40, -40, -90, -70];
const DK_NUT = 68;
const DK_TRUM = 92;
const KHE = 6;
const SAO_CAO = 16;
const NHAN_CAO = 30;
const RONG_NHAN = 116;
const DU_CUOI = 40;

if (CAO_HANG < DK_NUT + KHE + SAO_CAO + NHAN_CAO) {
  console.error("[lo-trinh] CAO_HANG quá nhỏ — nhãn sẽ đè lên nút hàng dưới.");
}

const toaDo = (i, to) => ({
  x: RONG / 2 + LECH[i % LECH.length],
  y: CAO_HANG / 2 + i * CAO_HANG,
  r: (to ? DK_TRUM : DK_NUT) / 2,
});

function duong(diem) {
  if (diem.length < 2) return "";
  let d = `M ${diem[0].x} ${diem[0].y}`;
  for (let i = 1; i < diem.length; i++) {
    const a = diem[i - 1], b = diem[i];
    d += ` C ${a.x} ${a.y + CAO_HANG / 2}, ${b.x} ${b.y - CAO_HANG / 2}, ${b.x} ${b.y}`;
  }
  return d;
}

export default function LoTrinh() {
  const t = useT();
  const [bo, setBo] = useState(null);          // null = đang tải, false = lỗi
  const [ketQua, setKetQua] = useState(new Map());
  const [dangChoi, setDangChoi] = useState(null);   // { maMan, tieuDe, the, soCau, ghep }
  const [dangMo, setDangMo] = useState(null);

  useEffect(() => {
    let huy = false;
    Promise.all([docCacBo(), docKetQua(), docCauHinh()]).then(([b, k, ch]) => {
      if (huy) return;
      if (b === null) { setBo(false); return; }
      /* Cấu hình của giáo viên (113): bộ bị tắt thì rời lộ trình, thứ tự và số
         câu theo giáo viên đặt. Bộ chưa có dòng cấu hình → mặc định. */
      setBo(b.filter((x) => x.congKhai && x.soThe >= 4 && ch.get(x.id)?.bat !== false)
        .map((x) => ({ ...x, thuTu: ch.get(x.id)?.ord ?? 1000 + (x.ord ?? 0), soCau: ch.get(x.id)?.soCau ?? 8 }))
        .sort((a, z) => a.thuTu - z.thuTu));
      if (k) setKetQua(k);
    });
    return () => { huy = true; };
  }, []);

  /* Dựng chương + trạng thái. Khoá tuần tự chạy XUYÊN chương: chương Đọc chỉ
     mở khi trùm chương Nghe đã hạ — một lộ trình, không phải bốn. */
  const chuongs = useMemo(() => {
    if (!bo) return [];
    let truocDaQua = true;
    let daGapHienTai = false;
    const trangThai = (sao) => {
      if (sao > 0) { truocDaQua = true; return "xong"; }
      if (truocDaQua && !daGapHienTai) { daGapHienTai = true; truocDaQua = false; return "hienTai"; }
      truocDaQua = false;
      return "khoa";
    };
    return KY_NANG.map(({ ma }) => {
      const ds = bo.filter((b) => b.kyNang === ma);
      if (!ds.length) return null;
      const man = ds.map((b) => {
        const sao = ketQua.get(`bo:${b.id}`) || 0;
        return { maMan: `bo:${b.id}`, boId: b.id, tieuDe: b.ten, soThe: b.soThe, soCau: b.soCau, sao, trangThai: trangThai(sao) };
      });
      const saoTrum = ketQua.get(`trum:${ma}`) || 0;
      const trum = { maMan: `trum:${ma}`, sao: saoTrum, trangThai: trangThai(saoTrum), boIds: ds.map((b) => b.id) };
      return { ma, man, trum };
    }).filter(Boolean);
  }, [bo, ketQua]);

  const tongSao = [...ketQua.values()].reduce((a, b) => a + b, 0);
  const tongMan = chuongs.reduce((n, c) => n + c.man.length + 1, 0);

  const mo = async (m, laTrum, ma) => {
    if (m.trangThai === "khoa" || dangMo) return;
    setDangMo(m.maMan);
    const ds = await Promise.all((laTrum ? m.boIds : [m.boId]).map(docTheTrongBo));
    setDangMo(null);
    if (ds.some((x) => x === null)) { alert(t("path.load_error")); return; }
    setDangChoi({
      maMan: m.maMan,
      tieuDe: laTrum ? t("path.boss_of", { ky: t(`path.sk_${ma}`) }) : m.tieuDe,
      the: ds.flat(),
      soCau: laTrum ? 12 : (m.soCau || 8),
      ghep: !laTrum,
    });
  };

  const luuKetQua = async (sao) => {
    const r = await ghiKetQua(dangChoi.maMan, sao);
    if (!r.loi) setKetQua((k) => new Map(k).set(dangChoi.maMan, r.sao));
    return r;
  };

  if (bo === null) {
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

  if (bo === false || !chuongs.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface2">
          <Crown size={28} className="text-soft" />
        </div>
        <h2 className="m-0 mt-4 text-lg font-extrabold text-ink">{t("path.empty_title")}</h2>
        <p className="mt-2 text-sm text-soft">{bo === false ? t("path.load_error") : t("path.empty_body")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t("nav.path")}</h1>
          <p className="m-0 mt-1 text-sm text-soft">{t("path.subtitle")}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1.5 text-sm font-extrabold text-ink">
          <Star size={16} className="text-warn" fill="currentColor" />
          {t("path.stars", { sao: tongSao, tong: tongMan * 3 })}
        </span>
      </header>

      {chuongs.map((c) => (
        <Chuong key={c.ma} chuong={c} dangMo={dangMo} onMo={mo} t={t} />
      ))}

      {dangChoi && (
        <TroChoiMan {...dangChoi} t={t} onXong={luuKetQua} onDong={() => setDangChoi(null)} />
      )}
    </div>
  );
}

function Chuong({ chuong, dangMo, onMo, t }) {
  const { ma, man, trum } = chuong;
  const mau = MAU[ma];
  const Icon = ICON[ma];
  const diem = [...man.map((_, i) => toaDo(i, false)), toaDo(man.length, true)];
  const cao = diem.length * CAO_HANG + DU_CUOI;
  const soXong = man.filter((m) => m.sao > 0).length + (trum.sao > 0 ? 1 : 0);
  const diemXong = diem.slice(0, soXong > 0 ? Math.min(soXong + 1, diem.length) : 0);

  return (
    <section className="mb-6">
      <div className="sticky top-0 z-10 -mx-4 mb-2 bg-surface/90 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white shadow-sm" style={{ backgroundColor: mau }}>
          <Icon size={22} />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs font-bold uppercase tracking-wider opacity-80">{t("path.chapter", { ky: t(`path.sk_${ma}`) })}</p>
            <p className="m-0 text-sm font-extrabold">{t("path.chapter_count", { xong: Math.min(soXong, man.length), n: man.length })}</p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: RONG, height: cao }}>
        <svg width={RONG} height={cao} className="absolute inset-0" aria-hidden="true">
          <path d={duong(diem)} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-line" strokeDasharray="2 16" />
          {diemXong.length > 1 && (
            <path d={duong(diemXong)} fill="none" strokeWidth="8" strokeLinecap="round" stroke={mau} />
          )}
        </svg>

        {man.map((m, i) => (
          <Nut key={m.maMan} m={m} pos={toaDo(i, false)} mau={mau} Icon={Icon}
            dangMo={dangMo === m.maMan} onClick={() => onMo(m, false, ma)} t={t} />
        ))}
        <Nut m={{ ...trum, tieuDe: t("path.boss") }} pos={toaDo(man.length, true)} mau={mau} trum
          dangMo={dangMo === trum.maMan} onClick={() => onMo(trum, true, ma)} t={t} />
      </div>
    </section>
  );
}

function Nut({ m, pos, mau, Icon, trum, dangMo, onClick, t }) {
  const { trangThai, sao, tieuDe, soThe } = m;
  const khoa = trangThai === "khoa";
  const hienTai = trangThai === "hienTai";
  /* Nút nổi khối: viền dưới đậm hơn tạo cảm giác bấm được, kiểu nút game. */
  const kieu = khoa ? { backgroundColor: "rgb(var(--mcf-surface2-rgb))", boxShadow: "0 6px 0 rgb(var(--mcf-line-rgb))" }
    : trum ? { backgroundColor: "#F59E0B", boxShadow: "0 6px 0 #B45309" }
      : { backgroundColor: mau, boxShadow: `0 6px 0 color-mix(in srgb, ${mau} 65%, black)` };

  return (
    <div className="absolute flex flex-col items-center"
      style={{ left: pos.x - RONG_NHAN / 2, top: pos.y - pos.r, width: RONG_NHAN }}>
      {hienTai && (
        <span className="absolute -top-9 z-10 animate-bounce whitespace-nowrap rounded-xl border-2 border-solid border-line bg-surface px-3 py-1 text-xs font-extrabold uppercase tracking-wide"
          style={{ color: trum ? "#B45309" : mau }}>
          {t("path.start")}
        </span>
      )}
      <button type="button" onClick={onClick} disabled={khoa}
        title={khoa ? t(trum ? "path.boss_hint" : "path.locked") : trum ? tieuDe : `${tieuDe} — ${t("path.cards_n", { n: soThe })}`}
        aria-label={tieuDe}
        className={`relative flex items-center justify-center rounded-full border-0 transition
          ${khoa ? "cursor-not-allowed text-soft" : "cursor-pointer text-white hover:brightness-110 active:translate-y-1"}
          ${hienTai ? "ring-8 ring-primary-soft" : ""} ${dangMo ? "animate-pulse" : ""}`}
        style={{ width: pos.r * 2, height: pos.r * 2, ...kieu }}>
        {khoa ? <Lock size={trum ? 30 : 24} />
          : trum ? <Crown size={38} strokeWidth={2.2} />
            : trangThai === "xong" ? <Check size={30} strokeWidth={3.5} />
              : hienTai ? <Play size={26} fill="currentColor" />
                : <Icon size={24} />}
      </button>

      <span className="flex gap-0.5" style={{ marginTop: KHE + 4, height: SAO_CAO }} aria-label={`${sao}/3`}>
        {!khoa && [1, 2, 3].map((k) => (
          <Star key={k} size={14} className={k <= sao ? "text-warn" : "text-line"} fill={k <= sao ? "currentColor" : "none"} />
        ))}
      </span>
      <span className={`line-clamp-2 overflow-hidden text-center text-[11px] font-bold leading-tight ${khoa ? "text-soft" : "text-ink"}`}
        style={{ height: NHAN_CAO }}>
        {tieuDe}
      </span>
    </div>
  );
}
