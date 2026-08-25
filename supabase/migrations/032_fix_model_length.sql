-- 032 — bài mẫu B1 « Jouez avec nous » bị thiếu 2 từ
--
-- Đề yêu cầu 160–180 từ; bản viết ở 031 ra 158. Nghĩa là chính bài mẫu vi phạm
-- tiêu chí đầu tiên của grille — « respect de la consigne » — và học sinh đối
-- chiếu với nó sẽ học sai một chuẩn.
--
-- Bộ đối chiếu ở 031 đặt ngưỡng 55 từ (chỉ bắt bài mẫu rỗng hoặc cụt), nên nó
-- để lọt. Ngưỡng chung là ngưỡng không kiểm được gì: mỗi đề có số từ riêng.
-- File này kiểm ĐÚNG số từ mà từng đề đòi.

update public.questions
   set answer_key = jsonb_set(answer_key, '{model}', to_jsonb($mau$Monsieur le Président,

J'ai bien reçu votre message m'invitant à faire acte de candidature à votre succession, et je tiens d'abord à vous remercier de la confiance que vous me témoignez.

Après y avoir longuement réfléchi, j'ai décidé d'accepter et de présenter ma candidature à la présidence de « Jouez avec nous ».

Plusieurs raisons m'ont conduit à ce choix. Membre de l'association depuis une dizaine d'années, j'en connais bien le fonctionnement ainsi que la plupart des adhérents. J'ai par ailleurs animé les tournois d'échecs pendant trois saisons, ce qui m'a permis de mesurer le travail que représente l'organisation d'un événement.

Je souhaiterais surtout poursuivre ce que vous avez construit, tout en attirant un public plus jeune : beaucoup de lycéens jouent aujourd'hui en ligne et ignorent qu'un club comme le nôtre existe à deux pas de chez eux.

Je reste naturellement à votre disposition pour en discuter plus longuement avant l'assemblée générale, à la date qui vous conviendra.

Je vous prie d'agréer, Monsieur le Président, l'expression de mes salutations distinguées.$mau$::text))
 where id = 'mrhvms3ff6tx7w';

-- ─────────────────── Tự đối chiếu, lần này theo TỪNG đề ───────────────────
do $$
declare
  can constant jsonb := '{"msvgxcvc8qaxqk": 60, "mrhvms3ff6tx7w": 160,
                          "mrhvuug1ap3zxu": 160, "mrhw213ykyhm5o": 160}'::jsonb;
  r record; loi text := '';
begin
  for r in
    select q.id,
           array_length(regexp_split_to_array(btrim(q.answer_key->>'model'), '\s+'), 1) as tu,
           (can ->> q.id)::int as toi_thieu
      from public.questions q
     where q.id in (select jsonb_object_keys(can))
  loop
    if r.tu is null or r.tu < r.toi_thieu then
      loi := loi || r.id || ' chỉ ' || coalesce(r.tu, 0) || '/' || r.toi_thieu || ' từ; ';
    end if;
  end loop;

  /* Và không câu tự luận nào được thiếu bài mẫu. */
  if exists (select 1 from public.questions
              where type='open' and coalesce(btrim(answer_key->>'model'),'') = '') then
    loi := loi || 'còn câu chưa có bài mẫu; ';
  end if;

  if loi <> '' then raise exception 'bài mẫu HỎNG: %', loi; end if;
  raise notice 'bốn bài mẫu đủ số từ đề yêu cầu, 121/121 câu tự luận có bài mẫu';
end $$;
