/* npm run check:troichay — đo độ trôi chảy từ dấu thời gian từng từ (09/11, giai đoạn 4).
 * Gọi thẳng supabase/functions/_shared/troiChay.js, cùng file Edge Function `nhan-xet-noi` dùng. */
import { doTroiChay, dongTroiChay, NGAT_GIAY } from "../supabase/functions/_shared/troiChay.js";

let pass = 0, fail = 0;
const la = (dk, ten) => { if (dk) { pass++; } else { fail++; console.log(`  ✗ ${ten}`); } };

/* Dựng chuỗi từ: mỗi từ dài `dai` giây, cách nhau `cach` giây (mảng hoặc số). */
function chuoi(tu, dai = 0.3, cach = 0.1) {
  let t = 0;
  return tu.map((w, i) => {
    const o = { word: w, start: t, end: t + dai };
    t = o.end + (Array.isArray(cach) ? (cach[i] ?? 0.1) : cach);
    return o;
  });
}

// 1. Quá ít dữ liệu thì không đo, không bịa mức.
la(!doTroiChay(chuoi(["Bonjour", "je", "suis"]), "A2").du_lieu, "dưới 5 từ thật: không đo");
la(!doTroiChay(chuoi(["a", "b", "c", "d", "e"], 0.1, 0.05), "A2").du_lieu, "dưới 3 giây nói: không đo");
la(!doTroiChay(chuoi(["euh", "euh", "hum", "euh", "ben", "a"]), "A2").du_lieu, "từ đệm không tính là từ thật");
la(!doTroiChay(null, "A2").du_lieu && !doTroiChay([{ word: "x" }], "A2").du_lieu, "dữ liệu hỏng: không đo, không ném lỗi");

// 2. Tốc độ: 20 từ trong ~8 giây ≈ 150 từ/phút; cùng số từ kéo dài 30 giây ≈ 40 từ/phút.
const nhanh = doTroiChay(chuoi(Array.from({ length: 20 }, (_, i) => `mot${i}`), 0.3, 0.1), "A2");
la(nhanh.du_lieu && nhanh.toc_do >= 140 && nhanh.toc_do <= 160 && nhanh.muc.toc_do === "nhanh", `tốc độ cao ra « nhanh » (ra ${nhanh.toc_do}, ${nhanh.muc?.toc_do})`);
const cham = doTroiChay(chuoi(Array.from({ length: 20 }, (_, i) => `mot${i}`), 0.5, 0.5), "A2");
la(cham.toc_do >= 55 && cham.toc_do <= 65 && cham.muc.toc_do === "hoi_cham", `20 từ / 20 giây ở A2 là « hơi chậm » (ra ${cham.toc_do}, ${cham.muc.toc_do})`);
la(doTroiChay(chuoi(Array.from({ length: 20 }, (_, i) => `mot${i}`), 0.5, 0.5), "A1").muc.toc_do === "tot", "cùng tốc độ đó ở A1 là « tốt »: ngưỡng theo trình độ");
la(doTroiChay(chuoi(Array.from({ length: 10 }, (_, i) => `mot${i}`), 0.5, 2), "B1").muc.toc_do === "cham", "rất chậm ra « chậm »");

// 3. Ngập ngừng: khoảng lặng từ 1 giây trở lên.
const ng = doTroiChay(chuoi(["je", "suis", "allé", "au", "cinéma", "avec", "mes", "amis", "hier", "soir"], 0.3, [0.1, NGAT_GIAY, 0.1, 2.5, 0.1, 0.99, 0.1, 1.2, 0.1]), "B1");
la(ng.so_ngat === 3 && ng.ngat_dai_nhat === 2.5, `đếm chỗ ngắt từ ${NGAT_GIAY} giây, 0,99 giây không tính (ra ${ng.so_ngat}, dài nhất ${ng.ngat_dai_nhat})`);
la(ng.muc.ngap_ngung === "nhieu", `3 chỗ ngắt trong ~8 giây ở B1 là « nhiều » (ra ${ng.muc.ngap_ngung})`);
la(doTroiChay(chuoi(Array.from({ length: 30 }, (_, i) => `mot${i}`)), "B1").muc.ngap_ngung === "it", "nói liền không ngắt là « ít »");

// 4. Từ đệm và lặp từ.
const dem = doTroiChay(chuoi(["Euh,", "je", "pense", "euh", "que", "hum...", "c'est", "c'est", "bien", "Bon", "alors", "voilà"]), "B1");
la(dem.so_tu_dem === 3 && dem.tu_dem.euh === 2 && dem.tu_dem.hum === 1, `đếm từ đệm, bỏ dấu câu, không tính « bon, alors, voilà » (ra ${JSON.stringify(dem.tu_dem)})`);
la(dem.so_tu === 9, `số từ thật không gồm từ đệm (ra ${dem.so_tu})`);
la(dem.so_lap === 1 && dem.muc.tu_dem === "nhieu", `lặp « c'est c'est » là 1 lần lặp; 3 từ đệm trong vài giây là « nhiều » (ra ${dem.so_lap}, ${dem.muc.tu_dem})`);
la(doTroiChay(chuoi(["Le", "le", "chat", "dort", "sur", "le", "lit", "ce", "soir"]), "B1").so_lap === 1, "lặp không phân biệt hoa thường");
/* Lượt ghi thật 09/11: « des paroles, des paroles pour exprimer, pour échanger » có MỘT lần lặp cụm. */
la(doTroiChay(chuoi(["je", "suis", "passionné", "par", "des", "paroles,", "des", "paroles", "pour", "exprimer,", "pour", "échanger"]), "B1").so_lap === 1, "lặp cụm hai từ đếm một lần, « pour exprimer, pour échanger » không phải lặp");
la(doTroiChay(chuoi(["il", "y", "a", "il", "y", "a", "un", "parc", "près", "de", "chez", "moi"]), "B1").so_lap === 1, "lặp cụm ba từ đếm một lần, không đếm thêm các từ con");
la(doTroiChay(chuoi(["nous", "nous", "sommes", "levés", "tôt", "et", "vous", "vous", "êtes", "assis"]), "B1").so_lap === 0, "« nous nous », « vous vous » phản thân không tính là lặp");

// 5. Trình độ lạ về B1; dòng đưa vào lời nhắc.
la(doTroiChay(chuoi(Array.from({ length: 20 }, (_, i) => `mot${i}`)), "zz").cap === "B1", "trình độ lạ coi như B1");
const dong = dongTroiChay(ng);
la(dong.includes("từ/phút") && dong.includes("ngập ngừng") && dong.includes("B1"), "dòng sự thật cho AI có đủ các số đo");
la(dongTroiChay({ du_lieu: false }) === "" && dongTroiChay(null) === "", "không có dữ liệu thì không thêm dòng nào");

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
