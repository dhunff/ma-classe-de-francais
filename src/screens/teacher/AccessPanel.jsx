import React, { useEffect, useState } from "react";
import { Loader2, Check, Crown } from "lucide-react";
import { C, S } from "../../shared/tokens.js";
import { supabase } from "../../storageShim.js";
import { isPremium, fmtPrice, loadAccess, accessRecord, setAccessRemote, STATUS } from "../../shared/access.js";

/* Quản lý quyền truy cập của MỘT học sinh.

   Hai tầng, cố ý tách bạch:

   1. Toàn quyền (profiles.has_premium_access) — mở cả những bài chưa tồn tại
      lúc bật. Dành cho học sinh đóng trọn gói. Ghi thẳng vào profiles vì
      policy trong 003 cho giáo viên toàn quyền ghi bảng đó.

   2. Từng bài (exercise_access) — KHÔNG ghi trực tiếp được. Bảng đó chặn mọi
      lệnh ghi từ trình duyệt (migration 001), nên phải đi qua Edge Function
      grant-access giữ service_role. Đó là chủ ý: nếu client ghi được thì học
      sinh tự mở khoá cho mình mà không trả tiền.

   Công tắc làm bằng <button role="switch"> thuần chứ không thêm Radix — một
   cái công tắc không đáng một dependency, và role="switch" + aria-checked là
   thứ trình đọc màn hình cần, không phải thư viện. */

function Switch({ on, busy, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      onClick={() => onChange(!on)}
      style={{
        width: 48, height: 28, borderRadius: 999, border: "none", cursor: busy ? "wait" : "pointer",
        background: on ? C.primary : C.lineStrong, position: "relative", flexShrink: 0,
        transition: "background .2s ease", opacity: busy ? 0.6 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: 999,
        background: "#fff", transition: "left .2s ease", boxShadow: "0 1px 3px rgba(0,0,0,.25)",
      }} />
    </button>
  );
}

export default function AccessPanel({ student, exercises }) {
  const [full, setFull] = useState(false);
  const [access, setAccess] = useState([]);
  const [busy, setBusy] = useState(null);   // null | 'full' | exerciseId
  const [msg, setMsg] = useState("");

  const premium = exercises.filter(isPremium);

  useEffect(() => {
    let off = false;
    (async () => {
      const [{ data }, acc] = await Promise.all([
        supabase.from("profiles").select("has_premium_access").eq("email", student.email).maybeSingle(),
        loadAccess(),
      ]);
      if (off) return;
      setFull(!!data?.has_premium_access);
      setAccess(acc);
    })();
    return () => { off = true; };
  }, [student.email]);

  const toggleFull = async (next) => {
    if (!student.email) { setMsg("Học sinh này chưa có email nên chưa có hồ sơ."); return; }
    setBusy("full"); setMsg("");
    const { error } = await supabase
      .from("profiles").update({ has_premium_access: next }).eq("email", student.email);
    setBusy(null);
    if (error) { setMsg("Không lưu được. Bạn có đang đăng nhập bằng tài khoản giáo viên không?"); return; }
    setFull(next);
  };

  const toggleOne = async (ex) => {
    const rec = accessRecord(access, student.name, ex.id);
    /* Bài đã thanh toán thì không thu hồi từ đây — đó là bản ghi tiền bạc,
       không phải quyền do giáo viên cấp. */
    if (rec && rec.status === STATUS.PURCHASED) { setMsg("Bài này học sinh đã thanh toán."); return; }
    setBusy(ex.id); setMsg("");
    const res = await setAccessRemote(rec ? "revoke" : "grant", student.name, ex.id);
    setBusy(null);
    if (!res?.ok) { setMsg("Không gọi được máy chủ. Kiểm tra khoá giáo viên và hàm grant-access."); return; }
    setAccess(await loadAccess());
  };

  return (
    <div className="mcf-card" style={{ ...S.card, marginTop: 16 }}>
      <div style={{ ...S.label, marginBottom: 12 }}>Gestion des accès</div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
        <Crown size={18} color={full ? C.primary : C.soft} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
            Débloquer tous les exercices payants
          </div>
          <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>
            Couvre aussi les exercices créés plus tard.
          </div>
        </div>
        {busy === "full"
          ? <Loader2 size={18} className="mcf-spin" color={C.soft} />
          : <Switch on={full} busy={false} onChange={toggleFull} label="Accès complet" />}
      </div>

      {/* Bật toàn quyền rồi thì danh sách từng bài không còn ý nghĩa — mọi bài
          đều mở. Ẩn đi thay vì để giáo viên bấm vào thứ không đổi được gì. */}
      {!full && (
        <div style={{ marginTop: 8, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
          {premium.length === 0 ? (
            <p style={{ fontSize: 13, color: C.soft, margin: "8px 0 0" }}>
              Aucun exercice payant pour le moment.
            </p>
          ) : premium.map((ex) => {
            const rec = accessRecord(access, student.name, ex.id);
            const paid = rec?.status === STATUS.PURCHASED;
            return (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ex.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.soft }}>
                    {fmtPrice(ex.price)}
                    {paid && <span style={{ color: C.ok, fontWeight: 700 }}> · payé</span>}
                    {rec && !paid && <span style={{ color: C.primary, fontWeight: 700 }}> · accordé</span>}
                  </div>
                </div>
                {busy === ex.id
                  ? <Loader2 size={16} className="mcf-spin" color={C.soft} />
                  : paid
                    ? <Check size={18} color={C.ok} />
                    : <Switch on={!!rec} busy={false} onChange={() => toggleOne(ex)} label={ex.title} />}
              </div>
            );
          })}
        </div>
      )}

      {msg && <p style={{ color: C.danger, fontSize: 13, marginTop: 10, marginBottom: 0 }}>{msg}</p>}
    </div>
  );
}
