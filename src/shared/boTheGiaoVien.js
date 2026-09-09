import { supabase } from "../storageShim.js";

/* Đường GHI bộ thẻ — chỉ giáo viên.
 *
 * Mọi phép chặn thật nằm ở RLS (migration 085): policy insert/update/delete
 * trên `the_bo` và `the_bo_the` đều đòi `is_teacher()`, vốn đọc `app_metadata`
 * — chỗ người dùng không tự sửa được. File này KHÔNG kiểm quyền lần nữa; kiểm
 * ở client là dựng một hàng rào trông như hàng rào thật, và người sau sẽ tin
 * vào nó.
 *
 * Việc của file này là dịch lỗi thành câu đọc được, và trả về hình dạng mà
 * giao diện dùng được ngay.
 */

/* PostgREST trả mã `42501` cho vi phạm RLS. Nói đúng chuyện đó thay vì
   "không lưu được": hai nguyên nhân khác hẳn nhau và cách xử lý cũng vậy. */
function dichLoi(error) {
  if (!error) return null;
  if (error.code === "42501") {
    return "Máy chủ không cho tài khoản này ghi bộ thẻ. Đăng xuất rồi đăng nhập lại; "
         + "nếu vẫn vậy thì phiên hiện tại không có vai giáo viên.";
  }
  if (error.code === "23514") {
    return "Dữ liệu không hợp lệ — tên bộ phải từ 1 đến 120 ký tự, mặt trước tối đa 500.";
  }
  return error.message ?? "Không lưu được.";
}

/* Bộ thẻ của màn soạn — đọc CẢ bộ nháp. RLS cho giáo viên thấy hết
   (`cong_khai or is_teacher()`), nên không cần lọc gì thêm ở đây. */
export async function docBoDeSoan() {
  const { data, error } = await supabase
    .from("the_bo")
    .select("id, ten, ky_nang, mo_ta, cong_khai, ord, created_at, the_bo_the(count)")
    .order("ky_nang").order("ord");

  if (error) return null;
  return (data ?? []).map((b) => ({
    id: b.id, ten: b.ten, kyNang: b.ky_nang, moTa: b.mo_ta,
    congKhai: b.cong_khai, ord: b.ord,
    /* Đếm lồng của PostgREST là [{count:n}]; bộ chưa có thẻ nào thì mảng RỖNG
       chứ không phải 0, nên đọc thẳng [0].count sẽ ra undefined. */
    soThe: b.the_bo_the?.[0]?.count ?? 0,
  }));
}

export async function taoBo({ ten, kyNang, moTa }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, loi: "Phiên đăng nhập đã hết hạn." };

  const { data, error } = await supabase
    .from("the_bo")
    .insert({ ten: String(ten).trim(), ky_nang: kyNang, mo_ta: moTa || null, tac_gia: user.id })
    .select("id").single();

  return error ? { ok: false, loi: dichLoi(error) } : { ok: true, id: data.id };
}

export async function suaBo(id, thayDoi) {
  const co = {};
  if (thayDoi.ten !== undefined) co.ten = String(thayDoi.ten).trim();
  if (thayDoi.moTa !== undefined) co.mo_ta = thayDoi.moTa || null;
  if (thayDoi.kyNang !== undefined) co.ky_nang = thayDoi.kyNang;
  if (thayDoi.congKhai !== undefined) co.cong_khai = !!thayDoi.congKhai;

  const { error } = await supabase.from("the_bo").update(co).eq("id", id);
  return error ? { ok: false, loi: dichLoi(error) } : { ok: true };
}

export async function xoaBo(id) {
  /* `the_bo_the` khoá ngoại ON DELETE CASCADE, nên thẻ trong bộ đi theo. Đó là
     chủ đích — một bộ bị xoá mà để lại thẻ mồ côi thì chúng không bao giờ hiện
     ở đâu nữa và cũng không ai dọn được. */
  const { error } = await supabase.from("the_bo").delete().eq("id", id);
  return error ? { ok: false, loi: dichLoi(error) } : { ok: true };
}

export async function docTheDeSoan(boId) {
  const { data, error } = await supabase
    .from("the_bo_the")
    .select("id, mat_truoc, mat_sau, phien_am, vi_du, ord")
    .eq("bo_id", boId).order("ord");

  if (error) return null;
  return (data ?? []).map((t) => ({
    id: t.id, matTruoc: t.mat_truoc, matSau: t.mat_sau,
    phienAm: t.phien_am, viDu: t.vi_du, ord: t.ord,
  }));
}

export async function themThe(boId, the, ord) {
  const { error } = await supabase.from("the_bo_the").insert({
    bo_id: boId,
    mat_truoc: String(the.matTruoc).trim(),
    mat_sau: String(the.matSau).trim(),
    phien_am: the.phienAm?.trim() || null,
    vi_du: the.viDu?.trim() || null,
    ord: ord ?? 0,
  });
  return error ? { ok: false, loi: dichLoi(error) } : { ok: true };
}

export async function xoaThe(id) {
  const { error } = await supabase.from("the_bo_the").delete().eq("id", id);
  return error ? { ok: false, loi: dichLoi(error) } : { ok: true };
}

/* Nhập nhiều thẻ một lượt, mỗi dòng một thẻ: `mặt trước | mặt sau | phiên âm`.
 *
 * Gõ từng thẻ qua form là việc không ai làm quá mười lần — cùng lý do trình
 * soạn đề (Builder) nhận cả khối JSON thay vì bắt bấm từng ô. Một bộ 30 thẻ
 * dán một lần là xong.
 *
 * Trả về CẢ danh sách dòng hỏng kèm SỐ DÒNG, không im lặng bỏ qua: dán 30 dòng
 * mà vào 28 thẻ, không ai nói gì, là hai thẻ mất tích không dấu vết.
 */
export function bocDong(van) {
  const dong = String(van ?? "").split(/\r?\n/);
  const duoc = [];
  const hong = [];

  dong.forEach((d, i) => {
    const s = d.trim();
    if (!s) return;                       // dòng trống bỏ qua, không tính là hỏng
    const phan = s.split("|").map((x) => x.trim());
    if (phan.length < 2 || !phan[0] || !phan[1]) {
      hong.push({ dong: i + 1, van: s.slice(0, 60) });
      return;
    }
    duoc.push({ matTruoc: phan[0], matSau: phan[1], phienAm: phan[2] || null });
  });

  return { duoc, hong };
}
