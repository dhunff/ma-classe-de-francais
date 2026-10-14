# FILE_UPLOADS Security Report

## Status: PASS (1 điểm LOW)

## Findings

- Học sinh chỉ tải lên bucket `bai-noi` (riêng tư, tối đa 25 MB, giới hạn loại MIME), vào đúng thư mục `<uid>/`.
- Bucket công khai (`nghe`…) không có policy ghi: chỉ máy chủ ghi.

## What's already secure

- Tên file do client đặt theo khuôn `<exercise>-<mốc>.webm` trong thư mục riêng; không ai đọc được file người khác.

## Recommendations

- (LOW) Loại file kiểm theo MIME khai báo, không theo magic bytes; file nằm ở bucket riêng tư nên rủi ro thấp.
