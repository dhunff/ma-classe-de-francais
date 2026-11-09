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
import { kiemGoiY, kiemNhanXetLuyen, kiemChamLuyen, bocJSON, lamTronBuoc, gonLoiLeon, gopDiemNhieuLuot, ganDiemGop } from "../supabase/functions/_shared/goiYPE.js";
import { chuThuan, demTu, soTuDeBai, kiemTraCoDinh, locLoi, locYeuCau, chiaDoan } from "../supabase/functions/_shared/loiViet.js";
import { gomHoSoLoi, baiChoLoi, capTuHoSo, soSanhBanViet } from "../src/shared/hoSoLoi.js";

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

/* ── 9. Giai đoạn 1 (06/11): lỗi tô trong bài, yêu cầu đề, đếm từ ── */
{
  const BAI = "<p>Bonjour Marie,</p><p>Je suis allé&nbsp;à la fête  avec mes amis. C’était tres bien !</p><p>À bientôt</p>";
  const van = chuThuan(BAI);
  la(van === "Bonjour Marie,\nJe suis allé à la fête avec mes amis. C'était tres bien !\nÀ bientôt", "chuThuan: bỏ thẻ, &nbsp;, nháy cong, gộp khoảng trắng, giữ xuống dòng");
  la(demTu(van) === 16, "demTu: đếm cụm giữa hai khoảng trắng (« C'était » là 1, « ! » không tính), ra " + demTu(van));
  la(demTu("l'homme , c'est-à-dire : oui") === 3, "demTu: dấu câu đứng riêng không tính");

  la(soTuDeBai("Écrivez un message (60 mots minimum).")?.toi_thieu === 60, "soTuDeBai: 60 mots minimum");
  const k = soTuDeBai("Rédigez un texte de 160 à 180 mots.");
  la(k?.toi_thieu === 160 && k?.toi_da === 180, "soTuDeBai: khoảng 160 à 180");
  la(soTuDeBai("Écrivez au moins 80 mots")?.toi_thieu === 80, "soTuDeBai: au moins 80");
  la(soTuDeBai("Racontez votre week-end.") === null, "soTuDeBai: đề không ghi số từ thì null, không đoán");
  const kt = kiemTraCoDinh(BAI, "Écrivez un message de 60 mots minimum.");
  la(kt.so_tu === 16 && kt.thieu_tu === true && kt.toi_thieu === 60, "kiemTraCoDinh: thiếu từ");

  const { loi, bo } = locLoi([
    { trich: "tres bien", sua: "très bien", loai: "orthographe", giai_thich: "Thiếu dấu." },
    { trich: "C’était  tres", sua: "C'était très", loai: "orthographe" },          // nháy cong + 2 khoảng: vẫn khớp, nhưng trùng vùng
    { trich: "je suis allée au cinéma", sua: "x", loai: "accord" },                // KHÔNG có trong bài → bỏ
    { trich: "à la fête", sua: "à la fête", loai: "preposition" },                 // sửa = gốc → bỏ
    { trich: "avec mes amis", sua: "avec des amis", loai: "kieu-la" },             // loại lạ → syntaxe
    { trich: "tres bien", sua: "très bien", loai: "orthographe" },                 // trùng → bỏ
    "rác",
  ], van);
  la(loi.length === 3 && bo === 4, `locLoi: giữ 3 lỗi có thật, bỏ 4 (ra ${loi.length}/${bo})`);
  la(loi[1].trich === "C'était tres", "locLoi: chuẩn hoá nháy cong và khoảng trắng của đoạn trích");
  la(loi[2].loai === "syntaxe", "locLoi: loại lỗi lạ về syntaxe");
  la(locLoi(Array.from({ length: 30 }, () => ({ trich: "Bonjour", sua: "Salut" })), van).loi.length === 1, "locLoi: trùng đoạn trích chỉ giữ một");

  const doan = chiaDoan(van, loi);
  la(doan.map((d) => d.chu).join("") === van, "chiaDoan: ghép lại đúng nguyên bài");
  la(doan.filter((d) => d.loi != null).length === 2, "chiaDoan: lỗi chồng vùng lỗi khác thì không tô lần hai");

  const yc = locYeuCau([{ y: "Chào hỏi", dat: "co" }, { y: "Kể buổi tiệc", dat: true }, { y: "Hẹn gặp", dat: "??" }, { dat: "co" }]);
  la(yc.length === 3 && yc[1].dat === "co" && yc[2].dat === "mot_phan", "locYeuCau: chuẩn hoá dat, bỏ mục không tên");

  const g = kiemGoiY({ tieu_chi: { consigne: 2, lexique: 3, morpho: 4 }, loi: [{ trich: "tres bien", sua: "très bien", loai: "orthographe" }, { trich: "bịa", sua: "x" }], yeu_cau: [{ y: "A", dat: "khong" }] }, RUBRIC, van);
  la(g.ok && g.goiY.loi.length === 1 && g.goiY.loi_bo === 1 && g.goiY.yeu_cau.length === 1, "kiemGoiY kèm bài: lọc lỗi + yêu cầu");
  la(kiemGoiY({ tieu_chi: { consigne: 2 } }, RUBRIC).goiY.loi === undefined, "kiemGoiY không kèm bài: không thêm trường lỗi (phiếu cũ giữ nguyên)");

  const l = kiemNhanXetLuyen({ tong_quat: "Ổn.", diem_manh: ["Rõ ý", ""], loi: [{ trich: "tres bien", sua: "très bien", loai: "orthographe" }], tong: 99 }, van);
  la(l.ok && l.goiY.loai === "luyen" && l.goiY.diem_manh.length === 1 && l.goiY.tong === undefined, "kiemNhanXetLuyen: không có điểm, bỏ mục rỗng");
  la(!kiemNhanXetLuyen({ tong_quat: "", loi: [{ trich: "bịa", sua: "x" }] }, van).ok, "kiemNhanXetLuyen: rỗng sau khi lọc thì từ chối");

  /* Lượt thật đầu tiên (06/11): đề nằm ở consigne HTML của bài, lời Léon có chữ ký « — Leon »,
     lỗi « vons » ngắn phải tô đúng chữ đứng riêng chứ không vào giữa « avons ». */
  la(kiemTraCoDinh("un deux trois", "<p>Vous écrivez à un ami.</p><p>Dites ce que vous avez fait. (60 mots minimum)</p><br>Écrivez votre message.").thieu_tu, "kiemTraCoDinh: đọc được « 60 mots minimum » trong consigne HTML");
  la(gonLoiLeon("Hãy tiếp tục viết nhé! — Leon") === "Hãy tiếp tục viết nhé!", "gonLoiLeon: bỏ chữ ký « — Leon » ở cuối");
  la(gonLoiLeon("Bạn làm tốt — cố lên - Léon.") === "Bạn làm tốt, cố lên", "gonLoiLeon: đổi « — » giữa câu thành dấu phẩy");
  const van2 = "Nous avons fini et nous vons mangé.";
  const d2 = chiaDoan(van2, [{ trich: "vons", sua: "avons" }]).find((d) => d.loi != null);
  la(d2 && van2.indexOf("vons", 15) === van2.indexOf(d2.chu, 15) && chiaDoan(van2, [{ trich: "vons", sua: "x" }]).map((d) => d.chu).join("").length === van2.length && chiaDoan(van2, [{ trich: "vons", sua: "x" }])[0].chu === "Nous avons fini et nous ", "chiaDoan: ưu tiên chỗ khớp trọn từ");
  la(chiaDoan("Nous avons", [{ trich: "vons", sua: "x" }]).some((d) => d.loi != null), "chiaDoan: không có chỗ trọn từ thì vẫn tô chỗ khớp");

  /* Bản 2 (06/11): bài luyện viết CÓ điểm, kèm gợi ý tăng điểm và bài viết lại. */
  const cl = kiemChamLuyen({ tieu_chi: { consigne: 1, lexique: 4, morpho: 2 },
    tang_diem: [
      { tieu_chi: "consigne", viec: "Thêm ngày chủ nhật", them: 5 },
      { tieu_chi: "lexique", viec: "Đã tối đa", them: 1 },
      { tieu_chi: "khong_co", viec: "Lạ", them: 1 },
      { tieu_chi: "morpho", viec: "Chia lại động từ", them: 0.7 },
      { tieu_chi: "morpho", viec: "Trùng tiêu chí", them: 1 },
      { tieu_chi: "consigne", viec: "", them: 1 },
    ],
    bai_sua: "  Salut Paul,\r\nViens !  " }, RUBRIC, van);
  la(cl.ok && cl.goiY.loai === "luyen" && cl.goiY.tong === 7, "kiemChamLuyen: có điểm, đánh dấu luyện tập");
  la(cl.goiY.tang_diem.length === 2, `kiemChamLuyen: bỏ tiêu chí lạ, đã tối đa, trùng, việc rỗng (ra ${cl.goiY.tang_diem.length})`);
  la(cl.goiY.tang_diem[0].tieu_chi === "consigne" && cl.goiY.tang_diem[0].them === 1, "kiemChamLuyen: số điểm thêm kẹp trong phần còn trống, xếp lớn trước");
  la(cl.goiY.tang_diem[1].them === 0.5, "kiemChamLuyen: số điểm thêm làm tròn bước 0,5");
  la(cl.goiY.bai_sua === "Salut Paul,\nViens !", "kiemChamLuyen: bài viết lại được cắt khoảng trắng, bỏ \\r");
  la(!kiemChamLuyen({ tong_quat: "x" }, RUBRIC, van).ok, "kiemChamLuyen: không chấm được tiêu chí nào thì từ chối");

  /* Giai đoạn 2: chấm hai lượt. RUBRIC: consigne /2, lexique /4, morpho /5,5. */
  const g2 = gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { consigne: { diem: 1.5 }, lexique: { diem: 3 }, morpho: { diem: 4 } } }, { tieu_chi: { consigne: 1, lexique: 3.5, morpho: 4 } }]);
  la(g2.so_luot === 2 && g2.diem.consigne === 1.5 && g2.diem.lexique === 3.5 && g2.diem.morpho === 4, `gopDiem: hai lượt lấy trung bình, làm tròn bước 0,5 (ra ${JSON.stringify(g2.diem)})`);
  la(!g2.can_luot_ba && !g2.chua_chac && g2.lech_lon_nhat === 0.5, "gopDiem: lệch nhỏ thì không cần lượt ba");
  const g3 = gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { consigne: 2, lexique: 1, morpho: 4 } }, { tieu_chi: { consigne: 2, lexique: 3.5, morpho: 4 } }]);
  la(g3.can_luot_ba, "gopDiem: một tiêu chí lệch quá 1 điểm thì cần lượt ba");
  la(gopDiemNhieuLuot(RUBRIC, [{ consigne: 0, lexique: 1, morpho: 2 }, { consigne: 1, lexique: 2, morpho: 3 }]).can_luot_ba, "gopDiem: tổng lệch quá 2,5 thì cần lượt ba (điểm phẳng ở gốc cũng đọc được)");
  const g4 = gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { consigne: 2, lexique: 1, morpho: 4 } }, { tieu_chi: { consigne: 2, lexique: 3.5, morpho: 4 } }, { tieu_chi: { consigne: 2, lexique: 3, morpho: 4.5 } }]);
  la(g4.so_luot === 3 && g4.diem.lexique === 3 && g4.diem.morpho === 4 && !g4.can_luot_ba && !g4.chua_chac, "gopDiem: ba lượt lấy trung vị, lượt lạc loài bị loại");
  const g5 = gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { lexique: 0 } }, { tieu_chi: { lexique: 2 } }, { tieu_chi: { lexique: 4 } }]);
  la(g5.chua_chac && g5.diem.lexique === 2, "gopDiem: ba lượt không có hai lượt nào gần nhau thì gắn cờ chưa chắc");
  const g6 = gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { consigne: 9, lexique: 3 } }, { tieu_chi: { consigne: 1, lexique: "x" } }, null]);
  la(g6.so_luot === 2 && g6.diem.consigne === 1 && g6.diem.lexique === 3 && g6.diem.morpho === undefined, "gopDiem: điểm ngoài khung hoặc không phải số thì lượt đó bỏ tiêu chí ấy");
  la(gopDiemNhieuLuot(RUBRIC, [{ tieu_chi: { consigne: 2 } }, { tong_quat: "rỗng" }]).so_luot === 1, "gopDiem: lượt không có điểm nào thì không tính là một lượt");
  const gd = ganDiemGop({ tong_quat: "Ổn", tieu_chi: { consigne: { diem: 2, nhan_xet: "Đủ ý" }, lexique: 3 } }, { consigne: 1.5, lexique: 3.5, morpho: 4 });
  la(gd.tieu_chi.consigne.diem === 1.5 && gd.tieu_chi.consigne.nhan_xet === "Đủ ý" && gd.tieu_chi.morpho.diem === 4 && gd.tong_quat === "Ổn", "ganDiemGop: thay điểm, giữ nhận xét lượt 1");
  la(kiemGoiY(gd, RUBRIC, van).goiY.tong === 9, "ganDiemGop: kiemGoiY cộng đúng điểm đã gộp");

  /* Giai đoạn 3: hồ sơ lỗi, nối bài ngữ pháp, so bản viết lại. */
  const BAY_GIO = Date.parse("2026-11-09T12:00:00Z");
  const ngayTruoc = (n) => new Date(BAY_GIO - n * 86400000).toISOString();
  const hs = gomHoSoLoi([
    { created_at: ngayTruoc(2), loi: [{ trich: "les nourriture", sua: "la nourriture", loai: "article" }, { trich: "délicieux", sua: "délicieuse", loai: "accord" }] },
    { created_at: ngayTruoc(10), loi: [{ trich: "une film", sua: "un film", loai: "article" }, { trich: "xx", sua: "yy", loai: "la" }] },
    { created_at: ngayTruoc(40), loi: [{ trich: "a", sua: "b", loai: "article" }, { trich: "c", sua: "d", loai: "accord" }, { trich: "e", sua: "f", loai: "accord" }, { trich: "g", sua: "h", loai: "temps" }] },
    { created_at: ngayTruoc(45), loi: [{ trich: "i", sua: "j", loai: "accord" }] },
    { created_at: ngayTruoc(80), loi: [{ trich: "cũ", sua: "bỏ", loai: "accord" }] },
  ], BAY_GIO);
  const theo = Object.fromEntries(hs.loai.map((o) => [o.loai, o]));
  la(hs.so_bai_30 === 2 && hs.so_bai_truoc === 2, `hoSoLoi: chia đúng hai cửa sổ 30 ngày, bỏ bài cũ hơn 60 ngày (ra ${hs.so_bai_30}/${hs.so_bai_truoc})`);
  la(hs.loai[0].loai === "article" && theo.article.dem30 === 2 && theo.article.vi_du[0].trich === "les nourriture", "hoSoLoi: xếp loại nhiều nhất trước, ví dụ mới nhất trước");
  la(theo.article.xu_huong === "tang" && theo.accord.xu_huong === "giam" && theo.temps.xu_huong === "het", "hoSoLoi: xu hướng theo số lỗi MỖI BÀI (tăng, giảm, hết)");
  la(theo.syntaxe?.dem30 === 1, "hoSoLoi: loại lỗi lạ về syntaxe");
  la(gomHoSoLoi([{ created_at: ngayTruoc(1), loi: [{ trich: "a", sua: "b", loai: "accord" }] }], BAY_GIO).loai[0].xu_huong === "moi", "hoSoLoi: chưa có bài tháng trước thì là « mới », không bịa xu hướng");
  la(baiChoLoi("temps", "B1") === "b1-temps-passe" && baiChoLoi("lexique", "A2") === null && baiChoLoi("registre", "A2") === null, "baiChoLoi: nối bài đúng trình độ, không nối bừa");
  la(capTuHoSo("Débutant") === "A1" && capTuHoSo("B1") === "B1" && capTuHoSo("") === "A2" && capTuHoSo("C2") === "C1", "capTuHoSo: đọc trình độ hồ sơ");
  const ss = soSanhBanViet(
    { goiY: { tong: 12, tong_toi_da: 25, loi: [{ trich: "une film", sua: "un film" }, { trich: "les nourriture", sua: "la nourriture" }, { trich: "c’est tres", sua: "c'est très" }] } },
    "<p>Nous avons vu un film.</p><p>Les nourriture était bonne, c'est   tres bien.</p>", { tong: 15.5, tong_toi_da: 25 });
  la(ss.da_sua.length === 1 && ss.da_sua[0].trich === "une film" && ss.con_lai.length === 2, "soSanhBanViet: lỗi còn nguyên văn (sau chuẩn hoá nháy, khoảng trắng) là chưa sửa");
  la(ss.chenh === 3.5 && ss.diem_truoc === 12 && ss.toi_da === 25, "soSanhBanViet: chênh điểm hai bản");
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);
