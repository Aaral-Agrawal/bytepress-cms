import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'

 
const extractHeadings = (html) => {
  if (!html) return []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3, h4')
  return Array.from(headings).map((el, i) => {
    const level = parseInt(el.tagName[1])
    const text = el.textContent.trim()
    const id = `heading-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`
    return { id, text, level }
  }).filter((h) => h.text.length > 0)
}

 
export const injectHeadingIds = (containerEl, headings) => {
  if (!containerEl) return
  const els = containerEl.querySelectorAll('h1, h2, h3, h4')
  els.forEach((el, i) => {
    if (headings[i]) el.id = headings[i].id
  })
}

const TableOfContents = ({ content, className = '' }) => {
  const [headings, setHeadings] = useState([])
  const [activeId, setActiveId] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const parsed = extractHeadings(content)
    setHeadings(parsed)
  }, [content])

 
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-10% 0% -85% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left
                   hover:bg-ink-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <List size={15} className="text-ink-500" />
          <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">
            Contents
          </span>
        </div>
        <span className="text-xs text-ink-400">{headings.length} sections</span>
      </button>

      {/* Items */}
      {!collapsed && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-3 pb-3 space-y-0.5"
        >
          {headings.map((h) => (
            <button
              key={h.id}
              onClick={() => scrollTo(h.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all
                          ${h.level === 1 ? 'pl-3' : h.level === 2 ? 'pl-5' : h.level === 3 ? 'pl-7' : 'pl-9'}
                          ${activeId === h.id
                            ? 'bg-ink-900 text-white font-medium'
                            : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
                          }`}
            >
              <span className="line-clamp-1">{h.text}</span>
            </button>
          ))}
        </motion.nav>
      )}
    </motion.aside>
  )
}

export { extractHeadings }
export default TableOfContents