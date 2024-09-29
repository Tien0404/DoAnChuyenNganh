const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Tạo JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Đăng ký
exports.register = async (req, res) => {
  const { username, password, email, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    const userPhoneExists = await User.findOne({ phone });

    if (userPhoneExists) {
      return res.status(400).json({ message: "Số điện thoại đã được đăng ký" });
    }

    if (userExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const user = await User.create({
      username,
      password,
      email,
      phone,
      role,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.status(200).json({ message: "Đăng xuất thành công" });
};
