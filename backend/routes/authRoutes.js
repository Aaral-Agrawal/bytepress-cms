const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

router.get("/profile", protect, (req, res) => {
  
  const userObj = req.user.toObject();
  if (!userObj.name || userObj.name.length < 3 || userObj.name === 'aaral') {
    const emailPrefix = req.user.email.split('@')[0];
    userObj.name = emailPrefix
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  res.status(200).json({
    success: true,
    user: userObj,
  });
});

router.get(
    "/admin",
    protect,
    authorize("superadmin"),
    (req, res) => {
  
      res.status(200).json({
        message: "Welcome Super Admin",
      });
  
    }
);

module.exports = router;