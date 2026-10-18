import { tr } from "./i18n.jsx";

/* Tách khỏi profile.js: profile.js được bộ kiểm nạp bằng node thuần, không đọc được .jsx. */
/* Nhãn HIỂN THỊ ba thứ tiếng (18/10). Giá trị LƯU giữ nguyên tiếng Pháp như cũ:
   hồ sơ đã lưu và deXuat.js (gợi ý bài theo mục tiêu) đọc đúng các chuỗi này. */
export const nhanHoSo = (v) => ({
  "Débutant": tr("Mới bắt đầu", "Débutant", "Beginner"),
  "Étudier en France": tr("Du học Pháp", "Étudier en France", "Study in France"),
  "Travailler en français": tr("Làm việc bằng tiếng Pháp", "Travailler en français", "Work in French"),
  "Communication quotidienne": tr("Giao tiếp hằng ngày", "Communication quotidienne", "Everyday communication"),
  "Voyage": tr("Du lịch", "Voyage", "Travel"),
  "Plaisir personnel": tr("Sở thích cá nhân", "Plaisir personnel", "Personal interest"),
}[v] ?? v);

