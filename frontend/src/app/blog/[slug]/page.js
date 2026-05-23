 

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/api';
import { buildBlogMetadata, buildArticleJsonLd, buildFaqJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import BlogCard from '@/components/blog/BlogCard';
import TableOfContents from '@/components/blog/TableOfContents';
import FaqSection      from '@/components/blog/FaqSection';

// ── Dynamic metadata ──────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  try {
    const blog = await getBlogBySlug(slug);
    return buildBlogMetadata(blog);
  } catch {
    return { title: 'Blog Not Found' };
  }
}

// Helper: convert display name to URL slug
function nameToSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function addHeadingIds(html = '') {
  return html.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (_, level, attrs, text) => {
      const plainText = text.replace(/<[^>]+>/g, '');

      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      return `<h${level} id="${id}"${attrs}>${text}</h${level}>`;
    }
  );
}

// Helper: format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Helper: estimated read time from content
function readTime(content = '') {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Page ──────────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  console.log("SLUG RECEIVED:", slug);

  let blog, relatedBlogs;

  try {
    blog = await getBlogBySlug(slug);
    console.log("BLOG DATA:", blog);
    if (!blog) notFound();
    relatedBlogs = await getRelatedBlogs(blog, 3);
  } catch {
    notFound();
  }

  // JSON-LD structured data
  const articleJsonLd   = buildArticleJsonLd(blog);
  const faqJsonLd       = buildFaqJsonLd(blog.faq);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: blog.categories?.[0] || 'Blog', url: blog.categories?.[0] ? `/category/${nameToSlug(blog.categories[0])}` : '/' },
    { name: blog.title, url: `/blog/${blog.slug}` },
  ]);

  const authorName = blog.author?.name || 'Unknown Author';
  const authorId = blog.author?._id || '';
  const publishedDate = formatDate(blog.publishedAt);
  const estimatedReadTime = readTime(blog.content);
  const authorInitials = authorName
    .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'AU';

  return (
    <>
      {/* ── JSON-LD Scripts ─────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Hero / Feature Image ─────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 min-h-[380px]
        flex items-end overflow-hidden">
        {blog.featureImage && (
          <img
            src={blog.featureImage}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 pb-12 pt-24">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            {blog.categories?.[0] && (
              <>
                <Link href={`/category/${nameToSlug(blog.categories[0])}`}
                  className="hover:text-white transition-colors">
                  {blog.categories[0]}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-300 truncate max-w-[200px]">{blog.title}</span>
          </nav>

          {/* Category + reading time badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories?.map((cat) => (
              <Link key={cat} href={`/category/${nameToSlug(cat)}`}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full
                  hover:bg-blue-500 transition-colors uppercase tracking-wide">
                {cat}
              </Link>
            ))}
            <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
              {estimatedReadTime} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight
            max-w-4xl mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            {blog.title}
          </h1>

          {/* Author row */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center
              justify-center text-sm font-black text-white flex-shrink-0">
              {authorInitials}
            </div>
            <div>
              <Link href={`/author/${authorId}`}
                className="text-white font-semibold text-sm hover:text-blue-300 transition-colors">
                {authorName}
              </Link>
              <div className="text-gray-400 text-xs mt-0.5">
                {blog.author?.role || 'Author'} · {publishedDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content grid ─────────────────────────────────── */}
      <main id="main-content" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* ── LEFT: Article body ─────────────────────────────── */}
          <article>
            {/* Description / intro */}
            {blog.description && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 pb-8
                border-b border-gray-100 font-medium">
                {blog.description}
              </p>
            )}

            {/* Table of Contents (client component — reads rendered DOM headings) */}
            <TableOfContents content={blog.content} />

            {/* Blog content — rendered HTML from CMS */}
            <div
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-black prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5
                prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto
                prose-img:rounded-2xl prose-img:shadow-md prose-img:w-full
                prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50
                prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl"
              dangerouslySetInnerHTML={{ __html: addHeadingIds(blog.content) }}
            />

            {/* ── Tags ─────────────────────────────────────── */}
            {blog.tags?.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <Link key={tag} href={`/tag/${nameToSlug(tag)}`}
                      className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm
                        font-medium hover:bg-blue-600 hover:text-white transition-all duration-200">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Internal Links ────────────────────────────── */}
            {blog.internalLinks?.length > 0 && (
              <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">🔗</span> Related Reading
                </h3>
                <ul className="space-y-2">
                  {blog.internalLinks.map((link, i) => (
                    <li key={i}>
                      <Link href={link}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium
                          hover:underline flex items-center gap-1">
                        <span className="text-blue-400">→</span> {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── External Links ────────────────────────────── */}
            {blog.externalLinks?.length > 0 && (
              <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🌐</span> External Resources
                </h3>
                <ul className="space-y-2">
                  {blog.externalLinks.map((link, i) => (
                    <li key={i}>
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="text-gray-600 hover:text-blue-600 text-sm font-medium
                          hover:underline flex items-center gap-1">
                        <span className="text-gray-400">↗</span> {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── FAQ Section ───────────────────────────────── */}
            {blog.faq?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  Frequently Asked Questions
                </h2>
                <FaqSection faqs={blog.faq} />
              </div>
            )}

            {/* ── Author card ───────────────────────────────── */}
            <div className="mt-12 p-6 bg-white border border-gray-100 rounded-2xl
              shadow-sm flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700
                flex items-center justify-center text-xl font-black flex-shrink-0"
                style={{ fontFamily: 'var(--font-display)' }}>
                {authorInitials}
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                  Written by
                </p>
                <Link href={`/author/${blog.author?._id}`}
                  className="text-lg font-black text-gray-900 hover:text-blue-600
                    transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                  {blog.author?.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {blog.author?.role || 'Author'}
                </p>
              </div>
            </div>
          </article>

          {/* ── RIGHT: Sidebar ─────────────────────────────────── */}
          <aside className="space-y-6">

            {/* Sticky TOC for desktop */}
            <div className="sticky top-6 space-y-6">

              {/* Share box */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-4">Share this article</h3>
                <div className="flex gap-2">
                  {[
                    { label: 'Twitter', color: 'bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white', icon: '𝕏' },
                    { label: 'LinkedIn', color: 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white', icon: 'in' },
                    { label: 'Copy', color: 'bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white', icon: '🔗' },
                  ].map((s) => (
                    <button key={s.label}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${s.color}`}>
                      {s.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {blog.categories?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.categories.map((cat) => (
                      <Link key={cat} href={`/category/${nameToSlug(cat)}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs
                          font-semibold hover:bg-blue-600 hover:text-white transition-all duration-200">
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Article Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Published</span>
                    <span className="font-medium text-gray-700">{publishedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Read time</span>
                    <span className="font-medium text-gray-700">{estimatedReadTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Author</span>
                    <Link href={`/author/${authorId}`}
                      className="font-medium text-blue-600 hover:underline truncate max-w-[120px]">
                      {authorName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related Blogs ─────────────────────────────────────── */}
        {relatedBlogs?.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-100">
            <div className="text-center mb-10">
              <p className="section-tag">✦ Related</p>
              <h2 className="section-title">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <BlogCard key={b._id} blog={b} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}