/* Dừng hiệu ứng LẶP VÔ HẠN khi phần tử khuất khỏi màn hình (25/10, rà soát animate-ui A4).
 * Áp cho các lớp lặp tự viết trong styles/base.css. Một IntersectionObserver cho cả app;
 * MutationObserver bắt phần tử mới gắn vào DOM. Không có IntersectionObserver thì để nguyên. */
const LOP_LAP = [".mcf-lua", ".mcf-leon-bay", ".mcf-lua-nhun"];
const CHON = LOP_LAP.join(",");

export function batDungLapKhiKhuat() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((ds) => {
    for (const d of ds) d.target.style.animationPlayState = d.isIntersecting ? "running" : "paused";
  });
  const theoDoi = (goc) => {
    if (goc.nodeType !== 1) return;
    if (goc.matches?.(CHON)) io.observe(goc);
    goc.querySelectorAll?.(CHON).forEach((el) => io.observe(el));
  };
  theoDoi(document.body);
  new MutationObserver((ms) => { for (const m of ms) m.addedNodes.forEach(theoDoi); })
    .observe(document.body, { childList: true, subtree: true });
}
