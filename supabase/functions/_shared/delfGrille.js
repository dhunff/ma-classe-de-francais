/* Grille d'évaluation — Production écrite, DELF B1 và B2.
 *
 * Đây là thang chấm chính thức của France Éducation international: mỗi tiêu chí
 * một số điểm, cộng lại đúng 25.
 *
 * ⚠️ ĐỐI CHIẾU VỚI BẢN IN CỦA BẠN trước khi tin tuyệt đối. Grille có chỉnh sửa
 * theo từng đợt cải cách, và một tiêu chí lệch 1 điểm là mọi bài chấm lệch
 * theo. Cấu trúc dưới đây theo bản đang lưu hành; tổng đã kiểm bằng
 * `check:grille`.
 *
 * File này là JS thuần, không import gì — vừa chạy trong Deno (Edge Function)
 * vừa chạy trong Node (bộ kiểm).
 */

export const GRILLE = {
  B1: {
    minWords: 160,
    consigne: "Essai, courrier ou article d'environ 160 mots exprimant un point de vue.",
    criteres: [
      { id: "consigne",     max: 2, label: "Respect de la consigne",
        aide: "Respecte la situation, le type d'écrit et la longueur demandée." },
      { id: "faits",        max: 4, label: "Capacité à présenter des faits",
        aide: "Décrit des faits, des événements ou des expériences de façon compréhensible." },
      { id: "pensee",       max: 4, label: "Capacité à exprimer sa pensée",
        aide: "Présente ses idées, ses sentiments et/ou ses réactions et donne son opinion." },
      { id: "coherence",    max: 3, label: "Cohérence et cohésion",
        aide: "Enchaîne une série d'éléments courts, simples et distincts en un discours qui s'enchaîne." },
      { id: "etendue_lex",  max: 2, label: "Étendue du vocabulaire",
        aide: "Utilise un répertoire élémentaire mais suffisant pour le sujet." },
      { id: "maitrise_lex", max: 2, label: "Maîtrise du vocabulaire",
        aide: "Le vocabulaire est globalement correct malgré des confusions." },
      { id: "orthographe",  max: 1, label: "Maîtrise de l'orthographe lexicale",
        aide: "Orthographe, ponctuation et mise en page assez justes pour être suivies." },
      { id: "phrases",      max: 2, label: "Degré d'élaboration des phrases",
        aide: "Produit des phrases simples et complexes." },
      { id: "temps",        max: 2, label: "Choix des temps et des modes",
        aide: "Fait preuve d'un bon contrôle malgré de nettes influences de la langue maternelle." },
      { id: "morpho",       max: 3, label: "Morphosyntaxe — orthographe grammaticale",
        aide: "Accord en genre et nombre, pronoms, marques verbales." },
    ],
  },
  B2: {
    minWords: 250,
    consigne: "Texte argumenté d'environ 250 mots (contribution, lettre formelle, article).",
    criteres: [
      { id: "consigne",     max: 2, label: "Respect de la consigne",
        aide: "Respecte la situation, le type d'écrit et la longueur indiquée." },
      { id: "sociolang",    max: 2, label: "Correction sociolinguistique",
        aide: "Adapte le registre à la situation et au destinataire." },
      { id: "faits",        max: 3, label: "Capacité à présenter des faits",
        aide: "Évoque avec clarté et précision faits, événements ou situations." },
      { id: "argumenter",   max: 4, label: "Capacité à argumenter",
        aide: "Développe une argumentation, souligne les points importants, illustre par des exemples." },
      { id: "coherence",    max: 3, label: "Cohérence et cohésion",
        aide: "Utilise avec efficacité une gamme étendue de connecteurs." },
      { id: "etendue_lex",  max: 2, label: "Étendue du vocabulaire",
        aide: "Vocabulaire étendu, variations pour éviter les répétitions." },
      { id: "maitrise_lex", max: 2, label: "Maîtrise du vocabulaire",
        aide: "Peu d'erreurs, aucune ne gêne la compréhension." },
      { id: "orthographe",  max: 1, label: "Maîtrise de l'orthographe",
        aide: "Orthographe et ponctuation relativement exactes." },
      { id: "phrases",      max: 2, label: "Degré d'élaboration des phrases",
        aide: "Variété de structures, y compris complexes." },
      { id: "temps",        max: 2, label: "Choix des temps et des modes",
        aide: "Bon contrôle, erreurs non systématiques." },
      { id: "morpho",       max: 2, label: "Morphosyntaxe",
        aide: "Bon contrôle grammatical, erreurs occasionnelles sans malentendu." },
    ],
  },
};

export const tongDiem = (level) =>
  (GRILLE[level]?.criteres ?? []).reduce((n, c) => n + c.max, 0);
