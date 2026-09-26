/* Lô 1 bài luyện soạn sẵn (26/09) — NHÁP, chờ chủ dự án duyệt.
 *
 * Nháp = kho "assignment", giao cho một người nhận KHÔNG tồn tại
 * (`__nhap__`), tiêu đề có tiền tố « [NHÁP] ». Học sinh không ai thấy
 * (assignedTo rỗng mới là "giao cho tất cả"). Giáo viên mở trong Thư viện bài
 * tập, sửa nếu cần, đổi « Loại sử dụng » sang « Luyện tập tự do » + bỏ tiền tố
 * → bài vào Thư viện luyện tập.
 *
 * Chạy: node scripts/nhap/lo1_bai_luyen.mjs > lo1.sql — sinh SQL qua ĐÚNG
 * toRows của ứng dụng, nên đáp án nằm ở answer_key như bài soạn tay. */
import { toRows } from "../../src/shared/exerciseMap.js";

let dem = 0;
const id = (tien) => `${tien}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
const qcm = (prompt, options, answer, explanation) => ({ id: id("q"), type: "qcm", prompt, options, answer, explanation });
const fill = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });

const BAI = [
  { title: "Le subjonctif après la volonté et les sentiments", level: "B1", skills: ["Grammaire"],
    consigne: "Choisissez la forme correcte du verbe.",
    questions: [
      qcm("Je veux que tu ______ à l'heure demain.", ["viens", "viennes", "viendras", "venais"], 1, "« vouloir que » + SUBJONCTIF: que tu viennes."),
      qcm("Il faut que nous ______ ce dossier avant midi.", ["finissons", "finirons", "finissions", "avons fini"], 2, "« il faut que » luôn kéo theo subjonctif: que nous finissions."),
      qcm("Je suis content que vous ______ là.", ["êtes", "soyez", "serez", "étiez"], 1, "Cảm xúc (être content que) + subjonctif: que vous soyez."),
      qcm("Elle pense que le film ______ intéressant.", ["soit", "est", "sera été", "fût"], 1, "« penser que » ở thể KHẲNG ĐỊNH dùng INDICATIF: le film est."),
      qcm("Je ne pense pas qu'il ______ raison.", ["a", "ait", "aura", "avait"], 1, "« ne pas penser que » (phủ định) → subjonctif: qu'il ait raison."),
      qcm("Nous souhaitons que tout ______ bien.", ["se passe", "se passera", "se passait", "s'est passé"], 0, "« souhaiter que » + subjonctif; se passe ở subjonctif trùng hình thức với hiện tại."),
      qcm("Bien qu'il ______ fatigué, il continue.", ["est", "soit", "était", "sera"], 1, "« bien que » (mặc dù) luôn + subjonctif: bien qu'il soit."),
      qcm("J'espère que tu ______ ton examen.", ["réussisses", "réussiras", "réussisse", "aies réussi"], 1, "« espérer que » dùng INDICATIF (thường là futur), KHÔNG dùng subjonctif."),
      qcm("Il est dommage que vous ne ______ pas venir.", ["pouvez", "pourrez", "puissiez", "pouviez"], 2, "« il est dommage que » (cảm xúc) + subjonctif: que vous puissiez."),
      qcm("Avant que nous ______, fermez les fenêtres.", ["partons", "partions", "partirons", "sommes partis"], 1, "« avant que » + subjonctif: avant que nous partions."),
    ] },
  { title: "Les pronoms relatifs composés", level: "B2", skills: ["Grammaire"],
    consigne: "Complétez avec le pronom relatif qui convient (lequel, auquel, duquel, etc.).",
    questions: [
      fill("Voici la table sur ______ j'ai posé mes clés.", "laquelle", "sur + la table (giống cái, số ít) → sur laquelle."),
      fill("C'est le projet ______ je pense depuis des mois.", "auquel", "penser À quelque chose → à + lequel = auquel."),
      fill("La réunion à ______ vous avez assisté était longue.", "laquelle", "assister À + la réunion → à laquelle."),
      fill("Les amis avec ______ je voyage sont suisses.", "lesquels|qui", "avec + les amis: avec lesquels (hoặc avec qui vì là người)."),
      fill("Le parc au milieu ______ se trouve la fontaine est immense.", "duquel", "au milieu DE + le parc → de + lequel = duquel."),
      fill("Ce sont des questions ______ il faut réfléchir.", "auxquelles", "réfléchir À + des questions (giống cái, số nhiều) → auxquelles."),
      fill("Le livre dans ______ j'ai trouvé cette lettre est ancien.", "lequel", "dans + le livre → dans lequel."),
      fill("Les raisons pour ______ il est parti restent floues.", "lesquelles", "pour + les raisons (giống cái, số nhiều) → pour lesquelles."),
      fill("C'est une entreprise près ______ j'habite.", "de laquelle", "près DE + une entreprise → de laquelle (không gộp vì giống cái)."),
      fill("Le concours ______ elle participe est international.", "auquel", "participer À + le concours → auquel."),
    ] },
  { title: "Passé composé ou imparfait ?", level: "B1", skills: ["Grammaire"],
    consigne: "Choisissez le temps qui convient.",
    questions: [
      qcm("Quand j'étais petit, je ______ à la campagne.", ["ai habité", "habitais", "habiterai", "habite"], 1, "Thói quen / bối cảnh kéo dài trong quá khứ → imparfait."),
      qcm("Hier, il ______ trois heures sur ce rapport.", ["travaillait", "a travaillé", "travaille", "travaillera"], 1, "Hành động có thời lượng xác định (trois heures) và đã xong → passé composé."),
      qcm("Il pleuvait quand nous ______.", ["arrivions", "sommes arrivés", "arrivons", "arriverons"], 1, "Bối cảnh (il pleuvait) + hành động chen ngang → passé composé."),
      qcm("Chaque été, nous ______ en Bretagne.", ["sommes allés", "allions", "irons", "allons"], 1, "« chaque été » = thói quen trong quá khứ → imparfait."),
      qcm("Soudain, le téléphone ______.", ["sonnait", "a sonné", "sonne", "sonnera"], 1, "« soudain » báo một hành động bất ngờ, xảy ra một lần → passé composé."),
      qcm("La maison ______ grande et lumineuse.", ["a été", "était", "est", "sera"], 1, "Miêu tả trong quá khứ → imparfait."),
      qcm("En 2019, elle ______ son diplôme.", ["obtenait", "a obtenu", "obtient", "obtiendra"], 1, "Sự kiện xác định tại một mốc → passé composé."),
      qcm("Je ______ la télé quand tu m'as appelé.", ["ai regardé", "regardais", "regarde", "regarderai"], 1, "Hành động đang diễn ra (bị chen ngang) → imparfait."),
      qcm("Nous ______ trois fois à Rome.", ["allions", "sommes allés", "irons", "allons"], 1, "Số lần đếm được (trois fois) → passé composé."),
      qcm("Il ______ fatigué, alors il est rentré tôt.", ["a été", "était", "est", "sera"], 1, "Trạng thái / lý do làm nền → imparfait."),
    ] },
  { title: "Les connecteurs logiques", level: "B2", skills: ["Grammaire", "Lecture"],
    consigne: "Choisissez le connecteur qui convient au sens de la phrase.",
    questions: [
      qcm("Il a beaucoup travaillé ; ______, il a réussi.", ["pourtant", "par conséquent", "cependant", "alors que"], 1, "Kết quả tất yếu → par conséquent."),
      qcm("Elle est riche ; ______, elle vit simplement.", ["donc", "pourtant", "ainsi", "car"], 1, "Đối lập với điều lẽ ra phải xảy ra → pourtant."),
      qcm("Je reste à la maison ______ il pleut.", ["car", "donc", "pourtant", "bien que"], 0, "Nêu nguyên nhân → car."),
      qcm("______ la pluie, le match a eu lieu.", ["Grâce à", "Malgré", "À cause de", "Faute de"], 1, "Nhượng bộ + danh từ → malgré."),
      qcm("______ ses efforts, il a obtenu le poste.", ["Malgré", "Grâce à", "Faute de", "Au lieu de"], 1, "Nguyên nhân TÍCH CỰC → grâce à."),
      qcm("Il a démissionné, ______ il ne supportait plus son chef.", ["puisque", "tandis que", "afin que", "sauf que"], 0, "Nguyên nhân mà ai cũng biết → puisque."),
      qcm("Paul aime la mer, ______ Julie préfère la montagne.", ["donc", "tandis que", "car", "puisque"], 1, "So sánh đối lập hai người → tandis que."),
      qcm("Parlez plus fort ______ tout le monde entende.", ["pour que", "parce que", "alors que", "dès que"], 0, "Mục đích → pour que (+ subjonctif)."),
      qcm("______ d'argent, le projet a été abandonné.", ["Grâce à", "Faute", "Malgré", "Au lieu"], 1, "« faute de » = vì thiếu → Faute d'argent."),
      qcm("Il n'a pas appelé ; ______, il a envoyé un message.", ["en revanche", "en effet", "de plus", "donc"], 0, "Đối lập / bù lại → en revanche."),
    ] },
  { title: "Vocabulaire : le monde du travail", level: "B1", skills: ["Vocabulaire"],
    consigne: "Choisissez le mot qui convient.",
    questions: [
      qcm("Pour trouver un emploi, il faut d'abord envoyer son ______.", ["salaire", "CV", "congé", "contrat"], 1, "CV = sơ yếu lý lịch."),
      qcm("Elle a signé un ______ à durée indéterminée (CDI).", ["contrat", "entretien", "stage", "poste"], 0, "CDI = contrat à durée indéterminée: hợp đồng không thời hạn."),
      qcm("Pendant l'______ d'embauche, on lui a posé beaucoup de questions.", ["entretien", "embauche", "emploi", "équipe"], 0, "entretien d'embauche = phỏng vấn xin việc."),
      qcm("Il a quitté son emploi : il a ______.", ["embauché", "démissionné", "licencié", "recruté"], 1, "démissionner = tự nghỉ việc (khác licencier = bị sa thải)."),
      qcm("L'entreprise a ______ vingt salariés à cause de la crise.", ["démissionné", "licencié", "postulé", "formé"], 1, "licencier = cho thôi việc, sa thải."),
      qcm("Les ______ payés durent cinq semaines en France.", ["congés", "horaires", "stages", "salaires"], 0, "congés payés = ngày nghỉ phép có lương."),
      qcm("Pour ce ______, il faut parler anglais.", ["poste", "patron", "bureau", "chômage"], 0, "poste = vị trí công việc."),
      qcm("Après son licenciement, il s'est retrouvé au ______.", ["chômage", "travail", "télétravail", "salaire"], 0, "être au chômage = thất nghiệp."),
      qcm("Elle travaille de chez elle : elle fait du ______.", ["bénévolat", "télétravail", "stage", "temps plein"], 1, "télétravail = làm việc từ xa."),
      qcm("Mon ______ est de 2 000 euros par mois.", ["salaire", "prix", "coût", "tarif"], 0, "salaire = tiền lương."),
    ] },
  { title: "Le discours indirect au passé", level: "B2", skills: ["Grammaire"],
    consigne: "Transformez au discours indirect : choisissez la forme correcte.",
    questions: [
      qcm("Il a dit : « Je suis fatigué. » → Il a dit qu'il ______ fatigué.", ["est", "était", "sera", "a été"], 1, "Présent → imparfait khi động từ dẫn ở quá khứ."),
      qcm("Elle a dit : « J'ai fini. » → Elle a dit qu'elle ______.", ["a fini", "avait fini", "finirait", "finissait"], 1, "Passé composé → plus-que-parfait."),
      qcm("Ils ont dit : « Nous viendrons. » → Ils ont dit qu'ils ______.", ["viendront", "viendraient", "venaient", "sont venus"], 1, "Futur → conditionnel présent."),
      qcm("Il m'a demandé : « Tu viens ? » → Il m'a demandé ______ je venais.", ["que", "si", "ce que", "qu'est-ce que"], 1, "Câu hỏi có/không → si."),
      qcm("Elle m'a demandé : « Qu'est-ce que tu fais ? » → Elle m'a demandé ______ je faisais.", ["qu'est-ce que", "ce que", "que", "si"], 1, "« qu'est-ce que » → ce que ở lời gián tiếp."),
      qcm("Il a dit : « Je partirai demain. » → Il a dit qu'il partirait ______.", ["demain", "le lendemain", "hier", "la veille"], 1, "demain → le lendemain."),
      qcm("Elle a dit : « Je l'ai vu hier. » → Elle a dit qu'elle l'avait vu ______.", ["hier", "la veille", "le lendemain", "aujourd'hui"], 1, "hier → la veille."),
      qcm("Il a ordonné : « Sortez ! » → Il nous a ordonné ______.", ["que nous sortons", "de sortir", "sortir", "si nous sortions"], 1, "Mệnh lệnh → de + infinitif."),
      qcm("Tu as dit : « C'est ici. » → Tu as dit que c'était ______.", ["ici", "là", "là-bas", "ailleurs"], 1, "ici → là."),
      qcm("On m'a demandé : « Où habites-tu ? » → On m'a demandé où ______.", ["habites-tu", "j'habitais", "tu habitais", "habitais-je"], 1, "Không đảo ngữ ở câu hỏi gián tiếp; đổi ngôi + thì: où j'habitais."),
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
