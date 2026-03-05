'use client';

interface Emoji3DProps {
  emoji: string;
  className?: string;
  shadow?: string;
}

const DEFAULT_SHADOW =
  '0 1px 0 #fff7dc, 0 2px 0 #ffe6a4, 0 3px 0 #ffd278, 0 4px 0 #ffb74d, 0 10px 16px rgba(245,124,0,0.35)';

export default function Emoji3D({ emoji, className = '', shadow = DEFAULT_SHADOW }: Emoji3DProps) {
  return (
    <span
      className={`inline-block leading-none select-none ${className}`}
      aria-hidden="true"
      style={{
        transform: 'translateZ(0)',
        textShadow: shadow,
      }}
    >
      {emoji}
    </span>
  );
}
