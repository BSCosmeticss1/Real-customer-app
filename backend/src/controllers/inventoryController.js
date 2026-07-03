const { prisma } = require('../config/db');
const { paginateResult } = require('../middleware/paginate');
const { ROLES } = require('../middleware/auth');

// Helper to get the user ID to filter by
const getTargetUserId = (currentUser, targetUserId) => {
  // If current user is admin, they can specify a target user (their own ID, or any staff they created)
  if (currentUser.role === ROLES.ADMIN) {
    // If targetUserId is provided, use it (we'll validate it's a user they own)
    if (targetUserId) {
      return targetUserId;
    }
    // Otherwise, show all (admin + staff)
    return null;
  }
  // For non-admins, only show their own
  return currentUser.id;
};

// Helper to build the where clause for products
const buildProductWhere = async (currentUser, query) => {
  const { search, category, lowStock, userId: targetUserId } = query;
  const where = { isActive: true };
  
  // Handle user filtering
  if (currentUser.role === ROLES.ADMIN) {
    if (targetUserId) {
      // Admin is filtering for a specific user (themselves or a staff member)
      // First, verify the target user is either the admin or a staff they created
      const validUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetUserId, createdBy: currentUser.id }, // Staff member
            { id: targetUserId, id: currentUser.id } // Admin themselves
          ]
        }
      });
      if (!validUser) {
        throw new Error('Invalid user ID');
      }
      where.userId = targetUserId;
    } else {
      // Admin sees all: their own + all staff they created
      where.OR = [
        { userId: currentUser.id },
        { user: { createdBy: currentUser.id } }
      ];
    }
  } else {
    // Non-admin only sees their own
    where.userId = currentUser.id;
  }
  
  if (search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ]
      }
    ];
  }
  if (category) where.category = category;
  
  return where;
};

// =================== PRODUCTS ===================

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, lowStock, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Debug: log all products in DB
    const allProductsInDb = await prisma.product.findMany({
      select: { id: true, name: true, userId: true, user: { select: { id: true, name: true, createdBy: true } } }
    });
    console.log('=== All products in DB ===');
    console.log(allProductsInDb);
    
    const where = await buildProductWhere(req.user, { search, category, lowStock, userId });
    
    console.log('=== getProducts debug ===');
    console.log('Current user:', { id: req.user.id, role: req.user.role });
    console.log('Query params:', req.query);
    console.log('Built where clause:', JSON.stringify(where, null, 2));
    
    let products, total;
    
    if (lowStock === 'true') {
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { user: { select: { id: true, name: true } } },
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
          include: { user: { select: { id: true, name: true } } },
        }),
        prisma.product.count({ where }),
      ]);
    }
    
    console.log('Found products count:', total);
    console.log('Products found:', products.map(p => ({ id: p.id, name: p.name, userId: p.userId })));
    
    res.json({ success: true, ...paginateResult(products, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

exports.getProduct = async (req, res, next) => {
  try {
    // Admin can access any product they own (their own or staff's)
    // Staff can only access their own
    let where;
    if (req.user.role === ROLES.ADMIN) {
      where = {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { user: { createdBy: req.user.id } }
        ]
      };
    } else {
      where = { id: req.params.id, userId: req.user.id };
    }
    
    const product = await prisma.product.findFirst({ where });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    // Admin can create for themselves or staff
    // Staff can only create for themselves
    let targetUserId = req.user.id;
    
    if (req.user.role === ROLES.ADMIN && req.body.userId) {
      // Verify the target user is either the admin or a staff they created
      const validUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: req.body.userId, createdBy: req.user.id },
            { id: req.body.userId, id: req.user.id }
          ]
        }
      });
      if (validUser) {
        targetUserId = req.body.userId;
      }
    }
    
    const product = await prisma.product.create({
      data: { ...req.body, userId: targetUserId },
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let where;
    if (req.user.role === ROLES.ADMIN) {
      where = {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { user: { createdBy: req.user.id } }
        ]
      };
    } else {
      where = { id: req.params.id, userId: req.user.id };
    }
    
    const product = await prisma.product.updateMany({
      where,
      data: req.body,
    });
    if (product.count === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    const updatedProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    res.json({ success: true, data: updatedProduct });
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    let where;
    if (req.user.role === ROLES.ADMIN) {
      where = {
        id: req.params.id,
        OR: [
          { userId: req.user.id },
          { user: { createdBy: req.user.id } }
        ]
      };
    } else {
      where = { id: req.params.id, userId: req.user.id };
    }
    
    const product = await prisma.product.updateMany({
      where,
      data: { isActive: false },
    });
    if (product.count === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product removed' });
  } catch (err) { next(err); }
};

exports.exportProducts = async (req, res, next) => {
  try {
    const where = await buildProductWhere(req.user, req.query);
    const products = await prisma.product.findMany({
      where,
      include: { user: { select: { name: true } } },
    });
    const headers = 'name,sku,category,description,quantity,reorderLevel,price,costPrice,warehouse,unit,owner\n';
    const rows = products.map(p =>
      [p.name, p.sku, p.category, p.description, p.quantity, p.reorderLevel, p.price, p.costPrice, p.warehouse, p.unit, p.user?.name || '']
        .map(v => `"${(v || '').toString().replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    res.send(headers + rows);
  } catch (err) { next(err); }
};

// =================== STOCK MOVEMENTS ===================

exports.addMovement = async (req, res, next) => {
  try {
    const { productId, type, quantity, reference, notes } = req.body;
    if (!productId || !type || !quantity) {
      return res.status(400).json({ success: false, message: 'productId, type, and quantity are required' });
    }

    // Find the product (admin can find any they own, staff only their own)
    let productWhere;
    if (req.user.role === ROLES.ADMIN) {
      productWhere = {
        id: productId,
        OR: [
          { userId: req.user.id },
          { user: { createdBy: req.user.id } }
        ]
      };
    } else {
      productWhere = { id: productId, userId: req.user.id };
    }

    const product = await prisma.product.findFirst({ where: productWhere });
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

    const [updatedProduct, movement] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      }),
      prisma.stockMovement.create({
        data: {
          userId: product.userId, // Use the product's owner ID
          productId,
          type,
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          reference,
          notes,
          createdBy: req.user.id, // Who actually made the change
        },
        include: { product: { select: { name: true, sku: true } } },
      }),
    ]);

    res.status(201).json({ success: true, data: movement });
  } catch (err) { next(err); }
};

exports.getMovements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, productId, userId: targetUserId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    
    // Handle user filtering for movements
    if (req.user.role === ROLES.ADMIN) {
      if (targetUserId) {
        const validUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: targetUserId, createdBy: req.user.id },
              { id: targetUserId, id: req.user.id }
            ]
          }
        });
        if (!validUser) {
          throw new Error('Invalid user ID');
        }
        where.userId = targetUserId;
      } else {
        where.OR = [
          { userId: req.user.id },
          { user: { createdBy: req.user.id } }
        ];
      }
    } else {
      where.userId = req.user.id;
    }
    
    if (type) where.type = type;
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: { product: { select: { name: true, sku: true, category: true } }, user: { select: { id: true, name: true } } },
      }),
      prisma.stockMovement.count({ where }),
    ]);
    res.json({ success: true, ...paginateResult(movements, total, Number(page), Number(limit)) });
  } catch (err) { next(err); }
};

// =================== USERS FOR FILTER ===================
exports.getInventoryUsers = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      // Non-admins only see themselves
      return res.json({ 
        success: true, 
        data: [{ id: req.user.id, name: 'Me' }] 
      });
    }
    
    // Admin sees themselves + all staff
    const [adminSelf, staff] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true }
      }),
      prisma.user.findMany({
        where: { createdBy: req.user.id },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })
    ]);
    
    const users = [
      { id: adminSelf.id, name: `${adminSelf.name} (Me)` },
      ...staff.map(s => ({ id: s.id, name: s.name }))
    ];
    
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};
