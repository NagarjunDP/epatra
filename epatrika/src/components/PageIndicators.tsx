"use client";

interface PageIndicatorsProps {
  count: number;
  active: number;
}

export default function PageIndicators({ count, active }: PageIndicatorsProps) {
  return (
    <div className="indicator-wrap" aria-label="Page indicators">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`indicator-dot ${active === i ? "is-active" : ""}`} />
      ))}
    </div>
  );
}
