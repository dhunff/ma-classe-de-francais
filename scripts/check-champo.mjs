/* npm run check:champo — chấm AI phần NÓI thi thử (09/11, giai đoạn 5).
 * Gọi thẳng supabase/functions/_shared/gopDiemPO.js, cùng file Edge Function `cham-po` dùng. */
import { gopDiemPO } from "../supabase/functions/_shared/gopDiemPO.js";
import { tongPO } from "../supabase/functions/_shared/grillePO.js";

let pass = 0, fail = 0;
const la = (dk, ten) => { if (dk) { pass++; } else { fail++; console.log(`  ✗ ${ten}`); } };

// B1: entretien, interaction, point_de_vue, morpho, phono ∈ {0,1,2.5,4}; lexique ∈ {0,1,3,5}.
const L1 = { diem: { entretien: 2.5, interaction: 2.5, point_de_vue: 1, lexique: 3, morpho: 2.5, phono: 2.5 } };
const L2 = { diem: { entretien: 4, interaction: 2.5, point_de_vue: 2.5, lexique: 3, morpho: 1, phono: 2.5 } };
const g = gopDiemPO("B1", [L1, L2]);
la(g.so_luot === 2 && g.diem.interaction === 2.5 && g.diem.lexique === 3, "hai lượt giống nhau giữ nguyên");
la(g.diem.entretien === 4 && g.diem.point_de_vue === 2.5, `2,5 với 4 (tb 3,25) và 1 với 2,5 (tb 1,75): về mức gần nhất, hoà thì mức cao (ra ${g.diem.entretien}, ${g.diem.point_de_vue})`);
la(g.diem.morpho === 2.5, `1 với 2,5 hoà khoảng cách: lấy mức cao hơn (ra ${g.diem.morpho})`);
la(Object.values(g.diem).every((v) => [0, 1, 2.5, 3, 4, 5].includes(v)), "mọi điểm gộp đều là giá trị có trên grille");
la(tongPO("B1", g.diem).ok, "bảng điểm gộp đủ tiêu chí qua được tongPO (kiểm giống SQL)");
la(!g.can_luot_ba, "lệch đúng một mức thì không cần lượt ba");

const L3 = { diem: { ...L1.diem, entretien: 0 } };
const L4 = { diem: { ...L1.diem, entretien: 2.5 } };
la(gopDiemPO("B1", [L3, { diem: { ...L1.diem, entretien: 2.5 } }]).can_luot_ba, "0 với 2,5 (cách hai mức) thì cần lượt ba");
const g3 = gopDiemPO("B1", [L3, L4, { diem: { ...L1.diem, entretien: 4 } }]);
la(g3.so_luot === 3 && g3.diem.entretien === 2.5 && !g3.can_luot_ba, "ba lượt lấy trung vị");
la(!g3.chua_chac, "ba lượt có hai lượt gần nhau thì không gắn cờ");
const lech = gopDiemPO("B2", [{ diem: { monologue: 0 } }, { diem: { monologue: 3 } }, { diem: { monologue: 5 } }]);
la(lech.chua_chac === false && lech.diem.monologue === 3, "0, 3, 5 ở thang 0/1/3/5: 3 với 5 cách một mức, vẫn có cặp gần nhau");
/* Thang bốn mức không thể có ba giá trị đôi một cách nhau quá một mức, nên ở A2–C1 cờ « chưa chắc »
   bật theo TỔNG: ba tổng không có cặp nào trong vòng 3 điểm. */
const tat = (v) => ({ diem: { monologue: v, interaction: v, lexique: v, morpho: v, phono: v } });
la(gopDiemPO("B2", [tat(0), tat(3), tat(5)]).chua_chac, "ba tổng 0, 15, 25 không có cặp nào gần nhau thì chưa chắc");
la(gopDiemPO("A1", [{ diem: { entretien: 0 } }, { diem: { entretien: 2.5 } }, { diem: { entretien: 5 } }]).chua_chac, "A1: ba lượt cách nhau quá 1 điểm ở một tiêu chí thì chưa chắc");

// A1 thang nửa điểm: lệch quá 1 điểm mới tính là lớn.
la(!gopDiemPO("A1", [{ diem: { entretien: 3 } }, { diem: { entretien: 4 } }]).can_luot_ba, "A1: lệch 1 điểm chưa cần lượt ba");
la(gopDiemPO("A1", [{ diem: { entretien: 2.5 } }, { diem: { entretien: 4 } }]).can_luot_ba, "A1: lệch 1,5 điểm cần lượt ba");
la(gopDiemPO("A1", [{ diem: { entretien: 3 } }, { diem: { entretien: 3.5 } }]).diem.entretien === 3.5, "A1: trung bình 3,25 về mức nửa điểm gần nhất, hoà lấy cao");

// Giá trị lạ bị bỏ, không kẹp; lượt rỗng không tính.
const bo = gopDiemPO("B1", [{ diem: { entretien: 3, phono: 9, lexique: 3 } }, { diem: { entretien: 2.5, phono: "x" } }, { tong_quat: "rỗng" }, null]);
la(bo.so_luot === 2 && bo.diem.entretien === 2.5 && bo.diem.phono === undefined && bo.diem.lexique === 3, "giá trị không có trên grille thì lượt đó bỏ tiêu chí ấy");
la(gopDiemPO("B1", [{ tieu_chi: { lexique: { diem: 5 } } }]).diem.lexique === 5, "đọc được cả dạng { tieu_chi: { id: { diem } } }");
la(gopDiemPO("ZZ", [L1]).so_luot === 0, "trình độ không có grille thì không chấm");
la(gopDiemPO("B1", [L1, { diem: { ...L1.diem, entretien: 0, interaction: 0, point_de_vue: 0 } }]).can_luot_ba, "tổng lệch quá 3 điểm thì cần lượt ba");

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
