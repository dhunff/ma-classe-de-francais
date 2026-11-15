/* Ngẫu nhiên có hạt giống cho PvP trò chơi (15/11, migration 214).
 * Bình thường `ngauNhien()` = Math.random. Ván đấu gọi `datHat(hat)` trước khi trò dựng đề,
 * nên hai người chơi cùng hạt nhận cùng thứ tự câu, cùng phương án; `boHat()` khi ván kết thúc.
 * Mọi trò chơi nhanh dùng hàm này thay cho Math.random. */
let sinh = null;
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const ngauNhien = () => (sinh ? sinh() : Math.random());
export const datHat = (hat) => { sinh = mulberry32(Number(hat) || 1); };
export const boHat = () => { sinh = null; };
export const hatMoi = () => 1 + Math.floor(Math.random() * 2147483645);
