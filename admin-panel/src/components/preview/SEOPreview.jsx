import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Share2, Twitter, Link, CheckCircle, AlertCircle, Info } from 'lucide-react'

const SEOScore = ({ title, description, slug }) => {
  const checks = [
    {
      label: 'Meta title length',
      ok: title?.length >= 30 && title?.length <= 70,
      detail: title ? `${title.length} chars (ideal: 30–70)` : 'Missing',
    },
    {
      label: 'Meta description length',
      ok: description?.length >= 80 && description?.length <= 160,
      detail: description ? `${description.length} chars (ideal: 80–160)` : 'Missing',
    },
    {
      label: 'URL slug',
      ok: Boolean(slug && slug.length > 0),
      detail: slug ? `/${slug}` : 'Not set',
    },
    {
      label: 'Keyword in title',
      ok: Boolean(title?.length > 0),
      detail: title ? 'Present' : 'Missing title',
    },
  ]

  const passed = checks.filter((c) => c.ok).length
  const score = Math.round((passed / checks.length) * 100)
  const color = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'
  const bgColor = score >= 75 ? 'bg-emerald-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className={`rounded-xl p-4 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-ink-700">SEO Score</span>
        <span className={`text-lg font-bold ${color}`}>{score}%</span>
      </div>
      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-2">
            {c.ok
              ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
            }
            <div className="min-w-0">
              <span className="text-xs text-ink-700 font-medium">{c.label}</span>
              <span className="text-[10px] text-ink-400 ml-1.5">{c.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SEOPreview = ({ blog, siteUrl = 'http://localhost:3000' }) => {
  const [tab, setTab] = useState('google') // 'google' | 'og' | 'twitter'

  if (!blog) return null

  const {
    title = '', metaTitle, metaDescription, slug = '',
    featureImage, ogImage, author, categories = [],
  } = blog

  const displayTitle = metaTitle || title || 'Untitled Post'
  const displayDesc = metaDescription || blog.excerpt || 'No description provided.'
  const displayUrl = `${siteUrl}/blog/${slug}`
  const displayImage = ogImage || featureImage

  const TABS = [
    { id: 'google', label: 'Google', icon: Search },
    { id: 'og', label: 'Open Graph', icon: Share2 },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-100">
        <div className="w-7 h-7 bg-sky-50 rounded-lg flex items-center justify-center">
          <Search size={14} className="text-sky-600" />
        </div>
        <h3 className="text-sm font-semibold text-ink-800">SEO Preview</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* SEO Score */}
        <SEOScore title={displayTitle} description={displayDesc} slug={slug} />

        {/* Tab bar */}
        <div className="flex gap-1 bg-ink-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium
                          rounded-lg transition-all
                          ${tab === id
                            ? 'bg-white text-ink-800 shadow-sm'
                            : 'text-ink-500 hover:text-ink-700'
                          }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Google preview */}
        {tab === 'google' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border border-ink-100 rounded-xl bg-white"
          >
            <p className="text-[11px] text-ink-400 mb-2 font-medium uppercase tracking-wide">Google SERP</p>
            <div className="space-y-1">
              <p className="text-[11px] text-ink-400 truncate">{displayUrl}</p>
              <p className="text-base text-blue-700 hover:underline cursor-pointer line-clamp-1 font-medium">
                {displayTitle}
              </p>
              <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                {displayDesc}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-ink-100 flex items-center gap-2">
              <Link size={11} className="text-ink-400" />
              <span className="text-[10px] text-ink-400 font-mono truncate">{displayUrl}</span>
            </div>
          </motion.div>
        )}

        {/* OG preview */}
        {tab === 'og' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-ink-100 rounded-xl overflow-hidden"
          >
            <p className="text-[11px] text-ink-400 px-4 pt-3 pb-2 font-medium uppercase tracking-wide border-b border-ink-100">
              Open Graph Card
            </p>
            {displayImage ? (
              <img src={displayImage} alt="" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-ink-100 flex items-center justify-center">
                <span className="text-xs text-ink-400">No OG image set</span>
              </div>
            )}
            <div className="p-4">
              <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">
                {new URL(siteUrl).hostname}
              </p>
              <p className="text-sm font-semibold text-ink-800 line-clamp-1">{displayTitle}</p>
              <p className="text-xs text-ink-500 mt-1 line-clamp-2">{displayDesc}</p>
            </div>
          </motion.div>
        )}

        {/* Twitter card */}
        {tab === 'twitter' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-ink-100 rounded-2xl overflow-hidden"
          >
            <p className="text-[11px] text-ink-400 px-4 pt-3 pb-2 font-medium uppercase tracking-wide border-b border-ink-100">
              Twitter Card
            </p>
            {displayImage ? (
              <img src={displayImage} alt="" className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-ink-100 flex items-center justify-center">
                <span className="text-xs text-ink-400">No Twitter card image</span>
              </div>
            )}
            <div className="p-4 space-y-1">
              <p className="text-sm font-semibold text-ink-800 line-clamp-1">{displayTitle}</p>
              <p className="text-xs text-ink-500 line-clamp-2">{displayDesc}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Link size={11} className="text-ink-400" />
                <span className="text-[10px] text-ink-400">{new URL(siteUrl).hostname}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Canonical URL */}
        <div className="flex items-start gap-2.5 p-3.5 bg-ink-50 rounded-xl">
          <Info size={13} className="text-ink-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-ink-600 mb-0.5">Canonical URL</p>
            <p className="text-[11px] text-ink-500 font-mono truncate">{displayUrl}</p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default SEOPreview