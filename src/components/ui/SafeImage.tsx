'use client';

import { useState } from 'react';
import Image from 'next/image';

const PLACEHOLDER = '/placeholder.png';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = failed ? PLACEHOLDER : src;

  return (
    <Image
      src={effectiveSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      unoptimized={src.startsWith('http')}
    />
  );
}
