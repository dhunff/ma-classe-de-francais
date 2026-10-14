/* Sinh báo cáo rà bảo mật (vibe-check AI-CHECKLIST, 15/10) vào security/.
 * Mỗi nhóm: reports/{NHOM}_REPORT.md + plans/{NHOM}_PLAN.md, và AUDIT_SUMMARY.md.
 * Nội dung là kết quả ĐÃ ĐO trong phiên rà ngày 15/10/2026 (xem bằng chứng từng mục). */
import { mkdirSync, writeFileSync } from "node:fs";

const N = [
  { ma: "SECRETS_EXPOSURE", muc: "PASS",
    thay: ["Không có khoá bí mật trong mã nguồn hay lịch sử git (grep sk-, sk-ant-, sk-proj-, sk_live_, AKIA, JWT service_role: 0 kết quả).",
      "`.env` được theo dõi có chủ ý, chỉ chứa VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY (vốn nằm trong bundle).",
      "`supabase/.env` (khoá thật) bị .gitignore che; `*.backup.json`, `_*.json` cũng bị che.",
      "Quét trang thật: `/.env`, `/.git/config`, file sao lưu đều không phục vụ; không có liệt kê thư mục."],
    an: ["Khoá OpenAI / SePay / TTS chỉ nằm trong Supabase secrets, đọc ở Edge Function."],
    de: ["(LOW) Chưa có `.env.example` mô tả biến cần đặt."],
    sua: [], muc_tieu: ["git ls-files không có file khoá thật", "grep mẫu khoá bí mật trả 0", "/.env trả về trang SPA, không phải file"] },
  { ma: "DATABASE_ACCESS", muc: "HIGH → đã sửa",
    thay: ["RLS BẬT trên cả 40 bảng public.",
      "(HIGH, đã sửa) Khoá ANON đọc được blob cũ `s:mcf-practice` / `s:mcf-exercises` chứa 185 đáp án của 37 bài gốc, vô hiệu hoá việc giấu answer_key (migration 022). Đo bằng curl với khoá anon.",
      "(MEDIUM, đã sửa) Mọi học sinh đăng nhập ĐỌC / SỬA / XOÁ được khoá riêng `p:…` của người khác (lịch sử luyện tập, lịch, bản nháp) vì policy kv_store chỉ xét tiền tố; học sinh còn đọc được `s:mcf-teacher-pin`.",
      "(MEDIUM, đã sửa) Bảng `exercise_access` có policy `using (true)` cho cả anon: người chưa đăng nhập liệt kê được tên học sinh + bài đã mua + số tiền.",
      "`attempts`, `answers` KHÔNG cấp INSERT/UPDATE cho authenticated (học sinh không tự sửa điểm); `profiles` chỉ giáo viên ghi."],
    an: ["Đáp án ở cột answer_key không cấp SELECT; neo đáp án (evidence) cũng khoá.", "Policy dùng is_teacher() (app_metadata) thay vì profiles.role."],
    de: ["Theo dõi khi thêm bảng mới: luôn bật RLS + policy theo auth.uid()."],
    sua: ["`supabase/migrations/144_siet_kv_store.sql`: anon chỉ đọc s:mcf-folders, s:mcf-custom-cats; học sinh không đọc blob đáp án / PIN / ghi chú giáo viên; khoá p:… chỉ chủ (đuôi khoá = profiles.name, học sinh không tự sửa được cột này) và giáo viên.",
      "`supabase/migrations/145_siet_exercise_access.sql`: exercise_access chỉ chính chủ hoặc giáo viên đọc."],
    muc_tieu: ["Khoá anon đọc s:mcf-practice → [] (ĐÃ ĐO)", "Học sinh claim giả: khoá của mình 1, của người khác 0, xoá của người khác 0, sửa của mình 1, blob đáp án 0, PIN 0 (ĐÃ ĐO)", "Giáo viên vẫn đọc 60 khoá (ĐÃ ĐO)", "Khoá anon đọc exercise_access → [] ; học sinh thấy dòng của mình 1, người khác 0 (ĐÃ ĐO)"] },
  { ma: "AUTH_MIDDLEWARE", muc: "PASS",
    thay: ["Không có server riêng: « route » là RPC Postgres + 12 Edge Function.",
      "Chỉ 5 hàm security definer anon gọi được: 3 hàm trigger (gọi trực tiếp lỗi), `gui_lien_he` (form liên hệ, có chặn lũ), `can_open_exercise`.",
      "Mọi Edge Function đọc người gọi bằng `auth.getUser(token)`; hàm quản trị (`dong-bo-sheets`, `tao-audio`, `soan-tai-lieu`) đòi app_metadata.role = 'prof' hoặc mã quản trị; `grant-access` so bí mật bằng safeEqual; `sepay-webhook` ghim HMAC.",
      "`grade` cho gọi không đăng nhập có chủ ý (chấm bài ở /decouvrir) nhưng chỉ ghi khi nhận ra người gọi, và chỉ lộ đáp án câu đã làm."],
    an: ["Hàm giáo viên (chi_tiet_hoc_sinh, gv_gia_han_vip, send_announcement…) đều kiểm is_teacher()."],
    de: ["(LOW) `tao-audio`, `soan-tai-lieu` so mã quản trị bằng `===` thay vì so thời gian hằng; rủi ro thấp qua mạng."],
    sua: [], muc_tieu: ["Không RPC dữ liệu người dùng nào gọi được bằng anon"] },
  { ma: "ACCESS_CONTROL", muc: "PASS (1 điểm LOW)",
    thay: ["Đã đọc định nghĩa các RPC nhận id: doc_goi_y_ai, save_self_assessment, ket_thuc_po, luu_po_tu_cham, exam_play_audio, exam_start, bat_dau_thi, ghi_lan_on, cham_the… đều lọc `user_id = auth.uid()` NGAY TRONG câu truy vấn (cần thiết vì security definer bỏ qua RLS).",
      "Edge Function viet-mau, cham-po, cham-pe, nhan-xet-noi kiểm bài thuộc người gọi; nhan-xet-noi so tiền tố thư mục `<uid>/`.",
      "(LOW) `ghi_chinh_ta` nhận điểm chép chính tả do trình duyệt gửi: học sinh tự khai điểm của CHÍNH mình (chỉ ảnh hưởng thống kê cá nhân)."],
    an: ["Bucket `bai-noi` riêng tư, policy so thư mục đầu với auth.uid()."],
    de: ["(LOW) Có thể chấm chính tả ở máy chủ (soCau.js đã dùng chung) thay vì nhận điểm từ client."],
    sua: [], muc_tieu: ["Mọi RPC nhận id kiểm chủ sở hữu (ĐÃ ĐỌC)"] },
  { ma: "FRONTEND_SECRETS", muc: "PASS",
    thay: ["Biến VITE_ chỉ có URL + anon key (công khai theo thiết kế Supabase).", "Mọi lời gọi AI (OpenAI) đi qua Edge Function giữ khoá ở máy chủ.", "Quét trang thật: không có source map công khai."],
    an: ["Không có khoá bên thứ ba nào trong bundle."], de: [], sua: [], muc_tieu: ["Không file .js.map được phục vụ (ĐÃ ĐO)"] },
  { ma: "SSRF", muc: "PASS",
    thay: ["Edge Function chỉ fetch tới địa chỉ cố định (OpenAI, Supabase) hoặc địa chỉ trong biến môi trường (`SHEETS_WEBHOOK_URL`). Không có tính năng tải URL do người dùng gửi."],
    an: [], de: [], sua: [], muc_tieu: ["Không fetch URL do người dùng cung cấp"] },
  { ma: "CSRF", muc: "PASS (N/A)",
    thay: ["Supabase Auth dùng Bearer token trong localStorage, không dùng cookie phiên: form chéo trang không mang theo quyền.", "Quét trang thật: không đặt cookie."],
    an: [], de: [], sua: [], muc_tieu: ["Không cookie phiên"] },
  { ma: "SECURITY_HEADERS", muc: "HIGH → đã sửa",
    thay: ["Trước: thiếu CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy (vibe-check: 3 FAIL)."],
    an: ["HSTS mạnh do Vercel cấp; HTTP → HTTPS 308."],
    de: ["(LOW) img-src cho phép mọi https (giáo viên gắn ảnh từ trang ngoài) — giữ có chủ ý.", "Có thể bỏ 'unsafe-inline' ở style-src khi không còn style nội dòng (hiện React dùng style={…} rất nhiều)."],
    sua: ["`vercel.json`: CSP (default-src 'self'; script-src 'self'; object-src 'none'; base-uri, form-action, frame-ancestors 'none'…), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy (micro chỉ self)."],
    muc_tieu: ["vibe-check quét lại: 0 FAIL (ĐÃ ĐO: fail 0, warn 1, pass 19)", "Trang giới thiệu và /decouvrir trên production: không lỗi CSP trong console (ĐÃ ĐO)"] },
  { ma: "CORS", muc: "LOW → đã sửa trang web",
    thay: ["Trước: trang và file tĩnh trả Access-Control-Allow-Origin: * (mặc định Vercel).", "Edge Function trả `*` (supabase/functions/_shared/cors.ts) nhưng xác thực bằng Bearer token, không cookie: trang lạ gọi được nhưng không mang quyền của ai."],
    an: ["Allow-Methods của Edge Function chỉ POST, OPTIONS."],
    de: ["(LOW) Có thể giới hạn origin của Edge Function về fracile.vercel.app + localhost (cần giữ preflight chạy ở môi trường dev)."],
    sua: ["`vercel.json`: Access-Control-Allow-Origin = https://fracile.vercel.app."], muc_tieu: ["Trang trả origin cụ thể (ĐÃ ĐO)"] },
  { ma: "RATE_LIMITING", muc: "LOW",
    thay: ["Đăng nhập do Supabase Auth (Google OAuth) có giới hạn sẵn.", "Mọi Edge Function tốn tiền có hạn mức: cham-pe 3/ngày, cham-po & nhan-xet-noi 6/24 giờ, cham-phat-am 20/ngày, hoi-leon 10/ngày (VIP không giới hạn), viet-mau chỉ VIP + mỗi bài một bản; gui_lien_he 3/ngày/email + 10/giờ/IP."],
    an: [], de: ["(LOW) `grade` không giới hạn lượt gọi (chỉ tốn tính toán, không tốn tiền AI).", "(LOW) Tài khoản VIP không giới hạn lượt AI: một tài khoản VIP bị lộ có thể đốt chi phí; cân nhắc trần cứng ví dụ 100 lượt/ngày."],
    sua: [], muc_tieu: ["Hàm tốn tiền đều có hạn mức (ĐÃ ĐỌC)"] },
  { ma: "SQL_INJECTION", muc: "PASS",
    thay: ["Client và Edge Function dùng supabase-js (truy vấn tham số hoá).", "SQL động chỉ có trong migration, dùng `format('%I')` với tên cố định."],
    an: [], de: [], sua: [], muc_tieu: ["Không ghép chuỗi SQL với dữ liệu người dùng"] },
  { ma: "XSS", muc: "MEDIUM → đã sửa",
    thay: ["15 chỗ dangerouslySetInnerHTML. Phần lớn hiển thị đề bài do GIÁO VIÊN soạn (tin cậy).",
      "(MEDIUM, đã sửa) Bài tự luận của HỌC SINH được hiển thị dạng HTML thô ở màn chấm của giáo viên (`TeacherScreens.jsx`) và màn chữa bài (`Student.jsx`): nộp `<img src=x onerror=…>` là chạy mã trong trình duyệt giáo viên. CSP mới đã chặn thuộc tính sự kiện, đây là lớp thứ hai."],
    an: ["Neo đáp án dựng bằng mảng React, không dùng HTML thô."],
    de: ["(LOW) Có thể lọc cả nội dung giáo viên bằng cùng hàm, phòng tài khoản giáo viên bị chiếm."],
    sua: ["`src/shared/lamSachHtml.js` (mới): giữ thẻ định dạng chữ, bỏ mọi thuộc tính và thẻ nguy hiểm (DOMParser, không chạy script).", "`src/screens/teacher/TeacherScreens.jsx`, `src/screens/student/Student.jsx`: lọc bài học sinh trước khi hiển thị."],
    muc_tieu: ["6 chuỗi tấn công (img onerror, script, javascript: href, svg onload, iframe, style) đều bị gỡ, chữ hợp lệ giữ nguyên (ĐÃ ĐO trong trình duyệt)"] },
  { ma: "PAYMENT_WEBHOOKS", muc: "PASS",
    thay: ["Dùng SePay (không phải Stripe). `sepay-webhook` GHIM công thức chữ ký HMAC (ts.raw) và trả 401 khi sai.", "Chống xử lý trùng: `exercise_access.ref` và `vip_giao_dich.ref` là unique.", "Kiểm số tiền khớp giá trước khi cấp quyền (thiếu tiền thì không cấp)."],
    an: ["check:hmac (45 ca) canh công thức chữ ký."], de: [], sua: [], muc_tieu: ["Chữ ký sai → 401; giao dịch gửi lại không cấp quyền hai lần"] },
  { ma: "FILE_UPLOADS", muc: "PASS (1 điểm LOW)",
    thay: ["Học sinh chỉ tải lên bucket `bai-noi` (riêng tư, tối đa 25 MB, giới hạn loại MIME), vào đúng thư mục `<uid>/`.", "Bucket công khai (`nghe`…) không có policy ghi: chỉ máy chủ ghi."],
    an: ["Tên file do client đặt theo khuôn `<exercise>-<mốc>.webm` trong thư mục riêng; không ai đọc được file người khác."],
    de: ["(LOW) Loại file kiểm theo MIME khai báo, không theo magic bytes; file nằm ở bucket riêng tư nên rủi ro thấp."],
    sua: [], muc_tieu: ["Không ai ngoài máy chủ ghi được bucket công khai (ĐÃ ĐO policy)"] },
  { ma: "ERROR_HANDLING", muc: "PASS",
    thay: ["Quét trang thật: trang lỗi không lộ chi tiết; không có endpoint debug / tài liệu API.", "Edge Function trả mã lỗi ngắn (CAN_VIP, HET_LUOT…), không trả stack trace."],
    an: [], de: ["(LOW) Vài hàm trả `chi_tiet` thông báo lỗi của nhà cung cấp AI (ví dụ tao-audio TTS_LOI) — chỉ hàm quản trị."], sua: [], muc_tieu: ["Không stack trace trong phản hồi"] },
  { ma: "PASSWORD_HASHING", muc: "N/A",
    thay: ["Dùng Supabase Auth (Google OAuth); ứng dụng không tự băm mật khẩu.", "Blob cũ `s:mcf-accounts` (từng chứa mật khẩu thô) hiện rỗng; script strip-account-passwords đã xoá."],
    an: [], de: [], sua: [], muc_tieu: ["Không lưu mật khẩu trong database ứng dụng"] },
  { ma: "DEPENDENCIES", muc: "MEDIUM → giảm còn LOW",
    thay: ["npm audit: 1 HIGH (@xmldom/xmldom qua mammoth) + 3 MODERATE (sprintf-js / argparse qua mammoth).", "package-lock.json được commit."],
    an: [], de: ["(LOW) 3 MODERATE còn lại trong `mammoth` (nhập file Word, chỉ giáo viên dùng); sửa đòi nâng cấp phá vỡ.", "(LOW) package.json dùng ^ (không ghim tuyệt đối); lock file bù lại."],
    sua: ["`npm audit fix`: nâng @xmldom/xmldom, hết lỗ HIGH."], muc_tieu: ["npm audit --omit=dev: 0 critical, 0 high (ĐÃ ĐO)"] },
];

mkdirSync("security/reports", { recursive: true });
mkdirSync("security/plans", { recursive: true });
const ds = (a) => (a.length ? a.map((x) => `- ${x}`).join("\n") : "- (không có)");
const so = N.map((n, i) => {
  writeFileSync(`security/reports/${n.ma}_REPORT.md`, `# ${n.ma} Security Report\n\n## Status: ${n.muc}\n\n## Findings\n\n${ds(n.thay)}\n\n## What's already secure\n\n${ds(n.an)}\n\n## Recommendations\n\n${ds(n.de)}\n`);
  writeFileSync(`security/plans/${n.ma}_PLAN.md`, `# ${n.ma} Fix Plan\n\n## Changes\n\n${ds(n.sua)}\n\n## Verification goals\n\n${n.muc_tieu.map((x) => `- [x] ${x}`).join("\n")}\n`);
  return `| ${i + 1} | ${n.ma} | ${n.muc} | [report](reports/${n.ma}_REPORT.md) | [plan](plans/${n.ma}_PLAN.md) |`;
});
writeFileSync("security/AUDIT_SUMMARY.md", `# Security Audit Summary

Date: 2026-10-15 · Công cụ: vibe-check (live scan + AI-CHECKLIST)

## Results

| # | Category | Status | Report | Plan |
|---|----------|--------|--------|------|
${so.join("\n")}

## Live scan (https://fracile.vercel.app)

- Trước: fail 3 · warn 4 · pass 7
- Sau: fail 0 · warn 1 · pass 19 (warn còn lại: img-src https có chủ ý)

## Critical / High issues

- HIGH (đã sửa, migration 144): khoá anon đọc được 185 đáp án trong blob cũ s:mcf-practice / s:mcf-exercises.
- HIGH (đã sửa, vercel.json): thiếu CSP và các header bảo mật.
- HIGH (đã sửa, npm audit fix): @xmldom/xmldom.

## Remaining manual verification

- Ctrl+F5 rồi đăng nhập Google bằng tài khoản học sinh: làm một bài luyện tập, một đề thi thử có phần nghe + ghi âm phần nói; xác nhận không có gì bị CSP chặn.
- Đăng nhập học sinh đã mua bài trả phí: bài vẫn mở (exercise_access chỉ còn đọc được dòng của chính mình).
- Mở trang Luyện tập: lịch sử « đã làm » vẫn hiện đúng (khoá p:mcf-ph-<tên> giờ chỉ chủ đọc).
- Đăng nhập giáo viên: màn chấm bài tự luận hiển thị bài học sinh bình thường.
`);
console.log("Đã ghi", N.length, "báo cáo + kế hoạch + AUDIT_SUMMARY.md");
