import React, { useEffect, useMemo, useState } from "react";
import {
  Lightbulb, Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Check, X, Loader2, Inbox, AlertCircle,
} from "lucide-react";
import { Rise } from "../dashboard/parts.jsx";
import { TIP_TAGS, loadTips, createTip, updateTip, deleteTip, swapOrder } from "../../shared/tips.js";

/* Màn hình soạn sổ tay — chỉ giáo viên.
 *
 * Ghi thẳng vào bảng `tips`, mỗi mẹo một dòng. Không đọc-sửa-ghi cả danh sách,
 * nên hai giáo viên soạn cùng lúc không đè lên nhau.
 *
 * RLS mới là hàng rào thật (policy `tips_write` dùng is_teacher). Route bị
 * RequireRole chặn chỉ để học sinh khỏi thấy một màn hình mà mọi thao tác đều
 * báo lỗi — nó là phép lịch sự với giao diện, không phải bảo mật.
 *
 * MÀU đi qua token; preflight tắt nên mọi input/button tự khai border và nền.
 */

const INPUT =
  "w-full rounded-xl border-0 bg-surface2 px-3.5 py-2.5 text-sm font-medium text-ink " +
  "outline-none transition placeholder:font-normal placeholder:text-soft focus:ring-2 focus:ring-primary/40";

const TAG_TONE = {
  Grammaire: "bg-primary-soft text-primary",
  Vocabulaire: "bg-ok-soft text-ok",
  "Méthode": "bg-warn-soft text-warn",
  "Piège": "bg-danger-soft text-danger",
};

/* Biểu mẫu dùng chung cho cả thêm mới lẫn sửa — hai bản sao sẽ lệch nhau ngay
   lần thêm trường thứ hai. */
function TipForm({ t, initial, onCancel, onSave, busy }) {
  const [tag, setTag] = useState(initial?.tag || TIP_TAGS[0]);
  const [title, setTitle] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setErr(t("tips.need_title")); return; }
    setErr("");
    onSave({ tag, title, body });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="flex flex-wrap gap-2">
        {TIP_TAGS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setTag(x)}
            aria-pressed={tag === x}
            className={[
              "cursor-pointer rounded-full border-0 px-3 py-1.5 font-[inherit] text-xs font-bold transition-all duration-200",
              tag === x ? TAG_TONE[x] : "bg-surface2 text-soft hover:text-ink",
            ].join(" ")}
          >
            {x}
          </button>
        ))}
      </div>

      <label className="mt-3 block">
        <span className="sr-only">{t("tips.f_title")}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tips.f_title_ph")} className={INPUT} autoFocus />
      </label>

      <label className="mt-2.5 block">
        <span className="sr-only">{t("tips.f_body")}</span>
        {/* Xuống dòng có ý nghĩa: sổ tay hiện bằng `whitespace-pre-line`, nên
            mỗi dòng ở đây là một dòng ở đó. */}
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          placeholder={t("tips.f_body_ph")} rows={4}
          className={`${INPUT} resize-y font-[inherit] leading-relaxed`} />
      </label>

      {err && (
        <p role="alert" className="m-0 mt-2 flex items-center gap-1.5 text-xs font-bold text-danger">
          <AlertCircle size={13} /> {err}
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="cursor-pointer rounded-full border-0 bg-transparent px-4 py-2 font-[inherit] text-sm font-semibold text-soft transition-colors hover:bg-surface2 hover:text-ink">
          {t("tips.cancel")}
        </button>
        <button type="submit" disabled={busy}
          className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-5 py-2 font-[inherit] text-sm font-bold text-on-primary transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60">
          {busy ? <Loader2 size={15} className="mcf-spin" /> : <Check size={15} />}
          {t("tips.save")}
        </button>
      </div>
    </form>
  );
}

function TipRow({ t, tip, first, last, onEdit, onDelete, onMove }) {
  const [confirming, setConfirming] = useState(false);

  const arrow = "grid h-7 w-7 place-items-center rounded-full border-0 bg-surface2 text-soft transition-colors enabled:cursor-pointer enabled:hover:text-primary disabled:opacity-30";

  return (
    <article className="rounded-2xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgb(0,0,0,0.09)]">
      <div className="flex items-start gap-3">
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${TAG_TONE[tip.tag] || TAG_TONE.Grammaire}`}>
          {tip.tag}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-sm font-extrabold leading-snug text-ink">{tip.title}</h3>
          {tip.body && (
            <p className="m-0 mt-1 whitespace-pre-line text-xs leading-relaxed text-soft">{tip.body}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button type="button" className={arrow} disabled={first}
            onClick={() => onMove(-1)} aria-label={t("tips.move_up")}>
            <ChevronUp size={14} />
          </button>
          <button type="button" className={arrow} disabled={last}
            onClick={() => onMove(1)} aria-label={t("tips.move_down")}>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {confirming ? (
          <>
            <span className="mr-auto text-xs font-bold text-danger">{t("tips.confirm_delete")}</span>
            <button type="button" onClick={() => setConfirming(false)}
              className="cursor-pointer rounded-full border-0 bg-surface2 px-3 py-1.5 font-[inherit] text-xs font-bold text-ink">
              {t("tips.cancel")}
            </button>
            <button type="button" onClick={onDelete}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-danger px-3 py-1.5 font-[inherit] text-xs font-bold text-white">
              <Trash2 size={13} /> {t("tips.delete")}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onEdit}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-surface2 px-3 py-1.5 font-[inherit] text-xs font-bold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
              <Pencil size={13} /> {t("tips.edit")}
            </button>
            {/* Xoá đòi xác nhận tại chỗ: một cú bấm nhầm là mất công viết. */}
            <button type="button" onClick={() => setConfirming(true)} aria-label={t("tips.delete")}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-surface2 p-0 text-soft transition-colors hover:bg-danger-soft hover:text-danger">
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

/* `initialTips` chỉ để preview.jsx dựng bố cục mà không gọi mạng — trang xem
   thử cố tình không chạm vào dữ liệu thật. Lúc chạy thật thì bỏ trống. */
export default function TipsEditor({ t, initialTips }) {
  const [tips, setTips] = useState(initialTips ?? null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const refresh = async () => setTips(await loadTips());
  useEffect(() => { if (!initialTips) refresh(); }, [initialTips]);

  const maxOrd = useMemo(
    () => (tips || []).reduce((m, x) => Math.max(m, Number(x.ord) || 0), 0),
    [tips],
  );

  /* Mọi thao tác ghi đi qua đây: chạy, báo lỗi nếu hỏng, rồi nạp lại từ máy
     chủ. Nạp lại thay vì tự sửa state cục bộ — chậm hơn một nhịp, nhưng giao
     diện không bao giờ lệch với thứ thật sự nằm trong bảng. */
  const run = async (fn) => {
    setBusy(true); setErr("");
    const res = await fn();
    setBusy(false);
    if (!res?.ok) { setErr(t("tips.err_save")); return false; }
    await refresh();
    return true;
  };

  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= tips.length) return;
    await run(() => swapOrder(tips[i], tips[j]));
  };

  return (
    <div className="pt-2">
      <div className="mx-auto max-w-3xl">
        <Rise delay={0}>
          <header className="flex flex-wrap items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Lightbulb size={21} strokeWidth={2.2} />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="m-0 text-xl font-extrabold tracking-tight text-ink">{t("tips.title")}</h1>
              <p className="m-0 mt-0.5 text-sm text-soft">{t("tips.subtitle")}</p>
            </div>
            {!adding && (
              <button type="button" onClick={() => { setAdding(true); setEditingId(null); }}
                className="flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-4 py-2.5 font-[inherit] text-sm font-bold text-on-primary transition-transform duration-200 hover:scale-[1.02]">
                <Plus size={16} /> {t("tips.add")}
              </button>
            )}
          </header>
        </Rise>

        {err && (
          <p role="alert" className="m-0 mt-4 flex items-center gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            <AlertCircle size={16} className="shrink-0" /> {err}
          </p>
        )}

        {adding && (
          <Rise delay={0} className="mt-4">
            <TipForm
              t={t}
              busy={busy}
              onCancel={() => setAdding(false)}
              onSave={async (v) => {
                if (await run(() => createTip(v, maxOrd))) setAdding(false);
              }}
            />
          </Rise>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {tips === null ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface/70" />
            ))
          ) : tips.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-12 text-center shadow-sm">
              <Inbox size={26} className="text-soft" strokeWidth={1.6} />
              <p className="m-0 text-sm font-bold text-ink">{t("tips.empty_title")}</p>
              <p className="m-0 max-w-sm text-sm text-soft">{t("tips.empty_body")}</p>
            </div>
          ) : (
            tips.map((tip, i) => (
              editingId === tip.id ? (
                <TipForm
                  key={tip.id}
                  t={t}
                  busy={busy}
                  initial={tip}
                  onCancel={() => setEditingId(null)}
                  onSave={async (v) => {
                    if (await run(() => updateTip(tip.id, v))) setEditingId(null);
                  }}
                />
              ) : (
                <TipRow
                  key={tip.id}
                  t={t}
                  tip={tip}
                  first={i === 0}
                  last={i === tips.length - 1}
                  onEdit={() => { setEditingId(tip.id); setAdding(false); }}
                  onDelete={() => run(() => deleteTip(tip.id))}
                  onMove={(dir) => move(i, dir)}
                />
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
}
