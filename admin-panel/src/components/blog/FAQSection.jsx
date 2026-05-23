import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronDown, HelpCircle, GripVertical } from 'lucide-react'


const FAQSection = ({ faqs = [], onChange, className = '' }) => {
  const [expanded, setExpanded] = useState(null)

  const addFAQ = () => {
    const next = [...faqs, { question: '', answer: '' }]
    onChange(next)
    setExpanded(next.length - 1)
  }

  const removeFAQ = (index) => {
    const next = faqs.filter((_, i) => i !== index)
    onChange(next)
    if (expanded === index) setExpanded(null)
    else if (expanded > index) setExpanded(expanded - 1)
  }

  const updateFAQ = (index, field, value) => {
    const next = faqs.map((faq, i) =>
      i === index ? { ...faq, [field]: value } : faq
    )
    onChange(next)
  }

  const toggle = (index) => setExpanded(expanded === index ? null : index)

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
            <HelpCircle size={13} className="text-amber-600" />
          </div>
          <label className="text-sm font-medium text-ink-700">
            FAQ Section{' '}
            <span className="text-ink-400 font-normal">({faqs.length} Q&amp;A)</span>
          </label>
        </div>
        <button
          type="button"
          onClick={addFAQ}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                     text-ink-700 bg-ink-100 hover:bg-ink-200 rounded-lg transition-colors"
        >
          <Plus size={13} />
          Add FAQ
        </button>
      </div>

      {/* FAQ list */}
      <div className="space-y-2">
        <AnimatePresence>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border border-ink-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              {/* FAQ header row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <GripVertical size={14} className="text-ink-300 flex-shrink-0 cursor-grab" />

                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex-1 text-left flex items-center gap-3 min-w-0"
                >
                  <span className="text-xs font-semibold text-ink-400 flex-shrink-0 w-5">
                    Q{index + 1}
                  </span>
                  <span className={`text-sm truncate ${
                    faq.question ? 'text-ink-800 font-medium' : 'text-ink-400 italic'
                  }`}>
                    {faq.question || 'Untitled question…'}
                  </span>
                </button>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="p-1.5 text-ink-400 hover:text-red-500 hover:bg-red-50 rounded-lg
                               transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-50 rounded-lg
                               transition-colors"
                  >
                    <motion.div
                      animate={{ rotate: expanded === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </button>
                </div>
              </div>

              {/* Expanded editor */}
              <AnimatePresence>
                {expanded === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-ink-100 pt-3">
                      {/* Question */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                          placeholder="Enter your question here…"
                          className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm
                                     text-ink-800 placeholder-ink-400 bg-white outline-none
                                     focus:border-ink-400 focus:ring-2 focus:ring-ink-100
                                     transition-all duration-200"
                        />
                      </div>

                      {/* Answer */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                          placeholder="Provide a detailed answer…"
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm
                                     text-ink-800 placeholder-ink-400 bg-white outline-none
                                     focus:border-ink-400 focus:ring-2 focus:ring-ink-100
                                     transition-all duration-200 resize-y min-h-[80px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {faqs.length === 0 && (
          <div className="border border-dashed border-ink-200 rounded-xl py-8 text-center">
            <HelpCircle size={24} className="text-ink-300 mx-auto mb-2" />
            <p className="text-sm text-ink-400">No FAQs yet</p>
            <p className="text-xs text-ink-300 mt-1">
              FAQs improve SEO by targeting long-tail search queries
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FAQSection