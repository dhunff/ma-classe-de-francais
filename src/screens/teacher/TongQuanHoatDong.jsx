import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Activity, Clock, Award, CheckCircle2, TrendingUp, TrendingDown, Minus, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import { C, S } from "../../shared/tokens.js";
import { supabase } from "../../storageShim.js";
import { useT } from "../../shared/i18n.jsx";

/* Tổng quan hoạt động 7 ngày — đầu màn Thống kê giáo viên (02/10).
 *
 * ══ KHÔNG CÓ SỐ GIẢ ══ (CLAUDE.md, quy tắc 1)
 * Bản mô tả đề nghị dữ liệu mock cho « lượt truy cập », « thời gian phiên »,
 * « điểm 4 kỹ năng ». Ở đây mọi con số đọc từ bảng `attempts`:
 *
 *   Học sinh hoạt động  ← số người có ít nhất một lượt làm bài trong ngày.
 *                         Thay cho « lượt truy cập »: hệ thống KHÔNG ghi lượt
 *                         đăng nhập, và một con số đăng nhập dựng ra là bịa.
 *   Thời gian học TB    ← attempts.giay_lam (đo thật từ 27/09, migration 106).
 *                         Lượt cũ hơn không có cột này → không tính, và thẻ nói
 *                         rõ đang tính trên bao nhiêu lượt.
 *   Điểm trung bình     ← score/max của lượt đã chấm (max > 0).
 *   Tỷ lệ hoàn thành    ← lượt có finished_at / mọi lượt đã mở. Bài luyện tập
 *                         chỉ tạo lượt LÚC NỘP nên gần như luôn « hoàn thành »;
 *                         lượt bỏ dở chủ yếu đến từ thi thử. Ghi chú dưới thẻ.
 *
 * Xu hướng so 7 ngày này với 7 ngày trước. Kỳ trước = 0 thì KHÔNG in phần trăm
 * (chia cho 0 ra « +∞ % » trông như thành tích); in « chưa có dữ liệu để so ».
 *
 * Radar kỹ năng: chỉ vẽ kỹ năng có điểm máy chấm. PE/PO không có điểm máy
 * (tự chấm / không chấm) nên KHÔNG có trục 0 giả cho chúng — trục 0 đọc như
 * « lớp yếu nhất ở phần nói », một kết luận không có cơ sở.
 */

const NGAY = 86400000;
const tb = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const nhanNgay = (d) => d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
const dauNgay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

const hopThoai = {
  contentStyle: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, fontSize: 12.5 },
  itemStyle: { color: C.ink }, labelStyle: { color: C.soft },
};

export default function TongQuanHoatDong({ accounts = [] }) {
  const t = useT();
  const [luot, setLuot] = useState(null);
  const [bai, setBai] = useState({});
  const [loi, setLoi] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let con = true;
    (async () => {
      const tu = new Date(dauNgay(Date.now()) - 13 * NGAY).toISOString();
      const a = await supabase.from("attempts")
        .select("user_id, exercise_id, started_at, finished_at, score, max, giay_lam")
        .gte("started_at", tu);
      if (!con) return;
      if (a.error) { setLoi(a.error.message); setLuot([]); return; }
      const ids = [...new Set(a.data.map((r) => r.exercise_id).filter(Boolean))];
      const e = ids.length ? await supabase.from("exercises").select("id, title, skills").in("id", ids) : { data: [] };
      if (!con) return;
      setBai(Object.fromEntries((e.data ?? []).map((x) => [x.id, x])));
      setLuot(a.data);
    })();
    return () => { con = false; };
  }, []);

  const tk = useMemo(() => {
    if (!luot) return null;
    /* Chỉ tính học sinh đang có trong lớp — giáo viên tự làm thử không được
       kéo lệch số liệu (cùng quy ước với bảng bên dưới). */
    const hs = new Set(accounts.map((a) => a.id));
    const ds = luot.filter((r) => hs.has(r.user_id));
    const homNay = dauNgay(Date.now());
    const moc7 = homNay - 6 * NGAY;
    const moc14 = homNay - 13 * NGAY;
    const t0 = (r) => new Date(r.finished_at || r.started_at).getTime();
    const nay = ds.filter((r) => t0(r) >= moc7);
    const truoc = ds.filter((r) => t0(r) >= moc14 && t0(r) < moc7);

    const doKy = (k) => {
      const xong = k.filter((r) => r.finished_at);
      const cham = xong.filter((r) => r.max > 0);
      const gio = xong.filter((r) => r.giay_lam > 0);
      return {
        hoatDong: new Set(k.map((r) => r.user_id)).size,
        phut: gio.length ? tb(gio.map((r) => r.giay_lam)) / 60 : null,
        soGio: gio.length,
        diem: cham.length ? tb(cham.map((r) => (r.score / r.max) * 100)) : null,
        hoanThanh: k.length ? (xong.length / k.length) * 100 : null,
        moRa: k.length, boDo: k.length - xong.length,
      };
    };

    const ngay = Array.from({ length: 7 }, (_, i) => {
      const d = moc7 + i * NGAY;
      const trong = ds.filter((r) => t0(r) >= d && t0(r) < d + NGAY);
      return { ngay: nhanNgay(new Date(d)), hocSinh: new Set(trong.map((r) => r.user_id)).size, luot: trong.filter((r) => r.finished_at).length };
    });

    const ky = new Map();
    for (const r of nay) {
      if (!r.finished_at || !(r.max > 0)) continue;
      for (const k of bai[r.exercise_id]?.skills ?? []) {
        if (!ky.has(k)) ky.set(k, []);
        ky.get(k).push((r.score / r.max) * 100);
      }
    }
    const radar = [...ky].map(([k, a]) => ({ k, diem: Math.round(tb(a)), n: a.length }));

    return { nay: doKy(nay), truoc: doKy(truoc), ngay, radar, ds: nay };
  }, [luot, bai, accounts]);

  /* ══ ĐỒNG BỘ GOOGLE SHEETS ══
   *
   * Hai kiến trúc, và vì sao chọn cách thứ nhất:
   *
   * 1. (ĐANG DÙNG) Sinh CSV ngay trong trình duyệt rồi tải về. Google Sheets
   *    mở trực tiếp (Tệp → Nhập, hoặc kéo thả vào Drive). Không cần khoá bí
   *    mật, không có dữ liệu học sinh rời khỏi máy giáo viên qua một dịch vụ
   *    thứ ba, và hỏng thì hỏng ngay trước mắt người bấm.
   *
   * 2. (NẾU CẦN TỰ ĐỘNG) Edge Function `dong-bo-sheets`: kiểm `is_teacher()`,
   *    đọc số liệu bằng service_role, gọi Google Sheets API
   *    `spreadsheets.values.append` bằng TÀI KHOẢN DỊCH VỤ Google (khoá JSON
   *    đặt bằng `supabase secrets set`, KHÔNG BAO GIỜ nằm trong mã client), vào
   *    một bảng tính đã chia sẻ quyền sửa cho email của tài khoản dịch vụ.
   *    Hàm phải trả về số dòng Google xác nhận đã ghi (biên nhận), và trang
   *    /bao-mat phải ghi Google là bên xử lý dữ liệu TRƯỚC khi bật.
   *
   * Cách 2 cần chủ dự án tạo tài khoản dịch vụ trên Google Cloud — việc không
   * làm thay được. Nút này vì thế đi đường 1, và chữ trên nút nói đúng điều nó
   * làm (« Xuất cho Google Sheets »), không hứa « đồng bộ » tự động. */
  const xuatSheets = () => {
    const khoi = [];
    khoi.push([t("analytics.csv_title"), new Date().toLocaleString("vi-VN")]);
    khoi.push([]);
    khoi.push([t("analytics.csv_daily")]);
    khoi.push([t("analytics.col_day"), t("analytics.col_active"), t("analytics.col_attempts")]);
    tk.ngay.forEach((d) => khoi.push([d.ngay, d.hocSinh, d.luot]));
    khoi.push([]);
    khoi.push([t("analytics.csv_skills")]);
    khoi.push([t("analytics.col_skill"), t("analytics.col_avg"), t("analytics.col_attempts")]);
    tk.radar.forEach((r) => khoi.push([r.k, r.diem, r.n]));
    khoi.push([]);
    khoi.push([t("analytics.csv_attempts")]);
    khoi.push([t("analytics.col_student"), t("analytics.col_exercise"), t("analytics.col_finished"), t("analytics.col_score"), t("analytics.col_minutes")]);
    const ten = new Map(accounts.map((a) => [a.id, a.name]));
    tk.ds.forEach((r) => khoi.push([
      ten.get(r.user_id) ?? "", bai[r.exercise_id]?.title ?? r.exercise_id ?? "",
      r.finished_at ? new Date(r.finished_at).toLocaleString("vi-VN") : t("analytics.abandoned"),
      r.max > 0 ? Math.round((r.score / r.max) * 100) : "",
      r.giay_lam > 0 ? Math.round(r.giay_lam / 60) : "",
    ]));
    /* Dấu phẩy làm phân cách: Google Sheets tự nhận khi nhập. BOM ở đầu để
       Excel cũng đọc đúng tiếng Việt. */
    const csv = khoi.map((h) => h.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = `fracile_thong_ke_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setToast(t("analytics.exported"));
    setTimeout(() => setToast(""), 3500);
  };

  if (!tk) {
    return (
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, color: C.soft }}>
        <Loader2 size={18} className="animate-spin" /> {t("analytics.loading")}
      </div>
    );
  }

  const { nay, truoc } = tk;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* ── Đầu mục + nút xuất ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{t("analytics.title")}</div>
          <div style={{ fontSize: 13, color: C.soft }}>{t("analytics.subtitle")}</div>
        </div>
        <button type="button" onClick={xuatSheets}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-solid border-ok/40 bg-ok-soft px-4 py-2 font-sans text-sm font-semibold text-ok transition-all hover:brightness-95">
          <FileSpreadsheet size={17} /> {t("analytics.sync_sheets")}
        </button>
      </div>
      {loi && <div style={{ ...S.card, color: C.danger, background: C.dangerSoft }}>{t("analytics.load_error", { msg: loi })}</div>}

      {/* ── 4 thẻ ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
        <The icon={Activity} mau={C.primary} nhan={t("analytics.card_active")}
          so={nay.hoatDong} xu={phanTram(nay.hoatDong, truoc.hoatDong)} t={t}
          phu={t("analytics.card_active_sub", { n: accounts.length })} />
        <The icon={Clock} mau="#8B5CF6" nhan={t("analytics.card_time")}
          so={nay.phut == null ? "—" : `${Math.round(nay.phut)} ${t("analytics.min")}`}
          xu={nay.phut == null || truoc.phut == null ? null : phanTram(nay.phut, truoc.phut)} t={t}
          phu={nay.soGio ? t("analytics.card_time_sub", { n: nay.soGio }) : t("analytics.card_time_none")} />
        <The icon={Award} mau={C.warn} nhan={t("analytics.card_score")}
          so={nay.diem == null ? "—" : `${Math.round(nay.diem)} %`}
          xu={nay.diem == null || truoc.diem == null ? null : { diem: nay.diem - truoc.diem }} t={t}
          phu={t("analytics.card_score_sub")} />
        <The icon={CheckCircle2} mau={C.ok} nhan={t("analytics.card_done")}
          so={nay.hoanThanh == null ? "—" : `${Math.round(nay.hoanThanh)} %`}
          xu={nay.hoanThanh == null || truoc.hoanThanh == null ? null : { diem: nay.hoanThanh - truoc.hoanThanh }} t={t}
          phu={t("analytics.card_done_sub", { xong: nay.moRa - nay.boDo, bo: nay.boDo })} />
      </div>

      {/* ── Biểu đồ ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <div style={{ ...S.card, minWidth: 0 }}>
          <div style={{ ...S.label, marginBottom: 12 }}>{t("analytics.chart_traffic")}</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={tk.ngay} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tqhd-xanh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={C.line} />
                <XAxis dataKey="ngay" tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                <Tooltip {...hopThoai} />
                <Area type="monotone" dataKey="luot" name={t("analytics.col_attempts")} stroke={C.primary} strokeWidth={2.5} fill="url(#tqhd-xanh)" />
                <Area type="monotone" dataKey="hocSinh" name={t("analytics.col_active")} stroke={C.ok} strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...S.card, minWidth: 0 }}>
          <div style={{ ...S.label, marginBottom: 12 }}>{t("analytics.chart_radar")}</div>
          {tk.radar.length < 3 ? (
            <p style={{ color: C.soft, fontSize: 14, margin: 0 }}>
              {tk.radar.length ? t("analytics.radar_few", { ds: tk.radar.map((r) => `${r.k} ${r.diem} %`).join(" · ") }) : t("analytics.radar_none")}
            </p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <RadarChart data={tk.radar} outerRadius="72%">
                  <PolarGrid stroke={C.line} />
                  <PolarAngleAxis dataKey="k" tick={{ fontSize: 11, fill: C.soft }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip {...hopThoai} formatter={(v, _k, p) => [`${v} % · ${p.payload.n} ${t("analytics.attempts_short")}`, t("analytics.col_avg")]} />
                  <Radar dataKey="diem" stroke={C.primary} fill={C.primary} fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p style={{ fontSize: 12, color: C.soft, margin: "8px 0 0" }}>{t("analytics.radar_note")}</p>
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-2xl"
          style={{ border: `1px solid ${C.line}` }}>
          <Check size={16} style={{ color: C.ok }} /> {toast}
        </div>
      )}
    </div>
  );
}

/* So hai kỳ. Kỳ trước = 0 thì không có phần trăm nào có nghĩa. */
function phanTram(nay, truoc) {
  if (!truoc) return null;
  return { pct: ((nay - truoc) / truoc) * 100 };
}

function The({ icon: Icon, mau, nhan, so, phu, xu, t }) {
  const gt = xu == null ? null : xu.pct ?? xu.diem;
  const len = gt != null && gt > 0.5, xuong = gt != null && gt < -0.5;
  const XuIcon = len ? TrendingUp : xuong ? TrendingDown : Minus;
  return (
    <div style={{ ...S.card, minWidth: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.soft }}>{nhan}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>{so}</div>
        <div style={{ fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 4,
          color: gt == null ? C.soft : len ? C.ok : xuong ? C.danger : C.soft }}>
          {gt == null ? t("analytics.no_compare") : (
            <><XuIcon size={14} />{gt > 0 ? "+" : ""}{xu.pct != null ? `${gt.toFixed(1)} %` : `${Math.round(gt)} ${t("analytics.points")}`} {t("analytics.vs_last_week")}</>
          )}
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{phu}</div>
      </div>
      <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", flexShrink: 0,
        color: mau, background: `color-mix(in srgb, ${mau} 14%, transparent)` }}>
        <Icon size={21} />
      </span>
    </div>
  );
}
