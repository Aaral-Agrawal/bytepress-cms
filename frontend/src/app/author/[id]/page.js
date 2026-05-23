 

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthorById } from '@/lib/api';
import { buildAuthorMetadata } from '@/lib/seo';
import BlogCard from '@/components/blog/BlogCard';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function nameToSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const AUTHOR_BG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
];

// ── Dynamic metadata ──────────────────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const data = await getAuthorById(params.id);
    if (!data) return { title: 'Author Not Found' };
    return buildAuthorMetadata(data.author);
  } catch {
    return { title: 'Author' };
  }
}

// ── Page ──────────────────────────────────────────────────────────
export default async function AuthorPage({ params }) {
  let author, blogs;

  try {
    const data = await getAuthorById(params.id);
    if (!data) notFound();
    author = data.author;
    blogs  = data.blogs;
  } catch {
    notFound();
  }

  const initials  = getInitials(author.name);
  // Pick a consistent color based on first letter
  const colorClass = AUTHOR_BG_COLORS[author.name.charCodeAt(0) % 4];

  return (
    <main className="min-h-screen">
      {/* ── Author Header ───────────────────────────────── */}
      <section className="bg-gradient-to-br from-white via-white to-emerald-50/60
        py-20 px-4 sm:px-6 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{author.name}</span>
          </nav>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Avatar — initials (no avatar in User model) */}
            <div className={`w-24 h-24 rounded-full ${colorClass} flex items-center
              justify-center text-3xl font-black flex-shrink-0 ring-4 ring-white shadow-md`}
              style={{ fontFamily: 'var(--font-display)' }}>
              {initials}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700
                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-emerald-100">
                ✦ Author
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}>
                {author.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="text-sm text-blue-600 font-semibold capitalize">
                  {author.role || 'Author'}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-500">
                  {author.postCount} {author.postCount === 1 ? 'article' : 'articles'} published
                </span>
              </div>
              {/* bio not in User model — omit gracefully */}
              {author.bio && (
                <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-2xl">
                  {author.bio}
                </p>
              )}

              {/* Social links */}
              {author.social && (
                <div className="flex gap-3 mt-5 flex-wrap">
                  {author.social.twitter && (
                    <a
                      href={`https://twitter.com/${author.social.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      Twitter
                    </a>
                  )}

                  {author.social.github && (
                    <a
                      href={`https://github.com/${author.social.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      GitHub
                    </a>
                  )}

                  {author.social.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${author.social.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-700 transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Articles Grid ────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6" aria-labelledby="author-posts-heading">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-10">
            <p className="section-tag">✦ Articles</p>
            <h2 id="author-posts-heading" className="section-title">
              All articles by {author.name}
            </h2>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">✍️</div>
              <h2 className="text-2xl font-black text-gray-900 mb-3"
                style={{ fontFamily: 'var(--font-display)' }}>
                No articles yet
              </h2>
              <p className="text-gray-500 mb-8">
                {author.name} hasn&apos;t published any articles yet.
              </p>
              <Link href="/" className="btn-primary">Browse All Articles</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}