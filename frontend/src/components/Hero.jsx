 

import Link from 'next/link';
import AnimatedCounters from './AnimatedCounter';

const FLOATING_CARDS = [
  {
    emoji: '🤖', tag: 'Artificial Intelligence',
    title: 'GPT-5 and the next era of language models',
    author: 'Aryan Mehta · 8 min',
    bg: 'bg-blue-50', pos: 'top-6 left-0 animate-float', w: 'w-[235px]',
  },
  {
    emoji: '🚀', tag: 'Full-Stack Development',
    title: 'MERN Stack in 2025: Complete production guide',
    author: 'Priya Sharma · 12 min',
    bg: 'bg-emerald-50',
    pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-3 z-10',
    w: 'w-[255px]', ring: true,
  },
  {
    emoji: '⚡', tag: 'Performance',
    title: 'Next.js 15 App Router deep dive',
    author: 'Dev Kumar · 6 min',
    bg: 'bg-violet-50', pos: 'bottom-10 right-0 animate-float-2', w: 'w-[215px]',
  },
];

export default function Hero({ stats = {} }) {
  const {
    publishedCount = 0,
    authorCount = 0,
    categoryCount = 0,
    readerCount = 0,
  } = stats;

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden
      bg-gradient-to-br from-white via-white to-blue-50/60 px-4 sm:px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(26,109,255,0.05),transparent)] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700
            px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6
            animate-fade-up border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI & Tech Blogging Platform
          </div>

          <h1
            className="text-[clamp(2.4rem,4.5vw,3.8rem)] font-black leading-[1.08]
              tracking-tight mb-5 animate-fade-up [animation-delay:0.1s]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ideas That<br />
            <em className="not-italic text-blue-600">Shape the</em><br />
            Digital World
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed max-w-[480px] mb-8
            animate-fade-up [animation-delay:0.2s]">
            Explore in-depth articles on technology, AI, programming, and startups —
            written by engineers building the future.
          </p>

          <div className="flex gap-3 flex-wrap animate-fade-up [animation-delay:0.3s]">
            <Link href="#featured" className="btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Explore Blogs
            </Link>
            <Link href="#latest" className="btn-secondary">Start Reading →</Link>
          </div>

          {/* Animated counters are client-only (useEffect animation) */}
          <AnimatedCounters
            blogsCount={publishedCount}
            authorsCount={authorCount}
            catsCount={categoryCount}
            readersCount={readerCount}
          />
        </div>

        {/* Right — floating preview cards (purely decorative, static) */}
        <div className="relative h-[460px] hidden lg:block">
          {FLOATING_CARDS.map((c) => (
            <div
              key={c.title}
              className={`absolute ${c.pos} ${c.w} bg-white rounded-2xl p-4
                shadow-[0_16px_48px_rgba(0,0,0,0.10)] border border-gray-100
                flex items-start gap-3 ${c.ring ? 'ring-2 ring-blue-100' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center
                justify-center text-xl flex-shrink-0`}>
                {c.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                  {c.tag}
                </div>
                <div className="text-[12.5px] font-semibold text-gray-900 leading-tight line-clamp-2">
                  {c.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-1.5">{c.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}