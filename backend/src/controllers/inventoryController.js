const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');

// =================== PRODUCTS ===================

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, lowStock } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id, isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;

    let products, total;
    
    if (lowStock === 'true') {
      // Handle low stock comparison manually or via raw SQL
      // For simplicity, we'll fetch all and filter if it's not a huge dataset, 
      // or use a more efficient way if needed.
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });
      const filtered = allProducts.filter(p => p.quantity <= p.reorderLevel);
      total = filtered.length;
      products = filtered.slice(skip, skip + Number(limit));
    } else {
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: Number(limit),
        }),
        prisma.product.count({ where }),
      ]);
    }
    
    res.json({ success: true, ...paginateResult(products, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) { next(err); }
};

// =================== STOCK MOVEMENTS ===================

exports.addMovement = async (req, res, next) => {
  try {
    const { productId, type, quantity, reference, notes } = req.body;
    if (!productId || !type || !quantity) {
      return res.status(400).json({ success: false, message: 'productId, type, and quantity are required' });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: req.user.id },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousQuantity = product.quantity;
    let newQuantity;

    if (type === 'incoming') {
      newQuantity = previousQuantity + Number(quantity);
    } else {
      if (previousQuantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
      }
      newQuantity = previousQuantity - Number(quantity);
    }

    // Use a transaction to update product and create movement record
    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      }),
      prisma.stockMovement.create({
        data: {
          userId: req.user.id,
          productId,
          type,
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          reference,
          notes,
          createdBy: req.user.id,
        },
        include: { product: { select: { name: true, sku: true } } },
      }),
    ]);

    res.status(201).json({ success: true, data: movement });
  } catch (err) { next(err); }
};

exports.getMovements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, productId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { product: { select: { name: true, sku: true, category: true } } },
      }),
      prisma.stockMovement.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(movements, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};
