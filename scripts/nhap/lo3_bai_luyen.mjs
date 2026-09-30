/* Lô 3 bài luyện soạn sẵn (01/10) — NHÁP, 14 bài, rải đủ A1 → C1.
 *
 * Mục tiêu: đưa thư viện từ 46 (34 đã xuất bản + 12 nháp) lên 60 bài khi mọi
 * nháp được duyệt. Cùng quy ước với lo1/lo2: kho "assignment", giao cho
 * `__nhap__`, tiền tố « [NHÁP] ».
 *
 * Ba bài ĐỌC HIỂU dùng ngữ liệu tự soạn (không trích báo chí có bản quyền):
 * nội dung là tình huống đời thường, đáp án suy ra được từ chính đoạn văn.
 *
 * Quy tắc soạn: mỗi câu `fill` đúng MỘT ô trống; câu qcm nào có hai phương án
 * đều chấp nhận được thì bỏ. Chạy: node scripts/nhap/lo3_bai_luyen.mjs > lo3.sql */
import { toRows } from "../../src/shared/exerciseMap.js";

let dem = 0;
const id = (tien) => `${tien}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
/* Soạn tay thì đáp án đúng hay nằm ở ô đầu — học sinh nhận ra quy luật đó
   rất nhanh. Xáo phương án bằng bộ sinh số CÓ HẠT (chạy lại ra đúng thứ tự
   cũ) và dời chỉ số đáp án theo. Câu Vrai/Faux (2 phương án) giữ nguyên. */
let hat = 20261001;
const ngauNhien = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, options, answer, explanation) => {
  let opts = options.map((o, i) => ({ o, dung: i === answer }));
  if (opts.length > 2) {
    for (let i = opts.length - 1; i > 0; i--) { const k = Math.floor(ngauNhien() * (i + 1)); [opts[i], opts[k]] = [opts[k], opts[i]]; }
  }
  return { id: id("q"), type: "qcm", prompt, options: opts.map((x) => x.o), answer: opts.findIndex((x) => x.dung), explanation };
};
const fill = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });

const BAI = [
  /* ───────────── A1 ───────────── */
  { title: "Être ou avoir ?", level: "A1", skills: ["Grammaire"],
    consigne: "Complétez avec le verbe être ou avoir au présent.",
    questions: [
      fill("Je ______ étudiant à Hanoï.", "suis", "être: je suis."),
      fill("Tu ______ un frère ?", "as", "avoir: tu as."),
      fill("Elle ______ vingt ans.", "a", "Tuổi trong tiếng Pháp dùng AVOIR: elle a vingt ans."),
      fill("Nous ______ vietnamiens.", "sommes", "être: nous sommes."),
      fill("Vous ______ faim ?", "avez", "avoir faim = đói: vous avez faim."),
      fill("Ils ______ en retard.", "sont", "être en retard = bị muộn: ils sont."),
      fill("J'______ un chat noir.", "ai", "avoir: j'ai (je → j' trước nguyên âm)."),
      fill("Le café ______ chaud.", "est", "être: le café est chaud."),
      fill("Mes parents ______ une petite maison.", "ont", "avoir: ils ont."),
      fill("Vous ______ très gentil.", "êtes", "être: vous êtes — nhớ dấu mũ ê."),
    ] },
  { title: "Les nombres, l'heure et la date", level: "A1", skills: ["Vocabulaire", "Écoute"],
    consigne: "Choisissez la bonne réponse.",
    questions: [
      qcm("« Soixante-dix » s'écrit en chiffres :", ["60", "70", "80", "17"], 1, "soixante-dix = 60 + 10 = 70."),
      qcm("« Quatre-vingt-quinze » s'écrit en chiffres :", ["85", "95", "75", "415"], 1, "quatre-vingt-quinze = 4 × 20 + 15 = 95."),
      qcm("Il est 14 h 30. On peut dire aussi :", ["deux heures et demie de l'après-midi", "quatre heures et demie", "deux heures moins le quart", "midi et demi"], 0, "14 h 30 = 2 giờ rưỡi chiều."),
      qcm("Il est 8 h 45. On peut dire aussi :", ["huit heures et quart", "neuf heures moins le quart", "huit heures moins le quart", "neuf heures et quart"], 1, "8 h 45 = 9 giờ kém 15 = neuf heures moins le quart."),
      qcm("Quel jour vient après mercredi ?", ["mardi", "jeudi", "vendredi", "lundi"], 1, "lundi, mardi, mercredi, JEUDI, vendredi…"),
      qcm("Le premier mois de l'année est :", ["janvier", "juin", "juillet", "décembre"], 0, "janvier = tháng Một."),
      qcm("On écrit la date du 1er mai :", ["le un mai", "le premier mai", "le première mai", "la première mai"], 1, "Ngày 1 đọc là « premier »: le premier mai. Các ngày khác dùng số đếm: le deux mai."),
      qcm("« Il est midi » signifie :", ["12 h", "0 h", "10 h", "14 h"], 0, "midi = 12 giờ trưa; minuit = 0 giờ."),
      qcm("« Trois cent vingt » s'écrit :", ["230", "320", "3 020", "302"], 1, "trois cent vingt = 320."),
      qcm("Quelle saison vient après l'hiver ?", ["l'été", "l'automne", "le printemps", "la neige"], 2, "hiver → printemps (mùa xuân) → été → automne."),
    ] },

  /* ───────────── A2 ───────────── */
  { title: "Le passé composé avec être ou avoir", level: "A2", skills: ["Grammaire"],
    consigne: "Choisissez la forme correcte du passé composé.",
    questions: [
      qcm("Hier, nous ______ au cinéma.", ["avons allé", "sommes allés", "sommes allé", "avons allés"], 1, "aller đi với ÊTRE, phân từ hợp giống số với chủ ngữ: nous sommes allés."),
      qcm("Elle ______ son petit-déjeuner à 7 heures.", ["est pris", "a pris", "a prise", "est prise"], 1, "prendre đi với AVOIR: elle a pris."),
      qcm("Marie ______ à Paris en 2020.", ["a né", "est née", "est né", "a née"], 1, "naître đi với ÊTRE, hợp giống cái: elle est née."),
      qcm("Ils ______ très tard hier soir.", ["ont rentré", "sont rentrés", "sont rentré", "ont rentrés"], 1, "rentrer (về nhà, không có tân ngữ) đi với ÊTRE: ils sont rentrés."),
      qcm("J'______ une lettre à ma grand-mère.", ["ai écrit", "suis écrit", "ai écrite", "suis écrite"], 0, "écrire đi với AVOIR, không hợp với chủ ngữ: j'ai écrit."),
      qcm("Les enfants ______ dans le jardin.", ["ont tombé", "sont tombés", "sont tombé", "ont tombés"], 1, "tomber đi với ÊTRE: ils sont tombés."),
      qcm("Tu ______ ce film ?", ["as vu", "es vu", "as vue", "es vue"], 0, "voir đi với AVOIR: tu as vu."),
      qcm("Elles ______ de la maison à midi.", ["ont sorti", "sont sorties", "sont sortis", "ont sorties"], 1, "sortir (ra khỏi, không tân ngữ) đi với ÊTRE, hợp giống cái số nhiều: sorties."),
      qcm("Nous ______ beaucoup de photos.", ["avons fait", "sommes faits", "avons faits", "sommes fait"], 0, "faire đi với AVOIR: nous avons fait."),
      qcm("Paul ______ dans le train à 9 heures.", ["a monté", "est monté", "a montée", "est montée"], 1, "monter (lên xe, không tân ngữ) đi với ÊTRE: il est monté."),
    ] },
  { title: "Vocabulaire : la ville et les directions", level: "A2", skills: ["Vocabulaire"],
    consigne: "Choisissez le mot qui convient.",
    questions: [
      qcm("Pour acheter du pain, je vais à la ______.", ["pharmacie", "boulangerie", "poste", "librairie"], 1, "boulangerie = tiệm bánh mì."),
      qcm("Pour acheter des médicaments, je vais à la ______.", ["pharmacie", "boucherie", "gare", "banque"], 0, "pharmacie = hiệu thuốc."),
      qcm("Continuez tout ______, puis tournez à gauche.", ["droit", "droite", "gauche", "face"], 0, "tout droit = đi thẳng. « à droite » mới là rẽ phải."),
      qcm("La banque est ______ la poste et le café.", ["entre", "sur", "sous", "dans"], 0, "entre A et B = ở giữa A và B."),
      qcm("Traversez la rue au ______ piéton.", ["passage", "chemin", "trottoir", "carrefour"], 0, "passage piéton = vạch sang đường."),
      qcm("Le musée est en ______ de la mairie.", ["face", "côté", "bout", "loin"], 0, "en face de = đối diện."),
      qcm("Je prends le train à la ______.", ["gare", "station-service", "mairie", "poste"], 0, "gare = ga tàu hoả."),
      qcm("Au ______, prenez la deuxième rue à droite.", ["carrefour", "pont", "parking", "quai"], 0, "carrefour = ngã tư."),
      qcm("Pour envoyer un colis, je vais à la ______.", ["poste", "boulangerie", "gare", "piscine"], 0, "la poste = bưu điện."),
      qcm("L'hôtel est ______ côté de la gare.", ["à", "au", "en", "du"], 1, "à côté de = bên cạnh; « à côté » không đổi thành au."),
    ] },
  { title: "Lecture : un message d'une amie", level: "A2", skills: ["Lecture"],
    consigne: "Lisez le message, puis répondez aux questions.",
    readingText: "<p>Salut Linh !</p><p>Je suis bien arrivée à Lyon samedi dernier. Mon appartement est petit mais très lumineux, et il est à dix minutes à pied de l'université. Mes cours commencent lundi prochain. Pour l'instant, je découvre la ville : hier, j'ai visité le vieux quartier et j'ai mangé dans un bouchon, un restaurant typique de Lyon.</p><p>Le seul problème, c'est le temps : il pleut depuis trois jours ! Tu viens me voir pendant les vacances de décembre ? On pourrait aller ensemble au marché de Noël.</p><p>Bises,<br>Camille</p>",
    questions: [
      qcm("Où est Camille maintenant ?", ["À Paris", "À Lyon", "À Hanoï", "À Marseille"], 1, "« Je suis bien arrivée à Lyon »."),
      qcm("Quand est-elle arrivée ?", ["Samedi dernier", "Lundi prochain", "Hier", "Il y a trois jours"], 0, "« samedi dernier »."),
      qcm("Comment est son appartement ?", ["Grand et sombre", "Petit et lumineux", "Grand et lumineux", "Petit et sombre"], 1, "« petit mais très lumineux »."),
      qcm("À quelle distance est l'université ?", ["Dix minutes en bus", "Dix minutes à pied", "Une heure à pied", "Trois minutes à vélo"], 1, "« à dix minutes à pied »."),
      qcm("Ses cours ont déjà commencé.", ["Vrai", "Faux"], 1, "Faux: « Mes cours commencent lundi prochain » — chưa bắt đầu."),
      qcm("Qu'est-ce qu'un « bouchon » dans ce message ?", ["Un musée", "Un restaurant typique", "Un marché", "Un quartier"], 1, "Đoạn văn giải thích ngay: « un restaurant typique de Lyon »."),
      qcm("Quel est le problème de Camille ?", ["Le bruit", "La pluie", "Le prix du loyer", "Ses cours"], 1, "« il pleut depuis trois jours »."),
      qcm("Que propose-t-elle à Linh ?", ["De venir en décembre", "De partir à Paris", "De visiter l'université", "D'appeler lundi"], 0, "« Tu viens me voir pendant les vacances de décembre ? »."),
    ] },

  /* ───────────── B1 ───────────── */
  { title: "Les pronoms y et en", level: "B1", skills: ["Grammaire"],
    consigne: "Choisissez le pronom qui convient.",
    questions: [
      qcm("Tu vas à la piscine ? — Oui, j'______ vais ce soir.", ["y", "en", "le", "lui"], 0, "à + nơi chốn → y."),
      qcm("Tu as des frères ? — Oui, j'______ ai deux.", ["y", "en", "les", "leur"], 1, "Số lượng (des… / deux) → en."),
      qcm("Il pense à son examen ? — Oui, il ______ pense tout le temps.", ["y", "en", "lui", "le"], 0, "penser À quelque chose (vật) → y."),
      qcm("Elle revient de Tokyo ? — Oui, elle ______ revient demain.", ["y", "en", "la", "lui"], 1, "de + nơi chốn → en."),
      qcm("Vous parlez de ce projet ? — Oui, nous ______ parlons souvent.", ["y", "en", "le", "lui"], 1, "parler DE quelque chose → en."),
      qcm("Tu penses à ta mère ? — Oui, je pense ______.", ["y", "en", "à elle", "lui"], 2, "penser à + NGƯỜI thì không dùng y mà dùng à + đại từ nhấn: à elle."),
      qcm("Tu as besoin de ce livre ? — Oui, j'______ ai besoin.", ["y", "en", "le", "lui"], 1, "avoir besoin DE → en."),
      qcm("Tu t'intéresses à la politique ? — Non, je ne m'______ intéresse pas.", ["y", "en", "la", "lui"], 0, "s'intéresser À quelque chose → y."),
      qcm("Il reste du gâteau ? — Oui, il ______ reste un peu.", ["y", "en", "le", "lui"], 1, "du (partitif) → en."),
      qcm("Tu es allé au Japon ? — Oui, j'______ suis allé l'an dernier.", ["y", "en", "le", "lui"], 0, "au Japon (nơi đến) → y."),
    ] },
  { title: "Exprimer la cause et la conséquence", level: "B1", skills: ["Grammaire", "Écriture"],
    consigne: "Choisissez l'expression qui convient.",
    questions: [
      qcm("Le match a été annulé ______ la neige.", ["à cause de", "grâce à", "parce que", "donc"], 0, "Nguyên nhân tiêu cực + DANH TỪ → à cause de."),
      qcm("Il a réussi ______ il a beaucoup travaillé.", ["parce qu'", "à cause d'", "grâce à", "donc"], 0, "Nguyên nhân + MỆNH ĐỀ → parce que."),
      qcm("Il pleuvait, ______ nous sommes restés à la maison.", ["donc", "car", "parce que", "grâce à"], 0, "Nêu hệ quả → donc."),
      qcm("______ ses conseils, j'ai trouvé un emploi.", ["Grâce à", "À cause de", "Parce que", "Comme"], 0, "Nguyên nhân tích cực + danh từ → grâce à."),
      qcm("______ il était malade, il n'est pas venu.", ["Comme", "Donc", "Grâce à", "Alors"], 0, "comme đứng ĐẦU câu để nêu nguyên nhân."),
      qcm("Elle parle ______ vite ______ personne ne la comprend.", ["si … que", "tant … que", "trop … pour", "aussi … que"], 0, "si + trạng từ/tính từ + que = … đến nỗi mà: si vite que."),
      qcm("Il a ______ travaillé ______ il est épuisé.", ["tellement … qu'", "si … qu'", "trop … pour", "aussi … qu'"], 0, "tellement + động từ/phân từ + que: il a tellement travaillé qu'il est épuisé. « si » không đứng trước phân từ."),
      qcm("Je ne suis pas sorti ______ la pluie était trop forte.", ["car", "donc", "grâce à", "c'est pourquoi"], 0, "car = vì (nối hai mệnh đề, đứng giữa câu)."),
      qcm("Il a raté son bus ; ______, il est arrivé en retard.", ["par conséquent", "car", "parce que", "comme"], 0, "par conséquent = do đó."),
      qcm("La route est fermée ______ travaux.", ["pour cause de", "grâce aux", "parce que", "donc"], 0, "pour cause de + danh từ (văn phong thông báo) = vì lý do."),
    ] },
  { title: "Lecture : une annonce de colocation", level: "B1", skills: ["Lecture"],
    consigne: "Lisez l'annonce, puis répondez aux questions.",
    readingText: "<p><strong>Cherche colocataire — Bordeaux, quartier des Chartrons</strong></p><p>Nous sommes deux étudiants (Léa, 22 ans, et Hugo, 24 ans) et nous cherchons une troisième personne pour partager un appartement de 80 m² à partir du 1er novembre. La chambre libre fait 12 m², elle est meublée et donne sur une cour calme.</p><p>Le loyer est de 420 € par mois, charges comprises (eau, électricité, internet). Un dépôt de garantie d'un mois est demandé. L'appartement est à cinq minutes du tram et à vingt minutes du centre-ville.</p><p>Nous sommes plutôt calmes pendant la semaine, mais nous aimons cuisiner ensemble le week-end. Les animaux ne sont pas acceptés et l'appartement est non-fumeur.</p><p>Intéressé(e) ? Écrivez-nous en présentant vos études et vos habitudes.</p>",
    questions: [
      qcm("Combien de personnes vivront dans l'appartement ?", ["Deux", "Trois", "Quatre", "Une"], 1, "Hai sinh viên tìm « une troisième personne » → ba người."),
      qcm("À partir de quand la chambre est-elle libre ?", ["Du 1er octobre", "Du 1er novembre", "Tout de suite", "Du 1er décembre"], 1, "« à partir du 1er novembre »."),
      qcm("Le loyer de 420 € comprend internet.", ["Vrai", "Faux"], 0, "Vrai: « charges comprises (eau, électricité, internet) »."),
      qcm("Combien faut-il payer en dépôt de garantie ?", ["210 €", "420 €", "840 €", "Rien"], 1, "« un dépôt de garantie d'un mois » = một tháng tiền thuê = 420 €."),
      qcm("La chambre est :", ["vide et bruyante", "meublée et calme", "meublée et bruyante", "vide et calme"], 1, "« meublée et donne sur une cour calme »."),
      qcm("Un étudiant qui a un chat peut postuler.", ["Vrai", "Faux"], 1, "Faux: « Les animaux ne sont pas acceptés »."),
      qcm("Que font Léa et Hugo le week-end ?", ["Ils font la fête", "Ils cuisinent ensemble", "Ils rentrent chez leurs parents", "Ils travaillent"], 1, "« nous aimons cuisiner ensemble le week-end »."),
      qcm("Que faut-il présenter dans son message ?", ["Son salaire", "Ses études et ses habitudes", "Une photo", "Ses parents"], 1, "« en présentant vos études et vos habitudes »."),
    ] },

  /* ───────────── B2 ───────────── */
  { title: "Le conditionnel passé et l'expression du regret", level: "B2", skills: ["Grammaire"],
    consigne: "Choisissez la forme verbale qui convient.",
    questions: [
      qcm("Si tu m'avais prévenu, je ______ te chercher.", ["serais venu", "viendrais", "suis venu", "venais"], 0, "si + plus-que-parfait → conditionnel passé: je serais venu."),
      qcm("J'______ dû partir plus tôt.", ["aurais", "avais", "aurai", "ai"], 0, "« J'aurais dû » = lẽ ra tôi phải — cách nói tiếc nuối."),
      qcm("Selon la presse, le ministre ______ sa démission hier.", ["aurait présenté", "a présenté", "présenterait", "avait présenté"], 0, "Conditionnel passé dùng để đưa tin CHƯA KIỂM CHỨNG về quá khứ: aurait présenté."),
      qcm("Sans ton aide, nous n'______ jamais réussi.", ["aurions", "avions", "aurons", "avons"], 0, "sans + danh từ ngầm một giả định trong quá khứ → conditionnel passé: nous n'aurions jamais réussi."),
      qcm("Elle ______ aimé voyager davantage.", ["aurait", "avait", "aura", "a"], 0, "Tiếc nuối: elle aurait aimé."),
      qcm("S'il ______ moins cher, je l'aurais acheté.", ["avait été", "aurait été", "était", "a été"], 0, "Sau si KHÔNG dùng conditionnel: s'il avait été."),
      qcm("À ta place, je n'______ pas accepté.", ["aurais", "avais", "aurai", "ai"], 0, "à ta place = nếu là bạn → conditionnel passé: je n'aurais pas accepté."),
      qcm("Nous ______ partir, mais le train était annulé.", ["aurions pu", "avions pu", "pourrions", "avons pu"], 0, "aurions pu = lẽ ra đã có thể."),
      qcm("D'après les témoins, l'accident ______ vers minuit.", ["se serait produit", "s'est produit", "se produirait", "s'était produit"], 0, "Tin chưa kiểm chứng về quá khứ → se serait produit."),
      qcm("Tu ______ me le dire avant !", ["aurais pu", "as pu", "pourras", "avais pu"], 0, "Trách nhẹ: tu aurais pu me le dire = lẽ ra bạn đã có thể nói với tôi."),
    ] },
  { title: "Articuler une argumentation", level: "B2", skills: ["Écriture"],
    consigne: "Choisissez l'articulateur qui convient dans ce texte argumentatif.",
    questions: [
      qcm("______, il faut rappeler que le télétravail s'est largement développé.", ["Tout d'abord", "En somme", "Néanmoins", "Or"], 0, "Mở lập luận: tout d'abord."),
      qcm("Il permet de gagner du temps. ______, il réduit la pollution liée aux transports.", ["De plus", "Pourtant", "En revanche", "Bref"], 0, "Thêm một ý cùng chiều → de plus."),
      qcm("______, il peut aussi isoler les salariés.", ["Cependant", "Ainsi", "D'ailleurs", "Ensuite"], 0, "Chuyển sang mặt trái → cependant."),
      qcm("Certains se sentent seuls ; ______, d'autres apprécient ce calme.", ["en revanche", "donc", "de plus", "car"], 0, "Đối lập hai nhóm → en revanche."),
      qcm("Les entreprises y gagnent : ______, elles économisent sur les bureaux.", ["en effet", "pourtant", "or", "bref"], 0, "Giải thích / minh chứng cho ý vừa nêu → en effet."),
      qcm("On pensait que la productivité baisserait. ______, plusieurs études montrent le contraire.", ["Or", "Donc", "Ainsi", "De plus"], 0, "or = thế nhưng (đưa ra dữ kiện làm đảo chiều lập luận)."),
      qcm("______ ces avantages, le télétravail ne convient pas à tous les métiers.", ["Malgré", "Grâce à", "Puisque", "Afin de"], 0, "Nhượng bộ + danh từ → malgré."),
      qcm("Il faudrait ______ trouver un équilibre entre bureau et domicile.", ["donc", "pourtant", "or", "car"], 0, "Rút ra kết luận → donc."),
      qcm("______, le télétravail est une solution, mais pas une solution universelle.", ["En conclusion", "Tout d'abord", "Par exemple", "Ensuite"], 0, "Kết bài → en conclusion."),
      qcm("Beaucoup de métiers, ______ ceux de la santé, exigent une présence.", ["notamment", "cependant", "donc", "or"], 0, "notamment = đặc biệt là (nêu ví dụ tiêu biểu)."),
    ] },
  { title: "Lecture : un article sur les jardins partagés", level: "B2", skills: ["Lecture"],
    consigne: "Lisez l'article, puis répondez aux questions.",
    readingText: "<p><strong>Les jardins partagés, bien plus que des potagers</strong></p><p>Depuis une quinzaine d'années, les jardins partagés se multiplient dans les grandes villes françaises. Le principe est simple : une parcelle, souvent municipale, est confiée à une association d'habitants qui la cultive collectivement. On y fait pousser des légumes, des fleurs et des plantes aromatiques.</p><p>Pourtant, pour la plupart des participants, la récolte n'est pas l'essentiel. « Je viens surtout pour les gens », explique Martine, retraitée, qui fréquente le jardin de son quartier deux fois par semaine. Beaucoup y voient un moyen de rompre l'isolement, de rencontrer des voisins qu'ils n'auraient jamais croisés autrement.</p><p>Les municipalités, elles, y trouvent aussi leur compte : ces espaces verts entretenus bénévolement coûtent peu et contribuent à rafraîchir les quartiers pendant les vagues de chaleur. Certains urbanistes nuancent toutefois cet enthousiasme : les parcelles restent petites, et les listes d'attente pour y obtenir une place peuvent atteindre plusieurs années.</p>",
    questions: [
      qcm("Qui cultive un jardin partagé ?", ["La mairie", "Une association d'habitants", "Une entreprise", "Des agriculteurs"], 1, "« confiée à une association d'habitants qui la cultive collectivement »."),
      qcm("Pour la plupart des participants, le plus important est :", ["la récolte", "le lien social", "l'argent", "le sport"], 1, "« la récolte n'est pas l'essentiel »; « Je viens surtout pour les gens »."),
      qcm("Martine est :", ["urbaniste", "retraitée", "étudiante", "élue municipale"], 1, "« Martine, retraitée »."),
      qcm("Selon l'article, les jardins partagés permettent de :", ["gagner de l'argent", "rompre l'isolement", "remplacer les supermarchés", "construire des logements"], 1, "« un moyen de rompre l'isolement »."),
      qcm("Pourquoi les municipalités apprécient-elles ces jardins ?", ["Ils rapportent des taxes", "Ils coûtent peu et rafraîchissent les quartiers", "Ils attirent les touristes", "Ils remplacent les parcs"], 1, "« coûtent peu et contribuent à rafraîchir les quartiers »."),
      qcm("Le mot « toutefois » introduit :", ["un exemple", "une réserve", "une conséquence", "une conclusion"], 1, "toutefois = tuy nhiên → nêu một điểm dè dặt."),
      qcm("Quelle critique les urbanistes formulent-ils ?", ["Les jardins sont trop grands", "Il est difficile d'obtenir une place", "Les légumes sont pollués", "Les associations sont mal gérées"], 1, "« les listes d'attente… peuvent atteindre plusieurs années »."),
      qcm("Le ton général de l'article est :", ["très critique", "plutôt positif mais nuancé", "indifférent", "ironique"], 1, "Phần lớn nêu lợi ích, đoạn cuối thêm một điểm dè dặt → tích cực có chừng mực."),
    ] },

  /* ───────────── B2+ ───────────── */
  { title: "Le participe présent et le gérondif", level: "B2+", skills: ["Grammaire"],
    consigne: "Choisissez la forme qui convient.",
    questions: [
      qcm("Il écoute de la musique ______ ses devoirs.", ["en faisant", "faisant", "en fait", "fait"], 0, "Hai hành động đồng thời, CÙNG chủ ngữ → gérondif: en faisant."),
      qcm("On cherche un stagiaire ______ l'anglais.", ["parlant", "en parlant", "parlé", "parlante"], 0, "Participe présent thay cho mệnh đề quan hệ (qui parle): parlant — không hợp giống số."),
      qcm("______ malade, elle n'est pas venue.", ["Étant", "En étant", "Été", "Étante"], 0, "Participe présent chỉ nguyên nhân: étant malade = vì bị ốm."),
      qcm("C'est ______ qu'on devient forgeron.", ["en forgeant", "forgeant", "forgé", "en forgé"], 0, "Thành ngữ: « c'est en forgeant qu'on devient forgeron » — gérondif chỉ cách thức."),
      qcm("______ son diplôme, il a trouvé un emploi.", ["Ayant obtenu", "En obtenu", "Obtenant eu", "Ayant obtenant"], 0, "Participe présent dạng hoàn thành (ayant + phân từ) cho hành động xảy ra trước."),
      qcm("Ces étudiants ______ leurs examens partiront en vacances.", ["ayant réussi", "ayants réussi", "en réussissant", "réussissants"], 0, "Participe présent KHÔNG biến đổi: ayant réussi."),
      qcm("Elle s'est blessée ______.", ["en tombant", "tombant", "tombée", "en tombée"], 0, "Gérondif chỉ hoàn cảnh xảy ra: en tombant."),
      qcm("______ tout, il a fini par accepter.", ["Tout en refusant", "Refusant", "En refusé", "Ayant refusant"], 0, "« tout en » + participe présent nhấn mạnh sự đối lập/đồng thời: tout en refusant."),
      qcm("Des enfants ______ dans la rue faisaient beaucoup de bruit.", ["jouant", "jouants", "en jouant", "joués"], 0, "Participe présent (= qui jouaient), bất biến: jouant."),
      qcm("Tu progresseras ______ chaque jour.", ["en lisant", "lisant", "lu", "en lu"], 0, "Gérondif chỉ cách thức / điều kiện: en lisant."),
    ] },

  /* ───────────── C1 ───────────── */
  { title: "Les registres de langue", level: "C1", skills: ["Vocabulaire"],
    consigne: "Choisissez l'équivalent en registre soutenu du mot familier.",
    questions: [
      qcm("« bosser » (familier) =", ["travailler", "dormir", "manger", "partir"], 0, "bosser (thân mật) = travailler."),
      qcm("« une bagnole » (familier) =", ["une voiture", "une maison", "une bicyclette", "une bouteille"], 0, "bagnole = voiture."),
      qcm("« se planter » (familier) signifie :", ["se tromper / échouer", "jardiner", "s'asseoir", "se reposer"], 0, "se planter (thân mật) = thất bại, nhầm."),
      qcm("« Il pige rien. » en registre soutenu :", ["Il ne comprend rien.", "Il ne paie rien.", "Il ne mange rien.", "Il ne dit rien."], 0, "piger = comprendre; tiếng Pháp chuẩn giữ đủ ne… rien."),
      qcm("« le boulot » (familier) =", ["le travail", "le repas", "le bureau de poste", "le pain"], 0, "boulot = travail / emploi."),
      qcm("Quelle formule convient dans une lettre à une administration ?", ["Je vous prie d'agréer mes salutations distinguées.", "Bisous et à plus !", "Salut, ça roule ?", "Bon, ben, voilà."], 0, "Công thức kết thư trang trọng chuẩn."),
      qcm("« avoir la flemme » signifie :", ["ne pas avoir envie de faire un effort", "avoir de la fièvre", "avoir peur", "être en colère"], 0, "avoir la flemme = lười."),
      qcm("« se barrer » (familier) =", ["s'en aller", "se battre", "se laver", "se tromper"], 0, "se barrer = bỏ đi."),
      qcm("Le registre soutenu de « on s'en fiche » est :", ["cela nous importe peu", "on s'en moque bien", "on n'en a rien à faire", "c'est pas grave"], 0, "« cela nous importe peu » là cách nói trang trọng; ba phương án kia đều thân mật."),
      qcm("« fringues » (familier) =", ["vêtements", "fruits", "outils", "meubles"], 0, "fringues = quần áo."),
    ] },
  { title: "Nuances de sens : paronymes et faux amis", level: "C1", skills: ["Vocabulaire"],
    consigne: "Choisissez le mot qui convient au contexte.",
    questions: [
      qcm("Le médecin a ______ un traitement de deux semaines.", ["prescrit", "proscrit", "souscrit", "décrit"], 0, "prescrire = kê đơn; proscrire = cấm."),
      qcm("Cette pratique est désormais ______ par la loi.", ["proscrite", "prescrite", "inscrite", "transcrite"], 0, "proscrire = cấm hẳn."),
      qcm("Il a fait ______ de beaucoup de patience.", ["preuve", "épreuve", "probation", "prouesse"], 0, "faire preuve de = thể hiện (một phẩm chất)."),
      qcm("Le candidat doit passer une ______ écrite.", ["épreuve", "preuve", "éprouvette", "approbation"], 0, "épreuve = bài thi, phần thi."),
      qcm("Son discours a eu un grand ______ sur le public.", ["impact", "empathie", "impasse", "impôt"], 0, "impact = tác động."),
      qcm("Il faut ______ les deux versions pour voir les différences.", ["confronter", "affronter", "effrontée", "conforter"], 0, "confronter = đối chiếu; affronter = đương đầu."),
      qcm("Ce témoignage vient ______ notre hypothèse.", ["conforter", "confronter", "réconforter", "comporter"], 0, "conforter = củng cố (một giả thuyết); réconforter = an ủi."),
      qcm("L'entreprise a dû ______ trente personnes.", ["licencier", "licencer", "liciter", "licentier"], 0, "licencier = sa thải (chính tả đúng)."),
      qcm("Une décision ______ ne peut pas être modifiée.", ["irrévocable", "irrévérencieuse", "irréprochable", "irrésistible"], 0, "irrévocable = không thể thay đổi."),
      qcm("Il est ______ à ce poste depuis deux ans : c'est un homme d'expérience.", ["affecté", "effectué", "infecté", "affectueux"], 0, "être affecté à un poste = được bổ nhiệm vào vị trí."),
    ] },
];

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const cau = [];
for (const b of BAI) {
  const ex = { ...b, id: id("nhap"), title: "[NHÁP] " + b.title, usageType: "assignment",
    targeted: true, assignedTo: ["__nhap__"], assignedClasses: [], assignedExtra: [], createdAt: Date.now() };
  const { exRow, qRows } = toRows(ex, "assignment");
  const cot = Object.keys(exRow);
  const giaTri = cot.map((k) => (["meta"].includes(k) ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((r) => `(${q(r.id)}, ${q(r.exercise_id)}, ${r.ord}, ${q(r.type)}, ${q(r.prompt)}, ${j(r.payload)}, ${j(r.answer_key)}, ${q(r.explanation)})`).join(", ");
  cau.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${giaTri.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation)`);
}
console.log(cau.join("\n"));
