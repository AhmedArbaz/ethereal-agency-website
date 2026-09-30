// Editable text for the homepage sections that used to be hardcoded:
//   - "What we build" section heading (kicker / title / description)
//   - "How it works" section (kicker / title / steps)
//
// Stored in Firestore at config/siteContent. If the document doesn't exist
// yet, these defaults are used, so no seeding is required.

export const DEFAULT_CONTENT = {
  services: {
    kicker: 'What we build',
    title: 'Five disciplines, one studio',
    description:
      "Every engagement is handled end-to-end — you don't need five different freelancers for a website, its backend, and its brand.",
  },
  process: {
    kicker: 'How it works',
    title: 'Four steps from brief to launch',
    steps: [
      { title: 'Discovery', description: 'We scope your goals, audience, and must-have features in one short call or form.' },
      { title: 'Design', description: 'Wireframes and a visual UI direction, shared for your feedback before any code is written.' },
      { title: 'Development', description: 'The approved design gets built in Next.js, with Salesforce wired in where needed.' },
      { title: 'Launch', description: 'Testing, handover, and support after the site goes live.' },
    ],
  },
};

export const LIMITS = {
  kicker: 40,
  title: 90,
  description: 300,
  stepTitle: 40,
  stepDescription: 200,
  minSteps: 2,
  maxSteps: 6,
};

function str(value, max, fallback) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, max);
}

// Lenient cleaner: wrong types / missing fields fall back to the defaults,
// so the homepage can never render a blank heading or an empty process row.
export function sanitizeContent(input) {
  const src = input && typeof input === 'object' ? input : {};
  const s = src.services && typeof src.services === 'object' ? src.services : {};
  const p = src.process && typeof src.process === 'object' ? src.process : {};
  const D = DEFAULT_CONTENT;

  const title = str(s.title, LIMITS.title, '') || D.services.title;
  const pTitle = str(p.title, LIMITS.title, '') || D.process.title;

  let steps = Array.isArray(p.steps)
    ? p.steps
        .map((st) => ({
          title: str(st && st.title, LIMITS.stepTitle, ''),
          description: str(st && st.description, LIMITS.stepDescription, ''),
        }))
        .filter((st) => st.title)
        .slice(0, LIMITS.maxSteps)
    : [];
  if (steps.length < LIMITS.minSteps) steps = D.process.steps;

  return {
    services: {
      // kicker + description may be intentionally emptied (they just don't render)
      kicker: str(s.kicker, LIMITS.kicker, D.services.kicker),
      title,
      description: str(s.description, LIMITS.description, D.services.description),
    },
    process: {
      kicker: str(p.kicker, LIMITS.kicker, D.process.kicker),
      title: pTitle,
      steps,
    },
  };
}
