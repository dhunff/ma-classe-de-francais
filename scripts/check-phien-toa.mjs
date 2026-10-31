// Phiên toà: dữ liệu vụ án, điều luật, và luật chấm ba nhát.
import { LUAT, CHUONG, VU_TOA, BOI_THAM } from "../src/content/troChoi/phienToa.js";
import { UY_TIN_DAU, SO_BOI_THAM, SO_NHAT, SO_HOI, dongHien, luatTheoMuc, chuongCo, trinhDung, tachDong, viTriLoi, dongDaSua, chamDung, tongNhat, chonTuDe, chonLuat, chonSua, khopSua, giayDoc, thangToa, diemCuoi, BANG_TAC_DONG, taoBoiTham, apSuKien, demPhieu, laLoiHop, dapCorbeau, giayCorbeau } from "../src/screens/student/phienToa/luat.js";

let dat = 0, hong = 0;
const ca = (ten, ok, chiTiet = "") => { if (ok) dat++; else { hong++; console.log("✗", ten, chiTiet); } };

ca("số điều luật không trùng", new Set(Object.values(LUAT).map((l) => l.so)).size === Object.keys(LUAT).length);
for (const [ma, l] of Object.entries(LUAT)) {
  ca(`${ma}: đủ tên, giải thích, ví dụ`, l.ten?.length > 3 && l.mo?.length > 15 && l.vd?.length > 5);
  ca(`${ma}: chương và trình độ hợp lệ`, !!CHUONG[l.chuong] && ["A1", "A2", "B1", "B2"].includes(l.cap));
}
ca("Bộ luật khoảng 30 điều, số liền nhau", Object.keys(LUAT).length === 30 && Object.values(LUAT).map((l) => l.so).sort((a, b) => a - b).every((s, k) => s === k + 1));
ca("mọi chương đều có điều luật", chuongCo(Object.keys(LUAT)).length === Object.keys(CHUONG).length);
ca("Bộ luật lớn dần theo mức", luatTheoMuc("de").length < luatTheoMuc("vua").length && luatTheoMuc("vua").length < luatTheoMuc("kho").length && luatTheoMuc("kho").length === 30);
ca("nội dung không có dấu gạch dài", !JSON.stringify([LUAT, CHUONG, VU_TOA, BOI_THAM]).includes("—"));
ca("đủ 7 bồi thẩm, mã không trùng", BOI_THAM.length === SO_BOI_THAM && new Set(BOI_THAM.map((b) => b.ma)).size === SO_BOI_THAM);
for (const b of BOI_THAM) { ca(`${b.ma}: đủ tên, sở thích, hình`, b.ten?.length > 2 && b.thich?.length > 8 && /^M/.test(b.toc) && /^#/.test(b.mau)); ca(`${b.ma}: có sự kiện tác động riêng`, Object.values(BANG_TAC_DONG).some((t) => (t[b.ma] ?? 0) !== 0)); }
for (const [su, t] of Object.entries(BANG_TAC_DONG)) ca(`${su}: chỉ tác động lên bồi thẩm có thật`, Object.keys(t).every((k) => k === "ca" || BOI_THAM.some((b) => b.ma === k)));
ca("bồi thẩm mới vào chưa thuận ai", demPhieu(taoBoiTham()) === 0);
ca("điểm tin kẹp trong 0 đến 100", Object.values(Array.from({ length: 80 }).reduce((b) => apSuKien(b, "dep"), taoBoiTham())).every((d) => d >= 0 && d <= 100));

for (const vu of VU_TOA) {
  ca(`${vu.id}: đủ lời mở và kết`, vu.mo?.length > 20 && vu.thang?.length > 20 && vu.thua?.length > 20 && !!vu.bi_cao);
  ca(`${vu.id}: có ít nhất 2 nhân chứng`, vu.nhanChung.length >= 2);
  for (const nc of vu.nhanChung) {
    ca(`${nc.ten}: có giới thiệu và màu`, nc.gioiThieu?.length > 10 && /^#/.test(nc.mau));
    ca(`${nc.ten}: có dòng lỗi lẫn dòng đúng`, nc.dong.some((d) => d.loi) && nc.dong.some((d) => !d.loi));
    ca(`${nc.ten}: Corbeau có đủ hai kiểu, thật và dọa`, nc.doiDap?.some((c) => c.dung) && nc.doiDap?.some((c) => !c.dung));
    for (const c of nc.doiDap ?? []) {
      ca(`Corbeau: đủ nội dung: ${c.cau}`, c.loi?.length > 10 && c.dich?.length > 10 && c.gt?.length > 15 && !!LUAT[c.luat]);
      ca(`Corbeau: chấm đúng hai chiều: ${c.cau}`, dapCorbeau(c, !c.dung) && !dapCorbeau(c, c.dung));
    }
    ca(`${nc.ten}: lượt hỏi đủ dùng cho dòng ẩn`, nc.dong.filter((d) => d.them).length <= SO_HOI);
    const tatCa = nc.dong.flatMap((d) => (d.them ? [d, d.them] : [d]));
    ca(`${nc.ten}: chưa hỏi thì chưa thấy dòng ẩn`, dongHien(nc).length === nc.dong.length && dongHien(nc).every((d) => !d.laThem));
    const mo = Object.fromEntries(nc.dong.map((_, i) => [i, true]));
    ca(`${nc.ten}: hỏi hết thì thấy đủ, id không trùng`, dongHien(nc, mo).length === tatCa.length && new Set(dongHien(nc, mo).map((d) => d.id)).size === tatCa.length);
    for (const d of tatCa) {
      ca(`có bản dịch: ${d.van}`, d.dich?.length > 5);
      if (d.them) ca(`câu hỏi thêm: ${d.van}`, d.them.hoi?.length > 8 && d.them.van?.length > 8 && !d.them.them);
      if (d.mau) {
        ca(`mâu thuẫn trỏ tới tang vật có thật: ${d.van}`, !!vu.tang[d.mau.tang] && d.mau.gt?.length > 15);
        ca(`trình đúng tang vật mới phá được: ${d.van}`, trinhDung(d, d.mau.tang) && !Object.keys(vu.tang).filter((x) => x !== d.mau.tang).some((x) => trinhDung(d, x)));
        ca(`dòng mâu thuẫn không kiêm lỗi: ${d.van}`, !d.loi);
      }
      if (d.tang) ca(`tang vật nhận được có thật: ${d.van}`, !!vu.tang[d.tang] && !vu.tangVat.includes(d.tang));
      if (!d.loi) continue;
      const l = d.loi;
      ca(`từ sai xuất hiện đúng một lần: ${d.van}`, tachDong(d.van).filter((t) => t.goc === l.tu).length === 1);
      ca(`sửa xong khác câu gốc và chứa dạng đúng: ${d.van}`, dongDaSua(d) !== d.van && dongDaSua(d).includes(l.dung));
      ca(`phương án sửa khác nhau: ${d.van}`, new Set([l.dung, ...l.sai, l.tu]).size >= 3 && l.sai.length === 2 && !l.sai.includes(l.dung));
      ca(`điều luật tồn tại và đúng trình độ mức Dễ: ${d.van}`, luatTheoMuc("de").includes(l.luat));
      ca(`có lời giải: ${d.van}`, l.gt?.length > 15);
      ca(`chạm đúng từ được chấm đúng: ${d.van}`, chamDung(d, viTriLoi(d)) && !chamDung(d, viTriLoi(d) === 0 ? 1 : 0));
      for (let v = 0; v < 50; v++) {
        ca(`mức Dễ có từ sai trong 3 từ: ${d.van}`, (() => { const r = chonTuDe(d); return r.length === 3 && r.some((t) => t.k === viTriLoi(d)) && new Set(r.map((t) => t.k)).size === 3; })());
        const lc = chonLuat(l.luat, "de"), lv = chonLuat(l.luat, "vua"), lk = chonLuat(l.luat, "kho");
        ca("Dễ: 3 điều luật khác nhau, có điều đúng", lc.length === 3 && new Set(lc).size === 3 && lc.includes(l.luat));
        ca("Vừa: 4 điều, có điều cùng chương", lv.length === 4 && new Set(lv).size === 4 && lv.includes(l.luat) && lv.filter((x) => LUAT[x].chuong === LUAT[l.luat].chuong).length >= 2);
        ca("Khó: cả Bộ luật", lk.length === 30 && lk.includes(l.luat));
        const s = chonSua(l);
        ca("3 phương án sửa, có dạng đúng", s.length === 3 && s.includes(l.dung));
      }
    }
    for (const d of tatCa.filter((x) => !x.loi)) ca(`dòng đúng không chấm được: ${d.van}`, tachDong(d.van).every((_, k) => !chamDung(d, k)) && chonTuDe(d).length === 3);
  }
  ca(`${vu.id}: tổng nhát dương`, tongNhat(vu) > 0);
  ca(`${vu.id}: bài biện hộ đủ 3 lượt`, vu.bienHo?.length === 3);
  for (const b of vu.bienHo) {
    ca(`biện hộ: có đúng một câu sai ngữ pháp: ${b.hoi}`, b.pa.length === 3 && b.pa.filter((c) => c.sai).length === 1);
    for (const c of b.pa) ca(`biện hộ: kiểu lập luận hợp lệ: ${c.van}`, c.dich?.length > 8 && (c.sai?.length > 10 || ["ly", "dep", "tinh"].includes(c.tag)));
  }
  ca("biện hộ: chọn được đủ ba kiểu lập luận trong vụ", new Set(vu.bienHo.flatMap((b) => b.pa.map((c) => c.tag).filter(Boolean))).size === 3);

  /* Mô phỏng trọn phiên: p là tỉ lệ đúng mỗi nhát, sau là có dùng hỏi thêm và tang vật không. */
  const phien = (p, sau, nham = 0) => {
    let bt = taoBoiTham();
    const ap = (...ds) => { bt = ds.reduce(apSuKien, bt); };
    const coDung = () => Math.random() < p;
    for (let k = 0; k < nham; k++) ap("nham");
    const dsDong = vu.nhanChung.flatMap((c) => c.dong.flatMap((d) => (d.them && sau && coDung() ? [d, d.them] : [d])));
    for (const d of dsDong) {
      if (d.mau && coDung()) ap("tang");
      if (!d.loi) continue;
      if (!coDung()) { if (Math.random() < 0.5) ap("nham"); continue; }
      ap("tu");
      const l = coDung(), s = coDung();
      ap(l ? "luat" : "sai_luat", s ? "sua" : "sai_sua");
      if (l && s && laLoiHop(d.loi.luat)) ap("hop");
    }
    for (const c of vu.nhanChung.flatMap((x) => x.doiDap)) { if (coDung()) { ap("doi"); if (coDung()) ap("nhanh"); } else ap("doi_sai"); }
    for (const b of vu.bienHo) { if (coDung()) { const co = b.pa.filter((c) => !c.sai); ap(co[Math.floor(Math.random() * co.length)].tag); } else ap("sai_cau"); }
    return demPhieu(bt);
  };
  const tile = (p, sau) => { let t = 0, n = 0; for (let v = 0; v < 3000; v++) { const x = phien(p, sau); t += thangToa(x) ? 1 : 0; n += x; } return [t / 3000, n / 3000]; };
  for (const p of [0.3, 0.5, 0.7, 0.9]) { const [a, b] = tile(p, true), [c] = tile(p, false); console.log(`  đúng ${p * 100}%: thắng ${Math.round(a * 100)}%, ${b.toFixed(1)} phiếu; không hỏi thêm thắng ${Math.round(c * 100)}%`); }
  ca("đúng 90% gần như luôn thắng", tile(0.9, true)[0] >= 0.85);
  ca("đúng 30% khó thắng", tile(0.3, true)[0] <= 0.1);
  ca("đúng 70% có thắng có thua", tile(0.7, true)[0] >= 0.3 && tile(0.7, true)[0] <= 0.9);
  ca("hỏi thêm và tang vật giúp thắng nhiều hơn", tile(0.7, true)[0] > tile(0.7, false)[0]);
  // Cả toà không được tự thuận chỉ vì bắt lỗi giỏi: thiếu chứng cứ thì Dr Preuve vẫn phải lắc đầu.
  const chiBatLoi = () => { let b = taoBoiTham(); const ap = (...ds) => { b = ds.reduce(apSuKien, b); }; for (const d of vu.nhanChung.flatMap((c) => c.dong).filter((x) => x.loi)) { ap("tu", "luat", "sua"); if (laLoiHop(d.loi.luat)) ap("hop"); } vu.nhanChung.flatMap((c) => c.doiDap).forEach(() => ap("doi")); ap("ly", "ly", "tinh"); return b; };
  ca("không chọn câu văn đẹp thì Mlle Verlaine không thuận", chiBatLoi().nha_tho < 50);
  ca("bắt lỗi giỏi vẫn thắng dù không làm hết", thangToa(demPhieu(chiBatLoi())));
}
ca("sửa: bỏ khoảng trắng và hoa thường, giữ dấu", khopSua(" Allée ", "allée") && !khopSua("allee", "allée"));
ca("giờ đọc có sàn và tăng theo độ dài", giayDoc("a b") === 5 && giayDoc(Array(20).fill("x").join(" ")) === 18);
ca("Corbeau nhân giờ theo mức", giayCorbeau(1) === 14 && giayCorbeau(0.75) < giayCorbeau(1.3));
ca("điểm cuối cộng uy tín và thưởng thắng", diemCuoi(900, 2, true) === 1300 && diemCuoi(900, 2, false) === 1000);

console.log(`check:phientoa ${dat}/${dat + hong}`);
process.exit(hong ? 1 : 0);
