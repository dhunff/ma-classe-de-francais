import { supabase } from "../storageShim.js";

/* Số liệu cho trang giới thiệu — ĐẾM THẬT, không viết cứng.
 *
 * ══ VÌ SAO KHÔNG GÕ SỐ VÀO TRANG ══
 *
 * Một con số gõ tay đúng đúng một lần: lúc gõ. Sau đó thư viện lớn lên, con số
 * đứng yên, và không có gì báo — cho tới khi ai đó đếm và thấy trang chủ nói
 * ít hơn thực tế. Hoặc tệ hơn, nói NHIỀU hơn.
 *
 * Đếm thật thì không ai phải nhớ sửa, và không ai bịa được.
 *
 * ══ ĐẾM BẰNG HEAD, KHÔNG TẢI DỮ LIỆU ══
 *
 * `head: true` + `count: "exact"` chỉ lấy con số qua header `Content-Range`.
 * Không có `head` thì mỗi lượt mở trang chủ kéo về 373 câu hỏi để rồi đếm
 * chúng ở trình duyệt — và trang giới thiệu là trang được mở nhiều nhất.
 *
 * ══ HỎNG THÌ TRẢ null, KHÔNG TRẢ 0 ══
 *
 * "Không đọc được" và "có 0 bài tập" là hai chuyện khác hẳn. Trang hiện dấu
 * gạch cho cái đầu — quy tắc 1: thà nói không biết còn hơn nói một con số sai. */
export async function docSoLieu() {
  try {
    const dem = async (bang) => {
      const { count, error } = await supabase
        .from(bang).select("id", { count: "exact", head: true });
      return error ? null : (count ?? null);
    };
    const [baiTap, cauHoi] = await Promise.all([dem("exercises"), dem("questions")]);
    if (baiTap == null && cauHoi == null) return null;
    return { baiTap, cauHoi };
  } catch {
    return null;
  }
}
