/* Học ngữ pháp · NHẬP MÔN (15/10, theo chủ dự án): bảng chữ cái, dấu, âm tiếng
 * Pháp theo IPA, quy tắc đọc. Nội dung học: KHÔNG dùng dấu gạch dài.
 * `am`: khoá trong amThanh.json (file giọng tổng hợp tạo bằng scripts/ngu-phap/tao-am.mjs). */

export const CHU_CAI = [
  ["A", "a", "/a/", "ami"], ["B", "bé", "/be/", "bébé"], ["C", "cé", "/se/", "café"], ["D", "dé", "/de/", "dame"],
  ["E", "e", "/ə/", "le"], ["F", "effe", "/ɛf/", "fille"], ["G", "gé", "/ʒe/", "gare"], ["H", "hache", "/aʃ/", "hôtel"],
  ["I", "i", "/i/", "île"], ["J", "ji", "/ʒi/", "jour"], ["K", "ka", "/ka/", "kilo"], ["L", "elle", "/ɛl/", "lune"],
  ["M", "emme", "/ɛm/", "mère"], ["N", "enne", "/ɛn/", "nuit"], ["O", "o", "/o/", "olive"], ["P", "pé", "/pe/", "pain"],
  ["Q", "ku", "/ky/", "quatre"], ["R", "erre", "/ɛʁ/", "rose"], ["S", "esse", "/ɛs/", "soleil"], ["T", "té", "/te/", "table"],
  ["U", "u", "/y/", "rue"], ["V", "vé", "/ve/", "vélo"], ["W", "double vé", "/dubləve/", "wagon"], ["X", "ixe", "/iks/", "taxi"],
  ["Y", "i grec", "/iɡʁɛk/", "yoga"], ["Z", "zède", "/zɛd/", "zéro"],
];

export const DAU = [
  ["é", "accent aigu", "Chỉ có trên e. Đọc /e/ khép, như « ê » tiếng Việt đọc gọn.", "été, café"],
  ["è", "accent grave", "Trên e: đọc /ɛ/ mở. Trên a, u (à, où): KHÔNG đổi âm, chỉ phân biệt nghĩa (a / à, ou / où).", "mère, là, où"],
  ["ê", "accent circonflexe", "Trên e: /ɛ/ mở. Trên a, i, o, u: thường do chữ s cũ đã mất (forêt ← forest).", "fête, hôtel, île"],
  ["ë", "tréma", "Đọc TÁCH nguyên âm này khỏi nguyên âm trước nó.", "Noël, naïf"],
  ["ç", "cédille", "Chữ c đọc /s/ trước a, o, u (bình thường c + a/o/u đọc /k/).", "français, garçon, reçu"],
];

export const IPA = [
  { nhom: "Nguyên âm miệng", ds: [
    ["/i/", "lit, vie", "giống « i » tiếng Việt, môi kéo dài"],
    ["/e/", "été, chanter", "giống « ê », khép, gọn"],
    ["/ɛ/", "mère, lait", "giống « e » tiếng Việt, mở"],
    ["/a/", "patte, la", "giống « a »"],
    ["/o/", "eau, mot", "giống « ô », môi tròn"],
    ["/ɔ/", "porte, homme", "giống « o », mở hơn /o/"],
    ["/u/", "loup, vous", "giống « u » tiếng Việt"],
    ["/y/", "rue, tu", "KHÔNG có trong tiếng Việt: môi tròn như « u » nhưng lưỡi đặt như « i »"],
    ["/ø/", "deux, peu", "môi tròn như « ô », lưỡi như « ê »"],
    ["/œ/", "peur, fleur", "môi tròn như « o », lưỡi như « e »"],
    ["/ə/", "le, demain", "e câm khi đọc: âm « ơ » nhẹ, rất ngắn"],
  ] },
  { nhom: "Nguyên âm mũi", ds: [
    ["/ɑ̃/", "enfant, temps", "an, am, en, em: « ăng » nhưng không đọc « ng » cuối"],
    ["/ɔ̃/", "bon, nom", "on, om: « ông » không có « ng »"],
    ["/ɛ̃/", "vin, pain", "in, im, ain, ein, un: « ăng » mở, đẩy hơi qua mũi"],
  ] },
  { nhom: "Bán nguyên âm", ds: [
    ["/j/", "fille, yeux", "giống « i » lướt: « dờ » rất nhẹ"],
    ["/w/", "oui, moi", "« u » lướt, như « oa » trong « hoa »"],
    ["/ɥ/", "nuit, lui", "/y/ lướt rồi sang nguyên âm sau"],
  ] },
  { nhom: "Phụ âm", ds: [
    ["/p/", "papa", "« p » không bật hơi mạnh"], ["/b/", "bon", "« b »"], ["/t/", "tête", "« t »"], ["/d/", "dos", "« đ »"],
    ["/k/", "cou, qui", "« c / k »"], ["/ɡ/", "gare", "« g » tiếng Việt nhưng nặng hơn"], ["/f/", "fou", "« ph »"], ["/v/", "vous", "« v »"],
    ["/s/", "sel, ça", "« x » tiếng Việt"], ["/z/", "zoo, rose", "« d » miền Bắc nhưng rung hơn"], ["/ʃ/", "chat", "« s » uốn lưỡi, môi tròn"],
    ["/ʒ/", "jour, gens", "« gi » kéo dài, môi tròn"], ["/m/", "mer", "« m »"], ["/n/", "nez", "« n »"], ["/ɲ/", "montagne", "« nh »"],
    ["/l/", "lait", "« l »"], ["/ʁ/", "rue, Paris", "« r » cổ họng, gần như « gh » tiếng Việt"],
  ] },
];

/* Bài học Nhập môn: phần lý thuyết dùng khối đặc biệt (chuCai, dau, ipa). */
export const BAI_NHAP_MON = [
  { ma: "nm-chu-cai", cap: "Nhập môn", ten: "Bảng chữ cái và dấu", tenFr: "L'alphabet et les accents",
    tomTat: "26 chữ cái, cách đọc tên từng chữ để đánh vần, và 5 loại dấu của tiếng Pháp.",
    phan: [
      { loai: "doan", html: "<p>Tiếng Pháp dùng <strong>26 chữ cái</strong> Latinh như tiếng Anh. Tên chữ cái dùng khi <strong>đánh vần</strong> (tên, email, địa chỉ), nên cần thuộc. Bấm vào từng chữ để nghe tên chữ và một từ ví dụ.</p>" },
      { loai: "chuCai" },
      { loai: "luuY", ds: ["Hai cặp dễ nhầm khi đánh vần: <strong>E</strong> đọc « ơ », còn <strong>I</strong> đọc « i ». <strong>G</strong> đọc « giê », còn <strong>J</strong> đọc « gi ».", "Chữ <strong>H</strong> không bao giờ được phát âm: hôtel đọc « ô-ten ».", "Khi đánh vần chữ có dấu, nói tên dấu sau chữ: é = « e accent aigu », ç = « c cédille »."] },
      { loai: "dau" },
      { loai: "doan", html: "<p>Dấu là <strong>một phần của chính tả</strong>: viết thiếu dấu là sai từ. Ví dụ <em>ou</em> (hoặc) khác <em>où</em> (ở đâu), <em>a</em> (có) khác <em>à</em> (ở, tới).</p>" },
    ],
    baiTap: [
      { loai: "qcm", de: "Chữ cái nào đọc là « ji » /ʒi/ ?", pa: ["G", "J", "I"], dap: 1, giai: "J đọc /ʒi/, còn G đọc /ʒe/." },
      { loai: "qcm", de: "Trong từ « hôtel », chữ h đọc thế nào?", pa: ["Không đọc", "Đọc như « h » tiếng Việt", "Đọc như « k »"], dap: 0, giai: "Chữ h trong tiếng Pháp luôn câm." },
      { loai: "qcm", de: "Dấu nào làm chữ c đọc thành /s/ trước a, o, u?", pa: ["accent aigu", "cédille", "tréma"], dap: 1, giai: "ç (c cédille): français, garçon." },
      { loai: "qcm", de: "« Où » và « ou » khác nhau ở điểm nào?", pa: ["Cách đọc", "Nghĩa (ở đâu / hoặc)", "Không khác gì"], dap: 1, giai: "Dấu huyền trên u không đổi âm, chỉ phân biệt nghĩa." },
      { loai: "dien", de: "Viết lại từ « garcon » cho đúng chính tả.", dap: ["garçon"], giai: "c đứng trước o mà đọc /s/ thì phải có cédille: garçon." },
      { loai: "qcm", de: "Từ nào có dấu tréma?", pa: ["Noël", "fête", "été"], dap: 0, giai: "ë trong Noël: đọc tách « no-en »." },
    ],
    tuKhoa: ["alphabet", "accent", "phonétique"] },
  { ma: "nm-am", cap: "Nhập môn", ten: "Âm tiếng Pháp (IPA)", tenFr: "Les sons du français",
    tomTat: "Bảng ký hiệu phiên âm quốc tế (IPA) cho mọi âm tiếng Pháp: nguyên âm miệng, nguyên âm mũi, bán nguyên âm, phụ âm.",
    phan: [
      { loai: "doan", html: "<p>Từ điển ghi cách đọc bằng <strong>ký hiệu IPA</strong> đặt giữa hai dấu gạch chéo, ví dụ <em>rue</em> /ʁy/. Biết IPA thì tra từ nào cũng đọc được. Tiếng Pháp có khoảng <strong>36 âm</strong>. Bấm vào từng dòng để nghe từ ví dụ.</p>" },
      { loai: "ipa" },
      { loai: "luuY", ds: ["Ba âm khó nhất với người Việt: <strong>/y/</strong> (rue), <strong>/ʁ/</strong> (Paris) và ba <strong>nguyên âm mũi</strong>.", "Phân biệt /u/ và /y/: <em>vous</em> /vu/ (các bạn) khác <em>vu</em> /vy/ (đã thấy).", "Phân biệt /ɑ̃/ và /ɔ̃/: <em>blanc</em> (trắng) khác <em>blond</em> (vàng hoe)."] },
    ],
    baiTap: [
      { loai: "qcm", de: "Âm /y/ có trong từ nào?", pa: ["loup", "rue", "lit"], dap: 1, giai: "rue /ʁy/; loup /lu/; lit /li/." },
      { loai: "qcm", de: "« vin » chứa âm mũi nào?", pa: ["/ɑ̃/", "/ɔ̃/", "/ɛ̃/"], dap: 2, giai: "in, ain, ein, un → /ɛ̃/." },
      { loai: "qcm", de: "Ký hiệu /ʃ/ ứng với chữ nào?", pa: ["ch", "j", "s"], dap: 0, giai: "ch trong chat đọc /ʃ/." },
      { loai: "qcm", de: "Từ nào đọc là /bɔ̃/ ?", pa: ["bon", "banc", "bain"], dap: 0, giai: "on → /ɔ̃/: bon. banc /bɑ̃/, bain /bɛ̃/." },
      { loai: "qcm", de: "Âm /ɲ/ trong « montagne » giống âm nào của tiếng Việt?", pa: ["« ng »", "« nh »", "« n »"], dap: 1, giai: "gn đọc như « nh »." },
      { loai: "qcm", de: "Từ nào có âm /ø/ ?", pa: ["deux", "dos", "doux"], dap: 0, giai: "deux /dø/; dos /do/; doux /du/." },
    ],
    tuKhoa: ["phonétique", "prononciation", "sons"] },
  { ma: "nm-quy-tac-doc", cap: "Nhập môn", ten: "Quy tắc đọc: chữ câm và nối âm", tenFr: "Lettres muettes, liaison, élision",
    tomTat: "Chữ cuối thường câm, e câm, nối âm (liaison), nối vần (enchaînement) và lược âm (élision).",
    phan: [
      { loai: "doan", html: "<h3>1. Phụ âm cuối thường câm</h3><p>Phần lớn phụ âm ở cuối từ <strong>không đọc</strong>: petit /pəti/, grand /ɡʁɑ̃/, vous /vu/, ils parlent /il paʁl/ (-ent của động từ câm). Ngoại lệ hay gặp: <strong>c, r, f, l</strong> thường được đọc (avec, mer, neuf, sel). Mẹo nhớ: <strong>CaReFuL</strong>.</p><h3>2. E câm</h3><p>e ở cuối từ không đọc: table /tabl/, Marie /maʁi/. Nhưng nó làm phụ âm trước nó được đọc: petit /pəti/ nhưng petite /pətit/.</p>" },
      { loai: "vidu", ds: [["un grand homme", "nối âm d → /t/: « un gran-t-omme »"], ["les amis", "nối âm s → /z/: /le.za.mi/"], ["vous avez", "nối âm s → /z/: /vu.za.ve/"], ["elle arrive", "nối vần: l nối sang nguyên âm sau, /ɛ.la.ʁiv/"]] },
      { loai: "doan", html: "<h3>3. Nối âm (liaison)</h3><p>Phụ âm cuối vốn câm được <strong>đọc lên và nối sang từ sau</strong> khi từ sau bắt đầu bằng nguyên âm hoặc h câm. s, x, z → /z/; d → /t/; n → /n/.</p><p><strong>Bắt buộc</strong> sau mạo từ và tính từ đứng trước danh từ (les amis, deux enfants), giữa đại từ và động từ (nous avons, ils ont). <strong>Cấm</strong> sau « et » (un homme et / une femme) và trước h bật hơi (les / héros).</p><h3>4. Lược âm (élision)</h3><p>Trước nguyên âm hoặc h câm, các từ ngắn bỏ nguyên âm cuối và thay bằng dấu nháy: le → l', je → j', de → d', que → qu', ne → n', si + il → s'il.</p>" },
      { loai: "loi", ds: [["je aime", "j'aime", "je + nguyên âm thì lược thành j'."], ["le homme", "l'homme", "h câm: lược như trước nguyên âm."], ["les héros /le.ze.ʁo/", "les héros /le.e.ʁo/", "h bật hơi: KHÔNG nối âm."]] },
    ],
    baiTap: [
      { loai: "qcm", de: "Trong « ils parlent », đuôi -ent đọc thế nào?", pa: ["/ɑ̃/", "Không đọc", "/ɛnt/"], dap: 1, giai: "-ent của động từ số nhiều luôn câm: /il paʁl/." },
      { loai: "qcm", de: "« les amis » đọc là:", pa: ["/le a.mi/", "/le.za.mi/", "/les a.mi/"], dap: 1, giai: "Nối âm bắt buộc sau mạo từ: s → /z/." },
      { loai: "dien", de: "Viết lại cho đúng: « je habite à Hanoi ».", dap: ["j'habite à Hanoi", "J'habite à Hanoi"], giai: "h câm: je → j'." },
      { loai: "qcm", de: "Chữ cuối nào thường ĐƯỢC đọc?", pa: ["t trong petit", "c trong avec", "s trong vous"], dap: 1, giai: "c, r, f, l cuối thường được đọc (CaReFuL)." },
      { loai: "qcm", de: "Ở chỗ nào KHÔNG được nối âm?", pa: ["nous_avons", "un homme et_une femme", "deux_enfants"], dap: 1, giai: "Không bao giờ nối âm sau « et »." },
      { loai: "dien", de: "Lược âm: « si il pleut » viết đúng là…", dap: ["s'il pleut"], giai: "si + il → s'il (chỉ lược trước il, ils)." },
    ],
    tuKhoa: ["prononciation", "liaison"] },
];
