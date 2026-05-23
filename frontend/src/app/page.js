 

import {
  buildMetadata,
  buildWebsiteJsonLd,
} from '@/lib/seo';
import {
  getFeaturedBlogs,
  getLatestBlogs,
  getPublishedBlogs,
  getCategories,
  getTags,
  getAuthors,
} from '@/lib/api';

// Home section components
import Hero             from '@/components/Hero';
import FeaturedBlogs    from '@/components/FeaturedBlog';
import CategoriesSection from '@/components/Categoriessection';
import LatestBlogs      from '@/components/LatestBlogs';
import SearchSection    from '@/components/SearchSection';
import NewsletterSection from '@/components/Newslettersection';
import AuthorsSection   from '@/components/Authorssection';
import JsonLd           from '@/components/ui/JsonLd';
import EmptyState       from '@/components/ui/EmptyState';

// ── Static metadata for homepage ─────────────────────────────────
export const metadata = buildMetadata({
  title: 'BytePress – Where Developers Share Ideas',
  description: 'Explore in-depth articles on AI, full-stack development, DevOps, and modern web technologies written by expert engineers.',
  url: '/',
});

// ── Mock fallbacks (used when API is unreachable) ─────────────────
const MOCK_BLOGS = [
  { _id: '1', title: 'Building Scalable MERN Apps in 2025', slug: 'mern-2025',
    description: 'Production-ready MERN apps with Docker, CI/CD, and microservice patterns.',
    tags: ['MERN', 'Node.js'], categories: ['Web Development'],
    author: { name: 'Aryan Mehta' }, publishedAt: '2025-12-12' },
  { _id: '2', title: 'React Server Components: Complete Guide', slug: 'rsc-guide',
    description: 'Deep dive into RSC, streaming, and the Next.js App Router.',
    tags: ['React', 'Next.js'], categories: ['React'],
    author: { name: 'Priya Sharma' }, publishedAt: '2025-12-10' },
  { _id: '3', title: 'GPT-4o and the Future of AI Assistants', slug: 'gpt4o',
    description: 'Exploring multimodal AI and how LLMs are reshaping software.',
    tags: ['AI', 'LLM'], categories: ['Artificial Intelligence'],
    author: { name: 'Dev Kumar' }, publishedAt: '2025-12-08' },
  { _id: '4', title: 'TypeScript 5.5 Hidden Gems', slug: 'ts-55',
    description: 'Powerful TypeScript 5.5 features most developers overlook.',
    tags: ['TypeScript'], categories: ['JavaScript'],
    author: { name: 'Sneha Roy' }, publishedAt: '2025-12-07' },
  { _id: '5', title: 'MongoDB Atlas Vector Search Deep Dive', slug: 'mongo-vector',
    description: 'Use MongoDB Atlas for semantic search in Node.js.',
    tags: ['MongoDB', 'AI'], categories: ['MongoDB'],
    author: { name: 'Raj Patel' }, publishedAt: '2025-12-06' },
  { _id: '6', title: 'Kubernetes for Full-Stack Developers', slug: 'k8s-fullstack',
    description: 'Deploy your MERN stack on Kubernetes with zero-downtime updates.',
    tags: ['DevOps', 'K8s'], categories: ['DevOps'],
    author: { name: 'Aryan Mehta' }, publishedAt: '2025-12-05' },
];
const MOCK_CATS = [
  { name: 'Artificial Intelligence' }, { name: 'Web Development' },
  { name: 'DevOps' }, { name: 'React' }, { name: 'Node.js' }, { name: 'MongoDB' },
  { name: 'Next.js' }, { name: 'TypeScript' }, { name: 'Cloud' }, { name: 'Open Source' },
];
const MOCK_TAGS = ['react','nodejs','mongodb','nextjs','typescript','ai','devops','docker'].map((t) => ({ name: t }));
const MOCK_AUTHORS = [
  { _id: 'a1', name: 'Aryan Mehta',  role: 'author', postCount: 42 },
  { _id: 'a2', name: 'Priya Sharma', role: 'author', postCount: 38 },
  { _id: 'a3', name: 'Dev Kumar',    role: 'author', postCount: 29 },
  { _id: 'a4', name: 'Sneha Roy',    role: 'author', postCount: 35 },
];

// ── Server-side data fetching ─────────────────────────────────────
async function getHomeData() {
  const [featResult, latResult, allResult, catResult, tagResult, authResult] =
    await Promise.allSettled([
      getFeaturedBlogs(10),
      getLatestBlogs(6),
      getPublishedBlogs(),   // passed to SearchSection for client-side filter
      getCategories(),
      getTags(),
      getAuthors(),
    ]);

  const allBlogsData =
    allResult.status === 'fulfilled'
      ? allResult.value
      : MOCK_BLOGS;

  const publishedCount =
    typeof allBlogsData?.totalBlogs === 'number'
      ? allBlogsData.totalBlogs
      : Array.isArray(allBlogsData)
      ? allBlogsData.length
      : Array.isArray(allBlogsData?.blogs)
      ? allBlogsData.blogs.length
      : 0;

  const publishedBlogs =
    Array.isArray(allBlogsData)
      ? allBlogsData
      : allBlogsData?.blogs || [];

  const totalViews = publishedBlogs.reduce(
    (sum, blog) => sum + (blog.views || 0),
    0
  );

  return {
    featured:
      featResult.status === 'fulfilled'
        ? featResult.value
        : MOCK_BLOGS.slice(0, 3),

    featuredError:
      featResult.status === 'rejected'
        ? featResult.reason?.message
        : null,

    latest:
      latResult.status === 'fulfilled'
        ? latResult.value
        : MOCK_BLOGS,

    allBlogs: allBlogsData,

    categories:
      catResult.status === 'fulfilled' &&
      catResult.value?.length
        ? catResult.value
        : MOCK_CATS,

    tags:
      tagResult.status === 'fulfilled' &&
      tagResult.value?.length
        ? tagResult.value
        : MOCK_TAGS,

    authors:
      authResult.status === 'fulfilled' &&
      authResult.value?.length
        ? authResult.value
        : MOCK_AUTHORS,

    stats: {
      publishedCount,
      authorCount: authResult.status === 'fulfilled' && authResult.value?.length
        ? authResult.value.length
        : MOCK_AUTHORS.length,
      categoryCount: catResult.status === 'fulfilled' && catResult.value?.length
        ? catResult.value.length
        : MOCK_CATS.length,
      readerCount: totalViews,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────
export default async function HomePage() {
  const {
    featured,
    featuredError,
    latest,
    allBlogs,
    categories,
    tags,
    authors,
    stats,
  } = await getHomeData();

  return (
    <>
      <JsonLd schemas={[buildWebsiteJsonLd()]} />
      {/* SERVER: Hero with static floating cards + AnimatedCounters (client) */}
      <Hero stats={stats} />

      {/* SERVER: Static stats bar */}
      <section className="bg-gray-50 border-y border-gray-100 py-10 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4
          bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {[
            { num: stats.publishedCount || 0, label: 'Articles Published' },
            { num: stats.authorCount || 0,    label: 'Expert Authors'     },
            { num: stats.categoryCount || 0,  label: 'Tech Categories'    },
            { num: stats.readerCount || 0,    label: 'Monthly Readers'    },
          ].map(({ num, label }, i) => (
            <div
              key={label}
              className={`p-8 text-center ${i < 3 ? 'border-b md:border-b-0 md:border-r border-gray-100' : ''}`}
            >
              <div className="text-3xl font-black text-blue-600 mb-1.5"
                style={{ fontFamily: 'var(--font-display)' }}>
                {num}
              </div>
              <div className="text-sm text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVER: Featured blogs (SSR data) */}
      <section
        aria-labelledby="featured-heading"
        className="py-16 px-4"
      >
        <div className="max-w-[1200px] mx-auto">
          <h2
            id="featured-heading"
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            Featured Articles
          </h2>

          {featuredError ? (
            <EmptyState
              type="error"
              title="Couldn't load featured blogs"
              message={featuredError}
            />
          ) : !featured?.length ? (
            <EmptyState
              type="empty"
              title="No featured blogs yet"
            />
          ) : (
            <FeaturedBlogs blogs={featured} />
          )}
        </div>
      </section>

      {/* SERVER: Categories + tag carousel (SSR data) */}
      <CategoriesSection categories={categories} tags={tags} />

      {/* SERVER wrapper + CLIENT load-more (SSR initial data) */}
      <section
        aria-labelledby="latest-heading"
        className="py-16 px-4 bg-gray-50"
      >
        <div className="max-w-[1200px] mx-auto">
          <h2
            id="latest-heading"
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            Latest Articles
          </h2>

          <LatestBlogs
            blogs={latest}
          />
        </div>
      </section>

      {/* CLIENT: Search filters allBlogs in-browser (SSR data passed as prop) */}
      <SearchSection
        allBlogs={
          allBlogs?.blogs || allBlogs
        }
      />

      {/* CLIENT: Newsletter form */}
      <NewsletterSection />

      {/* SERVER: Authors grid (SSR data) */}
      <AuthorsSection authors={authors} />
    </>
  );
}