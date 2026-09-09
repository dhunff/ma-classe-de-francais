import { supabase } from "../storageShim.js";

/* Bộ thẻ do GIÁO VIÊN soạn — đường đọc của học sinh.
 *
 * Khác hẳn `shared/theGhiNho.js`: file kia là thẻ CỦA MỘT NGƯỜI, sinh từ chính
 * câu họ làm sai, có lịch SM-2. File này là thư viện bộ thẻ dùng chung, học
 * sinh chọn để luyện.
 *
 * KHÔNG có hàm ghi ở đây, và đó là chủ đích: từ migration 085 học sinh không
 * tạo được thẻ nào nữa. RLS đã chặn ở database (policy ghi đòi `is_teacher()`),
 * nên kể cả có hàm ghi ở đây thì nó cũng chỉ trả về lỗi. Không viết một hàm
 * chỉ để nó thất bại — nó sẽ mời người sau đi tìm xem "vì sao lưu không được".
 */

export { KY_NANG } from "./kyNang.js";

/* Danh sách bộ thẻ.
 *
 * Trả `null` khi KHÔNG ĐỌC ĐƯỢC, `[]` khi đọc được mà chưa có bộ nào. Hai
 * chuyện khác nhau, và gộp lại là nói "chưa có bộ nào" cho một lần mất mạng —
 * đúng lỗi mà màn « Đăng ký tư vấn » đã dính hai lần trong một ngày.
 *
 * `cong_khai` KHÔNG lọc ở đây. RLS đã lọc rồi (policy `the_bo_doc`), và lọc
 * lần nữa ở client là dựng một hàng rào thứ hai trông như hàng rào thật —
 * người sau sẽ tin vào nó và có ngày gỡ nó đi mà tưởng vô hại.
 */
export async function docCacBo() {
  const { data, error } = await supabase
    .from("the_bo")
    .select("id, ten, ky_nang, mo_ta, cong_khai, ord, tac_gia, "
          + "the_bo_the(count), profiles!the_bo_tac_gia_fkey(display_name, avatar)")
    .order("ky_nang")
    .order("ord");

  if (error) return null;

  return (data ?? []).map((b) => ({
    id: b.id,
    ten: b.ten,
    kyNang: b.ky_nang,
    moTa: b.mo_ta,
    congKhai: b.cong_khai,
    /* PostgREST trả phép đếm lồng dưới dạng [{count: n}]. Không có thẻ nào thì
       nó là mảng rỗng chứ không phải 0 — đọc thẳng `[0].count` sẽ ra undefined
       và giao diện hiện "undefined thẻ". */
    soThe: b.the_bo_the?.[0]?.count ?? 0,
    tacGia: {
      ten: b.profiles?.display_name ?? "Giáo viên",
      avatar: b.profiles?.avatar ?? null,
    },
  }));
}

/* Thẻ trong một bộ, theo đúng thứ tự giáo viên xếp. */
export async function docTheTrongBo(boId) {
  if (!boId) return null;
  const { data, error } = await supabase
    .from("the_bo_the")
    .select("id, mat_truoc, mat_sau, phien_am, vi_du, am_thanh, ord")
    .eq("bo_id", boId)
    .order("ord");

  if (error) return null;
  return (data ?? []).map((t) => ({
    id: t.id,
    matTruoc: t.mat_truoc,
    matSau: t.mat_sau,
    phienAm: t.phien_am,
    viDu: t.vi_du,
    amThanh: t.am_thanh,
  }));
}
