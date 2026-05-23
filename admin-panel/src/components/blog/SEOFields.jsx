import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, AlertCircle, CheckCircle, Twitter, Globe } from 'lucide-react'

 
const SEO_LIMITS = {
  metaTitle: { min: 30, max: 60, label: 'Meta Title' },
  metaDescription: { min: 120, max: 160, label: 'Meta Description' },
  ogTitle: { max: 95, label: 'OG Title' },
  ogDescription: { max: 200, label: 'OG Description' },
  twitterTitle: { max: 70, label: 'Twitter Title' },
  twitterDescription: { max: 200, label: 'Twitter Description' },
}

const CharCounter = ({ value = '', min, max }) => {
  const len = value.length
  const pct = Math.min(len / max, 1)
  const isGood = len >= (min || 0) && len <= max
  const isOver = len > max
  const isLow = min && len > 0 && len < min

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-ink-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOver ? 'bg-red-400' : isGood ? 'bg-emerald-400' : isLow ? 'bg-amber-400' : 'bg-ink-300'
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className={`text-xs tabular-nums font-medium ${
        isOver ? 'text-red-500' : isGood ? 'text-emerald-600' : 'text-ink-400'
      }`}>
        {len}/{max}
      </span>
      {isOver && <AlertCircle size={12} className="text-red-400 flex-shrink-0" />}
      {isGood && len > 0 && <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />}
    </div>
  )
}

const SEOInput = ({ label, field, value = '', onChange, placeholder, multiline, limits }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-ink-600">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-800
                   placeholder-ink-400 bg-white outline-none focus:border-ink-400
                   focus:ring-2 focus:ring-ink-100 transition-all duration-200 resize-none"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-800
                   placeholder-ink-400 bg-white outline-none focus:border-ink-400
                   focus:ring-2 focus:ring-ink-100 transition-all duration-200"
      />
    )}
    {limits && <CharCounter value={value} min={limits.min} max={limits.max} />}
  </div>
)

const Section = ({ icon: Icon, title, color, children }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className="border border-ink-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-ink-50/50 hover:bg-ink-50
                   transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${color} rounded-lg flex items-center justify-center`}>
            <Icon size={13} />
          </div>
          <span className="text-sm font-semibold text-ink-700">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-ink-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SEOFields = ({ values = {}, onChange, className = '' }) => {
  const seoScore = () => {
    let score = 0
    if (values.metaTitle?.length >= 30 && values.metaTitle?.length <= 60) score++
    if (values.metaDescription?.length >= 120 && values.metaDescription?.length <= 160) score++
    if (values.canonicalUrl) score++
    if (values.ogTitle) score++
    if (values.ogDescription) score++
    if (values.ogImage) score++
    return Math.round((score / 6) * 100)
  }

  const score = seoScore()
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'
  const scoreBg = score >= 80 ? 'bg-emerald-100' : score >= 50 ? 'bg-amber-50' : 'bg-red-50'

  return (
    <div className={`space-y-3 ${className}`}>
      {/* SEO Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
            <Search size={13} className="text-blue-600" />
          </div>
          <label className="text-sm font-medium text-ink-700">SEO Settings</label>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 ${scoreBg} rounded-full`}>
          <div className={`text-xs font-bold ${scoreColor}`}>SEO {score}%</div>
        </div>
      </div>

      {/* Core SEO */}
      <Section icon={Search} title="Core SEO" color="bg-blue-50 text-blue-600">
        <SEOInput
          label="Meta Title"
          field="metaTitle"
          value={values.metaTitle}
          onChange={onChange}
          placeholder="Enter meta title (30–60 chars recommended)…"
          limits={SEO_LIMITS.metaTitle}
        />
        <SEOInput
          label="Meta Description"
          field="metaDescription"
          value={values.metaDescription}
          onChange={onChange}
          placeholder="Enter meta description (120–160 chars recommended)…"
          multiline
          limits={SEO_LIMITS.metaDescription}
        />
        <SEOInput
          label="Canonical URL"
          field="canonicalUrl"
          value={values.canonicalUrl}
          onChange={onChange}
          placeholder="https://yourdomain.com/blog/your-slug"
        />
      </Section>

      {/* OpenGraph */}
      <Section icon={Globe} title="Open Graph (Facebook / LinkedIn)" color="bg-indigo-50 text-indigo-600">
        <SEOInput
          label="OG Title"
          field="ogTitle"
          value={values.ogTitle}
          onChange={onChange}
          placeholder="Title shown when shared on social media…"
          limits={SEO_LIMITS.ogTitle}
        />
        <SEOInput
          label="OG Description"
          field="ogDescription"
          value={values.ogDescription}
          onChange={onChange}
          placeholder="Description shown when shared on social media…"
          multiline
          limits={SEO_LIMITS.ogDescription}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-600">OG Image URL</label>
          <input
            type="text"
            value={values.ogImage || ''}
            onChange={(e) => onChange('ogImage', e.target.value)}
            placeholder="https://yourdomain.com/og-image.jpg (1200×630px)"
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-800
                       placeholder-ink-400 bg-white outline-none focus:border-ink-400
                       focus:ring-2 focus:ring-ink-100 transition-all duration-200"
          />
          <p className="text-xs text-ink-400">Recommended: 1200×630px for best social preview</p>
        </div>
      </Section>

      {/* Twitter / X */}
      <Section icon={Twitter} title="Twitter / X Card" color="bg-sky-50 text-sky-600">
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-600">Card Type</label>
          <select
            value={values.twitterCard || 'summary_large_image'}
            onChange={(e) => onChange('twitterCard', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-800
                       bg-white outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100
                       transition-all duration-200"
          >
            <option value="summary_large_image">Summary — Large Image</option>
            <option value="summary">Summary</option>
            <option value="app">App</option>
            <option value="player">Player</option>
          </select>
        </div>
        <SEOInput
          label="Twitter Title"
          field="twitterTitle"
          value={values.twitterTitle}
          onChange={onChange}
          placeholder="Title for Twitter/X card…"
          limits={SEO_LIMITS.twitterTitle}
        />
        <SEOInput
          label="Twitter Description"
          field="twitterDescription"
          value={values.twitterDescription}
          onChange={onChange}
          placeholder="Description for Twitter/X card…"
          multiline
          limits={SEO_LIMITS.twitterDescription}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-600">Twitter Image URL</label>
          <input
            type="text"
            value={values.twitterImage || ''}
            onChange={(e) => onChange('twitterImage', e.target.value)}
            placeholder="https://yourdomain.com/twitter-image.jpg"
            className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm text-ink-800
                       placeholder-ink-400 bg-white outline-none focus:border-ink-400
                       focus:ring-2 focus:ring-ink-100 transition-all duration-200"
          />
        </div>
      </Section>
    </div>
  )
}

export default SEOFields