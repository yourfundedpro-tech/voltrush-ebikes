import { useEffect, useMemo, useState } from "react";

function buildFallbackImage({ name, category, accent }) {
  const safeName = name ?? "VoltRush";
  const safeCategory = category ?? "Electric Mobility";
  const accentColor = "#ff3030";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeName}">
      <defs>
        <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#161616" />
          <stop offset="100%" stop-color="#050505" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#panel)" />
      <circle cx="600" cy="350" r="250" fill="${accentColor}" opacity="0.12" />
      <rect x="96" y="96" width="1008" height="708" rx="40" fill="none" stroke="rgba(255,255,255,0.12)" />
      <text x="140" y="170" fill="${accentColor}" font-family="Segoe UI, Arial, sans-serif" font-size="34" letter-spacing="8">
        ${safeCategory.toUpperCase()}
      </text>
      <text x="140" y="280" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="74" font-weight="700">
        ${safeName}
      </text>
      <g transform="translate(130 355)">
        <rect x="0" y="0" width="940" height="220" rx="30" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />
        <circle cx="180" cy="160" r="92" fill="none" stroke="#ffffff" stroke-width="12" />
        <circle cx="760" cy="160" r="92" fill="none" stroke="#ffffff" stroke-width="12" />
        <path d="M180 160 L360 70 L475 160 L610 65 L760 160" fill="none" stroke="${accentColor}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M360 70 L300 160 L475 160" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M610 65 L575 160" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" />
        <path d="M560 52 L650 52" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
        <path d="M290 55 L350 45" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
      </g>
      <text x="140" y="690" fill="#d9d9d9" font-family="Segoe UI, Arial, sans-serif" font-size="28">
        Product photo unavailable. VoltRush reserve artwork is shown instead.
      </text>
      <text x="140" y="748" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="24">
        VoltRush reserve visual
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ProductImage({
  src,
  alt,
  name,
  category,
  accent,
  className,
  loading = "lazy",
}) {
  const fallbackSrc = useMemo(
    () => buildFallbackImage({ name, category, accent }),
    [accent, category, name],
  );
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [fallbackSrc, src]);

  return (
    <img
      className={className}
      src={currentSrc}
      alt={alt ?? name}
      loading={loading}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
