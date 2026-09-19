'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Wrap anything in <Reveal> to fade + rise it in once, the first time it
 * scrolls into view. Pass `delay` (ms) to stagger a group of siblings.
 *
 *   <Reveal as="h2">Title</Reveal>
 *   {items.map((item, i) => <Reveal key={item.id} delay={i * 80}>...</Reveal>)}
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Respect reduced-motion users: show immediately, no observer needed.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' in-view' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
