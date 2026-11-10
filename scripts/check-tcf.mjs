// npm run check:tcf — điểm ước lượng TCF Canada + quy đổi NCLC (src/shared/tcfCanada.js).
// Bảng NCLC chép từ IRCC (canada.ca), đọc 09/11/2026: ca kiểm ghim từng biên để một lần
// sửa tay lệch số là đỏ ngay.
import { diemUocLuongTCF, nclcTCF, SO_CAU_TCF, DIEM_TOI_DA_TCF, NCLC_TCF, diemCauTCF, capTcfTP, CECRL_TCF_TP, BAI_THI_TCF_TP } from "../src/shared/tcfCanada.js";
import { EXAM_STRUCTURE } from "../src/screens/exam/examPaper.js";

let dat = 0, hong = 0;
const ca = (ten, ok, chiTiet = "") => { if (ok) dat++; else { hong++; console.log(`  ✗ ${ten}${chiTiet ? ` (${chiTiet})` : ""}`); } };

ca("39 câu", SO_CAU_TCF === 39, SO_CAU_TCF);
ca("tổng điểm 699", DIEM_TOI_DA_TCF === 699, DIEM_TOI_DA_TCF);
ca("câu đầu dễ nhất, câu cuối khó nhất", diemCauTCF(0) === 3 && diemCauTCF(38) === 33);

const tatCa = (v, n = 39) => Array(n).fill(v);
ca("đúng hết = 699", diemUocLuongTCF(tatCa(true)) === 699);
ca("sai hết = 0", diemUocLuongTCF(tatCa(false)) === 0);
ca("rỗng = null", diemUocLuongTCF([]) === null && diemUocLuongTCF(null) === null);
ca("bỏ câu không chấm được", diemUocLuongTCF([true, null, undefined]) === 699);
// Đúng 19 câu đầu (A1 → B1): 12 + 54 + 135 = 201.
ca("19 câu dễ đầu = 201", diemUocLuongTCF([...tatCa(true, 19), ...tatCa(false, 20)]) === 201, diemUocLuongTCF([...tatCa(true, 19), ...tatCa(false, 20)]));
// Câu khó nặng hơn: đúng 10 câu cuối > đúng 10 câu đầu.
const dau10 = diemUocLuongTCF([...tatCa(true, 10), ...tatCa(false, 29)]);
const cuoi10 = diemUocLuongTCF([...tatCa(false, 29), ...tatCa(true, 10)]);
ca("câu khó nặng hơn câu dễ", cuoi10 > dau10, `${dau10} / ${cuoi10}`);
// Đề ngắn (giáo viên soạn ít câu): đúng hết vẫn 699, đúng nửa sau > nửa đầu.
ca("đề 10 câu đúng hết = 699", diemUocLuongTCF(tatCa(true, 10)) === 699);
ca("đề 10 câu: nửa sau nặng hơn", diemUocLuongTCF([...tatCa(false, 5), ...tatCa(true, 5)]) > diemUocLuongTCF([...tatCa(true, 5), ...tatCa(false, 5)]));

// Biên bảng IRCC.
const BIEN = [
  ["CE", 699, 10], ["CE", 549, 10], ["CE", 548, 9], ["CE", 524, 9], ["CE", 523, 8], ["CE", 499, 8], ["CE", 498, 7],
  ["CE", 453, 7], ["CE", 452, 6], ["CE", 406, 6], ["CE", 405, 5], ["CE", 375, 5], ["CE", 374, 4], ["CE", 342, 4], ["CE", 341, 0],
  ["CO", 549, 10], ["CO", 548, 9], ["CO", 523, 9], ["CO", 522, 8], ["CO", 503, 8], ["CO", 502, 7], ["CO", 458, 7],
  ["CO", 457, 6], ["CO", 398, 6], ["CO", 397, 5], ["CO", 369, 5], ["CO", 368, 4], ["CO", 331, 4], ["CO", 330, 0],
  ["PE", 20, 10], ["PE", 16, 10], ["PE", 15, 9], ["PE", 14, 9], ["PE", 13, 8], ["PE", 12, 8], ["PE", 11, 7], ["PE", 10, 7],
  ["PE", 9, 6], ["PE", 7, 6], ["PE", 6, 5], ["PE", 5, 4], ["PE", 4, 4], ["PE", 3, 0],
  ["PO", 16, 10], ["PO", 6, 5], ["PO", 3, 0],
];
for (const [code, d, mong] of BIEN) ca(`${code} ${d} → NCLC ${mong}`, nclcTCF(code, d) === mong, nclcTCF(code, d));
ca("mã lạ → null", nclcTCF("XX", 500) === null);
ca("điểm rỗng → null", nclcTCF("CO", null) === null);

// Bảng liền mạch: mỗi dòng bắt đầu ngay sau dòng dưới nó, không hở không chồng.
for (const [code, bang] of Object.entries(NCLC_TCF)) {
  for (let i = 0; i < bang.length - 1; i++) ca(`${code} NCLC ${bang[i][0]} nối liền ${bang[i + 1][0]}`, bang[i][1] === bang[i + 1][2] + 1);
}

// ══ TCF tout public (10/11): bảng France Compétences RS 6460 ══
const BIEN_TP = [
  ["CO", 699, "C2"], ["CO", 600, "C2"], ["CO", 599, "C1"], ["CO", 500, "C1"], ["CE", 499, "B2"], ["CE", 400, "B2"],
  ["MS", 399, "B1"], ["MS", 300, "B1"], ["MS", 299, "A2"], ["CO", 200, "A2"], ["CO", 199, "A1"], ["CO", 101, "A1"],
  ["CO", 100, ""], ["CE", 0, ""],
  ["PE", 20, "C2"], ["PE", 18, "C2"], ["PE", 17, "C1"], ["PE", 14, "C1"], ["PO", 13, "B2"], ["PO", 10, "B2"],
  ["PO", 9, "B1"], ["PO", 6, "B1"], ["PE", 5, "A2"], ["PE", 2, "A2"], ["PE", 1, "A1"], ["PE", 0, ""],
];
for (const [code, d, mong] of BIEN_TP) ca(`TP ${code} ${d} → ${mong || "chưa đạt A1"}`, capTcfTP(code, d) === mong, capTcfTP(code, d));
ca("TP mã lạ → null", capTcfTP("XX", 300) === null);
for (const [k, bang] of Object.entries(CECRL_TCF_TP)) {
  for (let i = 0; i < bang.length - 1; i++) ca(`TP ${k} ${bang[i][0]} nối liền ${bang[i + 1][0]}`, bang[i][1] === bang[i + 1][2] + 1);
}
// Cấu trúc đề TCF_TP khớp bảng giới thiệu: cùng mã, cùng thứ tự, cùng phút, cùng thang.
const cauTruc = EXAM_STRUCTURE.TCF_TP ?? [];
ca("TCF_TP: 5 bài CO, MS, CE, PE, PO", cauTruc.map((x) => x.code).join(",") === "CO,MS,CE,PE,PO", cauTruc.map((x) => x.code).join(","));
for (const b of BAI_THI_TCF_TP) {
  const p = cauTruc.find((x) => x.code === b.code);
  ca(`TCF_TP ${b.code}: phút và thang khớp trang giới thiệu`, !!p && p.minutes === b.phut && p.points === b.thang, p ? `${p.minutes}′/${p.points}` : "thiếu");
}
ca("TCF_TP: 29 câu nghe đúng hết = 699", diemUocLuongTCF(tatCa(true, 29)) === 699);

console.log(`\n${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
