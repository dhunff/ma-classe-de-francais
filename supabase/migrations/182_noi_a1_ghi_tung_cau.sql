-- 182 · BÀI NÓI A1: GHI ÂM RIÊNG TỪNG CÂU (01/11, theo chủ dự án).
-- Đề bài cũ dặn ghi cả bài một lần, đổi lại cho khớp màn làm bài.

update public.exercises
set consigne = replace(replace(consigne,
  'Écoutez chaque phrase, puis répétez. Enregistrez toutes les phrases à la suite.',
  'Écoutez chaque phrase, répétez, puis enregistrez-vous.'),
  'Enregistrez toutes vos réponses à la suite.', 'Enregistrez chaque réponse.')
where id like 'a1po%';

do $$
declare n int;
begin
  select count(*) into n from public.exercises where id like 'a1po%' and consigne like '%à la suite.%' and consigne not like '%six cartes%';
  if n > 0 then raise exception 'còn % đề bài dặn ghi chung', n; end if;
end $$;
