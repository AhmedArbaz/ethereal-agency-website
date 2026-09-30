'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CONTENT, LIMITS, sanitizeContent } from '../../lib/siteContent';

export default function ContentPanel() {
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => setContent(sanitizeContent(json)))
      .catch(() => setContent(DEFAULT_CONTENT));
  }, []);

  if (!content) {
    return <div className="admin-loading">Loading section text…</div>;
  }

  function setServices(field, value) {
    setContent((prev) => ({ ...prev, services: { ...prev.services, [field]: value } }));
  }
  function setProcess(field, value) {
    setContent((prev) => ({ ...prev, process: { ...prev.process, [field]: value } }));
  }
  function setStep(index, field, value) {
    setContent((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        steps: prev.process.steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
      },
    }));
  }
  function moveStep(index, dir) {
    setContent((prev) => {
      const steps = [...prev.process.steps];
      const target = index + dir;
      if (target < 0 || target >= steps.length) return prev;
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...prev, process: { ...prev.process, steps } };
    });
  }
  function removeStep(index) {
    setContent((prev) => ({
      ...prev,
      process: { ...prev.process, steps: prev.process.steps.filter((_, i) => i !== index) },
    }));
  }
  function addStep() {
    setContent((prev) => ({
      ...prev,
      process: { ...prev.process, steps: [...prev.process.steps, { title: '', description: '' }] },
    }));
  }

  async function handleSave() {
    const filled = content.process.steps.filter((s) => s.title.trim());
    if (filled.length < LIMITS.minSteps) {
      setStatus('error');
      setStatusMsg(`Add at least ${LIMITS.minSteps} steps (each step needs a title).`);
      return;
    }
    if (!content.services.title.trim() || !content.process.title.trim()) {
      setStatus('error');
      setStatusMsg('Both section titles are required.');
      return;
    }

    setStatus('saving');
    setStatusMsg('');
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setStatusMsg(body.error || 'Could not save changes.');
        return;
      }
      if (body.content) setContent(body.content); // show what was actually stored
      setStatus('saved');
      setStatusMsg('Changes saved — live on the site now.');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setStatusMsg('Could not reach the server.');
    }
  }

  const { services: sv, process: pr } = content;
  const atMax = pr.steps.length >= LIMITS.maxSteps;

  return (
    <section className="admin-panel stitch-box">
      <h2>Section text</h2>
      <p className="admin-panel-hint">
        Heading text of the homepage sections. Leave the small label or description empty to hide it.
      </p>

      {/* ---------- Services heading ---------- */}
      <div className="admin-group">
        <h3>&quot;What we build&quot; section heading</h3>
        <div className="admin-group-fields">
          <div className="field">
            <label htmlFor="sv-kicker">Small label</label>
            <input id="sv-kicker" type="text" maxLength={LIMITS.kicker} value={sv.kicker}
              onChange={(e) => setServices('kicker', e.target.value)} placeholder="e.g. What we build" />
          </div>
          <div className="field">
            <label htmlFor="sv-title">Heading</label>
            <input id="sv-title" type="text" maxLength={LIMITS.title} value={sv.title}
              onChange={(e) => setServices('title', e.target.value)} placeholder="e.g. Five disciplines, one studio" />
          </div>
          <div className="field admin-service-fields">
            <label htmlFor="sv-desc">Description</label>
            <textarea id="sv-desc" maxLength={LIMITS.description} value={sv.description}
              onChange={(e) => setServices('description', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ---------- Process ---------- */}
      <div className="admin-group">
        <h3>&quot;How it works&quot; section</h3>
        <div className="admin-group-fields">
          <div className="field">
            <label htmlFor="pr-kicker">Small label</label>
            <input id="pr-kicker" type="text" maxLength={LIMITS.kicker} value={pr.kicker}
              onChange={(e) => setProcess('kicker', e.target.value)} placeholder="e.g. How it works" />
          </div>
          <div className="field">
            <label htmlFor="pr-title">Heading</label>
            <input id="pr-title" type="text" maxLength={LIMITS.title} value={pr.title}
              onChange={(e) => setProcess('title', e.target.value)} placeholder="e.g. Four steps from brief to launch" />
          </div>
        </div>

        <div className="admin-services-list">
          {pr.steps.map((step, index) => (
            <div className="admin-step-row" key={index}>
              <div className="admin-step-num">{index + 1}</div>
              <div className="admin-service-fields">
                <div className="field">
                  <label htmlFor={'st-title-' + index}>Step title</label>
                  <input id={'st-title-' + index} type="text" maxLength={LIMITS.stepTitle} value={step.title}
                    onChange={(e) => setStep(index, 'title', e.target.value)} placeholder="e.g. Discovery" />
                </div>
                <div className="field">
                  <label htmlFor={'st-desc-' + index}>Step description</label>
                  <textarea id={'st-desc-' + index} maxLength={LIMITS.stepDescription} value={step.description}
                    onChange={(e) => setStep(index, 'description', e.target.value)} />
                </div>
              </div>
              <div className="admin-step-controls">
                <button type="button" className="admin-remove-btn" aria-label="Move step up"
                  disabled={index === 0} onClick={() => moveStep(index, -1)}>↑</button>
                <button type="button" className="admin-remove-btn" aria-label="Move step down"
                  disabled={index === pr.steps.length - 1} onClick={() => moveStep(index, 1)}>↓</button>
                <button type="button" className="admin-remove-btn" aria-label="Remove step"
                  disabled={pr.steps.length <= LIMITS.minSteps} onClick={() => removeStep(index)}>×</button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-outline admin-add-btn" onClick={addStep} disabled={atMax}>
          {atMax ? `Max ${LIMITS.maxSteps} steps` : '+ Add step'}
        </button>
      </div>

      <div className="admin-save-bar">
        <button type="button" className="btn btn-gold" onClick={handleSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {statusMsg && <span className={'admin-status admin-status-' + status}>{statusMsg}</span>}
      </div>
    </section>
  );
}
