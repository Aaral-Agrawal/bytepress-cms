const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }


        const user = await User.create({
            name,
            email,
            password: password,
            role,
        });

        res.status(201).json({
            message: "User registered successfully",
            user,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

            console.log("Entered Password:", password);
            console.log("Stored Hash:", user.password);

            const isMatch = await bcrypt.compare(password, user.password);

            console.log("Password Match:", isMatch);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid credentials",
                });
            }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

         
        let displayName = user.name;
        if (!displayName || displayName.length < 3 || displayName === 'aaral') {
          const emailPrefix = email.split('@')[0];
          displayName = emailPrefix
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: displayName,
                email: user.email,
                role: user.role,
            },
            token,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });

    }
};
 
const logoutUser = async (req, res) => {
    try {

        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            sameSite: "strict",
            secure: false, 
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
 
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
 
    let userObj = user.toObject();
    if (!userObj.name || userObj.name.length < 3 || userObj.name === 'aaral') {
      const emailPrefix = user.email.split('@')[0];
      userObj.name = emailPrefix
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
      user.email = email.trim();
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio?.trim() || '';
    if (avatar !== undefined) user.avatar = avatar || null;

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
  

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
};