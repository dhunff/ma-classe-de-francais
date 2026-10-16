import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookA, ArrowRight } from "lucide-react";
import { tr } from "./i18n.jsx";

/* Gợi ý « Ôn bài ngữ pháp này » (16/10): sau khi chấm, câu SAI có nhãn point_gram
 * (migration 011) được ánh xạ sang bài trong « Học ngữ pháp ». Chọn bài ở đúng
 * trình độ của bài luyện; không có thì lấy bài gần nhất bên dưới, rồi bên trên.
 * lexique_thematique (từ vựng) không có bài ngữ pháp tương ứng: bỏ qua. */
const BAI_THEO_NHAN = {
  temps_present: ["a1-present", "a2-present", "b1-present"],
  temps_passe: ["a1-passe-compose", "a2-temps-passe", "b1-temps-passe", "b2-temps-passe", "c1-temps-litteraires"],
  temps_futur: ["a1-futur-proche", "a2-futur", "b1-temps-futur"],
  cause_consequence: ["a2-cause-consequence", "b1-relations-logiques", "b2-cause-consequence-but"],
  but_hypothese: ["a2-futur", "b1-conditionnel", "b2-hypothese-condition", "c1-hypothese"],
  articulation_logique: ["b1-relations-logiques", "b2-opposition-concession", "c1-argumentation"],
  modes_verbaux: ["b1-conditionnel", "b1-subjonctif-present", "b2-subjonctif", "c1-modalisation"],
  morphosyntaxe: ["a1-nom-article", "a2-adjectif", "b1-adjectif", "b2-relatifs"],
  formation_mots: ["a2-adverbes", "c1-nominalisation"],
};
const THU_TU = ["A0", "A1", "A2", "B1", "B2", "C1"];

export default function GoiYNguPhap({ nhan, level }) {
  const [ds, setDs] = useState([]);
  const khoa = [...new Set((nhan ?? []).filter((n) => BAI_THEO_NHAN[n]))].sort().join(",");
  useEffect(() => {
    if (!khoa) { setDs([]); return; }
    let huy = false;
    import("../content/nguPhap/index.js").then(({ TAT_CA }) => {
      if (huy) return;
      const theoMa = Object.fromEntries(TAT_CA.map((b) => [b.ma, b]));
      const muc = THU_TU.indexOf(String(level ?? "").toUpperCase().slice(0, 2));
      const chon = khoa.split(",").map((n) => {
        const ung = BAI_THEO_NHAN[n].map((m) => theoMa[m]).filter(Boolean);
        if (muc < 0) return ung[0];
        const kc = (b) => { const d = THU_TU.indexOf(b.cap) - muc; return d === 0 ? 0 : d < 0 ? -d : d + 0.5; };
        return [...ung].sort((a, b) => kc(a) - kc(b))[0];
      }).filter(Boolean);
      setDs([...new Map(chon.map((b) => [b.ma, b])).values()].slice(0, 3));
    });
    return () => { huy = true; };
  }, [khoa, level]);
  if (!ds.length) return null;
  return (
    <div className="mt-5 w-full max-w-md rounded-2xl bg-primary-soft p-4 text-left">
      <p className="m-0 flex items-center gap-1.5 text-sm font-extrabold text-primary"><BookA size={16} /> {tr("Ôn bài ngữ pháp liên quan đến câu sai", "Revoir la grammaire liée à vos erreurs", "Review the grammar behind your mistakes")}</p>
      <div className="mt-2 grid gap-1.5">
        {ds.map((b) => (
          <Link key={b.ma} to={`/etudiant/ngu-phap/${b.ma}`} className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-ink no-underline hover:opacity-90">
            <span>{b.cap} · {b.ten}</span><ArrowRight size={15} className="text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
