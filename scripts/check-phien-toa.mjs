// Phiên toà: dữ liệu vụ án, điều luật, và luật chấm ba nhát.
import { LUAT, VU_TOA } from "../src/content/troChoi/phienToa.js";
import { UY_TIN_DAU, SO_BOI_THAM, SO_NHAT, tachDong, viTriLoi, dongDaSua, chamDung, tongNhat, chonTuDe, chonLuat, chonSua, khopSua, giayDoc, phieuThuan, thangToa, diemCuoi } from "../src/screens/student/phienToa/luat.js";

let dat = 0, hong = 0;
const ca = (ten, ok, chiTiet = "") => { if (ok) dat++; else { hong++; console.log("✗", ten, chiTiet); } };

ca("số điều luật không trùng", new Set(Object.values(LUAT).map((l) => l.so)).size === Object.keys(LUAT).length);
for (const [ma, l] of Object.entries(LUAT)) ca(`${ma}: có tên và giải thích`, l.ten?.length > 3 && l.mo?.length > 15);
ca("nội dung không có dấu gạch dài", !JSON.stringify([LUAT, VU_TOA]).includes("—"));

for (const vu of VU_TOA) {
  ca(`${vu.id}: đủ lời mở và kết`, vu.mo?.length > 20 && vu.thang?.length > 20 && vu.thua?.length > 20 && !!vu.bi_cao);
  ca(`${vu.id}: có ít nhất 2 nhân chứng`, vu.nhanChung.length >= 2);
  for (const nc of vu.nhanChung) {
    ca(`${nc.ten}: có giới thiệu và màu`, nc.gioiThieu?.length > 10 && /^#/.test(nc.mau));
    ca(`${nc.ten}: có dòng lỗi lẫn dòng đúng`, nc.dong.some((d) => d.loi) && nc.dong.some((d) => !d.loi));
    for (const d of nc.dong) {
      ca(`có bản dịch: ${d.van}`, d.dich?.length > 5);
      if (!d.loi) continue;
      const l = d.loi;
      ca(`từ sai xuất hiện đúng một lần: ${d.van}`, tachDong(d.van).filter((t) => t.goc === l.tu).length === 1);
      ca(`sửa xong khác câu gốc và chứa dạng đúng: ${d.van}`, dongDaSua(d) !== d.van && dongDaSua(d).includes(l.dung));
      ca(`phương án sửa khác nhau: ${d.van}`, new Set([l.dung, ...l.sai, l.tu]).size >= 3 && l.sai.length === 2 && !l.sai.includes(l.dung));
      ca(`điều luật tồn tại: ${d.van}`, !!LUAT[l.luat]);
      ca(`có lời giải: ${d.van}`, l.gt?.length > 15);
      ca(`chạm đúng từ được chấm đúng: ${d.van}`, chamDung(d, viTriLoi(d)) && !chamDung(d, viTriLoi(d) === 0 ? 1 : 0));
      for (let v = 0; v < 50; v++) {
        ca(`mức Dễ có từ sai trong 3 từ: ${d.van}`, (() => { const r = chonTuDe(d); return r.length === 3 && r.some((t) => t.k === viTriLoi(d)) && new Set(r.map((t) => t.k)).size === 3; })());
        const lc = chonLuat(l.luat);
        ca("3 điều luật khác nhau, có điều đúng", lc.length === 3 && new Set(lc).size === 3 && lc.includes(l.luat));
        const s = chonSua(l);
        ca("3 phương án sửa, có dạng đúng", s.length === 3 && s.includes(l.dung));
      }
    }
    for (const d of nc.dong.filter((x) => !x.loi)) ca(`dòng đúng không chấm được: ${d.van}`, tachDong(d.van).every((_, k) => !chamDung(d, k)) && chonTuDe(d).length === 3);
  }
  const tong = tongNhat(vu);
  ca(`${vu.id}: đủ nhát chia hết cho ${SO_NHAT}`, tong > 0 && tong % SO_NHAT === 0);
  ca("đúng hết, uy tín đầy thì đủ 7 phiếu", phieuThuan(tong, tong, UY_TIN_DAU) === SO_BOI_THAM && thangToa(SO_BOI_THAM));
  ca("sai hết thì thua", !thangToa(phieuThuan(0, tong, 1)));
  ca("chỉ chạm đúng từ mà sai luật, sai sửa, mất nhiều uy tín thì thua", !thangToa(phieuThuan(tong / 3, tong, 1)));
  ca("đúng 2/3 nhát, còn 3 uy tín thì thắng", thangToa(phieuThuan(Math.round(tong * 2 / 3), tong, 3)));
}
ca("sửa: bỏ khoảng trắng và hoa thường, giữ dấu", khopSua(" Allée ", "allée") && !khopSua("allee", "allée"));
ca("giờ đọc có sàn và tăng theo độ dài", giayDoc("a b") === 5 && giayDoc(Array(20).fill("x").join(" ")) === 18);
ca("điểm cuối cộng uy tín và thưởng thắng", diemCuoi(900, 2, true) === 1300 && diemCuoi(900, 2, false) === 1000);

console.log(`check:phientoa ${dat}/${dat + hong}`);
process.exit(hong ? 1 : 0);
