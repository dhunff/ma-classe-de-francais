"""Lô 42 (11/11), bước 2: ghép tài liệu C1 có từ đệm (lo42_c1_tu_dem.mjs) vào file thi.
Dùng lại các hàm của lo41 (dò vị trí bằng tương quan chéo, atempo, tiếng ồn nền).
Bản có từ đệm đã ngập ngừng thật nên KHÔNG thêm chỗ vấp nhân tạo, chỉ kéo dài ít chỗ nghỉ,
rồi tăng tốc 1,2 đến 1,35 (theo từng bài) và trộn tiếng ồn nền -28 dB như lo41.
Chạy: FFMPEG=… THU_MUC=… python scripts/nhap/lo42_c1_tu_dem.py  (ra THU_MUC/moi/*-thi-euh.mp3 + bao_euh.json)"""
import json, os
import numpy as np

R = os.path.dirname(os.path.abspath(__file__))
nguon = open(os.path.join(R, 'lo41_audio_thi_kho.py'), encoding='utf-8').read()
exec(nguon[: nguon.index("ds = json.load")], g := {'__file__': os.path.join(R, 'lo41_audio_thi_kho.py')})
D, SR = g['D'], g['SR']
tai, doc, ghi_mp3, atempo, tim, ngap_ngung, on_nen = (g[k] for k in ('tai', 'doc', 'ghi_mp3', 'atempo', 'tim', 'ngap_ngung', 'on_nen'))
import urllib.request

KQ = json.load(open(os.path.join(R, 'lo42_doan.json'), encoding='utf-8'))
bao = []
for k, b in enumerate(KQ):
    thi_ten = f"{b['ten']}-thi.mp3"
    thi = doc(tai(thi_ten))
    cu = doc(tai(f"{b['ten']}-tai-lieu.mp3"))
    p = os.path.join(D, 'goc', b['url'].split('/')[-1])
    if not os.path.exists(p):
        urllib.request.urlretrieve(b['url'], p)
    x = doc(p)
    rng = np.random.default_rng(4200 + k)
    x = ngap_ngung(x, rng, ti_le_dai=0.12, ti_le_vap=0.0)
    # Giọng « spontanée » đọc chậm hơn bản cũ: chọn hệ số để tài liệu mới chỉ dài hơn
    # (bản cũ / 1,2) khoảng 5 % (phần từ đệm), kẹp 1,2 đến 1,35 cho khỏi méo.
    cu_nhanh = len(cu) / 1.2 * 1.05
    he_so = float(np.clip(len(x) / cu_nhanh, 1.2, 1.35))
    x = atempo(x, round(he_so, 3))
    giong = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
    x = x + on_nen(len(x), rng) * giong * 10 ** (-28 / 20)
    x = (x / max(1.0, np.max(np.abs(x)) / 0.98)).astype(np.float32)
    vt = tim(thi, cu)
    if not vt:
        raise SystemExit(f'không thấy tài liệu trong {thi_ten}')
    ra, o = [], 0
    for v in vt:
        ra += [thi[o:v], x]; o = v + len(cu)
    ra.append(thi[o:])
    kq = np.concatenate(ra)
    ten_moi = thi_ten.replace('.mp3', '-euh.mp3')
    ghi_mp3(kq, os.path.join(D, 'moi', ten_moi))
    bao.append({'ten': b['ten'], 'cu': thi_ten, 'moi': ten_moi, 'lan': len(vt), 'he_so': round(he_so, 3), 'giay_tl_cu': round(len(cu) / SR, 1),
                'giay_tl_moi': round(len(x) / SR, 1), 'giay_cu': round(len(thi) / SR, 1), 'giay_moi': round(len(kq) / SR, 1)})
    print(bao[-1], flush=True)
json.dump(bao, open(os.path.join(D, 'bao_euh.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
