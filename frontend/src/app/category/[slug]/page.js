 

import Link from 'next/link';
import { getBlogsByCategory } from '@/lib/api';
import { buildCategoryMetadata } from '@/lib/seo';
import BlogCard from '@/components/blog/BlogCard';

// ── Slug ↔ Name helpers ───────────────────────────────────────────
function nameToSlug(name = "") {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CAT_ICONS = {
  "artificial intelligence": "🤖",
  ai: "🤖",
  "web development": "🌐",
  devops: "⚙️",
  react: "⚛️",
  "node.js": "🟢",
  nodejs: "🟢",
  mongodb: "🍃",
  "next.js": "▲",
  nextjs: "▲",
  typescript: "🔷",
  javascript: "🟡",
  cloud: "☁️",
  "open source": "📦",
};
function getCatIcon(name = "") {
  return (
    CAT_ICONS[
      name.toLowerCase()
    ] || "📄"
  );
}

// ── Dynamic metadata ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}) {
  const name =
    decodeURIComponent(
      params.slug
    ).replace(/-/g, " ");

  return buildCategoryMetadata(
    name
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default async function CategoryPage({ params }) {
  const category = decodeURIComponent(params.slug);
  const categoryName =
    category.replace(/-/g, " ");

  const blogs = await getBlogsByCategory(categoryName).catch(() => []);

  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-white via-white to-blue-50/60
        py-20 px-4 sm:px-6 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-10">
            <nav
              aria-label="Breadcrumb"
              className="mb-6"
            >
              <ol className="flex items-center gap-2 text-sm text-gray-500">
                <li>
                  <Link
                    href="/"
                    className="hover:text-blue-600"
                  >
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link
                    href="/#categories"
                    className="hover:text-blue-600"
                  >
                    Categories
                  </Link>
                </li>
                <li>/</li>
                <li
                  aria-current="page"
                  className="text-gray-900 font-medium capitalize"
                >
                  {categoryName}
                </li>
              </ol>
            </nav>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">
                {getCatIcon(categoryName)}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-blue-100">
                  ✦ Category
                </div>

                <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {categoryName}
                </h1>

                <p className="text-gray-500 mt-1">
                  {blogs.length} article
                  {blogs.length !== 1 ? "s" : ""}{" "}
                  published
                </p>
              </div>
            </div>
          </header>
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
            /* ── Empty state ─────────────────────────── */
            <div className="text-center py-24">
              <div className="text-6xl mb-6">{getCatIcon(categoryName)}</div>
              <h2 className="text-2xl font-black text-gray-900 mb-3"
                style={{ fontFamily: 'var(--font-display)' }}>
                No articles yet
              </h2>
              <p className="text-gray-500 mb-8">
                No published articles in <strong>{categoryName}</strong> yet. Check back soon.
              </p>
              <Link href="/" className="btn-primary">Browse All Articles</Link>
            </div>
          )}
        </div>
      </section>

      {blogs.length > 0 && (
        <section className="mt-16 pt-10 px-4 sm:px-6 border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">
              Explore More Categories
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                "Web Development",
                "React",
                "Next.js",
                "AI",
                "MongoDB",
                "DevOps",
              ]
                .filter(
                  (c) =>
                    c.toLowerCase() !==
                    categoryName.toLowerCase()
                )
                .map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${nameToSlug(cat)}`}
                    className="
                      px-4 py-2
                      bg-white
                      border border-gray-100
                      rounded-full
                      text-sm font-medium
                      text-gray-500
                      hover:border-blue-300
                      hover:text-blue-600
                      hover:bg-blue-50
                      transition-all
                    "
                  >
                    {getCatIcon(cat)}{" "}
                    {cat}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}