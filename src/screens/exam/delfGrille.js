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
 * File này không import gì, nên scripts/check-grille.mjs chạy thẳng bằng node.
 * Từng nằm ở supabase/functions/_shared/ khi còn hàm AI chấm; chuyển về đây khi
 * bỏ hàm đó — một bản duy nhất thì không có gì để trôi khỏi nhau.
 */

/* ⚠️ A1 và A2 là bản PHỎNG THEO, quy về thang 25 — nói rõ để không ai tưởng
 * đây là bản sao y grille chính thức.
 *
 * Đề thi thật ở hai trình độ này chia Production écrite thành HAI bài tập với
 * thang riêng (A1: điền phiếu 10đ + viết câu 15đ; A2: hai bài ~12–13đ). Hệ
 * thống của ta coi mỗi phần thi là một khối 25 điểm, nên giữ nguyên cấu trúc
 * đó sẽ không khớp.
 *
 * Với việc TỰ CHẤM thì phỏng theo là đủ và đúng mục đích: giá trị nằm ở chỗ
 * người học đọc lại bài mình theo từng tiêu chí, không nằm ở con số cuối. B1 và
 * B2 thì bám sát grille chính thức vì đó là hai trình độ hệ thống nhắm tới.
 */
export const GRILLE = {
  A1: {
    minWords: 40,
    consigne: "Remplir une fiche et rédiger quelques phrases simples sur soi ou son quotidien.",
    adapted: true,
    criteres: [
      { id: "consigne",  max: 3, label: "Respect de la consigne",
        aide: "Répond bien à ce qui est demandé et respecte la longueur indiquée." },
      { id: "fiche",     max: 3, label: "Capacité à remplir une fiche",
        aide: "Donne nom, âge, nationalité, adresse ou profession sans se tromper de case." },
      { id: "informer",  max: 6, label: "Capacité à informer et à décrire",
        aide: "Écrit des phrases simples sur soi, ses goûts, ses activités." },
      { id: "lexique",   max: 5, label: "Lexique et orthographe lexicale",
        aide: "Utilise un répertoire élémentaire de mots isolés et d'expressions." },
      { id: "morpho",    max: 5, label: "Morphosyntaxe et orthographe grammaticale",
        aide: "Emploie avec un contrôle limité des structures et des formes apprises." },
      { id: "coherence", max: 3, label: "Cohérence et cohésion",
        aide: "Relie les mots avec des connecteurs très élémentaires : et, alors, mais." },
    ],
  },
  A2: {
    minWords: 60,
    consigne: "Décrire un événement ou une expérience, et écrire un message simple (invitation, remerciement, excuse).",
    adapted: true,
    criteres: [
      { id: "consigne",     max: 2, label: "Respect de la consigne",
        aide: "Respecte la situation, le type de message et la longueur demandée." },
      { id: "raconter",     max: 4, label: "Capacité à raconter et à décrire",
        aide: "Décrit des activités passées ou des expériences personnelles." },
      { id: "impressions",  max: 3, label: "Capacité à donner ses impressions",
        aide: "Communique sommairement ce qu'il ou elle a ressenti." },
      { id: "coherence",    max: 2, label: "Cohérence et cohésion",
        aide: "Relie des énoncés avec des connecteurs simples : et, mais, parce que." },
      { id: "etendue_lex",  max: 2, label: "Étendue du vocabulaire",
        aide: "Vocabulaire suffisant pour les situations de la vie quotidienne." },
      { id: "maitrise_lex", max: 2, label: "Maîtrise du vocabulaire",
        aide: "Contrôle restreint mais suffisant pour être compris." },
      { id: "orthographe",  max: 2, label: "Orthographe lexicale",
        aide: "Copie correctement de courtes expressions et des mots courants." },
      { id: "phrases",      max: 2, label: "Degré d'élaboration des phrases",
        aide: "Produit des phrases simples, parfois reliées." },
      { id: "temps",        max: 3, label: "Choix des temps et des modes",
        aide: "Emploie le présent et le passé composé de façon globalement correcte." },
      { id: "morpho",       max: 3, label: "Morphosyntaxe",
        aide: "Accords simples, déterminants, formes verbales apprises." },
    ],
  },
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
