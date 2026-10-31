// Đố vui nước Pháp: kho câu, địa danh, và luật chọn đường có kẹt ở mức nào không.
import { CAU } from "../src/content/troChoi/doVui.js";
import { DIA_DANH, LOI_MUC, LOI_MINETTE } from "../src/content/troChoi/doVuiDiaDanh.js";
import { GOC, SO_DUNG, SO_LUA_CHON, CAU_CHUNG_KET, CO_CHUNG_KET, VE_DAU, P_MINETTE, moO, cauCua, diemDen, rutCau, rutChungKet, chieu, diemCau, thangTour, heSoChuoi, giaVe, luaChon, demCo, mucKhoHon, chiemDuoc, minetteDi, traThuong, diaDanh, boHai, binhChon, leonDoan, diemCuoi } from "../src/screens/student/doVui/luat.js";

let dat = 0, hong = 0;
const ca = (ten, ok, chiTiet = "") => { if (ok) dat++; else { hong++; console.log("✗", ten, chiTiet); } };
const MUC = ["de", "vua", "kho"];
const ids = new Set(DIA_DANH.map((d) => d.id));

ca("id địa danh không trùng", ids.size === DIA_DANH.length);
ca("có Paris làm gốc", ids.has(GOC));
for (const d of DIA_DANH) {
  const p = chieu(d.lon, d.lat);
  ca(`${d.id}: nằm trong khung`, p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100, JSON.stringify(p));
  ca(`${d.id}: sao 1–3`, [1, 2, 3].includes(d.sao));
  ca(`${d.id}: có loại và lời mở`, ["di_tich", "am_thuc", "thien_nhien", "lich_su", "van_hoa"].includes(d.loai) && d.mo?.length > 10);
}
for (const c of CAU) {
  ca(`địa danh tồn tại: ${c.q}`, ids.has(c.noi), c.noi);
  ca(`mức hợp lệ: ${c.q}`, MUC.includes(c.muc));
  ca(`đủ 4 phương án khác nhau: ${c.q}`, c.pa.length === 4 && new Set(c.pa).size === 4);
  ca(`có lời giải: ${c.q}`, c.gt?.length > 10);
}
ca("câu không trùng", new Set(CAU.map((c) => c.q)).size === CAU.length);
const chu = JSON.stringify([CAU, DIA_DANH, LOI_MUC, LOI_MINETTE]);
ca("nội dung không có dấu gạch dài", !chu.includes("—"));

// Tên địa danh hiện ngay trên màn hỏi, nên đáp án không được là chính nó. Mỗi nơi đủ câu cho mọi mức.
for (const c of CAU.filter((x) => x.noi !== GOC)) {
  const ten = DIA_DANH.find((d) => d.id === c.noi)?.ten ?? "?";
  ca(`${c.noi}: đáp án không trùng tên nơi: ${c.pa[0]}`, !c.pa[0].toLowerCase().includes(ten.toLowerCase()));
}
for (const d of DIA_DANH) for (const m of MUC) ca(`${d.id} (${m}): ít nhất 3 câu`, cauCua(d.id, m).length >= 3, cauCua(d.id, m).length);

// Lời mở hiện TRƯỚC khi chọn nên không được chứa đáp án đúng của chính nơi đó.
for (const d of DIA_DANH) for (const c of CAU.filter((x) => x.noi === d.id))
  ca(`${d.id}: lời mở không lộ đáp án « ${c.pa[0]} »`, c.pa[0].length < 4 || !d.mo.toLowerCase().includes(c.pa[0].toLowerCase()));

// Giả lập nhiều Tour chọn ngẫu nhiên: lúc nào cũng phải có đường đi và đủ câu chung kết.
for (const muc of MUC) {
  ca(`${muc}: đủ nơi cho một Tour`, moO(muc).length >= SO_DUNG, moO(muc).length);
  for (let v = 0; v < 500; v++) {
    const lo = [GOC]; const hoi = [];
    while (lo.length - 1 < SO_DUNG) {
      const ds = diemDen(lo.at(-1), lo, muc);
      if (!ds.length) { ca(`${muc}: kẹt đường`, false, lo.join(">")); break; }
      if (ds.length > SO_LUA_CHON || new Set(ds).size !== ds.length || ds.some((d) => lo.includes(d.id) || !cauCua(d.id, muc).length)) ca(`${muc}: lựa chọn sai`, false, lo.join(">"));
      const d = ds[Math.floor(Math.random() * ds.length)];
      const cau = rutCau(d.id, muc);
      if (!cau.length) ca(`${muc}: nơi rỗng`, false, d.id);
      hoi.push(...cau.map((c) => c.q)); lo.push(d.id);
    }
    const ck = rutChungKet(muc, hoi);
    if (ck.length !== CAU_CHUNG_KET || ck.some((c) => hoi.includes(c.q))) ca(`${muc}: chung kết thiếu hoặc lặp câu`, false, ck.length);
  }
  dat++;
}
ca("Lựa chọn đầu tiên đi về các vùng khác nhau", new Set(diemDen(GOC, [GOC], "vua").map((d) => d.vung)).size === SO_LUA_CHON);
ca("điểm nhân theo sao", diemCau(10, 1) === 150 && diemCau(10, 3) === 225);
ca("thắng khi không ít cờ hơn Minette", thangTour(6, 5) && thangTour(5, 5) && !thangTour(4, 5));
ca("chuỗi đúng tối đa ×2", heSoChuoi(1) === 1 && heSoChuoi(3) === 1.5 && heSoChuoi(9) === 2);
ca("cược và chuỗi nhân điểm", diemCau(10, 1, 3, 2) === 450);
ca("điểm tối đa còn trong giới hạn ghi_tro_choi", 13 * diemCau(30, 3, 5, 2) + diemCuoi(0, 40, true) <= 100000);
ca("chiếm: nơi trống cần 1 câu, nơi của Minette cần đúng hết", chiemDuoc(1, 2, false) && !chiemDuoc(0, 2, false) && chiemDuoc(2, 2, true) && !chiemDuoc(1, 2, true));
ca("nơi của Minette hỏi mức khó hơn", mucKhoHon("de") === "vua" && mucKhoHon("vua") === "kho" && mucKhoHon("kho") === "kho");
ca("đếm cờ theo sao", demCo({ reims: "ban", lille: "minette" }, "ban") === diaDanh("reims").sao);
ca("hết vé vẫn đi được đúng một nơi", luaChon(diemDen(GOC, [GOC], "vua"), GOC, 0).filter((d) => d.du && d.diNho && d.gia === 0).length === 1);
ca("đủ vé thì không đi nhờ", luaChon(diemDen(GOC, [GOC], "vua"), GOC, 9).every((d) => d.du && !d.diNho));
ca("đi xa tốn vé hơn", giaVe("paris", "reims") < giaVe("lille", "marseille"));
ca("chưa dùng trợ giúp thì thưởng vé", DIA_DANH.every((d) => traThuong(d, []) === "ve"));
for (const muc of MUC) for (let v = 0; v < 300; v++) {
  const b = boHai(), an = v % 2 ? b : [];
  ca("50:50 chỉ bỏ đáp án sai", b.length === 2 && !b.includes(0) && new Set(b).size === 2);
  const pt = binhChon(muc, an), ks = Object.keys(pt).map(Number);
  ca("bình chọn đủ 100%, không có đáp án đã bỏ, không âm", ks.reduce((n, k) => n + pt[k], 0) === 100 && ks.every((k) => !an.includes(k) && pt[k] >= 0), JSON.stringify(pt));
  ca("Léon không chọn đáp án đã bỏ", !an.includes(leonDoan(muc, an)));
}

/* Giả lập trọn Tour với luật thật, người chơi chọn ngẫu nhiên. Tỉ lệ thắng phải tăng theo tỉ lệ đúng. */
function tour(muc, p) {
  const lo = [GOC], mn = [GOC], so = {}; let ve = VE_DAU, diNho = 0;
  for (let k = 0; k < SO_DUNG; k++) {
    const lc = luaChon(diemDen(lo.at(-1), lo, muc), lo.at(-1), ve);
    const ds = lc.filter((d) => d.du);
    const d = ds[Math.floor(Math.random() * ds.length)];
    ve -= d.gia; diNho += d.diNho ? 1 : 0;
    const cuaM = so[d.id] === "minette", pp = cuaM ? p * 0.85 : p;
    const dung = [0, 1].filter(() => Math.random() < pp).length; ve += dung;
    if (chiemDuoc(dung, 2, cuaM)) so[d.id] = "ban";
    const mv = minetteDi(mn.at(-1), [...lo, d.id, ...mn, ...Object.keys(so)], muc);
    if (mv) mn.push(mv.id);
    if (mv?.chiem) so[mv.id] = "minette";
    lo.push(d.id);
  }
  let coB = demCo(so, "ban"), coM = demCo(so, "minette");
  for (let k = 0; k < CAU_CHUNG_KET; k++) { if (Math.random() < p) coB += CO_CHUNG_KET; if (Math.random() < P_MINETTE[muc]) coM += CO_CHUNG_KET; }
  return { thang: thangTour(coB, coM), diNho, ve };
}
for (const muc of MUC) {
  const ti = (p) => { let t = 0, n = 0; for (let v = 0; v < 3000; v++) { const r = tour(muc, p); t += r.thang ? 1 : 0; n += r.diNho; } return [t / 3000, n / 3000]; };
  const [t3] = ti(0.3), [t6, nho6] = ti(0.6), [t9] = ti(0.9);
  console.log(`  ${muc}: thắng ${Math.round(t3 * 100)}% (đúng 30%), ${Math.round(t6 * 100)}% (60%), ${Math.round(t9 * 100)}% (90%); đi nhờ ${nho6.toFixed(2)} lần/ván`);
  ca(`${muc}: giỏi hơn thì thắng nhiều hơn`, t3 < t6 && t6 < t9);
  ca(`${muc}: đúng 90% gần như luôn thắng`, t9 >= 0.85, t9);
  ca(`${muc}: đúng 30% khó thắng`, t3 <= 0.3, t3);
  ca(`${muc}: đúng 60% có thắng có thua`, t6 >= 0.4 && t6 <= 0.8, t6);
}

console.log(`check:dovui ${dat}/${dat + hong}`);
process.exit(hong ? 1 : 0);
