import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { Swords, User, Users, Search, Check, Loader2, Trophy, Handshake, Hourglass, Send, ChevronRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Avatar } from "../../shared/avatars.jsx";
import { Leon } from "../../shared/leon.jsx";
import { docDangTheoDoi } from "../../shared/xp.js";
import { ketCucDau } from "../../shared/troChoiDau.js";

/* Các mảnh giao diện PvP dùng chung cho mọi trò chơi nhanh (15/11, migration 214). */

export const tenMuc = (m) => ({ de: tr("Dễ", "Facile", "Easy"), vua: tr("Vừa", "Moyen", "Medium"), kho: tr("Khó", "Difficile", "Hard") }[m] ?? m);
const tenNguoi = (d) => d?.doi_phuong?.name || tr("Một bạn học", "Un camarade", "A classmate");

/* Màn chuẩn bị ván chơi (16/11, chủ dự án: « làm lại cho đẹp, đồng nhất với website, thêm animation »).
   MỘT màu nhấn duy nhất là dải màu của chính trò đó (`nen`): ô đang chọn được một vệt màu TRƯỢT tới
   (layoutId, cùng kiểu với thanh tab Luyện thi), ô không chọn là thẻ nền trắng như phần còn lại
   của website. Mọi chuyển động theo MotionConfig reducedMotion="user". */
const LO_XO = { type: "spring", stiffness: 420, damping: 32 };
const NAY = { type: "spring", stiffness: 500, damping: 14 };
const boDau = (x) => String(x ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

/* Lưới chọn bạn: xuống dòng (không cuộn ngang), có ô tìm khi nhiều bạn, khung cuộn dọc. */
function LuoiBan({ ds, ban, setBan, nen }) {
  const [tim, setTim] = useState("");
  const khoa = boDau(tim.trim());
  const loc = khoa ? ds.filter((b) => boDau(b.name).includes(khoa) || boDau(b.username).includes(khoa)) : ds;
  return (
    <div>
      {ds.length > 8 && (
        <label className="mb-2 flex items-center gap-2 rounded-2xl border border-solid border-line bg-surface2 px-3 py-2 transition-colors focus-within:border-primary">
          <Search size={15} className="shrink-0 text-soft" />
          <input type="search" value={tim} onChange={(e) => setTim(e.target.value)} placeholder={tr("Tìm theo tên", "Chercher un nom", "Search by name")}
            aria-label={tr("Tìm bạn theo tên", "Chercher un ami par son nom", "Search a friend by name")}
            className="min-w-0 flex-1 border-0 bg-transparent font-sans text-sm text-ink outline-none placeholder:text-soft" />
        </label>
      )}
      {!loc.length ? <p className="m-0 px-1 py-2 text-sm text-soft">{tr("Không có bạn nào khớp tên này.", "Aucun ami ne correspond.", "No friend matches this name.")}</p> : (
        <div className="grid max-h-[15rem] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
          {loc.map((b, i) => {
            const dang = ban?.id === b.id;
            return (
              <motion.button key={b.id} type="button" onClick={() => { phat("bam"); setBan(b); }} aria-pressed={dang} title={b.name}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...LO_XO, delay: Math.min(i, 12) * 0.03 }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
                className={`relative flex min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl border border-solid px-2.5 py-2 text-left font-sans transition-colors duration-200 ${dang ? "border-transparent text-white shadow-md" : "border-line bg-surface text-ink hover:border-primary/40"}`}>
                {dang && <motion.span layoutId="ban-chon" transition={LO_XO} aria-hidden className={`absolute inset-0 bg-gradient-to-br ${nen}`} />}
                <span className={`relative flex shrink-0 rounded-full ${dang ? "ring-2 ring-white" : ""}`}>
                  <Avatar khoa={b.avatar || ""} ten={b.name} size={38} dungYen />
                  {dang && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={NAY} className="absolute -bottom-1 -right-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-white text-[#111]"><Check size={11} strokeWidth={3.5} /></motion.span>}
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{b.name}</span>
                  {b.username && <span className={`block truncate text-xs ${dang ? "text-white/85" : "text-soft"}`}>@{b.username}</span>}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Dải « Bạn ⚔ đối thủ »: thấy ngay mình sắp thách ai; hai thanh kiếm bật lại mỗi lần đổi người. */
function DaiDoiDau({ ban, nen }) {
  return (
    <div className={`relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 overflow-hidden bg-gradient-to-br ${nen} px-4 py-4 text-white`}>
      <span aria-hidden className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-14 -right-8 h-36 w-36 rounded-full bg-white/10" />
      <span className="relative flex min-w-0 items-center justify-end gap-2.5">
        <span className="truncate text-sm font-extrabold">{tr("Bạn", "Vous", "You")}</span>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/25 ring-2 ring-white/70"><User size={20} /></span>
      </span>
      {/* Key PHẢI khác key của khối tên bên phải: hai anh em trùng key thì React để sót nút cũ,
          mỗi lần đổi người lại thừa ra một biểu tượng kiếm (lỗi 16/11). */}
      <motion.span key={`kiem-${ban?.id ?? "chua"}`} initial={{ scale: 0.4, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={NAY}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#111] shadow-lg"><Swords size={18} /></motion.span>
      {ban ? (
        <motion.span key={`ban-${ban.id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={LO_XO} className="relative flex min-w-0 items-center gap-2.5">
          {/* `flex`, không để span nội dòng: Avatar là inline-grid nên span nội dòng cao hơn ảnh vài px
              (chỗ cho chân chữ), vòng viền thành hình bầu lệch xuống (lỗi 17/11). */}
          <span className="flex shrink-0 rounded-full ring-2 ring-white"><Avatar khoa={ban.avatar || ""} ten={ban.name} size={44} dungYen /></span>
          <span className="truncate text-sm font-extrabold">{ban.name}</span>
        </motion.span>
      ) : (
        <span key="chua-chon" className="relative flex min-w-0 items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-dashed border-white/70 text-lg font-extrabold">?</span>
          <span className="text-sm font-bold text-white/90">{tr("Chọn một người bạn", "Choisissez un ami", "Pick a friend")}</span>
        </span>
      )}
    </div>
  );
}

/* Chọn chế độ: một mình | thách bạn. Khi thách bạn thì hiện dải đối đầu và lưới bạn bè (người mình
   theo dõi). `banMau`: danh sách bạn giả, CHỈ /preview.html truyền vào. */
export function ChonCheDo({ cheDo, setCheDo, ban, setBan, nen, banMau }) {
  const [ds, setDs] = useState(banMau);
  useEffect(() => { if (cheDo === "dau" && ds === undefined) docDangTheoDoi().then((x) => setDs(x)); }, [cheDo, ds]);
  const CHE_DO = [
    ["mot", User, tr("Chơi một mình", "En solo", "Solo"), tr("Phá kỷ lục của chính bạn", "Battez votre record", "Beat your own record")],
    ["dau", Swords, tr("Thách bạn bè", "Défier un ami", "Challenge a friend"), tr("Bạn chơi trước, bạn bè chơi đúng đề đó", "Vous jouez, votre ami rejoue la même partie", "You play, your friend replays the same round")],
  ];
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto mb-7 max-w-2xl text-left">
        <div role="tablist" aria-label={tr("Chế độ chơi", "Mode de jeu", "Play mode")} className="grid grid-cols-1 gap-1 rounded-3xl border border-solid border-line bg-surface p-1.5 shadow-sm sm:grid-cols-2">
          {CHE_DO.map(([ma, Icon, ten, mo]) => {
            const dang = cheDo === ma;
            return (
              <motion.button key={ma} type="button" role="tab" aria-selected={dang} onClick={() => { if (!dang) phat("bam"); setCheDo(ma); }} whileTap={{ scale: 0.97 }}
                className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-0 bg-transparent p-3 text-left font-sans transition-colors ${dang ? "text-white" : "text-ink hover:bg-surface2"}`}>
                {dang && (
                  <motion.span layoutId="che-do-chon" transition={LO_XO} aria-hidden className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${nen} shadow-md`}>
                    <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
                  </motion.span>
                )}
                <motion.span key={dang ? "chon" : "khong"} initial={dang ? { scale: 0.6, rotate: -15 } : false} animate={{ scale: 1, rotate: 0 }} transition={NAY}
                  className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ${dang ? "bg-white/25" : "bg-surface2 text-soft"}`}><Icon size={20} /></motion.span>
                <span className="relative min-w-0">
                  <span className="block text-[15px] font-extrabold leading-tight">{ten}</span>
                  <span className={`mt-0.5 block text-xs font-medium ${dang ? "text-white/90" : "text-soft"}`}>{mo}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
        {cheDo === "dau" && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={LO_XO}
            className="mt-3 overflow-hidden rounded-3xl border border-solid border-line bg-surface shadow-sm">
            <DaiDoiDau ban={ban} nen={nen} />
            <div className="p-3">
              <p className="m-0 mb-2 flex items-center gap-1.5 px-1 text-xs font-extrabold uppercase tracking-wide text-soft"><Users size={13} /> {tr("Thách ai?", "Qui défier ?", "Who to challenge?")}</p>
              {ds === undefined ? <p className="m-0 flex items-center gap-2 px-1 py-2 text-sm text-soft"><Loader2 size={14} className="mcf-spin" /> {tr("Đang tải bạn bè…", "Chargement…", "Loading friends…")}</p>
                : ds === null ? <p className="m-0 px-1 py-2 text-sm text-danger">{tr("Không tải được danh sách bạn bè.", "Impossible de charger vos amis.", "Couldn't load your friends.")}</p>
                : !ds.length ? (
                  <div className="flex items-center gap-3 px-1 py-1">
                    <Leon cam="hum" size={48} />
                    <p className="m-0 text-sm text-soft">{tr("Bạn chưa theo dõi ai. Tìm bạn ở ", "Vous ne suivez personne. Trouvez des amis sur ", "You don't follow anyone yet. Find friends on ")}<Link to="/etudiant/dashboard" className="font-bold text-primary">{tr("trang chủ", "l'accueil", "the home page")}</Link>.</p>
                  </div>
                ) : <LuoiBan ds={ds} ban={ban} setBan={setBan} nen={nen} />}
            </div>
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}

/* Chọn cách chơi (trò có nhiều lối chơi): thẻ trắng, vệt màu trượt tới ô đang chọn. */
export function ChonKieu({ ds, kieu, setKieu, nen }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto mb-7 mt-3 grid max-w-2xl gap-2 sm:grid-cols-3">
        {ds.map((k, j) => {
          const chon = kieu === k.ma;
          return (
            <motion.button key={k.ma} type="button" onClick={() => { if (!chon) phat("bam"); setKieu(k.ma); }} aria-pressed={chon}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...LO_XO, delay: j * 0.05 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              className={`relative cursor-pointer overflow-hidden rounded-2xl border border-solid px-3.5 py-3 text-left font-sans transition-colors ${chon ? "border-transparent text-white shadow-lg" : "border-line bg-surface text-ink shadow-sm"}`}>
              {chon && <motion.span layoutId="kieu-chon" transition={LO_XO} aria-hidden className={`absolute inset-0 bg-gradient-to-br ${nen}`} />}
              <span className="relative block text-sm font-extrabold">{k.ten}</span>
              <span className={`relative mt-0.5 block text-xs ${chon ? "text-white/90" : "text-soft"}`}>{k.mo}</span>
            </motion.button>
          );
        })}
      </div>
    </MotionConfig>
  );
}

/* Chọn mức độ: ba thẻ trắng có Léon, vạch cường độ theo màu ngữ nghĩa (xanh, vàng, đỏ); thẻ đang
   chọn nhận vệt màu của trò trượt tới, Léon nảy lên. */
const MUC = () => [
  ["de", tr("Dễ", "Facile", "Easy"), "A1–A2", tr("Từ quen, nhiều thời gian", "Mots courants, plus de temps", "Common words, more time"), "mim-cuoi", "bg-ok"],
  ["vua", tr("Vừa", "Moyen", "Medium"), "A2–B1", tr("Nhịp chuẩn, có bẫy nhẹ", "Rythme normal, quelques pièges", "Normal pace, light traps"), "nhay-mat", "bg-warn"],
  ["kho", tr("Khó", "Difficile", "Hard"), "B1–B2", tr("Nhanh hơn, từ khó, ít gợi ý", "Plus rapide, moins d'aide", "Faster, harder, fewer hints"), "quyet-tam", "bg-danger"],
];
export function ChonMuc({ muc, setMuc, nen }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto mt-3 grid max-w-2xl gap-3 sm:grid-cols-3">
        {MUC().map(([m, ten, cap, mo, cam, mau], j) => {
          const chon = muc === m;
          return (
            <motion.button key={m} type="button" onClick={() => { if (!chon) phat("bam"); setMuc(m); }} aria-pressed={chon}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...LO_XO, delay: j * 0.06 }} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
              className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-3xl border border-solid p-3 text-left font-sans transition-[color,border-color,box-shadow] duration-200 sm:flex-col sm:items-center sm:px-4 sm:pb-5 sm:pt-6 sm:text-center ${chon ? "border-transparent text-white shadow-xl" : "border-line bg-surface text-ink shadow-sm hover:border-primary/40"}`}>
              {chon && (
                <motion.span layoutId="muc-chon" transition={LO_XO} aria-hidden className={`absolute inset-0 bg-gradient-to-br ${nen}`}>
                  <span className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15" />
                  <span className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10" />
                </motion.span>
              )}
              {chon && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={NAY} className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-white text-[#111]"><Check size={14} strokeWidth={3.5} /></motion.span>}
              <motion.span animate={chon ? { scale: [1, 1.22, 1], rotate: [0, -10, 0] } : { scale: 1, rotate: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
                className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full ${chon ? "bg-white/25" : "bg-surface2"}`}><Leon cam={cam} size={52} /></motion.span>
              <span className="relative min-w-0 flex-1 sm:flex-none">
                <span className="flex items-center gap-2 sm:justify-center">
                  <span className="text-lg font-extrabold">{ten}</span>
                  <span aria-hidden className="flex items-end gap-0.5">{[0, 1, 2].map((k) => <span key={k} className={`w-1.5 rounded-sm ${["h-2", "h-3", "h-4"][k]} ${k <= j ? (chon ? "bg-white" : mau) : (chon ? "bg-white/30" : "bg-surface2")}`} />)}</span>
                </span>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${chon ? "bg-white/20" : "bg-surface2 text-soft"}`}>{cap}</span>
                <span className={`mt-1.5 block text-xs leading-snug ${chon ? "text-white/90" : "text-soft"}`}>{mo}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </MotionConfig>
  );
}

/* Thẻ lời thách đang nhận: ai thách, mức, cách chơi, điểm cần vượt. */
export function TheLoiThach({ d, tenKieu, nen }) {
  return (
    <div className={`relative mx-auto mb-6 max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br ${nen} p-5 text-left text-white shadow-lg`}>
      <Swords aria-hidden size={120} strokeWidth={1.2} className="absolute -bottom-6 -right-4 text-white/15" />
      <div className="relative flex items-center gap-3">
        <Avatar khoa={d.doi_phuong?.avatar || ""} ten={tenNguoi(d)} size={52} dungYen />
        <div className="min-w-0">
          <p className="m-0 text-sm text-white/90">{tr("Lời thách từ", "Défi de", "Challenge from")}</p>
          <p className="m-0 truncate text-lg font-extrabold">{tenNguoi(d)}</p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-white/20 px-3 py-1">{tr("Mức", "Niveau", "Level")}: {tenMuc(d.muc)}</span>
        {tenKieu && <span className="rounded-full bg-white/20 px-3 py-1">{tenKieu}</span>}
      </div>
      <p className="relative m-0 mt-4 text-sm text-white/90">{tr("Điểm cần vượt", "Score à battre", "Score to beat")}</p>
      <p className="relative m-0 text-4xl font-extrabold tabular-nums">{d.diem_moi}</p>
      <p className="relative m-0 mt-2 text-xs text-white/85">{tr("Bạn chơi đúng ván đó (cùng thứ tự câu) và chỉ nộp được một lần.", "Même partie, mêmes questions : un seul envoi.", "Same round, same questions: one submission only.")}</p>
    </div>
  );
}

/* Khối kết quả đấu dưới điểm số. `dang` = "gui" | "nop", `kq` = trả về của RPC. */
export function KetQuaDau({ dang, kq, ban, diemToi, dungToi, d }) {
  if (!kq) return <p className="m-0 mt-4 flex items-center justify-center gap-1.5 text-sm text-soft"><Loader2 size={14} className="mcf-spin" /> {dang === "gui" ? tr("Đang gửi lời thách…", "Envoi du défi…", "Sending the challenge…") : tr("Đang nộp điểm…", "Envoi du score…", "Submitting score…")}</p>;
  if (kq.loi) return <p className="m-0 mt-4 text-sm font-bold text-danger">{kq.chu}</p>;
  if (dang === "gui") return (
    <div className="mcf-cau-vao mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl bg-primary-soft p-4 text-left">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"><Send size={18} /></span>
      <p className="m-0 text-sm text-ink">{tr(`Đã gửi lời thách tới ${ban?.name}. Khi họ chơi xong, kết quả hiện ở mục Đấu trường của sảnh trò chơi.`, `Défi envoyé à ${ban?.name}. Le résultat apparaîtra dans l'arène.`, `Challenge sent to ${ban?.name}. The result will show in the arena.`)}</p>
    </div>
  );
  const ho = kq.diem_moi, hoDung = kq.dung_moi;
  const ket = diemToi !== ho ? (diemToi > ho ? "thang" : "thua") : dungToi !== hoDung ? (dungToi > hoDung ? "thang" : "thua") : "hoa";
  const nhan = { thang: tr("Bạn thắng!", "Victoire !", "You win!"), thua: tr("Bạn thua", "Défaite", "You lose"), hoa: tr("Hoà", "Match nul", "Draw") }[ket];
  const mau = { thang: "bg-ok-soft text-ok", thua: "bg-danger-soft text-danger", hoa: "bg-surface2 text-soft" }[ket];
  return (
    <div className="mcf-cau-vao mx-auto mt-5 max-w-md">
      <p className={`m-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-extrabold ${mau}`}>{ket === "thang" ? <Trophy size={15} /> : ket === "hoa" ? <Handshake size={15} /> : <Swords size={15} />}{nhan}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-surface2 p-3"><p className="m-0 text-xs font-bold text-soft">{tr("Bạn", "Vous", "You")}</p><p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{diemToi}</p></div>
        <div className="rounded-2xl bg-surface2 p-3"><p className="m-0 truncate text-xs font-bold text-soft">{tenNguoi(d)}</p><p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{ho}</p></div>
      </div>
    </div>
  );
}

/* Đấu trường ở sảnh: lời thách đến lượt mình, lời thách đang chờ, kết quả gần đây. */
export function DauTruong({ ds, troChoi }) {
  if (ds === undefined) return <div className="mt-4 grid place-items-center rounded-3xl bg-surface p-6 text-soft"><Loader2 size={18} className="mcf-spin" /></div>;
  if (ds === null) return <p className="m-0 mt-4 rounded-2xl bg-surface p-4 text-sm text-danger">{tr("Không tải được các trận đấu.", "Impossible de charger les duels.", "Couldn't load duels.")}</p>;
  const tc = (ma) => troChoi.find((x) => x.ma === ma);
  const denLuot = ds.filter((d) => !d.toi_moi && !d.xong);
  const cho = ds.filter((d) => d.toi_moi && !d.xong);
  const xong = ds.filter((d) => d.xong).slice(0, 6);
  if (!ds.length) return (
    <div className="mt-4 flex items-center gap-4 rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <Leon cam="gian" size={72} className="shrink-0" />
      <div>
        <p className="m-0 font-extrabold text-ink">{tr("Chưa có trận nào", "Aucun duel pour l'instant", "No duels yet")}</p>
        <p className="m-0 mt-1 text-sm text-soft">{tr("Mở một trò bên dưới, chọn « Thách bạn bè »: bạn chơi trước, bạn bè nhận thông báo và chơi đúng ván đó.", "Ouvrez un jeu, choisissez « Défier un ami » : vous jouez, votre ami rejoue la même partie.", "Open a game, pick “Challenge a friend”: you play first, your friend replays the same round.")}</p>
      </div>
    </div>
  );
  const Dong = ({ d, chu, nut, den }) => {
    const g = tc(d.tro_choi);
    if (!g) return null;
    return (
      <Link to={den} className="group flex min-w-0 items-center gap-3 rounded-2xl bg-surface p-3 no-underline shadow-sm transition-transform hover:-translate-y-0.5">
        <span className="relative shrink-0">
          <Avatar khoa={d.doi_phuong?.avatar || ""} ten={tenNguoi(d)} size={44} dungYen />
          <span className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br ${g.nen} text-white ring-2 ring-surface`}><g.Icon size={12} /></span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-extrabold text-ink">{tenNguoi(d)}</span>
          <span className="block truncate text-xs font-bold text-soft">{g.ten}</span>
          <span className="block truncate text-xs text-soft">{chu}</span>
        </span>
        {nut}
      </Link>
    );
  };
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {denLuot.length > 0 && (
        <div className="md:col-span-2">
          <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink"><Swords size={15} className="text-primary" /> {tr("Đến lượt bạn", "À vous de jouer", "Your turn")}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {denLuot.map((d) => <Dong key={d.id} d={d} den={`/etudiant/tro-choi/${d.tro_choi}?dau=${d.id}`}
              chu={<>{tenMuc(d.muc)} · {tr("cần vượt", "à battre", "to beat")} <b className="tabular-nums text-ink">{d.diem_moi}</b></>}
              nut={<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-on-primary">{tr("Nhận lời", "Relever", "Accept")} <ChevronRight size={14} /></span>} />)}
          </div>
        </div>
      )}
      {cho.length > 0 && (
        <div>
          <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink"><Hourglass size={15} className="text-warn" /> {tr("Đang chờ bạn bè", "En attente", "Waiting for friends")}</p>
          <div className="grid gap-2">
            {cho.map((d) => <Dong key={d.id} d={d} den={`/etudiant/tro-choi/${d.tro_choi}`}
              chu={<>{tenMuc(d.muc)} · {tr("điểm của bạn", "votre score", "your score")} <b className="tabular-nums text-ink">{d.diem_moi}</b></>}
              nut={<span className="shrink-0 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-bold text-warn">{tr("Chờ", "En attente", "Waiting")}</span>} />)}
          </div>
        </div>
      )}
      {xong.length > 0 && (
        <div>
          <p className="m-0 mb-2 flex items-center gap-1.5 text-sm font-extrabold text-ink"><Trophy size={15} className="text-ok" /> {tr("Kết quả gần đây", "Résultats récents", "Recent results")}</p>
          <div className="grid gap-2">
            {xong.map((d) => {
              const k = ketCucDau(d);
              const toi = d.toi_moi ? d.diem_moi : d.diem_doi, ho = d.toi_moi ? d.diem_doi : d.diem_moi;
              const pill = { thang: ["bg-ok-soft text-ok", tr("Thắng", "Gagné", "Won")], thua: ["bg-danger-soft text-danger", tr("Thua", "Perdu", "Lost")], hoa: ["bg-surface2 text-soft", tr("Hoà", "Nul", "Draw")] }[k] ?? ["bg-surface2 text-soft", "–"];
              return <Dong key={d.id} d={d} den={`/etudiant/tro-choi/${d.tro_choi}`}
                chu={<><b className="tabular-nums text-ink">{toi}</b> – <span className="tabular-nums">{ho}</span></>}
                nut={<span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${pill[0]}`}>{pill[1]}</span>} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
