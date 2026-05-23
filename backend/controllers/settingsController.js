const Settings = require('../models/Settings')

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/settings
// ─────────────────────────────────────────────────────────────────────────────
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton()
    res.status(200).json({ success: true, settings })
  } catch (error) {
    console.error('getSettings error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/settings
// ─────────────────────────────────────────────────────────────────────────────
const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton()

    const allowedFields = [
      'siteTitle', 'siteDescription', 'siteUrl', 'contactEmail',
      'logo', 'favicon',
      'defaultMetaTitle', 'defaultMetaDescription', 'defaultOgImage', 'canonicalBase',
      'googleAnalyticsId',
      'social',
      'allowComments', 'allowGuestReads', 'maintenanceMode', 'registrationOpen',
      'blogsPerPage',
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field]
      }
    })

    await settings.save()

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings,
    })
  } catch (error) {
    console.error('updateSettings error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getSettings, updateSettings }