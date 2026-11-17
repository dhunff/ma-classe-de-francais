# Lô 56 (17/11/2026, chủ dự án: « giao diện viết thư phần viết phải như đề mẫu »).
# Đề Viết trả lời một thư / bài diễn đàn: in nguyên thư nhận được trong khung « Nouveau message » (payload.thu),
# đề bài chỉ còn phần yêu cầu, số từ ở payload.soTu (màn thi in ô « 60 mots minimum »). Giữ id câu, nên bài
# học sinh đã viết vẫn gắn đúng câu. Nhân vật, địa chỉ email là hư cấu. Không dùng dấu gạch dài.
# Chạy: python scripts/nhap/lo56_thu_viet.py  → ghi supabase/migrations/<số>_viet_thu.sql
import io, json, os, re

CAU = [
  ("qmuqwmabx00a", 60, "Vous ne pouvez pas aller à la fête. Vous répondez à Julie : vous la remerciez, vous vous excusez, vous expliquez pourquoi et vous proposez une autre date.",
   {"kieu": "mail", "gioiThieu": "Votre amie Julie vous envoie ce message.", "de": "julie.martin@mail.fr", "objet": "Mon anniversaire samedi !",
    "noiDung": "Coucou !\nSamedi prochain, j'organise une petite fête chez moi pour mes 25 ans, à partir de 20 heures. Il y aura de la musique, un grand buffet et beaucoup d'amis. J'aimerais vraiment que tu viennes ! Tu peux me répondre avant jeudi pour me dire si tu es là ?\nBisous,\nJulie"}),
  ("qmuxphuwp01k", 60, "Vous ne pouvez pas venir. Vous répondez à Marie : vous la remerciez, vous expliquez pourquoi vous ne pouvez pas venir et vous proposez une autre sortie.",
   {"kieu": "mail", "gioiThieu": "Votre collègue Marie vous envoie ce message.", "de": "marie.lefort@mail.fr", "objet": "Mon pot de départ",
    "noiDung": "Bonjour à tous,\nComme vous le savez, je quitte l'entreprise à la fin du mois pour un nouveau poste à Lyon. Pour fêter ça, je vous invite à mon pot de départ vendredi soir, à 18 h 30, dans la salle de réunion du deuxième étage. J'espère vous voir nombreux !\nMarie"}),
  ("qmv42g3lj04j", 60, "Vous acceptez l'invitation de Thomas. Vous lui répondez : vous demandez des informations (heure, lieu de rendez-vous, prix) et vous proposez de dîner ensemble avant le concert.",
   {"kieu": "mail", "gioiThieu": "Votre ami Thomas vous envoie ce message.", "de": "thomas.roux@mail.fr", "objet": "Concert samedi ?",
    "noiDung": "Salut !\nJ'ai deux places pour un concert de jazz samedi soir. Mon frère ne peut plus venir avec moi. Ça te dit de m'accompagner ? Réponds-moi vite !\nThomas"}),
  ("qmv42gok004q", 160, "Vous répondez à Sophie sur le forum : vous donnez votre opinion, vous racontez une expérience personnelle et vous proposez une solution.",
   {"kieu": "forum", "tieuDe": "Forum Parents d'aujourd'hui", "gioiThieu": "Vous lisez ce message sur un forum.", "de": "Sophie_maman", "objet": "Le téléphone à table",
    "noiDung": "Bonjour à tous,\nMon fils de 15 ans regarde son téléphone pendant tous les repas. Quand je lui demande de le ranger, il se fâche et me répond que tous ses amis font pareil. Je ne sais plus quoi faire. Faut-il interdire les téléphones à table ?\nMerci pour vos conseils !"}),
  ("qmvemxfqk028", 160, "Vous répondez à Lucas sur le forum : vous donnez votre opinion sur cette interdiction, vous racontez votre propre expérience et vous proposez une solution.",
   {"kieu": "forum", "tieuDe": "Forum Ado & Co", "gioiThieu": "Vous lisez ce message sur un forum.", "de": "Lucas_17", "objet": "Les réseaux sociaux avant 15 ans",
    "noiDung": "Salut tout le monde,\nEn France, on voulait interdire les réseaux sociaux avant 15 ans. Moi, j'ai eu mon premier compte à 12 ans et ça m'a beaucoup aidé à garder contact avec mes amis quand j'ai déménagé. Je trouve qu'interdire, ce n'est pas la solution. Et vous, vous en pensez quoi ?"}),
  ("qmvemyhx902m", 160, "Vous écrivez au maire : vous racontez comment vous avez vécu les fortes chaleurs, vous proposez au moins deux actions et vous expliquez pourquoi elles sont utiles.",
   {"kieu": "mail", "gioiThieu": "Vous recevez ce message de votre mairie.", "de": "participation@mairie-valmont.fr", "objet": "Votre avis pour un été plus frais",
    "noiDung": "Madame, Monsieur,\nAprès l'été très chaud que nous venons de vivre, la mairie souhaite préparer la ville aux prochaines canicules. Nous invitons tous les habitants à nous envoyer leurs idées : comment avez-vous vécu les fortes chaleurs, et quelles actions aimeriez-vous voir dans votre quartier ?\nLe service Participation citoyenne"}),
]

for _, _, de, t in CAU:
    assert "—" not in de + json.dumps(t, ensure_ascii=False)
s = lambda x: "'" + x.replace("'", "''") + "'"
dong = [f"update public.questions set prompt = {s(de)}, payload = coalesce(payload, '{{}}'::jsonb) || {s(json.dumps({'thu': t, 'soTu': so}, ensure_ascii=False))}::jsonb where id = {s(i)};" for i, so, de, t in CAU]
ds = [f for f in os.listdir("supabase/migrations") if re.match(r"^\d+_.*\.sql$", f)]
cu = [f for f in ds if f.endswith("_viet_thu.sql")]
so = int(cu[0].split("_")[0]) if cu else max(int(f.split("_")[0]) for f in ds) + 1
tep = f"supabase/migrations/{so}_viet_thu.sql"
io.open(tep, "w", encoding="utf-8", newline="").write(
  f"-- {so} (17/11/2026, lô 56): phần Viết trả lời thư / bài diễn đàn in thư trong khung « Nouveau message » (payload.thu),\n"
  "-- đề bài chỉ còn phần yêu cầu, số từ ở payload.soTu. A2 Đề 1, 2, 3 (bài 2) và B1 Đề 3, 4, 6. Giữ id câu. Chạy lại an toàn.\n"
  "-- Sinh bởi scripts/nhap/lo56_thu_viet.py.\n" + "\n".join(dong) + "\n")
print("Đã ghi", tep)
