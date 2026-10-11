/* Chặn DÁN vào ô trả lời bài viết / nghị luận (14/10, theo chủ dự án).
 *
 * Bài viết phải do chính học sinh gõ: dán từ AI hay từ trang khác là bỏ qua
 * đúng thứ bài thi đo. Chặn cả dán (Ctrl+V, menu chuột phải) lẫn KÉO-THẢ chữ
 * vào ô. Không chặn sao chép RA khỏi ô, và không áp cho ô chép câu chứng minh
 * Vrai/Faux (« recopiez la phrase » là chép lại, không phải tự viết).
 *
 * Đây là rào ở giao diện, không phải bảo mật: ai cố ý vẫn gõ lại được từ chỗ
 * khác. Mục tiêu là bỏ đường tắt, và nói rõ lý do khi bị chặn. */
export function chanDan(baoLoi) {
  const chan = (e) => { e.preventDefault(); baoLoi?.(); };
  return { onPaste: chan, onDrop: chan };
}
