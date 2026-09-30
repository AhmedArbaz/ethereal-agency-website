'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, sanitizeContent } from '../lib/siteContent';

// The first render always uses DEFAULT_CONTENT, so the server-rendered HTML
// (what Google sees) already has real headings. The saved text from the
// admin panel is swapped in right after load. One shared request serves
// every component on the page.
let cache = null;
let inflight = null;

function load() {
  if (!inflight) {
    inflight = fetch('/api/content', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        cache = json ? sanitizeContent(json) : DEFAULT_CONTENT;
        return cache;
      })
      .catch(() => {
        inflight = null; // allow a retry on the next mount
        return DEFAULT_CONTENT;
      });
  }
  return inflight;
}

export default function useSiteContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let alive = true;
    load().then((c) => {
      if (alive) setContent(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  return content;
}
