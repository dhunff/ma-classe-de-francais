/**
 * FRACILE → Google Sheets. Dán toàn bộ tệp này vào Tiện ích mở rộng → Apps Script
 * của bảng tính muốn nhận dữ liệu. Hướng dẫn: docs/google-sheets/HUONG-DAN.md
 *
 * Máy chủ FRACILE (Edge Function `dong-bo-sheets`) gửi POST:
 *   { token, capNhat, sheets: { "<tên trang>": [[ô, ô, …], …] } }
 * Script so `token` với khoá đã lưu, GHI ĐÈ từng trang tính, rồi trả biên nhận
 * số dòng đã ghi. Sai khoá → từ chối, không đụng vào bảng tính.
 */

/** Chạy hàm này MỘT LẦN (nút ▶ Chạy) để sinh khoá bí mật. Khoá in ra trong
 *  « Nhật ký thực thi » — chép nó vào lệnh `supabase secrets set SHEETS_TOKEN=…`. */
function taoKhoa() {
  var khoa = Utilities.getUuid() + Utilities.getUuid();
  khoa = khoa.replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('FRACILE_TOKEN', khoa);
  Logger.log('SHEETS_TOKEN = ' + khoa);
}

function doPost(e) {
  try {
    var duLieu = JSON.parse(e.postData.contents);
    var khoa = PropertiesService.getScriptProperties().getProperty('FRACILE_TOKEN');
    if (!khoa || duLieu.token !== khoa) return traVe({ ok: false, ma: 'SAI_KHOA' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var soDong = {};
    var ten = Object.keys(duLieu.sheets || {});
    for (var i = 0; i < ten.length; i++) {
      var hang = duLieu.sheets[ten[i]];
      var sh = ss.getSheetByName(ten[i]) || ss.insertSheet(ten[i]);
      sh.clearContents();
      if (hang.length) {
        var rong = 0;
        for (var j = 0; j < hang.length; j++) rong = Math.max(rong, hang[j].length);
        // Mọi dòng phải cùng số cột thì setValues mới nhận.
        var vuong = hang.map(function (h) { var x = h.slice(); while (x.length < rong) x.push(''); return x; });
        sh.getRange(1, 1, vuong.length, rong).setValues(vuong);
        sh.getRange(1, 1, 1, rong).setFontWeight('bold');
        sh.setFrozenRows(1);
      }
      soDong[ten[i]] = Math.max(hang.length - 1, 0);   // không tính dòng tiêu đề
    }
    ss.setSpreadsheetLocale('vi_VN');
    var tq = ss.getSheetByName('Tổng quan học sinh');
    if (tq) tq.getRange('J1').setValue('Cập nhật lúc: ' + (duLieu.capNhat || ''));
    return traVe({ ok: true, so_dong: soDong, url: ss.getUrl() });
  } catch (loi) {
    return traVe({ ok: false, ma: 'LOI_SCRIPT', chi_tiet: String(loi) });
  }
}

function traVe(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
