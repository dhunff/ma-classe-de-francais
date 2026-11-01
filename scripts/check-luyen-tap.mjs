#!/usr/bin/env node
/* Kiểm cây Luyện tập theo trình độ: dữ liệu cây và luật tiến trình.
 * Lỗi đáng sợ nhất là NGÕ CỤT: một bước không làm được chặn mọi bước sau. */
import { KY_NANG } from "../src/content/luyenTap/kyNang.js";
import { CAP_DO, KY_LON, tinhKyNho, duongKyLon, dsBaiKyNho, tongCap, capMacDinh, baiCuaKyNang, timKyNho } from "../src/shared/tienTrinhLuyenTap.js";

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

console.log(`check:luyentap: ${dau} đạt, ${rot} rớt`);
process.exit(rot ? 1 : 0);
