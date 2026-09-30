/* Lô 2 bài luyện soạn sẵn (30/09) — NHÁP cho ba cấp đang thiếu: A2, B2+, C1.
 *
 * Cùng quy ước với lo1_bai_luyen.mjs: kho "assignment", giao cho người nhận
 * không tồn tại `__nhap__`, tiêu đề có tiền tố « [NHÁP] » — học sinh không ai
 * thấy cho tới khi giáo viên duyệt, đổi « Loại sử dụng » sang « Luyện tập tự
 * do » và bỏ tiền tố.
 *
 * Mỗi câu `fill` đúng MỘT ô trống (CLAUDE.md). Câu qcm nào có hai phương án
 * đều chấp nhận được trong tiếng Pháp chuẩn đã bị loại lúc soạn — xem ghi chú
 * ở bài C1.
 *
 * Chạy: node scripts/nhap/lo2_bai_luyen.mjs > lo2.sql */
import { toRows } from "../../src/shared/exerciseMap.js";

let dem = 0;
const id = (tien) => `${tien}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
const qcm = (prompt, options, answer, explanation) => ({ id: id("q"), type: "qcm", prompt, options, answer, explanation });
const fill = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation });

const BAI = [
  /* ───────────── A2 ───────────── */
  { title: "Les articles partitifs et la quantité", level: "A2", skills: ["Grammaire"],
    consigne: "Choisissez l'article qui convient.",
    questions: [
      qcm("Le matin, je bois ______ café.", ["du", "de la", "des", "de"], 0, "café là danh từ giống đực, không đếm được → du."),
      qcm("Elle mange ______ salade à midi.", ["du", "de la", "des", "de l'"], 1, "salade giống cái → de la."),
      qcm("Je ne mange pas ______ viande.", ["de la", "du", "de", "des"], 2, "Sau phủ định (ne… pas), du / de la / des đều thành DE."),
      qcm("Tu veux ______ eau ?", ["du", "de la", "de l'", "des"], 2, "Trước nguyên âm → de l'."),
      qcm("Il y a beaucoup ______ monde ici.", ["du", "de", "des", "de la"], 1, "Sau từ chỉ lượng (beaucoup, peu, trop, assez) luôn là DE."),
      qcm("Nous achetons ______ fruits au marché.", ["du", "de la", "des", "de"], 2, "fruits số nhiều → des."),
      qcm("Je voudrais un kilo ______ tomates.", ["des", "de", "du", "de la"], 1, "Sau đơn vị đo lường (un kilo, un litre, une bouteille) → de."),
      qcm("Il n'y a plus ______ pain.", ["du", "de", "des", "de la"], 1, "« ne… plus » cũng là phủ định → de."),
      qcm("Elle a ______ courage.", ["du", "de la", "des", "de"], 0, "Danh từ trừu tượng giống đực cũng dùng partitif: du courage."),
      qcm("J'aime ______ chocolat.", ["du", "le", "de", "un"], 1, "Sau aimer / adorer / détester dùng mạo từ XÁC ĐỊNH (le, la, les), không dùng partitif."),
    ] },
  { title: "Le futur proche et le passé récent", level: "A2", skills: ["Grammaire"],
    consigne: "Conjuguez le verbe entre parenthèses au présent pour former le futur proche (aller + infinitif) ou le passé récent (venir de + infinitif).",
    questions: [
      fill("Demain, nous ______ visiter le musée. (aller)", "allons", "Futur proche = aller ở hiện tại + infinitif: nous allons visiter."),
      fill("Attention, tu ______ tomber ! (aller)", "vas", "tu vas tomber: sắp ngã."),
      fill("Je ______ de finir mes devoirs. (venir)", "viens", "Passé récent = venir de + infinitif: je viens de finir (vừa mới xong)."),
      fill("Elle ______ d'arriver à la gare. (venir)", "vient", "elle vient d'arriver: cô ấy vừa đến."),
      fill("Ce soir, ils ______ regarder un film. (aller)", "vont", "ils vont regarder."),
      fill("Vous ______ partir en vacances bientôt ? (aller)", "allez", "vous allez partir."),
      fill("Nous ______ de manger, nous n'avons plus faim. (venir)", "venons", "nous venons de manger: chúng tôi vừa ăn xong."),
      fill("Le train ______ partir dans cinq minutes. (aller)", "va", "le train va partir."),
      fill("Ils ______ de téléphoner. (venir)", "viennent", "ils viennent de téléphoner — chú ý hai chữ n."),
      fill("Je ______ prendre une douche. (aller)", "vais", "je vais prendre."),
    ] },
  { title: "Les pronoms compléments d'objet direct", level: "A2", skills: ["Grammaire"],
    consigne: "Choisissez le pronom qui remplace le complément.",
    questions: [
      qcm("Tu connais Marie ? — Oui, je ______ connais.", ["le", "la", "les", "lui"], 1, "Marie: giống cái số ít, tân ngữ trực tiếp → la."),
      qcm("Vous regardez la télé ? — Non, nous ne ______ regardons pas.", ["le", "la", "l'", "les"], 1, "la télé → la; đại từ đứng TRƯỚC động từ, trong cặp ne… pas."),
      qcm("Il achète le journal ? — Oui, il ______ achète.", ["le", "l'", "la", "les"], 1, "le → l' trước nguyên âm (achète)."),
      qcm("Tu invites tes amis ? — Oui, je ______ invite.", ["les", "leur", "le", "lui"], 0, "inviter quelqu'un (trực tiếp) + số nhiều → les. « leur » là gián tiếp."),
      qcm("Elle aime ce film ? — Oui, elle ______ adore.", ["le", "l'", "la", "les"], 1, "ce film → le, thành l' trước adore."),
      qcm("Tu m'attends ? — Oui, je ______ attends.", ["m'", "t'", "l'", "vous"], 1, "Người hỏi là « me » thì người đáp gọi là « te » → je t'attends."),
      qcm("Vous prenez ces chaussures ? — Oui, je ______ prends.", ["la", "les", "le", "leur"], 1, "ces chaussures số nhiều → les."),
      qcm("Il a vu Paul hier ? — Oui, il ______ a vu.", ["le", "l'", "lui", "la"], 1, "Ở passé composé, đại từ đứng trước trợ động từ: il l'a vu."),
      qcm("Tu fais tes devoirs ? — Je ______ fais maintenant.", ["le", "les", "leur", "la"], 1, "tes devoirs số nhiều → les."),
      qcm("Vous nous écoutez ? — Oui, nous ______ écoutons.", ["nous", "vous", "les", "leur"], 1, "Người hỏi là « nous » thì người đáp gọi là « vous » → nous vous écoutons."),
    ] },

  /* ───────────── B2+ ───────────── */
  { title: "Le subjonctif passé", level: "B2+", skills: ["Grammaire"],
    consigne: "Choisissez la forme verbale qui convient.",
    questions: [
      qcm("Je regrette qu'il ______ hier sans dire au revoir.", ["parte", "soit parti", "est parti", "partait"], 1, "Cảm xúc + hành động ĐÃ XONG trước đó → subjonctif passé: qu'il soit parti."),
      qcm("Bien qu'elle ______ toute la nuit, elle n'est pas fatiguée.", ["a travaillé", "ait travaillé", "travaillait", "avait travaillé"], 1, "bien que + subjonctif; hành động đã hoàn thành → ait travaillé."),
      qcm("C'est le meilleur film que j'______ cette année.", ["ai vu", "aie vu", "voie", "avais vu"], 1, "Sau so sánh nhất (le meilleur… que) dùng subjonctif: que j'aie vu."),
      qcm("Je doute qu'ils ______ la vérité à l'époque.", ["ont su", "aient su", "savaient", "sauront"], 1, "douter que + subjonctif; sự việc trong quá khứ → aient su."),
      qcm("Il est possible qu'elle ______ son train.", ["a raté", "ait raté", "ratera", "ratait"], 1, "il est possible que + subjonctif → ait raté."),
      qcm("Nous sommes ravis que vous ______ venir hier soir.", ["avez pu", "ayez pu", "pouviez", "pourrez"], 1, "être ravi que + subjonctif passé: que vous ayez pu."),
      qcm("Je ne crois pas qu'il ______ avant nous.", ["est arrivé", "soit arrivé", "arrivera", "était arrivé"], 1, "ne pas croire que + subjonctif; arriver chia với être → soit arrivé."),
      qcm("Il est certain qu'elle ______ son examen.", ["ait réussi", "a réussi", "réussisse", "soit réussie"], 1, "« il est certain que » diễn đạt sự CHẮC CHẮN → indicatif: a réussi."),
      qcm("Elle est partie sans que personne ne s'en ______.", ["est aperçu", "soit aperçu", "apercevait", "a aperçu"], 1, "sans que + subjonctif; s'apercevoir chia với être → s'en soit aperçu."),
      qcm("Quoi qu'il ______ hier, je lui pardonne.", ["a dit", "ait dit", "disait", "dira"], 1, "quoi que (dù… gì đi nữa) + subjonctif → ait dit."),
    ] },
  { title: "La nominalisation", level: "B2+", skills: ["Vocabulaire", "Écriture"],
    consigne: "Écrivez le nom qui correspond au mot donné (sans l'article).",
    questions: [
      fill("augmenter → l'______ des prix", "augmentation", "Động từ -er thường cho danh từ -ation: augmenter → augmentation."),
      fill("fermer → la ______ de l'usine", "fermeture", "fermer → fermeture (hậu tố -ure)."),
      fill("construire → la ______ d'un pont", "construction", "construire → construction."),
      fill("licencier → le ______ de cent salariés", "licenciement", "Hậu tố -ment tạo danh từ giống đực: licenciement."),
      fill("arriver → l'______ du président", "arrivée", "arriver → arrivée (dạng phân từ giống cái dùng làm danh từ)."),
      fill("détruire → la ______ de la forêt", "destruction", "détruire → destruction (gốc đổi: détrui- → destruc-)."),
      fill("réduire → la ______ des dépenses", "réduction", "réduire → réduction."),
      fill("lent → la ______ des démarches", "lenteur", "Tính từ → danh từ -eur (giống cái): lenteur."),
      fill("pauvre → la ______ dans le monde", "pauvreté", "Tính từ → danh từ -té: pauvreté."),
      fill("échouer → l'______ des négociations", "échec", "échouer → échec: danh từ không theo hậu tố nào, phải thuộc."),
    ] },

  /* ───────────── C1 ─────────────
     Đã loại lúc soạn: « ______ riche qu'il soit » với cả « Si » lẫn « Aussi »
     trong phương án (cả hai đều đúng), và « après que + ? » (passé antérieur
     lẫn passé composé đều gặp trong văn bản chuẩn). */
  { title: "Concession et hypothèse : les tournures soutenues", level: "C1", skills: ["Grammaire"],
    consigne: "Choisissez la forme qui convient.",
    questions: [
      qcm("______ riche qu'il soit, il n'est pas heureux.", ["Bien", "Aussi", "Tant", "Malgré"], 1, "aussi + tính từ + que + subjonctif = dù… đến đâu: Aussi riche qu'il soit."),
      qcm("Quand bien même il ______, je ne changerais pas d'avis.", ["insiste", "insisterait", "insistera", "ait insisté"], 1, "quand bien même + CONDITIONNEL (không phải subjonctif): quand bien même il insisterait."),
      qcm("Il a beau ______, personne ne l'écoute.", ["crier", "crie", "criant", "qu'il crie"], 0, "avoir beau + INFINITIF = dù có… cũng vô ích."),
      qcm("Pour peu qu'on le ______, il se met en colère.", ["contredit", "contredise", "contredira", "contredisait"], 1, "pour peu que (chỉ cần… là) + subjonctif: qu'on le contredise."),
      qcm("Quoi que vous ______, il refusera.", ["dites", "disiez", "direz", "avez dit"], 1, "quoi que (viết rời) + subjonctif: quoi que vous disiez."),
      qcm("Quoiqu'il ______ malade, il est venu travailler.", ["est", "soit", "était", "sera"], 1, "quoique (viết liền = bien que) + subjonctif: quoiqu'il soit."),
      qcm("Si j'avais su, je ______ plus tôt.", ["viendrais", "serais venu", "venais", "suis venu"], 1, "si + plus-que-parfait → conditionnel PASSÉ: je serais venu."),
      qcm("À supposer qu'il ______ raison, que ferions-nous ?", ["a", "ait", "aura", "avait"], 1, "à supposer que + subjonctif: qu'il ait raison."),
      qcm("Où que tu ______, je te retrouverai.", ["vas", "ailles", "iras", "allais"], 1, "où que + subjonctif: où que tu ailles."),
      qcm("Encore faut-il qu'il ______ le temps.", ["a", "ait", "aura", "aurait"], 1, "encore faut-il que + subjonctif: qu'il ait le temps."),
    ] },
  { title: "Vocabulaire soutenu : comprendre les nuances", level: "C1", skills: ["Vocabulaire", "Lecture"],
    consigne: "Choisissez l'expression de sens équivalent, ou la construction correcte.",
    questions: [
      qcm("« Il a étayé son argumentation par des chiffres. » — étayer signifie :", ["affaiblir", "appuyer", "cacher", "résumer"], 1, "étayer = chống đỡ, củng cố (một lập luận) bằng dẫn chứng."),
      qcm("« Cette mesure est vouée à l'échec. » signifie qu'elle est :", ["destinée à échouer", "opposée à l'échec", "protégée de l'échec", "née d'un échec"], 0, "être voué à = chắc chắn sẽ đi đến (thường là điều xấu)."),
      qcm("« Il a fait preuve de désinvolture. » — la désinvolture, c'est :", ["le sérieux", "une légèreté excessive", "le courage", "la générosité"], 1, "désinvolture = thái độ quá thoải mái, thiếu nghiêm túc."),
      qcm("« Un argument fallacieux » est un argument :", ["solide", "trompeur", "nouveau", "discret"], 1, "fallacieux = nghe có lý nhưng sai, nhằm đánh lừa."),
      qcm("Quelle construction est correcte ?", ["pallier à un manque", "pallier un manque", "pallier d'un manque", "pallier sur un manque"], 1, "pallier là ngoại động từ TRỰC TIẾP: pallier un manque. « pallier à » là lỗi rất phổ biến."),
      qcm("« Nonobstant les critiques, il a poursuivi. » — nonobstant signifie :", ["grâce à", "malgré", "à cause de", "selon"], 1, "nonobstant = malgré, văn phong hành chính – pháp lý."),
      qcm("« Une situation inextricable » est une situation :", ["dont on ne peut se sortir", "facile à expliquer", "très récente", "sans importance"], 0, "inextricable = rối đến mức không gỡ ra được."),
      qcm("« Il s'est targué de son succès. » — se targuer de signifie :", ["avoir honte de", "se vanter de", "douter de", "se souvenir de"], 1, "se targuer de = tự hào khoe khoang về."),
      qcm("« Un constat sans appel » est un constat :", ["définitif", "provisoire", "anonyme", "silencieux"], 0, "sans appel (gốc từ toà án: không kháng cáo được) = dứt khoát, không bàn cãi."),
      qcm("« Il a éludé la question. » signifie qu'il l'a :", ["traitée franchement", "évitée habilement", "répétée", "posée"], 1, "éluder = khéo léo né tránh."),
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
