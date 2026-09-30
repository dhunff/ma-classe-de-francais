import React, { useEffect, useState } from "react";
import { X, Loader2, Users, UserPlus, UserMinus, Check } from "lucide-react";
import { Avatar } from "../../shared/avatars.jsx";
import { docDangTheoDoi, docNguoiTheoDoiToi, theoDoiLai, boTheoDoi } from "../../shared/xp.js";

/* « Mạng lưới học tập » — hai tab Người theo dõi / Đang theo dõi (01/10).
 *
 * Dữ liệu qua RPC (migration 101 + 112), không join `follows` với `profiles`
 * ở client như bản mô tả gợi ý: học sinh KHÔNG đọc được hồ sơ người khác qua
 * RLS của `profiles`, nên phép join đó trả về rỗng. Hai RPC chỉ lộ đúng tên,
 * @username và ảnh.
 *
 * Màu qua token (bg-surface, text-ink…) chứ không `bg-white dark:bg-[#131417]`:
 * token tự đảo sáng/tối và được check:design đo tương phản (quy tắc 2).
 *
 * Mỗi nút giữ trạng thái « đang gửi » riêng, khoá lại trong lúc chờ: bấm liên
 * tiếp không gửi hai lời gọi. Hỏng thì tải lại danh sách từ máy chủ thay vì
 * đoán trạng thái. */
export default function NetworkManager({ t, dong, onDoi }) {
  const [tab, setTab] = useState("followers");
  const [ds, setDs] = useState({ followers: undefined, following: undefined });
  const [dangGui, setDangGui] = useState({});
  const [loi, setLoi] = useState("");

  const nap = () => {
    docNguoiTheoDoiToi().then((x) => setDs((d) => ({ ...d, followers: x })));
    docDangTheoDoi().then((x) => setDs((d) => ({ ...d, following: x })));
  };
  useEffect(nap, []);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") dong(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dong]);

  const lam = async (id, viec) => {
    if (dangGui[id]) return;
    setDangGui((g) => ({ ...g, [id]: true })); setLoi("");
    const ok = viec === "lai" ? (await theoDoiLai(id)).ok : await boTheoDoi(id);
    setDangGui((g) => ({ ...g, [id]: false }));
    if (!ok) setLoi(t("network.err"));
    nap();
    onDoi?.();
  };

  const hienTai = ds[tab];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 font-sans" onMouseDown={(e) => { if (e.target === e.currentTarget) dong(); }}>
      <div role="dialog" aria-modal="true" aria-label={t("network.title")}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-solid border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-ink"><Users size={20} className="text-primary" />{t("network.title")}</h2>
          <button type="button" onClick={dong} aria-label={t("identity.close")}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div role="tablist" className="mx-5 mt-4 flex gap-1 rounded-full bg-surface2 p-1">
          {[["followers", t("network.followers")], ["following", t("network.following")]].map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`flex-1 cursor-pointer rounded-full border-0 px-3 py-2 font-sans text-sm font-bold transition-colors ${tab === k ? "bg-surface text-ink shadow" : "bg-transparent text-soft hover:text-ink"}`}>
              {l}{Array.isArray(ds[k]) ? ` · ${ds[k].length}` : ""}
            </button>
          ))}
        </div>

        <div className="mt-3 min-h-[12rem] overflow-y-auto px-3 pb-4">
          {hienTai === undefined ? (
            <div className="grid place-items-center py-10 text-soft"><Loader2 size={22} className="animate-spin" /></div>
          ) : hienTai === null ? (
            <p className="m-0 p-4 text-sm text-danger">{t("follow.error")}</p>
          ) : !hienTai.length ? (
            <p className="m-0 p-6 text-center text-sm text-soft">{tab === "followers" ? t("network.empty_followers") : t("follow.empty")}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {hienTai.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-3 rounded-xl p-3 transition-colors hover:bg-surface2">
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar khoa={n.avatar || ""} ten={n.name} size={40} dungYen />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{n.name}</span>
                      {n.username && <span className="block truncate text-sm text-soft">@{n.username}</span>}
                    </span>
                  </span>
                  {tab === "followers" ? (
                    n.theo_doi_lai ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-soft"><Check size={14} />{t("network.mutual")}</span>
                    ) : (
                      <button type="button" disabled={!!dangGui[n.id]} onClick={() => lam(n.id, "lai")}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-3.5 py-1.5 font-sans text-xs font-bold text-on-primary hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
                        {dangGui[n.id] ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}{t("network.follow_back")}
                      </button>
                    )
                  ) : (
                    <button type="button" disabled={!!dangGui[n.id]} onClick={() => lam(n.id, "bo")}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-3 py-1.5 font-sans text-xs font-bold text-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:cursor-wait">
                      {dangGui[n.id] ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}{t("follow.unfollow")}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {loi && <p className="m-0 px-3 pt-2 text-sm font-semibold text-danger" role="alert">{loi}</p>}
        </div>
      </div>
    </div>
  );
}
