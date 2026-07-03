const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all bookings for a user
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Get booking statistics for reporting
exports.getBookingStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total bookings
    const totalBookings = await prisma.booking.count({
      where: { userId }
    });
    
    // Get bookings from last 30 days
    const bookingsLast30Days = await prisma.booking.findMany({
      where: { 
        userId, 
        date: { gte: thirtyDaysAgo } 
      }
    });
    
    // Calculate gross revenue from last 30 days
    const grossRevenue = bookingsLast30Days.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    
    // Calculate this month's revenue
    const bookingsThisMonth = await prisma.booking.findMany({
      where: {
        userId,
        date: { gte: thisMonthStart }
      }
    });
    const monthlyRevenue = bookingsThisMonth.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    
    // Get completed bookings for conversion rate
    const completedBookings = await prisma.booking.count({
      where: { userId, status: 'Completed' }
    });
    
    // Get new customers (assuming each unique customerName is a customer)
    const uniqueCustomers = new Set();
    bookingsLast30Days.forEach(booking => {
      uniqueCustomers.add(booking.customerName);
    });
    const newCustomers = uniqueCustomers.size;
    
    // Get top services
    const serviceCounts = {};
    bookingsLast30Days.forEach(booking => {
      serviceCounts[booking.service] = (serviceCounts[booking.service] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        share: `${Math.round((count / (bookingsLast30Days.length || 1)) * 100)}%`
      }));
    
    // Set a default monthly goal (we can make this user-configurable later)
    const monthlyGoal = 10000; // $10,000 default monthly goal
    const progressPercentage = Math.min(Math.round((monthlyRevenue / monthlyGoal) * 100), 100);
    const remaining = Math.max(monthlyGoal - monthlyRevenue, 0);
    
    res.json({
      totalBookings,
      grossRevenue,
      conversionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 1000) / 10 : 0,
      newCustomers,
      recentBookings: bookingsLast30Days.slice(0, 5),
      topServices,
      monthlyRevenue,
      monthlyGoal,
      progressPercentage,
      remaining
    });
  } catch (error) {
    next(error);
  }
};

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { customerName, service, date, amount, status, notes } = req.body;
    
    // Generate booking number
    const bookingCount = await prisma.booking.count({ where: { userId } });
    const bookingNumber = `BK-${String(bookingCount + 1).padStart(4, '0')}`;
    
    const booking = await prisma.booking.create({
      data: {
        userId,
        bookingNumber,
        customerName,
        service,
        date: new Date(date),
        amount: amount || 0,
        status: status || 'Pending',
        notes
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// Update a booking
exports.updateBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { customerName, service, date, amount, status, notes } = req.body;
    
    const booking = await prisma.booking.updateMany({
      where: { id, userId },
      data: {
        customerName,
        service,
        date: date ? new Date(date) : undefined,
        amount,
        status,
        notes
      }
    });
    
    if (booking.count === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const updatedBooking = await prisma.booking.findFirst({
      where: { id, userId }
    });
    
    res.json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

// Delete a booking
exports.deleteBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const booking = await prisma.booking.deleteMany({
      where: { id, userId }
    });
    
    if (booking.count === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};
