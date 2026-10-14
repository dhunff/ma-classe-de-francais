# DEPENDENCIES Security Report

## Status: MEDIUM → giảm còn LOW

## Findings

- npm audit: 1 HIGH (@xmldom/xmldom qua mammoth) + 3 MODERATE (sprintf-js / argparse qua mammoth).
- package-lock.json được commit.

## What's already secure

- (không có)

## Recommendations

- (LOW) 3 MODERATE còn lại trong `mammoth` (nhập file Word, chỉ giáo viên dùng); sửa đòi nâng cấp phá vỡ.
- (LOW) package.json dùng ^ (không ghim tuyệt đối); lock file bù lại.
