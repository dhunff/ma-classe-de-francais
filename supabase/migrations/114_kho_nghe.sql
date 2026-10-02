-- Kho file bài nghe (02/10) — công khai để thẻ <audio> phát được không cần
-- đăng nhập (giống kho đề cũ). KHÔNG có policy ghi nào: chỉ service_role (Edge
-- Function tao-audio, và người vận hành) ghi được.
insert into storage.buckets (id, name, public)
values ('nghe', 'nghe', true)
on conflict (id) do update set public = true;
