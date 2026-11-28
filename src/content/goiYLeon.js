import { tr } from "../shared/i18n.jsx";

/* Câu hỏi gợi ý của « Hỏi Léon » (18/11, chủ dự án: « có sẵn mấy câu hỏi, người dùng muốn hỏi thì bấm vào »).
 * Mọi chữ qua tr() và viết thành HÀM (không gọi tr() ở cấp module). Phần tiếng Pháp trong câu giữ nguyên.
 * `cap`: dải trình độ đọc từ profiles.level (« A1 », « B2 »…): "co_ban" (A0–A2), "trung" (B1), "cao" (B2 trở lên).
 * Gợi ý chỉ dựa trên thứ đọc được thật (trình độ trong hồ sơ, trang đang mở), không bịa gì về người học. */

export const dai = (level) => {
  const l = String(level ?? "").toUpperCase();
  if (/^A/.test(l)) return "co_ban";
  if (/^B1/.test(l)) return "trung";
  if (/^(B2|C)/.test(l)) return "cao";
  return "trung";
};

const NHOM = () => [
  {
    ma: "ngu_phap", ten: tr("Ngữ pháp", "Grammaire", "Grammar"), mau: "ngu_phap",
    tu: /grammaire|ngữ pháp|passé|imparfait|subjonctif|conditionnel|pronom|accord|chia|thì |temps|gérondif|relatif|plus-que-parfait/i,
    cau: {
      co_ban: [
        tr("Khi nào dùng « être », khi nào dùng « avoir » với passé composé?", "Quand utiliser « être » ou « avoir » au passé composé ?", "When do I use « être » or « avoir » in the passé composé?"),
        tr("Cách chia động từ nhóm 1 ở thì hiện tại, cho mình ví dụ", "Comment conjuguer les verbes du 1er groupe au présent ? Avec des exemples", "How do I conjugate 1st-group verbs in the present? With examples"),
        tr("« Du, de la, des » khác nhau thế nào?", "Quelle est la différence entre « du, de la, des » ?", "What's the difference between « du, de la, des »?"),
      ],
      trung: [
        tr("Khi nào dùng passé composé, khi nào dùng imparfait?", "Passé composé ou imparfait : comment choisir ?", "Passé composé or imparfait: how do I choose?"),
        tr("Giải thích đại từ « en » và « y » thật dễ hiểu", "Explique-moi simplement les pronoms « en » et « y »", "Explain the pronouns « en » and « y » simply"),
        tr("Cách dùng « qui, que, où, dont » trong mệnh đề quan hệ", "Comment utiliser « qui, que, où, dont » ?", "How do I use « qui, que, où, dont »?"),
      ],
      cao: [
        tr("Giải thích subjonctif: khi nào bắt buộc, khi nào không?", "Le subjonctif : quand est-il obligatoire ?", "The subjonctif: when is it required?"),
        tr("Cách dùng « bien que », « quoique », « malgré » cho đúng", "Comment bien utiliser « bien que », « quoique », « malgré » ?", "How do I use « bien que », « quoique », « malgré » correctly?"),
        tr("Concordance des temps trong câu gián tiếp hoạt động thế nào?", "Comment fonctionne la concordance des temps au discours indirect ?", "How does sequence of tenses work in reported speech?"),
      ],
    },
  },
  {
    ma: "tu_vung", ten: tr("Từ vựng", "Vocabulaire", "Vocabulary"), mau: "tu_vung",
    tu: /vocabulaire|từ vựng|từ |mot|synonyme|expression|nghĩa|thành ngữ/i,
    cau: {
      co_ban: [
        tr("Cho mình 10 từ vựng chủ đề gia đình kèm ví dụ", "Donne-moi 10 mots sur la famille avec des exemples", "Give me 10 family words with examples"),
        tr("Các câu chào hỏi lịch sự hay dùng nhất", "Les formules de politesse les plus utiles", "The most useful polite greetings"),
        tr("Từ vựng để kể về một ngày của mình", "Le vocabulaire pour raconter ma journée", "Vocabulary to describe my day"),
      ],
      trung: [
        tr("Cho mình 10 từ vựng chủ đề môi trường trình độ B1", "Donne-moi 10 mots de niveau B1 sur l'environnement", "Give me 10 B1 environment words"),
        tr("Từ nối nào giúp bài viết mạch lạc hơn?", "Quels connecteurs rendent un texte plus clair ?", "Which linking words make writing clearer?"),
        tr("Cách diễn đạt ý kiến ngoài « je pense que »", "Comment exprimer son opinion sans « je pense que » ?", "Ways to give an opinion besides « je pense que »"),
      ],
      cao: [
        tr("Từ vựng nâng cao để nghị luận về công nghệ", "Du vocabulaire avancé pour argumenter sur la technologie", "Advanced vocabulary to argue about technology"),
        tr("Phân biệt « enjeu », « défi », « problématique »", "Quelle différence entre « enjeu », « défi » et « problématique » ?", "« enjeu », « défi », « problématique »: what's the difference?"),
        tr("Các cách nhượng bộ trang trọng (concession) trong bài luận", "Les tournures de concession pour un essai", "Formal concession phrases for an essay"),
      ],
    },
  },
  {
    ma: "thi", ten: tr("Luyện thi DELF · TCF", "Examens DELF · TCF", "DELF · TCF exams"), mau: "thi",
    tu: /delf|dalf|tcf|thi|examen|épreuve|điểm|barème|grille/i,
    cau: {
      co_ban: [
        tr("Đề DELF A2 gồm những phần nào, mỗi phần bao lâu?", "Comment se passe le DELF A2, épreuve par épreuve ?", "What's in the DELF A2, part by part?"),
        tr("Mẹo làm phần Nghe khi chỉ nghe được ý chính", "Des astuces pour l'oral quand je ne comprends que l'essentiel", "Tips for listening when I only get the gist"),
        tr("Muốn đạt DELF thì cần bao nhiêu điểm?", "Combien de points faut-il pour réussir le DELF ?", "How many points do I need to pass the DELF?"),
      ],
      trung: [
        tr("Cấu trúc bài viết DELF B1 gồm những phần nào?", "Quelle structure pour la production écrite du DELF B1 ?", "How should I structure the DELF B1 writing?"),
        tr("Phần Nói B1 « point de vue » nên trình bày ra sao?", "Comment présenter son point de vue à l'oral du B1 ?", "How do I present my point of view in the B1 oral?"),
        tr("So sánh DELF và TCF: nên thi cái nào?", "DELF ou TCF : lequel choisir ?", "DELF or TCF: which one should I take?"),
      ],
      cao: [
        tr("Cách viết bài nghị luận DELF B2 đạt điểm cao", "Comment réussir l'essai argumenté du DELF B2 ?", "How to score well on the DELF B2 essay"),
        tr("Dàn ý phần Nói B2 trong 30 phút chuẩn bị", "Comment organiser ses 30 minutes de préparation à l'oral B2 ?", "How to use the 30-minute prep for the B2 oral"),
        tr("Synthèse DALF C1 khác gì một bài tóm tắt thường?", "En quoi la synthèse du DALF C1 diffère-t-elle d'un résumé ?", "How is the DALF C1 synthesis different from a summary?"),
      ],
    },
  },
  {
    ma: "sua_bai", ten: tr("Sửa câu · Viết · Nói", "Corriger · Écrire · Parler", "Fix · Write · Speak"), mau: "sua_bai",
    tu: /sửa|corrige|câu này|phrase|viết|écri|nói|parl|phát âm|prononc/i,
    cau: {
      co_ban: [
        tr("Sửa giúp câu: « Je suis allé au cinéma hier avec mes amis »", "Corrige : « Je suis allé au cinéma hier avec mes amis »", "Fix this: « Je suis allé au cinéma hier avec mes amis »"),
        tr("Viết giúp một tin nhắn ngắn mời bạn đi ăn tối", "Aide-moi à écrire un message pour inviter un ami à dîner", "Help me write a short dinner invitation"),
        tr("Những âm tiếng Pháp người Việt hay đọc sai", "Les sons français difficiles pour les Vietnamiens", "French sounds Vietnamese speakers often get wrong"),
      ],
      trung: [
        tr("Sửa giúp câu: « Si j'aurais plus de temps, je voyagerais »", "Corrige : « Si j'aurais plus de temps, je voyagerais »", "Fix this: « Si j'aurais plus de temps, je voyagerais »"),
        tr("Cách mở đầu và kết thư trang trọng", "Comment commencer et terminer une lettre formelle ?", "How to open and close a formal letter"),
        tr("Cho mình 5 câu nói để giữ cuộc trò chuyện khi bí từ", "5 phrases pour gagner du temps quand je cherche mes mots", "5 phrases to buy time when I'm stuck for words"),
      ],
      cao: [
        tr("Viết lại câu này cho trang trọng hơn: « On doit faire plus pour la planète »", "Reformule de façon plus soutenue : « On doit faire plus pour la planète »", "Make this more formal: « On doit faire plus pour la planète »"),
        tr("Cách nối hai ý đối lập mà không lặp « mais »", "Comment opposer deux idées sans répéter « mais » ?", "How to contrast ideas without repeating « mais »"),
        tr("Cách phản biện lịch sự khi tranh luận ở phần Nói", "Comment contredire poliment à l'oral ?", "How to disagree politely in the oral exam"),
      ],
    },
  },
];

/* Danh sách nhóm cho màn gợi ý; nhóm hợp với trang đang mở lên đầu. */
export function goiYTheoTrang(pathname = "", level = "") {
  const d = dai(level);
  const uuTien = /ngu-phap/.test(pathname) ? "ngu_phap" : /tu-vung|the-cua-toi|bo-the/.test(pathname) ? "tu_vung"
    : /examen|tcf|entrainement|luyen/.test(pathname) ? "thi" : null;
  const ds = NHOM().map((n) => ({ ma: n.ma, ten: n.ten, mau: n.mau, cau: n.cau[d] }));
  return uuTien ? [...ds.filter((n) => n.ma === uuTien), ...ds.filter((n) => n.ma !== uuTien)] : ds;
}

/* Ba câu hỏi tiếp theo sau một câu trả lời: cùng nhóm với câu vừa hỏi (đoán theo từ khoá), trừ câu đã hỏi.
   Không đoán được nhóm thì lấy mỗi nhóm một câu. */
export function cauTiepTheo(cauVuaHoi = "", level = "", daHoi = []) {
  const d = dai(level), nhom = NHOM();
  const n = nhom.find((x) => x.tu.test(cauVuaHoi));
  const chua = (c) => !daHoi.includes(c) && c !== cauVuaHoi;
  if (n) {
    const cung = n.cau[d].filter(chua);
    const khac = nhom.filter((x) => x !== n).map((x) => x.cau[d][0]).filter(chua);
    return [...cung, ...khac].slice(0, 3);
  }
  return nhom.map((x) => x.cau[d].find(chua)).filter(Boolean).slice(0, 3);
}
