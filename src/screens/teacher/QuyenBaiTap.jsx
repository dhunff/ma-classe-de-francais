import React, { useEffect, useMemo, useState } from "react";
import { KeyRound, Search, Settings2, Lock, Unlock, Loader2, BookOpen, User, ShieldCheck } from "lucide-react";
import { load, save } from "../../shared/storage.js";
import {
  PAYMENT_KEY, STATUS, accessRecord, fmtPrice, loadAccess, setAccessRemote,
  getTeacherToken, setTeacherToken, loadPremiumExercises,
} from "../../shared/access.js";
import { tr } from "../../shared/i18n.jsx";

/* Cấp quyền bài trả phí — làm lại giao diện 08/10.
 *
 * Bảng ma trận cũ (học sinh × bài) vỡ ngay khi có hơn năm bài trả phí. Nay hai
 * chế độ xem, cùng một thao tác:
 *   · Theo bài: chọn một bài → danh sách học sinh, cấp/thu hồi từng em hoặc
 *     cấp cho cả nhóm đã tick.
 *   · Theo học sinh: chọn một em → danh sách bài trả phí của em.
 * Cài đặt tài khoản nhận tiền và khoá giáo viên gập vào một khung riêng.
 *
 * Quy tắc giữ nguyên bản cũ: mọi thay đổi đi qua Edge Function (trình duyệt
 * không ghi được bảng quyền); quyền do HỌC SINH TỰ MUA (tiền hoặc XP) không gỡ
 * bằng nút ở đây. */

const o = "w-full rounded-xl border border-solid border-line bg-surface2 px-3 py-2 font-sans text-sm text-ink outline-none focus:border-primary";
const NHAN = () => ({
  [STATUS.PURCHASED]: [tr("Đã mua", "Acheté", "Purchased"), "bg-ok-soft text-ok"],
  [STATUS.GRANTED_BY_TEACHER]: [tr("Giáo viên cấp", "Accordé", "Teacher granted"), "bg-primary-soft text-primary"],
  XP: [tr("Đổi XP", "Échangé (XP)", "XP"), "bg-warn-soft text-warn"],
});
const tuMua = (rec) => rec && rec.status !== STATUS.GRANTED_BY_TEACHER;

function TrangThai({ rec }) {
  if (!rec) return <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-xs font-semibold text-soft">{tr("Chưa có quyền", "Pas d'accès", "No access")}</span>;
  const [n, c] = NHAN()[rec.status] ?? [tr("Đã mở", "Ouvert", "Unlocked"), "bg-ok-soft text-ok"];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c}`}>{n}</span>;
}

function CaiDat() {
  const [cfg, setCfg] = useState({ bank: "", account: "", accountName: "" });
  const [token, setTok] = useState(getTeacherToken);
  const [daLuu, setDaLuu] = useState(false);
  useEffect(() => { load(PAYMENT_KEY, null).then((c) => c && setCfg({ bank: "", account: "", accountName: "", ...c })); }, []);
  const luu = async () => { await save(PAYMENT_KEY, cfg); setDaLuu(true); setTimeout(() => setDaLuu(false), 2000); };
  return (
    <details className="group rounded-2xl border border-solid border-line bg-surface2">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-ink">
        <Settings2 size={15} /> {tr("Cài đặt thanh toán", "Paramètres de paiement", "Payment settings")}
        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.account ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{cfg.account ? tr("Đã có tài khoản nhận tiền", "Compte de réception configuré", "Payout account set") : tr("Chưa có tài khoản nhận tiền", "Pas de compte de réception", "No payout account")}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${token ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{token ? tr("Đã có khoá giáo viên", "Clé enseignant configurée", "Teacher key set") : tr("Thiếu khoá giáo viên", "Clé enseignant manquante", "Teacher key missing")}</span>
      </summary>
      <div className="grid gap-4 border-0 border-t border-solid border-line px-4 py-4">
        <div>
          <p className="m-0 text-xs text-soft">{tr("Tài khoản ngân hàng dùng để dựng mã QR cho học sinh.", "Compte bancaire utilisé pour générer le QR code des élèves.", "Bank account used to build students' QR codes.")}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
            <input value={cfg.bank} onChange={(e) => setCfg({ ...cfg, bank: e.target.value })} placeholder={tr("Ngân hàng (VCB)", "Banque (VCB)", "Bank (VCB)")} className={o} />
            <input value={cfg.account} onChange={(e) => setCfg({ ...cfg, account: e.target.value })} placeholder={tr("Số tài khoản", "Numéro de compte", "Account number")} className={o} />
            <input value={cfg.accountName} onChange={(e) => setCfg({ ...cfg, accountName: e.target.value })} placeholder={tr("Chủ tài khoản", "Titulaire", "Account holder")} className={o} />
            <button type="button" onClick={luu} className="h-10 cursor-pointer rounded-xl border-0 bg-primary px-4 font-sans text-sm font-bold text-white">{daLuu ? tr("Đã lưu", "Enregistré", "Saved") : tr("Lưu", "Enregistrer", "Save")}</button>
          </div>
        </div>
        <div>
          <p className="m-0 text-xs text-soft">{tr("Khoá giáo viên để cấp/thu hồi quyền. Chỉ lưu trên máy này, không gửi đi đâu khác.", "Clé enseignant pour accorder/retirer l'accès. Gardée sur cet appareil uniquement.", "Teacher key to grant/revoke access. Stored on this device only.")}</p>
          <input type="password" value={token} placeholder="••••••••" onChange={(e) => { setTok(e.target.value); setTeacherToken(e.target.value); }} className={`${o} mt-2 max-w-xs`} />
        </div>
      </div>
    </details>
  );
}

export default function QuyenBaiTap({ accounts, exercises }) {
  const [access, setAccess] = useState([]);
  const [premium, setPremium] = useState(undefined);
  const [che, setChe] = useState("bai");          // bai | hs
  const [baiId, setBaiId] = useState(null);
  const [hsTen, setHsTen] = useState(null);
  const [timTrai, setTimTrai] = useState("");
  const [timPhai, setTimPhai] = useState("");
  const [tick, setTick] = useState(() => new Set());
  const [busy, setBusy] = useState(null);
  const [loi, setLoi] = useState("");

  useEffect(() => { loadAccess().then(setAccess); }, []);
  useEffect(() => {
    let off = false;
    loadPremiumExercises(exercises).then((p) => { if (!off) setPremium(p ?? []); });
    return () => { off = true; };
  }, [exercises]);

  const bai = (premium ?? []).find((e) => e.id === baiId) ?? null;
  const soQuyen = (exId) => accounts.filter((a) => accessRecord(access, a.name, exId)).length;

  const doi = async (ten, ex, capQuyen) => {
    setBusy(`${ten}|${ex.id}`);
    const res = await setAccessRemote(capQuyen ? "grant" : "revoke", ten, ex.id);
    setBusy(null);
    if (!res.ok) { setLoi(res.reason === "no_token" ? tr("Thiếu khoá giáo viên: mở « Cài đặt thanh toán » để nhập.", "Clé enseignant manquante : ouvrez « Paramètres de paiement ».", "Teacher key missing: open « Payment settings ».") : tr("Không đổi được quyền. Kiểm tra mạng rồi thử lại.", "Impossible de modifier l'accès. Vérifiez la connexion.", "Couldn't change access. Check your connection.")); return false; }
    setLoi("");
    return true;
  };
  const doiMot = async (ten, ex) => {
    const rec = accessRecord(access, ten, ex.id);
    if (tuMua(rec)) return;
    if (await doi(ten, ex, !rec)) setAccess(await loadAccess());
  };
  const capNhom = async () => {
    if (!bai) return;
    for (const ten of tick) {
      if (accessRecord(access, ten, bai.id)) continue;
      if (!(await doi(ten, bai, true))) break;
    }
    setTick(new Set());
    setAccess(await loadAccess());
  };

  const dsTrai = useMemo(() => {
    const k = timTrai.trim().toLowerCase();
    return che === "bai"
      ? (premium ?? []).filter((e) => !k || String(e.title).toLowerCase().includes(k))
      : accounts.filter((a) => !k || a.name.toLowerCase().includes(k));
  }, [che, premium, accounts, timTrai]);
  const dsHs = useMemo(() => {
    const k = timPhai.trim().toLowerCase();
    return accounts.filter((a) => !k || a.name.toLowerCase().includes(k));
  }, [accounts, timPhai]);

  const nutDoi = (ten, ex) => {
    const rec = accessRecord(access, ten, ex.id);
    const dang = busy === `${ten}|${ex.id}`;
    if (tuMua(rec)) return <span className="inline-flex items-center gap-1 text-xs text-soft" title={tr("Học sinh tự mua, không gỡ ở đây", "Acheté par l'élève, non révocable ici", "Bought by the student, can't revoke here")}><Lock size={12} /> {tr("Tự mua", "Acheté", "Purchased")}</span>;
    return (
      <button type="button" onClick={() => doiMot(ten, ex)} disabled={dang}
        className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 font-sans text-xs font-bold disabled:cursor-wait ${rec ? "border border-solid border-line bg-surface text-soft hover:text-danger" : "border-0 bg-primary text-white"}`}>
        {dang ? <Loader2 size={12} className="animate-spin" /> : rec ? <Lock size={12} /> : <Unlock size={12} />}
        {rec ? tr("Thu hồi", "Retirer", "Revoke") : tr("Cấp quyền", "Accorder", "Grant")}
      </button>
    );
  };

  return (
    <section className="mt-6 rounded-3xl border border-solid border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary"><KeyRound size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-base font-extrabold text-ink">{tr("Cấp quyền bài trả phí", "Accès aux exercices payants", "Paid exercise access")}</h2>
          <p className="m-0 text-xs text-soft">{premium ? tr(`${premium.length} bài trả phí`, `${premium.length} exercice(s) payant(s)`, `${premium.length} paid exercise(s)`) : tr("Đang tải…", "Chargement…", "Loading…")} {tr("· Học sinh VIP tự mở mọi bài, không cần cấp.", "· Les élèves VIP ont accès à tout.", "· VIP students already have everything.")}</p>
        </div>
        <div role="tablist" className="inline-flex gap-1 rounded-full bg-surface2 p-1">
          {[["bai", tr("Theo bài", "Par exercice", "By exercise"), BookOpen], ["hs", tr("Theo học sinh", "Par élève", "By student"), User]].map(([k, n, I]) => (
            <button key={k} type="button" role="tab" aria-selected={che === k} onClick={() => { setChe(k); setTimTrai(""); setTick(new Set()); }}
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border-0 px-3 font-sans text-xs font-bold ${che === k ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft"}`}><I size={13} /> {n}</button>
          ))}
        </div>
      </div>

      <div className="mt-4"><CaiDat /></div>
      {loi && <p role="alert" className="m-0 mt-3 rounded-xl bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger">{loi}</p>}

      {premium !== undefined && premium.length === 0 ? (
        <p className="m-0 mt-5 text-sm text-soft">{tr("Chưa có bài trả phí nào. Bật « bài trả phí » khi soạn bài để bài hiện ở đây.", "Aucun exercice payant. Cochez « payant » dans l'éditeur.", "No paid exercises. Tick « paid » in the editor.")}</p>
      ) : (
        <div className="mt-5 grid items-start gap-5 md:grid-cols-[300px_1fr]">
          {/* ── Trái: chọn bài / chọn học sinh ── */}
          <div>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
              <input value={timTrai} onChange={(e) => setTimTrai(e.target.value)} placeholder={che === "bai" ? tr("Tìm bài…", "Rechercher un exercice…", "Search exercises…") : tr("Tìm học sinh…", "Rechercher un élève…", "Search students…")} className={`${o} pl-9`} />
            </div>
            <ul className="mcf-scroll m-0 mt-2 grid max-h-[420px] list-none gap-1.5 overflow-y-auto p-0">
              {premium === undefined && <li className="p-2 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</li>}
              {che === "bai" ? dsTrai.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => { setBaiId(e.id); setTick(new Set()); }}
                    className={`w-full cursor-pointer rounded-xl border border-solid px-3 py-2.5 text-left font-sans ${baiId === e.id ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary"}`}>
                    <span className="block truncate text-sm font-bold text-ink">{e.title}</span>
                    <span className="mt-0.5 block text-xs text-soft">{e.level ? `${e.level} · ` : ""}{fmtPrice(e.price)} · {soQuyen(e.id)} {tr("em có quyền", "élève(s) avec accès", "student(s) with access")}</span>
                  </button>
                </li>
              )) : dsTrai.map((a) => {
                const n = (premium ?? []).filter((e) => accessRecord(access, a.name, e.id)).length;
                return (
                  <li key={a.name}>
                    <button type="button" onClick={() => setHsTen(a.name)}
                      className={`w-full cursor-pointer rounded-xl border border-solid px-3 py-2.5 text-left font-sans ${hsTen === a.name ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary"}`}>
                      <span className="block truncate text-sm font-bold text-ink">{a.name}</span>
                      <span className="mt-0.5 block text-xs text-soft">{n}/{premium?.length ?? 0} {tr("bài đã mở", "exercices ouverts", "exercises unlocked")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Phải: chi tiết ── */}
          <div className="min-w-0 rounded-2xl border border-solid border-line p-4">
            {che === "bai" ? (!bai ? (
              <p className="m-0 py-10 text-center text-sm text-soft"><ShieldCheck size={20} className="mx-auto mb-2 block" />{tr("Chọn một bài ở cột trái.", "Choisissez un exercice à gauche.", "Pick an exercise on the left.")}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="m-0 min-w-0 flex-1 truncate text-base font-extrabold text-ink">{bai.title}</h3>
                  <span className="text-sm font-bold text-ink">{fmtPrice(bai.price)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[180px] flex-1">
                    <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-soft" />
                    <input value={timPhai} onChange={(e) => setTimPhai(e.target.value)} placeholder={tr("Tìm học sinh…", "Rechercher un élève…", "Search students…")} className={`${o} pl-9`} />
                  </div>
                  {tick.size > 0 && (
                    <button type="button" onClick={capNhom} className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border-0 bg-primary px-4 font-sans text-sm font-bold text-white">
                      <Unlock size={14} /> {tr("Cấp cho", "Accorder à", "Grant to")} {tick.size} {tr("em đã chọn", "élève(s) sélectionné(s)", "selected student(s)")}
                    </button>
                  )}
                </div>
                <ul className="mcf-scroll m-0 mt-3 grid max-h-[380px] list-none gap-1 overflow-y-auto p-0">
                  {dsHs.map((a) => {
                    const rec = accessRecord(access, a.name, bai.id);
                    return (
                      <li key={a.name} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface2">
                        <input type="checkbox" disabled={!!rec} checked={tick.has(a.name)} aria-label={tr(`Chọn ${a.name}`, `Sélectionner ${a.name}`, `Select ${a.name}`)}
                          onChange={() => setTick((s) => { const n = new Set(s); if (n.has(a.name)) n.delete(a.name); else n.add(a.name); return n; })}
                          className="h-4 w-4 cursor-pointer disabled:cursor-default" />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{a.name}</span>
                        <TrangThai rec={rec} />
                        {nutDoi(a.name, bai)}
                      </li>
                    );
                  })}
                </ul>
              </>
            )) : (!hsTen ? (
              <p className="m-0 py-10 text-center text-sm text-soft"><User size={20} className="mx-auto mb-2 block" />{tr("Chọn một học sinh ở cột trái.", "Choisissez un élève à gauche.", "Pick a student on the left.")}</p>
            ) : (
              <>
                <h3 className="m-0 text-base font-extrabold text-ink">{hsTen}</h3>
                <ul className="mcf-scroll m-0 mt-3 grid max-h-[420px] list-none gap-1 overflow-y-auto p-0">
                  {(premium ?? []).map((e) => (
                    <li key={e.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface2">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{e.title}</span>
                        <span className="block text-xs text-soft">{e.level ? `${e.level} · ` : ""}{fmtPrice(e.price)}</span>
                      </span>
                      <TrangThai rec={accessRecord(access, hsTen, e.id)} />
                      {nutDoi(hsTen, e)}
                    </li>
                  ))}
                </ul>
              </>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
