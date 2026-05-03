import { useEffect, useMemo, useState } from "react";

function buildFallbackImage({ name, category, accent }) {
  const safeName = name ?? "VoltRush";
  const safeCategory = category ?? "Electric Mobility";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeName}">
      <defs>
        <linearGradient id="panel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#161616" />
          <stop offset="100%" stop-color="#050505" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#panel)" />
      <circle cx="600" cy="350" r="250" fill="#ff3030" opacity="0.12" />
      <rect x="96" y="96" width="1008" height="708" rx="40" fill="none" stroke="rgba(255,255,255,0.12)" />
      <foreignObject x="140" y="120" width="920" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', sans-serif; color: #ff5252; font-size: 34px; letter-spacing: 0.32em; text-transform: uppercase;">
          ${safeCategory}
        </div>
      </foreignObject>
      <foreignObject x="140" y="240" width="920" height="180">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', sans-serif; color: white; font-size: 82px; font-weight: 700; line-height: 1.02;">
          ${safeName}
        </div>
      </foreignObject>
      <rect x="180" y="500" width="840" height="16" rx="8" fill="#2a2a2a" />
      <rect x="180" y="500" width="540" height="16" rx="8" fill="#ff3030" />
      <foreignObject x="140" y="560" width="920" height="140">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', sans-serif; color: #d9d9d9; font-size: 30px; line-height: 1.5;">
          Image source unavailable. VoltRush fallback artwork is shown so the storefront stays complete.
        </div>
      </foreignObject>
      <foreignObject x="140" y="720" width="920" height="60">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Segoe UI', sans-serif; color: #ffffff; font-size: 24px;">
          VoltRush reserve visual
        </div>
      </foreignObject>
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
