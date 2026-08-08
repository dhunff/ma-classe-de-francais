/* Hồ sơ học sinh: trường, danh mục, validate. */

const PROFILE_FIELDS = ["phone", "dob", "level", "goal", "school"];
const LEVELS_PROFILE = ["Débutant", "A1", "A2", "B1", "B2", "C1", "C2"];
const GOALS_PROFILE = ["DELF A1", "DELF A2", "DELF B1", "DELF B2", "DALF C1", "DALF C2",
  "Étudier en France", "Travailler en français", "Communication quotidienne", "Voyage", "Plaisir personnel"];

const emptyProfile = () => ({ phone: "", dob: "", level: "", goal: "", school: "" });

// % de complétion du profil (gamification)
const calculateProfileCompletion = (p) => {
  if (!p) return 0;
  const filled = PROFILE_FIELDS.filter((k) => String(p[k] ?? "").trim()).length;
  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

// Validation côté client (équivalent Zod : format + longueur)
const validateProfile = (p) => {
  const errs = {};
  const phone = String(p.phone || "").trim();
  if (phone && !/^[+]?[\d\s.\-()]{8,20}$/.test(phone)) errs.phone = "Numéro invalide (8 à 15 chiffres).";
  if (p.dob) {
    const d = new Date(p.dob), now = new Date();
    if (isNaN(d)) errs.dob = "Date invalide.";
    else if (d > now) errs.dob = "La date ne peut pas être dans le futur.";
    else if (now.getFullYear() - d.getFullYear() > 120) errs.dob = "Date trop ancienne.";
  }
  if (p.level && !LEVELS_PROFILE.includes(p.level)) errs.level = "Niveau invalide.";
  if (p.goal && !GOALS_PROFILE.includes(p.goal)) errs.goal = "Objectif invalide.";
  if (String(p.school || "").trim().length > 120) errs.school = "120 caractères maximum.";
  return errs;
};
export { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, emptyProfile, calculateProfileCompletion, validateProfile };
