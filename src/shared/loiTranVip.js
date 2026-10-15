import { tr } from "./i18n.jsx";

/* Lời báo khi VIP chạm trần 100 lượt AI / ngày (migration 146, mã HET_LUOT_VIP). */
export const loiTranVip = () => tr(
  "Bạn đã dùng hết 100 lượt AI hôm nay (trần chung của gói VIP). Lượt mới mở lúc 0 giờ.",
  "Vous avez utilisé vos 100 requêtes IA du jour (plafond de l'offre VIP). Nouvelles requêtes à minuit.",
  "You've used today's 100 AI requests (VIP daily cap). New requests unlock at midnight.");
