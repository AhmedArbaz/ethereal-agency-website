'use client';

import { useState } from 'react';
import Image from 'next/image';
import PlanExplorer from './PlanExplorer';
import ServicesGrid from './ServicesGrid';
import PortfolioGrid from './PortfolioGrid';
import Reveal from './Reveal';
import Magnetic from './Magnetic';
import CustomCursor from './CustomCursor';
import SmoothScroll from './SmoothScroll';
import HeroScene from './HeroScene';
import Tilt from './Tilt';
import logo from '../public/images/logo.png';

const EMPTY_FORM = { name: '', email: '', service: 'Next.js Website', message: '' };
const HERO_LINE = [
  { text: 'Web', em: false }, { text: 'builds', em: false }, { text: 'and', em: false },
  { text: 'CRM', em: false }, { text: 'systems,', em: false },
  { text: 'finished', em: true }, { text: 'like', em: true }, { text: 'a', em: true }, { text: 'craft,', em: true },
  { text: 'not', em: false }, { text: 'a', em: false }, { text: 'template', em: false },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [statusMsg, setStatusMsg] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setStatusMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setStatusMsg(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('sent');
      setStatusMsg("Thanks — we've got your details and will reply within a day.");
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      setStatusMsg('Could not reach the server. Please try again or use WhatsApp/email.');
    }
  }

  return (
    <>
      <SmoothScroll />
      <CustomCursor />

      {/* Ambient background layer, fixed behind the whole page */}
      <div className="bg-animated" aria-hidden="true"></div>

      {/* ============ NAV ============ */}
      <header>
        <nav className="wrap">
          <div className="logo-mark">
            <Image src={logo} alt="Ethereal Web Agency" width={44} height={44} />
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
          <button
            type="button"
            className={'nav-toggle' + (menuOpen ? ' open' : '')}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </nav>
        {menuOpen && (
          <div className="mobile-nav">
            <ul>
              <li><a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfolio</a></li>
              <li><a href="#services" onClick={() => setMenuOpen(false)}>Services</a></li>
              <li><a href="#process" onClick={() => setMenuOpen(false)}>Process</a></li>
              <li><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a></li>
              <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
              <li><a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>Get a Quote</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section className="leather hero">
        <HeroScene />
        <div className="wrap">
          <h1 className="hero-headline" aria-label={HERO_LINE.map((w) => w.text).join(' ')}>
            {HERO_LINE.map((w, i) => (
              <span key={i}>
                <span className="word-mask" style={{ transitionDelay: `${120 + i * 55}ms`, animationDelay: `${120 + i * 55}ms` }}>
                  <span className={'word' + (w.em ? ' word-em' : '')}>{w.text}</span>
                </span>
                {i < HERO_LINE.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <Reveal as="p" className="sub" delay={700}>
            Ethereal designs and develops Next.js websites, Salesforce systems, and brand visuals for businesses across the US and UK — from a single logo to a full production build.
          </Reveal>
          <Reveal className="actions" delay={800}>
            <Magnetic href="#pricing" className="btn btn-gold">See pricing</Magnetic>
            <Magnetic href="#services" className="btn btn-outline">Browse services</Magnetic>
          </Reveal>
          <Reveal as="div" className="markets" delay={900}>Serving clients across the United States &amp; United Kingdom</Reveal>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span></span></div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array(2).fill(0).map((_, i) => (
            <div className="marquee-set" key={i}>
              <span>Next.js Websites</span><span className="dot">●</span>
              <span>Salesforce Systems</span><span className="dot">●</span>
              <span>UI/UX Design</span><span className="dot">●</span>
              <span>Brand &amp; Logo</span><span className="dot">●</span>
              <span>Full Website Builds</span><span className="dot">●</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ PORTFOLIO ============ */}
      <section id="portfolio" className="leather">
        <div className="wrap">
          <div className="section-head">
            <Reveal as="span" className="kicker">Our work</Reveal>
            <Reveal as="h2" delay={80}>Projects we&apos;ve shipped</Reveal>
            <Reveal as="p" delay={160}>A look at recent builds across the disciplines we cover — filter by type, then click a project to see it up close.</Reveal>
          </div>
          <PortfolioGrid />
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="leather">
        <div className="wrap">
          <div className="section-head">
            <Reveal as="span" className="kicker">What we build</Reveal>
            <Reveal as="h2" delay={80}>Five disciplines, one studio</Reveal>
            <Reveal as="p" delay={160}>Every engagement is handled end-to-end — you don&apos;t need five different freelancers for a website, its backend, and its brand.</Reveal>
          </div>
        </div>
        <div className="wrap">
          <ServicesGrid />
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section id="process" className="leather stitch">
        <div className="wrap">
          <div className="section-head">
            <Reveal as="span" className="kicker">How it works</Reveal>
            <Reveal as="h2" delay={80}>Four steps from brief to launch</Reveal>
          </div>
          <div className="process-row">
            <Reveal className="process-step" delay={0}>
              <div className="num">1</div>
              <h3>Discovery</h3>
              <p>We scope your goals, audience, and must-have features in one short call or form.</p>
            </Reveal>
            <Reveal className="process-step" delay={100}>
              <div className="num">2</div>
              <h3>Design</h3>
              <p>Wireframes and a visual UI direction, shared for your feedback before any code is written.</p>
            </Reveal>
            <Reveal className="process-step" delay={200}>
              <div className="num">3</div>
              <h3>Development</h3>
              <p>The approved design gets built in Next.js, with Salesforce wired in where needed.</p>
            </Reveal>
            <Reveal className="process-step" delay={300}>
              <div className="num">4</div>
              <h3>Launch</h3>
              <p>Testing, handover, and support after the site goes live.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ PRICING / PLAN EXPLORER ============ */}
      <section id="pricing" className="leather">
        <div className="wrap">
          <div className="section-head">
            <Reveal as="span" className="kicker">Limited-time launch pricing</Reveal>
            <Reveal as="h2" delay={80}>Up to 59% off, built around scope, not guesswork</Reveal>
            <Reveal as="p" delay={160}>Pick a service, pick a plan type, and see today&apos;s discounted starting packages for US &amp; UK clients — every quote is refined after a quick discovery call.</Reveal>
          </div>
          <PlanExplorer />
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="leather stitch">
        <div className="wrap">
          <div className="about-grid">
            <Reveal>
              <span className="kicker">About Ethereal</span>
              <h2>One studio, built to handle the whole stack</h2>
              <p>Ethereal Web Agency exists because most businesses shouldn&apos;t need a designer, a developer, and a CRM specialist as three separate hires. We build the site, wire up the backend, and design the brand around it — one point of contact, one team accountable for the result.</p>
              <div className="stat-row">
                <div><strong>2</strong><span>Core stacks: Next.js &amp; Salesforce</span></div>
                <div><strong>US/UK</strong><span>Primary markets served</span></div>
              </div>
            </Reveal>
            <Reveal className="quote-box leather-accent stitch-box" delay={150}>
              <p>&quot;A website should look considered, not assembled. Every project starts with the brand, not a template.&quot;</p>
              <footer>— Ethereal Web Agency</footer>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="leather">
        <div className="wrap">
          <div className="contact-grid">
            <Reveal className="contact-info">
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
            </Reveal>
            <Reveal as="form" delay={150} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Jordan Blake"
                  required
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="jordan@company.com"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="service">Service needed</label>
                <select
                  id="service"
                  value={form.service}
                  onChange={(e) => updateField('service', e.target.value)}
                >
                  <option>Next.js Website</option>
                  <option>Salesforce Solution</option>
                  <option>UI/UX Design</option>
                  <option>Graphics &amp; Logo</option>
                  <option>Full Website Build</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="message">Project details</label>
                <textarea
                  id="message"
                  placeholder="Tell us a bit about what you're building..."
                  value={form.message}
                  onChange={(e) => updateField('message', e.target.value)}
                />
              </div>
              <Magnetic
                as="button"
                type="submit"
                className="btn btn-gold"
                style={{ justifyContent: 'center' }}
                disabled={status === 'sending'}
                strength={0.15}
              >
                {status === 'sending' ? 'Sending…' : 'Request a quote'}
              </Magnetic>
              {statusMsg && (
                <p className={'form-status form-status-' + status}>{statusMsg}</p>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer leather">
        <div className="wrap">
          <div className="footer-row">
            <div className="logo-mark">
              <Image src={logo} alt="Ethereal Web Agency" width={32} height={32} />
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
      <Magnetic
        as="a"
        className="wa-float"
        href="https://wa.me/923403157876"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        strength={0.25}
      >
        <span className="wa-pulse"></span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3Z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.9 15.9a8.4 8.4 0 0 1-11.9.7l-.3-.3-3.1.8.8-3-.3-.3a8.4 8.4 0 1 1 14.8 2.1Z"/></svg>
      </Magnetic>
    </>
  );
}
