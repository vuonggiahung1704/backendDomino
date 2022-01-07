const express = require('express');
const {
  createOrder,
  getOrderByAdmin,
  getOrderById,
  getOrderByUser,
  updateDeliveredOrder,
} = require('../controller/order');
const { isAuth, isAdmin } = require('../middleware/auth');
const orderRouter = express.Router();

orderRouter.get('/order/:id', isAuth, getOrderById);
orderRouter.get('/orders/mine', isAuth, getOrderByUser);

orderRouter.post('/order/create', isAuth, createOrder);

orderRouter.put('/order/:id/deliver', isAuth, isAdmin, updateDeliveredOrder);
orderRouter.get('/orders', isAuth, isAdmin, getOrderByAdmin);

module.exports = orderRouter;
