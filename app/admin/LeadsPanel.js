'use client';

import { useEffect, useState } from 'react';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function LeadsPanel() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function load() {
    fetch('/api/leads')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load leads.');
        return res.json();
      })
      .then((json) => setLeads(json))
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function markContacted(id) {
    setBusyId(id);
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'contacted' }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'contacted' } : l)));
    } finally {
      setBusyId(null);
    }
  }

  async function removeLead(id) {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setBusyId(id);
    try {
      await fetch(`/api/leads?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (error) {
    return <div className="admin-panel stitch-box"><p className="admin-error">{error}</p></div>;
  }

  if (!leads) {
    return <div className="admin-loading">Loading leads…</div>;
  }

  return (
    <section className="admin-panel stitch-box leads-panel">
      <h2>Quote requests ({leads.length})</h2>
      {leads.length === 0 && <p className="admin-empty">No leads yet — new contact-form submissions will show up here.</p>}
      {leads.length > 0 && (
        <div className="leads-list">
          {leads.map((lead) => (
            <div className={'lead-card' + (lead.status === 'new' ? ' lead-new' : '')} key={lead.id}>
              <div className="lead-card-head">
                <div>
                  <strong>{lead.name}</strong>
                  <span className="lead-status-badge">{lead.status === 'new' ? 'New' : 'Contacted'}</span>
                </div>
                <span className="lead-date">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="lead-card-row">
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
                <span className="lead-service">{lead.service}</span>
              </div>
              {lead.message && <p className="lead-message">{lead.message}</p>}
              <div className="lead-actions">
                {lead.status !== 'contacted' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busyId === lead.id}
                    onClick={() => markContacted(lead.id)}
                  >
                    Mark contacted
                  </button>
                )}
                <button
                  type="button"
                  className="admin-remove-btn lead-delete-btn"
                  disabled={busyId === lead.id}
                  onClick={() => removeLead(lead.id)}
                  aria-label="Delete lead"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
