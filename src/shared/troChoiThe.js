/* Sinh lượt chơi từ thẻ của một bộ flashcard — hàm THUẦN, không import gì,
 * để kiểm được bằng node và xem thử được ở /preview.html.
 *
 * Mọi câu hỏi dựng từ thẻ THẬT giáo viên soạn (the_bo_the); phương án nhiễu
 * lấy từ các thẻ khác CÙNG lượt chơi, không bịa từ nào.
 *
 * Ba kiểu câu:
 *   nghia  — hiện mặt trước (tiếng Pháp), chọn nghĩa đúng trong 4
 *   phap   — hiện mặt sau (tiếng Việt), chọn cụm tiếng Pháp đúng trong 4
 *   ghep   — ghép 4 cặp Pháp ↔ Việt (một câu, cuối lượt)
 */

export const SO_TIM = 3;

function xao(mang, rand) {
  const a = [...mang];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Hai thẻ trùng nội dung một mặt thì không dùng được làm nhiễu cho nhau —
   học sinh chọn « sai » mà thật ra đúng. Lọc theo chữ đã chuẩn hoá. */
const chuan = (s) => String(s || "").trim().toLowerCase();

function phuongAn(the, tatCa, mat, rand) {
  const dung = the[mat];
  const nhieu = xao(tatCa.filter((x) => x.id !== the.id && chuan(x[mat]) !== chuan(dung)), rand);
  const daCo = new Set([chuan(dung)]);
  const chon = [];
  for (const x of nhieu) {
    if (chon.length >= 3) break;
    if (daCo.has(chuan(x[mat]))) continue;
    daCo.add(chuan(x[mat]));
    chon.push(x[mat]);
  }
  return xao([dung, ...chon], rand);
}

/* `soCau`: số câu trắc nghiệm (chưa tính câu ghép). Bộ ít thẻ thì lặp lại
   thẻ theo chiều hỏi ngược lại chứ không bịa thêm. */
export function sinhLuot(tatCaThe, { soCau = 8, ghep = true, rand = Math.random } = {}) {
  const the = tatCaThe.filter((x) => chuan(x.matTruoc) && chuan(x.matSau));
  if (the.length < 4) return [];
  const thu = xao(the, rand);
  const cau = [];
  for (let i = 0; i < soCau; i++) {
    const x = thu[i % thu.length];
    const kieu = (i + Math.floor(i / thu.length)) % 2 === 0 ? "nghia" : "phap";
    const mat = kieu === "nghia" ? "matSau" : "matTruoc";
    cau.push({
      kieu,
      de: kieu === "nghia" ? x.matTruoc : x.matSau,
      viDu: x.viDu || null,
      dung: x[mat],
      luaChon: phuongAn(x, the, mat, rand),
    });
  }
  if (ghep) {
    const cap = xao(the, rand).slice(0, 4);
    cau.push({
      kieu: "ghep",
      trai: cap.map((x) => ({ id: x.id, chu: x.matTruoc })),
      phai: xao(cap.map((x) => ({ id: x.id, chu: x.matSau })), rand),
    });
  }
  return cau;
}

/* Sao: xong lượt mà không sai câu nào = 3, sai tối đa 1 = 2, còn lại = 1.
   Hết tim = 0 (chưa qua màn). */
export function tinhSao(soSai, conTim) {
  if (conTim <= 0) return 0;
  if (soSai === 0) return 3;
  if (soSai <= 1) return 2;
  return 1;
}
