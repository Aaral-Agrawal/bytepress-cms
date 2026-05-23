import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'
import { uploadAPI } from '../../services/api'

const ImageUploader = ({
  value,
  onChange,
  label = 'Feature Image',
  hint = 'Recommended: 1200×630px, JPG or PNG, max 5MB',
  aspectRatio = 'aspect-video',
  className = '',
}) => {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [justUploaded, setJustUploaded] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.')
      return
    }

    setError('')
    setUploading(true)

    try {
      const data = await uploadAPI.uploadImage(file)
      // Backend should return { url: '...' } or { imageUrl: '...' } or { data: { url: '...' } }
      const url = data?.url || data?.imageUrl || data?.data?.url
      if (!url) throw new Error('No URL returned from server')
      onChange(url)
      setJustUploaded(true)
      setTimeout(() => setJustUploaded(false), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [handleFile])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => handleFile(e.target.files?.[0])

  const clear = (e) => {
    e.stopPropagation()
    onChange('')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-ink-700">{label}</label>
      )}

      <div
        className={`relative w-full ${aspectRatio} rounded-xl border-2 border-dashed overflow-hidden
          cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-ink-500 bg-ink-50 scale-[1.01]'
            : value
              ? 'border-ink-200 bg-ink-50'
              : 'border-ink-200 hover:border-ink-400 bg-ink-50/50 hover:bg-ink-50'
          }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <AnimatePresence mode="wait">
          {value ? (
            /* Image preview */
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors
                              flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-ink-800
                             shadow hover:bg-ink-50 transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="px-3 py-1.5 bg-red-50 rounded-lg text-xs font-medium text-red-600
                             shadow hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>

              {/* Upload success flash */}
              <AnimatePresence>
                {justUploaded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow"
                  >
                    <CheckCircle size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : uploading ? (
            /* Uploading state */
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <div className="w-10 h-10 bg-ink-100 rounded-full flex items-center justify-center">
                <Loader2 size={20} className="text-ink-600 animate-spin" />
              </div>
              <p className="text-sm text-ink-500 font-medium">Uploading…</p>
            </motion.div>
          ) : (
            /* Empty / drop state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                ${dragging ? 'bg-ink-200 scale-110' : 'bg-ink-100'}`}>
                {dragging ? (
                  <Upload size={22} className="text-ink-600" />
                ) : (
                  <ImageIcon size={22} className="text-ink-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-700">
                  {dragging ? 'Drop to upload' : 'Click or drag & drop'}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">JPG, PNG, WebP, GIF</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <X size={12} /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {hint && !error && (
        <p className="text-xs text-ink-400">{hint}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  )
}

export default ImageUploader