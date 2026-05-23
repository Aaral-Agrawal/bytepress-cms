 
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogsByTag, getTags } from '@/lib/api';
import { buildTagMetadata } from '@/lib/seo';
import BlogCard from '@/components/blog/BlogCard';
import EmptyState from '@/components/ui/EmptyState';

function nameToSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Dynamic metadata ──────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const tags = await getTags().catch(() => []);
  const tagName = tags.find((t) => nameToSlug(t.name) === params.slug)?.name;
  if (!tagName) return { title: 'Tag Not Found' };
  return buildTagMetadata(tagName);
}

// ── Page ──────────────────────────────────────────────────────────
export default async function TagPage({ params }) {
  // Resolve slug → exact tag name
  const tags = await getTags().catch(() => []);
  const tagName = tags.find((t) => nameToSlug(t.name) === params.slug)?.name;

  if (!tagName) notFound();

  const blogs = await getBlogsByTag(tagName).catch(() => []);

  return (
    <main className="min-h-screen">
      {/* ── Header ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-white via-white to-violet-50/60
        py-20 px-4 sm:px-6 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <span aria-current="page" className="text-gray-900 font-medium">#{tagName}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center
              justify-center text-2xl font-black text-violet-600 flex-shrink-0"
              style={{ fontFamily: 'var(--font-display)' }}>
              #
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700
                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-violet-100">
                ✦ Tag
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}>
                #{tagName}
              </h1>
              <p className="text-gray-500 mt-1">
                {blogs.length} {blogs.length === 1 ? 'article' : 'articles'} tagged
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Grid ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="empty"
              title="No articles yet"
              message={`No published articles tagged #${tagName} yet.`}
            />
          )}
        </div>
      </section>

      {/* ── Other tags ─────────────────────────────────── */}
      {tags.length > 1 && (
        <section className="mt-16 pt-10 px-4 sm:px-6 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">
              Explore More Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter((t) => t.name !== tagName)
                .slice(0, 15)
                .map((t) => (
                  <Link
                    key={t.name}
                    href={`/tag/${nameToSlug(t.name)}`}
                    className="px-4 py-2 bg-white border border-gray-100 rounded-full
                      text-sm font-medium text-gray-500 hover:border-violet-300
                      hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
                  >
                    #{t.name}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}