/* Lô 17 (13/10): BỐC THĂM đề nói + THỜI GIAN CHUẨN BỊ, như phòng thi thật.
 *
 * Mỗi bài PO mang `meta.bocTham = { chuanBi: phút, phan: [{ ten, cachLam, soRut, sujets }] }`.
 *   soRut = 1 : bốc một thẻ (A1)          soRut = 2 : bốc hai, chọn một (A2 → C1)
 * Phần không chuẩn bị (entretien dirigé) giữ trong `consigne`.
 * Thời gian chuẩn bị theo thể lệ France Éducation international:
 *   A1, A2, B1 : 10 phút · B2 : 30 phút · C1 : 60 phút.
 *
 * Đề do FRACILE soạn: tình huống và câu hỏi gợi ý, KHÔNG có số liệu hay nguồn bịa.
 * Riêng B2 · Đề 2 giữ đoạn trích The Conversation thật làm một trong các tài liệu.
 * Chạy: node scripts/nhap/lo17_boc_tham_noi.mjs > lo17.sql */

const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const S = (ma, ...ds) => ({ ma, html: p(...ds) });

const DE = {
  /* ── A1 · Đề 1 ── */
  nhapmuxp0mxk01u: {
    consigne: p("<strong>Production orale : 5 à 7 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.",
      "<strong>1. Entretien dirigé</strong> (environ 1 minute, sans préparation) : présentez-vous. Votre nom, votre âge, votre pays, votre famille, vos goûts.",
      "Pour les parties 2 et 3, vous tirez au sort une carte pour chaque partie."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Échange d'informations (environ 2 minutes)", cachLam: "Posez des questions à l'examinateur à partir des mots de la carte.", soRut: 1, sujets: [
        S("A", "habiter • travail • sport • week-end • musique • animal"),
        S("B", "famille • cuisine • vacances • transport • film • anniversaire"),
        S("C", "école • langue • ville • matin • couleur • ami"),
        S("D", "maison • voyage • télévision • fruit • frère • lundi"),
      ] },
      { ten: "3. Dialogue simulé (environ 2 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 1, sujets: [
        S("1", "<strong>À la boulangerie.</strong> Vous achetez du pain et des gâteaux pour un repas de famille. Vous demandez les prix et vous payez."),
        S("2", "<strong>Au marché.</strong> Vous achetez des fruits et des légumes pour une semaine. Vous demandez les prix et vous payez."),
        S("3", "<strong>À la gare.</strong> Vous achetez un billet de train pour Lyon. Vous demandez l'heure du départ et le prix."),
        S("4", "<strong>Au café.</strong> Vous commandez une boisson et un sandwich pour vous et un ami. Vous demandez l'addition."),
      ] },
    ] },
  },
  /* ── A2 · Đề 1 ── */
  nhapmuqwmabz00o: {
    consigne: p("<strong>Production orale : 6 à 8 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.",
      "<strong>1. Entretien dirigé</strong> (environ 1 minute 30, sans préparation) : présentez-vous. Votre nom, votre âge, votre famille, vos études ou votre travail, vos loisirs.",
      "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Monologue suivi (environ 2 minutes)", cachLam: "Parlez du sujet choisi.", soRut: 2, sujets: [
        S("1", "Parlez d'une journée typique : à quelle heure vous vous levez, ce que vous faites le matin, l'après-midi, le soir. Qu'est-ce que vous préférez dans la journée ? Pourquoi ?"),
        S("2", "Présentez votre ville ou votre quartier. Qu'est-ce qu'on peut y faire ? Qu'est-ce que vous aimez ou n'aimez pas ?"),
        S("3", "Parlez de votre meilleur ami ou de votre meilleure amie. Comment vous êtes-vous rencontrés ? Que faites-vous ensemble ?"),
        S("4", "Racontez vos dernières vacances. Où êtes-vous allé(e) ? Avec qui ? Qu'est-ce que vous avez fait ?"),
      ] },
      { ten: "3. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Vous êtes dans une boutique de vêtements. Vous voulez acheter un cadeau pour un ami. Vous demandez des conseils, le prix, les tailles et les couleurs, puis vous payez."),
        S("2", "Vous êtes à l'office de tourisme. Vous demandez des informations sur les visites, les horaires et les prix, puis vous réservez une activité."),
        S("3", "Vous voulez louer un vélo pour le week-end. Vous demandez les prix, les horaires et les conditions, puis vous louez un vélo."),
        S("4", "Vous organisez une fête d'anniversaire avec un ami français. Vous discutez de la date, du lieu, des invités et de la nourriture."),
      ] },
    ] },
  },
  /* ── A2 · Đề 2 ── */
  nhapmuxpiez801u: {
    consigne: p("<strong>Production orale : 6 à 8 minutes.</strong> 10 minutes de préparation pour les parties 2 et 3.",
      "<strong>1. Entretien dirigé</strong> (environ 1 minute 30, sans préparation) : vous parlez de vous, de votre famille, de vos activités, de vos goûts.",
      "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Monologue suivi (environ 2 minutes)", cachLam: "Parlez du sujet choisi.", soRut: 2, sujets: [
        S("1", "Parlez de votre fête préférée. Comment la célébrez-vous ? Avec qui ?"),
        S("2", "Décrivez un voyage qui vous a plu. Pourquoi est-ce un bon souvenir ?"),
        S("3", "Parlez de votre plat préféré. Qui le prépare ? Quand le mangez-vous ?"),
        S("4", "Présentez une personne de votre famille que vous admirez. Pourquoi ?"),
      ] },
      { ten: "3. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne.", soRut: 2, sujets: [
        S("1", "Vous voulez vous inscrire dans une salle de sport. Vous posez des questions sur les horaires, les prix et les activités, puis vous choisissez une formule."),
        S("2", "Vous êtes à la pharmacie. Vous avez mal à la gorge depuis deux jours. Vous expliquez votre problème et vous demandez des conseils."),
        S("3", "Vous cherchez une chambre à louer pour un mois. Vous téléphonez au propriétaire : prix, quartier, équipements, date d'arrivée."),
        S("4", "Vous voulez inscrire votre enfant à un cours de musique. Vous demandez les jours, les horaires, le prix et le matériel nécessaire."),
      ] },
    ] },
  },
  /* ── B1 (dùng chung cho Đề 1 và Đề 2) ── */
  po_b1_demo_travail: {
    consigne: p("<strong>Production orale : 15 minutes environ.</strong> 10 minutes de préparation pour la partie 3.",
      "<strong>1. Entretien dirigé</strong> (2 à 3 minutes, sans préparation) : parlez de vous, de votre travail ou de vos études, de vos activités du week-end.",
      "Pour les parties 2 et 3, vous tirez au sort deux sujets et vous en choisissez un."),
    bocTham: { chuanBi: 10, phan: [
      { ten: "2. Exercice en interaction (3 à 4 minutes)", cachLam: "Jouez la situation. L'examinateur joue l'autre personne et n'est pas d'accord avec vous.", soRut: 2, sujets: [
        S("1", "Votre entreprise propose la semaine de quatre jours, mais avec des journées plus longues. Vous en discutez avec un collègue qui n'est pas d'accord. Présentez vos arguments et répondez aux siens."),
        S("2", "Votre colocataire veut adopter un chien. Vous pensez que l'appartement est trop petit. Vous en discutez et vous essayez de trouver une solution."),
        S("3", "Un ami veut arrêter ses études pour voyager pendant un an. Vous n'êtes pas sûr(e) que ce soit une bonne idée. Vous en discutez avec lui."),
        S("4", "Vous voulez organiser les vacances en famille à la montagne, mais votre frère préfère la mer. Vous discutez pour vous mettre d'accord."),
      ] },
      { ten: "3. Expression d'un point de vue (5 à 7 minutes)", cachLam: "Dégagez le thème du titre, puis présentez votre opinion sous la forme d'un exposé personnel de trois minutes environ. L'examinateur vous pose ensuite quelques questions.", soRut: 2, sujets: [
        S("1", "« Les jeunes d'aujourd'hui veulent travailler moins pour vivre mieux. »"),
        S("2", "« Faut-il interdire le téléphone portable au collège et au lycée ? »"),
        S("3", "« Acheter d'occasion : une mode ou une nécessité ? »"),
        S("4", "« Vivre à la campagne plutôt qu'en ville : un rêve de plus en plus partagé. »"),
      ] },
    ] },
  },
  /* ── B2 · Đề 1 ── */
  nhapmur616oz002: {
    consigne: p("<strong>Production orale : 20 minutes environ.</strong> 30 minutes de préparation.",
      "Vous tirez au sort deux documents et vous en choisissez un. Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes (introduction, deux ou trois arguments avec des exemples, conclusion). Ensuite, vous défendez votre point de vue au cours d'un débat de 10 à 13 minutes avec l'examinateur."),
    bocTham: { chuanBi: 30, phan: [
      { ten: "Monologue suivi puis exercice en interaction", cachLam: "Choisissez un document.", soRut: 2, sujets: [
        S("1", "<strong>La publicité destinée aux enfants</strong>", "Les enfants voient de nombreuses publicités, à la télévision mais surtout sur les plateformes de vidéos et les jeux en ligne. Des associations demandent d'interdire la publicité pour les produits trop sucrés pendant les programmes jeunesse. Les annonceurs répondent qu'il revient aux parents d'éduquer leurs enfants."),
        S("2", "<strong>Le télétravail, un acquis à généraliser ?</strong>", "Pour certains salariés, travailler à la maison permet de gagner du temps et de mieux concilier vie professionnelle et vie privée. D'autres regrettent la perte de contact avec leurs collègues et la difficulté à séparer travail et repos."),
        S("3", "<strong>Faut-il rendre le service civique obligatoire ?</strong>", "Certains proposent que chaque jeune consacre plusieurs mois à une mission d'intérêt général : aide aux personnes âgées, environnement, éducation. Pour ses défenseurs, c'est une école de la citoyenneté ; pour ses opposants, un engagement imposé perd tout son sens."),
        S("4", "<strong>Voyager moins pour protéger la planète ?</strong>", "Le tourisme lointain est de plus en plus critiqué pour son impact sur le climat. Certains choisissent de voyager près de chez eux ou en train. D'autres estiment que découvrir le monde reste essentiel pour s'ouvrir aux autres cultures."),
      ] },
    ] },
  },
  /* ── B2 · Đề 2 ── */
  nhapmv3lbczp018: {
    consigne: p("<strong>Production orale : 20 minutes environ.</strong> 30 minutes de préparation.",
      "Vous tirez au sort deux documents et vous en choisissez un. Vous dégagez le problème soulevé par ce document, puis vous présentez votre opinion sous la forme d'un exposé argumenté de 5 à 7 minutes. Ensuite, vous défendez votre point de vue au cours d'un débat avec l'examinateur."),
    bocTham: { chuanBi: 30, phan: [
      { ten: "Monologue suivi puis exercice en interaction", cachLam: "Choisissez un document.", soRut: 2, sujets: [
        S("1", "<strong>Pourquoi la génération Z est tombée amoureuse de la photographie argentique</strong>", "Après les vinyles, les cassettes VHS, les vidéoclubs et la profession de disquaire, la génération Z, née entre 1995 et 2010, ressuscite la photographie argentique. Derrière cette fascination pour certains objets ou supports se dessine une même aspiration : retrouver des expériences plus réfléchies, plus tangibles et plus collectives. […] Ces pratiques traduisent une volonté de résister à une culture numérique conçue pour susciter l'envie, récompenser l'indignation et favoriser les insultes comme l'humiliation.", "<em>D'après Rotem Rozental, The Conversation, 20 août 2026.</em>"),
        S("2", "<strong>Les réseaux sociaux interdits aux moins de 15 ans ?</strong>", "Plusieurs pays veulent interdire l'accès des plus jeunes aux réseaux sociaux pour les protéger. Mais une interdiction générale est-elle efficace ? Certains préfèrent éduquer les adolescents et obliger les plateformes à supprimer les fonctionnalités les plus dangereuses."),
        S("3", "<strong>L'intelligence artificielle à l'école</strong>", "Des élèves utilisent l'intelligence artificielle pour faire leurs devoirs. Certains enseignants veulent l'interdire, d'autres préfèrent apprendre aux élèves à s'en servir de façon critique."),
        S("4", "<strong>La semaine de quatre jours</strong>", "Des entreprises proposent à leurs salariés de travailler quatre jours par semaine. Pour certains, c'est un progrès pour la santé et la motivation ; pour d'autres, des journées plus longues risquent d'augmenter la fatigue."),
      ] },
    ] },
  },
  /* ── C1 · Đề 1 ── */
  nhapmuqwmabz00r: {
    consigne: p("<strong>Production orale : 30 minutes environ.</strong> 60 minutes de préparation.",
      "Vous tirez au sort deux thèmes et vous en choisissez un. À partir du thème et des pistes proposées, vous préparez un <strong>exposé</strong> structuré (8 à 10 minutes) : introduction avec une problématique, plan en deux ou trois parties, conclusion. Vous ne devez pas vous limiter à un résumé : votre exposé doit présenter une réflexion personnelle illustrée d'exemples.",
      "Puis vous participez à un <strong>entretien</strong> (15 à 20 minutes) : le jury vous interroge pour vous amener à préciser, nuancer ou défendre votre position."),
    bocTham: { chuanBi: 60, phan: [
      { ten: "Exposé puis entretien avec le jury", cachLam: "Choisissez un thème.", soRut: 2, sujets: [
        S("1", "<strong>La ville à l'heure du télétravail</strong>", "Pistes : faut-il limiter le télétravail ? Les bureaux vides doivent-ils devenir des logements ? Comment réduire l'écart entre les métiers « télétravaillables » et les autres ? (Vous pouvez vous appuyer sur le texte de l'épreuve de lecture.)"),
        S("2", "<strong>La créativité à l'épreuve de l'intelligence artificielle</strong>", "Pistes : l'IA menace-t-elle les métiers créatifs ? Une œuvre produite avec une IA a-t-elle la même valeur ? Comment former les jeunes à une utilisation critique de ces outils ?"),
        S("3", "<strong>Protéger les mineurs en ligne</strong>", "Pistes : l'interdiction est-elle une réponse adaptée ? Quel rôle pour les parents, l'école, les plateformes et les États ? Liberté d'expression et protection : comment concilier les deux ?"),
        S("4", "<strong>Le retour des objets « analogiques »</strong>", "Pistes : vinyles, photographie argentique, livres papier : simple nostalgie ou rejet du tout numérique ? Que révèle ce phénomène sur notre rapport au temps et aux autres ?"),
      ] },
    ] },
  },
};

const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const ra = [];
for (const [id, d] of Object.entries(DE)) {
  ra.push(`update public.exercises set consigne = ${q(d.consigne)}, meta = meta || ${q(JSON.stringify({ bocTham: d.bocTham }))}::jsonb where id = ${q(id)};`);
}
const out = ra.join("\n");
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);
