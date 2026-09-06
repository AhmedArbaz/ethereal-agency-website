'use client';

import { useEffect, useState } from 'react';

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
      {services.map((service) => (
        <div className="service-plaque" key={service.id}>
          {service.iconUrl && <img src={service.iconUrl} alt="" className="service-icon" />}
          <h3>{service.title}</h3>
          <p>{service.description}</p>
        </div>
      ))}
    </div>
  );
}
