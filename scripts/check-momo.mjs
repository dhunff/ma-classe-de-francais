/* check:momo (17/11/2026): thanh toán VIP qua MoMo.
 *   1. Chuỗi ký tạo đơn đúng 10 khoá, đúng thứ tự bảng chữ cái như mã mẫu chính thức của MoMo
 *      (github.com/momo-wallet/payment, nodejs/MoMo.js).
 *   2. HMAC-SHA256 ra đúng giá trị của một véc-tơ chuẩn (RFC 4231, ca 2), và đổi một ký tự là lệch.
 *   3. Chữ ký IPN: thứ tự khoá trong thân không đổi kết quả, sửa số tiền là lệch, `signature` không bị ký.
 *   4. Giá, mã, số ngày gói VIP khớp nhau ở BA chỗ: src/shared/vip.js, sepay-webhook, _shared/momoXacNhan.ts.
 *   5. momo-ipn không tự cấp VIP từ nội dung IPN: phải đi qua xacNhanDon (tra cứu lại MoMo). */
import { readFileSync } from "node:fs";
import { chuoiTaoDon, chuoiTraCuu, chuoiIpn, hmacHex, bangNhau, maDonMoi } from "../supabase/functions/_shared/momo.js";
import { VIP } from "../src/shared/vip.js";

let dat = 0, hong = 0;
const ca = (ten, dk) => { if (dk) dat++; else { hong++; console.log("  ✗ " + ten); } };

const dl = { partnerCode: "P", accessKey: "A", requestId: "R", amount: 99000, orderId: "O", orderInfo: "I", redirectUrl: "https://r", ipnUrl: "https://i", extraData: "", requestType: "captureWallet" };
ca("chuỗi tạo đơn đúng thứ tự mã mẫu MoMo",
  chuoiTaoDon(dl) === "accessKey=A&amount=99000&extraData=&ipnUrl=https://i&orderId=O&orderInfo=I&partnerCode=P&redirectUrl=https://r&requestId=R&requestType=captureWallet");
ca("chuỗi tạo đơn bỏ khoá lạ (lang, autoCapture không được ký)", !chuoiTaoDon({ ...dl, lang: "vi", autoCapture: true }).includes("lang="));
ca("chuỗi tra cứu đúng 4 khoá", chuoiTraCuu({ accessKey: "A", orderId: "O", partnerCode: "P", requestId: "R" }) === "accessKey=A&orderId=O&partnerCode=P&requestId=R");

ca("HMAC-SHA256 khớp RFC 4231 ca 2", (await hmacHex("Jefe", "what do ya want for nothing?")) === "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
const k1 = await hmacHex("bi-mat", chuoiTaoDon(dl)), k2 = await hmacHex("bi-mat", chuoiTaoDon({ ...dl, amount: 99001 }));
ca("đổi số tiền là đổi chữ ký", k1 !== k2 && !bangNhau(k1, k2) && bangNhau(k1, k1));

const ipn = { partnerCode: "P", orderId: "FRM1", requestId: "FRM1", amount: 99000, orderInfo: "I", orderType: "momo_wallet", transId: 123, resultCode: 0, message: "ok", payType: "qr", responseTime: 1, extraData: "" };
const kyIpn = await hmacHex("bi-mat", chuoiIpn(ipn, "A"));
const daoThuTu = Object.fromEntries(Object.entries(ipn).reverse());
ca("IPN: thứ tự khoá trong thân không đổi chữ ký", (await hmacHex("bi-mat", chuoiIpn({ ...daoThuTu, signature: kyIpn }, "A"))) === kyIpn);
ca("IPN: sửa số tiền là lệch", (await hmacHex("bi-mat", chuoiIpn({ ...ipn, amount: 1 }, "A"))) !== kyIpn);
ca("IPN: có accessKey trong chuỗi, không có signature", chuoiIpn({ ...ipn, signature: "x" }, "A").startsWith("accessKey=A&") && !chuoiIpn({ ...ipn, signature: "x" }, "A").includes("signature="));
ca("mã đơn khớp mẫu FRM màn trả về nhận ra", /^FRM[0-9A-Z]+$/.test(maDonMoi()));

const sepay = readFileSync("supabase/functions/sepay-webhook/index.ts", "utf8");
const xn = readFileSync("supabase/functions/_shared/momoXacNhan.ts", "utf8");
const so = (src, ten) => (src.match(new RegExp(`const ${ten} = "?([0-9A-Z]+)"?;`)) || [])[1];
for (const [ten, gt] of [["VIP_MA", VIP.ma], ["VIP_GIA", String(VIP.gia)], ["VIP_NGAY", String(VIP.ngay)]]) {
  ca(`${ten} khớp vip.js ở sepay-webhook`, so(sepay, ten) === gt);
  ca(`${ten} khớp vip.js ở momoXacNhan`, so(xn, ten) === gt);
}

const boChuThich = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").split(/\r?\n/).filter((d) => !d.trim().startsWith("//")).join("\n");
const ipnSrc = boChuThich(readFileSync("supabase/functions/momo-ipn/index.ts", "utf8"));
ca("momo-ipn không gọi gia_han_vip trực tiếp", !ipnSrc.includes("gia_han_vip"));
ca("momo-ipn xác nhận qua xacNhanDon", ipnSrc.includes("xacNhanDon("));
ca("xacNhanDon cấp VIP chỉ sau tra cứu", /const kq = await traCuu\([\s\S]*resultCode === 0[\s\S]*gia_han_vip/.test(boChuThich(xn)));
const donSrc = boChuThich(readFileSync("supabase/functions/momo-don/index.ts", "utf8"));
ca("momo-don không nhận số tiền từ trình duyệt", !/than\??\.(amount|so_tien|soTien|gia)/.test(donSrc));

console.log(`\n${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);
