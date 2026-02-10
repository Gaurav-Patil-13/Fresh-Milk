const socketIO = require('socket.io');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // Store user socket connections
  const userSockets = new Map();
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // User authentication and room joining
    socket.on('authenticate', (data) => {
      const { userId, role } = data;
      
      if (!userId || !role) {
        socket.emit('error', { message: 'Invalid authentication data' });
        return;
      }
      
      // Store user socket mapping
      userSockets.set(userId, socket.id);
      
      // Join role-specific room
      if (role === 'customer') {
        socket.join(`customer_${userId}`);
        console.log(`Customer ${userId} joined their room`);
      } else if (role === 'seller') {
        socket.join(`seller_${userId}`);
        console.log(`Seller ${userId} joined their room`);
      }
      
      socket.emit('authenticated', { message: 'Successfully authenticated' });
    });
    
    // Handle new order notification
    socket.on('new_order', (data) => {
      io.to(`seller_${data.sellerId}`).emit('NEW_ORDER', data.order);
    });
    
    // Handle order status update
    socket.on('order_status_updated', (data) => {
      io.to(`customer_${data.customerId}`).emit('ORDER_STATUS_UPDATED', data.order);
    });
    
    // Handle order cancellation
    socket.on('order_cancelled', (data) => {
      io.to(`seller_${data.sellerId}`).emit('ORDER_CANCELLED', data.order);
    });
    
    // Handle new subscription
    socket.on('new_subscription', (data) => {
      io.to(`seller_${data.sellerId}`).emit('NEW_SUBSCRIPTION', data.subscription);
    });
    
    // Handle subscription pause
    socket.on('subscription_paused', (data) => {
      io.to(`seller_${data.sellerId}`).emit('SUBSCRIPTION_PAUSED', data);
    });
    
    // Handle subscription resume
    socket.on('subscription_resumed', (data) => {
      io.to(`seller_${data.sellerId}`).emit('SUBSCRIPTION_RESUMED', data);
    });
    
    // Handle subscription cancellation
    socket.on('subscription_cancelled', (data) => {
      io.to(`seller_${data.sellerId}`).emit('SUBSCRIPTION_CANCELLED', data.subscription);
    });
    
    // Handle payment
    socket.on('payment_made', (data) => {
      io.to(`seller_${data.sellerId}`).emit('PAYMENT_RECEIVED', data.payment);
    });
    
    // Handle rating
    socket.on('rating_added', (data) => {
      io.to(`seller_${data.sellerId}`).emit('NEW_RATING', data.rating);
    });
    
    // Handle rating update
    socket.on('rating_updated', (data) => {
      io.to(`seller_${data.sellerId}`).emit('RATING_UPDATED', data.rating);
    });
    
    // Handle milk product updates
    socket.on('milk_added', (data) => {
      io.emit('NEW_MILK_ADDED', data.milk);
    });
    
    socket.on('milk_updated', (data) => {
      io.emit('MILK_UPDATED', data.milk);
    });
    
    socket.on('milk_deleted', (data) => {
      io.emit('MILK_DELETED', data);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Remove user from mapping
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  return io;
};

module.exports = setupSocket;