import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'

 
const TagInput = ({
  tags = [],
  onChange,
  placeholder = 'Add tag…',
  suggestions = [],
  maxTags = 10,
  label = 'Tags',
  className = '',
}) => {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(s) &&
      input.length > 0
  )

  const addTag = (value) => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return
    onChange([...tags, trimmed])
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (index) => {
    const next = tags.filter((_, i) => i !== index)
    onChange(next)
  }

  const handleKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-ink-700">{label}</label>
      )}

      {/* Tag container */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={`min-h-[44px] flex flex-wrap gap-2 px-3 py-2 rounded-xl border bg-white cursor-text
          transition-all duration-200
          ${focused
            ? 'border-ink-400 ring-2 ring-ink-100 shadow-sm'
            : 'border-ink-200 hover:border-ink-300'
          }`}
      >
        <AnimatePresence>
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-ink-100 text-ink-700
                         text-xs font-medium rounded-full"
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i) }}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X size={10} strokeWidth={2.5} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => { setFocused(true); setShowSuggestions(true) }}
            onBlur={() => {
              setFocused(false)
              setTimeout(() => setShowSuggestions(false), 150)
            }}
            placeholder={tags.length < maxTags ? placeholder : `Max ${maxTags} tags`}
            disabled={tags.length >= maxTags}
            className="w-full text-sm text-ink-800 placeholder-ink-400 bg-transparent outline-none
                       disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-1 w-48 bg-white border border-ink-200 rounded-xl
                           shadow-lg z-50 overflow-hidden"
              >
                {filteredSuggestions.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addTag(s)}
                    className="w-full text-left px-3 py-2 text-sm text-ink-700 hover:bg-ink-50
                               transition-colors flex items-center gap-2"
                  >
                    <Plus size={12} className="text-ink-400" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-ink-400">
        Press <kbd className="px-1 py-0.5 bg-ink-100 rounded text-ink-600 font-mono text-[10px]">Enter</kbd> or{' '}
        <kbd className="px-1 py-0.5 bg-ink-100 rounded text-ink-600 font-mono text-[10px]">,</kbd> to add •{' '}
        {tags.length}/{maxTags} used
      </p>
    </div>
  )
}

export default TagInput