'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import Tilt from './Tilt';

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
      {services.map((service, i) => (
        <Reveal key={service.id} delay={(i % 5) * 90}>
          <Tilt as="div" className="service-plaque" max={6}>
            {service.iconUrl && (
              <Image src={service.iconUrl} alt="" className="service-icon" width={30} height={30} unoptimized={service.iconUrl.startsWith('data:')} />
            )}
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </Tilt>
        </Reveal>
      ))}
    </div>
  );
}
