const Product = require('../model/product');
const { validationResult } = require('express-validator');
const fileHelper = require('../ultis/file');

exports.createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Giá trị nhập vào không hợp lệ' });
    }
    const { name, category, description, price, quantity, sale } = req.body;
    const image = req.file.filename;
    const product = new Product({
      name,
      category,
      description,
      price,
      quantity,
      sale,
      image,
      createdBy: req.user._id,
    });
    await product.save();
    return res.status(201).json({ message: 'Tạo sản phẩm mới thành công' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Giá trị nhập vào không hợp lệ' });
    }

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(400).json({ message: `Không tìm thấy sản phẩm` });

    if (product.createdBy.toString() !== req.user._id.toString())
      return res
        .status(400)
        .json({ message: 'Bạn không được phép xử lí chức năng' });

    if (req.file) {
      fileHelper.deleteFile(product.image);
      req.body.image = req.file.filename;
    }

    await Product.findByIdAndUpdate(product._id, req.body);
    return res.status(201).json({ message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(400).json({ message: `Không tìm thấy sản phẩm` });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'Bạn không được phép xử lí chức năng' });
    }

    fileHelper.deleteFile(product.image);

    await product.remove();

    return res.status(200).json({ message: `Xóa sản phẩm thành công` });
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(400).json({ message: `Không tìm thấy sản phẩm` });

    return res.status(200).json({ product });
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const categories = await Product.find().distinct('category');
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const currentPage = Number(req.query.page) || 1;
    const name = req.query.keyword || '';
    const category = req.query.category || '';
    const sale = req.query.sale || 0;
    const order = req.query.order || '';

    const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {};
    const categoryFilter = category ? { category } : {};
    const saleFilter = sale ? { sale: { $gt: sale } } : {};
    const sortOrder =
      order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'a-z'
        ? { name: 1 }
        : { name: -1 };

    const skip = pageSize * (currentPage - 1);

    const productsCount = await Product.count({
      ...nameFilter,
      ...categoryFilter,
      ...saleFilter,
    });

    const products = await Product.find({
      ...nameFilter,
      ...categoryFilter,
      ...saleFilter,
    })
      .sort(sortOrder)
      .skip(skip)
      .limit(pageSize);

    const pages = Math.ceil(productsCount / pageSize);

    return res
      .status(200)
      .json({ products, pages, productsCount, currentPage });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: 'Lỗi hệ thống', error });
  }
};

exports.outOfStock = async (req, res) => {
  try {
    const products = await Product.find({});
    const productsOfStock = await Product.find({ quantity: 0 });

    // const productsOfStock = products.filter(
    //   (product) => product.quantity === 0
    // );

    return res
      .status(200)
      .json({ count: products.length, outOfStock: productsOfStock.length });
  } catch (error) {
    return res.status(400).json({ message: 'Lỗi hệ thống' });
  }
};
