/* Lô 50 (16/11/2026), phần C: TCF-CO-5 « Nghe một lần, giữ nhịp cả 39 câu ». Bài này là MỘT PHẦN BA
 * đề Nghe TCF thu nhỏ: 12 câu khó dần, 2 câu mỗi mức A1 đến C2, có giới hạn giờ (11 phút, tức nhịp
 * 35 phút cho 39 câu của đề thật). Cùng khuôn với lo50_nghe_tcf_a.mjs. Nội dung hư cấu, FRACILE soạn. */

export const phanC = ({ d, dap, hoi, DT, AN, RA, QC }) => [
  {
    ma: "TCF-CO-5", vong: "chot", tieuDe: "Écoute TCF : mini-test en 12 questions", tep: "tcf-luyen-co5-1", phut: 11,
    cau: [
      /* A1 */
      dap([d("nova", DT, "Bonne nuit, à demain !")],
        ["Bonjour, monsieur.", "Bonne nuit, dors bien !", "Il est sept heures.", "Oui, j'ai un chat."], 1,
        "Đáp lại « Bonne nuit » bằng một lời chúc ngủ ngon."),
      dap([d("echo", DT, "Combien coûte ce livre ?")],
        ["Il est très intéressant.", "C'est un roman.", "Douze euros.", "À la librairie."], 2,
        "« Combien coûte » hỏi giá, nên đáp bằng một số tiền."),
      /* A2 */
      hoi([d("shimmer", DT, "Coucou Julien, c'est Inès. Finalement, je ne peux pas venir dîner ce soir, mon train a beaucoup de retard. On peut se voir demain midi ?")],
        "Que propose Inès ?", "De se voir le lendemain.", ["De dîner ensemble ce soir.", "De prendre le train ensemble.", "D'annuler leur voyage."],
        "Inès hỏi « On peut se voir demain midi ? »."),
      hoi([d("fable", AN + QC, "Avis aux clients : le magasin sera exceptionnellement ouvert ce dimanche de dix heures à dix-sept heures pour les soldes d'hiver.")],
        "Pourquoi le magasin ouvre-t-il dimanche ?", "Pour les soldes.", ["Pour un inventaire.", "Pour une fête de quartier.", "Pour une ouverture officielle."],
        "Cửa hàng mở chủ nhật « pour les soldes d'hiver »."),
      /* B1 */
      hoi([d("onyx", DT, "Tu viens à la fête de Claire samedi ?"), d("coral", DT, "J'aimerais bien, mais j'ai un examen lundi matin et je n'ai presque pas révisé. Je passerai peut-être une heure, pas plus.")],
        "Pourquoi la femme ne restera-t-elle pas longtemps à la fête ?", "Elle doit réviser pour un examen.", ["Elle ne connaît pas bien Claire.", "Elle travaille samedi soir jusqu'à une heure tardive.", "Elle n'aime pas les fêtes."],
        "Cô ấy nói « j'ai un examen lundi matin et je n'ai presque pas révisé »."),
      hoi([d("nova", RA, "La mairie lance un nouveau service : les habitants peuvent désormais signaler un problème dans la rue, comme un trou ou un lampadaire en panne, grâce à une application. Une équipe s'engage à intervenir sous quarante-huit heures.")],
        "À quoi sert la nouvelle application ?", "À signaler des problèmes dans la rue.", ["À payer le stationnement.", "À réserver une salle municipale.", "À voter pour des projets de quartier."],
        "Ứng dụng giúp người dân « signaler un problème dans la rue »."),
      /* B2 */
      hoi([d("sage", RA, "Vous avez créé un réseau d'échange de services entre voisins. Comment ça fonctionne ?"), d("shimmer", RA, "Chacun propose ce qu'il sait faire : réparer un vélo, garder des enfants, aider à un déménagement. Il n'y a pas d'argent : une heure donnée vaut une heure reçue, quel que soit le service.")],
        "Quel est le principe du réseau ?", "Toutes les heures de service ont la même valeur.", ["Les services les plus difficiles sont mieux payés.", "Seuls les voisins âgés peuvent recevoir de l'aide.", "Chaque membre paie une petite cotisation."],
        "Nguyên tắc: « une heure donnée vaut une heure reçue, quel que soit le service »."),
      hoi([d("echo", RA + QC, "Les librairies indépendantes résistent mieux que prévu face à la vente en ligne. Leur atout : le conseil. Les lecteurs viennent chercher un avis personnel, une découverte qu'aucun algorithme ne leur aurait proposée.")],
        "Selon le journaliste, quel est l'atout des librairies indépendantes ?", "Les conseils personnalisés des libraires.", ["Des prix plus bas qu'en ligne.", "Un choix de livres plus large.", "Des horaires d'ouverture plus longs."],
        "Thế mạnh của hiệu sách độc lập là « le conseil », lời khuyên riêng cho từng người đọc."),
      /* C1 */
      hoi([d("onyx", RA, "On croit souvent que la créativité est un don réservé à quelques-uns. Les études montrent plutôt qu'elle se cultive : elle naît de la contrainte, de la confrontation d'idées et, surtout, d'une tolérance à l'échec que nos systèmes éducatifs encouragent rarement.")],
        "Que reproche implicitement l'orateur aux systèmes éducatifs ?", "Ils acceptent mal l'erreur.", ["Ils imposent trop de contraintes.", "Ils négligent les élèves doués.", "Ils favorisent trop le travail en groupe."],
        "Ông ấy nói sáng tạo cần « une tolérance à l'échec que nos systèmes éducatifs encouragent rarement »."),
      hoi([d("coral", RA, "Le patrimoine n'est pas seulement fait de monuments. Une recette transmise de génération en génération, un savoir-faire artisanal, une langue régionale relèvent eux aussi du patrimoine, et ils sont souvent plus fragiles que les pierres, car ils disparaissent avec ceux qui les portent.")],
        "Pourquoi ce patrimoine est-il particulièrement fragile ?", "Il dépend des personnes qui le transmettent.", ["Il n'est protégé par aucune loi.", "Il coûte très cher à entretenir pour les communes.", "Il intéresse peu les touristes."],
        "Di sản này mong manh vì « ils disparaissent avec ceux qui les portent »."),
      /* C2 */
      hoi([d("sage", RA, "L'expert n'est pas celui qui a réponse à tout, mais celui qui connaît précisément les limites de son savoir. Paradoxalement, c'est souvent le novice qui affiche les certitudes les plus tranchées, faute de mesurer l'étendue de ce qu'il ignore.")],
        "Quel paradoxe l'orateur souligne-t-il ?", "Les moins compétents sont souvent les plus sûrs d'eux.", ["Les experts refusent de reconnaître leurs erreurs.", "Le savoir rend les gens arrogants.", "Les novices apprennent plus vite que les experts."],
        "Nghịch lý: « c'est souvent le novice qui affiche les certitudes les plus tranchées »."),
      hoi([d("nova", RA + QC, "Il serait commode de tenir la technique pour neutre, simple outil dont seul l'usage serait bon ou mauvais. Mais tout outil incorpore une certaine vision du monde : en rendant certaines actions plus faciles, il en décourage insensiblement d'autres, et façonne ainsi nos comportements sans que nous en ayons conscience.")],
        "Quelle thèse l'oratrice soutient-elle ?", "Les outils influencent nos comportements à notre insu.", ["La technique est neutre par nature.", "Seul l'usage que l'on fait d'un outil peut être bon ou mauvais.", "Les outils facilitent toutes nos actions."],
        "Bà ấy bác ý « tenir la technique pour neutre » và nói công cụ định hình hành vi « sans que nous en ayons conscience »."),
    ],
    tu: ["les soldes (nom masculin pluriel) : đợt giảm giá", "signaler (verbe) : báo (sự cố)", "un atout (nom masculin) : thế mạnh", "un savoir-faire : tay nghề, bí quyết", "à notre insu : mà ta không hay biết"],
    meo: ["12 câu trong 11 phút: không dừng lại ở câu khó, chọn một đáp án rồi đi tiếp, TCF không trừ điểm câu sai.", "Câu đầu dễ nhưng chiếm điểm như nhau về đúng sai: đừng mất điểm vì vội ở nửa đầu."],
  },
];
