/* Màn Thống kê của giáo viên — dựng lại 24/09 theo bố cục « KPI → biểu đồ →
   bảng ».

   NGUỒN SỐ LIỆU: bảng `attempts` (lượt làm bài máy chủ đã chấm), KHÔNG phải
   `submissions`. Màn cũ đọc `submissions` — kho bài giao cũ gần như rỗng — nên
   mọi học sinh hiện « 0/0 » và biểu đồ trống, dù học sinh đã làm bài thật.
   Giáo viên đọc được mọi lượt nhờ policy `attempts_teacher_read`.

   Không có số minh hoạ nào ở đây (CLAUDE.md, quy tắc 1). Chỗ chưa có dữ liệu
   thì nói thẳng là chưa có. Đường xu hướng chỉ hiện khi có đủ dữ liệu ở CẢ hai
   khoảng để so. */
import React, { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Users, ClipboardCheck, Gauge, Award, UserX, Download, Loader2 } from "lucide-react";
import { C, S } from "../../shared/tokens.js";
import { supabase } from "../../storageShim.js";

const NGUONG_DAT = 50; // % — cùng ngưỡng bảng điểm cũ dùng để tô xanh/đỏ
const NGAY = 86400000;

const BANG_DIEM = [
  { ten: "Giỏi (≥ 80 %)", tu: 80, mau: C.ok },
  { ten: "Khá (65–79 %)", tu: 65, mau: C.primary },
  { ten: "Đạt (50–64 %)", tu: 50, mau: C.warn },
  { ten: "Chưa đạt (< 50 %)", tu: -1, mau: C.danger },
];

const tb = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const pct = (v) => (v == null ? "—" : `${Math.round(v)} %`);

const the = { ...S.card, minWidth: 0 };
const nhan = { ...S.label, marginBottom: 12 };
const hopThoai = {
  contentStyle: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, color: C.ink, fontSize: 12.5 },
  itemStyle: { color: C.ink }, labelStyle: { color: C.soft },
};

export default function ThongKe({ accounts = [] }) {
  const [luot, setLuot] = useState(null); // null = đang tải
  const [bai, setBai] = useState({});
  const [loi, setLoi] = useState(null);

  useEffect(() => {
    let con = true;
    (async () => {
      const a = await supabase.from("attempts")
        .select("user_id, exercise_id, mode, finished_at, score, max")
        .not("finished_at", "is", null).gt("max", 0)
        .order("finished_at", { ascending: true });
      if (!con) return;
      if (a.error) { setLoi(a.error.message); setLuot([]); return; }
      const ids = [...new Set(a.data.map((r) => r.exercise_id).filter(Boolean))];
      const e = ids.length
        ? await supabase.from("exercises").select("id, title, skills").in("id", ids)
        : { data: [] };
      if (!con) return;
      setBai(Object.fromEntries((e.data ?? []).map((x) => [x.id, x])));
      setLuot(a.data.map((r) => ({ ...r, p: (r.score / r.max) * 100, t: new Date(r.finished_at).getTime() })));
    })();
    return () => { con = false; };
  }, []);

  const tk = useMemo(() => {
    if (!luot) return null;
    const theoHs = new Map(accounts.map((a) => [a.id, { acc: a, ds: [] }]));
    for (const r of luot) theoHs.get(r.user_id)?.ds.push(r);
    // Chỉ tính lượt của học sinh đang có trong lớp — tài khoản đã xoá hoặc
    // giáo viên tự làm thử không được kéo lệch trung bình.
    const hopLe = luot.filter((r) => theoHs.has(r.user_id));

    const hs = [...theoHs.values()].map(({ acc, ds }) => ({
      acc, ds, n: ds.length,
      tb: tb(ds.map((r) => r.p)),
      dat: ds.length ? (ds.filter((r) => r.p >= NGUONG_DAT).length / ds.length) * 100 : null,
      cuoi: ds.length ? ds[ds.length - 1].t : null,
    }));

    const bayGio = Date.now();
    const gan = hopLe.filter((r) => r.t >= bayGio - 30 * NGAY).map((r) => r.p);
    const truoc = hopLe.filter((r) => r.t < bayGio - 30 * NGAY).map((r) => r.p);
    const xuHuong = gan.length >= 3 && truoc.length >= 3 ? tb(gan) - tb(truoc) : null;

    const phanBo = BANG_DIEM.map((b, i) => ({
      ...b,
      so: hopLe.filter((r) => r.p >= b.tu && (i === 0 || r.p < BANG_DIEM[i - 1].tu)).length,
    }));

    const kyNang = new Map();
    for (const r of hopLe) {
      for (const k of bai[r.exercise_id]?.skills ?? []) {
        if (!kyNang.has(k)) kyNang.set(k, []);
        kyNang.get(k).push(r.p);
      }
    }
    const theoKyNang = [...kyNang].map(([k, a]) => ({ k, tb: Math.round(tb(a)), n: a.length }))
      .sort((x, y) => y.n - x.n);

    return {
      hs, hopLe, xuHuong, phanBo, theoKyNang,
      daLam: hs.filter((h) => h.n).length,
      tbChung: tb(hopLe.map((r) => r.p)),
      tiLeDat: hopLe.length ? (hopLe.filter((r) => r.p >= NGUONG_DAT).length / hopLe.length) * 100 : null,
      gan30: gan.length,
    };
  }, [luot, bai, accounts]);

  if (!tk) {
    return (
      <div style={{ ...the, display: "flex", alignItems: "center", gap: 10, color: C.soft }}>
        <Loader2 size={18} className="animate-spin" /> Đang tải số liệu…
      </div>
    );
  }

  const xuatCSV = () => {
    const rows = [["Học sinh", "Email", "Số lượt", "Điểm TB (%)", "Tỷ lệ đạt (%)", "Lần cuối"]];
    tk.hs.forEach((h) => rows.push([h.acc.name, h.acc.email ?? "", h.n,
      h.tb == null ? "" : Math.round(h.tb), h.dat == null ? "" : Math.round(h.dat),
      h.cuoi ? new Date(h.cuoi).toLocaleDateString("vi-VN") : ""]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "thong_ke_lop.csv";
    a.click();
  };

  const top = tk.hs.filter((h) => h.n).sort((a, b) => b.tb - a.tb).slice(0, 5);
  const tongLuot = tk.hopLe.length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {loi && (
        <div style={{ ...the, color: C.danger, background: C.dangerSoft }}>
          Không đọc được lượt làm bài: {loi}. Các số dưới đây có thể thiếu.
        </div>
      )}

      {/* ── Hàng KPI ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <Kpi icon={Users} mau={C.primary} nhan="Học sinh" so={accounts.length}
          phu={`${tk.daLam} đã làm ít nhất một bài`} />
        <Kpi icon={ClipboardCheck} mau={C.ok} nhan="Lượt làm bài" so={tongLuot}
          phu={`${tk.gan30} lượt trong 30 ngày qua`} />
        <Kpi icon={Gauge} mau={C.primary} nhan="Điểm trung bình" so={pct(tk.tbChung)}
          phu={tk.xuHuong == null ? "Chưa đủ dữ liệu để so với tháng trước"
            : `${tk.xuHuong >= 0 ? "↑" : "↓"} ${Math.abs(Math.round(tk.xuHuong))} điểm so với trước 30 ngày`}
          mauPhu={tk.xuHuong == null ? C.soft : tk.xuHuong >= 0 ? C.ok : C.danger} />
        <Kpi icon={Award} mau={C.warn} nhan="Tỷ lệ lượt đạt" so={pct(tk.tiLeDat)}
          phu={`Đạt = từ ${NGUONG_DAT} % trở lên`} />
        <Kpi icon={UserX} mau={C.danger} nhan="Chưa làm bài nào" so={accounts.length - tk.daLam}
          phu="học sinh cần nhắc" />
      </div>

      {/* ── Hàng biểu đồ ── */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div style={the}>
          <div style={nhan}>Phân bố điểm các lượt</div>
          {!tongLuot ? <Trong /> : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ width: 170, height: 170, position: "relative" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={tk.phanBo.filter((b) => b.so)} dataKey="so" nameKey="ten"
                      innerRadius={52} outerRadius={80} paddingAngle={2} stroke="none">
                      {tk.phanBo.filter((b) => b.so).map((b) => <Cell key={b.ten} fill={b.mau} />)}
                    </Pie>
                    <Tooltip {...hopThoai} formatter={(v) => [`${v} lượt`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", textAlign: "center" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>{tongLuot}</div>
                    <div style={{ fontSize: 11, color: C.soft }}>lượt</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 8, flex: 1, minWidth: 140 }}>
                {tk.phanBo.map((b) => (
                  <div key={b.ten} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: b.mau, flexShrink: 0 }} />
                    <span style={{ color: C.ink, flex: 1 }}>{b.ten}</span>
                    <span style={{ color: C.soft, fontVariantNumeric: "tabular-nums" }}>
                      {b.so} ({Math.round((b.so / tongLuot) * 100)} %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={the}>
          <div style={nhan}>Điểm trung bình theo kỹ năng</div>
          {!tk.theoKyNang.length ? <Trong /> : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={tk.theoKyNang} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={C.line} />
                  <XAxis dataKey="k" tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.soft }} axisLine={false} tickLine={false} />
                  <Tooltip {...hopThoai} cursor={{ fill: C.line, opacity: 0.4 }}
                    formatter={(v, _k, p) => [`${v} % · ${p.payload.n} lượt`, "Trung bình"]} />
                  <Bar dataKey="tb" fill={C.primary} radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={the}>
          <div style={nhan}>Học sinh điểm cao nhất</div>
          {!top.length ? <Trong /> : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
              {top.map((h, i) => (
                <li key={h.acc.id} className="hover:bg-surface2"
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 10 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center",
                    fontSize: 12, fontWeight: 800, background: C.primarySoft, color: C.primary }}>{i + 1}</span>
                  <span style={{ flex: 1, color: C.ink, fontWeight: 600, fontSize: 14 }}>{h.acc.name}</span>
                  <span style={{ fontSize: 12, color: C.soft }}>{h.n} lượt</span>
                  <span style={{ color: C.ok, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{pct(h.tb)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── Bảng chi tiết ── */}
      <div style={{ ...the, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div style={{ ...S.label, margin: 0 }}>Kết quả từng học sinh</div>
          <button style={{ ...S.btn(false), display: "inline-flex", alignItems: "center", gap: 6 }} onClick={xuatCSV}>
            <Download size={15} /> Xuất CSV
          </button>
        </div>
        {!accounts.length ? <p style={{ color: C.soft, margin: 0 }}>Chưa có học sinh nào.</p> : (
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
            <thead>
              <tr>
                {["Học sinh", "Số lượt", "Điểm TB", "Tỷ lệ đạt", "Xu hướng", "Lần cuối"].map((h) => (
                  <th key={h} style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.5, color: C.soft,
                    textAlign: "left", padding: "9px 12px", background: C.surface2, fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...tk.hs].sort((a, b) => b.n - a.n || (b.tb ?? 0) - (a.tb ?? 0)).map((h) => {
                const td = { fontSize: 14, padding: "10px 12px", borderBottom: `1px solid ${C.line}`, color: C.ink, fontVariantNumeric: "tabular-nums" };
                return (
                  <tr key={h.acc.id}>
                    <td style={{ ...td, fontWeight: 700 }}>{h.acc.name}</td>
                    <td style={td}>{h.n}</td>
                    <td style={{ ...td, fontWeight: 700, color: h.tb == null ? C.soft : h.tb >= NGUONG_DAT ? C.ok : C.danger }}>{pct(h.tb)}</td>
                    <td style={{ ...td, color: h.dat == null ? C.soft : C.ink }}>{pct(h.dat)}</td>
                    <td style={td}><DuongXuHuong ds={h.ds} /></td>
                    <td style={{ ...td, color: C.soft, fontSize: 13 }}>
                      {h.cuoi ? new Date(h.cuoi).toLocaleDateString("vi-VN") : "Chưa làm bài"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p style={{ fontSize: 12, color: C.soft, marginTop: 10, marginBottom: 0 }}>
          Tính trên các lượt đã nộp và được máy chủ chấm (luyện tập và thi thử). Phần viết/nói không có điểm máy chấm nên không tính vào đây.
        </p>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, mau, nhan: ten, so, phu, mauPhu }) {
  return (
    <div style={{ ...the, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ width: 42, height: 42, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0,
        color: mau, background: `color-mix(in srgb, ${mau} 14%, transparent)` }}>
        <Icon size={20} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: C.soft }}>{ten}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, lineHeight: 1.15, fontVariantNumeric: "tabular-nums" }}>{so}</div>
        <div style={{ fontSize: 12, color: mauPhu ?? C.soft, marginTop: 2 }}>{phu}</div>
      </div>
    </div>
  );
}

/* Đường điểm 8 lượt gần nhất. Dưới 2 lượt thì không có "xu hướng" nào để vẽ. */
function DuongXuHuong({ ds }) {
  if (ds.length < 2) return <span style={{ color: C.soft, fontSize: 12.5 }}>—</span>;
  const d = ds.slice(-8).map((r, i) => ({ i, p: Math.round(r.p) }));
  const len = d[d.length - 1].p >= d[0].p;
  return (
    <div style={{ width: 96, height: 28 }} title={d.map((x) => x.p + "%").join(" → ")}>
      <ResponsiveContainer>
        <LineChart data={d}>
          <YAxis hide domain={[0, 100]} />
          <Line dataKey="p" stroke={len ? C.ok : C.danger} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function Trong() {
  return <p style={{ color: C.soft, fontSize: 14, margin: 0 }}>Chưa có lượt làm bài nào được chấm.</p>;
}
