/* Chia đề thi thử theo trình độ (07/10). Hàm thuần.
 *
 * Bốn trình độ DELF tout public luôn hiện, kể cả khi chưa có đề — một ô
 * « A1 · 0 đề » cho người học biết trình độ đó CÓ trong kế hoạch, chỉ chưa
 * soạn; giấu đi thì họ tưởng trang này không dành cho mình. Trình độ khác
 * (DALF C1…) chỉ hiện khi thật sự có đề. */
export const TRINH_DO_DELF = ["A1", "A2", "B1", "B2"];

export function nhomTheoTrinhDo(dsDe) {
  const thu = [...TRINH_DO_DELF];
  for (const e of dsDe) if (e.level && !thu.includes(e.level)) thu.push(e.level);
  return thu.map((level) => ({ level, de: dsDe.filter((e) => e.level === level) }));
}
