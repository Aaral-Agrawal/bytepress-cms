const mongoose = require('mongoose')

// Singleton settings document — only one record ever exists
const settingsSchema = new mongoose.Schema(
  {
    // Site identity
    siteTitle: {
      type: String,
      default: 'My Blog Platform',
      trim: true,
      maxlength: 100,
    },
    siteDescription: {
      type: String,
      default: '',
      maxlength: 500,
    },
    siteUrl: {
      type: String,
      default: 'http://localhost:3000',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    favicon: {
      type: String,
      default: null,
    },

    // Default SEO
    defaultMetaTitle: {
      type: String,
      default: '',
      maxlength: 70,
    },
    defaultMetaDescription: {
      type: String,
      default: '',
      maxlength: 160,
    },
    defaultOgImage: {
      type: String,
      default: null,
    },
    canonicalBase: {
      type: String,
      default: '',
    },
    googleAnalyticsId: {
      type: String,
      default: '',
    },

    // Social links
    social: {
      twitter:   { type: String, default: '' },
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin:  { type: String, default: '' },
      github:    { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },

    // Feature toggles
    allowComments: { type: Boolean, default: true },
    allowGuestReads: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },

    // Pagination defaults
    blogsPerPage: { type: Number, default: 6, min: 1, max: 50 },
  },
  {
    timestamps: true,
  }
)

 
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

const Settings = mongoose.model('Settings', settingsSchema)
module.exports = Settings