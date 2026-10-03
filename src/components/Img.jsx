import { useEffect, useState } from 'react';

/** <img> that swaps to `fallback` when the src is empty or fails to load. */
export default function Img({ src, alt = '', fallback = null, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return fallback;
  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" className={className} onError={() => setFailed(true)} />
  );
}
