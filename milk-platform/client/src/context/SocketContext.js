import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!token || !user.id) {
      return;
    }

    // Initialize socket connection
    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      
      // Authenticate user
      socketInstance.emit('authenticate', {
        userId: user.id,
        role: user.role
      });
    });

    socketInstance.on('authenticated', (data) => {
      console.log('Socket authenticated:', data.message);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error occurred');
    });

    // Real-time event listeners
    socketInstance.on('NEW_ORDER', (order) => {
      toast.info(`New order received from ${order.customer?.name}`);
    });

    socketInstance.on('ORDER_STATUS_UPDATED', (order) => {
      toast.info(`Order status updated to: ${order.status}`);
    });

    socketInstance.on('ORDER_CANCELLED', (order) => {
      toast.warning(`Order cancelled by ${order.customer?.name}`);
    });

    socketInstance.on('NEW_SUBSCRIPTION', (subscription) => {
      toast.success(`New subscription from ${subscription.customer?.name}`);
    });

    socketInstance.on('SUBSCRIPTION_PAUSED', (data) => {
      toast.info(`Subscription paused for ${new Date(data.pausedDate).toLocaleDateString()}`);
    });

    socketInstance.on('SUBSCRIPTION_CANCELLED', (subscription) => {
      toast.warning('Subscription cancelled');
    });

    socketInstance.on('PAYMENT_RECEIVED', (payment) => {
      toast.success(`Payment received: ₹${payment.amount}`);
    });

    socketInstance.on('NEW_RATING', (rating) => {
      toast.info('You received a new rating');
    });

    socketInstance.on('NEW_MILK_ADDED', (milk) => {
      console.log('New milk product added:', milk);
    });

    socketInstance.on('MILK_UPDATED', (milk) => {
      console.log('Milk product updated:', milk);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};