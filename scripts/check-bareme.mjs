/* Kiểm mốc cho điểm và việc xếp nhóm của grille Production écrite.
 *
 * ══ VÌ SAO CẦN BỘ KIỂM RIÊNG ══
 *
 * `check:grille` canh THANG ĐIỂM — tổng 25, mỗi tiêu chí có label và aide.
 * Nó không biết gì về `peBareme.js`, và cũng không nên biết: hai file sinh ra
 * vì hai lý do khác nhau.
 *
 * Nhưng ba loại lỗi dưới đây đều để build đi qua và không hiện ra trên màn hình
 * theo cách ai đó nhận ra:
 *
 *   1. Mốc xếp SAI THỨ TỰ. Giao diện tìm nấc bằng `find(([at]) => v >= at)`,
 *      nên mảng tăng dần sẽ khiến MỌI điểm rơi vào nấc đầu tiên. Màn hình vẫn
 *      hiện một mô tả trông hợp lý — chỉ là sai.
 *
 *   2. Mốc cao nhất KHÔNG BẰNG max. Chấm điểm tối đa mà mô tả hiện ra là nấc
 *      dưới. Không có gì báo lỗi.
 *
 *   3. Tiêu chí thiếu trong NHOM_CUA. Nó rơi ra ngoài cả ba nhóm và BIẾN MẤT
 *      khỏi màn hình. Tổng vẫn cộng đúng vì tổng lấy từ rubric, không lấy từ
 *      thứ đang hiện — nên người học chấm thiếu một tiêu chí mà vẫn thấy nút
 *      "Lưu" mở khoá. Đây là loại lỗi tệ nhất trong ba loại.
 */

import { GRILLE } from "../src/screens/exam/delfGrille.js";
import { BAREME, NHOM_CUA, THU_TU_NHOM, TEN_NHOM } from "../src/shared/peBareme.js";
import { grilleToRubric, grilleLuuDuoc, giongThangChuan } from "../src/shared/grilleRubric.js";

let pass = 0, fail = 0;
const t = (name, ok, detail = "") => {
  if (ok) { pass++; } else { fail++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
};

const MUC = Object.keys(GRILLE);

/* ── 1. Mọi tiêu chí đều xếp được vào một nhóm ──
   Chạy trên CẢ BỐN trình độ, kể cả A1/A2 vốn không có mốc: thiếu nhóm thì tiêu
   chí biến mất khỏi màn hình dù có mốc hay không. */
for (const lv of MUC) {
  for (const c of GRILLE[lv].criteres) {
    t(`${lv}/${c.id}: có nhóm`, !!NHOM_CUA[c.id],
      `thêm "${c.id}" vào NHOM_CUA trong peBareme.js`);
    if (NHOM_CUA[c.id]) {
      t(`${lv}/${c.id}: nhóm hợp lệ`, THU_TU_NHOM.includes(NHOM_CUA[c.id]),
        `"${NHOM_CUA[c.id]}" không nằm trong ${THU_TU_NHOM.join("/")}`);
    }
  }
}

t("mọi nhóm đều có tên hiển thị",
  THU_TU_NHOM.every((n) => TEN_NHOM[n]),
  THU_TU_NHOM.filter((n) => !TEN_NHOM[n]).join(", "));

/* ── 2. Mốc cho điểm ── */
for (const [lv, bo] of Object.entries(BAREME)) {
  t(`${lv}: là trình độ có thật`, !!GRILLE[lv]);
  if (!GRILLE[lv]) continue;

  const theoId = new Map(GRILLE[lv].criteres.map((c) => [c.id, c]));

  for (const [id, moc] of Object.entries(bo)) {
    const c = theoId.get(id);
    t(`${lv}/${id}: tiêu chí có thật`, !!c, "không có trong GRILLE — mốc thừa");
    if (!c) continue;

    t(`${lv}/${id}: mốc không rỗng`, Array.isArray(moc) && moc.length >= 2);
    if (!Array.isArray(moc) || moc.length < 2) continue;

    t(`${lv}/${id}: mốc cao nhất = max`, moc[0][0] === c.max,
      `mốc ${moc[0][0]} nhưng max là ${c.max}`);
    t(`${lv}/${id}: có mốc 0`, moc[moc.length - 1][0] === 0,
      `mốc thấp nhất là ${moc[moc.length - 1][0]}`);

    /* GIẢM DẦN NGHIÊM NGẶT. Bằng nhau cũng hỏng: hai nấc cùng điểm thì nấc thứ
       hai không bao giờ với tới được. */
    let giamDan = true;
    for (let i = 1; i < moc.length; i++) if (!(moc[i][0] < moc[i - 1][0])) giamDan = false;
    t(`${lv}/${id}: xếp giảm dần`, giamDan, moc.map(([v]) => v).join(" → "));

    t(`${lv}/${id}: mốc nằm trong thang`,
      moc.every(([v]) => v >= 0 && v <= c.max));
    t(`${lv}/${id}: mốc nào cũng có mô tả`,
      moc.every(([, w]) => typeof w === "string" && w.trim().length >= 10));
  }
}

/* ── 3. Adapter không đánh rơi tiêu chí nào ──
   Đây là phép kiểm quan trọng nhất: mô phỏng đúng việc giao diện làm — lọc
   tiêu chí theo nhóm rồi dựng danh sách — và đòi con số khớp với rubric. */
for (const lv of MUC) {
  const r = grilleToRubric(lv);

  t(`${lv}: rubric giữ đủ tiêu chí`,
    r.criteria.length === GRILLE[lv].criteres.length,
    `${r.criteria.length} vs ${GRILLE[lv].criteres.length}`);

  t(`${lv}: tổng rubric = tổng grille`,
    r.total === GRILLE[lv].criteres.reduce((n, c) => n + c.max, 0));

  const hienRa = THU_TU_NHOM.flatMap((cat) => r.criteria.filter((c) => c.category === cat));
  t(`${lv}: không tiêu chí nào rơi khỏi màn hình`,
    hienRa.length === r.criteria.length,
    `nhóm hiện ${hienRa.length}/${r.criteria.length}`);
  t(`${lv}: tổng điểm hiện ra = tổng rubric`,
    hienRa.reduce((n, c) => n + c.max_score, 0) === r.total);

  t(`${lv}: cờ official đúng`, r.official === !GRILLE[lv].adapted);
  t(`${lv}: mọi tiêu chí có step`, r.criteria.every((c) => c.step > 0));

  /* B1/B2 phải có mốc — đó là hai trình độ hệ thống nhắm tới. A1/A2 thì không,
     và giao diện lùi về `description`. Kiểm cả hai chiều để không ai lặng lẽ
     xoá mốc của B2. */
  const coMoc = r.criteria.filter((c) => c.bareme).length;
  if (lv === "B1" || lv === "B2") {
    t(`${lv}: mọi tiêu chí đều có mốc`, coMoc === r.criteria.length,
      `${coMoc}/${r.criteria.length}`);
  } else {
    t(`${lv}: lùi về description khi không có mốc`,
      r.criteria.every((c) => c.description && c.description.length > 10));
  }
}

/* ── 4. Bộ xác thực JS phải khớp ràng buộc SQL ──
 *
 * `grilleLuuDuoc` (giao diện) và `public.grille_hop_le` (migration 035) kiểm
 * cùng một thứ ở hai nơi. Chúng phục vụ hai mục đích khác nhau — một cái nói
 * tiêu chí nào sai, một cái là hàng rào thật — nhưng nếu bản JS LỎNG hơn thì
 * giáo viên bấm Lưu, database từ chối, và thông báo lỗi Postgres không giúp gì.
 *
 * Các ca dưới đây là bản sao đúng khối tự đối chiếu ở cuối 035. Sửa một bên mà
 * quên bên kia thì chỗ này đỏ. */
const HOP_LE = {
  schema_version: 1, level: "B2", official: false, total: 5,
  criteria: [
    { id: "a", key: "consigne", category: "pragmatique", name: "Bám sát đề", max_score: 2, step: 0.5 },
    { id: "b", key: "argumenter", category: "pragmatique", name: "Lập luận", max_score: 3, step: 0.5 },
  ],
};
const doi = (duong, gia) => {
  const g = JSON.parse(JSON.stringify(HOP_LE));
  const k = duong.split(".");
  let o = g;
  for (const x of k.slice(0, -1)) o = o[x];
  o[k[k.length - 1]] = gia;
  return g;
};

t("035/JS: thang hợp lệ được nhận", grilleLuuDuoc(HOP_LE).ok === true);
t("035/JS: null được nhận (dùng thang chuẩn)", grilleLuuDuoc(null).ok === true);
t("035/JS: tổng lệch bị chặn", grilleLuuDuoc(doi("total", 6)).ok === false);
t("035/JS: nhóm lạ bị chặn", grilleLuuDuoc(doi("criteria.0.category", "linh tinh")).ok === false);
t("035/JS: tên rỗng bị chặn", grilleLuuDuoc(doi("criteria.0.name", "")).ok === false);
t("035/JS: step không chia hết max bị chặn", grilleLuuDuoc(doi("criteria.0.step", 0.3)).ok === false);
t("035/JS: id trùng bị chặn", grilleLuuDuoc(doi("criteria.1.id", "a")).ok === false);
t("035/JS: mảng tiêu chí rỗng bị chặn",
  grilleLuuDuoc({ total: 0, criteria: [] }).ok === false);
t("035/JS: max_score bằng 0 bị chặn", grilleLuuDuoc(doi("criteria.0.max_score", 0)).ok === false);
t("035/JS: thiếu key bị chặn", grilleLuuDuoc(doi("criteria.0.key", "")).ok === false);
t("035/JS: thiếu id bị chặn", grilleLuuDuoc(doi("criteria.0.id", "")).ok === false);

/* step = 0 phải bị chặn, và quan trọng hơn là không được NỔ. Phía SQL đây là ca
   mà thứ tự đánh giá của OR quyết định — `max % step` với step = 0 là chia cho
   0. Phía JS thì `2 % 0` ra NaN chứ không ném lỗi, nên hai ngôn ngữ hỏng theo
   hai kiểu khác nhau từ cùng một dữ liệu. Kiểm cả hai. */
t("035/JS: step = 0 bị chặn", grilleLuuDuoc(doi("criteria.0.step", 0)).ok === false);
t("035/JS: không phải object bị chặn", grilleLuuDuoc("khong phai object").ok === false);
t("035/JS: criteria không phải mảng bị chặn",
  grilleLuuDuoc({ total: 0, criteria: "x" }).ok === false);

/* Thang chuẩn của cả bốn trình độ phải tự nó lưu được. Nếu không thì giáo viên
   bấm "Thang riêng" (khởi tạo từ thang chuẩn) là đã hỏng ngay từ giây đầu. */
for (const lv of MUC) {
  const r = grilleToRubric(lv);
  t(`035/JS: thang chuẩn ${lv} lưu được`, grilleLuuDuoc(r).ok === true);
}

/* ── 5. Cờ `official` phải theo NỘI DUNG, không theo thao tác ──
 *
 * Bản đầu đặt official=false ngay khi bấm « Thang riêng », kể cả khi chưa đổi
 * gì. Dữ liệu thật đã có một đề như vậy: thang giống hệt thang chuẩn B1 nhưng
 * học sinh vẫn đọc « không phải thang DELF chính thức ».
 *
 * Cảnh báo sai làm hỏng chính nó — đọc vài lần rồi người ta bỏ qua, kể cả lần
 * thang lệch thật. */
for (const lv of MUC) {
  const r = grilleToRubric(lv);
  t(`official: ${lv} chưa sửa gì thì vẫn là thang chuẩn`, giongThangChuan(r, lv) === true);

  const doiDiem = { ...r, criteria: r.criteria.map((c, i) =>
    (i === 0 ? { ...c, max_score: c.max_score + 0.5 } : c)) };
  t(`official: ${lv} đổi điểm thì KHÔNG còn là thang chuẩn`,
    giongThangChuan(doiDiem, lv) === false);

  const doiTen = { ...r, criteria: r.criteria.map((c, i) =>
    (i === 0 ? { ...c, name: c.name + " (sửa)" } : c)) };
  t(`official: ${lv} đổi tên thì KHÔNG còn là thang chuẩn`,
    giongThangChuan(doiTen, lv) === false);

  const doiNhom = { ...r, criteria: r.criteria.map((c, i) =>
    (i === 0 ? { ...c, category: c.category === "lexicale" ? "grammaticale" : "lexicale" } : c)) };
  t(`official: ${lv} đổi nhóm thì KHÔNG còn là thang chuẩn`,
    giongThangChuan(doiNhom, lv) === false);

  const boBot = { ...r, criteria: r.criteria.slice(0, -1) };
  t(`official: ${lv} bớt tiêu chí thì KHÔNG còn là thang chuẩn`,
    giongThangChuan(boBot, lv) === false);

  /* Sửa MÔ TẢ thì vẫn là thang chuẩn — cố ý. Giáo viên viết lại lời giải thích
     cho lớp mình là việc nên khuyến khích, và nó không đổi thang điểm. */
  const doiMoTa = { ...r, criteria: r.criteria.map((c, i) =>
    (i === 0 ? { ...c, description: "Lời giải thích riêng của cô." } : c)) };
  t(`official: ${lv} sửa mô tả VẪN là thang chuẩn`,
    giongThangChuan(doiMoTa, lv) === true);
}
t("official: null không phải thang chuẩn (là 'chưa soạn')", giongThangChuan(null, "B2") === false);

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
