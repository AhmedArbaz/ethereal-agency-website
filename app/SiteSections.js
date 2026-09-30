'use client';

import Reveal from './Reveal';
import useSiteContent from './useSiteContent';

// Heading block above the service cards ("What we build").
export function ServicesHead() {
  const { services: s } = useSiteContent();
  return (
    <div className="section-head">
      {s.kicker && <Reveal as="span" className="kicker">{s.kicker}</Reveal>}
      <Reveal as="h2" delay={80}>{s.title}</Reveal>
      {s.description && <Reveal as="p" delay={160}>{s.description}</Reveal>}
    </div>
  );
}

// Heading + steps of the "How it works" section.
export function ProcessBlock() {
  const { process: p } = useSiteContent();
  return (
    <>
      <div className="section-head">
        {p.kicker && <Reveal as="span" className="kicker">{p.kicker}</Reveal>}
        <Reveal as="h2" delay={80}>{p.title}</Reveal>
      </div>
      <div className="process-row" data-count={p.steps.length}>
        {p.steps.map((step, i) => (
          <Reveal className="process-step" delay={i * 100} key={i}>
            <div className="num">{i + 1}</div>
            <h3>{step.title}</h3>
            {step.description && <p>{step.description}</p>}
          </Reveal>
        ))}
      </div>
    </>
  );
}
