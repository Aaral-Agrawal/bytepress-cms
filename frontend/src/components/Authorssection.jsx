 

import Link from 'next/link';

const AUTHOR_COLORS = [
  ['bg-blue-50',    'text-blue-700'],
  ['bg-emerald-50', 'text-emerald-700'],
  ['bg-violet-50',  'text-violet-700'],
  ['bg-orange-50',  'text-orange-700'],
];

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AuthorsSection({ authors = [] }) {
  return (
    <section id="authors" className="py-20 px-4 sm:px-6 bg-gray-50/70">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <p className="section-tag">✦ Authors</p>
          <h2 className="section-title">Meet Our Top Writers</h2>
          <p className="section-sub">
            Industry experts and passionate developers sharing what they know best.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {authors.map((author, i) => {
            const [bgClass, textClass] = AUTHOR_COLORS[i % 4];
            const initials = getInitials(author.name);
            return (
              <div
                key={author._id || author.name}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center
                  card-hover hover:border-blue-100"
              >
                {/* Avatar — initials fallback (User model has no avatar field) */}
                <div
                  className={`w-16 h-16 rounded-full ${bgClass} ${textClass}
                    flex items-center justify-center text-xl font-black mx-auto mb-4
                    ring-4 ring-white shadow-sm overflow-hidden`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {author.avatar
                    ? <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                    : initials
                  }
                </div>

                <h3 className="font-bold text-gray-900 text-[1rem] mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}>
                  {author.name}
                </h3>

                <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
                  {author.role || 'Author'}
                </p>

                {/* bio not in User model — show generic fallback */}
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                  {author.bio || 'Passionate writer sharing knowledge with the community.'}
                </p>

                {/* postCount computed by getAuthors() in api.js */}
                <div className="text-sm font-semibold text-gray-700 mb-4">
                  {author.postCount ?? '—'}
                  <span className="font-normal text-gray-400 ml-1">articles</span>
                </div>

                <Link
                  href={`/author/${author._id}`}
                  className="inline-block text-xs text-blue-600 font-medium
                    hover:underline transition-all"
                >
                  View Profile →
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/authors" className="btn-secondary">View All Authors →</Link>
        </div>
      </div>
    </section>
  );
}