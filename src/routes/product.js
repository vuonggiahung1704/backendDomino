const express = require('express');
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const productRouter = express.Router();
const {
  createProduct,
  getCategory,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  outOfStock,
} = require('../controller/product');
const { isAdmin, isAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(path.dirname(__dirname), 'uploads'));
  },
  filename: function (req, res, cb) {
    cb(null, shortid.generate() + '__' + Date.now() + '.jpg');
  },
});

const upload = multer({ storage });

productRouter.get('/product', getProducts);
productRouter.get('/product/category', getCategory);
productRouter.get('/product/:id', getProductById);

productRouter.get('/admin/product/stock', isAuth, isAdmin, outOfStock);

productRouter.post(
  '/admin/product/create',
  isAuth,
  isAdmin,
  upload.single('image'),
  createProduct
);
productRouter
  .route('/admin/product/:id')
  .put(isAuth, isAdmin, upload.single('image'), updateProduct)
  .delete(isAuth, isAdmin, deleteProduct);

module.exports = productRouter;
