"""Làm audio thi thử B2, C1 khó hơn (11/11, chủ dự án).
File thi = lời dẫn + khoảng lặng + đoạn hội thoại (1 hoặc 2 lượt). Chỉ xử lý ĐOẠN HỘI THOẠI:
dò vị trí của nó trong file thi bằng tương quan chéo, thay bằng bản đã xử lý; lời dẫn và
khoảng lặng giữ nguyên (thời gian đọc câu hỏi như thi thật).
  B2: nhanh x1.12.
  C1: thêm chỗ ngập ngừng (kéo dài một số chỗ nghỉ, lặp đầu cụm như vấp lời), rồi nhanh x1.2,
      rồi trộn tiếng ồn nền nhỏ.
Chạy: FFMPEG=…/ffmpeg.exe python scripts/nhap/lo41_audio_thi_kho.py (cần numpy; đặt ds.json
= kết quả select id, level, audio_url, meta->>'audioLuyen' al vào THU_MUC; ra THU_MUC/moi/ + bao.json),
rồi tải lên bằng tao-audio (taiLen, tên mới « -kho ») và đổi audio_url bằng migration (xem 200)."""
import json, os, subprocess, urllib.request, wave
import numpy as np

D = os.environ.get('THU_MUC') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '_lo41')
FF = os.environ.get('FFMPEG') or 'ffmpeg'
KHO = 'https://cdszvnuaibnnkrvynyck.supabase.co/storage/v1/object/public/nghe/'
SR = 24000
os.makedirs(os.path.join(D, 'goc'), exist_ok=True)  # thư mục làm việc, không vào git
os.makedirs(os.path.join(D, 'moi'), exist_ok=True)

def tai(ten):
    p = os.path.join(D, 'goc', ten)
    if not os.path.exists(p):
        urllib.request.urlretrieve(KHO + ten, p)
    return p

def doc(p, sr=SR):
    raw = subprocess.run([FF, '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

def ghi_mp3(x, p):
    w = p[:-4] + '.wav'
    with wave.open(w, 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run([FF, '-v', 'error', '-y', '-i', w, '-b:a', '48k', p], check=True)
    os.remove(w)

def atempo(x, he_so):
    raw = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    out = subprocess.run([FF, '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                          '-af', f'atempo={he_so}', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-'], input=raw, capture_output=True, check=True).stdout
    return np.frombuffer(out, np.int16).astype(np.float32) / 32768

def tim(thi, tl):
    """Vị trí (mẫu, ở SR) các lần đoạn tl xuất hiện trong thi. Tương quan chuẩn hoá ở 4 kHz."""
    k = SR // 4000
    a, b = thi[::k], tl[::k]
    mau = b[: min(len(b), 4000 * 5)]
    mau = (mau - mau.mean()) / (mau.std() + 1e-9)
    n = 1 << int(np.ceil(np.log2(len(a) + len(mau))))
    c = np.fft.irfft(np.fft.rfft(a, n) * np.conj(np.fft.rfft(mau, n)), n)[: len(a) - len(mau)]
    # chuẩn hoá theo năng lượng cửa sổ của a
    cs = np.cumsum(np.concatenate([[0], a ** 2]))
    cs1 = np.cumsum(np.concatenate([[0], a]))
    L = len(mau)
    e = cs[L:L + len(c)] - cs[:len(c)]
    m = cs1[L:L + len(c)] - cs1[:len(c)]
    var = np.maximum(e - m * m / L, 1e-9)
    r = c / np.sqrt(var * L)
    vt = []
    while True:
        i = int(np.argmax(r))
        if r[i] < 0.9:
            break
        vt.append(i * k)
        lo, hi = max(0, i - len(b)), min(len(r), i + len(b))
        r[lo:hi] = -1
    return sorted(vt)

def cho_nghi(x, nguong=0.012, toi_thieu=0.18):
    """Các chỗ nghỉ giữa câu: (bắt đầu, kết thúc) theo mẫu."""
    w = int(SR * 0.02)
    n = len(x) // w
    nl = np.sqrt((x[: n * w].reshape(n, w) ** 2).mean(1))
    im = nl < nguong
    ra, i = [], 0
    while i < n:
        if im[i]:
            j = i
            while j < n and im[j]:
                j += 1
            if (j - i) * w >= toi_thieu * SR and i > 0 and j < n:
                ra.append((i * w, j * w))
            i = j
        else:
            i += 1
    return ra

def ngap_ngung(x, rng, ti_le_dai=0.22, ti_le_vap=0.10):
    """Kéo dài ngẫu nhiên một số chỗ nghỉ (0,5 đến 1,1 s) và lặp đầu cụm sau đó như vấp lời."""
    ra, cu = [], 0
    for (s, e) in cho_nghi(x):
        ra.append(x[cu:e]); cu = e
        u = rng.random()
        if u < ti_le_vap and e + int(0.6 * SR) < len(x):
            # « je… je pense » : lặp 0,22 đến 0,32 s đầu cụm, mờ dần, rồi nghỉ ngắn
            d = int(SR * rng.uniform(0.22, 0.32))
            m = x[e:e + d].copy()
            f = int(SR * 0.03)
            m[:f] *= np.linspace(0, 1, f); m[-f:] *= np.linspace(1, 0, f)
            ra += [m, np.zeros(int(SR * rng.uniform(0.18, 0.35)), np.float32)]
        elif u < ti_le_vap + ti_le_dai:
            ra.append(np.zeros(int(SR * rng.uniform(0.5, 1.1)), np.float32))
    ra.append(x[cu:])
    return np.concatenate(ra)

def on_nen(n, rng):
    """Tiếng ồn nền: ồn hồng nhỏ + tiếng ù trầm, dao động chậm, khoảng -28 dB so với giọng."""
    tr = rng.standard_normal(n).astype(np.float32)
    # lọc hồng gần đúng (Paul Kellet)
    b = [0.0] * 3; ra = np.empty(n, np.float32)
    for i in range(n):
        w = tr[i]
        b[0] = 0.99765 * b[0] + w * 0.0990460
        b[1] = 0.96300 * b[1] + w * 0.2965164
        b[2] = 0.57000 * b[2] + w * 1.0526913
        ra[i] = b[0] + b[1] + b[2] + w * 0.1848
    nau = np.cumsum(rng.standard_normal(n).astype(np.float32)); nau -= np.convolve(nau, np.ones(2400) / 2400, 'same')
    nen = ra / (np.std(ra) + 1e-9) + 0.6 * nau / (np.std(nau) + 1e-9)
    t = np.arange(n) / SR
    nen *= 0.8 + 0.2 * np.sin(2 * np.pi * t / 7.3)
    return nen / (np.std(nen) + 1e-9)

def xu_ly_doan(x, cap, hat):
    rng = np.random.default_rng(hat)
    if cap == 'C1':
        x = ngap_ngung(x, rng)
        x = atempo(x, 1.2)
        giong = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
        x = x + on_nen(len(x), rng) * giong * 10 ** (-28 / 20)
        x = x / max(1.0, np.max(np.abs(x)) / 0.98)
    else:
        x = atempo(x, 1.12)
    return x.astype(np.float32)

ds = json.load(open(os.path.join(D, 'ds.json'), encoding='utf-8'))['rows']
bao = []
for k, r in enumerate(ds):
    thi_ten = r['audio_url'].split('/')[-1]
    if r['al']:
        doans = [r['al'].split('/')[-1]]
    else:
        g = thi_ten.replace('-thi.mp3', '')
        doans = [f'{g}-doc{i}.mp3' for i in (1, 2, 3)]
    thi = doc(tai(thi_ten))
    thay = []
    for j, dn in enumerate(doans):
        tl = doc(tai(dn))
        vt = tim(thi, tl)
        if not vt:
            raise SystemExit(f'không thấy {dn} trong {thi_ten}')
        moi = xu_ly_doan(tl, r['level'], 1000 + k * 10 + j)
        thay += [(v, len(tl), moi) for v in vt]
    thay.sort(key=lambda z: z[0])
    ra, cu = [], 0
    for v, L, moi in thay:
        assert v >= cu, (thi_ten, v, cu)
        ra += [thi[cu:v], moi]; cu = v + L
    ra.append(thi[cu:])
    kq = np.concatenate(ra)
    ten_moi = thi_ten.replace('.mp3', '-kho.mp3')
    ghi_mp3(kq, os.path.join(D, 'moi', ten_moi))
    bao.append({'id': r['id'], 'level': r['level'], 'cu': thi_ten, 'moi': ten_moi, 'lan': len(thay),
                'giay_cu': round(len(thi) / SR, 1), 'giay_moi': round(len(kq) / SR, 1)})
    print(r['level'], thi_ten, 'thay', len(thay), 'đoạn', bao[-1]['giay_cu'], '→', bao[-1]['giay_moi'], 's', flush=True)
json.dump(bao, open(os.path.join(D, 'bao.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
