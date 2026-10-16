/* Học ngữ pháp · A1 (16/10, theo chủ dự án): 16 bài theo khung chủ điểm của một
 * giáo trình A1 chủ dự án gửi (CHỈ lấy danh sách chủ điểm; lý thuyết, ví dụ và bài
 * tập do FRACILE tự viết). Nội dung học: KHÔNG dùng dấu gạch dài. */

const q = (de, pa, dap, giai) => ({ loai: "qcm", de, pa, dap, giai });
const d = (de, dap, giai) => ({ loai: "dien", de, dap: [].concat(dap), giai });

export const BAI_A1 = [
  { ma: "a1-etre-avoir", cap: "A1", ten: "Être và avoir ở hiện tại", tenFr: "Être et avoir au présent",
    tomTat: "Hai động từ quan trọng nhất: là (être) và có (avoir), cùng các đại từ chủ ngữ.",
    phan: [
      { loai: "bang", tieuDe: "Đại từ chủ ngữ", cot: ["Tiếng Pháp", "Nghĩa"], hang: [["je (j')", "tôi"], ["tu", "bạn (thân mật, một người)"], ["il / elle / on", "anh ấy / cô ấy / người ta, chúng ta (văn nói)"], ["nous", "chúng tôi, chúng ta"], ["vous", "các bạn; ngài (lịch sự)"], ["ils / elles", "họ (nam hoặc hỗn hợp) / họ (toàn nữ)"]] },
      { loai: "bang", tieuDe: "Chia être và avoir", cot: ["", "être (là, ở)", "avoir (có)"], hang: [["je / j'", "je suis", "j'ai"], ["tu", "tu es", "tu as"], ["il / elle / on", "il est", "il a"], ["nous", "nous sommes", "nous avons"], ["vous", "vous êtes", "vous avez"], ["ils / elles", "ils sont", "ils ont"]] },
      { loai: "doan", html: "<p><strong>être</strong> dùng để nói nghề nghiệp, quốc tịch, tính chất, nơi chốn: <em>Je suis étudiant. Elle est vietnamienne. Nous sommes à Hanoi.</em></p><p><strong>avoir</strong> dùng để nói sở hữu và <strong>tuổi</strong>: <em>J'ai un chat. Il a vingt ans.</em> (tiếng Pháp « có » tuổi, không « là » tuổi).</p>" },
      { loai: "loi", ds: [["Je suis 20 ans.", "J'ai 20 ans.", "Tuổi dùng avoir."], ["Je ai un frère.", "J'ai un frère.", "je + nguyên âm → j'."], ["Il est un médecin.", "Il est médecin.", "Sau être, nghề nghiệp KHÔNG có mạo từ."]] },
    ],
    baiTap: [d("Nous ___ (être) à Paris.", "sommes", "nous sommes."), d("Elle ___ (avoir) deux enfants.", "a", "elle a."), d("Vous ___ (être) français ?", "êtes", "vous êtes."), q("Tôi 18 tuổi:", ["J'ai 18 ans.", "Je suis 18 ans.", "J'ai 18 années."], 0, "Tuổi dùng avoir + ans."), d("Ils ___ (avoir) une voiture rouge.", "ont", "ils ont."), q("Câu nào đúng?", ["Il est professeur.", "Il est un professeur.", "Il a professeur."], 0, "Nghề nghiệp sau être không mạo từ.")],
    tuKhoa: ["être", "avoir"] },

  { ma: "a1-present", cap: "A1", ten: "Thì hiện tại của động từ", tenFr: "Le présent de l'indicatif",
    tomTat: "Chia động từ -er đều, -ir kiểu finir và partir, và các động từ hay gặp: faire, prendre, venir, pouvoir, vouloir, devoir…",
    phan: [
      { loai: "bang", tieuDe: "Động từ -er (nhóm 1): parler", cot: ["", "", "Đuôi"], hang: [["je parle", "nous parlons", "-e / -ons"], ["tu parles", "vous parlez", "-es / -ez"], ["il parle", "ils parlent", "-e / -ent"]] },
      { loai: "luuY", ds: ["-e, -es, -ent đọc giống nhau (câm): je parle, tu parles, ils parlent đều đọc /paʁl/.", "Động từ -ger giữ e ở nous: nous mangeons. Động từ -cer thêm ç: nous commençons.", "aller là động từ -er BẤT QUY TẮC: je vais, tu vas, il va, nous allons, vous allez, ils vont."] },
      { loai: "bang", tieuDe: "Động từ -ir: hai mẫu", cot: ["finir (choisir, réussir…)", "partir (sortir, dormir…)"], hang: [["je finis", "je pars"], ["tu finis", "tu pars"], ["il finit", "il part"], ["nous finissons", "nous partons"], ["vous finissez", "vous partez"], ["ils finissent", "ils partent"]] },
      { loai: "bang", tieuDe: "Động từ bất quy tắc hay gặp", cot: ["Động từ", "je / nous / ils"], hang: [["faire (làm)", "fais / faisons / font"], ["prendre (lấy, đi xe)", "prends / prenons / prennent"], ["venir (đến)", "viens / venons / viennent"], ["mettre (đặt, mặc)", "mets / mettons / mettent"], ["lire / écrire / dire", "lis, écris, dis / lisons, écrivons, disons / lisent, écrivent, disent"], ["savoir / connaître", "sais, connais / savons, connaissons / savent, connaissent"], ["pouvoir / vouloir / devoir", "peux, veux, dois / pouvons, voulons, devons / peuvent, veulent, doivent"]] },
      { loai: "doan", html: "<p><strong>Động từ phản thân</strong> đi với đại từ cùng ngôi: <em>je <strong>me</strong> lève, tu <strong>te</strong> lèves, il <strong>se</strong> lève, nous <strong>nous</strong> levons, vous <strong>vous</strong> levez, ils <strong>se</strong> lèvent</em>.</p><p><strong>savoir</strong> = biết một thông tin, biết làm gì (Je sais nager). <strong>connaître</strong> = biết người, nơi chốn (Je connais Paris).</p>" },
    ],
    baiTap: [d("Nous ___ (habiter) à Huế.", "habitons", "-er: nous + -ons."), d("Ils ___ (finir) à 18 heures.", "finissent", "finir: ils finissent."), d("Je ___ (prendre) le bus.", "prends", "prendre: je prends."), d("Vous ___ (faire) du sport ?", "faites", "faire: vous faites (bất quy tắc)."), q("« Tôi biết Paul » là:", ["Je connais Paul.", "Je sais Paul.", "Je connaître Paul."], 0, "Biết người → connaître."), d("Elle ___ (se lever) à 7 heures.", "se lève", "se lever: elle se lève."), d("Tu ___ (pouvoir) venir ?", "peux", "pouvoir: tu peux.")],
    tuKhoa: ["présent", "conjugaison", "verbes"] },

  { ma: "a1-il-cest", cap: "A1", ten: "Cấu trúc vô nhân xưng il và c'est", tenFr: "Il impersonnel, c'est / il est",
    tomTat: "Il fait beau, il y a, il faut; và cách chọn giữa c'est và il est.",
    phan: [
      { loai: "bang", tieuDe: "Cấu trúc với il (không chỉ người nào)", cot: ["Cấu trúc", "Nghĩa", "Ví dụ"], hang: [["il fait + thời tiết", "trời…", "Il fait chaud. Il fait beau."], ["il pleut / il neige", "trời mưa / tuyết", "Il pleut beaucoup en été."], ["il est + giờ", "bây giờ là… giờ", "Il est huit heures."], ["il y a", "có", "Il y a un parc près d'ici."], ["il faut + nguyên mẫu", "cần phải", "Il faut partir."]] },
      { loai: "bang", tieuDe: "C'est hay il est?", cot: ["Dùng c'est / ce sont", "Dùng il est / ils sont"], hang: [["+ mạo từ / tính từ sở hữu + danh từ: C'est un ami. Ce sont mes parents.", "+ tính từ nói về người: Il est grand. Elle est gentille."], ["+ tên riêng: C'est Marie.", "+ nghề, quốc tịch KHÔNG mạo từ: Il est médecin."], ["+ tính từ nói chung chung: C'est beau ! C'est facile.", ""]] },
    ],
    baiTap: [q("Trời đẹp:", ["Il fait beau.", "C'est beau temps.", "Il est beau."], 0, "Thời tiết: il fait."), q("___ un bon film.", ["C'est", "Il est", "Il y a"], 0, "Mạo từ + danh từ → c'est."), q("Marc ? ___ très sympa.", ["Il est", "C'est", "Il fait"], 0, "Tính từ nói về người → il est."), d("___ trois chambres dans l'appartement. (có)", ["Il y a"], "« có » (tồn tại) → il y a."), q("___ mes amis.", ["Ce sont", "Ils sont", "C'est"], 0, "Số nhiều + tính từ sở hữu + danh từ → ce sont."), q("Bây giờ là 3 giờ:", ["Il est trois heures.", "C'est trois heures.", "Il a trois heures."], 0, "Giờ: il est.")],
    tuKhoa: ["impersonnel", "c'est"] },

  { ma: "a1-interrogation", cap: "A1", ten: "Câu hỏi", tenFr: "L'interrogation",
    tomTat: "Ba cách đặt câu hỏi, các từ để hỏi (qui, que, où, quand, comment, pourquoi, combien) và quel.",
    phan: [
      { loai: "bang", tieuDe: "Ba cách hỏi có / không", cot: ["Cách", "Ví dụ", "Mức"], hang: [["Lên giọng", "Tu viens ?", "nói, thân mật"], ["Est-ce que", "Est-ce que tu viens ?", "trung tính, dễ nhất"], ["Đảo chủ ngữ", "Viens-tu ?", "trang trọng, văn viết"]] },
      { loai: "bang", tieuDe: "Từ để hỏi", cot: ["Từ", "Nghĩa", "Ví dụ"], hang: [["qui", "ai", "Qui est-ce ?"], ["que / qu'est-ce que / quoi", "gì", "Qu'est-ce que tu fais ? Tu fais quoi ?"], ["où", "ở đâu", "Où habites-tu ?"], ["quand", "khi nào", "Quand est-ce que tu pars ?"], ["comment", "thế nào", "Comment tu t'appelles ?"], ["pourquoi", "tại sao (trả lời: parce que)", "Pourquoi tu ris ?"], ["combien (de)", "bao nhiêu", "Combien de frères as-tu ?"]] },
      { loai: "doan", html: "<p><strong>Quel</strong> (cái nào, gì) hợp giống số với danh từ: <em>quel</em> livre, <em>quelle</em> heure, <em>quels</em> films, <em>quelles</em> couleurs. <em>Quelle heure est-il ?</em></p>" },
    ],
    baiTap: [q("___ tu habites ? À Lyon.", ["Où", "Quand", "Qui"], 0, "Hỏi nơi chốn → où."), q("___ heure est-il ?", ["Quelle", "Quel", "Quels"], 0, "heure giống cái số ít → quelle."), q("___ tu apprends le français ? Parce que j'aime la France.", ["Pourquoi", "Comment", "Combien"], 0, "Trả lời parce que → hỏi pourquoi."), d("___ tu viens ? (hỏi bằng est-ce que)", ["Est-ce que"], "Est-ce que + câu kể."), q("___ coûte ce livre ?", ["Combien", "Quel", "Où"], 0, "Hỏi giá → combien."), q("Câu hỏi trang trọng nhất:", ["Parlez-vous anglais ?", "Vous parlez anglais ?", "Est-ce que vous parlez anglais ?"], 0, "Đảo chủ ngữ → trang trọng.")],
    tuKhoa: ["interrogation", "question"] },

  { ma: "a1-negation", cap: "A1", ten: "Câu phủ định", tenFr: "La négation",
    tomTat: "ne… pas, ne… personne, ne… rien: vị trí với một động từ, với động từ + nguyên mẫu, với động từ phản thân.",
    phan: [
      { loai: "doan", html: "<p>Phủ định gồm <strong>hai phần</strong> bao quanh động từ chia: <em>Je <strong>ne</strong> parle <strong>pas</strong> anglais.</em> Trước nguyên âm, ne → <strong>n'</strong>: <em>Il <strong>n'</strong>aime <strong>pas</strong> le café.</em></p>" },
      { loai: "bang", tieuDe: "Vị trí", cot: ["Trường hợp", "Ví dụ"], hang: [["Một động từ", "Je ne travaille pas."], ["Động từ + nguyên mẫu", "Je ne veux pas partir. (ne… pas bao động từ chia)"], ["Động từ phản thân", "Je ne me lève pas tôt. (ne trước đại từ)"], ["ne… personne (không ai)", "Je ne connais personne ici."], ["ne… rien (không gì)", "Il ne mange rien."]] },
      { loai: "luuY", ds: ["Sau phủ định, un / une / des → <strong>de (d')</strong>: J'ai un chien → Je n'ai <strong>pas de</strong> chien.", "Khi nói nhanh, người Pháp hay bỏ « ne » (Je sais pas), nhưng khi viết phải có."] },
    ],
    baiTap: [d("Je parle chinois. → Je ___ chinois.", ["ne parle pas"], "ne + động từ + pas."), d("Il aime le sport. → Il ___ le sport.", ["n'aime pas"], "ne → n' trước nguyên âm."), q("J'ai une voiture. → Phủ định:", ["Je n'ai pas de voiture.", "Je n'ai pas une voiture.", "Je n'ai une voiture pas."], 0, "Sau pas: une → de."), q("Không ai đến:", ["Personne ne vient.", "Personne vient pas.", "Ne personne vient."], 0, "Personne làm chủ ngữ: Personne ne + động từ."), q("Je me couche tard. → Phủ định:", ["Je ne me couche pas tard.", "Je me ne couche pas tard.", "Je ne couche me pas tard."], 0, "ne đứng trước đại từ phản thân."), d("Tu veux manger ? Non, je ___ (rien).", ["ne veux rien manger", "ne veux rien"], "ne… rien bao động từ chia.")],
    tuKhoa: ["négation"] },

  { ma: "a1-nom-article", cap: "A1", ten: "Danh từ và mạo từ", tenFr: "Le nom et l'article",
    tomTat: "Giống đực, giống cái, số nhiều của danh từ; mạo từ un/une/des, le/la/les và mạo từ rút gọn au, du.",
    phan: [
      { loai: "doan", html: "<p>Mọi danh từ đều có <strong>giống</strong>: đực hoặc cái. Với đồ vật thì phải học kèm mạo từ. Một số đuôi hay gặp: <strong>-tion, -té, -ette, -ure</strong> thường giống cái (la nation, la liberté); <strong>-ment, -age, -eau</strong> thường giống đực (le moment, le fromage, le bureau).</p><p>Với người, thường thêm <strong>-e</strong> cho giống cái (un ami → une amie), có biến thể: -eur → -euse (vendeur → vendeuse), -ien → -ienne.</p>" },
      { loai: "bang", tieuDe: "Số nhiều", cot: ["Quy tắc", "Ví dụ"], hang: [["Thường: + s (câm)", "un livre → des livres"], ["-eau, -eu → + x", "un gâteau → des gâteaux"], ["-al → -aux", "un journal → des journaux"], ["-s, -x, -z: giữ nguyên", "un fils → des fils"]] },
      { loai: "bang", tieuDe: "Mạo từ", cot: ["", "Không xác định", "Xác định"], hang: [["giống đực", "un", "le (l')"], ["giống cái", "une", "la (l')"], ["số nhiều", "des", "les"]] },
      { loai: "doan", html: "<p><strong>Không xác định</strong> (un, une, des): nói lần đầu, một cái bất kỳ. <strong>Xác định</strong> (le, la, les): cái đã biết, hoặc nói chung chung về sở thích: <em>J'aime <strong>le</strong> café.</em></p><p><strong>Mạo từ rút gọn:</strong> à + le = <strong>au</strong>, à + les = <strong>aux</strong>; de + le = <strong>du</strong>, de + les = <strong>des</strong>. (à la, à l', de la, de l' giữ nguyên.) <em>Je vais <strong>au</strong> cinéma. Le livre <strong>du</strong> professeur.</em></p>" },
    ],
    baiTap: [q("___ université", ["l'", "le", "la"], 0, "Trước nguyên âm: l'."), d("un journal → des ___", "journaux", "-al → -aux."), q("J'aime ___ musique.", ["la", "une", "de"], 0, "Sở thích → mạo từ xác định."), d("Je vais ___ marché. (à + le)", "au", "à + le = au."), d("Le stylo ___ professeur. (de + le)", "du", "de + le = du."), q("un chanteur → giống cái:", ["une chanteuse", "une chanteure", "une chantrice"], 0, "-eur → -euse.")],
    tuKhoa: ["article", "nom", "pluriel"] },

  { ma: "a1-demonstratif-possessif", cap: "A1", ten: "Tính từ chỉ định và sở hữu", tenFr: "Démonstratifs et possessifs",
    tomTat: "ce, cet, cette, ces (này, kia) và mon, ton, son… (của tôi, của bạn…).",
    phan: [
      { loai: "bang", tieuDe: "Tính từ chỉ định", cot: ["", "Dạng", "Ví dụ"], hang: [["giống đực", "ce", "ce livre"], ["giống đực trước nguyên âm / h câm", "cet", "cet homme, cet arbre"], ["giống cái", "cette", "cette maison"], ["số nhiều", "ces", "ces enfants"]] },
      { loai: "bang", tieuDe: "Tính từ sở hữu", cot: ["Của", "giống đực", "giống cái", "số nhiều"], hang: [["tôi", "mon", "ma", "mes"], ["bạn", "ton", "ta", "tes"], ["anh ấy / cô ấy", "son", "sa", "ses"], ["chúng tôi", "notre", "notre", "nos"], ["các bạn", "votre", "votre", "vos"], ["họ", "leur", "leur", "leurs"]] },
      { loai: "luuY", ds: ["Sở hữu hợp với <strong>vật được sở hữu</strong>, không với người sở hữu: <em>Paul aime <strong>sa</strong> mère</em> (mère giống cái).", "Trước danh từ giống cái bắt đầu bằng nguyên âm, dùng mon / ton / son: <em><strong>mon</strong> amie, <strong>son</strong> école</em>."] },
    ],
    baiTap: [q("___ arbre est très vieux.", ["Cet", "Ce", "Cette"], 0, "Giống đực trước nguyên âm → cet."), q("___ chaussures sont belles.", ["Ces", "Cette", "Ce"], 0, "Số nhiều → ces."), q("Marie et ___ frère.", ["son", "sa", "ses"], 0, "frère giống đực → son (dù Marie là nữ)."), q("C'est ___ amie Lucie.", ["mon", "ma", "mes"], 0, "Giống cái trước nguyên âm → mon."), d("Ce sont les livres de nous. → Ce sont ___ livres.", "nos", "nous + số nhiều → nos."), q("Pierre et Anne vendent ___ maison.", ["leur", "leurs", "sa"], 0, "Của họ, một vật → leur.")],
    tuKhoa: ["possessif", "démonstratif"] },

  { ma: "a1-adjectif", cap: "A1", ten: "Tính từ", tenFr: "L'adjectif qualificatif",
    tomTat: "Tính từ hợp giống và số với danh từ; vị trí thường đứng SAU danh từ.",
    phan: [
      { loai: "bang", tieuDe: "Giống cái của tính từ", cot: ["Quy tắc", "Ví dụ"], hang: [["+ e", "grand → grande, petit → petite"], ["đã có -e: giữ nguyên", "rouge → rouge, jeune → jeune"], ["-eux → -euse", "heureux → heureuse"], ["-if → -ive", "sportif → sportive"], ["-en, -on → -enne, -onne", "italien → italienne, bon → bonne"], ["-er → -ère", "cher → chère"], ["Bất quy tắc", "beau → belle, nouveau → nouvelle, vieux → vieille, blanc → blanche"]] },
      { loai: "doan", html: "<p><strong>Số nhiều:</strong> thêm -s (grands, grandes); -eux giữ nguyên; -al → -aux (national → nationaux).</p><p><strong>Vị trí:</strong> đa số tính từ đứng <strong>sau</strong> danh từ: <em>une voiture rouge</em>. Một nhóm ngắn hay dùng đứng <strong>trước</strong>: beau, joli, bon, mauvais, grand, petit, jeune, vieux, nouveau: <em>un petit chat</em>.</p>" },
      { loai: "luuY", ds: ["beau, nouveau, vieux trước danh từ giống đực bắt đầu bằng nguyên âm thành <strong>bel, nouvel, vieil</strong>: un bel homme."] },
    ],
    baiTap: [d("Une fille ___ (heureux).", "heureuse", "-eux → -euse."), d("Des maisons ___ (blanc).", "blanches", "blanc → blanche + s."), q("Vị trí đúng:", ["une voiture rouge", "une rouge voiture", "rouge une voiture"], 0, "Màu sắc đứng sau danh từ."), q("un ___ appartement", ["bel", "beau", "belle"], 0, "Trước nguyên âm: beau → bel."), d("Une étudiante ___ (italien).", "italienne", "-ien → -ienne."), q("des livres ___ (intéressant)", ["intéressants", "intéressantes", "intéressant"], 0, "livres giống đực số nhiều.")],
    tuKhoa: ["adjectif", "accord"] },

  { ma: "a1-partitif", cap: "A1", ten: "Mạo từ bộ phận và số lượng", tenFr: "L'article partitif et les quantités",
    tomTat: "du, de la, de l' cho thứ không đếm được; beaucoup de, un peu de, un kilo de…",
    phan: [
      { loai: "doan", html: "<p><strong>Mạo từ bộ phận</strong> chỉ <strong>một phần, một ít</strong> của thứ không đếm được (đồ ăn, uống, chất liệu): <em>Je bois <strong>du</strong> café. Il mange <strong>de la</strong> salade. Tu veux <strong>de l'</strong>eau ?</em></p>" },
      { loai: "bang", tieuDe: "Ba mạo từ hay nhầm", cot: ["", "Dùng khi", "Ví dụ"], hang: [["le / la / les", "nói chung, sở thích", "J'aime le fromage."], ["un / une", "một cái đếm được", "Je mange une pomme."], ["du / de la / de l'", "một ít, không đếm", "Je mange du fromage."]] },
      { loai: "doan", html: "<p><strong>Phủ định</strong> và <strong>sau từ chỉ số lượng</strong>, chỉ dùng <strong>de (d')</strong>: <em>Je ne bois pas <strong>de</strong> café. Beaucoup <strong>de</strong> sucre. Un kilo <strong>de</strong> tomates. Une bouteille <strong>d'</strong>eau.</em></p>" },
    ],
    baiTap: [q("Le matin, je bois ___ thé.", ["du", "de la", "le"], 0, "thé giống đực, một ít → du."), q("Tu veux ___ eau ?", ["de l'", "du", "de la"], 0, "Trước nguyên âm → de l'."), q("Je ne mange pas ___ viande.", ["de", "de la", "la"], 0, "Phủ định → de."), d("Un kilo ___ pommes.", "de", "Sau số lượng → de."), q("J'adore ___ chocolat.", ["le", "du", "de"], 0, "Sở thích → le."), d("Il y a beaucoup ___ monde.", "de", "beaucoup de.")],
    tuKhoa: ["partitif", "quantité"] },

  { ma: "a1-lieu", cap: "A1", ten: "Diễn đạt nơi chốn", tenFr: "L'expression du lieu",
    tomTat: "à / en / au / aux trước thành phố và quốc gia; à, de, chez; dans, sur, sous, devant, derrière, entre.",
    phan: [
      { loai: "bang", tieuDe: "Đi tới / ở thành phố, quốc gia", cot: ["Trước", "Giới từ", "Ví dụ"], hang: [["thành phố", "à", "à Paris, à Hanoi"], ["nước giống cái (thường tận cùng -e)", "en", "en France, en Italie"], ["nước giống đực", "au", "au Vietnam, au Japon"], ["nước số nhiều", "aux", "aux États-Unis"], ["nước bắt đầu bằng nguyên âm", "en", "en Iran"]] },
      { loai: "doan", html: "<p><strong>à</strong>: đi tới, ở một nơi (à la banque, au parc). <strong>de</strong>: từ đâu đến (Je viens <strong>de</strong> Lyon, <strong>du</strong> Japon). <strong>chez</strong> + người: ở nhà ai, tại cửa hàng của ai (chez Marie, chez le médecin).</p>" },
      { loai: "bang", tieuDe: "Giới từ vị trí", cot: ["Giới từ", "Nghĩa"], hang: [["dans", "trong"], ["sur / sous", "trên (chạm mặt) / dưới"], ["devant / derrière", "trước / sau"], ["entre", "giữa (hai thứ)"], ["à côté de / en face de / près de / loin de", "bên cạnh / đối diện / gần / xa"]] },
    ],
    baiTap: [q("J'habite ___ Vietnam.", ["au", "en", "à"], 0, "Vietnam giống đực → au."), q("Elle travaille ___ Allemagne.", ["en", "au", "à"], 0, "Allemagne giống cái → en."), q("Nous allons ___ Rome.", ["à", "en", "au"], 0, "Thành phố → à."), q("Je vais ___ le dentiste.", ["chez", "à", "au"], 0, "Đến chỗ một người → chez."), d("Le chat est ___ la table. (dưới)", "sous", "sous = dưới."), q("Il vient ___ Japon.", ["du", "de", "au"], 0, "de + le Japon → du.")],
    tuKhoa: ["lieu", "préposition"] },

  { ma: "a1-temps", cap: "A1", ten: "Diễn đạt thời gian", tenFr: "L'expression du temps",
    tomTat: "Các thời điểm trong ngày, thói quen (le lundi) và một lần (lundi), giới từ thời gian, trạng từ tần suất.",
    phan: [
      { loai: "bang", tieuDe: "Thói quen hay một lần", cot: ["Thói quen (le…)", "Một lần"], hang: [["Le lundi, je vais à la piscine. (mỗi thứ hai)", "Lundi, je vais chez le médecin. (thứ hai tới)"], ["Le matin, je cours.", "Ce matin, je suis en retard."]] },
      { loai: "bang", tieuDe: "Giới từ thời gian", cot: ["Giới từ", "Dùng với", "Ví dụ"], hang: [["à", "giờ", "à 8 heures"], ["en", "tháng, năm, mùa (trừ mùa xuân)", "en mai, en 2026, en été"], ["au", "mùa xuân", "au printemps"], ["le", "ngày", "le 14 juillet"], ["de… à…", "từ… đến…", "de 9 h à 17 h"], ["pendant / dans / il y a", "trong suốt / sau (tương lai) / cách đây", "pendant deux heures, dans une semaine, il y a trois jours"]] },
      { loai: "bang", tieuDe: "Trạng từ tần suất", cot: ["", "", ""], hang: [["toujours (luôn)", "souvent (thường)", "parfois / quelquefois (thỉnh thoảng)"], ["rarement (hiếm khi)", "ne… jamais (không bao giờ)", "tous les jours (hằng ngày)"]] },
    ],
    baiTap: [q("Il est né ___ 2005.", ["en", "à", "le"], 0, "Năm → en."), q("Le cours commence ___ 9 heures.", ["à", "en", "dans"], 0, "Giờ → à."), q("Mỗi chủ nhật tôi đi chợ:", ["Le dimanche, je vais au marché.", "Dimanche, je vais au marché.", "En dimanche, je vais au marché."], 0, "Thói quen → le dimanche."), q("___ printemps", ["Au", "En", "À"], 0, "Riêng mùa xuân: au printemps."), d("Je ne fume ___. (không bao giờ)", "jamais", "ne… jamais."), q("Je pars ___ deux jours. (hai ngày nữa)", ["dans", "il y a", "pendant"], 0, "Tương lai, sau một khoảng → dans.")],
    tuKhoa: ["temps", "fréquence"] },

  { ma: "a1-toniques-cod-coi", cap: "A1", ten: "Đại từ nhấn mạnh và bổ ngữ", tenFr: "Pronoms toniques, COD, COI",
    tomTat: "moi, toi, lui, elle…; đại từ COD (le, la, les) và COI (lui, leur); vị trí trong câu phủ định.",
    phan: [
      { loai: "bang", tieuDe: "Đại từ nhấn mạnh", cot: ["Chủ ngữ", "Nhấn mạnh"], hang: [["je", "moi"], ["tu", "toi"], ["il / elle", "lui / elle"], ["nous / vous", "nous / vous"], ["ils / elles", "eux / elles"]] },
      { loai: "doan", html: "<p>Dùng đại từ nhấn mạnh: để nhấn mạnh (<em>Moi, j'aime le thé</em>), sau giới từ (<em>avec toi, chez eux</em>), sau c'est (<em>C'est lui</em>), trong câu ngắn (<em>Et toi ?</em>).</p><p><strong>COD</strong> thay bổ ngữ không giới từ: <em>Je vois Marie → Je <strong>la</strong> vois.</em> <strong>COI</strong> thay « à + người »: <em>Je parle à Marie → Je <strong>lui</strong> parle.</em> Cả hai đứng <strong>trước động từ</strong>.</p>" },
      { loai: "doan", html: "<p><strong>Trong câu phủ định:</strong> ne đứng trước đại từ: <em>Je <strong>ne la</strong> vois <strong>pas</strong>. Je <strong>ne lui</strong> parle <strong>pas</strong>.</em></p>" },
    ],
    baiTap: [q("Tu viens avec ___ ? (tôi)", ["moi", "me", "je"], 0, "Sau giới từ → đại từ nhấn mạnh."), q("Je regarde le film. → Je ___ regarde.", ["le", "lui", "la"], 0, "COD giống đực → le."), q("Je téléphone à mes parents. → Je ___ téléphone.", ["leur", "les", "lui"], 0, "à + nhiều người → leur."), q("Phủ định đúng:", ["Je ne les connais pas.", "Je les ne connais pas.", "Je ne connais les pas."], 0, "ne + đại từ + động từ + pas."), d("C'est ___ ? Oui, c'est Paul. (anh ấy)", "lui", "Sau c'est → lui."), q("Elle écrit à son frère. → Elle ___ écrit.", ["lui", "le", "leur"], 0, "à + một người → lui.")],
    tuKhoa: ["pronom", "COD", "COI"] },

  { ma: "a1-qui-que", cap: "A1", ten: "Đại từ quan hệ qui và que", tenFr: "Les pronoms relatifs qui et que",
    tomTat: "Nối hai câu: qui thay chủ ngữ, que thay bổ ngữ trực tiếp.",
    phan: [
      { loai: "doan", html: "<p><strong>qui</strong> thay cho <strong>chủ ngữ</strong> của động từ phía sau: <em>J'ai un ami. Il habite à Paris. → J'ai un ami <strong>qui</strong> habite à Paris.</em></p><p><strong>que (qu')</strong> thay cho <strong>bổ ngữ trực tiếp</strong>: <em>C'est un film. J'adore ce film. → C'est un film <strong>que</strong> j'adore.</em></p><p><strong>Mẹo:</strong> sau chỗ trống là ĐỘNG TỪ → qui; sau chỗ trống là CHỦ NGỮ + động từ → que.</p>" },
      { loai: "loi", ds: [["la fille que parle", "la fille qui parle", "Sau là động từ → qui."], ["le livre qui je lis", "le livre que je lis", "Sau là chủ ngữ je → que."], ["qui il", "qu'il", "Chỉ que được lược thành qu'; qui KHÔNG bao giờ lược."]] },
    ],
    baiTap: [q("La femme ___ chante est ma tante.", ["qui", "que", "qu'"], 0, "Sau là động từ → qui."), q("Le gâteau ___ tu as fait est bon.", ["que", "qui", "où"], 0, "Sau là chủ ngữ tu → que."), q("C'est une ville ___ j'aime beaucoup.", ["que", "qui", "quoi"], 0, "j'aime → que."), d("Voici le train ___ va à Lyon.", "qui", "Sau là động từ va → qui."), d("C'est le pull ___ elle a acheté.", ["qu'", "que"], "que + elle → qu'elle."), q("Les étudiants ___ arrivent sont japonais.", ["qui", "que", "qu'"], 0, "Sau là động từ → qui.")],
    tuKhoa: ["relatif", "qui que"] },

  { ma: "a1-futur-proche", cap: "A1", ten: "Tương lai gần", tenFr: "Le futur proche",
    tomTat: "aller + nguyên mẫu: việc sắp làm, kế hoạch gần. Thể khẳng định và phủ định.",
    phan: [
      { loai: "doan", html: "<p><strong>Futur proche</strong> = <strong>aller</strong> chia ở hiện tại + <strong>động từ nguyên mẫu</strong>: <em>Je <strong>vais partir</strong>. Nous <strong>allons manger</strong>.</em> Dùng cho việc sắp xảy ra, kế hoạch đã chắc.</p>" },
      { loai: "bang", tieuDe: "Chia aller", cot: ["", ""], hang: [["je vais", "nous allons"], ["tu vas", "vous allez"], ["il / elle va", "ils / elles vont"]] },
      { loai: "doan", html: "<p><strong>Phủ định:</strong> ne… pas bao quanh <strong>aller</strong>: <em>Je <strong>ne vais pas</strong> sortir ce soir.</em> Đại từ đứng trước nguyên mẫu: <em>Je vais <strong>le</strong> faire.</em></p>" },
    ],
    baiTap: [d("Ce soir, nous ___ (regarder) un film. (futur proche)", "allons regarder", "nous allons + nguyên mẫu."), d("Il ___ (pleuvoir) demain.", "va pleuvoir", "il va pleuvoir."), q("Phủ định đúng:", ["Je ne vais pas travailler.", "Je vais ne pas travailler.", "Je ne vais travailler pas."], 0, "ne… pas bao aller."), d("Tu ___ (partir) quand ?", "vas partir", "tu vas + partir."), q("Vị trí đại từ: « Je vais acheter ce livre. »", ["Je vais l'acheter.", "Je le vais acheter.", "Je vais acheter le."], 0, "Đại từ trước nguyên mẫu."), d("Elles ___ (arriver) à midi.", "vont arriver", "elles vont + nguyên mẫu.")],
    tuKhoa: ["futur proche", "futur"] },

  { ma: "a1-passe-compose", cap: "A1", ten: "Thì quá khứ passé composé", tenFr: "Le passé composé",
    tomTat: "Phân từ quá khứ của động từ -er, -ir, -oir, -re; trợ động từ avoir hay être; động từ phản thân; thể phủ định.",
    phan: [
      { loai: "bang", tieuDe: "Phân từ quá khứ", cot: ["Động từ", "Phân từ"], hang: [["-er", "-é: manger → mangé"], ["-ir (finir)", "-i: finir → fini, partir → parti"], ["-oir", "thường -u: voir → vu, pouvoir → pu, vouloir → voulu"], ["-re", "thường -u: lire → lu, attendre → attendu; nhưng prendre → pris, mettre → mis, faire → fait, écrire → écrit"]] },
      { loai: "doan", html: "<p>Đa số động từ: <strong>avoir + phân từ</strong>: <em>J'ai mangé.</em></p><p>Khoảng <strong>15 động từ chuyển động</strong> (aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, retourner, passer, devenir…) và <strong>mọi động từ phản thân</strong> dùng <strong>être</strong>, phân từ hợp giống số với chủ ngữ: <em>Elle est allée. Ils se sont levés.</em></p><p><strong>Phủ định:</strong> ne… pas bao quanh trợ động từ: <em>Je <strong>n'</strong>ai <strong>pas</strong> mangé. Elle <strong>n'</strong>est <strong>pas</strong> venue.</em></p>" },
    ],
    baiTap: [d("Hier, j'___ (téléphoner) à ma mère.", "ai téléphoné", "avoir + téléphoné."), d("Nous ___ (aller) à la mer.", "sommes allés", "aller + être, nous (giả sử giống đực)."), d("Tu ___ (lire) ce livre ?", "as lu", "lire → lu."), q("Elle ___ partie à 8 heures.", ["est", "a", "ai"], 0, "partir dùng être."), q("Phủ định: « Il a fini. »", ["Il n'a pas fini.", "Il n'a fini pas.", "Il a pas fini."], 0, "ne… pas bao avoir."), d("Ils ___ (se lever) tôt.", "se sont levés", "Phản thân → être, hợp số nhiều.")],
    tuKhoa: ["passé composé"] },

  { ma: "a1-homophones", cap: "A1", ten: "Từ đồng âm hay nhầm", tenFr: "Les homophones",
    tomTat: "a / à, est / et, ont / on, sont / son, se / ce, ou / où: đọc giống nhau, viết khác nhau.",
    phan: [
      { loai: "bang", tieuDe: "Cách phân biệt nhanh", cot: ["Cặp", "Mẹo thay thế"], hang: [["a / à", "a là động từ avoir: thay được bằng « avait ». Nếu không thay được → à (giới từ)."], ["est / et", "est là être: thay được bằng « était ». Nếu không → et (và)."], ["ont / on", "ont là avoir: thay được bằng « avaient ». on là đại từ: thay được bằng « il »."], ["sont / son", "sont là être: thay được bằng « étaient ». son là « của anh ấy »: thay được bằng « mon »."], ["se / ce", "se đứng trước động từ (se lever). ce đứng trước danh từ hoặc là « cái này » (ce livre, c'est)."], ["ou / où", "ou = hoặc: thay được bằng « ou bien ». où = ở đâu, nơi."]] },
      { loai: "vidu", ds: [["Il a un chien et il va à Paris.", "a = avoir; et = và; à = giới từ"], ["Ils ont faim, on mange ?", "ont = avoir; on = chúng ta"], ["Ses amis sont là, avec son frère.", "sont = être; son = của anh ấy"]] },
    ],
    baiTap: [q("Il ___ deux sœurs.", ["a", "à"], 0, "Thay bằng « avait » được → a."), q("Je vais ___ Lyon.", ["à", "a"], 0, "Giới từ → à."), q("Le café ___ chaud.", ["est", "et"], 0, "Thay bằng « était » được → est."), q("Ils ___ un grand jardin.", ["ont", "on"], 0, "Thay bằng « avaient » → ont."), q("Tu veux du thé ___ du café ?", ["ou", "où"], 0, "hoặc → ou."), q("Elle ___ lève à 6 heures.", ["se", "ce"], 0, "Trước động từ → se.")],
    tuKhoa: ["homophone", "orthographe"] },
];
