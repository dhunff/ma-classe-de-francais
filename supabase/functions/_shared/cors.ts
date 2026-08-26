/* Header CORS dùng chung cho mọi Edge Function.
 *
 * ══ LỖI ĐÃ TỐN NHIỀU GIỜ ĐỂ TÌM ══
 *
 * Trình duyệt gửi POST kèm header lạ thì nó hỏi trước bằng một request OPTIONS
 * (preflight): "tôi định gửi các header này, có được không?". Máy chủ trả về
 * `Access-Control-Allow-Headers`. Header nào KHÔNG có trong danh sách đó thì
 * trình duyệt **huỷ luôn request thật** — nó không bao giờ rời khỏi máy người
 * dùng.
 *
 * `supabase.functions.invoke()` luôn gửi kèm `x-client-info`. Hàm `grade` khai
 * "authorization, apikey, content-type" — thiếu đúng một cái tên. Hậu quả:
 *
 *   · Gọi bằng curl:      CHẠY  (curl không làm preflight, không có CORS)
 *   · Gọi từ ứng dụng:    CHẾT  (im lặng, không log phía máy chủ)
 *
 * Nên mọi bài thi thử đều không chấm được: 5 lượt mở ra, 0 lượt đóng lại, 0
 * dòng `answers`. Mà hàm thì hoàn toàn đúng — thử bằng curl lúc nào cũng xanh.
 *
 * Bài học: **curl không kiểm được CORS.** Muốn biết trình duyệt có gọi được
 * không thì phải gửi đúng cái preflight mà nó gửi:
 *
 *   curl -X OPTIONS "$URL/functions/v1/<tên>" \
 *     -H "Origin: https://fracile.vercel.app" \
 *     -H "Access-Control-Request-Method: POST" \
 *     -H "Access-Control-Request-Headers: authorization, x-client-info, apikey, content-type"
 *
 * `npm run check:cors` làm đúng việc đó cho mọi hàm.
 */

/* Danh sách phải chứa MỌI header trình duyệt có thể gửi:
 *   authorization  — JWT của người dùng
 *   apikey         — anon key, supabase-js luôn kèm
 *   content-type   — vì body là JSON
 *   x-client-info  — supabase-js tự thêm, đây là cái đã bị quên
 *   x-teacher-token— của riêng grant-access; để chung cho khỏi lệch nhau
 */
export const CORS_HEADERS = "authorization, apikey, content-type, x-client-info, x-teacher-token";

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": CORS_HEADERS,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
