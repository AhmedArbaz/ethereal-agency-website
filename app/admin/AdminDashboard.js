'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ServicesPanel from './ServicesPanel';
import PortfolioPanel from './PortfolioPanel';

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

function money(n) {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString('en-US');
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pricing'); // pricing | services
  const [data, setData] = useState(null);
  const [selCat, setSelCat] = useState(null);
  const [selSub, setSelSub] = useState(null);
  const [selPlanIdx, setSelPlanIdx] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setSelCat(json[0].id);
        setSelSub(json[0].subs[0].id);
        setSelPlanIdx(0);
      })
      .catch(() => setStatusMsg('Could not load pricing data.'));
  }, []);

  const category = data ? data.find((c) => c.id === selCat) : null;
  const sub = category ? category.subs.find((s) => s.id === selSub) : null;
  const plan = sub ? sub.plans[selPlanIdx] : null;
  const discountPct = plan && plan.old > 0 ? Math.round((1 - plan.price / plan.old) * 100) : 0;

  function selectCategory(catId) {
    const cat = data.find((c) => c.id === catId);
    setSelCat(catId);
    setSelSub(cat.subs[0].id);
    setSelPlanIdx(0);
  }

  function selectSub(subId) {
    setSelSub(subId);
    setSelPlanIdx(0);
  }

  function updatePlan(updater) {
    setData((prev) =>
      prev.map((cat) => {
        if (cat.id !== selCat) return cat;
        return {
          ...cat,
          subs: cat.subs.map((s) => {
            if (s.id !== selSub) return s;
            return {
              ...s,
              plans: s.plans.map((p, i) => (i !== selPlanIdx ? p : updater(p))),
            };
          }),
        };
      })
    );
  }

  function unfeatureSiblings() {
    setData((prev) =>
      prev.map((cat) => {
        if (cat.id !== selCat) return cat;
        return {
          ...cat,
          subs: cat.subs.map((s) => {
            if (s.id !== selSub) return s;
            return {
              ...s,
              plans: s.plans.map((p, i) => {
                if (i === selPlanIdx) return p;
                const { featured, ...rest } = p;
                return rest;
              }),
            };
          }),
        };
      })
    );
  }

  function handleField(field, value) {
    updatePlan((p) => ({ ...p, [field]: value }));
  }

  function handleFeatureChange(index, value) {
    updatePlan((p) => {
      const features = [...p.features];
      features[index] = value;
      return { ...p, features };
    });
  }

  function addFeature() {
    updatePlan((p) => ({ ...p, features: [...p.features, ''] }));
  }

  function removeFeature(index) {
    updatePlan((p) => ({ ...p, features: p.features.filter((_, i) => i !== index) }));
  }

  function toggleFeatured(checked) {
    if (checked) {
      unfeatureSiblings();
      updatePlan((p) => ({ ...p, featured: true }));
    } else {
      updatePlan((p) => {
        const { featured, ...rest } = p;
        return rest;
      });
    }
  }

  async function handleSave() {
    setStatus('saving');
    setStatusMsg('');
    try {
      const res = await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setStatus('error');
        setStatusMsg(errBody.error || 'Could not save changes.');
        return;
      }
      setStatus('saved');
      setStatusMsg('Changes saved — live on the site now.');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setStatusMsg('Could not reach the server.');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <div className="bg-animated" aria-hidden="true"></div>

      <header className="admin-topbar">
        <div className="wrap admin-topbar-row">
          <div className="logo-mark">
            <img src="/images/logo.png" alt="Ethereal Web Agency" />
            <div>
              <span>ETHEREAL</span>
              <small>ADMIN</small>
            </div>
          </div>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <div className="wrap admin-tabs">
        <button
          type="button"
          className={'filter-pill' + (activeTab === 'pricing' ? ' active' : '')}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing Plans
        </button>
        <button
          type="button"
          className={'filter-pill' + (activeTab === 'services' ? ' active' : '')}
          onClick={() => setActiveTab('services')}
        >
          Services (&quot;What we build&quot;)
        </button>
        <button
          type="button"
          className={'filter-pill' + (activeTab === 'portfolio' ? ' active' : '')}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <div className="wrap admin-content admin-content-single">
          <PortfolioPanel />
        </div>
      )}

      {activeTab === 'services' && (
        <div className="wrap admin-content admin-content-single">
          <ServicesPanel />
        </div>
      )}

      {activeTab === 'pricing' && !data && (
        <div className="wrap admin-loading">Loading pricing data…</div>
      )}

      {activeTab === 'pricing' && data && (
      <div className="wrap admin-content">
        <section className="admin-panel stitch-box">
          <h2>Select a plan to edit</h2>

          <div className="filter-row">
            {data.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={'filter-pill' + (cat.id === selCat ? ' active' : '')}
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
                className={'filter-pill' + (s.id === selSub ? ' active' : '')}
                onClick={() => selectSub(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="filter-row sub">
            {sub.plans.map((p, i) => (
              <button
                key={p.name + i}
                type="button"
                className={'filter-pill' + (i === selPlanIdx ? ' active' : '')}
                onClick={() => setSelPlanIdx(i)}
              >
                {p.name || 'Untitled'}
              </button>
            ))}
          </div>

          <div className="admin-form">
            <div className="admin-form-row">
              <div className="field">
                <label htmlFor="plan-name">Plan name</label>
                <input
                  id="plan-name"
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleField('name', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="plan-price">Price ($)</label>
                <input
                  id="plan-price"
                  type="number"
                  min="0"
                  value={plan.price}
                  onChange={(e) => handleField('price', Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="plan-old">Was-price ($)</label>
                <input
                  id="plan-old"
                  type="number"
                  min="0"
                  value={plan.old}
                  onChange={(e) => handleField('old', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="admin-discount-line">
              Currently showing as <strong>{discountPct}% OFF</strong>
              <label className="admin-featured-toggle">
                <input
                  type="checkbox"
                  checked={!!plan.featured}
                  onChange={(e) => toggleFeatured(e.target.checked)}
                />
                Mark as &quot;Most Booked&quot; (featured)
              </label>
            </div>

            <div className="admin-features">
              <div className="admin-features-head">
                <span>Plan features</span>
                <button type="button" className="btn btn-outline admin-add-btn" onClick={addFeature}>+ Add feature</button>
              </div>
              {plan.features.map((f, i) => (
                <div className="admin-feature-row" key={i}>
                  <input
                    type="text"
                    value={f}
                    onChange={(e) => handleFeatureChange(i, e.target.value)}
                    placeholder="e.g. SEO audit, 2 rounds of revisions..."
                  />
                  <button type="button" className="admin-remove-btn" onClick={() => removeFeature(i)} aria-label="Remove feature">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-save-bar">
            <button type="button" className="btn btn-gold" onClick={handleSave} disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
            {statusMsg && (
              <span className={'admin-status admin-status-' + status}>{statusMsg}</span>
            )}
          </div>
        </section>

        <section className="admin-preview">
          <h2>Live preview</h2>
          <div className={'price-card stitch-box' + (plan.featured ? ' featured leather-accent' : '')}>
            {plan.featured && <span className="tag">MOST BOOKED</span>}
            <h3>{plan.name}</h3>
            <div className="price-row">
              <span className="price">{money(plan.price)}</span>
              <span className="old-price">{money(plan.old)}</span>
              <span className="badge-off">{discountPct}% OFF</span>
            </div>
            <div className="plan-label">PLAN INCLUDES</div>
            <ul>
              {plan.features.map((f, i) => (
                <li key={i}>
                  <CheckIcon />
                  <span>{f || '—'}</span>
                </li>
              ))}
            </ul>
            <div className="addon">Add-on: $50 for rush delivery</div>
            <a href="#" className={plan.featured ? 'btn btn-gold' : 'btn btn-outline'} onClick={(e) => e.preventDefault()}>
              {plan.featured ? 'Get this quote' : 'Start here'}
            </a>
          </div>
        </section>
      </div>
      )}
    </div>
  );
}
