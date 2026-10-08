import React, { useEffect, useMemo, useState } from "react";
import { Check, Lock, Play, Crown, Star, BookOpen } from "lucide-react";
import { docKetQua, ghiKetQua, docLoTrinh } from "../../shared/loTrinhStore.js";
import { useT, tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import TroChoiMan from "./TroChoiMan.jsx";

/* Lộ trình học tập — THEO CHỦ ĐỀ XÃ HỘI (06/10), không theo kỹ năng nữa.
 *
 * ══ NGUỒN DỮ LIỆU ══ (migration 115/116, soạn ở scripts/lo-trinh/chu-de.mjs)
 *   chương  ← 16 chủ đề nghị luận xã hội (lo_trinh_chu_de)
 *   màn     ← 100 màn, mỗi màn 8 mục từ có LOẠI TỪ (lo_trinh_man, lo_trinh_tu)
 *   câu hỏi ← shared/troChoiThe.js: nhiễu CÙNG LOẠI TỪ, cùng chủ đề, độ dài gần
 *             đáp án, để không đoán được đáp án qua hình thức
 *   trùm    ← thử thách 12 câu trộn mọi mục của chủ đề
 *   sao/XP  ← lo_trinh_ket_qua + ghi_ket_qua_man (5 XP màn, 15 XP thử thách,
 *             một lần mỗi màn, máy chủ cộng)
 *
 * ══ TIẾN TRÌNH RIÊNG TỪNG CHỦ ĐỀ ══
 * 100 màn mà khoá xuyên suốt thì phải xong chủ đề 1 mới thấy chủ đề 2. Nên mỗi
 * chủ đề tự mở tuần tự (màn sau mở khi màn trước có ≥1 sao, thử thách mở khi
 * xong mọi màn), và học sinh chọn chủ đề ở dãy nút đầu trang. Màn giáo viên tắt
 * (bat = false) không hiện. Khoá chỉ là giao diện. */

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
  const [lt, setLt] = useState(null);           // null = đang tải, false = lỗi
  const [ketQua, setKetQua] = useState(new Map());
  const [chon, setChon] = useState(null);       // id chủ đề đang xem
  const [dangChoi, setDangChoi] = useState(null);

  useEffect(() => {
    let huy = false;
    Promise.all([docLoTrinh(), docKetQua()]).then(([d, k]) => {
      if (huy) return;
      if (!d) { setLt(false); return; }
      setLt(d);
      if (k) setKetQua(k);
    });
    return () => { huy = true; };
  }, []);

  /* Mỗi chủ đề: màn đang bật + trạng thái tuần tự riêng. */
  const chuongs = useMemo(() => {
    if (!lt) return [];
    return lt.chuDe.map((c) => {
      let truocDaQua = true, daGapHienTai = false;
      const trangThai = (sao) => {
        if (sao > 0) { truocDaQua = true; return "xong"; }
        if (truocDaQua && !daGapHienTai) { daGapHienTai = true; truocDaQua = false; return "hienTai"; }
        truocDaQua = false;
        return "khoa";
      };
      const man = c.man.filter((m) => m.bat && m.tu.length >= 4).map((m) => {
        const sao = ketQua.get("man:" + m.id) || 0;
        return { maMan: "man:" + m.id, tieuDe: m.ten, cap: m.cap, the: m.tu, soCau: m.soCau, soThe: m.tu.length, sao, trangThai: trangThai(sao) };
      });
      const saoTrum = ketQua.get("trum:" + c.id) || 0;
      const trum = { maMan: "trum:" + c.id, sao: saoTrum, trangThai: trangThai(saoTrum), the: man.flatMap((m) => m.the) };
      return { ma: c.id, ten: c.tenVi, tenFr: c.tenFr, mau: c.mau, man, trum };
    }).filter((c) => c.man.length);
  }, [lt, ketQua]);

  /* Mặc định mở chủ đề đầu tiên chưa hạ thử thách. */
  const dangXem = chuongs.find((c) => c.ma === chon) || chuongs.find((c) => !(c.trum.sao > 0)) || chuongs[0];
  const tongSao = chuongs.reduce((n, c) => n + c.man.reduce((a, m) => a + m.sao, 0) + c.trum.sao, 0);
  const tongMan = chuongs.reduce((n, c) => n + c.man.length + 1, 0);

  const mo = (m, laTrum, c) => {
    if (m.trangThai === "khoa") { phat("sai"); return; }
    phat("batDau");
    setDangChoi({
      maMan: m.maMan,
      tieuDe: laTrum ? t("path.boss_of", { ky: c.ten }) : m.tieuDe,
      the: m.the, kho: lt.kho,
      soCau: laTrum ? 12 : (m.soCau || 8),
      ghep: !laTrum,
    });
  };

  const luuKetQua = async (sao) => {
    const r = await ghiKetQua(dangChoi.maMan, sao);
    if (!r.loi) setKetQua((k) => new Map(k).set(dangChoi.maMan, r.sao));
    return r;
  };

  if (lt === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-8 w-48 animate-pulse rounded-full bg-surface2" />
        <div className="mt-8 space-y-6">
          {[0, 1, 2, 3].map((i) => <div key={i} className="mx-auto h-16 w-16 animate-pulse rounded-full bg-surface2" />)}
        </div>
      </div>
    );
  }

  if (lt === false || !chuongs.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface2"><Crown size={28} className="text-soft" /></div>
        <h2 className="m-0 mt-4 text-lg font-extrabold text-ink">{t("path.empty_title")}</h2>
        <p className="mt-2 text-sm text-soft">{lt === false ? t("path.load_error") : t("path.empty_body")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      {/* Khung đầu trang (09/10): Leon + tổng sao + thanh tiến độ. */}
      <header className="mcf-cau-vao relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-primary to-indigo-600 p-6 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
        <span aria-hidden className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-sky-300/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <Leon cam="phap" size={112} className="mcf-leon-bay shrink-0 drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)] max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight">{t("nav.path")}</h1>
            <p className="m-0 mt-1 text-sm text-white/85">{t("path.subtitle_topics", { n: tongMan - chuongs.length, c: chuongs.length })}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20">
                <div className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-[width] duration-1000 ease-out" style={{ width: `${Math.max(3, (tongSao / (tongMan * 3)) * 100)}%` }}>
                  <span aria-hidden className="mcf-anh-sang absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">
                <Star size={15} className="text-amber-300" fill="currentColor" />{tongSao}<span className="text-white/70">/{tongMan * 3}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Dãy chọn chủ đề — mỗi nút hiện số màn đã qua / tổng. */}
      <nav aria-label={t("path.topics")} className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2">
        {chuongs.map((c) => {
          const xong = c.man.filter((m) => m.sao > 0).length;
          const dang = c.ma === dangXem.ma;
          return (
            <button key={c.ma} type="button" onClick={() => { if (!dang) phat("tiep"); setChon(c.ma); }} aria-pressed={dang}
              className={"shrink-0 cursor-pointer rounded-2xl border-2 border-solid px-3 py-2 text-left font-sans transition-all duration-200 " + (dang ? "-translate-y-0.5 text-white shadow-lg" : "border-line bg-surface text-ink hover:-translate-y-0.5 hover:bg-surface2")}
              style={dang ? { backgroundColor: c.mau, borderColor: c.mau } : undefined}>
              <span className="block max-w-[11rem] truncate text-xs font-extrabold">{c.ten}</span>
              <span className={"block text-[11px] font-semibold " + (dang ? "opacity-90" : "text-soft")}>{xong}/{c.man.length}{c.trum.sao > 0 ? " · ★" : ""}</span>
              <span className={"mt-1 block h-1 w-full overflow-hidden rounded-full " + (dang ? "bg-white/30" : "bg-surface2")}>
                <span className="block h-full rounded-full" style={{ width: `${(xong / c.man.length) * 100}%`, backgroundColor: dang ? "#fff" : c.mau }} />
              </span>
            </button>
          );
        })}
      </nav>

      <Chuong key={dangXem.ma} chuong={dangXem} onMo={(m, laTrum) => mo(m, laTrum, dangXem)} t={t} />

      {dangChoi && <TroChoiMan {...dangChoi} t={t} onXong={luuKetQua} onDong={() => setDangChoi(null)} />}
    </div>
  );
}

function Chuong({ chuong, onMo, t }) {
  const { man, trum, mau } = chuong;
  const Icon = BookOpen;
  const diem = [...man.map((_, i) => toaDo(i, false)), toaDo(man.length, true)];
  const cao = diem.length * CAO_HANG + DU_CUOI;
  const soXong = man.filter((m) => m.sao > 0).length + (trum.sao > 0 ? 1 : 0);
  const diemXong = diem.slice(0, soXong > 0 ? Math.min(soXong + 1, diem.length) : 0);

  return (
    <section className="mb-6">
      <div className="sticky top-0 z-10 -mx-4 mb-2 bg-surface/90 px-4 py-2 backdrop-blur">
        <div className="mcf-cau-vao relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-white shadow-md" style={{ backgroundImage: `linear-gradient(135deg, ${mau}, color-mix(in srgb, ${mau} 70%, black))` }}>
          <span aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <Leon cam={soXong >= man.length + 1 ? "yeah" : soXong > 0 ? "hoc" : "chao"} size={56} className="relative shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-xs font-bold uppercase tracking-wider opacity-80">{chuong.tenFr}</p>
            <p className="m-0 text-base font-extrabold">{chuong.ten}</p>
            <p className="m-0 text-sm font-extrabold">{t("path.chapter_count", { xong: Math.min(soXong, man.length), n: man.length })}</p>
            <span className="mt-1 block h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/25">
              <span className="block h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${(Math.min(soXong, man.length) / man.length) * 100}%` }} />
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto" style={{ width: RONG, height: cao }}>
        <svg width={RONG} height={cao} className="absolute inset-0" aria-hidden="true">
          <path d={duong(diem)} fill="none" strokeWidth="8" strokeLinecap="round" className="stroke-line" strokeDasharray="2 16" />
          {diemXong.length > 1 && (
            <path d={duong(diemXong)} fill="none" strokeWidth="10" strokeLinecap="round" stroke={mau} pathLength="1" className="mcf-ve-duong" />
          )}
        </svg>

        {man.map((m, i) => (
          <Nut key={m.maMan} m={m} pos={toaDo(i, false)} mau={mau} Icon={Icon} thuTu={i}
            onClick={() => onMo(m, false)} t={t} />
        ))}
        <Nut m={{ ...trum, tieuDe: t("path.boss") }} pos={toaDo(man.length, true)} mau={mau} trum thuTu={man.length}
          onClick={() => onMo(trum, true)} t={t} />
      </div>
    </section>
  );
}

function Nut({ m, pos, mau, Icon, trum, onClick, t, thuTu = 0 }) {
  const dangMo = false;
  const [rung, setRung] = useState(0);
  const { trangThai, sao, tieuDe, soThe } = m;
  const khoa = trangThai === "khoa";
  const hienTai = trangThai === "hienTai";
  /* Nút nổi khối: viền dưới đậm hơn tạo cảm giác bấm được, kiểu nút game. */
  const kieu = khoa ? { backgroundColor: "rgb(var(--mcf-surface2-rgb))", boxShadow: "0 6px 0 rgb(var(--mcf-line-rgb))" }
    : trum ? { backgroundColor: "#F59E0B", boxShadow: "0 6px 0 #B45309" }
      : { backgroundColor: mau, boxShadow: `0 6px 0 color-mix(in srgb, ${mau} 65%, black)` };

  return (
    <div className="mcf-nut-vao absolute flex flex-col items-center"
      style={{ left: pos.x - RONG_NHAN / 2, top: pos.y - pos.r, width: RONG_NHAN, animationDelay: `${120 + thuTu * 70}ms` }}>
      {hienTai && (
        <Leon cam={trum ? "gian" : "chao"} size={64}
          className={`mcf-leon-bay pointer-events-none absolute top-0 z-10 ${pos.x > RONG / 2 ? "-left-12" : "-right-12"}`} />
      )}
      {hienTai && (
        <span className="absolute -top-9 z-10 animate-bounce whitespace-nowrap rounded-xl border-2 border-solid border-line bg-surface px-3 py-1 text-xs font-extrabold uppercase tracking-wide"
          style={{ color: trum ? "#B45309" : mau }}>
          {t("path.start")}
        </span>
      )}
      <button key={rung} type="button" onClick={() => { if (khoa) setRung((n) => n + 1); onClick(); }} aria-disabled={khoa}
        title={khoa ? t(trum ? "path.boss_hint" : "path.locked") : trum ? tieuDe : `${tieuDe} (${m.cap}) · ${t("path.cards_n", { n: soThe })}`}
        aria-label={tieuDe}
        className={`relative flex items-center justify-center rounded-full border-0 transition
          ${khoa ? `cursor-not-allowed text-soft ${rung ? "mcf-rung" : ""}` : "cursor-pointer text-white hover:-translate-y-0.5 hover:brightness-110 active:translate-y-1"}
          ${hienTai ? "ring-8 ring-primary-soft" : ""} ${dangMo ? "animate-pulse" : ""}`}
        style={{ width: pos.r * 2, height: pos.r * 2, ...kieu, "--vong": trum ? "rgba(245,158,11,0.55)" : `color-mix(in srgb, ${mau} 55%, transparent)` }}>
        {hienTai && <span aria-hidden className="mcf-vong-sang pointer-events-none absolute inset-0 rounded-full" />}
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
