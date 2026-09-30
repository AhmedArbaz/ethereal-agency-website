'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SERVICE_TAGS, MAX_TAGS, MAX_TAG_LENGTH, cleanTags } from '../../lib/serviceTags';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif'];

function newService() {
  return {
    id: 'service-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title: '',
    description: '',
    iconUrl: '',
    tags: [],
  };
}

// Chip editor: type a tag, press Enter or comma to add it, click x to remove.
function TagsEditor({ id, tags, onChange }) {
  const [draft, setDraft] = useState('');

  function commit(text) {
    const next = cleanTags([...tags, ...text.split(',')]);
    onChange(next);
    setDraft('');
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  const full = tags.length >= MAX_TAGS;

  return (
    <div className="field">
      <label htmlFor={'tags-' + id}>Highlight tags (shown under the description)</label>
      <div className="tag-editor">
        {tags.map((t) => (
          <span className="tag-chip" key={t}>
            {t}
            <button
              type="button"
              aria-label={'Remove tag ' + t}
              onClick={() => onChange(tags.filter((x) => x !== t))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={'tags-' + id}
          type="text"
          value={draft}
          maxLength={MAX_TAG_LENGTH}
          disabled={full}
          placeholder={full ? 'Max ' + MAX_TAGS + ' tags' : tags.length ? 'Add another…' : 'e.g. React'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && commit(draft)}
        />
      </div>
      <small className="tag-hint">Enter ya comma dabao tag add karne ke liye. Max {MAX_TAGS} tags.</small>
    </div>
  );
}

export default function ServicesPanel() {
  const [services, setServices] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [statusMsg, setStatusMsg] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState({});

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((json) =>
        setServices(
          (Array.isArray(json) ? json : []).map((svc) => ({
            ...svc,
            // Older records have no tags yet: start from the old hardcoded
            // chips so saving doesn't silently wipe them from the site.
            tags: Array.isArray(svc.tags) ? svc.tags : DEFAULT_SERVICE_TAGS[svc.id] || [],
          }))
        )
      )
      .catch(() => setStatusMsg('Could not load services.'));
  }, []);

  if (!services) {
    return <div className="admin-loading">Loading services…</div>;
  }

  function updateField(index, field, value) {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeService(index) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function addService() {
    setServices((prev) => [...prev, newService()]);
  }

  async function handleIconUpload(index, file) {
    if (!file) return;
    const id = services[index].id;
    setUploadError((prev) => ({ ...prev, [id]: '' }));

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError((prev) => ({
        ...prev,
        [id]: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local.',
      }));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError((prev) => ({ ...prev, [id]: 'Unsupported file type. Use PNG, JPG, SVG, WEBP, or GIF.' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError((prev) => ({ ...prev, [id]: 'File is too large (2MB max).' }));
      return;
    }

    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'ethereal-icons');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError((prev) => ({ ...prev, [id]: data.error?.message || 'Upload failed' }));
        return;
      }
      updateField(index, 'iconUrl', data.secure_url);
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [id]: 'Could not reach Cloudinary.' }));
    } finally {
      setUploadingId(null);
    }
  }

  async function handleSave() {
    setStatus('saving');
    setStatusMsg('');
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(services),
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

  return (
    <section className="admin-panel stitch-box">
      <h2>Manage &quot;What we build&quot; cards</h2>

      <div className="admin-services-list">
        {services.map((service, index) => (
          <div className="admin-service-row" key={service.id}>
            <div className="admin-service-icon-col">
              <div className="admin-icon-preview">
                {service.iconUrl ? (
                  <img src={service.iconUrl} alt="" />
                ) : (
                  <span className="admin-icon-placeholder">?</span>
                )}
              </div>
              <label className="btn btn-outline admin-add-btn admin-upload-btn">
                {uploadingId === service.id ? 'Uploading…' : 'Upload icon'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                  onChange={(e) => handleIconUpload(index, e.target.files[0])}
                  disabled={uploadingId === service.id}
                  hidden
                />
              </label>
              {uploadError[service.id] && (
                <span className="admin-status admin-status-error">{uploadError[service.id]}</span>
              )}
            </div>

            <div className="admin-service-fields">
              <div className="field">
                <label htmlFor={'title-' + service.id}>Title</label>
                <input
                  id={'title-' + service.id}
                  type="text"
                  value={service.title}
                  onChange={(e) => updateField(index, 'title', e.target.value)}
                  placeholder="e.g. Next.js Development"
                />
              </div>
              <div className="field">
                <label htmlFor={'desc-' + service.id}>Description</label>
                <textarea
                  id={'desc-' + service.id}
                  value={service.description}
                  onChange={(e) => updateField(index, 'description', e.target.value)}
                  placeholder="One or two sentences about this service"
                />
              </div>
              <TagsEditor
                id={service.id}
                tags={service.tags || []}
                onChange={(next) => updateField(index, 'tags', next)}
              />
            </div>

            <button
              type="button"
              className="admin-remove-btn admin-service-remove"
              onClick={() => removeService(index)}
              aria-label="Remove service"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline admin-add-btn" onClick={addService}>
        + Add service card
      </button>

      <div className="admin-save-bar">
        <button type="button" className="btn btn-gold" onClick={handleSave} disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
        {statusMsg && <span className={'admin-status admin-status-' + status}>{statusMsg}</span>}
      </div>
    </section>
  );
}
