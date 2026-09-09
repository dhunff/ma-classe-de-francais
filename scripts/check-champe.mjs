/* Kiểm bộ lọc gợi ý chấm PE bằng AI.
 *
 * ══ VÌ SAO BỘ KIỂM NÀY TỒN TẠI ══
 *
 * Mọi thứ khác trong tính năng này hỏng thì có tiếng động: khoá sai ra 401,
 * mạng hỏng ra 502, migration hỏng thì push đỏ. Chỗ duy nhất hỏng ÂM THẦM là
 * khuôn dữ liệu mô hình trả về — nó vẫn là JSON hợp lệ, vẫn có số, và học
 * sinh vẫn đọc được một con số. Chỉ là con số đó sai thang.
 *
 * Gọi thẳng vào `supabase/functions/_shared/goiYPE.js` — không có bản sao nào
 * để trôi khỏi nhau. Đây chính là lý do file đó là JS thuần chứ không nằm lẫn
 * trong index.ts.
 */
import { kiemGoiY, bocJSON, lamTronBuoc } from "../supabase/functions/_shared/goiYPE.js";

let pass = 0, fail = 0;
const no = (m) => { fail++; console.log("  ✗ " + m); };
const la = (dk, m) => { if (dk) pass++; else no(m); };

/* Rubric giả, hình dạng đúng như `grilleToRubric` sinh ra. */
const RUBRIC = {
  level: "B1",
  criteria: [
    { id: "consigne",  name: "Tôn trọng đề bài", max_score: 2,   step: 0.5 },
    { id: "lexique",   name: "Từ vựng",          max_score: 4,   step: 0.5 },
    { id: "morpho",    name: "Ngữ pháp",         max_score: 5.5, step: 0.5 },
  ],
};
const TONG_MAX = 11.5;

/* ── 1. Ca thường ── */
{
  const r = kiemGoiY({
    tieu_chi: {
      consigne: { diem: 2,   nhan_xet: "Đủ ý." },
      lexique:  { diem: 3,   nhan_xet: "Khá." },
      morpho:   { diem: 4.5, nhan_xet: "Vài lỗi chia động từ." },
    },
    tong_quat: "Bài ổn.",
  }, RUBRIC);
  la(r.ok, "ca thường phải ok");
  la(r.goiY.tong === 9.5, `tổng phải là 9.5, ra ${r.goiY?.tong}`);
  la(r.goiY.tong_toi_da === TONG_MAX, `tổng tối đa phải ${TONG_MAX}`);
  la(r.goiY.so_cham_duoc === 3, "phải chấm được cả 3");
  la(r.bo.length === 0, "không được bỏ tiêu chí nào");
  la(r.goiY.tong_quat === "Bài ổn.", "phải giữ nhận xét tổng quát");
}

/* ── 2. VƯỢT KHUNG THÌ BỎ, KHÔNG KẸP VỀ BIÊN ──
 *
 * Ca quan trọng nhất cả file. Kẹp 9 về 5.5 tạo ra một điểm tuyệt đối cho đúng
 * cái tiêu chí mà mô hình vừa chứng minh là nó hiểu sai thang — và trên màn
 * hình nó trông y hệt một điểm 5.5 được chấm cẩn thận.
 */
{
  const r = kiemGoiY({
    tieu_chi: { consigne: 2, lexique: 3, morpho: { diem: 9 } },
  }, RUBRIC);
  la(r.ok, "hai tiêu chí hợp lệ thì vẫn ok");
  la(r.goiY.tieu_chi.morpho === undefined, "tiêu chí vượt khung PHẢI bị bỏ");
  la(r.goiY.tong === 5, `tổng chỉ cộng phần chấm được, ra ${r.goiY?.tong}`);
  la(r.bo.some((b) => b.id === "morpho" && b.vi_sao === "ngoai-khung"),
     "phải nói ra vì sao bỏ morpho");
  la(r.goiY.so_cham_duoc === 2 && r.goiY.so_tieu_chi === 3,
     "phải phân biệt số chấm được với tổng số tiêu chí");
}
{
  const r = kiemGoiY({ tieu_chi: { consigne: -1, lexique: 3, morpho: 3 } }, RUBRIC);
  la(r.goiY.tieu_chi.consigne === undefined, "điểm ÂM phải bị bỏ, không kẹp về 0");
}

/* ── 3. Thiếu thì bỏ, KHÔNG điền 0 ──
 * Điền 0 vào chỗ mô hình im lặng là bịa ra một nhận định — và là nhận định
 * nặng nhất có thể, đúng vào lúc ta biết ít nhất. */
{
  const r = kiemGoiY({ tieu_chi: { consigne: 2 } }, RUBRIC);
  la(r.ok, "một tiêu chí hợp lệ vẫn đủ để ok");
  la(Object.keys(r.goiY.tieu_chi).length === 1, "chỉ được giữ tiêu chí có mặt");
  la(r.goiY.tieu_chi.lexique === undefined, "tiêu chí thiếu KHÔNG được thành 0");
  la(r.bo.filter((b) => b.vi_sao === "thieu").length === 2, "phải báo 2 tiêu chí thiếu");
}

/* ── 4. Khuôn lồng khác nhau đều nhận ── */
for (const [ten, tho] of [
  ["tieu_chi", { tieu_chi: { consigne: 2, lexique: 2, morpho: 2 } }],
  ["criteria", { criteria: { consigne: 2, lexique: 2, morpho: 2 } }],
  ["phẳng",    { consigne: 2, lexique: 2, morpho: 2 }],
]) {
  const r = kiemGoiY(tho, RUBRIC);
  la(r.ok && r.goiY.tong === 6, `khuôn « ${ten} » phải nhận được`);
}
/* Và `{diem}` lẫn số trần đều được. */
{
  const r = kiemGoiY({ tieu_chi: { consigne: { score: 1.5 }, lexique: { note: 2 }, morpho: 3 } }, RUBRIC);
  la(r.ok && r.goiY.tong === 6.5, `nhận cả score/note/số trần, ra ${r.goiY?.tong}`);
}

/* ── 5. Làm tròn về bước 0,5 ── */
{
  const r = kiemGoiY({ tieu_chi: { consigne: 1.3, lexique: 2.26, morpho: 3.74 } }, RUBRIC);
  la(r.goiY.tieu_chi.consigne.diem === 1.5, "1.3 → 1.5");
  la(r.goiY.tieu_chi.lexique.diem === 2.5, "2.26 → 2.5");
  la(r.goiY.tieu_chi.morpho.diem === 3.5, "3.74 → 3.5");
  la(Number.isFinite(r.goiY.tong) && r.goiY.tong === 7.5,
     `tổng sau làm tròn phải 7.5, ra ${r.goiY?.tong}`);
}
la(lamTronBuoc(0.1 + 0.2, 0.5) === 0.5, "0.1+0.2 không được rò 0.30000000000000004");

/* ── 6. Rác vào thì hỏng TO TIẾNG, không hỏng im lặng ── */
for (const [ten, tho] of [
  ["null", null], ["chuỗi", "xin chào"], ["số", 42], ["mảng", [1, 2]],
]) {
  const r = kiemGoiY(tho, RUBRIC);
  la(!r.ok && r.goiY === null, `« ${ten} » phải trả ok:false`);
}
{
  const r = kiemGoiY({ tieu_chi: { consigne: "giỏi", lexique: null, morpho: {} } }, RUBRIC);
  la(!r.ok && r.ly_do === "khong-tieu-chi-nao-hop-le",
     "không tiêu chí nào chấm được thì phải ok:false, không trả tổng 0");
}
{
  const r = kiemGoiY({ tieu_chi: { consigne: 1 } }, { criteria: [] });
  la(!r.ok && r.ly_do === "rubric-rong", "rubric rỗng phải hỏng rõ ràng");
}

/* ── 7. Cắt chuỗi dài ── */
{
  const r = kiemGoiY({
    tieu_chi: { consigne: { diem: 1, nhan_xet: "a".repeat(900) } },
    tong_quat: "b".repeat(3000),
  }, RUBRIC);
  la(r.goiY.tieu_chi.consigne.nhan_xet.length === 600, "nhận xét cắt ở 600");
  la(r.goiY.tong_quat.length === 1500, "tổng quát cắt ở 1500");
}

/* ── 8. bocJSON: ba lớp ── */
la(bocJSON('{"a":1}')?.a === 1, "JSON trần");
la(bocJSON('```json\n{"a":2}\n```')?.a === 2, "JSON trong fence");
la(bocJSON('Đây là kết quả: {"a":3} — hết.')?.a === 3, "JSON lẫn trong câu");
la(bocJSON("không có gì") === null, "chuỗi không chứa JSON phải ra null");
la(bocJSON("") === null && bocJSON(null) === null, "rỗng/null phải ra null");

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
