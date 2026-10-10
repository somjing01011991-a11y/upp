/** Spinning loader shown while an API call is in flight. `label` adds text beside it; `block` centers it in its area. */
export default function Spinner({ label, block = false, size }) {
  const ring = <span className="ta-spinner" style={size ? { width: size, height: size } : undefined} aria-hidden="true" />;
  if (!block && !label) return ring;
  return (
    <span className={block ? 'ta-spinner-block' : 'ta-spinner-inline'} role="status" aria-live="polite">
      {ring}
      {label && <span>{label}</span>}
    </span>
  );
}
