// Fallback chips for services saved before the `tags` field existed.
// Once a service is saved from the admin panel it carries its own `tags`
// array and this map is no longer used for it.
export const DEFAULT_SERVICE_TAGS = {
  'nextjs-dev': ['React', 'SEO-ready', 'Fast'],
  salesforce: ['Apex', 'LWC', 'Experience Cloud'],
  uiux: ['Wireframes', 'Prototypes', 'UI kits'],
  'graphics-logos': ['Logos', 'Brand kits', 'Social'],
  'full-website': ['Design', 'Build', 'Launch'],
};

export const MAX_TAGS = 6;
export const MAX_TAG_LENGTH = 24;

// Trim, drop empties, dedupe (case-insensitive), enforce limits.
export function cleanTags(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim().slice(0, MAX_TAG_LENGTH);
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}
