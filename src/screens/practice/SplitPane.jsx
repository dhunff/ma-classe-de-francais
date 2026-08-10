import React from "react";
import { Headphones } from "lucide-react";
import ReadingPanel from "../../editor/ReadingPanel.jsx";

/* Bố cục hai khoang khi làm bài: tư liệu bên trái, câu hỏi bên phải.

   Trước đây audio là một thanh ngang chạy suốt phía trên cả hai khoang, và
   split-pane chỉ bật khi bài có văn bản đọc. Nghĩa là bài Compréhension Orale
   — chỉ có audio, không có bài đọc — rơi về một cột, người học phải cuộn lên
   cuộn xuống giữa trình phát và câu hỏi. Giờ mọi tư liệu nằm chung khoang
   trái, và khoang đó dính (sticky) nên còn nguyên trong tầm mắt suốt lúc trả
   lời.

   Không có tư liệu nào thì không dựng khoang rỗng — về một cột hẹp cho dễ đọc.

   Hai khoang cùng `sticky` + `maxHeight: 76vh` và tự cuộn riêng. Chiều cao
   phải chặn ở khoang cha: nếu để ReadingPanel tự sticky thì nó thành sticky
   lồng sticky và khối audio bị đẩy khỏi khung nhìn. Vì vậy panel được gọi với
   `embedded`. */

function AudioCard({ src }) {
  return (
    <div className="shrink-0 rounded-3xl bg-surface p-4 shadow-sm">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-soft">
        <Headphones size={15} /> Document audio
      </div>
      <audio
        controls
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        src={src}
        className="w-full"
      />
    </div>
  );
}

export default function SplitPane({ audioUrl, readingText, stickyTop = 8, children }) {
  const hasMaterial = Boolean(audioUrl || readingText);

  if (!hasMaterial) {
    return <div className="mx-auto grid max-w-3xl gap-4">{children}</div>;
  }

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div
        className="flex min-w-0 flex-col gap-4 overflow-hidden"
        style={{ flex: "6 1 380px", position: "sticky", top: stickyTop, maxHeight: "76vh" }}
      >
        {audioUrl && <AudioCard src={audioUrl} />}
        {readingText && <ReadingPanel text={readingText} embedded />}
      </div>

      <div
        className="mcf-scroll grid min-w-0 gap-4 overflow-y-auto pr-1"
        style={{ flex: "5 1 340px", position: "sticky", top: stickyTop, maxHeight: "76vh" }}
      >
        {children}
      </div>
    </div>
  );
}
