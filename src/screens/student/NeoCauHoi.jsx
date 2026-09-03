import React, { useEffect, useState } from "react";
import { docNeo } from "../../shared/neoStore.js";
import NeoNguLieu from "./NeoNguLieu.jsx";

/* Neo của MỘT câu, trong màn chữa bài.
 *
 * Tách khỏi `NeoNguLieu` vì hai việc khác nhau: `NeoNguLieu` là trình bày
 * thuần (xem thử được ở /preview.html), còn file này là phần chạm mạng.
 *
 * ══ VÌ SAO KHÔNG NẠP Ở CHỖ GỌI ══
 *
 * Khối chữa bài nằm trong `Card`, mà `Card` được định nghĩa BÊN TRONG
 * `Student` — nên nó là một component mới sau mỗi lần cha dựng lại, và mọi
 * state trong đó bị đặt lại theo. Đặt `useEffect` ở đó thì nó gọi mạng lại sau
 * mỗi lần gõ phím ở chỗ khác trong trang.
 *
 * Ở đây là component cấp module nên vòng đời ổn định, và `docNeo` nhớ theo bài
 * nên mười câu của cùng một bài vẫn chỉ tốn một lời gọi.
 *
 * ══ IM LẶNG KHI KHÔNG CÓ NEO ══
 *
 * Phần lớn câu chưa có neo — giáo viên mới bắt đầu đặt. Hiện một khung rỗng
 * "câu này chưa có ngữ liệu" cho từng câu là biến một tính năng bổ sung thành
 * một lời trách móc lặp lại mười lần trên một trang. Không có thì không hiện.
 */

export default function NeoCauHoi({ exerciseId, questionId, vanBan, chonSai = null }) {
  const [neo, setNeo] = useState(null);

  useEffect(() => {
    /* Không có ngữ liệu thì không có gì để tô — khỏi hỏi máy chủ. Đây là phép
       lọc rẻ nhất và cắt được phần lớn lời gọi: bài ngữ pháp không có
       `reading_text`. */
    if (!exerciseId || !questionId || !String(vanBan ?? "").trim()) return;
    let con = true;
    docNeo(exerciseId).then((ds) => { if (con) setNeo(ds?.[questionId] ?? null); });
    return () => { con = false; };
  }, [exerciseId, questionId, vanBan]);

  if (!neo) return null;

  return (
    <div className="mt-3">
      <NeoNguLieu vanBan={vanBan} evidence={neo} chonSai={chonSai} />
    </div>
  );
}
