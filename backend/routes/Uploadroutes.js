const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/Uploadmiddleware");
const { uploadImage, uploadAvatar } = require("../controllers/Uploadcontroller");

const router = express.Router();

// POST /api/upload — blog feature image
router.post(
  "/",
  protect,
  authorize("superadmin", "editor", "author"),
  upload.single("image"),
  uploadImage
);

// POST /api/upload/avatar — user avatar
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);

module.exports = router;