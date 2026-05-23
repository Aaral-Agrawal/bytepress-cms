 
import Link from 'next/link';

const CAT_ICONS = {
  'artificial intelligence': '🤖', 'ai': '🤖',
  'web development': '🌐', 'devops': '⚙️',
  'react': '⚛️', 'node.js': '🟢', 'nodejs': '🟢',
  'mongodb': '🍃', 'next.js': '▲', 'nextjs': '▲',
  'typescript': '🔷', 'javascript': '🟡', 'cloud': '☁️',
  'open source': '📦', 'security': '🛡️',
  'data science': '📊', 'career': '💼', 'programming': '💻',
};

function getCatIcon(name = '') {
  return CAT_ICONS[name.toLowerCase()] || '📄';
}

// Convert display name to URL slug: "Web Development" → "web-development"
function nameToSlug(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesSection({ categories = [], tags = [] }) {
  // tags is { name }[] from api.js
  const tagList = tags.map((t) => t.name);

  return (
    <section id="categories" className="py-20 px-4 sm:px-6 bg-gray-50/70">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <p className="section-tag">✦ Categories</p>
          <h2 className="section-title">Explore by Topic</h2>
          <p className="section-sub">Find articles across the technologies you care about most.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.name}
              href={`/category/${nameToSlug(cat.name)}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5
                text-center card-hover hover:border-blue-200 hover:bg-blue-600
                transition-all duration-300 overflow-hidden"
            >
              <span className="text-3xl mb-3 block transition-transform
                group-hover:scale-110 duration-300">
                {getCatIcon(cat.name)}
              </span>
              <div className="font-semibold text-[13px] text-gray-800 mb-1
                group-hover:text-white transition-colors line-clamp-1">
                {cat.name}
              </div>
              {cat.count !== undefined && (
                <div className="text-xs text-gray-400 group-hover:text-blue-100 transition-colors">
                  {cat.count} articles
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Tags carousel */}
        {tagList.length > 0 && (
          <div className="mt-10">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Trending Tags
            </p>
            <div className="overflow-hidden">
              <div className="flex gap-2.5 animate-tag-scroll w-max">
                {[...tagList, ...tagList].map((tag, i) => (
                  <Link
                    key={`${tag}-${i}`}
                    href={`/tag/${nameToSlug(tag)}`}
                    className="px-4 py-2 bg-white border border-gray-100 rounded-full
                      text-sm font-medium text-gray-500 whitespace-nowrap flex-shrink-0
                      hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50
                      transition-all duration-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}