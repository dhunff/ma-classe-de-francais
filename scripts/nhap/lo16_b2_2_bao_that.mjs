/* Lô 16 (11/10): thay ngữ liệu tự viết của [NHÁP] DELF B2 · Đề 2 bằng BÀI BÁO
 * THẬT chủ dự án gửi (The Conversation, 20–21/08/2026), đúng như đề DELF: văn
 * bản rút gọn, giữ nguyên câu chữ gốc, ghi « D'après … ».
 *
 *   CE 1 (texte informatif, la France) : V. Ndior, « Loi sur l'interdiction des
 *        réseaux sociaux aux moins de 15 ans : où mène la censure du Conseil
 *        constitutionnel ? »
 *   CE 2 (texte argumentatif) : C. Buzy-Cazaux, « L'IA ne tue pas la créativité
 *        en agence, elle la transforme »
 *   PO  (document déclencheur) : R. Rozental, « Pourquoi la génération Z est
 *        tombée amoureuse de la photographie argentique »
 *
 * Chỉ CẮT đoạn, không viết lại câu; « […] » đánh dấu chỗ lược. Dấu gạch « – »
 * trong bản gốc đổi thành dấu phẩy (quy tắc 7 của dự án).
 *
 * Chạy: node scripts/nhap/lo16_b2_2_bao_that.mjs > lo16.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261111;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const vf = (prompt, dung, justification) => ({ id: id("q"), type: "vf", prompt, answer: dung ? 0 : 1, justification });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");

/* ───────────── CE 1 : texte informatif ───────────── */
const CE1 = { id: "nhapmv3lbczn015",
  title: "[NHÁP] Lecture B2 · Đề 2 · Exercice 1 : l'interdiction des réseaux sociaux aux moins de 15 ans",
  consigne: "<p><strong>Comprendre un texte informatif.</strong> Lisez le document puis répondez aux questions.</p>",
  readingText: p(
    "<strong>Loi sur l'interdiction des réseaux sociaux aux moins de 15 ans : où mène la censure du Conseil constitutionnel ?</strong>",
    "Par une décision du 14 août 2026, le Conseil constitutionnel a censuré l'article 1er de la loi qui devait interdire l'accès des mineurs de moins de 15 ans aux réseaux sociaux. Adoptée le 21 juillet dans le sillage du rapport d'une commission d'enquête ayant documenté les effets du réseau social TikTok sur les mineurs, saluée par le chef de l'État qui avait aussitôt convoqué des représentants de plateformes à l'Élysée, elle ne pourra finalement pas s'appliquer en septembre 2026.",
    "Le texte avait été déféré par deux saisines parallèles de l'opposition : La France insoumise (LFI) le 23 juillet et les socialistes le lendemain. Fait notable, aucune ne contestait l'objectif de la loi. Toutes deux reconnaissaient la nécessité de protéger les mineurs des risques suscités par les réseaux sociaux, mais dénonçaient le dispositif envisagé.",
    "Le premier [motif de censure] tient à ce que l'application de la loi engendrerait une atteinte disproportionnée à la liberté d'expression. En effet, l'interdiction est formulée en des termes généraux et frappe indistinctement tous les services visés (quels que soient leurs fonctionnalités, leurs contenus ou les risques qui leur sont associés, y compris ceux dont la dangerosité pour les mineurs n'est pas établie), et tous les mineurs, sans égard pour leur âge, leur maturité ou l'appréciation de leurs parents.",
    "Le second motif tient à la vie privée : interdire l'accès aux moins de 15 ans oblige tout un chacun, adultes compris, à prouver son âge avant de pouvoir se connecter. Or, en s'abstenant de fixer les conditions et les limites de cette vérification généralisée, le législateur n'a prévu aucune des garanties légales qu'exige la protection de la vie privée.",
    "[…] Avant même la censure, la Commission européenne avait rendu, le 6 juillet 2026, un avis circonstancié : sans contester le principe d'un âge minimal, elle jugeait que la loi empiétait sur le cadre de coopération harmonisé du DSA*. Le législateur s'est donc exécuté : il a expurgé le texte des obligations qui pesaient sur les plateformes. À l'issue de ce toilettage, la loi se contentait d'interdire l'accès, sans organiser la moindre vérification ni prévoir de garanties. Ce qui rendait la loi compatible avec le droit de l'UE est donc précisément ce qui l'a rendue contraire à la Constitution : elle ne pouvait satisfaire les deux à la fois.",
    "[…] La piste la plus solide n'est donc pas d'exclure les mineurs en bloc, mais de neutraliser les fonctionnalités toxiques pour tous les utilisateurs et d'en moduler l'accès selon l'âge. […] Encore faut-il que les plateformes jouent le jeu, ce dont on peut douter. […] Confier la protection des plus vulnérables à ceux dont le modèle économique repose sur l'attention captée ne saurait suffire.",
    "La France n'est pas seule à (tenter de) légiférer en la matière. L'Australie a instauré, depuis décembre 2025, une interdiction visant les utilisateurs de moins de 16 ans. Ainsi, 4,7 millions de comptes ont été restreints, mais des contournements massifs rappellent que la fermeture de comptes ne traite pas les problèmes de fond.",
    "[…] En rappelant qu'un État seul ne peut ni définir les réseaux sociaux ni organiser la vérification d'âge sans heurter le droit européen, [la décision du Conseil constitutionnel] conforte, en creux, ceux qui plaident pour une réponse européenne. La question n'est plus de savoir s'il faut protéger les enfants en ligne (le consensus existe), mais de quelle manière et avec quelle effectivité.",
    "<em>D'après Valère Ndior, professeur de droit public, The Conversation, 20 août 2026.</em>",
    "<small>* DSA : règlement européen sur les services numériques.</small>",
  ),
  cau: [
    qcm("Ce texte a pour thème…", "la censure par le Conseil constitutionnel d'une loi sur l'accès des mineurs aux réseaux sociaux", ["les effets de TikTok sur la santé mentale des adolescents", "l'adoption d'un règlement européen sur les services numériques"], "Dès la première phrase : « le Conseil constitutionnel a censuré l'article 1er de la loi qui devait interdire l'accès des mineurs de moins de 15 ans aux réseaux sociaux »."),
    vf("Les partis d'opposition qui ont saisi le Conseil constitutionnel contestaient l'objectif de la loi.", false, "« Fait notable, aucune ne contestait l'objectif de la loi. »"),
    qcm("Selon le Conseil constitutionnel, la loi portait atteinte à la liberté d'expression parce qu'elle…", "s'appliquait de la même façon à tous les services et à tous les mineurs", ["visait uniquement les réseaux sociaux les plus dangereux", "laissait aux parents le choix d'autoriser ou non l'accès"], "« l'interdiction… frappe indistinctement tous les services visés… et tous les mineurs, sans égard pour leur âge, leur maturité ou l'appréciation de leurs parents »."),
    qcm("Le second motif de censure concerne la vie privée, car la loi…", "obligeait aussi les adultes à prouver leur âge, sans garanties légales", ["permettait aux plateformes de vendre les données des mineurs", "interdisait aux parents de surveiller leurs enfants"], "« oblige tout un chacun, adultes compris, à prouver son âge… le législateur n'a prévu aucune des garanties légales »."),
    vf("La Commission européenne s'opposait au principe d'un âge minimal pour accéder aux réseaux sociaux.", false, "« sans contester le principe d'un âge minimal, elle jugeait que la loi empiétait sur le cadre de coopération harmonisé du DSA »"),
    qcm("Quel paradoxe l'auteur met-il en évidence ?", "Les modifications faites pour respecter le droit européen ont rendu la loi contraire à la Constitution.", ["La loi a été votée par l'opposition mais refusée par le gouvernement.", "Le Conseil constitutionnel a approuvé la loi que la Commission avait rejetée."], "« Ce qui rendait la loi compatible avec le droit de l'UE est donc précisément ce qui l'a rendue contraire à la Constitution »."),
    qcm("Selon l'auteur, la solution la plus solide consisterait à…", "neutraliser les fonctionnalités toxiques et adapter l'accès selon l'âge", ["interdire tous les réseaux sociaux aux mineurs", "confier aux plateformes le soin de protéger les mineurs"], "« La piste la plus solide n'est donc pas d'exclure les mineurs en bloc, mais de neutraliser les fonctionnalités toxiques… et d'en moduler l'accès selon l'âge »."),
    qcm("Que pense l'auteur de la bonne volonté des plateformes ?", "Il en doute, car leur modèle économique repose sur l'attention des utilisateurs.", ["Il leur fait entièrement confiance.", "Il pense qu'elles sont déjà soumises à des règles suffisantes."], "« Encore faut-il que les plateformes jouent le jeu, ce dont on peut douter »."),
    vf("En Australie, l'interdiction a permis de résoudre les problèmes de fond.", false, "« des contournements massifs rappellent que la fermeture de comptes ne traite pas les problèmes de fond »"),
    qcm("D'après la conclusion, sur quoi porte désormais le débat ?", "sur les moyens efficaces de protéger les enfants en ligne", ["sur la nécessité ou non de protéger les enfants", "sur le choix de l'âge minimal en Europe"], "« La question n'est plus de savoir s'il faut protéger les enfants en ligne (le consensus existe), mais de quelle manière et avec quelle effectivité »."),
  ] };

/* ───────────── CE 2 : texte argumentatif ───────────── */
const CE2 = { id: "nhapmv3lbczo016",
  title: "[NHÁP] Lecture B2 · Đề 2 · Exercice 2 : l'IA et la créativité",
  consigne: "<p><strong>Comprendre un texte argumentatif.</strong> Lisez le document puis répondez aux questions.</p>",
  readingText: p(
    "<strong>L'IA ne tue pas la créativité en agence, elle la transforme</strong>",
    "En 2018, Shantanu Narayen, PDG d'Adobe de l'époque, décrivait l'intelligence artificielle (IA) comme un « assistant créatif » destiné à prendre en charge les tâches « fastidieuses » pour « libérer » le professionnel. L'IA ne remplacerait pas l'intelligence humaine, assurait-il ; elle aiderait simplement à « faire ce qu'on aime, mieux et plus vite ». Ce récit de l'IA subordonnée au créateur humain n'aura pas survécu à l'irruption des grands modèles de langage. Avec ChatGPT ou Copilot, l'IA n'exécute plus seulement des tâches répétitives : elle génère des concepts, esquisse des directions artistiques, rédige des stratégies, avec toujours plus de pertinence et de fiabilité.",
    "[…] L'IA radicalise ce mouvement, en banalisant la génération d'idées surprenantes et, par là même, fait de l'émission d'idées extraordinaires une activité ordinaire.",
    "Aujourd'hui, deux récits dominent le débat public : celui d'une créativité phagocytée* par l'IA, celui d'une créativité « boostée » par la machine. L'un comme l'autre traite la créativité comme un objet stable, qu'on pourrait détruire ou amplifier. […] En entrant dans le processus créatif, l'IA en transforme les conditions d'exercice. Deux compétences apparaissent alors centrales : le discernement et l'intuition.",
    "Le discernement ne se réduit pas à juger si une proposition de l'IA est « bonne » ou « mauvaise ». Il engage la capacité à interroger les critères mêmes du jugement. À la question « qu'est-ce qui fait une expérience de marque réussie ? », un outil comme Copilot répond par une liste de critères dont la « fluidité ». Or, cette grille n'est pas neutre. Si la marque veut générer de la surprise, la « friction » pourrait être plus pertinente que la « fluidité ». Déranger, faire réagir, créer du décalage : voilà des stratégies créatives que l'IA ne proposera pas, parce qu'elle reflète pour le moment le consensus sédimenté dans ses données d'entraînement.",
    "Ce discernement n'est pas inné. Dans leur ouvrage <em>Mind Over Machine</em> (1986), les philosophes Hubert et Stuart Dreyfus montraient que le passage de « compétent » à « expert » se caractérise par l'abandon des règles explicites au profit d'un jugement situationnel. Le novice suit les règles ; l'expert sait quand les transgresser.",
    "[…] Le directeur artistique qui perçoit qu'une image « fonctionne » sans savoir dire précisément pourquoi ; le consultant qui pressent qu'un annonceur n'adhérera pas à une proposition en apparence adaptée : tous mobilisent un savoir incorporé, sédimenté par l'expérience, qui échappe à la formalisation algorithmique. Ni mystique ni irrationnel, ce savoir est le produit d'années de pratique, de succès et d'échecs. […] Tandis que l'IA, par construction, tend vers le probable, l'intuition humaine peut tendre vers l'improbable. C'est peut-être là que se loge la créativité la plus féconde.",
    "[…] L'humain qui travaille avec l'IA n'est pas le même après qu'avant. Il a été affecté par les propositions de la machine, il y a répondu, et cette réponse a modifié la suite de l'échange. Ainsi, il s'agit moins de remplacement ou d'augmentation que d'altération mutuelle. Le travail créatif en contexte d'IA n'est ni diminué ni amplifié : il est déplacé. […] L'enjeu n'est donc pas seulement de « maîtriser l'IA » au sens technique. Il est de cultiver les compétences qui permettent d'en faire quelque chose : poser les bonnes questions plutôt qu'obtenir les bonnes réponses.",
    "<em>D'après Cécile Buzy-Cazaux, chercheuse au laboratoire CIMEOS, Université Bourgogne Europe, The Conversation, 21 août 2026.</em>",
    "<small>* phagocytée : absorbée, détruite.</small>",
  ),
  cau: [
    qcm("Quelle est la thèse défendue par l'auteure ?", "L'IA ne fait pas disparaître la créativité mais en change les conditions.", ["L'IA va bientôt remplacer les professionnels de la création.", "L'IA reste un simple assistant chargé des tâches répétitives."], "Le titre et la conclusion : « Le travail créatif en contexte d'IA n'est ni diminué ni amplifié : il est déplacé »."),
    vf("En 2018, le PDG d'Adobe présentait l'IA comme un futur remplaçant de l'intelligence humaine.", false, "« L'IA ne remplacerait pas l'intelligence humaine, assurait-il »"),
    qcm("Avec les grands modèles de langage, l'IA…", "produit aussi des concepts et des stratégies", ["se limite toujours aux tâches fastidieuses", "est devenue moins fiable qu'auparavant"], "« elle génère des concepts, esquisse des directions artistiques, rédige des stratégies »."),
    qcm("Que signifie « fait de l'émission d'idées extraordinaires une activité ordinaire » ?", "Produire des idées surprenantes est devenu banal grâce à l'IA.", ["Les idées extraordinaires sont devenues rares.", "Seuls les créatifs peuvent encore avoir des idées."], "L'IA « banalise la génération d'idées surprenantes »."),
    qcm("Selon l'auteure, les deux récits qui dominent le débat public ont en commun de…", "considérer la créativité comme une chose stable", ["refuser l'utilisation de l'IA en agence", "défendre l'intuition contre la machine"], "« L'un comme l'autre traite la créativité comme un objet stable, qu'on pourrait détruire ou amplifier »."),
    vf("Pour l'auteure, les critères proposés par Copilot pour juger une expérience de marque sont neutres.", false, "« Or, cette grille n'est pas neutre. »"),
    qcm("Pourquoi l'IA ne proposera-t-elle pas de « déranger » ou de « créer du décalage » ?", "parce qu'elle reproduit le consensus présent dans ses données", ["parce que ces stratégies sont interdites aux marques", "parce que les clients ne les demandent jamais"], "« parce qu'elle reflète pour le moment le consensus sédimenté dans ses données d'entraînement »."),
    qcm("D'après Hubert et Stuart Dreyfus, l'expert se distingue du novice parce qu'il…", "sait quand il faut transgresser les règles", ["applique les règles avec plus de rigueur", "a lu davantage d'ouvrages théoriques"], "« Le novice suit les règles ; l'expert sait quand les transgresser »."),
    qcm("Selon l'auteure, en quoi l'intuition humaine se distingue-t-elle de l'IA ?", "Elle peut tendre vers l'improbable, alors que l'IA tend vers le probable.", ["Elle est plus rapide que le calcul de la machine.", "Elle repose sur des règles explicites et mesurables."], "« Tandis que l'IA, par construction, tend vers le probable, l'intuition humaine peut tendre vers l'improbable »."),
    qcm("L'expression « altération mutuelle » signifie que…", "l'humain et l'IA se transforment l'un l'autre au fil de l'échange", ["l'IA détériore le travail des créatifs", "l'humain finit toujours par imposer ses idées"], "« L'humain qui travaille avec l'IA n'est pas le même après qu'avant… cette réponse a modifié la suite de l'échange »."),
  ] };

/* ───────────── PO : document déclencheur ───────────── */
const PO = { id: "nhapmv3lbczp018",
  title: "[NHÁP] Production orale B2 · Đề 2 : la génération Z et la photographie argentique",
  consigne: "<p><strong>Production orale : 20 minutes environ, 30 minutes de préparation.</strong></p><p>Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes. Ensuite, vous défendez votre point de vue au cours d'un débat avec l'examinateur.</p><blockquote><p><strong>Pourquoi la génération Z est tombée amoureuse de la photographie argentique</strong></p><p>Après les vinyles, les cassettes VHS, les vidéoclubs et la profession de disquaire, la génération Z, née entre 1995 et 2010, ressuscite la photographie argentique. Derrière cette fascination pour certains objets ou supports se dessine une même aspiration : retrouver des expériences plus réfléchies, plus tangibles et plus collectives. […] Ces pratiques traduisent une volonté de résister à une culture numérique conçue pour susciter l'envie, récompenser l'indignation et favoriser les insultes comme l'humiliation.</p><p><em>D'après Rotem Rozental, University of Southern California, The Conversation, 20 août 2026.</em></p></blockquote>" };

const TU = {
  [CE1.id]: {
    vocabulaire: "• le Conseil constitutionnel (nom masculin) : Hội đồng Hiến pháp\n• censurer (verbe) : bác bỏ (một điều luật vì trái Hiến pháp)\n• un mineur (nom masculin) : trẻ vị thành niên\n• dans le sillage de (locution) : tiếp theo, theo sau\n• une saisine (nom féminin) : việc đề nghị cơ quan xem xét\n• déférer (verbe) : chuyển lên (cơ quan có thẩm quyền)\n• le dispositif (nom masculin) : cơ chế, biện pháp\n• une atteinte (nom féminin) : sự xâm phạm\n• indistinctement (adverbe) : không phân biệt\n• le législateur (nom masculin) : nhà làm luật\n• un avis circonstancié (nom masculin) : ý kiến chi tiết, có lập luận\n• empiéter sur (verbe) : lấn sang\n• expurger (verbe) : lược bỏ\n• moduler (verbe) : điều chỉnh\n• un contournement (nom masculin) : sự lách luật\n• en creux (locution) : một cách gián tiếp",
    explications: "• Đây là văn bản thông tin về một sự kiện ở Pháp, đúng dạng bài 1 phần Đọc DELF B2. Đọc tiêu đề và câu đầu mỗi đoạn để lập bản đồ: quyết định ngày 14/8, ai đã đề nghị xem xét, hai lý do bác bỏ, vai trò của luật châu Âu, giải pháp đề xuất, ví dụ Úc, kết luận.\n• Văn bản pháp lý dùng nhiều từ trừu tượng. Không cần hiểu từng từ: tìm cặp « le premier motif / le second motif » để biết hai lý do, và từ nối « Or » (thế mà) báo hiệu điểm yếu của luật.\n• Câu Vrai/Faux kiểu DELF: phải chọn đúng VÀ chép đúng câu chứng minh. Bẫy thường gặp là câu gần đúng nhưng ngược nghĩa: phe đối lập KHÔNG phản đối mục tiêu, Ủy ban châu Âu KHÔNG phản đối độ tuổi tối thiểu.\n• Câu hỏi về « paradoxe » (nghịch lý) dựa vào câu « Ce qui rendait la loi compatible avec le droit de l'UE est donc précisément ce qui l'a rendue contraire à la Constitution ». Cấu trúc « ce qui… c'est précisément ce qui… » đặt hai ý đối lập cạnh nhau.\n• Câu kết « La question n'est plus de savoir si…, mais de quelle manière… » cho thấy tác giả chuyển trọng tâm từ « có nên không » sang « làm thế nào »."
  },
  [CE2.id]: {
    vocabulaire: "• une agence (nom féminin) : công ty quảng cáo, truyền thông\n• fastidieux (adjectif) : tẻ nhạt, nhàm chán\n• subordonné à (adjectif) : phụ thuộc vào\n• l'irruption (nom féminin) : sự xuất hiện đột ngột\n• un grand modèle de langage (nom masculin) : mô hình ngôn ngữ lớn\n• esquisser (verbe) : phác thảo\n• banaliser (verbe) : làm trở nên tầm thường\n• phagocyter (verbe) : nuốt chửng, hấp thụ\n• le discernement (nom masculin) : khả năng phân định, óc phán đoán\n• une grille (nom féminin) : bộ tiêu chí\n• le décalage (nom masculin) : sự lệch, khác thường\n• sédimenté (adjectif) : tích tụ lâu ngày\n• transgresser (verbe) : vượt qua, phá (quy tắc)\n• incorporé (adjectif) : thấm vào, nằm trong cơ thể\n• fécond (adjectif) : phong phú, sinh ra nhiều kết quả",
    explications: "• Đây là văn bản nghị luận. Luận đề nằm ngay ở tiêu đề: « L'IA ne tue pas la créativité…, elle la transforme ». Cấu trúc « ne… pas X, mais Y » lặp lại nhiều lần trong bài (« moins de remplacement… que d'altération mutuelle », « ni diminué ni amplifié : il est déplacé »).\n• Tác giả mở bài bằng một quan điểm cũ (PDG Adobe năm 2018) rồi cho thấy nó đã lỗi thời: « Ce récit… n'aura pas survécu ». Đây là kỹ thuật bác bỏ quen thuộc của bài nghị luận.\n• Đoạn « deux récits » trình bày hai quan điểm đối lập (IA tiêu diệt / IA thúc đẩy sáng tạo) rồi chỉ ra điểm chung của chúng để vượt qua cả hai. Câu hỏi 5 kiểm tra đúng ý này.\n• Hai khái niệm then chốt: « discernement » (đặt câu hỏi về chính các tiêu chí) và « intuition » (hướng về điều không chắc chắn). Học thuộc các cặp đối lập: novice / expert, probable / improbable, fluidité / friction.\n• Giọng văn nghị luận học thuật: có lập trường rõ nhưng sắc thái, dựa vào tác giả khác (Dreyfus) để làm bằng chứng."
  },
  [PO.id]: {
    vocabulaire: "• la photographie argentique (nom féminin) : chụp ảnh phim\n• une pellicule (nom féminin) : cuộn phim\n• la génération Z (nom féminin) : thế hệ Z\n• ressusciter (verbe) : làm sống lại\n• un disquaire (nom masculin) : người bán đĩa nhạc\n• une aspiration (nom féminin) : khát vọng\n• tangible (adjectif) : chạm vào được, cụ thể\n• l'indignation (nom féminin) : sự phẫn nộ\n• un algorithme (nom masculin) : thuật toán\n• tourner le dos à (expression) : quay lưng lại với",
    explications: "• Nêu vấn đề dưới dạng câu hỏi, ví dụ: « Le retour des objets analogiques chez les jeunes est-il une simple mode nostalgique ou un véritable rejet de la culture numérique ? ».\n• Gợi ý luận điểm: nhu cầu trải nghiệm chậm và có chủ đích; sức khỏe tinh thần và mạng xã hội; giá trị của đồ vật vật chất và kỷ niệm; giới hạn (giá phim đắt, hóa chất, hiệu ứng thời trang do chính mạng xã hội lan truyền).\n• Đưa ví dụ cá nhân (album ảnh gia đình, đĩa than, máy ảnh dùng một lần) để bài nói sinh động.\n• Khi tranh luận, giám khảo có thể phản bác rằng đây chỉ là trào lưu. Nhượng bộ một phần (« Il est vrai que… ») rồi bảo vệ ý chính (« Cependant… »).\n• Phần này không được chấm điểm trong ứng dụng; hãy ghi âm để tự nghe lại."
  },
};

/* ───────────── SQL ─────────────
 * Bài nháp chưa có lượt làm nào (đã đếm attempts = 0) nên thay câu hỏi bằng
 * xoá rồi chèn. Không dùng saveExercise vì chạy ngoài trình duyệt. */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
for (const b of [CE1, CE2]) {
  const { qRows } = toRows({ id: b.id, title: b.title, level: "B2", skills: ["Lecture"], questions: b.cau }, "assignment");
  ra.push(`update public.exercises set title = ${q(b.title)}, consigne = ${q(b.consigne)}, reading_text = ${q(b.readingText)}, meta = meta || ${j(TU[b.id])} where id = ${q(b.id)};`);
  ra.push(`delete from public.questions where exercise_id = ${q(b.id)};`);
  ra.push(`insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) values ${qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ")};`);
}
ra.push(`update public.exercises set title = ${q(PO.title)}, consigne = ${q(PO.consigne)}, meta = meta || ${j(TU[PO.id])} where id = ${q(PO.id)};`);
const out = ra.join("\n");
if (out.includes("—") || out.includes(" – ")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);
