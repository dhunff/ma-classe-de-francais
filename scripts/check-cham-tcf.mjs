/* check:chamtcf (14/11): luật AI chấm Viết/Nói TCF (_shared/chamTcf.js).
 * Canh: thang /20 ↔ CECRL khớp bảng France Compétences đang dùng ở shared/tcfCanada.js, NCLC khớp
 * bảng IRCC, gộp điểm hai/ba giám khảo, điểm sai khung hoặc lệch mức thì BỎ (không kẹp), đếm từ. */
import { capTuDiem, nclcTuDiem, gopDiemTcf, diemKhopMuc, kiemPhieuTcf, demTu, loiNhacTcf, BANG_CAP } from "../supabase/functions/_shared/chamTcf.js";
import { capTcfTP, nclcTCF, CECRL_TCF_TP } from "../src/shared/tcfCanada.js";

let ok = 0, hong = 0;
const t = (ten, thuc, mong) => {
  const dung = JSON.stringify(thuc) === JSON.stringify(mong);
  if (dung) ok++; else { hong++; console.log(`✗ ${ten}\n   được: ${JSON.stringify(thuc)}\n   cần:  ${JSON.stringify(mong)}`); }
};

/* Thang: mọi điểm 0..20 phải ra cùng mức và cùng NCLC với bảng phía trình duyệt. */
for (let d = 0; d <= 20; d++) {
  t(`cấp ${d}/20 khớp capTcfTP`, capTuDiem(d), capTcfTP("PE", d));
  t(`NCLC ${d}/20 khớp nclcTCF`, nclcTuDiem(d), nclcTCF("PE", d));
}
t("bảng cấp giống hệt CECRL_TCF_TP.NOTE", BANG_CAP, CECRL_TCF_TP.NOTE);
t("0/20 chưa đạt A1", capTuDiem(0), "");
t("10/20 là B2, NCLC 7", [capTuDiem(10), nclcTuDiem(10)], ["B2", 7]);

/* Gộp điểm. */
t("một lượt", gopDiemTcf([12]).diem, 12);
t("hai lượt gần: trung bình", gopDiemTcf([12, 13]).diem, 13);
t("hai lượt gần: không cần lượt 3", gopDiemTcf([12, 14]).can_luot_ba, false);
t("hai lượt lệch 3: cần lượt 3", gopDiemTcf([9, 12]).can_luot_ba, true);
t("ba lượt: trung vị", gopDiemTcf([9, 15, 12]).diem, 12);
t("ba lượt cách xa nhau: chưa chắc", gopDiemTcf([2, 10, 18]).chua_chac, true);
t("lượt hỏng bị bỏ", gopDiemTcf([null, 11]).diem, 11);
t("điểm lẻ bị bỏ", gopDiemTcf([11.5, 12]).diem, 12);
t("điểm ngoài khung bị bỏ, không kẹp", gopDiemTcf([25]).diem, null);
t("không lượt nào hợp lệ", gopDiemTcf([]).diem, null);

/* Điểm phải nằm trong khoảng của mức tổng tự khai. */
t("B2 + 12 hợp lệ", diemKhopMuc({ niveau_global: "B2", note: 12 }), 12);
t("B2 + 15 mâu thuẫn → bỏ", diemKhopMuc({ niveau_global: "B2", note: 15 }), null);
t("<A1 + 0 hợp lệ", diemKhopMuc({ niveau_global: "<A1", note: 0 }), 0);
t("mức lạ → bỏ", diemKhopMuc({ niveau_global: "B3", note: 8 }), null);

/* Kiểm phiếu. */
const p = kiemPhieuTcf({ taches: [{ so: 3, niveau: "B1", linguistique: "a" }, { so: 1, niveau: "B2" }, { so: 4, niveau: "B1" }, { so: 2, niveau: "Z" }], niveau_global: "B1", note: 8, conseils: ["x", "y", "z", "w"] });
t("phiếu: bỏ tâche sai số / sai mức, sắp theo số", p.taches.map((x) => x.so), [1, 3]);
t("phiếu: điểm khớp mức", p.note, 8);
t("phiếu: tối đa 3 lời khuyên", p.conseils.length, 3);

/* Đếm từ kiểu DELF/FEI. */
t("đếm từ theo khoảng trắng", demTu("Je suis à l'école, c'est-à-dire ici."), 6);
t("đếm từ bỏ thẻ HTML", demTu("<p>Bonjour</p><p>à tous</p>"), 3);
t("đếm từ chuỗi rỗng", demTu("   "), 0);

/* Lời nhắc có đủ ba nhóm tiêu chí FEI và thang điểm. */
for (const code of ["PE", "PO"]) {
  const h = loiNhacTcf({ code, level: "TCF" });
  t(`lời nhắc ${code} có ba nhóm tiêu chí`, ["linguistique", "pragmatique", "sociolinguistique"].every((x) => h.includes(x)), true);
  t(`lời nhắc ${code} có thang C2 = 18 à 20/20`, h.includes("C2 = 18 à 20/20"), true);
  t(`lời nhắc lượt 2 ${code} chỉ xin điểm`, loiNhacTcf({ code, level: "TCF_TP", laLuotHai: true }).includes('"taches"'), false);
}

console.log(`check:chamtcf: ${ok} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
