/* Học ngữ pháp · 10 bài A2–B1 (15/10, theo chủ dự án).
 * Lý thuyết tiếng Việt, ví dụ tiếng Pháp kèm nghĩa. Bài tập chấm tại chỗ (học
 * tự do, không phải bài thi). `tuKhoa` dùng để tìm bài luyện thêm trong thư viện.
 * Nội dung học: KHÔNG dùng dấu gạch dài. */

export const BAI_A2_B1 = [
  /* ───────────── A2 ───────────── */
  { ma: "a2-passe-compose-avoir", cap: "A2", ten: "Passé composé với avoir", tenFr: "Le passé composé avec avoir",
    tomTat: "Thì quá khứ dùng nhiều nhất: kể một việc đã xong. Cấu tạo avoir + phân từ quá khứ.",
    phan: [
      { loai: "doan", html: "<p><strong>Passé composé</strong> diễn tả một hành động <strong>đã xảy ra và đã kết thúc</strong> trong quá khứ: <em>Hier, j'ai mangé une pizza.</em> (Hôm qua tôi đã ăn một cái pizza.)</p><p>Cấu tạo: <strong>avoir chia ở hiện tại + phân từ quá khứ (participe passé)</strong>. Phần lớn động từ đi với avoir.</p>" },
      { loai: "bang", tieuDe: "Cách tạo phân từ quá khứ", cot: ["Nhóm động từ", "Quy tắc", "Ví dụ"], hang: [
        ["-er (nhóm 1)", "-er → -é", "parler → parlé, manger → mangé"],
        ["-ir (nhóm 2)", "-ir → -i", "finir → fini, choisir → choisi"],
        ["Bất quy tắc hay gặp", "phải học thuộc", "avoir → eu, être → été, faire → fait, prendre → pris, voir → vu, lire → lu, boire → bu, écrire → écrit, mettre → mis, pouvoir → pu, vouloir → voulu, devoir → dû"],
      ] },
      { loai: "bang", tieuDe: "Ví dụ chia: parler", cot: ["", ""], hang: [["j'ai parlé", "nous avons parlé"], ["tu as parlé", "vous avez parlé"], ["il / elle a parlé", "ils / elles ont parlé"]] },
      { loai: "doan", html: "<p><strong>Phủ định:</strong> ne… pas bao quanh trợ động từ: <em>Je <strong>n'</strong>ai <strong>pas</strong> mangé.</em></p><p><strong>Trạng từ ngắn</strong> (déjà, bien, beaucoup, encore, trop) đứng giữa trợ động từ và phân từ: <em>J'ai <strong>déjà</strong> fini.</em></p>" },
      { loai: "loi", ds: [["J'ai pas mangé", "Je n'ai pas mangé", "Văn viết phải đủ « ne »."], ["Il a prendu le bus", "Il a pris le bus", "prendre → pris (bất quy tắc)."], ["J'ai fini déjà", "J'ai déjà fini", "Trạng từ ngắn đứng giữa avoir và phân từ."]] },
    ],
    baiTap: [
      { loai: "dien", de: "Hier, nous ___ (regarder) un film.", dap: ["avons regardé"], giai: "nous + avons; regarder → regardé." },
      { loai: "dien", de: "Elle ___ (finir) ses devoirs.", dap: ["a fini"], giai: "finir → fini." },
      { loai: "dien", de: "Tu ___ (prendre) ton parapluie ?", dap: ["as pris"], giai: "prendre → pris." },
      { loai: "qcm", de: "Câu nào đúng?", pa: ["Je n'ai pas vu ce film.", "Je n'ai vu pas ce film.", "Je ai pas vu ce film."], dap: 0, giai: "ne + avoir + pas + phân từ; je + ai → j'ai, phủ định n'ai." },
      { loai: "dien", de: "Ils ___ (faire) les courses samedi.", dap: ["ont fait"], giai: "faire → fait." },
      { loai: "qcm", de: "Đặt « déjà » đúng chỗ: « J'ai mangé. »", pa: ["J'ai déjà mangé.", "Déjà j'ai mangé.", "J'ai mangé déjà."], dap: 0, giai: "Trạng từ ngắn đứng giữa trợ động từ và phân từ." },
    ],
    tuKhoa: ["passé composé", "passe compose", "temps du passé"] },

  { ma: "a2-passe-compose-etre", cap: "A2", ten: "Passé composé với être", tenFr: "Le passé composé avec être",
    tomTat: "Khoảng 15 động từ chỉ chuyển động và mọi động từ phản thân dùng être; phân từ phải hợp giống, số với chủ ngữ.",
    phan: [
      { loai: "doan", html: "<p>Một nhóm nhỏ động từ dùng <strong>être</strong> làm trợ động từ: chủ yếu là động từ chỉ <strong>chuyển động hoặc thay đổi trạng thái</strong>, và <strong>mọi động từ phản thân</strong> (se lever, s'habiller…).</p><p>Mẹo nhớ: <strong>DR MRS VANDERTRAMP</strong> (devenir, revenir, monter, rester, sortir, venir, aller, naître, descendre, entrer, retourner, tomber, rentrer, arriver, mourir, partir).</p>" },
      { loai: "doan", html: "<p><strong>Hợp giống và số:</strong> với être, phân từ hợp với <strong>chủ ngữ</strong>: thêm <strong>-e</strong> nếu giống cái, <strong>-s</strong> nếu số nhiều.</p>" },
      { loai: "bang", tieuDe: "Ví dụ chia: aller", cot: ["", ""], hang: [["je suis allé(e)", "nous sommes allé(e)s"], ["tu es allé(e)", "vous êtes allé(e)(s)"], ["il est allé / elle est allée", "ils sont allés / elles sont allées"]] },
      { loai: "vidu", ds: [["Marie est partie à 8 heures.", "Marie đã đi lúc 8 giờ. (partie: giống cái)"], ["Nous nous sommes levés tôt.", "Chúng tôi đã dậy sớm."], ["Elles sont nées en 2010.", "Họ (nữ) sinh năm 2010."]] },
      { loai: "loi", ds: [["J'ai allé au cinéma", "Je suis allé(e) au cinéma", "aller dùng être."], ["Elle est arrivé", "Elle est arrivée", "Chủ ngữ giống cái: thêm -e."], ["Je me suis levé (nói bởi một cô gái)", "Je me suis levée", "Phân từ hợp với người nói."]] },
    ],
    baiTap: [
      { loai: "dien", de: "Ma sœur ___ (arriver) hier soir.", dap: ["est arrivée"], giai: "arriver dùng être; chủ ngữ giống cái → arrivée." },
      { loai: "dien", de: "Nous ___ (partir) en vacances. (nous = Paul et Marc)", dap: ["sommes partis"], giai: "partir + être; số nhiều giống đực → partis." },
      { loai: "qcm", de: "Chọn trợ động từ: « Ils ___ tombés dans l'escalier. »", pa: ["ont", "sont", "a"], dap: 1, giai: "tomber dùng être." },
      { loai: "qcm", de: "Câu nào đúng?", pa: ["Elle s'est habillée.", "Elle s'a habillée.", "Elle s'est habillé."], dap: 0, giai: "Động từ phản thân dùng être và hợp giống." },
      { loai: "dien", de: "Les enfants ___ (rester) à la maison.", dap: ["sont restés"], giai: "rester + être; số nhiều → restés." },
      { loai: "qcm", de: "Động từ nào dùng avoir?", pa: ["venir", "manger", "naître"], dap: 1, giai: "manger không phải động từ chuyển động: j'ai mangé." },
    ],
    tuKhoa: ["passé composé", "être", "accord"] },

  { ma: "a2-imparfait", cap: "A2", ten: "Thì imparfait", tenFr: "L'imparfait",
    tomTat: "Thì quá khứ để mô tả, kể thói quen và bối cảnh. Cấu tạo từ « nous » ở hiện tại.",
    phan: [
      { loai: "doan", html: "<p><strong>Imparfait</strong> dùng để <strong>mô tả</strong> trong quá khứ (thời tiết, cảm xúc, người, cảnh), kể <strong>thói quen</strong> (hồi xưa thường…) và đặt <strong>bối cảnh</strong> cho một sự việc.</p><p>Cấu tạo: lấy động từ chia với <strong>nous</strong> ở hiện tại, bỏ <strong>-ons</strong>, thêm đuôi <strong>-ais, -ais, -ait, -ions, -iez, -aient</strong>. Ngoại lệ duy nhất: <strong>être → ét-</strong>.</p>" },
      { loai: "bang", tieuDe: "Ví dụ: finir (nous finiss-ons → finiss-)", cot: ["", ""], hang: [["je finissais", "nous finissions"], ["tu finissais", "vous finissiez"], ["il finissait", "ils finissaient"]] },
      { loai: "vidu", ds: [["Quand j'étais petit, j'habitais à Hué.", "Hồi nhỏ, tôi sống ở Huế. (bối cảnh)"], ["Le samedi, nous allions au marché.", "Thứ bảy chúng tôi thường đi chợ. (thói quen)"], ["Il faisait beau et la mer était calme.", "Trời đẹp và biển lặng. (mô tả)"]] },
      { loai: "luuY", ds: ["Các đuôi -ais, -ait, -aient đọc giống nhau: /ɛ/.", "Động từ -cer, -ger: nous commençons → je commençais; nous mangeons → je mangeais (giữ ç, ge trước a)."] },
    ],
    baiTap: [
      { loai: "dien", de: "Quand j'___ (être) enfant, j'aimais le chocolat.", dap: ["étais"], giai: "être → ét- + ais." },
      { loai: "dien", de: "Nous ___ (habiter) à Lyon.", dap: ["habitions"], giai: "habit- + ions." },
      { loai: "dien", de: "Ils ___ (faire) du sport tous les jours.", dap: ["faisaient"], giai: "nous faisons → fais- + aient." },
      { loai: "qcm", de: "Câu nào diễn tả THÓI QUEN trong quá khứ?", pa: ["Le dimanche, je jouais au foot.", "Dimanche, j'ai joué au foot.", "Je joue au foot."], dap: 0, giai: "« Le dimanche » (mỗi chủ nhật) + imparfait = thói quen." },
      { loai: "dien", de: "Tu ___ (manger) beaucoup de fruits.", dap: ["mangeais"], giai: "Giữ e: mange- + ais." },
      { loai: "qcm", de: "Thì nào dùng để MÔ TẢ thời tiết trong quá khứ?", pa: ["imparfait", "passé composé", "futur simple"], dap: 0, giai: "Mô tả, bối cảnh → imparfait." },
    ],
    tuKhoa: ["imparfait"] },

  { ma: "a2-cod-coi", cap: "A2", ten: "Đại từ COD và COI", tenFr: "Les pronoms COD et COI",
    tomTat: "Thay thế bổ ngữ để khỏi lặp lại: le, la, les (trực tiếp) và lui, leur (gián tiếp), đứng TRƯỚC động từ.",
    phan: [
      { loai: "doan", html: "<p><strong>COD</strong> (bổ ngữ trực tiếp) đi thẳng sau động từ, không có giới từ: <em>Je regarde <strong>le film</strong>.</em> → <em>Je <strong>le</strong> regarde.</em></p><p><strong>COI</strong> (bổ ngữ gián tiếp) đi sau giới từ <strong>à</strong> + người: <em>Je parle <strong>à Marie</strong>.</em> → <em>Je <strong>lui</strong> parle.</em></p>" },
      { loai: "bang", tieuDe: "Bảng đại từ", cot: ["Người", "COD", "COI"], hang: [["je", "me (m')", "me (m')"], ["tu", "te (t')", "te (t')"], ["il / elle", "le / la (l')", "lui"], ["nous", "nous", "nous"], ["vous", "vous", "vous"], ["ils / elles", "les", "leur"]] },
      { loai: "doan", html: "<p><strong>Vị trí:</strong> đại từ đứng <strong>trước động từ chia</strong>: <em>Je ne <strong>la</strong> connais pas.</em> Với passé composé: trước trợ động từ: <em>Je <strong>lui</strong> ai téléphoné.</em> Với động từ nguyên mẫu: trước nguyên mẫu: <em>Je vais <strong>les</strong> acheter.</em></p>" },
      { loai: "loi", ds: [["Je téléphone à lui", "Je lui téléphone", "téléphoner à quelqu'un → COI lui, đứng trước động từ."], ["Je vais acheter les", "Je vais les acheter", "Đại từ đứng trước nguyên mẫu."], ["Je le parle", "Je lui parle", "parler à → COI."]] },
    ],
    baiTap: [
      { loai: "qcm", de: "Je regarde la télévision. → Je ___ regarde.", pa: ["la", "lui", "le"], dap: 0, giai: "la télévision: COD giống cái → la." },
      { loai: "qcm", de: "Il écrit à ses parents. → Il ___ écrit.", pa: ["les", "leur", "lui"], dap: 1, giai: "écrire à + nhiều người → leur." },
      { loai: "qcm", de: "Tu connais Paul ? → Oui, je ___ connais.", pa: ["le", "lui", "la"], dap: 0, giai: "connaître + COD; Paul giống đực → le." },
      { loai: "qcm", de: "Đặt đại từ đúng chỗ: « Je vais appeler Marie demain. »", pa: ["Je vais l'appeler demain.", "Je l'vais appeler demain.", "Je vais appeler la demain."], dap: 0, giai: "Trước động từ nguyên mẫu." },
      { loai: "dien", de: "J'ai parlé au directeur. → Je ___ ai parlé.", dap: ["lui"], giai: "parler à quelqu'un → lui." },
      { loai: "qcm", de: "Elle aime ces chansons. → Elle ___ aime.", pa: ["les", "leur", "la"], dap: 0, giai: "aimer + COD số nhiều → les." },
    ],
    tuKhoa: ["pronom", "COD", "COI"] },

  { ma: "a2-futur-simple", cap: "A2", ten: "Thì tương lai đơn", tenFr: "Le futur simple",
    tomTat: "Nói về dự định, dự đoán, lời hứa. Cấu tạo: nguyên mẫu + -ai, -as, -a, -ons, -ez, -ont.",
    phan: [
      { loai: "doan", html: "<p><strong>Futur simple</strong> dùng cho dự đoán, kế hoạch xa, lời hứa: <em>Demain, il <strong>pleuvra</strong>.</em></p><p>Cấu tạo: <strong>động từ nguyên mẫu + đuôi -ai, -as, -a, -ons, -ez, -ont</strong> (động từ -re bỏ e: prendre → prendr-).</p>" },
      { loai: "bang", tieuDe: "Gốc bất quy tắc cần thuộc", cot: ["Động từ", "Gốc", "Ví dụ"], hang: [["être", "ser-", "je serai"], ["avoir", "aur-", "tu auras"], ["aller", "ir-", "il ira"], ["faire", "fer-", "nous ferons"], ["venir", "viendr-", "vous viendrez"], ["pouvoir", "pourr-", "ils pourront"], ["voir", "verr-", "je verrai"], ["vouloir", "voudr-", "tu voudras"], ["devoir", "devr-", "il devra"], ["savoir", "saur-", "nous saurons"]] },
      { loai: "luuY", ds: ["Futur proche (aller + nguyên mẫu) dùng cho việc sắp xảy ra, chắc chắn: <em>Je vais partir dans 5 minutes.</em>", "Sau « quand » chỉ tương lai, tiếng Pháp dùng futur (khác tiếng Anh): <em>Quand je <strong>serai</strong> grand…</em>"] },
    ],
    baiTap: [
      { loai: "dien", de: "L'année prochaine, je ___ (voyager) en France.", dap: ["voyagerai"], giai: "voyager + ai." },
      { loai: "dien", de: "Nous ___ (être) en retard.", dap: ["serons"], giai: "être → ser-." },
      { loai: "dien", de: "Ils ___ (aller) à Paris en juillet.", dap: ["iront"], giai: "aller → ir-." },
      { loai: "dien", de: "Tu ___ (prendre) le train ?", dap: ["prendras"], giai: "prendre → prendr- + as." },
      { loai: "qcm", de: "« Quand tu ___ 18 ans, tu pourras voter. »", pa: ["auras", "as", "avais"], dap: 0, giai: "Sau quand chỉ tương lai → futur simple." },
      { loai: "dien", de: "Vous ___ (faire) attention !", dap: ["ferez"], giai: "faire → fer-." },
    ],
    tuKhoa: ["futur"] },

  /* ───────────── B1 ───────────── */
  { ma: "b1-pc-ou-imparfait", cap: "B1", ten: "Passé composé hay imparfait?", tenFr: "Passé composé ou imparfait ?",
    tomTat: "Cách chọn thì khi kể chuyện: imparfait cho bối cảnh và thói quen, passé composé cho sự việc chính.",
    phan: [
      { loai: "bang", tieuDe: "Hai thì, hai vai trò", cot: ["Imparfait", "Passé composé"], hang: [
        ["Bối cảnh, mô tả: Il faisait nuit.", "Sự việc chính, đã xong: Soudain, il a entendu un bruit."],
        ["Thói quen: Je nageais tous les étés.", "Việc xảy ra một lần: L'été dernier, j'ai nagé dans la mer."],
        ["Hành động đang diễn ra thì bị cắt ngang: Je dormais…", "…hành động cắt ngang: …quand le téléphone a sonné."],
        ["Thời gian không xác định", "Mốc thời gian rõ hoặc khoảng thời gian có giới hạn: pendant deux heures, hier, en 2020"],
      ] },
      { loai: "doan", html: "<p>Hình dung một <strong>bộ phim</strong>: imparfait là <strong>phông nền</strong> (cảnh, không khí), passé composé là <strong>các cảnh hành động</strong> nối tiếp nhau.</p>" },
      { loai: "vidu", ds: [["Il pleuvait quand je suis sorti.", "Trời đang mưa khi tôi ra ngoài."], ["Avant, je fumais. J'ai arrêté en 2019.", "Trước đây tôi hút thuốc. Tôi bỏ năm 2019."], ["J'ai vécu trois ans à Lyon.", "Tôi đã sống ba năm ở Lyon. (khoảng thời gian có giới hạn → PC)"]] },
      { loai: "loi", ds: [["Hier, il faisait ses devoirs pendant deux heures.", "Hier, il a fait ses devoirs pendant deux heures.", "Khoảng thời gian có giới hạn → passé composé."], ["Quand j'ai été petit…", "Quand j'étais petit…", "Bối cảnh tuổi thơ → imparfait."]] },
    ],
    baiTap: [
      { loai: "qcm", de: "Je lisais quand quelqu'un ___ à la porte.", pa: ["a frappé", "frappait", "frappe"], dap: 0, giai: "Hành động cắt ngang → passé composé." },
      { loai: "qcm", de: "Quand j'___ jeune, je jouais du piano.", pa: ["étais", "ai été", "serai"], dap: 0, giai: "Bối cảnh → imparfait." },
      { loai: "qcm", de: "Hier soir, nous ___ un excellent film.", pa: ["avons vu", "voyions", "voyons"], dap: 0, giai: "Sự việc xong, mốc rõ → passé composé." },
      { loai: "qcm", de: "Il ___ beau, les oiseaux chantaient.", pa: ["faisait", "a fait", "fait"], dap: 0, giai: "Mô tả → imparfait." },
      { loai: "qcm", de: "Elle ___ à Paris pendant cinq ans, puis elle est rentrée.", pa: ["a habité", "habitait", "habite"], dap: 0, giai: "Khoảng thời gian có giới hạn → passé composé." },
      { loai: "qcm", de: "Tous les soirs, mon grand-père nous ___ une histoire.", pa: ["racontait", "a raconté", "raconte"], dap: 0, giai: "Thói quen (tous les soirs) → imparfait." },
    ],
    tuKhoa: ["imparfait", "passé composé"] },

  { ma: "b1-relatifs", cap: "B1", ten: "Đại từ quan hệ qui, que, où, dont", tenFr: "Les pronoms relatifs simples",
    tomTat: "Nối hai câu bằng đại từ quan hệ: chọn theo chức năng của từ được thay trong mệnh đề sau.",
    phan: [
      { loai: "bang", tieuDe: "Chọn đại từ theo chức năng", cot: ["Đại từ", "Thay cho", "Ví dụ"], hang: [
        ["qui", "CHỦ NGỮ của động từ sau", "J'ai un ami qui parle chinois."],
        ["que (qu')", "BỔ NGỮ TRỰC TIẾP của động từ sau", "Le livre que je lis est passionnant."],
        ["où", "NƠI CHỐN hoặc THỜI GIAN", "La ville où je suis né. Le jour où il est parti."],
        ["dont", "bổ ngữ có DE (parler de, avoir besoin de, être fier de…)", "Le film dont tu parles est sorti hier."],
      ] },
      { loai: "doan", html: "<p><strong>Mẹo:</strong> nhìn ngay sau chỗ trống. Nếu tiếp theo là <strong>động từ</strong> (không có chủ ngữ) → thường là <strong>qui</strong>. Nếu tiếp theo là <strong>chủ ngữ + động từ</strong> → <strong>que</strong>, <strong>où</strong> hoặc <strong>dont</strong> tuỳ động từ.</p><p>Với que + passé composé dùng avoir, phân từ hợp với từ đứng trước: <em>Les photos que j'ai <strong>prises</strong>.</em></p>" },
      { loai: "loi", ds: [["L'homme que parle", "L'homme qui parle", "Thay chủ ngữ → qui."], ["Le film que tu parles", "Le film dont tu parles", "parler DE → dont."], ["La maison que j'habite", "La maison où j'habite", "Nơi chốn → où."]] },
    ],
    baiTap: [
      { loai: "qcm", de: "C'est une chanson ___ j'adore.", pa: ["que", "qui", "dont"], dap: 0, giai: "j' là chủ ngữ, chanson là COD của adorer → que." },
      { loai: "qcm", de: "Le professeur ___ enseigne le français est belge.", pa: ["qui", "que", "où"], dap: 0, giai: "Thay chủ ngữ của enseigne → qui." },
      { loai: "qcm", de: "Voici le restaurant ___ nous avons dîné.", pa: ["où", "que", "dont"], dap: 0, giai: "Nơi chốn → où." },
      { loai: "qcm", de: "C'est l'outil ___ j'ai besoin.", pa: ["dont", "que", "qui"], dap: 0, giai: "avoir besoin DE → dont." },
      { loai: "qcm", de: "Je me souviens du jour ___ tu es arrivé.", pa: ["où", "que", "qui"], dap: 0, giai: "Thời gian → où." },
      { loai: "dien", de: "Les lettres ___ elle a écrites sont sur la table.", dap: ["qu'", "que"], giai: "elle là chủ ngữ; lettres là COD → que (qu' trước nguyên âm)." },
    ],
    tuKhoa: ["relatif", "qui que", "dont"] },

  { ma: "b1-subjonctif", cap: "B1", ten: "Subjonctif hiện tại", tenFr: "Le subjonctif présent",
    tomTat: "Thức dùng sau các biểu đạt mong muốn, cảm xúc, nghĩa vụ, nghi ngờ khi hai mệnh đề có HAI chủ ngữ khác nhau.",
    phan: [
      { loai: "doan", html: "<p><strong>Subjonctif</strong> không phải một thì mà là một <strong>thức</strong>: nó cho thấy người nói nhìn sự việc qua mong muốn, cảm xúc, nghĩa vụ, nghi ngờ, chứ không khẳng định nó là thật.</p><p>Cấu tạo: lấy động từ chia với <strong>ils</strong> ở hiện tại, bỏ <strong>-ent</strong>, thêm <strong>-e, -es, -e, -ions, -iez, -ent</strong>. Ví dụ: ils parlent → que je parle; ils finissent → que je finisse.</p>" },
      { loai: "bang", tieuDe: "Dùng sau…", cot: ["Ý nghĩa", "Biểu đạt"], hang: [["Mong muốn", "vouloir que, souhaiter que, préférer que"], ["Nghĩa vụ", "il faut que, il est nécessaire que"], ["Cảm xúc", "être content que, avoir peur que, regretter que"], ["Nghi ngờ", "douter que, ne pas penser que"], ["Một số liên từ", "pour que, avant que, bien que, à condition que"]] },
      { loai: "bang", tieuDe: "Bất quy tắc hay gặp", cot: ["Động từ", "que je…", "que nous…"], hang: [["être", "sois", "soyons"], ["avoir", "aie", "ayons"], ["aller", "aille", "allions"], ["faire", "fasse", "fassions"], ["pouvoir", "puisse", "puissions"], ["savoir", "sache", "sachions"], ["vouloir", "veuille", "voulions"]] },
      { loai: "luuY", ds: ["CÙNG một chủ ngữ thì dùng nguyên mẫu: <em>Je veux <strong>partir</strong>.</em> (không phải « je veux que je parte »).", "« Penser que », « croire que » ở thể khẳng định đi với indicatif: <em>Je pense qu'il <strong>est</strong> là.</em>"] },
    ],
    baiTap: [
      { loai: "dien", de: "Il faut que tu ___ (finir) ce travail.", dap: ["finisses"], giai: "ils finissent → finiss- + es." },
      { loai: "dien", de: "Je veux que vous ___ (être) à l'heure.", dap: ["soyez"], giai: "être → soyez." },
      { loai: "qcm", de: "Câu nào đúng?", pa: ["Je veux partir.", "Je veux que je parte.", "Je veux que partir."], dap: 0, giai: "Cùng chủ ngữ → nguyên mẫu." },
      { loai: "dien", de: "Bien qu'il ___ (faire) froid, nous sortons.", dap: ["fasse"], giai: "bien que + subjonctif; faire → fasse." },
      { loai: "qcm", de: "Je pense qu'elle ___ raison.", pa: ["a", "ait", "avoir"], dap: 0, giai: "penser que (khẳng định) + indicatif." },
      { loai: "dien", de: "Mes parents sont contents que je ___ (venir).", dap: ["vienne"], giai: "ils viennent → vienn- + e." },
    ],
    tuKhoa: ["subjonctif"] },

  { ma: "b1-conditionnel-si", cap: "B1", ten: "Câu điều kiện với si", tenFr: "Le conditionnel et l'hypothèse avec si",
    tomTat: "Ba kiểu câu với « si »: điều kiện thật, giả định ở hiện tại, và điều tiếc nuối ở quá khứ. Cách chia conditionnel.",
    phan: [
      { loai: "doan", html: "<p><strong>Conditionnel présent</strong> = gốc của futur simple + đuôi của imparfait (-ais, -ais, -ait, -ions, -iez, -aient): je <strong>parlerais</strong>, je <strong>serais</strong>, j'<strong>irais</strong>. Ngoài câu điều kiện, nó dùng để <strong>lịch sự</strong> (Je <strong>voudrais</strong> un café) và <strong>khuyên</strong> (Tu <strong>devrais</strong> dormir).</p>" },
      { loai: "bang", tieuDe: "Ba kiểu câu với si", cot: ["Kiểu", "Mệnh đề si", "Mệnh đề chính", "Ví dụ"], hang: [
        ["Điều kiện có thể xảy ra", "si + présent", "présent / futur / impératif", "S'il pleut, je resterai à la maison."],
        ["Giả định trái thực tế hiện tại", "si + imparfait", "conditionnel présent", "Si j'avais du temps, je voyagerais."],
        ["Tiếc nuối về quá khứ", "si + plus-que-parfait", "conditionnel passé", "Si j'avais su, je serais venu."],
      ] },
      { loai: "loi", ds: [["Si j'aurais de l'argent…", "Si j'avais de l'argent…", "KHÔNG BAO GIỜ dùng conditionnel ngay sau si."], ["Si il vient", "S'il vient", "si + il → s'il."]] },
    ],
    baiTap: [
      { loai: "dien", de: "Si j'étais riche, j'___ (acheter) une maison.", dap: ["achèterais"], giai: "si + imparfait → conditionnel; acheter → achèter- + ais." },
      { loai: "qcm", de: "S'il ___ beau demain, nous irons à la plage.", pa: ["fait", "faisait", "ferait"], dap: 0, giai: "Điều kiện có thể xảy ra: si + présent." },
      { loai: "qcm", de: "Si tu ___ plus, tu réussirais.", pa: ["travaillais", "travaillerais", "travailles"], dap: 0, giai: "Mệnh đề chính conditionnel → si + imparfait." },
      { loai: "dien", de: "Je ___ (vouloir) un renseignement, s'il vous plaît.", dap: ["voudrais"], giai: "Conditionnel lịch sự: voudr- + ais." },
      { loai: "qcm", de: "Si j'avais su, je ___ plus tôt.", pa: ["serais parti", "partirais", "pars"], dap: 0, giai: "si + plus-que-parfait → conditionnel passé." },
      { loai: "dien", de: "Nous ___ (être) ravis de vous voir.", dap: ["serions"], giai: "être → ser- + ions." },
    ],
    tuKhoa: ["conditionnel", "hypothèse"] },

  { ma: "b1-discours-indirect", cap: "B1", ten: "Câu gián tiếp", tenFr: "Le discours indirect",
    tomTat: "Thuật lại lời người khác: đổi đại từ, dùng que / si / từ để hỏi, và lùi thì khi động từ dẫn ở quá khứ.",
    phan: [
      { loai: "bang", tieuDe: "Cách nối", cot: ["Câu trực tiếp", "Câu gián tiếp"], hang: [
        ["Câu kể: « Je suis fatigué. »", "Il dit qu'il est fatigué."],
        ["Câu hỏi có/không: « Tu viens ? »", "Il demande si je viens."],
        ["Câu hỏi có từ để hỏi: « Où vas-tu ? »", "Il demande où je vais."],
        ["« Qu'est-ce que tu fais ? »", "Il demande ce que je fais."],
        ["Câu mệnh lệnh: « Ferme la porte ! »", "Il me dit de fermer la porte."],
      ] },
      { loai: "bang", tieuDe: "Lùi thì khi động từ dẫn ở quá khứ (il a dit…)", cot: ["Trực tiếp", "Gián tiếp"], hang: [["présent", "imparfait"], ["passé composé", "plus-que-parfait"], ["futur simple", "conditionnel présent"], ["aujourd'hui / demain / hier", "ce jour-là / le lendemain / la veille"]] },
      { loai: "vidu", ds: [["Elle a dit : « Je partirai demain. »", "→ Elle a dit qu'elle partirait le lendemain."], ["Il m'a demandé : « Tu as mangé ? »", "→ Il m'a demandé si j'avais mangé."]] },
    ],
    baiTap: [
      { loai: "qcm", de: "« Tu aimes le café ? » → Il me demande ___ j'aime le café.", pa: ["si", "que", "ce que"], dap: 0, giai: "Câu hỏi có/không → si." },
      { loai: "qcm", de: "« Qu'est-ce que tu veux ? » → Elle demande ___ je veux.", pa: ["ce que", "qu'est-ce que", "que"], dap: 0, giai: "qu'est-ce que → ce que." },
      { loai: "dien", de: "« Je suis malade. » → Il a dit qu'il ___ malade.", dap: ["était"], giai: "Động từ dẫn quá khứ: présent → imparfait." },
      { loai: "qcm", de: "« Viens ici ! » → Il m'a dit ___ ici.", pa: ["de venir", "que je viens", "si je viens"], dap: 0, giai: "Mệnh lệnh → de + nguyên mẫu." },
      { loai: "dien", de: "« Je viendrai. » → Elle a promis qu'elle ___.", dap: ["viendrait"], giai: "futur → conditionnel." },
      { loai: "qcm", de: "« J'ai fini. » → Il a dit qu'il ___ fini.", pa: ["avait", "a", "aura"], dap: 0, giai: "passé composé → plus-que-parfait." },
    ],
    tuKhoa: ["discours indirect", "rapporté"] },
];
