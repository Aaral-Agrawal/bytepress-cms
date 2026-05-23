'use client';

import { useState } from 'react';
import Link from 'next/link';
import { subscribeNewsletter } from '@/lib/api';

 
const LINKS = {
  Platform: [
    { label: 'About Us',    href: '/about' },
    { label: 'Write for Us', href: '/write' },
    { label: 'Advertise',   href: '/advertise' },
    { label: 'Careers',     href: '/careers' },
    { label: 'Press Kit',   href: '/press' },
  ],
  Categories: [
    // href values must be the EXACT category string from your DB (no slugs)
    { label: 'Artificial Intelligence', href: '/blog?category=Artificial Intelligence' },
    { label: 'Web Development',         href: '/blog?category=Web Development' },
    { label: 'DevOps & Cloud',          href: '/blog?category=DevOps' },
    { label: 'Open Source',             href: '/blog?category=Open Source' },
    { label: 'Career Advice',           href: '/blog?category=Career Advice' },
  ],
  Legal: [
    { label: 'Privacy Policy',  href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy',   href: '/cookies' },
    { label: 'Accessibility',   href: '/accessibility' },
  ],
};

const SOCIALS = [
  { label: 'X (Twitter)', symbol: '𝕏',  href: 'https://twitter.com/bytepress' },
  { label: 'LinkedIn',    symbol: 'in', href: 'https://linkedin.com/company/bytepress' },
  { label: 'GitHub',      symbol: 'gh', href: 'https://github.com/bytepress' },
  { label: 'YouTube',     symbol: '▶',  href: 'https://youtube.com/@bytepress' },
];

export default function Footer() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  async function handleSubscribe(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@')) return;

    setStatus('loading');
    try {
      // POST /newsletter/subscribe — add this route to your backend if not done yet.
      // If the route doesn't exist yet, this will throw and show the error state.
      await subscribeNewsletter(trimmed);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3500);
    }
  }

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-8">

        {/* ── Top grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">

          {/* Brand + mini newsletter */}
          <div>
            <div className="text-2xl font-black mb-3">
              <span className="text-blue-500">Byte</span>
              <span className="text-white">Press</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              A modern platform for technology writers and readers. From AI to
              full-stack development — we cover ideas shaping tomorrow.
            </p>

            {/* Mini newsletter form */}
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2
                  text-sm text-white placeholder-gray-500 outline-none min-w-0
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                  px-4 py-2 rounded-xl transition-colors flex-shrink-0 disabled:opacity-60
                  disabled:cursor-not-allowed"
              >
                {status === 'loading' ? '…'
                  : status === 'success' ? '✓'
                  : 'Go'}
              </button>
            </form>

            {/* Status messages */}
            {status === 'success' && (
              <p className="text-xs text-green-400 mt-1.5">Subscribed successfully!</p>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-400 mt-1.5">
                Something went wrong — please try again.
              </p>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row
          items-center justify-between gap-4">

          <p className="text-xs text-gray-600 order-2 sm:order-1">
            © {new Date().getFullYear()} BytePress. All rights reserved.
          </p>

          <div className="flex gap-2 order-1 sm:order-2">
            {SOCIALS.map(({ label, symbol, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10
                  flex items-center justify-center text-sm text-gray-400
                  hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all"
              >
                {symbol}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}