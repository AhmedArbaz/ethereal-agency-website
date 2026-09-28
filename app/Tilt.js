'use client';

import { useRef } from 'react';

export default function Tilt({ as: Tag = 'div', children, className = '', max = 10, style, ...rest }) {
  const ref = useRef(null);
  const enabledRef = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  function handleMove(e) {
    if (!enabledRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform =
      `perspective(700px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateZ(6px)`;
  }

  function handleLeave() {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }

  return (
    <Tag
      ref={ref}
      className={`tilt-card${className ? ` ${className}` : ''}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
