// Đố vui nước Pháp: kho câu, địa danh, và luật chọn đường có kẹt ở mức nào không.
import { CAU } from "../src/content/troChoi/doVui.js";
import { DIA_DANH, LOI_MUC } from "../src/content/troChoi/doVuiDiaDanh.js";
import { GOC, SO_DUNG, SO_LUA_CHON, CAU_CHUNG_KET, moO, cauCua, diemDen, rutCau, rutChungKet, chieu, diemCau, thangTour } from "../src/screens/student/doVui/luat.js";

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
const chu = JSON.stringify([CAU, DIA_DANH, LOI_MUC]);
ca("nội dung không có dấu gạch dài", !chu.includes("—"));

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
ca("ngưỡng thắng 60%", thangTour(6, 10) && !thangTour(5, 10) && !thangTour(0, 0));

console.log(`check:dovui ${dat}/${dat + hong}`);
process.exit(hong ? 1 : 0);
