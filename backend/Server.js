const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

// ============================================================
// PRISMA 7 + POSTGRESQL
// ============================================================

const {PrismaPg} = require('@prisma/adapter-pg');
const {PrismaClient} = require('./generated/prisma/client.ts');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const PORT = process.env.PORT || 5000;

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce backend API is running',
  });
});

// ============================================================
// PRODUCT API
// ============================================================

// GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedProducts = products.map(product => ({
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image: product.image,
      description: product.description,
      category: product.category.name,
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Get products error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
});

// GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const formattedProduct = {
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image: product.image,
      description: product.description,
      category: product.category.name,
    };

    res.json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error('Get product error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
});

// GET PRODUCTS BY CATEGORY
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const categoryName = req.params.category;

    const products = await prisma.product.findMany({
      where: {
        category: {
          name: categoryName,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedProducts = products.map(product => ({
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image: product.image,
      description: product.description,
      category: product.category.name,
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Get category products error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products',
    });
  }
});

// ============================================================
// USER API
// ============================================================

// REGISTER USER
app.post('/api/users/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password,
        phone: phone || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
});

// LOGIN USER
app.post('/api/users/login', async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
});

// GET USER
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        id: String(user.id),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
});

// ============================================================
// CART API
// ============================================================

// GET USER CART
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedCart = cartItems.map(item => ({
      id: String(item.product.id),
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image,
      description: item.product.description,
      category: item.product.category.name,
      quantity: item.quantity,
    }));

    res.json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    console.error('Get cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
    });
  }
});

// ADD PRODUCT TO CART
app.post('/api/cart', async (req, res) => {
  try {
    const {
      userId,
      productId,
      quantity = 1,
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'userId and productId are required',
      });
    }

    const numericUserId = Number(userId);
    const numericProductId = Number(productId);
    const numericQuantity = Number(quantity);

    if (
      Number.isNaN(numericUserId) ||
      Number.isNaN(numericProductId) ||
      Number.isNaN(numericQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data',
      });
    }

    if (numericQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: numericUserId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: numericProductId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: numericUserId,
          productId: numericProductId,
        },
      },
      update: {
        quantity: {
          increment: numericQuantity,
        },
      },
      create: {
        userId: numericUserId,
        productId: numericProductId,
        quantity: numericQuantity,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Product added to cart',
      cartItem: {
        id: String(cartItem.product.id),
        name: cartItem.product.name,
        price: Number(cartItem.product.price),
        image: cartItem.product.image,
        description: cartItem.product.description,
        category: cartItem.product.category.name,
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    console.error('Add cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
    });
  }
});

// UPDATE CART QUANTITY
app.put('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (
      Number.isNaN(userId) ||
      Number.isNaN(productId) ||
      Number.isNaN(quantity)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data',
      });
    }

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          productId,
        },
      });

      return res.json({
        success: true,
        message: 'Cart item removed',
      });
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        quantity,
      },
    });

    res.json({
      success: true,
      message: 'Cart quantity updated',
      quantity: cartItem.quantity,
    });
  } catch (error) {
    console.error('Update cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
    });
  }
});

// REMOVE PRODUCT FROM CART
app.delete('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);

    if (
      Number.isNaN(userId) ||
      Number.isNaN(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or product ID',
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Product removed from cart',
    });
  } catch (error) {
    console.error('Remove cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to remove product from cart',
    });
  }
});

// CLEAR USER CART
app.delete('/api/cart/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
});

// ============================================================
// WISHLIST API
// ============================================================

// GET USER WISHLIST
app.get('/api/wishlist/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    const formattedWishlist = wishlistItems.map(item => ({
      id: String(item.product.id),
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image,
      description: item.product.description,
      category: item.product.category.name,
    }));

    res.json({
      success: true,
      wishlist: formattedWishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
    });
  }
});

// ADD TO WISHLIST
app.post('/api/wishlist', async (req, res) => {
  try {
    const {
      userId,
      productId,
    } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'userId and productId are required',
      });
    }

    const numericUserId = Number(userId);
    const numericProductId = Number(productId);

    if (
      Number.isNaN(numericUserId) ||
      Number.isNaN(numericProductId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or product ID',
      });
    }

    const wishlistItem = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: numericUserId,
          productId: numericProductId,
        },
      },
      update: {},
      create: {
        userId: numericUserId,
        productId: numericProductId,
      },
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem,
    });
  } catch (error) {
    console.error('Add wishlist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
    });
  }
});

// REMOVE FROM WISHLIST
app.delete('/api/wishlist/:userId/:productId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);

    if (
      Number.isNaN(userId) ||
      Number.isNaN(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or product ID',
      });
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    console.error('Remove wishlist error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
    });
  }
});

// ============================================================
// ESEWA CONFIGURATION
// ============================================================

const ESEWA_PRODUCT_CODE =
  process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

const ESEWA_SECRET_KEY =
  process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

// ============================================================
// ESEWA HELPER
// ============================================================

function generateSignature(message) {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
}

// ============================================================
// ESEWA - CREATE PAYMENT
// ============================================================

app.post('/api/esewa/create-payment', async (req, res) => {
  try {
    const {
      amount,
      deliveryCharge = 0,
      transactionUuid,
    } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required',
      });
    }

    const totalAmount =
      Number(amount) + Number(deliveryCharge);

    const uuid =
      transactionUuid || `TXN-${Date.now()}`;

    const signatureMessage =
      `total_amount=${totalAmount.toFixed(
        2,
      )},transaction_uuid=${uuid},product_code=${ESEWA_PRODUCT_CODE}`;

    const signature =
      generateSignature(signatureMessage);

    console.log('\n========== CREATE ESEWA PAYMENT ==========');
    console.log('Amount:', amount);
    console.log('Delivery:', deliveryCharge);
    console.log('Total:', totalAmount);
    console.log('Transaction UUID:', uuid);
    console.log('Signature message:', signatureMessage);
    console.log('Signature:', signature);

    res.json({
      success: true,
      paymentData: {
        amount: Number(amount),
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: uuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: 0,
        product_delivery_charge: Number(deliveryCharge),

        success_url:
          `${
            process.env.BACKEND_URL ||
            `http://localhost:${PORT}`
          }/api/esewa/success`,

        failure_url:
          `${
            process.env.BACKEND_URL ||
            `http://localhost:${PORT}`
          }/api/esewa/failure`,

        signed_field_names:
          'total_amount,transaction_uuid,product_code',

        signature,
      },
    });
  } catch (error) {
    console.error(
      'Create eSewa payment error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Failed to create eSewa payment',
    });
  }
});

// ============================================================
// ESEWA - SUCCESS CALLBACK
// ============================================================

app.get('/api/esewa/success', (req, res) => {
  console.log('\n========== ESEWA SUCCESS ==========');
  console.log('Query:', req.query);

  res.json({
    success: true,
    message: 'eSewa payment successful',
    data: req.query,
  });
});

// ============================================================
// ESEWA - FAILURE CALLBACK
// ============================================================

app.get('/api/esewa/failure', (req, res) => {
  console.log('\n========== ESEWA FAILURE ==========');
  console.log('Query:', req.query);

  res.json({
    success: false,
    message: 'eSewa payment failed',
    data: req.query,
  });
});

// ============================================================
// ESEWA - VERIFY PAYMENT
// ============================================================

app.post('/api/esewa/verify-payment', async (req, res) => {
  try {
    const {
      transactionUuid,
      totalAmount,
      productCode,
    } = req.body;

    if (
      !transactionUuid ||
      !totalAmount ||
      !productCode
    ) {
      return res.status(400).json({
        success: false,
        message:
          'transactionUuid, totalAmount and productCode are required',
      });
    }

    const signatureMessage =
      `total_amount=${Number(
        totalAmount,
      ).toFixed(
        2,
      )},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    const expectedSignature =
      generateSignature(signatureMessage);

    console.log(
      '\n========== VERIFY ESEWA PAYMENT ==========',
    );

    console.log(
      'Transaction UUID:',
      transactionUuid,
    );

    console.log(
      'Total Amount:',
      totalAmount,
    );

    console.log(
      'Product Code:',
      productCode,
    );

    console.log(
      'Signature Message:',
      signatureMessage,
    );

    console.log(
      'Expected Signature:',
      expectedSignature,
    );

    res.json({
      success: true,
      verified: true,
      message:
        'Payment verification request processed',
      transactionUuid,
    });
  } catch (error) {
    console.error(
      'Verify eSewa payment error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('Global error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log('\n==========================================');
    console.log('E-COMMERCE BACKEND SERVER');
    console.log('==========================================');
    console.log(
      `Server running on port ${PORT}`,
    );
    console.log(
      `Local: http://localhost:${PORT}`,
    );
    console.log(
      `Products: http://localhost:${PORT}/api/products`,
    );
    console.log(
      `Users: http://localhost:${PORT}/api/users`,
    );
    console.log(
      `Cart: http://localhost:${PORT}/api/cart`,
    );
    console.log(
      `Wishlist: http://localhost:${PORT}/api/wishlist`,
    );
    console.log('==========================================\n');
  },
);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

async function shutdown() {
  console.log('\nShutting down server...');

  await prisma.$disconnect();

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);

process.on('SIGTERM', shutdown);