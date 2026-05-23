const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 300,
      default: null,
    },

    color: {
      type: String,
      default: '#6366f1', 
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Auto-generate slug from name before saving
tagSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
  }
  next()
})

// Update slug on name change
tagSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate()
  if (update.name) {
    update.slug = update.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    this.setUpdate(update)
  }
  next()
})

const Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag