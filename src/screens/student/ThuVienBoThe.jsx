import React, { useMemo, useState } from "react";
import { ChevronsRight, AlertTriangle, Layers, Lock, Unlock, Plus, Trash2 } from "lucide-react";
import TourGioiThieu from "../../shared/TourGioiThieu.jsx";
import { useT, tr } from "../../shared/i18n.jsx";
import { KY_NANG } from "../../shared/kyNang.js";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";
import NutTieng from "../../shared/NutTieng.jsx";

/* Thư viện bộ thẻ — cột tab dọc bên trái, lưới thẻ bên phải.
 *
 * ══ TAB DỌC HOẠT ĐỘNG THẾ NÀO ══
 *
 * `[writing-mode:vertical-lr]` xoay DÒNG CHỮ, không xoay hộp: chữ chạy từ trên
 * xuống nhưng mỗi ký tự vẫn đứng thẳng. Đọc được, nhưng ngược chiều quen thuộc
 * của mắt — nên thêm `rotate-180` để dòng chạy từ dưới lên, đúng kiểu gáy sách.
 *
 * Hai lớp phải đi CÙNG NHAU. Chỉ `writing-mode` thì chữ đọc từ trên xuống và
 * nhãn cuối cùng nằm sát đáy; chỉ `rotate-180` thì cả khối chữ lộn ngược.
 *
 * `rotate-180` xoay quanh TÂM phần tử, nên nút phải có bề rộng cố định
 * (`w-11`) — để chiều rộng tự co theo chữ thì mỗi tab rộng một kiểu và sau khi
 * xoay chúng lệch nhau vài pixel theo trục ngang.
 *
 * `check:css` canh hai lớp này thật sự sinh ra CSS: Tailwind BỎ QUA lớp không
 * tồn tại mà không báo gì, và một tab dọc hỏng trông y hệt một tab thường.
 *
 * ══ VÌ SAO KHÔNG PHẢI `bg-gray-800/80` ══
 *
 * Bản mô tả yêu cầu màu tối viết cứng. Không dùng, vì dự án đã có token tự đảo
 * theo bản sáng/tối (`styles/tokens.css`): `bg-surface` là #FFFFFF ở bản sáng
 * và #1E1E27 ở bản tối. Viết `bg-gray-800/80` thì bản tối trông đúng ý còn bản
 * sáng thành thẻ xám than trên nền trắng — và `check:design` đo tương phản
 * WCAG sẽ đỏ. Token cho ra đúng cái "Premium Dark Soft UI" mong muốn, và không
 * đánh đổi bản sáng để lấy nó.
 */

/* Màu nhấn theo kỹ năng. NGOẠI LỆ có chủ ý với quy tắc 2, cùng loại với
   `STAT_GRADIENTS` và `LEVEL_COLORS`: đây là màu NHẬN DẠNG, và chữ đặt trên
   nó luôn là trắng nên tương phản không phụ thuộc sáng/tối. */
const SAC = {
  CO: "from-indigo-500 to-blue-600",
  CE: "from-emerald-500 to-teal-600",
  PE: "from-rose-500 to-pink-600",
  PO: "from-amber-500 to-orange-600",
};
/* 13/10: bóng khi rê chuột để TRUNG TÍNH. Bóng màu theo kỹ năng (cam ở phần
   Nói) loang ra quanh thẻ trắng, trông như thẻ đó bị lệch màu so với thẻ bên cạnh. */
const VIEN = {
  CO: "hover:shadow-black/10",
  CE: "hover:shadow-black/10",
  PE: "hover:shadow-black/10",
  PO: "hover:shadow-black/10",
};

function ChuCaiDau({ ten, avatar }) {
  if (avatar) {
    return <img src={avatar} alt="" className="h-6 w-6 rounded-full object-cover" />;
  }
  /* Không dùng dịch vụ ảnh đại diện ngẫu nhiên — chúng phục vụ chân dung người
     thật. Thiếu ảnh thì chữ cái đầu, đúng cách avatars.jsx đã làm từ lâu. */
  const chu = String(ten || "?").trim().split(/\s+/).slice(-1)[0]?.[0] ?? "?";
  return (
    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-[10px] font-extrabold text-primary">
      {chu.toUpperCase()}
    </span>
  );
}

/* `dau`: thẻ ĐẦU TIÊN trong lưới mang id cho tour giới thiệu.
   26/10 (theo chủ dự án: « gọn, dễ nhìn hơn »): thẻ bộ dạng hàng ngang gọn: ô màu kỹ năng
   có số thẻ bên trái, tên + mô tả một dòng + tác giả bên phải. */
function TheBo({ b, onMo, dau = false, thuTu = 0 }) {
  return (
    <button
      id={dau ? "tour-fc-deck" : undefined}
      type="button"
      onClick={() => { phat("lat"); onMo(b); }}
      style={{ animationDelay: `${60 + thuTu * 40}ms` }}
      className={`mcf-cau-vao group flex w-full items-center gap-4 rounded-2xl border-0 bg-surface p-3 text-left font-sans ring-1 ring-line
        transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.985] ${VIEN[b.kyNang] ?? ""}`}
    >
      <span className={`relative grid h-16 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${SAC[b.kyNang] ?? SAC.CO} text-white shadow-md`}>
        <span aria-hidden className="absolute inset-1.5 rotate-[-8deg] rounded-lg bg-white/20" />
        <span className="relative text-lg font-extrabold tabular-nums leading-none">{b.soThe}</span>
        <span className="absolute bottom-1.5 text-[9px] font-bold uppercase tracking-wide text-white/85">{tr("thẻ", "cartes", "cards")}</span>
        {b.traPhi && (
          <span className={`absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full shadow ${b.khoa ? "bg-amber-400 text-amber-950" : "bg-white text-ok"}`}>
            {b.khoa ? <Lock size={10} /> : <Unlock size={10} />}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-ink">{b.ten}</span>
        {b.moTa && <span className="mt-0.5 block truncate text-xs text-soft">{b.moTa}</span>}
        <span className="mt-1.5 flex items-center gap-1.5">
          <ChuCaiDau ten={b.tacGia.ten} avatar={b.tacGia.avatar} />
          <span className="truncate text-[11px] font-semibold text-soft">{b.tacGia.ten}</span>
          {b.traPhi && b.khoa && b.gia ? <span className="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">{b.gia.toLocaleString("vi-VN")}đ</span> : null}
          {!b.congKhai && <span className="ml-1 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn">{tr("nháp", "brouillon", "draft")}</span>}
        </span>
      </span>
      <span id={dau ? "tour-fc-count" : undefined} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-soft transition-colors group-hover:bg-primary group-hover:text-on-primary">
        <ChevronsRight size={16} />
      </span>
    </button>
  );
}

/* Thẻ học sinh TỰ TẠO / ghi từ bài (Sổ từ, migration 151/157). */
function TheCuaToi({ soTu, onOn, onTao, onXoa }) {
  if (soTu === undefined) return <p className="m-0 py-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>;
  if (soTu === null) return <p className="m-0 rounded-2xl bg-danger-soft p-5 text-center text-sm font-semibold text-danger">{tr("Không đọc được thẻ của bạn. Tải lại trang thử nhé.", "Chargement impossible.", "Couldn't load your cards.")}</p>;
  const hom = new Date(); const homNay = `${hom.getFullYear()}-${String(hom.getMonth() + 1).padStart(2, "0")}-${String(hom.getDate()).padStart(2, "0")}`;
  const denHan = soTu.filter((x) => String(x.due_at) <= homNay).length;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
        <div className="grid min-w-[7rem] flex-1 grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface2 px-3 py-2"><p className="m-0 text-xl font-extrabold tabular-nums text-ink">{soTu.length}</p><p className="m-0 text-[11px] font-bold text-soft">{tr("thẻ của tôi", "mes cartes", "my cards")}</p></div>
          <div className="rounded-xl bg-warn-soft px-3 py-2"><p className="m-0 text-xl font-extrabold tabular-nums text-warn">{denHan}</p><p className="m-0 text-[11px] font-bold text-soft">{tr("cần ôn hôm nay", "à réviser", "due today")}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onOn} disabled={!soTu.length}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 font-sans text-sm font-extrabold text-white shadow-md transition-transform duration-150 ease-out active:scale-[0.97] disabled:cursor-default disabled:opacity-50">
            <Layers size={16} /> {denHan ? tr(`Ôn ${denHan} thẻ`, `Réviser (${denHan})`, `Review ${denHan}`) : tr("Luyện thẻ", "S'entraîner", "Practise")}
          </button>
          <button type="button" onClick={onTao}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 font-sans text-sm font-extrabold text-white shadow-md transition-transform duration-150 ease-out active:scale-[0.97]">
            <Plus size={16} /> {tr("Tạo thẻ", "Créer", "Create")}
          </button>
        </div>
      </div>
      {!soTu.length ? (
        <div className="rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
          <Leon cam="hoc" size={84} className="mx-auto block" />
          <p className="m-0 mt-2 font-bold text-ink">{tr("Bạn chưa có thẻ nào", "Aucune carte pour l'instant", "No cards yet")}</p>
          <p className="m-0 mt-1 text-sm text-soft">{tr("Bấm « Tạo thẻ », hoặc bôi đen một từ khi làm bài rồi chọn « Ghi vào sổ từ ».", "Créez une carte, ou sélectionnez un mot pendant un exercice.", "Create a card, or select a word while doing an exercise.")}</p>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {soTu.map((x) => (
            <li key={x.id} className="group flex items-start gap-2 rounded-2xl bg-surface px-3.5 py-3 ring-1 ring-line">
              <div className="min-w-0 flex-1">
                <p lang="fr" className="m-0 break-words text-[15px] font-extrabold text-ink">{x.matTruoc}</p>
                <p className="m-0 mt-0.5 break-words text-sm text-soft">{x.matSau}</p>
                <p className={"m-0 mt-1.5 text-[11px] font-bold " + (String(x.due_at) <= homNay ? "text-warn" : "text-soft")}>
                  {String(x.due_at) <= homNay ? tr("Cần ôn hôm nay", "À réviser", "Due today") : tr(`Ôn lại ${x.due_at.split("-").reverse().slice(0, 2).join("/")}`, `Révision le ${x.due_at}`, `Next ${x.due_at}`)}
                </p>
              </div>
              <button type="button" onClick={() => onXoa(x)} title={tr("Xoá thẻ", "Supprimer", "Delete")}
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-soft hover:bg-danger-soft hover:text-danger"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ThuVienBoThe({ ds, onMo, soTu, onOnSoTu, onTaoThe, onXoaThe }) {
  const [kyNang, setKyNang] = useState("CO");
  /* Tab đang xem: nhớ trong trình duyệt (tiện ích cá nhân, mất cũng không sao). */
  const [tab, setTab] = useState(() => { try { return localStorage.getItem("mcf-fc-tab") || "co-san"; } catch { return "co-san"; } });
  const doiTab = (x) => { setTab(x); phat("tiep"); try { localStorage.setItem("mcf-fc-tab", x); } catch { /* bỏ qua */ } };
  const t = useT();

  const hien = useMemo(
    () => (Array.isArray(ds) ? ds.filter((b) => b.kyNang === kyNang) : []),
    [ds, kyNang],
  );
  const TAB = [
    ["cua-toi", tr("Thẻ của tôi", "Mes cartes", "My cards"), Array.isArray(soTu) ? soTu.length : null],
    ["co-san", tr("Bộ thẻ có sẵn", "Paquets du site", "Ready-made decks"), Array.isArray(ds) ? ds.length : null],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <TourGioiThieu khoa="hasSeenFlashcardTour" choXong="hasSeenGiaoDienTour" sanSang={tab === "co-san" && Array.isArray(hien) && hien.length > 0} steps={[
        { target: "#tour-fc-tabs", title: t("tour.fc1_title"), content: t("tour.fc1_body"), placement: "bottom" },
        { target: "#tour-fc-deck", title: t("tour.fc2_title"), content: t("tour.fc2_body") },
        { target: "#tour-fc-count", title: t("tour.fc3_title"), content: t("tour.fc3_body") },
      ]} />
      <header className="mcf-cau-vao relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 px-5 py-4 text-white shadow-[0_14px_34px_rgba(99,102,241,0.28)]">
        <span aria-hidden className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <Leon cam="hoc" size={64} className="shrink-0 drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]" />
          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-2xl font-extrabold tracking-tight">Flashcard</h1>
            <p className="m-0 text-sm text-white/85">{tr("Ôn thẻ của riêng bạn hoặc các bộ thẻ có sẵn.", "Vos cartes ou les paquets du site.", "Your own cards or ready-made decks.")}</p>
          </div>
          <NutTieng className="border-white/30 bg-white/15 text-white hover:border-white hover:text-white" />
        </div>
      </header>

      {/* Hai mục nằm ngang (26/10, theo chủ dự án). */}
      <div role="tablist" className="mt-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-surface2 p-1.5">
        {TAB.map(([ma, ten, so]) => (
          <button key={ma} type="button" role="tab" aria-selected={tab === ma} onClick={() => doiTab(ma)}
            className={"inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-3 py-2.5 font-sans text-sm font-extrabold transition-colors duration-200 "
              + (tab === ma ? "bg-surface text-ink shadow-sm" : "bg-transparent text-soft hover:text-ink")}>
            {ten}{so != null && <span className={"rounded-full px-2 py-0.5 text-[11px] " + (tab === ma ? "bg-primary-soft text-primary" : "bg-surface text-soft")}>{so}</span>}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "cua-toi" ? (
          <TheCuaToi soTu={soTu} onOn={onOnSoTu} onTao={onTaoThe} onXoa={onXoaThe} />
        ) : (
          <>
            <div id="tour-fc-tabs" className="mb-3 flex flex-wrap gap-2">
              {KY_NANG.map((k) => {
                const chon = k.ma === kyNang;
                const so = Array.isArray(ds) ? ds.filter((b) => b.kyNang === k.ma).length : null;
                return (
                  <button key={k.ma} type="button" onClick={() => { if (!chon) phat("tiep"); setKyNang(k.ma); }} aria-pressed={chon}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 px-4 py-2 font-sans text-sm font-bold transition-colors duration-200 ${
                      chon ? `bg-gradient-to-r ${SAC[k.ma] ?? SAC.CO} text-white shadow-md` : "bg-surface text-soft ring-1 ring-line hover:text-ink"}`}>
                    {k.ten}{so != null && <span className={"text-[11px] " + (chon ? "text-white/80" : "text-soft")}>{so}</span>}
                  </button>
                );
              })}
            </div>
            {ds === undefined ? (
              <p className="m-0 py-10 text-center text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
            ) : ds === null ? (
              /* KHÔNG ĐỌC ĐƯỢC ≠ CHƯA CÓ BỘ NÀO. */
              <div className="rounded-2xl bg-danger-soft p-6 text-center">
                <AlertTriangle size={20} className="mx-auto text-danger" />
                <p className="m-0 mt-2 font-bold text-ink">{tr("Không đọc được thư viện", "Impossible de charger la bibliothèque", "Couldn't load the library")}</p>
                <p className="m-0 mt-1 text-sm text-ink">{tr("Danh sách trống ở đây KHÔNG có nghĩa là chưa có bộ nào: kiểm tra kết nối rồi tải lại.", "Une liste vide ne veut pas dire qu'il n'y a aucun paquet.", "An empty list doesn't mean there are no decks.")}</p>
              </div>
            ) : hien.length === 0 ? (
              <div className="rounded-2xl bg-surface p-8 text-center ring-1 ring-line">
                <Leon cam="buon-ngu" size={84} className="mx-auto block" />
                <p className="m-0 mt-2 font-bold text-ink">{tr("Chưa có bộ thẻ nào cho kỹ năng này", "Aucun paquet pour cette compétence", "No decks for this skill yet")}</p>
              </div>
            ) : (
              <div className="grid gap-2.5 md:grid-cols-2">
                {hien.map((b, i) => <TheBo key={b.id} b={b} onMo={onMo} dau={i === 0} thuTu={i} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
