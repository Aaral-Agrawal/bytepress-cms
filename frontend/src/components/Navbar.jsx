'use client';
 
 
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCategories, getTags } from '@/lib/api';
 
// ── Fallbacks shown while API loads or if it fails ────────────────
const FALLBACK_CATS = [
  { name: 'Artificial Intelligence' },
  { name: 'Web Development' },
  { name: 'DevOps' },
  { name: 'React' },
  { name: 'Node.js' },
  { name: 'MongoDB' },
];
 
const FALLBACK_TAGS = [
  { name: 'react' },
  { name: 'nodejs' },
  { name: 'mongodb' },
  { name: 'nextjs' },
  { name: 'typescript' },
  { name: 'docker' },
  { name: 'aws' },
  { name: 'tailwind' },
  { name: 'javascript' },
];
 
// ── Small helper: mobile nav link ────────────────────────────────
function MobileLink({ href, label, small = false }) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-xl font-medium text-gray-700
        hover:bg-blue-50 hover:text-blue-600 transition-colors
        ${small ? 'text-sm' : 'text-[15px]'}`}
    >
      {label}
    </Link>
  );
}
 
// ── Main component ────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen]       = useState(false);
  const [tagOpen, setTagOpen]       = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
 
  const router   = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef(null);
 
  // ── Scroll → solid navbar ──────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
 
  // ── Fetch categories & tags from backend ──────────────────────
  // api.js normalises both to { name: string } objects,
  // so no slug handling needed here.
  useEffect(() => {
    setLoading(true);
 
    Promise.allSettled([getCategories(), getTags()]).then(
      ([catResult, tagResult]) => {
        setCategories(
          catResult.status === 'fulfilled' && catResult.value?.length
            ? catResult.value
            : FALLBACK_CATS
        );
        setTags(
          tagResult.status === 'fulfilled' && tagResult.value?.length
            ? tagResult.value
            : FALLBACK_TAGS
        );
        setLoading(false);
      }
    );
  }, []);
 
  // ── Close mobile menu on route change ─────────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
 
  // ── Search submit ──────────────────────────────────────────────
  // No /blogs/search endpoint — push to /blog?search=... and let
  // the listing page call getPublishedBlogs({ search }) via api.js.
  function handleSearch(e) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/blog?search=${encodeURIComponent(q)}`);
    setSearch('');
    searchInputRef.current?.blur();
  }
 
  // ── Category nav URL ───────────────────────────────────────────
  // Backend route: GET /blogs/category/:category  (uses raw name)
  // Frontend listing catches ?category= and calls getBlogsByCategory()
  const categoryHref = (name) =>
    `/blog?category=${encodeURIComponent(name)}`;
 
  // ── Tag nav URL ────────────────────────────────────────────────
  // Backend route: GET /blogs/tag/:tag  (uses raw tag name)
  const tagHref = (name) =>
    `/blog?tag=${encodeURIComponent(name)}`;
 
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Navbar bar ─────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-md border-b border-transparent'
          }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[62px] flex items-center gap-6">
 
          {/* Logo */}
          <Link href="/" className="font-black text-[1.45rem] tracking-tight flex-shrink-0">
            <span className="text-blue-600">Byte</span>
            <span className="text-gray-900">Press</span>
          </Link>
 
          {/* ── Desktop links ──────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
 
            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button
                className="nav-link flex items-center gap-1 px-3 py-2 rounded-xl text-sm
                  font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Categories
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
 
              {catOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl
                    border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2 z-50
                    animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {loading
                    ? /* skeleton */
                      Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-8 mx-2 my-1 rounded-lg bg-gray-100 animate-pulse"
                        />
                      ))
                    : categories.slice(0, 9).map((cat) => (
                        <Link
                          key={cat.name}
                          href={categoryHref(cat.name)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl
                            text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <span>{cat.name}</span>
                          {/* count shown only if backend returns it */}
                          {cat.count !== undefined && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              {cat.count}
                            </span>
                          )}
                        </Link>
                      ))}
 
                  {/* View all */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      href="/blog"
                      className="flex items-center px-3 py-2 rounded-xl text-xs font-semibold
                        text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      View all blogs →
                    </Link>
                  </div>
                </div>
              )}
            </div>
 
            {/* Tags dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTagOpen(true)}
              onMouseLeave={() => setTagOpen(false)}
            >
              <button
                className="nav-link flex items-center gap-1 px-3 py-2 rounded-xl text-sm
                  font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Tags
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${tagOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
 
              {tagOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl
                    border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-3 z-50
                    animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {loading
                    ? /* skeleton */
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="h-6 w-16 rounded-full bg-gray-100 animate-pulse" />
                        ))}
                      </div>
                    : (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 18).map((tag) => (
                          <Link
                            key={tag.name}
                            href={tagHref(tag.name)}
                            className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200
                              text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50
                              transition-all duration-150"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
 
            <Link
              href="/authors"
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600
                hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Authors
            </Link>
 
            <Link
              href="/#newsletter"
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-600
                hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Newsletter
            </Link>
          </div>
 
          {/* ── Search bar ─────────────────────────────────── */}
          {/*
            No backend search endpoint exists.
            On submit we push to /blog?search=... and the blog listing page
            calls getPublishedBlogs({ search }) which filters client-side.
          */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200
              rounded-full px-4 py-2 transition-all duration-200 w-44 focus-within:w-56
              focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs…"
              className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
            />
          </form>
 
          {/* ── Login CTA ──────────────────────────────────── */}
          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-1.5 bg-gray-900 text-white
              text-sm font-semibold px-5 py-2 rounded-full hover:bg-blue-600
              transition-colors duration-200 flex-shrink-0"
          >
            Login
          </Link>
 
          {/* ── Hamburger ──────────────────────────────────── */}
          <button
            className="md:hidden ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all duration-300
                ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all duration-300
                ${mobileOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-gray-800 rounded transition-all duration-300
                ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>
        </div>
      </nav>
 
      {/* ── Mobile menu overlay ────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
 
        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl overflow-y-auto
            transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 pt-20 flex flex-col gap-1">
 
            <MobileLink href="/" label="Home" />
            <MobileLink href="/blog" label="All Blogs" />
 
            {/* Mobile categories */}
            <div className="py-2 border-t border-gray-100 mt-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">
                Categories
              </p>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 mx-3 mb-1 rounded-xl bg-gray-100 animate-pulse" />
                  ))
                : categories.slice(0, 7).map((cat) => (
                    <MobileLink
                      key={cat.name}
                      href={categoryHref(cat.name)}
                      label={cat.name}
                      small
                    />
                  ))}
            </div>
 
            {/* Mobile tags */}
            <div className="py-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">
                Tags
              </p>
              {!loading && (
                <div className="flex flex-wrap gap-1.5 px-3">
                  {tags.slice(0, 12).map((tag) => (
                    <Link
                      key={tag.name}
                      href={tagHref(tag.name)}
                      className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200
                        text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
 
            {/* Mobile quick links */}
            <div className="py-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">
                Quick Links
              </p>
              <MobileLink href="/authors"    label="Authors"    small />
              <MobileLink href="/#newsletter" label="Newsletter" small />
            </div>
 
            {/* Mobile search */}
            <form
              onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl
                px-4 py-2.5 mx-0 mt-2 focus-within:border-blue-400 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none"
                stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blogs…"
                className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
              />
            </form>
 
            {/* Mobile auth buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <Link
                href="/login"
                className="flex items-center justify-center w-full bg-gray-900 text-white
                  font-semibold py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center w-full border border-gray-200
                  text-gray-700 font-semibold py-3 rounded-xl hover:border-blue-300
                  hover:text-blue-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
 
      {/* Spacer so page content doesn't hide behind fixed navbar */}
      <div className="h-[62px]" />
    </>
  );
}
 