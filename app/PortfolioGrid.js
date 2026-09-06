'use client';

import { useEffect, useMemo, useState } from 'react';

const GRADIENTS = [
  'linear-gradient(135deg, var(--leather-warm), var(--gold-dim))',
  'linear-gradient(135deg, var(--leather-mid), var(--leather-warm))',
  'linear-gradient(135deg, #3a2417, #8a6d24)',
  'linear-gradient(135deg, #57331e, #c9a227)',
];

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

export default function PortfolioGrid() {
  const [items, setItems] = useState(null);
  const [activeCat, setActiveCat] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((json) => setItems(Array.isArray(json) ? json : []))
      .catch(() => setItems([]));
  }, []);

  const categories = useMemo(() => {
    if (!items) return ['All'];
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [items]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!items) {
    return <div className="pricing-loading">Loading projects…</div>;
  }

  const filtered = activeCat === 'All' ? items : items.filter((i) => i.category === activeCat);

  return (
    <>
      <div className="filters">
        <div className="filter-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={'filter-pill' + (cat === activeCat ? ' active' : '')}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="portfolio-grid">
        {filtered.map((item, i) => (
          <div
            className="portfolio-card"
            key={item.id}
            style={!item.imageUrl ? { background: GRADIENTS[i % GRADIENTS.length] } : undefined}
          >
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
            {!item.imageUrl && <span className="portfolio-placeholder-title">{item.title}</span>}
            <div className="portfolio-overlay">
              <button
                type="button"
                className="portfolio-plus"
                aria-label={'View ' + item.title}
                onClick={() => setLightbox(item)}
              >
                <PlusIcon />
              </button>
              <span className="portfolio-overlay-title">{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="portfolio-lightbox" onClick={() => setLightbox(null)}>
          <button
            type="button"
            className="portfolio-lightbox-close"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <div className="portfolio-lightbox-content" onClick={(e) => e.stopPropagation()}>
            {lightbox.imageUrl ? (
              <img src={lightbox.imageUrl} alt={lightbox.title} />
            ) : (
              <div
                className="portfolio-lightbox-placeholder"
                style={{ background: GRADIENTS[0] }}
              >
                {lightbox.title}
              </div>
            )}
            <div className="portfolio-lightbox-info">
              <h3>{lightbox.title}</h3>
              <span>{lightbox.category}</span>
              {lightbox.link && (
                <a href={lightbox.link} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                  Visit live site
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
