const Order = require('../model/order');
const Product = require('../model/product');

exports.createOrder = async (req, res) => {
  try {
    const order = req.body;
    if (order.orderItems.length === 0) {
      res
        .status(400)
        .send({ message: 'Giỏ hàng rỗng .Tạo đơn hàng không thành công.' });
    } else {
      const newOrder = new Order({
        orderItems: order.orderItems,
        info: order.info,
        paymentResult: order.paymentResult,
        totalPrice: order.totalPrice,
        user: req.user._id,
        paidAt: Date.now(),
      });
      newOrder.orderItems.map((o) => {
        updateQuantity(o.product, o.qty);
      });
      await newOrder.save();
      return res.status(201).send({ newOrder });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.updateDeliveredOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = req.body.isDelivered;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      console.log(updatedOrder);
      res.send({
        message: 'Cập nhật đơn hàng thành công',
        order: updatedOrder,
      });
    } else {
      res.status(404).send({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      return res.status(200).json({ order });
    } else {
      return res.status(404).send({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getOrderByAdmin = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 5;
    const currentPage = Number(req.query.page) || 1;
    const id = req.query.id;

    const idFilter = id ? { _id: { $in: [id] } } : {};

    const skip = pageSize * (currentPage - 1);

    const allOrders = await Order.find({});

    let totalAmount = 0;

    allOrders.map((order) => {
      if (order.isDelivered);
      totalAmount += order.totalPrice;
    });

    const ordersCount = await Order.count({
      ...idFilter,
    });

    const orders = await Order.find({
      ...idFilter,
    })
      .skip(skip)
      .limit(pageSize);

    const pages = Math.ceil(ordersCount / pageSize);

    return res
      .status(200)
      .json({ orders, pages, ordersCount, currentPage, totalAmount });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getOrderByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

const updateQuantity = async (id, qty) => {
  try {
    const product = await Product.findById(id);
    product.quantity -= qty;
    await product.save();
  } catch (error) {
    console.log(error);
  }
};
