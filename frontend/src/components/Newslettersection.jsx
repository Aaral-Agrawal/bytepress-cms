'use client';
 
import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/api';

export default function NewsletterSection() {
  const [newsletter, setNewsletter] = useState('');
  const [nlStatus,   setNlStatus]   = useState('idle');

  async function handleSubscribe(e) {
    e.preventDefault();
    const trimmed = newsletter.trim();
    if (!trimmed.includes('@')) return;
    setNlStatus('loading');
    try {
      await subscribeNewsletter(trimmed);
      setNlStatus('success');
      setNewsletter('');
    } catch {
      setNlStatus('error');
    } finally {
      setTimeout(() => setNlStatus('idle'), 3500);
    }
  }

  return (
    <section id="newsletter" className="py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl
          p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />

          <p className="text-xs font-bold uppercase tracking-[0.1em] text-blue-200 mb-3 relative z-10">
            ✦ Newsletter
          </p>
          <h2 className="text-4xl font-black text-white mb-3 relative z-10"
            style={{ fontFamily: 'var(--font-display)' }}>
            Stay in the Loop
          </h2>
          <p className="text-blue-100 text-lg mb-8 relative z-10">
            Get the best tech articles delivered to your inbox every week. No spam, ever.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="flex gap-3 max-w-lg mx-auto relative z-10 flex-col sm:flex-row"
          >
            <input
              type="email"
              value={newsletter}
              onChange={(e) => setNewsletter(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 bg-white/15 border border-white/25 rounded-2xl
                px-5 py-3.5 text-white placeholder-blue-200 outline-none text-[15px]
                focus:bg-white/20 focus:ring-4 focus:ring-white/20 transition-all"
            />
            <button
              type="submit"
              disabled={nlStatus === 'loading' || nlStatus === 'success'}
              className="bg-white text-blue-600 font-bold px-7 py-3.5 rounded-2xl
                hover:bg-blue-50 transition-all duration-200 hover:-translate-y-0.5
                hover:shadow-lg disabled:opacity-70 flex-shrink-0"
            >
              {nlStatus === 'loading' ? 'Subscribing…'
                : nlStatus === 'success' ? '🎉 Subscribed!'
                : nlStatus === 'error'   ? 'Try again'
                : 'Subscribe →'}
            </button>
          </form>
          <p className="text-blue-300 text-xs mt-4 relative z-10">
            Join 32,000+ developers. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}