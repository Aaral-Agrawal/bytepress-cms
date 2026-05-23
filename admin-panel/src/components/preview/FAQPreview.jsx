import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'

 
const parseFAQ = (content) => {
  if (!content) return []

  
  const lines = content.replace(/<[^>]+>/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean)
  const faqs = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (/^Q\s*[:：]\s*/i.test(line) || /^\*\*Q[:：]/i.test(line)) {
      const question = line.replace(/^(\*\*)?Q\s*[:：]\s*(\*\*)?/i, '').trim()
      const nextLine = lines[i + 1] || ''
      const answer = nextLine.replace(/^(\*\*)?A\s*[:：]\s*(\*\*)?/i, '').trim()
      if (question && answer) {
        faqs.push({ question, answer })
        i += 2
        continue
      }
    }
    i++
  }

  return faqs
}

const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(index === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="border border-ink-100 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left
                   hover:bg-ink-50 transition-colors"
      >
        <span className="text-sm font-semibold text-ink-800 leading-snug">{faq.question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-0.5"
        >
          <ChevronDown size={16} className="text-ink-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-4 border-t border-ink-100">
              <p className="text-sm text-ink-600 leading-relaxed pt-3">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const FAQPreview = ({ blog }) => {
  const faqs = parseFAQ(blog?.content)

  
  const faqList = blog?.faqs?.length > 0 ? blog.faqs : faqs

  if (faqList.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Section heading */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
          <HelpCircle size={16} className="text-violet-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-ink-900">
          Frequently Asked Questions
        </h2>
      </div>

      {/* FAQ Schema note */}
      <p className="text-xs text-ink-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Schema-ready FAQ — will appear in Google rich results
      </p>

      {/* FAQ accordion */}
      <div className="space-y-3">
        {faqList.map((faq, i) => (
          <FAQItem key={i} faq={faq} index={i} />
        ))}
      </div>
    </motion.section>
  )
}

export default FAQPreview