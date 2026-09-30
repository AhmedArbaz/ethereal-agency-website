'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import Tilt from './Tilt';
import { DEFAULT_SERVICE_TAGS, cleanTags } from '../lib/serviceTags';


function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ServicesGrid() {
  const [services, setServices] = useState(null);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((json) => setServices(Array.isArray(json) ? json : []))
      .catch(() => setServices([]));
  }, []);

  if (!services) {
    return <div className="services-loading">Loading services…</div>;
  }

  return (
    <div className="services-grid">
      {services.map((service, i) => {
        // Admin-edited tags win; older records fall back to the defaults.
        const tags = Array.isArray(service.tags)
          ? cleanTags(service.tags)
          : DEFAULT_SERVICE_TAGS[service.id] || [];
        return (
        <Reveal key={service.id} className="service-cell" delay={(i % 5) * 90}>
          <Tilt as="article" className="service-card" max={5}>
            <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
            <div className="service-badge">
              {service.iconUrl && (
                <Image src={service.iconUrl} alt="" className="service-icon" width={28} height={28} unoptimized={service.iconUrl.startsWith('data:')} />
              )}
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {tags.length > 0 && (
              <ul className="service-tags">
                {tags.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
            <a href="#contact" className="service-link">
              Get a quote <Arrow />
            </a>
          </Tilt>
        </Reveal>
        );
      })}
    </div>
  );
}
