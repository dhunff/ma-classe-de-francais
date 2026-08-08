import React from "react";

const LANG_KEY = "mcf-lang";
const LANGS = [["vi", "🇻🇳", "Tiếng Việt"], ["fr", "🇫🇷", "Français"], ["en", "🇬🇧", "English"]];

const I18N = {
  vi: {
    header: { title: "FRACILE", subtitle: "Lộ trình học tập · bài tập & theo dõi học sinh",
      logout: "Đăng xuất", teacher: "Giáo viên", student: "Học sinh",
      search: "Tìm bài tập, học sinh…", dark_mode: "Chuyển sang nền tối", light_mode: "Chuyển sang nền sáng" },
    nav: { exercises: "Thư viện bài tập", students: "Theo dõi học sinh", stats: "Thống kê",
      todo: "Cần làm", done: "Đã nộp", practice: "Luyện tập", progress: "Tiến độ của tôi", account: "Tài khoản",
      dashboard: "Tổng quan", settings: "Cài đặt",
      primary: "Điều hướng chính", collapse: "Thu gọn thanh bên", expand: "Mở rộng thanh bên",
      open_menu: "Mở menu", close: "Đóng menu" },
    actions: { refresh: "Làm mới", new_exercise: "+ Bài tập mới", announce: "Thông báo" },
    empty: { no_submission: "Hiện tại chưa có bài nộp nào.", all_done: "🎉 Đã nộp hết bài! Không còn bài nào đang chờ.",
      no_exercise: "Chưa có bài tập nào. Hãy tạo bài đầu tiên với « + Bài tập mới »." },
    submit_button: "Nộp bài & xem kết quả", submit_copy: "Nộp bài làm", sending: "Đang gửi…",
    quit_draft: "Thoát (đã lưu nháp)", back: "Quay lại",
    incomplete_title: "Bài làm chưa hoàn tất",
    incomplete_body: "Bạn vẫn còn {count} câu hỏi chưa hoàn thành. Bạn có chắc chắn muốn nộp bài ngay bây giờ không ? Điểm số sẽ được tính dựa trên những câu đã trả lời.",
    keep_working: "Tiếp tục làm bài", submit_anyway: "Vẫn nộp bài", lang_label: "Ngôn ngữ",
    loading: "Đang tải…",
    dash: {
      hello: "Xin chào", goal: "Mục tiêu", no_goal: "Bạn chưa đặt mục tiêu. Vào Cài đặt để chọn.",
      no_exercise_yet: "Chưa có bài tập nào được giao cho bạn.",
      completion: "Bài đã hoàn thành", submitted: "Đã nộp", of_assigned: "trên {n} bài được giao",
      avg_score: "Điểm trung bình", avg_empty: "Chưa có bài nào được chốt điểm",
      pending: "Đang chờ làm", overdue: "{n} bài đã quá hạn",
      streak: "Chuỗi ngày học",
      streak_empty: "Chưa tính được — hệ thống chưa ghi hoạt động theo ngày",
      skills: "Mức độ đồng đều theo kỹ năng",
      skills_note: "Tính từ các bài đã được chốt điểm.",
      skills_empty_title: "Chưa đủ dữ liệu để vẽ",
      skills_empty_body: "Cần bài đã chốt điểm ở ít nhất 3 kỹ năng khác nhau.",
      continue: "Học tiếp",
      continue_empty_title: "Không còn bài nào đang chờ",
      continue_empty_body: "Bạn đã nộp hết bài được giao.",
      questions: "{n} câu", due: "Hạn nộp", was_due: "Đã quá hạn",
      to_grade: "Bài cần chấm", recent_submissions: "Bài nộp gần đây",
      recent_empty_body: "Bài nộp của học sinh sẽ hiện ở đây.", awaiting: "Chờ chấm",
      nothing_assigned_title: "Chưa được giao bài nào",
    },
  },
  fr: {
    header: { title: "FRACILE", subtitle: "Parcours d'apprentissage · exercices & suivi des élèves",
      logout: "Se déconnecter", teacher: "Professeur", student: "Élève",
      search: "Rechercher un exercice, un élève…", dark_mode: "Passer en mode sombre", light_mode: "Passer en mode clair" },
    nav: { exercises: "Bibliothèque d'exercices", students: "Suivi des élèves", stats: "Statistiques",
      todo: "À faire", done: "Rendus", practice: "Entraînement", progress: "Ma progression", account: "Mon compte",
      dashboard: "Tableau de bord", settings: "Paramètres",
      primary: "Navigation principale", collapse: "Réduire le menu", expand: "Déployer le menu",
      open_menu: "Ouvrir le menu", close: "Fermer le menu" },
    actions: { refresh: "Actualiser", new_exercise: "+ Nouvel exercice", announce: "Annonce" },
    empty: { no_submission: "Aucune copie rendue pour l'instant.", all_done: "🎉 Tout est rendu ! Aucun exercice en attente.",
      no_exercise: "Aucun exercice pour le moment. Créez le premier avec « + Nouvel exercice »." },
    submit_button: "Rendre & voir le résultat", submit_copy: "Rendre ma copie", sending: "Envoi…",
    quit_draft: "Quitter (brouillon sauvegardé)", back: "Retour",
    incomplete_title: "Copie incomplète",
    incomplete_body: "Il vous reste {count} question(s) sans réponse. Voulez-vous vraiment rendre votre copie maintenant ? La note sera calculée uniquement sur les questions répondues.",
    keep_working: "Continuer l'exercice", submit_anyway: "Rendre quand même", lang_label: "Langue",
    loading: "Chargement…",
    dash: {
      hello: "Bonjour", goal: "Objectif", no_goal: "Aucun objectif défini. Choisissez-en un dans Paramètres.",
      no_exercise_yet: "Aucun exercice ne vous a encore été attribué.",
      completion: "Exercices terminés", submitted: "Rendus", of_assigned: "sur {n} attribués",
      avg_score: "Note moyenne", avg_empty: "Aucune copie encore notée",
      pending: "En attente", overdue: "{n} en retard",
      streak: "Jours consécutifs",
      streak_empty: "Non calculable — aucun journal d'activité quotidienne",
      skills: "Équilibre des compétences",
      skills_note: "Calculé sur les copies notées.",
      skills_empty_title: "Pas assez de données",
      skills_empty_body: "Il faut des copies notées dans au moins 3 compétences.",
      continue: "Continuer",
      continue_empty_title: "Rien en attente",
      continue_empty_body: "Vous avez rendu tous vos exercices.",
      questions: "{n} question(s)", due: "À rendre le", was_due: "En retard depuis le",
      to_grade: "Copies à corriger", recent_submissions: "Copies récentes",
      recent_empty_body: "Les copies rendues apparaîtront ici.", awaiting: "À corriger",
      nothing_assigned_title: "Aucun exercice attribué",
    },
  },
  en: {
    header: { title: "FRACILE", subtitle: "Learning path · exercises & student tracking",
      logout: "Log out", teacher: "Teacher", student: "Student",
      search: "Search exercises, students…", dark_mode: "Switch to dark mode", light_mode: "Switch to light mode" },
    nav: { exercises: "Exercise library", students: "Student tracking", stats: "Statistics",
      todo: "To do", done: "Submitted", practice: "Practice", progress: "My progress", account: "My account",
      dashboard: "Dashboard", settings: "Settings",
      primary: "Main navigation", collapse: "Collapse sidebar", expand: "Expand sidebar",
      open_menu: "Open menu", close: "Close menu" },
    actions: { refresh: "Refresh", new_exercise: "+ New exercise", announce: "Announcement" },
    empty: { no_submission: "No submissions yet.", all_done: "🎉 Everything submitted! Nothing pending.",
      no_exercise: "No exercises yet. Create the first one with « + New exercise »." },
    submit_button: "Submit & see result", submit_copy: "Submit my work", sending: "Sending…",
    quit_draft: "Quit (draft saved)", back: "Back",
    incomplete_title: "Incomplete submission",
    incomplete_body: "You still have {count} unanswered question(s). Are you sure you want to submit now? Your score will be based only on the answered questions.",
    keep_working: "Keep working", submit_anyway: "Submit anyway", lang_label: "Language",
    loading: "Loading…",
    dash: {
      hello: "Hello", goal: "Goal", no_goal: "No goal set yet. Pick one in Settings.",
      no_exercise_yet: "No exercises have been assigned to you yet.",
      completion: "Exercises completed", submitted: "Submitted", of_assigned: "of {n} assigned",
      avg_score: "Average score", avg_empty: "No submission graded yet",
      pending: "Pending", overdue: "{n} overdue",
      streak: "Day streak",
      streak_empty: "Not available — no daily activity log is recorded",
      skills: "Skill balance",
      skills_note: "Based on graded submissions.",
      skills_empty_title: "Not enough data",
      skills_empty_body: "Needs graded work in at least 3 different skills.",
      continue: "Continue learning",
      continue_empty_title: "Nothing pending",
      continue_empty_body: "You have submitted everything assigned.",
      questions: "{n} questions", due: "Due", was_due: "Overdue since",
      to_grade: "To grade", recent_submissions: "Recent submissions",
      recent_empty_body: "Student submissions will appear here.", awaiting: "Awaiting",
      nothing_assigned_title: "Nothing assigned yet",
    },
  },
};

const getLang = () => { try { return localStorage.getItem(LANG_KEY) || "vi"; } catch { return "vi"; } };
const LangCtx = React.createContext("vi");
const digKey = (obj, key) => key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
function useT() {
  const lang = React.useContext(LangCtx);
  return React.useCallback((key, vars) => {
    let str = digKey(I18N[lang], key);
    if (typeof str !== "string") str = digKey(I18N.vi, key);   // fallback : vi
    if (typeof str !== "string") str = key;
    if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.split(`{${k}}`).join(String(v)); });
    return str;
  }, [lang]);
}


export { LANG_KEY, LANGS, I18N, getLang, LangCtx, digKey, useT };
