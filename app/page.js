'use client';

import PlanExplorer from './PlanExplorer';
import ServicesGrid from './ServicesGrid';
import PortfolioGrid from './PortfolioGrid';

export default function Home() {
  function handleSubmit(e) {
    e.preventDefault();
    alert(
      "Thanks — this is a front-end demo, so the form is not wired to send data yet."
    );
  }

  return (
    <>
      {/* Animated leather background, fixed behind the whole page */}
      <div className="bg-animated" aria-hidden="true"></div>

      {/* ============ NAV ============ */}
      <header>
        <nav className="wrap">
          <div className="logo-mark">
            <img src="/images/logo.png" alt="Ethereal Web Agency" />
            <div>
              <span>ETHEREAL</span>
              <small>WEB AGENCY</small>
            </div>
          </div>
          <ul>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact" className="nav-cta">Get a Quote</a></li>
          </ul>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="leather hero">
        <div className="wrap">
          <img src="/images/logo.png" alt="Ethereal Web Agency" className="hero-logo" />
          <h1>Web builds and CRM systems, <em>finished like a craft</em>, not a template</h1>
          <p className="sub">Ethereal designs and develops Next.js websites, Salesforce systems, and brand visuals for businesses across the US and UK — from a single logo to a full production build.</p>
          <div className="actions">
            <a href="#pricing" className="btn btn-gold">See pricing</a>
            <a href="#services" className="btn btn-outline">Browse services</a>
          </div>
          <div className="markets">Serving clients across the United States &amp; United Kingdom</div>
        </div>
      </section>

      {/* ============ PORTFOLIO ============ */}
      <section id="portfolio" className="leather">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Our work</span>
            <h2>Projects we&apos;ve shipped</h2>
            <p>A look at recent builds across the disciplines we cover — filter by type, then click a project to see it up close.</p>
          </div>
          <PortfolioGrid />
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="leather">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">What we build</span>
            <h2>Five disciplines, one studio</h2>
            <p>Every engagement is handled end-to-end — you don&apos;t need five different freelancers for a website, its backend, and its brand.</p>
          </div>
        </div>
        <div className="wrap" style={{ padding: 0 }}>
          <ServicesGrid />
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section id="process" className="leather stitch">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">How it works</span>
            <h2>Four steps from brief to launch</h2>
          </div>
          <div className="process-row">
            <div className="process-step">
              <div className="num">1</div>
              <h3>Discovery</h3>
              <p>We scope your goals, audience, and must-have features in one short call or form.</p>
            </div>
            <div className="process-step">
              <div className="num">2</div>
              <h3>Design</h3>
              <p>Wireframes and a visual UI direction, shared for your feedback before any code is written.</p>
            </div>
            <div className="process-step">
              <div className="num">3</div>
              <h3>Development</h3>
              <p>The approved design gets built in Next.js, with Salesforce wired in where needed.</p>
            </div>
            <div className="process-step">
              <div className="num">4</div>
              <h3>Launch</h3>
              <p>Testing, handover, and support after the site goes live.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING / PLAN EXPLORER ============ */}
      <section id="pricing" className="leather">
        <div className="wrap">
          <div className="section-head">
            <span className="kicker">Limited-time launch pricing</span>
            <h2>Up to 59% off, built around scope, not guesswork</h2>
            <p>Pick a service, pick a plan type, and see today&apos;s discounted starting packages for US &amp; UK clients — every quote is refined after a quick discovery call.</p>
          </div>
          <PlanExplorer />
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="leather stitch">
        <div className="wrap">
          <div className="about-grid">
            <div>
              <span className="kicker">About Ethereal</span>
              <h2>One studio, built to handle the whole stack</h2>
              <p>Ethereal Web Agency exists because most businesses shouldn&apos;t need a designer, a developer, and a CRM specialist as three separate hires. We build the site, wire up the backend, and design the brand around it — one point of contact, one team accountable for the result.</p>
              <div className="stat-row">
                <div><strong>2</strong><span>Core stacks: Next.js &amp; Salesforce</span></div>
                <div><strong>US/UK</strong><span>Primary markets served</span></div>
              </div>
            </div>
            <div className="quote-box leather-accent stitch-box">
              <p>&quot;A website should look considered, not assembled. Every project starts with the brand, not a template.&quot;</p>
              <footer>— Ethereal Web Agency</footer>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="leather">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="kicker">Get in touch</span>
              <h2>Tell us what you&apos;re building</h2>
              <p>Share a few details and we&apos;ll come back with a scoped quote — usually within a day.</p>
              <div className="direct">
                <a href="https://wa.me/923403157876" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3Z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.9 15.9a8.4 8.4 0 0 1-11.9.7l-.3-.3-3.1.8.8-3-.3-.3a8.4 8.4 0 1 1 14.8 2.1Z"/></svg>
                  <span>WhatsApp: +92 340 3157876</span>
                </a>
                <a href="mailto:hello@etherealwebagency.com">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                  <span>hello@etherealwebagency.com</span>
                </a>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" type="text" placeholder="Jordan Blake" required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="jordan@company.com" required />
              </div>
              <div className="field">
                <label htmlFor="service">Service needed</label>
                <select id="service">
                  <option>Next.js Website</option>
                  <option>Salesforce Solution</option>
                  <option>UI/UX Design</option>
                  <option>Graphics &amp; Logo</option>
                  <option>Full Website Build</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="message">Project details</label>
                <textarea id="message" placeholder="Tell us a bit about what you're building..." />
              </div>
              <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center' }}>Request a quote</button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer leather">
        <div className="wrap">
          <div className="footer-row">
            <div className="logo-mark">
              <img src="/images/logo.png" alt="Ethereal Web Agency" />
              <span>ETHEREAL</span>
            </div>
            <ul className="footer-links">
              <li><a href="#portfolio">Portfolio</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="copyright">© 2026 Ethereal Web Agency. All rights reserved.</div>
        </div>
      </footer>

      {/* ============ WHATSAPP FLOAT ============ */}
      <a className="wa-float" href="https://wa.me/923403157876" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
        <span className="wa-pulse"></span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3Z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.9 15.9a8.4 8.4 0 0 1-11.9.7l-.3-.3-3.1.8.8-3-.3-.3a8.4 8.4 0 1 1 14.8 2.1Z"/></svg>
      </a>
    </>
  );
}
