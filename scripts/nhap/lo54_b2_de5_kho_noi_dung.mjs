/* Lô 54 (17/11/2026): NỘI DUNG « DELF B2 · Đề 5 » NÂNG ĐỘ KHÓ. Cùng chuẩn với Đề 1.
 * Như Đề 4: hai bài báo (lô 23) soạn TỪ NGUỒN THẬT. Bản viết lại GIỮ NGUYÊN mọi dữ kiện và con số
 * của bản cũ, KHÔNG thêm dữ kiện mới; phần dài thêm là diễn đạt và lập luận nêu chung. Dòng ghi
 * nguồn lấy lại nguyên văn từ lo23_b2_noi_dung.mjs. Bài nghe và diễn đàn là tình huống FRACILE dựng.
 * Không dùng dấu gạch dài (quy tắc 7). Lời giải trích nguyên văn trong « ». */
import { CAC_DE } from "./lo23_b2_noi_dung.mjs";

const duoiNguon = (t) => { const i = t.indexOf("Texte rédigé"); return i < 0 ? "" : t.slice(t.lastIndexOf("<p", i)).replace(/<\/p><\/p>$/, "</p>"); };

export function noiDung({ q, ai, p, d }) {
  const CU = CAC_DE[1];
  const RADIO = "Parle en français de France comme un journaliste de radio en direct : débit rapide et naturel, enchaîne sans marquer de pause entre les phrases.";
  const KHACH = "Parle en français de France comme une responsable d'association interviewée en direct à la radio : débit rapide, spontané, avec de vraies hésitations, sans articuler de façon scolaire.";
  const PHONG = "Parle en français de France comme un reporter de radio sur le terrain : débit soutenu, ton vivant.";
  const NV = "Parle en français de France comme une salariée interrogée à la sortie du bureau : débit rapide et familier, un peu agacée, phrases qui s'enchaînent.";
  const DRH = "Parle en français de France comme une directrice des ressources humaines qui se justifie : débit rapide, ton assuré, quelques hésitations.";
  const CD = "Parle en français de France comme un délégué syndical : débit rapide, ton ferme et direct.";
  const TIN = "Parle en français de France comme une chronique radio : débit rapide et dense, sans pause.";

  /* ─────────────── ĐỌC 1 ─────────────── */
  const CE1 = {
    id: "lo23mven72cv03o",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Logement : quand trouver un toit devient un frein à l'emploi</strong>",
      "Pour une grande partie des jeunes, se loger a cessé d'être une étape parmi d'autres sur le chemin de l'âge adulte : c'est devenu un parcours d'obstacles, dont beaucoup sortent découragés. D'après un sondage Odoxa réalisé pour Nexity en janvier 2026, six jeunes sur dix déclarent avoir déjà rencontré des difficultés pour trouver un logement. Le chiffre le plus frappant est pourtant ailleurs : 30 % affirment avoir renoncé à postuler à un emploi faute de solution pour se loger. Autrement dit, près d'un jeune sur trois a laissé passer une occasion professionnelle non par manque de compétences ou d'envie, mais parce qu'il n'aurait su où dormir.",
      "Le constat n'a rien d'une révélation. Dès mars 2025, la Cour des comptes rangeait les étudiants, les alternants et les jeunes actifs parmi les profils les plus exposés aux tensions du marché locatif. En octobre de la même année, un rapport du Sénat pointait la pénurie de petites surfaces abordables, c'est-à-dire précisément celles que recherchent les jeunes au moment où ils quittent le foyer familial. Dans certaines régions, la hausse des prix aggrave encore une situation déjà tendue, au point que le premier salaire ne suffit plus à couvrir un loyer.",
      "Longtemps relégué au rang des dossiers techniques, le sujet s'est invité dans la campagne des élections municipales de mars 2026. Selon le même sondage, 63 % des moins de 35 ans pourraient accorder leur voix à un candidat proposant des mesures concrètes en la matière. Un tel réservoir de suffrages ne pouvait laisser les états-majors indifférents. Les associations spécialisées dans le logement des jeunes ont saisi l'occasion pour pousser leurs propositions : faciliter l'accès au logement, mieux utiliser les logements existants, construire davantage de logements adaptés, encadrer les loyers et soutenir les structures d'accompagnement. Un catalogue cohérent, mais dont chaque ligne suppose des arbitrages que les communes ne peuvent pas toujours rendre seules.",
      "Quelques mesures nationales apportent certes un peu d'air. Les aides personnelles au logement ont ainsi été revalorisées de 1,15 % au 1er octobre 2026, au rythme de l'indice de référence des loyers. Les associations ne s'en satisfont pas : à leurs yeux, ces ajustements, pour bienvenus qu'ils soient, ne compensent en rien la rareté de l'offre. On peut aider un locataire à payer son loyer ; encore faut-il qu'il existe un logement à louer.",
      "Leur mise en garde dépasse d'ailleurs le sort des seuls intéressés. Tant que les jeunes devront choisir entre un emploi et un toit, préviennent-elles, c'est toute l'économie qui en paiera le prix : des postes resteront vacants là où les logements manquent, tandis que des candidats qualifiés demeureront là où ils ont pu s'installer, parfois loin de l'activité.",
    ) + duoiNguon(CU.CE1.readingText),
    cau: [
      q("D'après le sondage, quelle proportion de jeunes a déjà eu du mal à se loger ?",
        "Une majorité d'entre eux, soit six sur dix.",
        ["Près d'un jeune sur trois, soit environ 30 %.", "Presque les deux tiers des moins de 35 ans, soit 63 %."],
        "Khảo sát Odoxa cho biết « six jeunes sur dix déclarent avoir déjà rencontré des difficultés pour trouver un logement ». Hai con số kia thuộc ý khác: 30 % bỏ không ứng tuyển, 63 % có thể bỏ phiếu theo tiêu chí nhà ở.", 1),
      q("Quel résultat l'auteur juge-t-il le plus marquant ?",
        "Des jeunes renoncent à un emploi parce qu'ils ne peuvent pas se loger.",
        ["Des jeunes quittent leur région parce que les loyers y ont trop augmenté.", "Des jeunes refusent de quitter le domicile de leurs parents avant 35 ans."],
        "Con số gây ấn tượng nhất: 30 % nói đã « renoncé à postuler à un emploi faute de solution pour se loger ».", 1.5),
      q("Que constatait la Cour des comptes dès mars 2025 ?",
        "Les jeunes comptent parmi les plus touchés par la tension locative.",
        ["Les aides au logement profitent surtout aux étudiants, au détriment des actifs.", "Les jeunes actifs sont mieux lotis que les alternants."],
        "Toà Kiểm toán xếp sinh viên, người học việc và lao động trẻ vào nhóm « les profils les plus exposés aux tensions du marché locatif ».", 0.5),
      q("Quelle insuffisance le rapport du Sénat mettait-il en évidence ?",
        "Le manque de petits logements à prix accessible.",
        ["Le nombre trop faible de résidences universitaires.", "L'absence de contrôle sur les propriétaires."],
        "Báo cáo của Thượng viện chỉ ra « la pénurie de petites surfaces abordables », đúng loại người trẻ tìm.", 1),
      q("Pourquoi la question du logement a-t-elle pesé dans la campagne municipale ?",
        "Parce qu'elle pouvait déterminer le vote de nombreux jeunes électeurs.",
        ["Parce que les communes sont seules compétentes pour encadrer les loyers.", "Parce que les associations avaient présenté leurs propres candidats."],
        "Theo khảo sát, 63 % người dưới 35 tuổi có thể bỏ phiếu cho ứng viên đề xuất biện pháp cụ thể về nhà ở: « Un tel réservoir de suffrages » không thể bị bỏ qua.", 1.5),
      q("Quelle mesure nationale l'article mentionne-t-il ?",
        "Une augmentation des aides au logement, alignée sur un indice des loyers.",
        ["Un plafonnement des loyers dans les villes de plus de 100 000 habitants.", "Un programme de construction de logements réservés aux alternants."],
        "Bài viết nêu: các khoản trợ cấp nhà ở « ont ainsi été revalorisées de 1,15 % au 1er octobre 2026 », theo chỉ số tham chiếu tiền thuê.", 2),
      q("Comment les associations jugent-elles cette mesure ?",
        "Utile, mais sans effet sur le vrai problème, qui est le manque de logements.",
        ["Inutile, car les aides ne parviennent jamais aux jeunes qui en auraient le plus besoin.", "Suffisante, à condition qu'elle soit renouvelée chaque année."],
        "Với các hiệp hội, những điều chỉnh này « ne compensent en rien la rareté de l'offre »: giúp trả tiền thuê được, nhưng phải có nhà để thuê.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 2 ─────────────── */
  const CE2 = {
    id: "lo23mven72cw03p",
    consigne: "<p>Vous lisez un article dans un journal francophone.</p>",
    readingText: p(
      "<strong>Télétravail : la fin annoncée n'a pas eu lieu</strong>",
      "À en croire les gros titres, le travail à distance aurait vécu. Aux États-Unis, plusieurs géants, à l'image d'Amazon ou de Tesla, y ont largement mis fin, et chaque annonce de « retour au bureau » est commentée comme le signe d'un reflux général. En France, la réalité se révèle autrement plus paisible. Selon une étude de l'Apec réalisée fin 2025 auprès de 2 000 cadres et de 1 000 entreprises, 89 % des entreprises n'ont pas modifié leur politique de télétravail en 2025, et 94 % ne prévoient pas de changer le nombre de jours autorisés en 2026. Loin du grand soir annoncé, c'est donc la stabilité qui domine.",
      "Des ajustements existent, mais ils demeurent limités et inégaux. Les petites et moyennes entreprises sont un peu plus nombreuses à réduire le télétravail que les grands groupes, où le modèle hybride s'est installé, assorti de règles de présence plus précises. Surtout, le débat s'est déplacé. La question n'est plus tant « combien de jours ? » que « lesquels ? ». Une majorité de cadres en télétravail peuvent aujourd'hui choisir leurs jours chaque semaine, et cette souplesse est devenue un enjeu central : la reprendre serait perçu comme un recul, quand bien même le nombre total de jours resterait identique.",
      "Pourquoi les employeurs hésitent-ils à faire machine arrière ? D'abord parce que le télétravail est devenu un argument de recrutement et de fidélisation : un cadre sur deux envisagerait de quitter son entreprise s'il était supprimé. Dans les métiers où les candidats se font rares, nul ne prend ce risque à la légère. Ensuite parce que le droit protège les salariés. Lorsqu'il est prévu par un accord collectif ou par le contrat de travail, le télétravail ne peut pas toujours être supprimé par une décision unilatérale de l'employeur : il faut alors renégocier, ce qui suppose du temps et des contreparties.",
      "Il serait pourtant trop simple de ranger les partisans d'un retour plus marqué parmi les nostalgiques. Leurs arguments sont sérieux : renforcer la cohésion des équipes, faciliter l'intégration des nouveaux arrivants, entretenir une culture commune. Chacun peut constater qu'on n'apprend pas un métier de la même façon derrière un écran qu'au contact de collègues expérimentés, et que les liens tissés à distance résistent mal aux tensions.",
      "Entre ces deux exigences, la souplesse que réclament les salariés et la présence que souhaitent les directions, la plupart des entreprises françaises semblent avoir choisi la voie du compromis plutôt que celle de la rupture. Le télétravail ne disparaît pas ; il se réglemente. Ce qui s'efface, c'est moins la pratique elle-même que l'improvisation des premières années.",
    ) + duoiNguon(CU.CE2.readingText),
    cau: [
      q("Comment l'article décrit-il la situation du télétravail en France ?",
        "Il se maintient, contrairement à ce que laissent penser certains titres.",
        ["Il recule rapidement, comme on l'observe dans les grands groupes américains.", "Il progresse encore, surtout dans les petites entreprises."],
        "Trái với các tít báo, ở Pháp « c'est donc la stabilité qui domine »: 89 % doanh nghiệp không đổi chính sách trong năm 2025.", 1),
      q("Auprès de qui l'étude de l'Apec a-t-elle été menée ?",
        "Auprès de cadres et d'entreprises.",
        ["Auprès de salariés de tous les secteurs.", "Auprès de directeurs de grands groupes."],
        "Nghiên cứu được làm « auprès de 2 000 cadres et de 1 000 entreprises ».", 1.5),
      q("Quelle part des entreprises ne compte pas modifier le nombre de jours en 2026 ?",
        "94 %.",
        ["89 %.", "50 %."],
        "Bài viết ghi: « 94 % ne prévoient pas de changer le nombre de jours autorisés en 2026 ». Con số 89 % nói về năm 2025.", 0.5),
      q("Quelles entreprises réduisent un peu plus souvent le télétravail ?",
        "Celles de taille petite ou moyenne.",
        ["Celles qui appliquent déjà un modèle hybride.", "Celles qui recrutent le plus de cadres."],
        "Bài viết nói « Les petites et moyennes entreprises sont un peu plus nombreuses à réduire le télétravail que les grands groupes ».", 1),
      q("En quoi le débat a-t-il changé de nature ?",
        "Il porte désormais sur la liberté de choisir ses jours.",
        ["Il porte désormais sur le salaire des télétravailleurs.", "Il porte désormais sur le contrôle du temps de travail à domicile."],
        "Câu hỏi không còn là « combien de jours ? » mà là « lesquels ? »: đa số cán bộ nay được chọn ngày, và sự linh hoạt này thành vấn đề trung tâm.", 1.5),
      q("Pour quelle raison le télétravail est-il un atout pour les employeurs ?",
        "Il les aide à attirer des candidats et à retenir leurs salariés.",
        ["Il leur permet de réduire fortement la surface et le coût de leurs bureaux.", "Il leur évite de négocier avec les syndicats."],
        "Làm việc từ xa đã thành « un argument de recrutement et de fidélisation »: một nửa số cán bộ sẽ tính rời công ty nếu nó bị bỏ.", 2),
      q("Quelle conclusion l'article tire-t-il ?",
        "Les entreprises cherchent majoritairement un équilibre.",
        ["Les entreprises finiront par imposer le retour au bureau.", "Les entreprises laissent les salariés décider seuls."],
        "Phần lớn doanh nghiệp Pháp « semblent avoir choisi la voie du compromis plutôt que celle de la rupture »: làm việc từ xa không mất đi mà được đặt vào khuôn khổ.", 1.5),
    ],
  };

  /* ─────────────── ĐỌC 3 ─────────────── */
  const TEN = ["Sarah", "Antoine", "Lina"];
  const a = ai(TEN);
  const CE3 = {
    id: "lo23mven72cw03q",
    consigne: "<p>Vous lisez l'opinion de ces trois personnes sur un forum français dont le sujet est : « Vivre chez ses parents après 25 ans, un échec ? »</p>",
    readingText: p(
      "<strong>Sarah</strong>",
      "J'ai vingt-sept ans, un contrat stable, et je suis retournée vivre chez mes parents l'an dernier. Non par contrainte : par calcul. En dix-huit mois, j'aurai mis de côté de quoi constituer un apport et acheter, au lieu d'engloutir la moitié de mon salaire dans un loyer à fonds perdu. J'y vois une stratégie, certainement pas un aveu de faiblesse. Ce qui me frappe, c'est le regard des autres. En Italie ou en Espagne, où j'ai de la famille, rester sous le toit familial jusqu'à trente ans ne surprend personne. Il n'y a guère qu'en France qu'on vous demande, d'un air gêné, si « tout va bien ».",
      "<strong>Antoine</strong>",
      "Je ne conteste pas l'argument financier : au prix où sont les loyers, il se défend parfaitement. Je crois malgré tout qu'on y laisse quelque chose. Mon premier studio faisait quatorze mètres carrés et donnait sur une cour. C'est pourtant là que j'ai appris à tenir un budget, à me faire à manger, à régler seul une fuite d'eau un dimanche soir. Ces apprentissages-là ne se font pas dans la maison où l'on a grandi, même avec des parents discrets et la meilleure volonté du monde : il y a toujours quelqu'un pour rattraper vos oublis. On peut les faire plus tard, bien sûr. Mais plus on attend, plus ils coûtent.",
      "<strong>Lina</strong>",
      "On pose mal la question. Parler d'échec, c'est faire porter aux jeunes la responsabilité d'une situation qu'ils n'ont pas créée. Dans ma ville, un studio se loue plus cher que ce que gagne un apprenti ; il n'y a là ni immaturité ni manque de courage, simplement une impossibilité arithmétique. Je trouve indécent qu'on culpabilise des gens qui n'ont pas le choix, en leur expliquant de surcroît qu'ils manquent d'autonomie. Qu'on bâtisse des logements à des prix abordables, qu'on encadre les loyers, et l'on verra bien s'ils restent chez leurs parents par plaisir. Le sujet relève de la décision publique, pas de la psychologie.",
    ),
    cau: [
      a("La cause du phénomène, c'est le coût des logements.", "Lina", "Lina nói ở thành phố của cô, một studio cho thuê đắt hơn lương người học việc: đó là « une impossibilité arithmétique », không phải chuyện non nớt.", 2),
      a("Habiter seul oblige à acquérir son autonomie.", "Antoine", "Antoine kể chính trong studio đầu tiên anh học giữ ngân sách, nấu ăn, tự xử lý sự cố; những điều ấy « ne se font pas dans la maison où l'on a grandi ».", 1.5),
      a("Rester chez ses parents peut relever d'une décision mûrement pesée.", "Sarah", "Sarah nói cô về ở với cha mẹ « Non par contrainte : par calcul », để dành tiền mua nhà: « une stratégie ».", 1),
      a("Ces jeunes sont jugés à tort.", "Lina", "Lina thấy « indécent qu'on culpabilise des gens qui n'ont pas le choix »: người ta đổ lỗi cho người trẻ về một tình trạng họ không gây ra.", 1.5),
      a("Le regard porté sur cette situation n'est pas le même d'un pays à l'autre.", "Sarah", "Sarah so sánh: ở Ý hay Tây Ban Nha, ở với gia đình tới ba mươi tuổi « ne surprend personne », chỉ ở Pháp người ta mới ngại ngùng hỏi han.", 0.5),
      a("L'argument économique est recevable, mais il ne règle pas tout.", "Antoine", "Antoine mở đầu: « Je ne conteste pas l'argument financier », rồi nói thêm rằng người ta vẫn mất đi điều gì đó.", 0.5),
    ],
  };

  /* ─────────────── NGHE 1 ─────────────── */
  const CO1 = {
    id: "lo23mven5ny103l", ten: "b2k-de5-co1", hai: true,
    gioiThieu: "Vous écoutez une émission à la radio.",
    phanTich: { loai: "Interview à la radio", chu_de: "La colocation entre étudiants et personnes âgées", y_chinh: "La responsable d'une association explique le principe de la cohabitation intergénérationnelle, la manière de former les binômes, et reconnaît que le dispositif ne résout pas la crise du logement mais répond à deux solitudes." },
    doan: [
      d("sage", RADIO, "Bonjour à tous. D'un côté, des étudiants qui ne trouvent pas à se loger. De l'autre, des personnes âgées qui vivent seules dans des appartements devenus trop grands. Rapprocher les uns des autres, c'est le pari de la colocation intergénérationnelle : une chambre contre un loyer modeste et un peu de présence. La formule séduit de plus en plus, et nous recevons ce matin la responsable d'une association lyonnaise qui organise ces rencontres depuis quinze ans. Bonjour. Concrètement, comment ça se passe ?"),
      d("nova", KHACH, "Bonjour. Alors, le principe, euh, il est très simple, c'est la mise en œuvre qui l'est moins. Vous avez une personne âgée, souvent veuve, qui vit seule dans un logement où il reste une ou deux chambres vides. Elle en propose une à un jeune, pour un loyer très inférieur au marché. En échange, le jeune s'engage sur une présence : être là certains soirs de la semaine, partager un repas de temps en temps, prévenir quand il s'absente. Et j'insiste là-dessus, parce que c'est la source de tous les malentendus : ce n'est pas un emploi d'aide à domicile. Le jeune ne fait ni la toilette, ni les courses, ni le ménage de la personne. Et ce n'est pas non plus une simple location, où chacun ferme sa porte. C'est une cohabitation, au sens plein."),
      d("sage", RADIO, "Comment formez-vous les binômes ? On imagine que tout le monde ne s'entend pas avec tout le monde."),
      d("nova", KHACH, "Non, et c'est bien pour ça qu'on y passe du temps. On mène des entretiens longs, une heure et demie au moins, et des deux côtés : la personne âgée chez elle, le jeune dans nos locaux. Et, euh, contrairement à ce qu'on pourrait croire, on ne parle pas de grands principes. On parle d'habitudes. À quelle heure vous couchez-vous ? Vous écoutez de la musique ? Vous recevez des amis ? Vous fumez à la fenêtre ? Parce que l'expérience nous a appris une chose : les conflits ne naissent presque jamais de désaccords profonds. Ils naissent d'une télévision trop forte ou d'une vaisselle qui traîne."),
      d("sage", RADIO, "Et une fois le binôme constitué, vous disparaissez ?"),
      d("nova", KHACH, "Surtout pas. Les deux signent une charte, où tout ça est écrit noir sur blanc. Et nous, on reste joignables toute l'année. On passe au bout d'un mois, puis à chaque trimestre. Si ça coince, on intervient avant que la situation ne s'envenime. Il arrive, euh, rarement, mais ça arrive, qu'on doive mettre fin à une cohabitation, et dans ce cas on reloge le jeune ailleurs."),
      d("sage", RADIO, "Peut-on y voir une réponse à la crise du logement étudiant ?"),
      d("nova", KHACH, "Ce serait malhonnête de le prétendre, et je me méfie des élus qui nous présentent comme une solution miracle. On parle de quelques milliers de binômes dans tout le pays, quand il manque des centaines de milliers de logements. Ce n'est pas le même ordre de grandeur. Et puis ça ne convient pas à tout le monde : il faut avoir envie de vivre avec quelqu'un de quatre-vingts ans."),
      d("sage", RADIO, "Alors, à quoi cela sert-il ?"),
      d("nova", KHACH, "À répondre à deux solitudes en même temps, et c'est déjà beaucoup. Celle de la personne âgée, on la connaît. Celle de l'étudiant qui débarque dans une ville où il ne connaît personne, on en parle moins. Ce qui me frappe, c'est ce qui se passe après. Beaucoup de binômes restent en contact des années plus tard : on m'envoie des faire-part de mariage, des photos de naissance. Ça, aucune résidence étudiante ne le produit."),
      d("sage", RADIO, "Merci beaucoup."),
    ],
    cau: [
      q("Dans ce dispositif, qui met une chambre à disposition ?",
        "Une personne âgée qui habite seule un logement trop grand.",
        ["Une association qui loue des appartements à bas prix aux étudiants.", "Une famille dont les enfants ont quitté la maison."],
        "Người đề xuất phòng là « une personne âgée, souvent veuve, qui vit seule » trong căn nhà còn một hai phòng trống.", 1),
      q("À quoi le jeune s'engage-t-il en échange du loyer réduit ?",
        "À assurer une présence régulière auprès de son hôte.",
        ["À faire régulièrement les courses et le ménage de la personne.", "À aider la personne dans ses soins quotidiens."],
        "Người trẻ cam kết về sự hiện diện: « être là certains soirs de la semaine », thỉnh thoảng ăn chung. Bà nhấn mạnh đây không phải việc giúp việc tại nhà: người trẻ không đi chợ, không dọn dẹp, không chăm sóc.", 1.5),
      q("Comment la responsable qualifie-t-elle cette relation ?",
        "De véritable cohabitation.",
        ["De location à prix réduit.", "D'emploi à temps partiel."],
        "Bà nói đây không phải việc làm, cũng không phải thuê nhà đơn thuần: « C'est une cohabitation, au sens plein ».", 0.5),
      q("Comment l'association constitue-t-elle les binômes ?",
        "En s'entretenant longuement avec chacune des deux personnes.",
        ["En faisant remplir un questionnaire en ligne aux étudiants.", "En organisant une semaine d'essai chez la personne avant toute signature."],
        "Hiệp hội thực hiện « des entretiens longs, une heure et demie au moins, et des deux côtés ».", 1),
      q("D'où viennent la plupart des conflits, selon elle ?",
        "De détails de la vie de tous les jours.",
        ["De divergences d'opinions politiques.", "De désaccords sur le montant du loyer demandé."],
        "Bà nói xung đột hầu như không đến từ bất đồng sâu sắc: « Ils naissent d'une télévision trop forte ou d'une vaisselle qui traîne ».", 1.5),
      q("Que répond-elle à ceux qui y voient une solution à la crise du logement étudiant ?",
        "Que le dispositif reste beaucoup trop modeste pour cela.",
        ["Que le dispositif suffira s'il est soutenu par les élus.", "Que le dispositif convient à la grande majorité des étudiants."],
        "Bà nói khẳng định như vậy là không trung thực: chỉ có vài nghìn cặp trong cả nước, trong khi thiếu hàng trăm nghìn chỗ ở. « Ce n'est pas le même ordre de grandeur ».", 2),
      q("Quel est, à ses yeux, le principal intérêt de cette formule ?",
        "Elle rompt l'isolement des jeunes comme des personnes âgées.",
        ["Elle permet aux étudiants d'économiser pour leurs études.", "Elle évite aux personnes âgées d'entrer en maison de retraite."],
        "Theo bà, hình thức này giúp « répondre à deux solitudes en même temps »: nỗi cô đơn của người già và của sinh viên mới tới thành phố lạ.", 1.5),
    ],
  };

  /* ─────────────── NGHE 2 ─────────────── */
  const CO2 = {
    id: "lo23mven69sv03m", ten: "b2k-de5-co2", hai: true,
    gioiThieu: "Vous écoutez un reportage à la radio.",
    phanTich: { loai: "Reportage radio", chu_de: "Le retour au bureau dans une entreprise de conseil", y_chinh: "Une direction impose un troisième jour de présence. Une salariée, la directrice des ressources humaines et un délégué syndical exposent leurs positions : cohésion d'équipe contre temps de transport, et rappel de l'accord collectif." },
    doan: [
      d("onyx", PHONG, "Lyon, quartier de la Part-Dieu. Dans cette entreprise de conseil de deux cents salariés, un courriel de la direction a jeté un froid à la rentrée : à compter de novembre, il faudra être présent au bureau trois jours par semaine, contre deux jusqu'ici. La mesure paraît modeste. Elle a pourtant déclenché une petite tempête. Nous avons rencontré une consultante à la sortie des bureaux."),
      d("shimmer", NV, "Alors, moi, je ne suis pas contre par principe, hein. Je comprends l'idée. C'est vrai qu'on se voyait de moins en moins, que les nouveaux, ceux qui sont arrivés l'an dernier, ils ne connaissaient personne, certains n'avaient jamais rencontré leur chef en vrai. Ça, je l'entends. Mais, euh, concrètement, moi j'habite à une heure de transport. Une heure aller, une heure retour. Un jour de plus au bureau, ça fait deux heures de ma vie en moins chaque semaine, et personne ne me les rend. Alors j'ai demandé une seule chose : qu'on me laisse au moins choisir mes jours, pour que je puisse m'organiser avec la garde de mon fils. Pour l'instant, on m'a répondu que ce serait le mardi, le mercredi et le jeudi pour tout le monde. C'est ça qui passe mal, plus que le troisième jour en lui-même. Et puis, franchement, quand je viens, je passe la moitié de la journée en visioconférence avec des collègues qui sont dans un autre bureau. Alors venir pour ça, euh, j'ai du mal à voir l'intérêt."),
      d("onyx", PHONG, "À la direction des ressources humaines, on assume une décision présentée comme mûrement réfléchie."),
      d("alloy", DRH, "Ce n'est pas un caprice, ni une question de contrôle. On a regardé ce qui se passait depuis deux ans. Les réunions, elles ont lieu, à distance, sans problème. Ce qui avait disparu, ce sont les échanges qui ne sont pas prévus : la question qu'on pose en passant, l'idée qui naît autour d'un café. Et, euh, dans un métier comme le nôtre, c'est de là que viennent les propositions nouvelles. On a vu l'innovation s'essouffler, tout simplement. Maintenant, je ne vais pas vous dire que tout se passe bien. Deux collaborateurs ont démissionné depuis l'annonce, et ce sont de bons éléments. On savait que ça aurait un coût."),
      d("onyx", PHONG, "Reste que la direction ne peut peut-être pas décider seule. C'est ce que rappelle ce délégué syndical."),
      d("echo", CD, "Il y a un point que la direction semble avoir oublié. Ici, le télétravail, ce n'est pas une faveur qu'on accorde et qu'on reprend. Il est prévu par un accord collectif, signé il y a trois ans, qui fixe précisément deux jours de présence. Un accord, ça ne se modifie pas par un courriel. Ça se renégocie, avec les représentants du personnel, et ça suppose des contreparties. Nous ne sommes pas fermés à la discussion. Mais une annonce n'est pas une négociation."),
      d("onyx", PHONG, "Message entendu, semble-t-il : la direction a suspendu l'application de la mesure, et les discussions doivent reprendre en novembre. Parmi les pistes évoquées, la liberté de choisir ses jours, et une prise en charge partielle des frais de transport."),
    ],
    cau: [
      q("Qu'a annoncé la direction à la rentrée ?",
        "Trois jours de présence au bureau chaque semaine.",
        ["La fin du télétravail pour les nouveaux arrivants.", "Deux jours de télétravail supplémentaires par semaine."],
        "Thư của ban giám đốc: từ tháng 11 phải có mặt ở văn phòng « trois jours par semaine, contre deux jusqu'ici ».", 1),
      q("Combien de jours les salariés devaient-ils passer au bureau auparavant ?",
        "Deux jours.",
        ["Un seul jour.", "Quatre jours."],
        "Phóng viên nói ba ngày « contre deux jusqu'ici ».", 1.5),
      q("Quel argument de la direction la consultante juge-t-elle recevable ?",
        "Les membres de l'équipe ne se voyaient presque plus.",
        ["Les salariés travaillaient moins à la maison.", "Les clients se plaignaient de la qualité des réunions à distance."],
        "Chị nói chị hiểu ý tưởng: « on se voyait de moins en moins », người mới không quen ai.", 0.5),
      q("En quoi cette décision lui pose-t-elle un problème personnel ?",
        "Elle allonge le temps qu'elle passe dans les transports.",
        ["Elle l'oblige à déménager pour se rapprocher de son lieu de travail.", "Elle réduit son salaire à la fin du mois."],
        "Chị ở cách một giờ đi lại: thêm một ngày ở văn phòng là « deux heures de ma vie en moins chaque semaine ».", 1),
      q("Que réclame-t-elle ?",
        "De décider elle-même des jours où elle vient.",
        ["De conserver deux jours de présence seulement.", "D'obtenir le remboursement de ses trajets."],
        "Chị chỉ xin một điều: « qu'on me laisse au moins choisir mes jours », để sắp xếp việc trông con.", 1.5),
      q("Quelle conséquence la directrice des ressources humaines admet-elle ?",
        "Le départ de deux salariés appréciés.",
        ["Une baisse sensible du nombre de réunions d'équipe.", "Un retard dans plusieurs projets."],
        "Bà thừa nhận: « Deux collaborateurs ont démissionné depuis l'annonce, et ce sont de bons éléments ».", 2),
      q("Pourquoi, selon le délégué syndical, la direction ne peut-elle pas agir seule ?",
        "Le télétravail est garanti par un accord qu'il faut renégocier.",
        ["Le télétravail est imposé par la loi dans ce secteur.", "Le télétravail figure dans le contrat individuel de chaque consultant."],
        "Ông nhắc làm việc từ xa « est prévu par un accord collectif »; thoả ước thì không sửa bằng một lá thư, phải đàm phán lại.", 1.5),
    ],
  };

  /* ─────────────── NGHE 3 ─────────────── */
  const CO3 = {
    id: "lo23mven72cv03n", ten: "b2k-de5-co3", hai: false,
    phanTich: { loai: "Trois courts documents radio", chu_de: "Résidence étudiante partagée, télétravail et recrutement, logements à prix réduit en zone rurale", y_chinh: "Trois chroniques brèves : une résidence aux studios réduits et aux espaces communs généreux, le télétravail devenu critère de choix des jeunes diplômés, des villages qui logent de jeunes professionnels à condition qu'ils restent." },
    docs: [
      { doan: [d("alloy", TIN, "À Grenoble, une résidence étudiante d'un genre nouveau vient d'ouvrir ses portes. Les architectes y ont fait un pari à contre-courant : réduire l'espace privé pour agrandir tout le reste. Les studios ne dépassent pas dix-huit mètres carrés, à peine de quoi loger un lit, un bureau et une salle d'eau. En contrepartie, chaque étage dispose d'une vaste cuisine commune, et le bâtiment compte une salle de travail ouverte jour et nuit, une laverie, un atelier de réparation de vélos et un potager sur le toit. L'idée est de lutter contre l'isolement, première cause d'abandon en première année. Le loyer, lui, est plafonné pour les étudiants boursiers, qui occupent la moitié des logements. Les premiers résidents se disent conquis, même si certains regrettent de ne pas pouvoir recevoir chez eux.")],
        cau: [
          q("Qu'est-ce qui distingue cette résidence ?",
            "Des logements réduits au profit d'espaces partagés.",
            ["Des studios plus vastes que dans les autres résidences.", "Des appartements réservés aux étudiants en architecture."],
            "Các kiến trúc sư chọn « réduire l'espace privé pour agrandir tout le reste »: studio không quá mười tám mét vuông, đổi lại là bếp chung, phòng học, vườn trên mái.", 2),
          q("Pour qui le loyer est-il plafonné ?",
            "Pour les étudiants qui touchent une bourse.",
            ["Pour les étudiants de première année.", "Pour tous les résidents sans exception."],
            "Bản tin nói tiền thuê « est plafonné pour les étudiants boursiers », chiếm một nửa số phòng.", 1),
        ] },
      { doan: [d("nova", TIN, "Le salaire n'est plus tout. C'est ce que révèle une enquête menée auprès des étudiants de dernière année d'une grande école de commerce parisienne. Interrogés sur ce qu'ils examinent en premier dans une offre d'emploi, la moitié d'entre eux répondent : la politique de télétravail, avant même la rémunération, avant aussi les perspectives de carrière. Beaucoup expliquent avoir fait une partie de leurs études à distance et ne pas concevoir de passer cinq jours par semaine dans un bureau. Pour les recruteurs, le signal est clair, et il devient difficile de l'ignorer. Plusieurs cabinets, qui exigeaient jusque-là une présence quotidienne, ont déjà revu leur copie, de crainte de voir les meilleurs candidats leur échapper au profit de concurrents plus souples.")],
        cau: [
          q("D'après l'enquête, que regarde en premier la moitié des jeunes diplômés ?",
            "Les règles de l'entreprise en matière de travail à distance.",
            ["Le montant du salaire proposé à l'embauche.", "Les possibilités d'évolution de carrière offertes par l'entreprise."],
            "Một nửa trả lời: « la politique de télétravail, avant même la rémunération ».", 1.5),
          q("Qu'en résulte-t-il pour les recruteurs ?",
            "Ils sont obligés d'en tenir compte.",
            ["Ils augmentent les salaires.", "Ils recrutent moins de jeunes."],
            "Với nhà tuyển dụng, tín hiệu rõ ràng và « il devient difficile de l'ignorer »; nhiều công ty đã sửa lại yêu cầu của mình.", 1),
        ] },
      { doan: [d("echo", TIN, "Dans le Cantal, les maires ne savent plus comment retenir les jeunes. Une dizaine de villages ont donc décidé d'inverser la logique : puisque les professionnels ne viennent pas, on va les attirer par le logement. Les communes ont racheté et rénové d'anciens presbytères, des écoles fermées, des maisons de bourg, qu'elles louent à prix réduit, parfois la moitié du tarif habituel. Une seule condition figure au contrat : s'engager à rester au moins deux ans. Le dispositif vise les métiers qui manquent le plus, et il a déjà convaincu un médecin, deux enseignantes et plusieurs artisans. Les élus restent prudents : il est trop tôt pour savoir combien resteront une fois l'engagement arrivé à son terme.")],
        cau: [
          q("Que proposent ces villages aux jeunes professionnels ?",
            "Un logement loué moins cher qu'ailleurs.",
            ["Une prime versée à l'installation.", "Un emploi dans les services de la mairie."],
            "Các xã mua và sửa nhà cũ rồi « louent à prix réduit », có khi chỉ bằng nửa giá thường.", 1),
          q("Quelle condition les jeunes doivent-ils accepter ?",
            "Demeurer sur place pendant deux ans au minimum.",
            ["Rénover eux-mêmes le logement.", "Exercer un métier de la santé."],
            "Hợp đồng chỉ có một điều kiện: « s'engager à rester au moins deux ans ».", 0.5),
        ] },
    ],
  };

  return { ten: "DELF B2 · Đề 5", CE: [CE1, CE2, CE3], CO: [CO1, CO2, CO3] };
}
