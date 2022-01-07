const express = require('express');
const { body } = require('express-validator');

const userRouter = express.Router();
const { getAllUser, register, login } = require('../controller/user');
const { isAdmin, isAuth } = require('../middleware/auth');

userRouter.get('/admin/user', isAuth, isAdmin, getAllUser);

userRouter.post(
  '/user/register',
  [body('email').isEmail(), body('password').isLength({ min: 5 })],
  register
);
userRouter.post(
  '/user/login',
  [body('email').isEmail(), body('password').isLength({ min: 5 })],
  login
);

module.exports = userRouter;
