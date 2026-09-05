'use client';

import { useEffect, useState } from 'react';

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
      .then((res) => res.json())
      .then((json) => {
        setPricing(json);
        setActiveCat(json[0].id);
        setActiveSub(json[0].subs[0].id);
      })
      .catch(() => {});
  }, []);

  if (!pricing) {
    return <div className="pricing-loading">Loading plans…</div>;
  }

  const category = pricing.find((c) => c.id === activeCat) || pricing[0];
  const sub = category.subs.find((s) => s.id === activeSub) || category.subs[0];

  function selectCategory(catId) {
    const cat = pricing.find((c) => c.id === catId);
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
            <div
              key={plan.name + i}
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
            </div>
          );
        })}
      </div>
    </>
  );
}
