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
import { locLoi, locYeuCau } from "./loiViet.js";

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
export function kiemGoiY(tho, rubric, van = null) {
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

    /* Trường nhận xét mở rộng (08/10): điểm mạnh, cần cải thiện, trích dẫn.
       Tuỳ chọn — thiếu thì để chuỗi rỗng, KHÔNG làm hỏng tiêu chí. */
    const chu = (k, n) => (typeof o === "object" && o[k] != null ? String(o[k]).trim().slice(0, n) : "");
    tieu_chi[c.id] = {
      diem_manh: chu("diem_manh", 400),
      can_cai_thien: chu("can_cai_thien", 400),
      trich_dan: chu("trich_dan", 300),
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
      /* Mở rộng 08/10, đều tuỳ chọn và bị cắt độ dài. */
      /* 09/10: lời động viên của Leon, tuỳ chọn. */
      loi_leon: gonLoiLeon(tho.loi_leon),
      nhan_dinh_trinh_do: String(tho.nhan_dinh_trinh_do ?? "").trim().slice(0, 400),
      uu_tien: (Array.isArray(tho.uu_tien) ? tho.uu_tien : []).map((x) => String(x).trim().slice(0, 300)).filter(Boolean).slice(0, 3),
      cau_mau: (Array.isArray(tho.cau_mau) ? tho.cau_mau : [])
        .filter((x) => x && typeof x === "object" && x.goc && x.sua)
        .map((x) => ({ goc: String(x.goc).trim().slice(0, 300), sua: String(x.sua).trim().slice(0, 300), vi_sao: String(x.vi_sao ?? "").trim().slice(0, 200) }))
        .slice(0, 3),
      /* 06/11 (giai đoạn 1): lỗi tô trong bài và đối chiếu yêu cầu của đề. Chỉ có khi máy chủ
         truyền `van` (chữ thuần của bài); lỗi không nằm nguyên văn trong bài thì bị bỏ. */
      ...(van != null ? phanLoiVaYeuCau(tho, van) : {}),
    },
  };
}

function phanLoiVaYeuCau(tho, van) {
  const { loi, bo } = locLoi(tho.loi, van);
  return { loi, loi_bo: bo, yeu_cau: locYeuCau(tho.yeu_cau) };
}

/* Nhận xét bài viết ở màn LUYỆN TẬP (06/11): không có thang DELF, không có điểm (bài luyện viết
   tự do vốn không chấm điểm). Phải có ít nhất tổng quát hoặc một lỗi hoặc một yêu cầu, không thì
   coi như mô hình trả rỗng. */
/* Lời Léon: giao diện đã có ảnh và tên Léon, nên bỏ chữ ký mô hình hay tự thêm ở cuối
   (« — Leon », « - Léon »). Nội dung học không dùng « — » (quy ước FRACILE): đổi thành dấu phẩy. */
export function gonLoiLeon(v) {
  return String(v ?? "").trim()
    .replace(/\s*[—–-]\s*L[ée]on\s*[.!]?\s*$/i, "")
    .replace(/\s*—\s*/g, ", ")
    .trim().slice(0, 400);
}

export function kiemNhanXetLuyen(tho, van) {
  if (!tho || typeof tho !== "object") return { ok: false, ly_do: "khong-phai-object", goiY: null };
  const chu = (v, n) => String(v ?? "").trim().slice(0, n);
  const ds = (v, n, m) => (Array.isArray(v) ? v : []).map((x) => chu(x, m)).filter(Boolean).slice(0, n);
  const goiY = {
    loai: "luyen",
    tong_quat: chu(tho.tong_quat, 1200),
    nhan_dinh_trinh_do: chu(tho.nhan_dinh_trinh_do, 400),
    diem_manh: ds(tho.diem_manh, 3, 300),
    uu_tien: ds(tho.uu_tien, 3, 300),
    loi_leon: gonLoiLeon(tho.loi_leon),
    cau_mau: (Array.isArray(tho.cau_mau) ? tho.cau_mau : [])
      .filter((x) => x && typeof x === "object" && x.goc && x.sua)
      .map((x) => ({ goc: chu(x.goc, 300), sua: chu(x.sua, 300), vi_sao: chu(x.vi_sao, 200) }))
      .slice(0, 3),
    ...phanLoiVaYeuCau(tho, van),
  };
  if (!goiY.tong_quat && !goiY.loi.length && !goiY.yeu_cau.length) return { ok: false, ly_do: "rong", goiY: null };
  return { ok: true, goiY };
}

/* Chấm bài viết ở màn LUYỆN TẬP (06/11, bản 2, theo chủ dự án): AI tự chấm ngay sau khi nộp,
 * CÓ điểm theo thang DELF đúng trình độ của bài, kèm hai phần chỉ luyện tập mới có:
 *  · tang_diem: tối đa 3 việc cụ thể để lên điểm, mỗi việc gắn MỘT tiêu chí và số điểm có thể
 *    thêm. Số điểm kẹp trong phần còn trống của tiêu chí đó (đây là ước lượng, không phải điểm
 *    chấm, nên kẹp được); tiêu chí lạ hoặc đã tối đa thì bỏ.
 *  · bai_sua: chính bài của học sinh viết lại cho đúng và tốt hơn ở trình độ đó, giữ ý của họ.
 *    Thay cho « đáp án gợi ý » chung của đề: gợi ý theo BÀI LÀM, không theo một bài mẫu. */
export function kiemChamLuyen(tho, rubric, van) {
  const kq = kiemGoiY(tho, rubric, van);
  if (!kq.ok) return kq;
  const g = kq.goiY;
  const theoId = new Map(rubric.criteria.map((c) => [c.id, c]));
  const daCo = new Set();
  const tang_diem = (Array.isArray(tho.tang_diem) ? tho.tang_diem : [])
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const id = String(x.tieu_chi ?? "");
      const c = theoId.get(id); const t = g.tieu_chi[id];
      const viec = String(x.viec ?? x.lam_gi ?? "").trim().slice(0, 300);
      if (!c || !t || !viec || daCo.has(id)) return null;
      const con = lamTronBuoc(Number(c.max_score) - t.diem, c.step ?? 0.5);
      if (!(con > 0)) return null;
      const them = Math.min(con, Math.max(0.5, lamTronBuoc(Number(x.them) || 0.5, c.step ?? 0.5)));
      daCo.add(id);
      return { tieu_chi: id, viec, them };
    })
    .filter(Boolean)
    .sort((a, b) => b.them - a.them)
    .slice(0, 3);
  const bai_sua = String(tho.bai_sua ?? "").replace(/\r/g, "").trim().slice(0, 3000);
  return { ...kq, goiY: { loai: "luyen", ...g, tang_diem, bai_sua } };
}

/* ══ CHẤM HAI LƯỢT (06/11, giai đoạn 2) ══
 *
 * Như double correction của DELF: hai giám khảo chấm độc lập, điểm cuối là trung bình. Hai lượt
 * lệch LỚN (một tiêu chí lệch quá 1 điểm, tức quá một mốc barème, hoặc tổng lệch quá 2,5) thì chấm
 * lượt thứ ba và lấy TRUNG VỊ từng tiêu chí: lượt lạc loài bị loại thay vì kéo trung bình đi.
 * Ba lượt mà vẫn không có hai lượt nào gần nhau thì gắn cờ `chua_chac`: điểm vẫn hiện, nhưng nói
 * thật là máy chấm không chắc, thay vì giả vờ chắc chắn.
 *
 * Mỗi lượt là JSON thô của mô hình: { tieu_chi: { id: số | { diem } } }. Điểm ngoài khung hoặc
 * không phải số thì lượt đó coi như không chấm tiêu chí ấy (cùng nguyên tắc với kiemGoiY). */
export const LECH_TIEU_CHI = 1;
export const LECH_TONG = 2.5;

function diemCuaLuot(tho, rubric) {
  const nguon = tho?.tieu_chi ?? tho?.criteria ?? tho ?? {};
  const ra = {};
  for (const c of rubric.criteria) {
    const o = nguon?.[c.id];
    const d = Number(o != null && typeof o === "object" ? (o.diem ?? o.score ?? o.note) : o);
    const max = Number(c.max_score);
    if (o != null && Number.isFinite(d) && d >= 0 && d <= max) ra[c.id] = lamTronBuoc(d, c.step ?? 0.5);
  }
  return ra;
}

export function gopDiemNhieuLuot(rubric, dsTho) {
  const luot = (dsTho ?? []).filter(Boolean).map((t) => diemCuaLuot(t, rubric)).filter((l) => Object.keys(l).length > 0);
  const diem = {};
  let lech_lon_nhat = 0;
  let lechTieuChi = false;
  let khongCapNao = false;
  for (const c of rubric.criteria) {
    const ds = luot.map((l) => l[c.id]).filter((x) => x != null).sort((a, b) => a - b);
    if (!ds.length) continue;
    const step = c.step ?? 0.5;
    diem[c.id] = ds.length === 1 ? ds[0]
      : ds.length === 2 ? lamTronBuoc((ds[0] + ds[1]) / 2, step)
      : ds[Math.floor(ds.length / 2)];
    const lech = ds[ds.length - 1] - ds[0];
    lech_lon_nhat = Math.max(lech_lon_nhat, lech);
    if (lech > LECH_TIEU_CHI) lechTieuChi = true;
    if (ds.length >= 3 && !ds.some((x, i) => i > 0 && x - ds[i - 1] <= LECH_TIEU_CHI)) khongCapNao = true;
  }
  const tong_cac_luot = luot.map((l) => lamTronBuoc(Object.values(l).reduce((n, x) => n + x, 0), 0.5));
  const tt = [...tong_cac_luot].sort((a, b) => a - b);
  const lechTong = tt.length >= 2 && tt[tt.length - 1] - tt[0] > LECH_TONG;
  const tongKhongCap = tt.length >= 3 && !tt.some((x, i) => i > 0 && x - tt[i - 1] <= LECH_TONG);
  return {
    diem,
    so_luot: luot.length,
    tong_cac_luot,
    lech_lon_nhat,
    can_luot_ba: luot.length === 2 && (lechTieuChi || lechTong),
    chua_chac: luot.length >= 3 && (khongCapNao || tongKhongCap),
  };
}

/* Đặt điểm đã gộp vào JSON của lượt 1 (lượt có nhận xét), để kiemGoiY / kiemChamLuyen kiểm và
   cộng như mọi khi. Nhận xét của lượt 1 giữ nguyên; tiêu chí lượt 1 bỏ trống mà lượt khác có điểm
   thì vẫn có điểm, chỉ không có lời nhận xét. */
export function ganDiemGop(tho, diem) {
  const nguon = tho?.tieu_chi ?? tho?.criteria ?? {};
  const tieu_chi = {};
  for (const [id, d] of Object.entries(diem)) {
    const o = nguon[id];
    tieu_chi[id] = { ...(o && typeof o === "object" ? o : {}), diem: d };
  }
  return { ...tho, tieu_chi };
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
