const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const orderRouter = require('./routes/order');

dotenv.config();
mongoose
  .connect(process.env.MONGODB_URL || 'mongodb://localhost/domino', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log(`Mongodb connected with server: ${data.connection.host}`);
  });

const app = express();
app.use(express.json());

app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'uploads')));
app.use('/api', userRouter);
app.use('/api', productRouter);
app.use('/api', orderRouter);
app.get('/api/config/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});
