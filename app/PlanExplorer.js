'use client';

import { useEffect, useState } from 'react';
import Reveal from './Reveal';

function money(n) {
  return '$' + (Number(n) || 0).toLocaleString('en-US');
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

export default function PlanExplorer() {
  const [pricing, setPricing] = useState(null);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load pricing');
        return res.json();
      })
      .then((json) => {
        if (!Array.isArray(json) || json.length === 0) throw new Error('Invalid pricing data');
        setPricing(json);
        setActiveCat(json[0].id);
        setActiveSub(json[0].subs[0].id);
      })
      .catch(() => setPricing([]));
  }, []);

  if (!pricing) {
    return <div className="pricing-loading">Loading plans…</div>;
  }

  if (pricing.length === 0) {
    return (
      <div className="pricing-loading">
        Pricing is temporarily unavailable. Please refresh, or{' '}
        <a href="#contact" style={{ color: 'var(--gold-bright)' }}>get in touch</a> for a quote directly.
      </div>
    );
  }

  const category = pricing.find((c) => c.id === activeCat) || pricing[0];
  const sub = (category.subs || []).find((s) => s.id === activeSub) || (category.subs || [])[0];

  if (!sub) {
    return <div className="pricing-loading">Pricing is temporarily unavailable. Please refresh the page.</div>;
  }

  function selectCategory(catId) {
    const cat = pricing.find((c) => c.id === catId);
    if (!cat || !cat.subs || cat.subs.length === 0) return;
    setActiveCat(catId);
    setActiveSub(cat.subs[0].id);
  }

  return (
    <>
      <div className="filters">
        <div className="filter-row">
          {pricing.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={'filter-pill' + (cat.id === category.id ? ' active' : '')}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="filter-row sub">
          {category.subs.map((s) => (
            <button
              key={s.id}
              type="button"
              className={'filter-pill' + (s.id === sub.id ? ' active' : '')}
              onClick={() => setActiveSub(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pricing-grid">
        {sub.plans.map((plan, i) => {
          const discountPct = plan.old > 0 ? Math.round((1 - plan.price / plan.old) * 100) : 0;
          return (
            <Reveal
              as="div"
              key={plan.name + i}
              delay={i * 100}
              className={'price-card stitch-box' + (plan.featured ? ' featured leather-accent' : '')}
            >
              {plan.featured && <span className="tag">MOST BOOKED</span>}
              <h3>{plan.name}</h3>
              <div className="price-row">
                <span className="price">{money(plan.price)}</span>
                <span className="old-price">{money(plan.old)}</span>
                <span className="badge-off">{discountPct}% OFF</span>
              </div>
              <div className="plan-label">PLAN INCLUDES</div>
              <ul>
                {plan.features.map((f, fi) => (
                  <li key={fi}>
                    <CheckIcon />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="addon">Add-on: $50 for rush delivery</div>
              <a href="#contact" className={plan.featured ? 'btn btn-gold' : 'btn btn-outline'}>
                {plan.featured ? 'Get this quote' : 'Start here'}
              </a>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
