import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { phat, amThanhBat, datAmThanh } from "./amThanh.js";
import { tr } from "./i18n.jsx";

/* Nút tắt/bật hiệu ứng âm thanh (09/10). Dùng chung một lựa chọn cho mọi màn. */
export default function NutTieng({ className = "" }) {
  const [bat, setBat] = useState(amThanhBat);
  const nhan = bat ? tr("Tắt âm thanh", "Couper le son", "Mute") : tr("Bật âm thanh", "Activer le son", "Unmute");
  return (
    <button type="button" aria-label={nhan} title={nhan} aria-pressed={!bat}
      onClick={() => { const m = !bat; datAmThanh(m); setBat(m); if (m) phat("bam"); }}
      className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-solid border-line bg-surface text-soft transition-colors hover:border-primary hover:text-primary ${className}`}>
      {bat ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </button>
  );
}
