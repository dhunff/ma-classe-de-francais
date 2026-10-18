/* Lịch thi DELF–DALF (18/10/2026). Chép NGUYÊN VĂN từ trang chính thức của Viện Pháp
 * tại Việt Nam: https://ifv.vn/bang-delf-dalf/ (đối chiếu ngày 18/10/2026).
 * Bảng ngày thi + lệ phí là của Viện Pháp tại HÀ NỘI; trung tâm khác có thể khác ngày
 * và lệ phí, nên trang nói rõ điều đó. KHÔNG tự suy ngày năm 2027: IFV chưa công bố,
 * và một ngày đoán sai khiến học sinh lỡ hạn đăng ký thật.
 * Ngày ghi dạng YYYY-MM-DD. Cập nhật: sửa file này rồi đổi DOI_CHIEU. */
export const NGUON = "https://ifv.vn/bang-delf-dalf/";
export const DOI_CHIEU = "18/10/2026";

/* Lệ phí (đồng) tại Viện Pháp Hà Nội, năm 2026: [thường, đăng ký muộn]. */
export const LE_PHI = {
  A1: [1500000, 1800000], A2: [1700000, 2000000], B1: [2100000, 2400000],
  B2: [2900000, 3200000], C1: [3100000, 3400000], C2: [3300000, 3600000],
  "A1.1": [1500000, 1800000],
};

/* Mỗi đợt: loại, tháng, mở / đóng đăng ký, ngày thi theo cấp. */
export const DOT_THI = [
  { loai: "tp", thang: "03/2026", mo: "2026-02-02", dong: "2026-02-28", ngay: { A1: "2026-03-14", A2: "2026-03-21", B1: "2026-03-15", B2: "2026-03-22", C1: "2026-03-14", C2: "2026-03-21" } },
  { loai: "tp", thang: "05/2026", mo: "2026-04-13", dong: "2026-04-24", ngay: { A1: "2026-05-16", A2: "2026-05-23", B1: "2026-05-17", B2: "2026-05-24", C1: "2026-05-16", C2: "2026-05-23" } },
  { loai: "tp", thang: "07/2026", mo: "2026-06-22", dong: "2026-07-03", ngay: { A1: "2026-07-18", A2: "2026-07-25", B1: "2026-07-19", B2: "2026-07-26", C1: "2026-07-18", C2: "2026-07-25" } },
  { loai: "tp", thang: "09/2026", mo: "2026-08-17", dong: "2026-08-28", ngay: { A1: "2026-09-12", A2: "2026-09-19", B1: "2026-09-13", B2: "2026-09-20", C1: "2026-09-12", C2: "2026-09-19" } },
  { loai: "tp", thang: "11/2026", mo: "2026-10-19", dong: "2026-10-30", ngay: { A1: "2026-11-14", A2: "2026-11-21", B1: "2026-11-15", B2: "2026-11-22", C1: "2026-11-14", C2: "2026-11-21" } },
  { loai: "junior", thang: "03/2026", mo: "2026-03-02", dong: "2026-03-13", ngay: { A1: "2026-03-28", A2: "2026-03-29", B1: "2026-03-28", B2: "2026-03-29" } },
  { loai: "junior", thang: "09/2026", mo: "2026-08-24", dong: "2026-09-04", ngay: { A1: "2026-09-26", A2: "2026-09-27", B1: "2026-09-26", B2: "2026-09-27" } },
  { loai: "prim", thang: "05/2026", mo: "2026-04-27", dong: "2026-05-08", ngay: { "A1.1": "2026-05-30", A1: "2026-05-31", A2: "2026-05-30" } },
  { loai: "prim", thang: "11/2026", mo: "2026-10-26", dong: "2026-11-13", ngay: { "A1.1": "2026-11-28", A1: "2026-11-29", A2: "2026-11-28" } },
];

/* Trung tâm tổ chức thi DELF–DALF tout public và các tháng thi (theo năm). */
export const TRUNG_TAM = [
  ["Hà Nội", "Viện Pháp tại Hà Nội", "Số 15 Thiền Quang, Hai Bà Trưng", "examen@ifv.vn", "3, 5, 7, 9, 11"],
  ["Huế", "Viện Pháp tại Huế", "Số 1 Lê Hồng Phong", "contacthue@ifv.vn", "3, 5, 7, 9, 11"],
  ["Đà Nẵng", "Viện Pháp tại Đà Nẵng", "Số 33 Trần Phú", "ecoledanang@ifv.vn", "3, 5, 9, 11"],
  ["TP. Hồ Chí Minh", "Khoa tiếng Pháp, ĐH Sư phạm", "Số 280 An Dương Vương, Quận 5", "khoatiengphap@hcmue.edu.vn", "3, 5, 7, 11"],
  ["TP. Hồ Chí Minh", "IDECAF", "Số 31 Thái Văn Lung, Quận 1", "ltduyen@idecaf.gov.vn", "9"],
  ["Cần Thơ", "Khoa PPDH tiếng Pháp, ĐH Cần Thơ", "Số 411, Đường 30 tháng 4, Ninh Kiều", "nhthai@ctu.edu.vn", "5, 7, 9, 11"],
  ["Nha Trang", "Trung tâm tiếng Pháp, ĐH Khánh Hoà", "01 Nguyễn Chánh, Lộc Thọ", "duongthicatdung@ukh.edu.vn", "5, 11"],
  ["Vinh", "Trung tâm Pháp ngữ Vinh", "Số 36 Nguyễn Đức Cảnh", "trandonggiang@gmail.com", "7"],
  ["Đà Lạt", "Trung tâm Pháp ngữ Antenne", "21 Trần Hưng Đạo, Phường 10", "contact@antenne.vn", "11"],
  ["Hạ Long", "Trung tâm New Sky", "609 Nguyễn Văn Cừ, Hồng Hải", "leduchue6666@gmail.com", "3, 5, 7, 9, 11"],
];
