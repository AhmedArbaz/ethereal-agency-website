'use client';

import { useEffect, useState } from 'react';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MAX_BYTES = 5 * 1024 * 1024; // 5MB (screenshots run bigger than icons)
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

function newProject() {
  return {
    id: 'project-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title: '',
    category: '',
    imageUrl: '',
    link: '',
  };
}

export default function PortfolioPanel() {
  const [items, setItems] = useState(null);
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState({});

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((json) => setItems(Array.isArray(json) ? json : []))
      .catch(() => setStatusMsg('Could not load portfolio.'));
  }, []);

  if (!items) {
    return <div className="admin-loading">Loading portfolio…</div>;
  }

  function updateField(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, newProject()]);
  }

  async function handleImageUpload(index, file) {
    if (!file) return;
    const id = items[index].id;
    setUploadError((prev) => ({ ...prev, [id]: '' }));

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setUploadError((prev) => ({
        ...prev,
        [id]: 'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local.',
      }));
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError((prev) => ({ ...prev, [id]: 'Unsupported file type. Use PNG, JPG, WEBP, or GIF.' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError((prev) => ({ ...prev, [id]: 'File is too large (5MB max).' }));
      return;
    }

    setUploadingId(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'ethereal-portfolio');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError((prev) => ({ ...prev, [id]: data.error?.message || 'Upload failed' }));
        return;
      }
      updateField(index, 'imageUrl', data.secure_url);
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
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
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
      <h2>Manage portfolio projects</h2>
      <p className="admin-panel-hint">
        Projects with no image show a placeholder on the site labeled &quot;Your Project Here&quot; —
        upload a real screenshot to replace it.
      </p>

      <div className="admin-services-list">
        {items.map((item, index) => (
          <div className="admin-service-row" key={item.id}>
            <div className="admin-service-icon-col">
              <div className="admin-icon-preview admin-portfolio-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" />
                ) : (
                  <span className="admin-icon-placeholder">?</span>
                )}
              </div>
              <label className="btn btn-outline admin-add-btn admin-upload-btn">
                {uploadingId === item.id ? 'Uploading…' : 'Upload image'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => handleImageUpload(index, e.target.files[0])}
                  disabled={uploadingId === item.id}
                  hidden
                />
              </label>
              {uploadError[item.id] && (
                <span className="admin-status admin-status-error">{uploadError[item.id]}</span>
              )}
            </div>

            <div className="admin-service-fields">
              <div className="admin-form-row admin-form-row-2">
                <div className="field">
                  <label htmlFor={'ptitle-' + item.id}>Project title</label>
                  <input
                    id={'ptitle-' + item.id}
                    type="text"
                    value={item.title}
                    onChange={(e) => updateField(index, 'title', e.target.value)}
                    placeholder="e.g. Cedar & Sage Restaurant Site"
                  />
                </div>
                <div className="field">
                  <label htmlFor={'pcat-' + item.id}>Category</label>
                  <input
                    id={'pcat-' + item.id}
                    type="text"
                    value={item.category}
                    onChange={(e) => updateField(index, 'category', e.target.value)}
                    placeholder="e.g. Next.js Websites"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor={'plink-' + item.id}>Live site link (optional)</label>
                <input
                  id={'plink-' + item.id}
                  type="url"
                  value={item.link}
                  onChange={(e) => updateField(index, 'link', e.target.value)}
                  placeholder="https://clientsite.com"
                />
              </div>
            </div>

            <button
              type="button"
              className="admin-remove-btn admin-service-remove"
              onClick={() => removeItem(index)}
              aria-label="Remove project"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline admin-add-btn" onClick={addItem}>
        + Add project
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
