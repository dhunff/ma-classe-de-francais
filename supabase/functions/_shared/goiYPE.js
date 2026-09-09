/* Kiểm và làm sạch gợi ý chấm PE do mô hình trả về.
 *
 * ══ VÌ SAO TÁCH RA MỘT FILE THUẦN ══
 *
 * Đây là chỗ duy nhất trong cả tính năng có thể hỏng ÂM THẦM. Lời gọi mạng
 * hỏng thì có mã lỗi; khoá API sai thì có 401. Nhưng một mô hình trả về
 * `{"grammaire": 8}` cho một tiêu chí tối đa 5 điểm thì mọi thứ vẫn "chạy" —
 * và học sinh đọc một gợi ý vượt khung mà không ai báo gì.
 *
 * Hàm thuần thì chạy được ở Node, nên `npm run check:champe` gọi thẳng vào
 * đây. Nhét logic này vào giữa Edge Function thì nó chỉ chạy được trên
 * production, và cách duy nhất để thử một khuôn hỏng là chờ mô hình hỏng thật.
 *
 * KHÔNG có bản sao ở src/. Client không cần kiểm lại: mọi gợi ý tới được
 * trình duyệt đều đã đi qua đây rồi mới ghi vào `pe_ai_goi_y`. Một bản sao là
 * một chỗ để hai bên trôi khỏi nhau — dự án đã nuôi `check:parity` cho đúng
 * một cặp như thế rồi, không thêm cặp thứ hai nếu không bắt buộc.
 */

/* Làm tròn về bội của `step` (thang DELF dùng 0,5).
   Nhân lên rồi chia xuống: 0.1+0.2 trong dấu phẩy động ra 0.30000000000000004,
   và một điểm số hiện ra như vậy trên màn hình đọc như phần mềm hỏng. */
export function lamTronBuoc(v, step = 0.5) {
  const s = Number(step) > 0 ? Number(step) : 0.5;
  return Math.round(Number(v) / s) * s;
}

/* Kiểm gợi ý thô so với rubric.
 *
 * Trả về { ok, goiY, bo, ly_do } — KHÔNG ném lỗi. Một tiêu chí hỏng không nên
 * làm mất cả gợi ý cho chín tiêu chí còn lại, và `bo` nói ra tiêu chí nào bị
 * loại để giao diện hiện được điều đó thay vì im lặng thiếu một dòng.
 *
 * Nguyên tắc: THIẾU thì bỏ, đừng đoán. Một tiêu chí không có điểm hiện ra là
 * "AI không chấm mục này" — trung thực, và học sinh tự chấm mục đó như trước.
 * Điền 0 vào chỗ mô hình im lặng là bịa ra một nhận định.
 */
export function kiemGoiY(tho, rubric) {
  if (!tho || typeof tho !== "object") {
    return { ok: false, ly_do: "khong-phai-object", goiY: null, bo: [] };
  }
  if (!rubric || !Array.isArray(rubric.criteria) || rubric.criteria.length === 0) {
    return { ok: false, ly_do: "rubric-rong", goiY: null, bo: [] };
  }

  /* Mô hình có thể trả tiêu chí ở `tieu_chi`, `criteria`, hoặc phẳng ngay gốc.
     Nhận cả ba: đây là chỗ để dễ tính, vì một khuôn lồng khác đi không phải
     một nhận định sai — nó chỉ là một cách gói khác. */
  const nguon = tho.tieu_chi ?? tho.criteria ?? tho;
  if (!nguon || typeof nguon !== "object") {
    return { ok: false, ly_do: "khong-tim-thay-tieu-chi", goiY: null, bo: [] };
  }

  const tieu_chi = {};
  const bo = [];
  let tong = 0;
  let tong_toi_da = 0;

  for (const c of rubric.criteria) {
    const max = Number(c.max_score);
    if (!Number.isFinite(max) || max <= 0) { bo.push({ id: c.id, vi_sao: "max-hong" }); continue; }
    tong_toi_da += max;

    const o = nguon[c.id];
    if (o == null) { bo.push({ id: c.id, vi_sao: "thieu" }); continue; }

    /* Chấp nhận cả `{diem: 3}` lẫn `3` trần. */
    const thoDiem = (typeof o === "object") ? (o.diem ?? o.score ?? o.note) : o;
    const d = Number(thoDiem);
    if (!Number.isFinite(d)) { bo.push({ id: c.id, vi_sao: "khong-phai-so" }); continue; }

    /* VƯỢT KHUNG THÌ BỎ, KHÔNG KẸP VỀ BIÊN.
       Kẹp 8 về 5 sẽ tạo ra một điểm tuyệt đối cho một tiêu chí mà mô hình rõ
       ràng đã hiểu sai thang — và nó trông y hệt một điểm 5 được chấm cẩn
       thận. Âm cũng vậy. Cái ta muốn ở đây là biết mình không biết. */
    if (d < 0 || d > max) { bo.push({ id: c.id, vi_sao: "ngoai-khung" }); continue; }

    const diem = lamTronBuoc(d, c.step ?? 0.5);
    const nx = (typeof o === "object") ? (o.nhan_xet ?? o.comment ?? o.feedback) : null;

    tieu_chi[c.id] = {
      diem,
      /* Cắt ở 600 ký tự. Không phải để tiết kiệm chỗ mà vì một nhận xét dài
         hơn cả bài viết thì không ai đọc, và nó đẩy thang chấm ra khỏi màn. */
      nhan_xet: nx == null ? "" : String(nx).trim().slice(0, 600),
    };
    tong += diem;
  }

  const soChamDuoc = Object.keys(tieu_chi).length;
  if (soChamDuoc === 0) {
    return { ok: false, ly_do: "khong-tieu-chi-nao-hop-le", goiY: null, bo };
  }

  return {
    ok: true,
    bo,
    goiY: {
      tieu_chi,
      /* `tong` chỉ cộng những tiêu chí CHẤM ĐƯỢC, và `tong_toi_da` là của cả
         thang. Hai số khác gốc nhau thì giao diện phải nói rõ — xem chú thích
         ở PESelfEvaluation. Gộp thành một tỷ lệ phần trăm ở đây là giấu đi
         chuyện gợi ý này thiếu mấy mục. */
      tong: lamTronBuoc(tong, 0.5),
      tong_toi_da,
      so_cham_duoc: soChamDuoc,
      so_tieu_chi: rubric.criteria.length,
      tong_quat: String(tho.tong_quat ?? tho.overall ?? "").trim().slice(0, 1500),
    },
  };
}

/* Bóc JSON ra khỏi câu trả lời của mô hình.
 *
 * Kể cả khi đã yêu cầu "chỉ JSON", mô hình vẫn có lúc bọc trong ```json fence
 * hoặc thêm một câu dẫn. Thử ba lớp thay vì để cả tính năng chết vì ba dấu
 * huyền. */
export function bocJSON(text) {
  const s = String(text ?? "").trim();
  if (!s) return null;

  const thu = (x) => { try { return JSON.parse(x); } catch { return null; } };

  const thang = thu(s);
  if (thang) return thang;

  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { const v = thu(fence[1].trim()); if (v) return v; }

  /* Lớp cuối: lấy từ dấu { đầu tiên tới } cuối cùng. Thô, nhưng nó cứu đúng
     trường hợp "Đây là kết quả: {…}" mà không đoán gì về nội dung. */
  const dau = s.indexOf("{"), cuoi = s.lastIndexOf("}");
  if (dau >= 0 && cuoi > dau) return thu(s.slice(dau, cuoi + 1));

  return null;
}
