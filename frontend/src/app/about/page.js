
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'About BytePress',
  description: 'BytePress is a production-grade blogging platform built for developers. Learn about our mission, technology stack, and why we built it.',
  url: '/about',
});

const TECH_STACK = [
  { icon: '🟢', name: 'Node.js + Express', desc: 'REST API backend with JWT auth and role-based access control' },
  { icon: '🍃', name: 'MongoDB + Mongoose', desc: 'Flexible document storage with auto-slug generation and SEO fields' },
  { icon: '⚛️', name: 'React.js',           desc: 'Admin panel with full blog management, review workflows, and RBAC' },
  { icon: '▲',  name: 'Next.js App Router', desc: 'SSR-first frontend with dynamic metadata, JSON-LD, and clean URLs' },
  { icon: '🎨', name: 'Tailwind CSS',        desc: 'Utility-first styling with custom design tokens and animations' },
  { icon: '🔐', name: 'JWT + Cookies',       desc: 'Secure auth with httpOnly cookies and role middleware' },
];

const ROLES = [
  { role: 'Superadmin', color: 'bg-red-50 text-red-700 border-red-100',    desc: 'Full platform control — publish, manage users, all operations.' },
  { role: 'Editor',     color: 'bg-orange-50 text-orange-700 border-orange-100', desc: 'Review and approve submissions, manage all content.' },
  { role: 'Author',     color: 'bg-blue-50 text-blue-700 border-blue-100', desc: 'Write, edit own blogs, submit for review.' },
  { role: 'Viewer',     color: 'bg-gray-50 text-gray-600 border-gray-100', desc: 'Read published articles only.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative py-24 px-4 sm:px-6 overflow-hidden
        bg-gradient-to-br from-white via-white to-blue-50/60 border-b border-gray-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_70%_50%,rgba(26,109,255,0.05),transparent)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700
            px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6
            border border-blue-100">
            ✦ About BytePress
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-gray-900
            leading-[1.08] tracking-tight mb-6 max-w-3xl"
            style={{ fontFamily: 'var(--font-display)' }}>
            Built by Developers,<br />
            <em className="not-italic text-blue-600">For Developers</em>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl">
            BytePress is a production-grade blog management system designed to demonstrate
            real-world full-stack architecture with SEO at its core.
          </p>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-tag">✦ Mission</p>
              <h2 className="section-title">Why We Built BytePress</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Most blog platforms sacrifice either developer experience or SEO performance.
                  BytePress proves you don&apos;t have to choose.
                </p>
                <p>
                  We set out to build a platform that treats SEO as a first-class citizen —
                  with structured data, canonical URLs, Open Graph tags, and server-side
                  rendering built into the architecture from day one, not bolted on later.
                </p>
                <p>
                  Every page on BytePress is a server component by default, ensuring
                  search engines receive fully-rendered HTML with complete metadata —
                  not a blank React shell waiting for JavaScript to hydrate.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '2,400+', label: 'Articles Published', icon: '📝' },
                { num: '180+',   label: 'Expert Authors',     icon: '✍️' },
                { num: '48',     label: 'Tech Categories',    icon: '🗂️' },
                { num: '320K',   label: 'Monthly Readers',    icon: '👥' },
              ].map(({ num, label, icon }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center card-hover">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-2xl font-black text-blue-600 mb-1"
                    style={{ fontFamily: 'var(--font-display)' }}>{num}</div>
                  <div className="text-xs text-gray-500 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50/70">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-tag">✦ Technology</p>
            <h2 className="section-title">Built With Modern Stack</h2>
            <p className="section-sub">
              A production-ready MERN + Next.js architecture designed for performance and SEO.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TECH_STACK.map(({ icon, name, desc }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6
                card-hover hover:border-blue-100">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}>{name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role System ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="section-tag">✦ Access Control</p>
            <h2 className="section-title">Role-Based Architecture</h2>
            <p className="section-sub">
              Four distinct roles with granular permissions ensuring content quality at scale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map(({ role, color, desc }) => (
              <div key={role} className="bg-white border border-gray-100 rounded-2xl p-6 card-hover">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                  border mb-4 ${color}`}>
                  {role}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50/70 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Start Reading Today
          </h2>
          <p className="text-gray-500 mb-8">
            Explore hundreds of in-depth articles written by expert engineers.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/" className="btn-primary">Browse Articles</Link>
            <Link href="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}