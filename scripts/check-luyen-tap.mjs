#!/usr/bin/env node
/* Kiểm cây Luyện tập theo trình độ: dữ liệu cây và luật tiến trình.
 * Lỗi đáng sợ nhất là NGÕ CỤT: một bước không làm được chặn mọi bước sau. */
import { KY_NANG } from "../src/content/luyenTap/kyNang.js";
import { CAP_DO, KY_LON, tinhKyNho, duongKyLon, dsBaiKyNho, tongCap, capMacDinh, baiCuaKyNang, timKyNho, NGUONG_DAT } from "../src/shared/tienTrinhLuyenTap.js";
import { hangTuTiLe, hangBai, hangKyNho, hangSau, tinhKyLon, tinhCap, THANG_HANG } from "../src/shared/hangLuyenTap.js";

let dau = 0, rot = 0;
const ca = (ten, dung) => { if (dung) dau++; else { rot++; console.log("  RỚT:", ten); } };

const moi = Object.values(KY_NANG).flatMap((c) => Object.values(c).flat());
ca("đủ 6 trình độ", CAP_DO.join() === "A1,A2,B1,B2,C1,C2");
ca("đủ 112 kỹ năng nhỏ", moi.length === 112);
ca("mã không trùng", new Set(moi.map((k) => k.ma)).size === moi.length);
ca("mỗi trình độ đủ 4 kỹ năng lớn", CAP_DO.every((c) => KY_LON.every((k) => KY_NANG[c][k]?.length > 0)));
ca("tên đủ ba thứ tiếng", moi.every((k) => k.vi && k.fr && k.en));
ca("không có dấu gạch dài", moi.every((k) => ![k.vi, k.fr, k.en].join().includes("—")));
ca("mã khớp vị trí trong cây", moi.every((k) => timKyNho(k.ma)?.kn === k));
ca("số bài kế hoạch hợp lệ", moi.every((k) => k.duKien > 0 && k.bai.length <= k.duKien));
ca("mỗi kỹ năng có bài miễn phí trong kế hoạch", moi.every((k) => k.mienPhi > 0 && k.mienPhi <= k.duKien));
const ids = moi.flatMap((k) => k.bai);
ca("một bài không nằm ở hai kỹ năng", new Set(ids).size === ids.length);

/* Dựng một cây giả từ kỹ năng A1 Nghe: mỗi kỹ năng một bài. */
const ds = KY_NANG.A1.CO;
const ex = ds.map((k, i) => ({ id: "x" + i, level: "A1", kyNang: k.ma, questions: [] }));
const xong = (id, best = 9, max = 10) => ({ [id]: { best, max, tries: 1, at: 1 } });
const buoc = (hist, bk, bai = ex) => duongKyLon("A1", "CO", bai, hist, bk).map((o) => o.buoc).join();

ca("chưa làm gì: bước 1 hiện tại, còn lại khoá", buoc({}).startsWith("hienTai,khoa,khoa"));
ca("chỉ có một bước hiện tại", buoc({}).split(",").filter((b) => b === "hienTai").length === 1);
ca("đạt bước 1 thì mở bước 2", buoc(xong("x0")).startsWith("xong,hienTai,khoa"));
ca("dưới 70% thì chưa sang bước sau", buoc(xong("x0", 6, 10)).startsWith("hienTai,khoa"));
ca("đúng 70% là đạt", tinhKyNho({ ...ds[0], bai: [] }, ex, xong("x0", 7, 10)).muc === "dat");

/* Ngõ cụt 1: kỹ năng chưa có bài không được chặn. */
const thieu = ex.filter((e) => e.id !== "x0");
ca("kỹ năng chưa có bài không chặn bước sau", buoc({}, undefined, thieu).startsWith("sapCo,hienTai"));
/* Ngõ cụt 2: bài trả phí bị khoá không được chặn. */
ca("bài khoá phí không chặn bước sau", buoc({}, (e) => e.id === "x0").startsWith("vip,hienTai"));
ca("bước VIP vẫn đếm được số bài khoá", tinhKyNho({ ...ds[0], bai: [] }, ex, {}, () => true).phi.length === 1);
ca("VIP không có bài khoá", tinhKyNho({ ...ds[0], bai: [] }, ex, {}).phi.length === 0);
/* Ngõ cụt 3: bài tự luận không có điểm vẫn tính là xong. */
ca("bài không có điểm vẫn qua được", buoc({ x0: { best: 0, max: 0, tries: 1 } }).startsWith("xong,hienTai"));
ca("bản ghi cũ best = -1 không tính điểm", tinhKyNho({ ...ds[0], bai: [] }, ex, { x0: { best: -1, max: 10, tries: 1 } }).tb === null);
ca("chưa có lượt nào thì chưa tính xong", tinhKyNho({ ...ds[0], bai: [] }, ex, { x0: { best: 9, max: 10, tries: 0 } }).muc === "chua");
ca("luôn có đường đi khi còn bài chưa đạt", tongCap("A1", ex, {}).tiepTheo?.kn.ma === "A1-CO-1");
ca("xong hết thì không còn bước tiếp theo", tongCap("A1", ex, Object.assign({}, ...ex.map((e) => xong(e.id)))).tiepTheo === null);

/* Đặc quyền VIP: không phải mở kỹ năng nhỏ lần lượt. */
const buocVip = (hist) => duongKyLon("A1", "CO", ex, hist, undefined, true).map((o) => o.buoc);
ca("VIP: không còn bước khoá", !buocVip({}).includes("khoa"));
ca("VIP: các bước sau mở sẵn, bước gợi ý vẫn là một", buocVip({}).join().startsWith("hienTai,tuDo,tuDo") && buocVip({}).filter((b) => b === "hienTai").length === 1);
ca("VIP: đạt bước sau khi chưa làm bước trước", buocVip(xong("x2")).join().startsWith("hienTai,tuDo,xong"));
ca("VIP: truyền qua tongCap", tongCap("A1", ex, {}, undefined, true).cacKy.find((k) => k.ky === "CO").duong[1].buoc === "tuDo");
ca("VIP: bước gợi ý vẫn bắt đầu từ đầu đường", tongCap("A1", ex, {}, undefined, true).tiepTheo?.kn.ma === "A1-CO-1");
ca("VIP: học sinh thường vẫn bị khoá", buoc({}).includes("khoa") && !buoc({}).includes("tuDo"));
const lamNhay = xong(ex[ex.length - 1].id);
ca("VIP: nhảy cóc không tính là đủ chứng nhận", !tinhKyLon(duongKyLon("A1", "CO", ex, lamNhay, undefined, true), lamNhay).du);

/* Thứ tự bài trong kỹ năng nhỏ. */
const hai = [{ id: "a" }, { id: "b" }, { id: "c" }];
const o2 = { bai: hai };
const tt = (hist, bk) => dsBaiKyNho(o2, hist, bk).map((b) => b.tt).join();
ca("chỉ bài đầu mở", tt({}) === "tiepTheo,khoa,khoa");
ca("xong bài đầu mở bài hai", tt(xong("a")) === "xong,tiepTheo,khoa");
ca("bài khoá phí không chặn bài sau", tt({}, (e) => e.id === "a") === "phi,tiepTheo,khoa");

ca("bài gắn qua meta không bị đếm hai lần", baiCuaKyNang({ ma: "M", bai: ["a"] }, [{ id: "a", kyNang: "M" }]).length === 1);
ca("trình độ: chọn tay thắng hồ sơ", capMacDinh("B1", "A2", [], {}) === "B1");
ca("trình độ: rơi về hồ sơ", capMacDinh(null, "A2", [], {}) === "A2");
ca("trình độ: giá trị lạ về A1", capMacDinh("xyz", "Débutant", [], {}) === "A1");
ca("trình độ: theo bài vừa làm", capMacDinh(null, null, [{ id: "a", level: "B2" }], xong("a")) === "B2");

/* Hạng S, A, B, C, D, F và chứng nhận. */
ca("hạng: đủ sáu bậc, giảm dần", THANG_HANG.map((h) => h.hang).join("") === "SABCDF" && THANG_HANG.every((h, i, a) => !i || h.tu < a[i - 1].tu));
ca("hạng: B đúng bằng ngưỡng Đạt của tiến trình", THANG_HANG.find((h) => h.hang === "B").tu === NGUONG_DAT);
ca("hạng: đúng mốc", [[1, "S"], [0.95, "S"], [0.94, "A"], [0.85, "A"], [0.84, "B"], [7 / 10, "B"], [0.69, "C"], [0.6, "C"], [0.59, "D"], [0.5, "D"], [0.49, "F"], [0, "F"]].every(([x, h]) => hangTuTiLe(x) === h));
ca("hạng: không có điểm thì không có hạng", hangTuTiLe(null) === null && hangBai({ best: 0, max: 0, tries: 1 }) === null && hangBai({ best: -1, max: 10, tries: 1 }) === null);
ca("hạng bài: lấy điểm cao nhất", hangBai({ best: 9, max: 10, tries: 3 }) === "A");
ca("hạng sau: còn bao nhiêu", hangSau(0.9)?.hang === "S" && hangSau(0.9)?.con === 5 && hangSau(0.95) === null && hangSau(0.3)?.hang === "D");
const haiBai = [{ id: "h1", kyNang: ds[0].ma }, { id: "h2", kyNang: ds[0].ma }];
const oHai = (hist) => tinhKyNho(ds[0], haiBai, hist);
ca("hạng kỹ năng: làm một phần thì chưa có hạng", hangKyNho(oHai(xong("h1"))) === null);
ca("hạng kỹ năng: làm đủ thì có hạng", hangKyNho(oHai({ ...xong("h1"), ...xong("h2", 7) })) === "B");
ca("hạng kỹ năng: tự luận không có hạng", hangKyNho(oHai({ ...xong("h1", 0, 0), ...xong("h2", 0, 0) })) === null);
const heDu = Object.assign({}, ...ex.map((e) => xong(e.id)));
const kl = (bai, hist, bk) => tinhKyLon(duongKyLon("A1", "CO", bai, hist, bk), hist);
ca("chứng nhận: đạt mọi kỹ năng nhỏ thì nhận, kèm hạng", kl(ex, heDu).du && kl(ex, heDu).hang === "A");
ca("chứng nhận: thiếu một kỹ năng thì chưa", !kl(ex, Object.assign({}, ...ex.slice(1).map((e) => xong(e.id)))).du);
ca("chứng nhận: dưới Đạt thì chưa", !kl(ex, Object.assign({}, ...ex.map((e) => xong(e.id, 5)))).du);
ca("chứng nhận: kỹ năng đang soạn thì chưa, dù đường đi không chặn", kl(ex.slice(0, -1), heDu).sapCo === 1 && !kl(ex.slice(0, -1), heDu).du);
ca("chứng nhận: kỹ năng chỉ có bài VIP không chặn", kl(ex, heDu, (e) => e.id === ex[ex.length - 1].id).du);
ca("chứng nhận: chưa làm gì thì chưa", !kl(ex, {}).du);
ca("chứng nhận: thời điểm là lần làm mới nhất", kl(ex, { ...heDu, ...{ [ex[0].id]: { best: 9, max: 10, tries: 1, at: 7 } } }).luc === 7);
ca("chứng nhận trình độ: đủ bốn kỹ năng lớn mới nhận", !tinhCap("A1", ex, heDu, () => false).du && tinhCap("A1", ex, heDu, () => false).kyLon.find((k) => k.ky === "CO").du);
const caCap = Object.values(KY_NANG.A1).flat().map((k) => ({ id: "c" + k.ma, level: "A1", kyNang: k.ma, questions: [] }));
const viet = (e) => timKyNho(e.kyNang).ky === "PE" || timKyNho(e.kyNang).ky === "PO";
const capDu = tinhCap("A1", caCap, Object.assign({}, ...caCap.map((e) => (viet(e) ? xong(e.id, 0, 0) : xong(e.id)))), () => false);
ca("chứng nhận trình độ: Viết, Nói không điểm vẫn hoàn thành, hạng từ Nghe, Đọc", capDu.du && capDu.hang === "A" && capDu.kyLon.find((k) => k.ky === "PE").hang === null);

console.log(`check:luyentap: ${dau} đạt, ${rot} rớt`);
process.exit(rot ? 1 : 0);
