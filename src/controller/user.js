const User = require('../model/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateToken } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Giá trị nhập vào không hợp lệ' });
    }

    const existUser = await User.findOne({ email: req.body.email });
    if (existUser) {
      return res
        .status(400)
        .json({ message: `Email ${existUser.email} đã được đăng ký trước.` });
    }
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    await user.save();
    return res.status(200).json({
      user: {
        username: user.username,
        isAdmin: user.isAdmin,
      },
      token: generateToken(user),
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: 'Lỗi hệ thống',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Giá trị nhập vào không hợp lệ' });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json({ message: `Email không tìm thấy` });

    if (bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(200).json({
        user: {
          username: user.username,
          isAdmin: user.isAdmin,
        },
        token: generateToken(user),
      });
    }
    return res.status(400).json({ message: `Mật khẩu không hợp lệ.` });
  } catch (error) {
    return res.status(400).json({
      message: 'Lỗi hệ thống',
    });
  }
};

// Get all users(admin)
exports.getAllUser = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const currentPage = Number(req.query.page) || 1;

    const usersCount = await User.count({});

    const skip = pageSize * (currentPage - 1);

    const usersData = await User.find().skip(skip).limit(pageSize);

    const pages = Math.ceil(usersCount / pageSize);

    const users = usersData.map((user) => {
      const { password, ...user_info } = user._doc;
      return user_info;
    });
    return res.status(200).json({ users, pages, usersCount, currentPage });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};
