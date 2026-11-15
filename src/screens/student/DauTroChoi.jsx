import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swords, User, Users, Check, Loader2, Trophy, Handshake, Hourglass, Send, ChevronRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Avatar } from "../../shared/avatars.jsx";
import { Leon } from "../../shared/leon.jsx";
import { docDangTheoDoi } from "../../shared/xp.js";
import { ketCucDau } from "../../shared/troChoiDau.js";

/* Các mảnh giao diện PvP dùng chung cho mọi trò chơi nhanh (15/11, migration 214). */

export const tenMuc = (m) => ({ de: tr("Dễ", "Facile", "Easy"), vua: tr("Vừa", "Moyen", "Medium"), kho: tr("Khó", "Difficile", "Hard") }[m] ?? m);
const tenNguoi = (d) => d?.doi_phuong?.name || tr("Một bạn học", "Un camarade", "A classmate");

/* Chọn chế độ: một mình | thách bạn. Khi thách bạn thì hiện dải bạn bè (người mình theo dõi). */
export function ChonCheDo({ cheDo, setCheDo, ban, setBan, nen }) {
  const [ds, setDs] = useState(undefined);
  useEffect(() => { if (cheDo === "dau" && ds === undefined) docDangTheoDoi().then((x) => setDs(x)); }, [cheDo, ds]);
  const Nut = ({ ma, Icon, ten, mo }) => {
    const dang = cheDo === ma;
    return (
      <button type="button" onClick={() => { phat("bam"); setCheDo(ma); }} aria-pressed={dang}
        className={`flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border-0 p-3 text-left font-sans transition-all duration-200 ${dang ? `bg-gradient-to-br ${nen} -translate-y-0.5 text-white shadow-lg` : "bg-surface text-ink shadow-sm hover:-translate-y-0.5"}`}>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${dang ? "bg-white/25" : "bg-surface2 text-soft"}`}><Icon size={19} /></span>
        <span className="min-w-0">
          <span className="block text-sm font-extrabold">{ten}</span>
          <span className={`block text-xs ${dang ? "text-white/90" : "text-soft"}`}>{mo}</span>
        </span>
      </button>
    );
  };
  return (
    <div className="mx-auto mb-6 max-w-2xl text-left">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Nut ma="mot" Icon={User} ten={tr("Chơi một mình", "En solo", "Solo")} mo={tr("Phá kỷ lục của chính bạn", "Battez votre record", "Beat your own record")} />
        <Nut ma="dau" Icon={Swords} ten={tr("Thách bạn bè", "Défier un ami", "Challenge a friend")} mo={tr("Bạn chơi trước, bạn bè chơi đúng đề đó", "Vous jouez, votre ami rejoue la même partie", "You play, your friend replays the same round")} />
      </div>
      {cheDo === "dau" && (
        <div className="mcf-cau-vao mt-3 rounded-2xl bg-surface p-3 shadow-sm">
          <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-bold text-soft"><Users size={13} /> {tr("Thách ai?", "Qui défier ?", "Who to challenge?")}</p>
          {ds === undefined ? <p className="m-0 flex items-center gap-2 text-sm text-soft"><Loader2 size={14} className="mcf-spin" /> {tr("Đang tải bạn bè…", "Chargement…", "Loading friends…")}</p>
            : ds === null ? <p className="m-0 text-sm text-danger">{tr("Không tải được danh sách bạn bè.", "Impossible de charger vos amis.", "Couldn't load your friends.")}</p>
            : !ds.length ? (
              <div className="flex items-center gap-3">
                <Leon cam="hum" size={48} />
                <p className="m-0 text-sm text-soft">{tr("Bạn chưa theo dõi ai. Tìm bạn ở ", "Vous ne suivez personne. Trouvez des amis sur ", "You don't follow anyone yet. Find friends on ")}<Link to="/etudiant/dashboard" className="font-bold text-primary">{tr("trang chủ", "l'accueil", "the home page")}</Link>.</p>
              </div>
            ) : (
              <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto px-1 pb-1 pt-1.5">
                {ds.map((b) => {
                  const dang = ban?.id === b.id;
                  return (
                    <button key={b.id} type="button" onClick={() => { phat("bam"); setBan(b); }} aria-pressed={dang} title={b.name}
                      className={`relative flex w-20 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-solid px-1.5 py-2.5 font-sans transition-all duration-200 ${dang ? "-translate-y-0.5 border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/40"}`}>
                      {dang && <span className="mcf-nay absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-white"><Check size={12} strokeWidth={3} /></span>}
                      <Avatar khoa={b.avatar || ""} ten={b.name} size={40} dungYen />
                      <span className="w-full truncate text-center text-xs font-bold text-ink">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      )}
    </div>
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
