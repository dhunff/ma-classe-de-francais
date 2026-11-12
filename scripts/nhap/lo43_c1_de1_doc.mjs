/* Lô 43 (12/11, chủ dự án): SOẠN LẠI bài Đọc của DALF C1 · Đề 1 theo khung một đề mẫu chủ dự án
 * gửi (bài phỏng vấn khoảng 2 000 từ, 12 câu, 25 điểm). Giữ đúng khung câu hỏi của mẫu:
 *   1 đến 4: QCM 3 lựa chọn (1,5 / 2 / 1,5 / 2 đ)   5: trả lời ngắn (1,5 đ)
 *   6: ba câu Vrai/Faux có trích dẫn (3 × 1,5 đ)    7: trả lời ngắn (2 đ)
 *   8: Vrai/Faux có trích dẫn (2 đ)                 9, 10: trả lời ngắn (2 đ)
 *   11: QCM nghĩa của một câu (2 đ)                 12: Vrai/Faux có trích dẫn (2 đ, bản Oui/Non của mẫu)
 * Câu trả lời ngắn là loại `court` mới: AI chấm trong Edge Function `grade` theo đáp án mẫu
 * (`model`) và các ý bắt buộc (`answers`), cả hai nằm ở answer_key (không lộ cho học sinh).
 * `heSo` = số NỬA điểm (như đề B2 format mới).
 *
 * TOÀN BỘ do FRACILE soạn (quy tắc 1: không trích báo, không tên người thật trình bày như thật):
 * bài phỏng vấn tưởng tượng, ghi rõ « Texte rédigé pour l'entraînement ». KHÔNG chép nội dung đề
 * mẫu (đề mẫu nói về nghiện ăn; bài này nói về nỗi sợ buồn chán). Không dùng dấu gạch dài.
 *
 * Bài cũ (nhapmuqwmabz00p, « la ville à l'heure du télétravail ») GIỮ NGUYÊN vì lượt thi cũ trỏ
 * tới; migration chỉ đổi exam_sections của Đề 1 sang bài mới.
 * Chạy: node scripts/nhap/lo43_c1_de1_doc.mjs  → ghi supabase/migrations/201_c1_de1_doc_moi.sql */
import { writeFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

const DE1 = "e5bee613-c5a0-46e6-a1d5-dca1a8b35478";
const PHAN_CE = "2e02c394-b0e2-4669-8f63-733d5738fd5e";
const BAI_CU = "nhapmuqwmabz00p";
const MA = "lo43c1de1doc";

let dem = 0;
const id = () => `${MA}q${String(++dem).padStart(2, "0")}`;
let hat = 20261112;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (heSo, prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id(), type: "qcm", heSo, prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
/* Số câu do màn thi tự đánh (1 → 14: câu 6 của mẫu thành ba dòng 6, 7, 8), nên prompt không ghi số. */
const vf = (heSo, prompt, dung, justification) => ({ id: id(), type: "vf", heSo, prompt, answer: dung ? 0 : 1, justification, explanation: justification });
const court = (heSo, prompt, model, answers, explanation) => ({ id: id(), type: "court", heSo, prompt, model, answers, explanation });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const H = (x) => `<strong>${x}</strong>`;

const VAN_BAN = p(
  H("Pourquoi ne supportons-nous plus de nous ennuyer, et faut-il vraiment s'en inquiéter ?"),
  "<em>Téléphone dégainé au moindre temps mort, agendas saturés, loisirs « optimisés » : l'ennui semble avoir disparu de nos vies, ou plutôt nous faisons tout pour le fuir. Cette fuite n'est pas sans conséquences sur notre attention, notre créativité et même notre manière de vivre ensemble.</em>",
  `${H("La rédaction :")} Dans une file d'attente, à un feu rouge, dans un ascenseur : il suffit de quelques secondes d'inactivité pour que la main cherche le téléphone. Pourquoi supportons-nous si mal de ne rien faire ?`,
  `${H("La philosophe* :")} Il faut d'abord distinguer deux choses que l'on confond volontiers : l'inactivité et l'ennui. On peut être inactif sans s'ennuyer le moins du monde. Regardez quelqu'un qui contemple la mer : il ne fait rien, et pourtant il est occupé, si j'ose dire, à exister. L'ennui, lui, commence quand le temps se met à peser, quand on le sent passer sans parvenir à lui donner un contenu. C'est une expérience du vide, et le vide fait peur. Ce n'est pas nouveau : Pascal, au XVII<sup>e</sup> siècle, voyait déjà dans notre incapacité à rester en repos dans une chambre la source de bien des malheurs. Ce qui a changé, c'est que nous avons désormais dans la poche un objet qui promet de combler ce vide à la seconde, gratuitement, indéfiniment. Autrefois, il fallait un effort pour se distraire : sortir, appeler quelqu'un, ouvrir un livre. Aujourd'hui, c'est l'inverse : c'est de ne pas se distraire qui demande un effort. Le rapport de forces s'est renversé.`,
  H("Quelles formes prend aujourd'hui cette fuite devant l'ennui ?"),
  "Elle est partout, et souvent là où on ne l'attend pas. Le téléphone n'en est que la forme la plus visible. Il y a aussi la manie de remplir les agendas : les enfants qui enchaînent judo, piano et soutien scolaire, les adultes qui « optimisent » leurs week-ends comme des journées de travail. Même les vacances doivent être rentabilisées. On rentre de trois semaines au soleil épuisé, avec quatre cents photos et le sentiment d'avoir accompli un programme. Le loisir est devenu une performance comme une autre.",
  "Et puis il existe une forme plus discrète, presque intime : le bruit de fond. La radio allumée en permanence, les podcasts écoutés en accéléré pendant qu'on fait la vaisselle, la série qui tourne pendant le dîner. On ne fait plus jamais une seule chose à la fois. Ce qu'on écoute importe peu ; l'essentiel, c'est de ne jamais rester seul avec soi-même. Ce qui frappe, c'est que ces comportements ne relèvent pas du plaisir. Interrogez les gens : la plupart ne tirent à peu près aucune satisfaction de ces minutes passées à faire défiler des images. Ils le font pour ne pas sentir autre chose. C'est une anesthésie, bien plus qu'une distraction.",
  "Le monde du travail n'est pas en reste. Les messageries professionnelles nous suivent jusque dans la salle de bains, et l'on se surprend à vérifier ses courriels un dimanche soir, non parce qu'on attend une réponse urgente, mais parce que l'inaction nous met mal à l'aise. Être joignable en permanence est devenu une forme de politesse, presque une preuve de sérieux. Celui qui ne répond pas dans l'heure passe pour négligent. Résultat : il n'existe plus guère de moments où l'on puisse légitimement dire « je ne fais rien ». Même la pause café a changé de nature : on la passe à rattraper les messages en retard plutôt qu'à bavarder ou à regarder par la fenêtre.",
  H("D'où vient ce besoin d'être occupé en permanence ? Est-ce seulement la faute des écrans ?"),
  "Les écrans ont bon dos ! Les raisons sont multiples, et elles s'additionnent. Il y a d'abord une raison économique, au sens propre du terme. Notre attention est devenue une marchandise. Les applications que nous utilisons sont conçues par des ingénieurs dont le métier consiste à nous retenir le plus longtemps possible : notifications, défilement infini, vidéos qui s'enchaînent toutes seules. Ce n'est pas un complot, c'est un modèle d'affaires : plus nous restons, plus on peut vendre d'espaces publicitaires. Pour ces entreprises, l'ennui est donc un concurrent à éliminer. Celui qui s'ennuie les yeux dans le vide ne rapporte rien à personne.",
  "Il y a ensuite une raison culturelle, beaucoup plus ancienne. Nos sociétés valorisent l'activité, la productivité, la vitesse. « Le temps, c'est de l'argent », dit le proverbe, et celui qui ne fait rien est aussitôt soupçonné de paresse. Nous avons hérité de cette vieille morale selon laquelle l'oisiveté serait la mère de tous les vices. Avouer qu'on s'ennuie, c'est presque avouer un échec : on n'a pas su remplir sa vie.",
  "Enfin, il y a une raison psychologique, et c'est peut-être la plus profonde. Quand rien ne vient nous distraire, ce qui remonte à la surface, ce sont nos pensées, nos inquiétudes, parfois des questions que nous préférons laisser de côté. Est-ce que ma vie me convient ? Est-ce que je fais vraiment ce que je veux faire ? L'ennui est une porte qui s'ouvre sur nous-mêmes, et tout le monde n'a pas envie de la franchir. Alors on la referme, vite, d'un coup de pouce sur l'écran.",
  H("L'ennui serait-il donc utile ? Que se passe-t-il dans notre esprit quand nous nous ennuyons ?"),
  "« Utile », le mot me gêne un peu, parce qu'il réintroduit la logique de rentabilité dont nous venons de parler. Je dirais plutôt « fécond ». Les travaux en psychologie, comme ceux en neurosciences, convergent sur un point : lorsque l'esprit n'est pas sollicité par une tâche précise, il ne s'éteint pas. Il se met à vagabonder. Il associe des souvenirs, imagine des scénarios, relie des idées qui n'avaient a priori rien à voir. C'est souvent dans ces moments-là que surgissent les idées neuves : sous la douche, en marchant, en regardant défiler le paysage par la fenêtre du train. Le cerveau a besoin de ces périodes de jachère, comme un champ qu'on laisse reposer pour qu'il produise davantage l'année suivante.",
  "Les enfants le montrent très bien. Un enfant qui s'ennuie un mercredi après-midi commence par se plaindre. Il tourne en rond, il harcèle ses parents. Et puis, si personne ne vient le « sauver » avec un écran, au bout d'un moment, il invente quelque chose : une cabane avec des coussins, une histoire, un jeu dont il fixe lui-même les règles. L'ennui l'a obligé à puiser dans ses propres ressources. L'en priver systématiquement, c'est le priver d'un apprentissage essentiel, celui de l'autonomie intérieure.",
  "Mais attention, je ne fais pas l'éloge de n'importe quel ennui. Il existe un ennui destructeur : celui du travail absurde, de la solitude subie, de la maladie qui cloue au lit. Celui-là n'a rien de fécond, il use, il abîme. Je parle de l'ennui passager, celui des temps morts du quotidien, que nous avons appris à fuir alors qu'il pourrait nous nourrir.",
  H("Sommes-nous tous égaux face à l'ennui ? Les jeunes générations sont-elles plus touchées que les autres ?"),
  "On accuse volontiers les jeunes ; c'est un réflexe vieux comme le monde. En réalité, observez une salle d'attente : les plus de cinquante ans ne sont pas les derniers à consulter leur téléphone ! Ce qui est vrai, c'est que les jeunes n'ont pas connu le monde d'avant. Pour eux, l'attente sans écran n'est pas une habitude perdue, c'est une expérience qu'ils n'ont jamais faite. Ils n'ont tout simplement pas de point de comparaison.",
  "Il y a aussi des inégalités sociales qu'on oublie trop souvent. S'ennuyer de façon féconde suppose un minimum de sécurité : un lieu calme, du temps libre qui ne soit pas rongé par l'angoisse des fins de mois. Quand on cumule deux emplois ou qu'on vit à cinq dans un deux-pièces, les moments de vide sont rares, et quand ils arrivent, ils sont aussitôt envahis par les soucis. Le téléphone, dans ce cas, n'a rien d'une fuite frivole : c'est parfois le seul espace de répit accessible, la seule fenêtre ouverte sur autre chose. Gardons-nous de faire la morale à des gens dont nous ignorons les conditions de vie.",
  H("Cette incapacité à s'ennuyer a-t-elle des conséquences au-delà de l'individu ? Touche-t-elle la vie collective ?"),
  "Je le crois, oui. La première conséquence concerne notre capacité de concentration. À force de passer d'un contenu à l'autre toutes les trente secondes, nous perdons l'habitude de l'effort prolongé : lire un livre de trois cents pages, suivre un raisonnement complexe, écouter quelqu'un jusqu'au bout sans l'interrompre. Les enseignants le constatent tous les jours, mais aussi les employeurs, et même les éditeurs.",
  "La deuxième conséquence est plus politique. Une démocratie a besoin de citoyens capables de prendre le temps de réfléchir, de peser des arguments, de supporter qu'une question reste un moment sans réponse. Or la logique de la sollicitation permanente favorise exactement l'inverse : la réaction instantanée, l'indignation qui chasse la précédente, les opinions qu'on adopte en deux secondes et qu'on oublie en deux heures. Celui qui ne supporte pas l'ennui supporte mal la complexité. Il veut que ça aille vite, que ce soit simple, que ce soit tranché.",
  "Enfin, il y a nos relations aux autres. Combien de dîners où chacun garde un œil sur son écran dès que la conversation s'essouffle ? Or ces petits silences, ces moments un peu creux, font partie de la relation. C'est souvent après un silence qu'on ose dire quelque chose d'important. Si on les comble systématiquement, on reste à la surface des choses, et des êtres.",
  H("Comment réapprendre à s'ennuyer ? Faut-il se débarrasser de son téléphone ?"),
  "Surtout pas de solution radicale ! Les cures de « détox numérique » qu'on voit fleurir un peu partout sont souvent des produits comme les autres. On paie un stage d'un week-end dans un gîte sans réseau, on revient ravi, et le lundi matin, tout recommence. Ces cures reposent au fond sur la même logique que ce qu'elles prétendent combattre : une consommation, une performance, un programme de plus à cocher. On ne guérit pas de la frénésie par une frénésie inverse.",
  "Je crois davantage aux petits gestes, répétés jour après jour. Laisser son téléphone dans une autre pièce pendant le repas. Attendre le bus sans rien faire, juste en regardant les passants. Marcher sans écouteurs. Au début, c'est inconfortable ; on éprouve une sorte de démangeaison, comme un fumeur qui vient d'arrêter. Puis on découvre que le vide n'est pas si vide. Il s'y passe des choses : on remarque un détail dans la rue, une idée revient, une envie émerge. Mais surtout, il faut comprendre pourquoi on fuit. Tant qu'on ne s'interroge pas sur ce que l'on cherche à éviter, les bonnes résolutions ne tiennent pas. L'ennui n'est ni un ennemi à abattre ni un remède miracle ; c'est un signal qu'il faut apprendre à écouter.",
  "Quant aux parents, leur rôle est évident, mais il a ses exigences. Un adolescent repère immédiatement le décalage entre le discours et les actes : on ne peut pas lui confisquer sa console en répondant à ses courriels professionnels pendant le dîner. L'exemple compte plus que l'interdiction.",
  H("Faut-il alors réhabiliter l'ennui, en faire une vertu ?"),
  "Je me méfie un peu de cette mode qui consiste à faire de l'ennui une vertu, voire une technique de développement personnel : « ennuyez-vous dix minutes par jour pour devenir plus créatif ». On retombe alors dans le piège : on transforme l'ennui en outil, en moyen d'être plus performant. Or son intérêt tient justement à ce qu'il ne sert à rien de manière immédiate. Ce que je souhaite, c'est plutôt qu'on cesse de le traiter comme une maladie honteuse. Qu'on accepte de perdre un peu de temps, sans culpabilité.",
  "Montaigne souhaitait que la mort le trouve « plantant ses choux », c'est-à-dire occupé à une tâche modeste, sans grande ambition. Il y a là une sagesse dont nous aurions bien besoin. Nous ne parviendrons jamais à supprimer l'ennui, et c'est tant mieux. La question n'est pas de l'éliminer, ni de le rentabiliser, mais d'apprendre à habiter le temps, même quand il ne s'y passe rien. Et cela, aucune application ne le fera à notre place.",
  "<em>* Texte rédigé pour l'entraînement : entretien imaginaire avec une philosophe qui travaille sur l'attention et le rapport au temps.</em>",
);

const CAU = [
  qcm(3, "Dans cet entretien, la philosophe se propose…",
    "d'expliquer pourquoi nous fuyons l'ennui et ce que cette fuite nous fait perdre.",
    ["de dénoncer l'usage excessif du téléphone chez les jeunes.", "de proposer une méthode pour devenir plus créatif."],
    "L'entretien parcourt les formes de la fuite devant l'ennui, ses causes (économique, culturelle, psychologique), ses conséquences et les moyens d'en sortir. Elle refuse d'accuser les jeunes (« On accuse volontiers les jeunes ; c'est un réflexe vieux comme le monde ») et se méfie de l'ennui « pour devenir plus créatif »."),
  qcm(4, "Qu'est-ce qui distingue l'ennui de la simple inactivité ?",
    "Le sentiment que le temps passe à vide.",
    ["L'immobilité du corps.", "Le refus de travailler."],
    "« L'ennui, lui, commence quand le temps se met à peser, quand on le sent passer sans parvenir à lui donner un contenu »."),
  qcm(3, "Que cherchent surtout les gens qui font défiler des images sur leur téléphone ?",
    "À ne pas ressentir autre chose.",
    ["À se faire plaisir.", "À s'informer sur l'actualité."],
    "« la plupart ne tirent à peu près aucune satisfaction de ces minutes… Ils le font pour ne pas sentir autre chose. C'est une anesthésie, bien plus qu'une distraction »."),
  qcm(4, "Comment peut-on, selon elle, réapprendre à s'ennuyer ?",
    "Par de petits gestes répétés et en s'interrogeant sur ce que l'on fuit.",
    ["En suivant un stage de déconnexion totale.", "En confiant son téléphone à ses proches."],
    "« Je crois davantage aux petits gestes, répétés jour après jour… Mais surtout, il faut comprendre pourquoi on fuit ». Les stages de « détox numérique » sont au contraire critiqués."),
  court(3, "Pourquoi l'ennui est-il, pour les entreprises du numérique, « un concurrent à éliminer » ?",
    "Parce que leur modèle d'affaires repose sur notre attention : plus nous restons sur leurs applications, plus elles vendent d'espaces publicitaires. Quelqu'un qui s'ennuie sans écran ne leur rapporte rien.",
    ["Leur revenu (modèle d'affaires, publicité) dépend du temps que nous passons sur leurs applications : notre attention est une marchandise.",
      "Celui qui s'ennuie (sans écran, les yeux dans le vide) n'utilise pas leurs applications, donc ne leur rapporte rien."],
    "« plus nous restons, plus on peut vendre d'espaces publicitaires… Celui qui s'ennuie les yeux dans le vide ne rapporte rien à personne »."),
  vf(3, "Selon la philosophe, les loisirs échappent aujourd'hui à la logique de la performance.", false,
    "« Le loisir est devenu une performance comme une autre. »"),
  vf(3, "Pour la philosophe, toutes les formes d'ennui ne sont pas bénéfiques.", true,
    "« Mais attention, je ne fais pas l'éloge de n'importe quel ennui. Il existe un ennui destructeur »"),
  vf(3, "Dans les lieux d'attente, les personnes plus âgées consultent moins leur téléphone que les jeunes.", false,
    "« observez une salle d'attente : les plus de cinquante ans ne sont pas les derniers à consulter leur téléphone ! »"),
  court(4, "Que gagne un enfant qui s'ennuie, si personne ne vient le distraire avec un écran ?",
    "Il finit par inventer quelque chose (une cabane, une histoire, un jeu) : l'ennui l'oblige à puiser dans ses propres ressources, et il apprend ainsi l'autonomie intérieure.",
    ["Il invente, crée quelque chose par lui-même (jeu, histoire, cabane) : il puise dans ses propres ressources.",
      "Il fait l'apprentissage de l'autonomie intérieure."],
    "« L'ennui l'a obligé à puiser dans ses propres ressources… un apprentissage essentiel, celui de l'autonomie intérieure »."),
  vf(4, "Pour les personnes qui vivent dans des conditions difficiles, le téléphone peut représenter l'un des rares moments de détente.", true,
    "« c'est parfois le seul espace de répit accessible, la seule fenêtre ouverte sur autre chose »"),
  court(4, "Quel lien la philosophe établit-elle entre l'incapacité à s'ennuyer et la vie démocratique ?",
    "Une démocratie a besoin de citoyens qui prennent le temps de réfléchir, de peser des arguments et d'accepter qu'une question reste sans réponse. Or la sollicitation permanente pousse à la réaction instantanée et à des opinions simplistes : qui ne supporte pas l'ennui supporte mal la complexité.",
    ["La démocratie exige des citoyens capables de prendre le temps de réfléchir, de peser des arguments, de supporter qu'une question reste sans réponse.",
      "L'incapacité à s'ennuyer (la sollicitation permanente) favorise la réaction instantanée, l'indignation, des opinions rapides et tranchées : on supporte mal la complexité."],
    "« Une démocratie a besoin de citoyens capables de prendre le temps de réfléchir… Celui qui ne supporte pas l'ennui supporte mal la complexité »."),
  court(4, "Que reproche la philosophe aux cures de « détox numérique » ?",
    "Ce sont des produits de consommation dont l'effet ne dure pas (tout recommence le lundi), et elles reposent sur la même logique que ce qu'elles combattent : consommer, performer, suivre un programme.",
    ["Elles sont des produits commerciaux à l'effet passager : on revient ravi, mais tout recommence ensuite.",
      "Elles suivent la même logique que ce qu'elles prétendent combattre (consommation, performance, programme)."],
    "« des produits comme les autres… le lundi matin, tout recommence. Ces cures reposent au fond sur la même logique que ce qu'elles prétendent combattre »."),
  qcm(4, "Quelle est la signification de l'expression « apprendre à habiter le temps, même quand il ne s'y passe rien » ?",
    "Savoir vivre pleinement les moments vides.",
    ["Remplir chaque minute d'une activité utile.", "Trouver un logement où l'on se sent bien."],
    "Dans la conclusion, la philosophe refuse d'« éliminer » ou de « rentabiliser » l'ennui : il s'agit d'accepter les moments où rien ne se passe. « Habiter » est employé au sens figuré, pas au sens de se loger."),
  vf(4, "La philosophe conclut qu'il faut s'imposer chaque jour un moment d'ennui pour devenir plus performant.", false,
    "« On retombe alors dans le piège : on transforme l'ennui en outil, en moyen d'être plus performant. »"),
];

const VOCAB = [
  ["un temps mort (nom masculin)", "khoảng thời gian trống, lúc rảnh không làm gì"],
  ["dégainer (verbe, fig.)", "rút ra thật nhanh (dégainer son téléphone)"],
  ["combler (verbe)", "lấp đầy (combler un vide)"],
  ["le rapport de forces (nom masculin)", "tương quan lực lượng"],
  ["rentabiliser (verbe)", "làm cho sinh lời, tận dụng cho có lợi"],
  ["un bruit de fond (nom masculin)", "tiếng ồn nền, âm thanh văn vẳng thường trực"],
  ["avoir bon dos (locution)", "bị đổ lỗi oan, làm cái cớ (Les écrans ont bon dos.)"],
  ["l'oisiveté (nom féminin)", "sự nhàn rỗi, ăn không ngồi rồi"],
  ["fécond (adjectif)", "phong phú, sinh ra nhiều điều mới"],
  ["vagabonder (verbe)", "lang thang (tâm trí nghĩ miên man)"],
  ["la jachère (nom féminin)", "đất bỏ hoá cho nghỉ (nghĩa bóng: thời gian để đầu óc nghỉ)"],
  ["puiser dans (verbe)", "múc, rút ra từ (puiser dans ses ressources)"],
  ["rongé par (participe)", "bị gặm nhấm, bị bào mòn bởi"],
  ["le répit (nom masculin)", "lúc tạm nghỉ, khoảng nghỉ ngơi"],
  ["tranché (adjectif)", "dứt khoát, rạch ròi, không có sắc thái"],
  ["s'essouffler (verbe)", "hụt hơi, chững lại (la conversation s'essouffle)"],
  ["une démangeaison (nom féminin)", "cơn ngứa; sự thôi thúc khó chịu"],
  ["réhabiliter (verbe)", "phục hồi danh dự, đánh giá lại một cách tích cực"],
];

const EXPLICATIONS = [
  "Le texte est un entretien : les questions du journaliste (en gras) servent de repères pour retrouver vite un passage. Mais les idées reviennent d'une réponse à l'autre (la logique de rentabilité, par exemple, apparaît dans plusieurs parties) : relisez le passage autour de votre repère avant de répondre.",
  "Les questions suivent globalement l'ordre du texte. La question 1 porte sur l'ensemble et la question 4 sur l'avant-dernière partie : traitez-les après les autres.",
  "Les questions reformulent presque toujours le texte : « annonces », « bénéfice », « moments de détente » ne sont pas les mots exacts de l'entretien. Cherchez l'idée, pas le mot.",
  "Vrai/Faux : la justification doit être un passage précis et court qui prouve votre choix. Un adverbe absolu (« toujours », « toutes », « aucun ») dans l'affirmation est souvent un indice, mais vérifiez toujours dans le texte.",
  "Questions à réponse courte : répondez en une ou deux phrases avec vos propres mots, en donnant tous les éléments demandés (souvent deux idées pour 2 points). Vous pouvez reprendre quelques mots du texte, mais une longue citation sans explication ne suffit pas.",
  "Expressions et citations : « avoir bon dos », « l'oisiveté est mère de tous les vices », « le temps, c'est de l'argent », la jachère, les choux de Montaigne. Comprenez-les dans leur contexte : la question 11, par exemple, joue sur le sens propre et le sens figuré d'« habiter ».",
];

const ex = {
  id: MA, title: "Lecture C1 · Đề 1 : pourquoi fuyons-nous l'ennui ?", level: "C1", skills: ["Lecture"],
  usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [],
  timeLimit: 50,
  consigne: "<p><strong>Compréhension des écrits : 50 minutes, 25 points.</strong> Lisez le texte puis répondez aux questions. Pour les questions ouvertes, répondez avec vos propres mots ; pour les questions Vrai/Faux, recopiez le passage qui justifie votre réponse.</p>",
  readingText: VAN_BAN,
  vocabulaire: VOCAB.map(([a, b]) => `• ${a} : ${b}`).join("\n"),
  explications: EXPLICATIONS.map((x) => `• ${x}`).join("\n"),
  questions: CAU, createdAt: Date.parse("2026-11-12T08:00:00Z"),
};

/* ── Kiểm trước khi in ── */
const chu = VAN_BAN.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const soTu = chu.split(" ").length;
const tongNua = CAU.reduce((n, q) => n + q.heSo, 0);
if (tongNua !== 50) throw new Error(`Tổng điểm ${tongNua / 2} ≠ 25`);
if (CAU.length !== 14) throw new Error("Cần 14 dòng câu hỏi (12 câu, câu 6 có 3 ý)");
if (/—/.test(JSON.stringify(ex))) throw new Error("Có dấu gạch dài");
for (const q of CAU.filter((x) => x.type === "vf")) {
  const t = q.justification.replace(/[«»!]/g, "").replace(/…/g, "").trim();
  for (const doan of t.split(/\s{2,}/)) if (!chu.includes(doan.trim().replace(/\s+/g, " ").slice(0, 40))) throw new Error(`Trích dẫn không có trong bài: ${doan.slice(0, 50)}`);
}
console.error(`Bài đọc: ${soTu} từ · ${CAU.length} dòng câu hỏi · ${tongNua / 2} điểm`);

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const { exRow, qRows } = toRows(ex, "exam");
const cot = Object.keys(exRow);
const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");

const sql = `-- 201 (12/11, chủ dự án): SOẠN LẠI bài Đọc của DALF C1 · Đề 1 theo khung đề mẫu chủ dự án gửi
-- (phỏng vấn ~${Math.round(soTu / 100) * 100} từ, 12 câu, 25 điểm: QCM, Vrai/Faux có trích dẫn, 4 câu trả lời ngắn).
-- Câu trả lời ngắn là loại « court » mới, AI chấm trong Edge Function grade (deploy grade TRƯỚC khi chạy file này).
-- Bài cũ ${BAI_CU} GIỮ NGUYÊN (lượt thi cũ trỏ tới), chỉ đổi phần CE của Đề 1 sang bài mới.
-- Máy dựng: scripts/nhap/lo43_c1_de1_doc.mjs. Chạy lại an toàn (bỏ qua nếu bài đã có).
with e as (
  insert into public.exercises (${cot.join(", ")})
  values (${gt.join(", ")})
  on conflict (id) do nothing
  returning id
), c as (
  insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)
  select v.* from e, (values
${dong}
  ) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation)
  returning exercise_id
)
update public.exam_sections s
set exercise_id = ${q(MA)}
where s.id = ${q(PHAN_CE)} and s.exam_id = ${q(DE1)} and s.code = 'CE'
  and (s.exercise_id = ${q(BAI_CU)} or s.exercise_id = ${q(MA)})
  and exists (select 1 from public.exercises x where x.id = ${q(MA)} union all select 1 from e);
`;
writeFileSync("supabase/migrations/201_c1_de1_doc_moi.sql", sql);
console.error("Đã ghi supabase/migrations/201_c1_de1_doc_moi.sql");
