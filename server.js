const express = require('express');
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  // Attach io instance to express app
  server.set('io', io);

  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);

    // Join order tracking room
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room order_${orderId}`);
    });

    // Partner live GPS updates
    socket.on('update_location', async (data) => {
      const { orderId, lat, lng } = data;
      io.to(`order_${orderId}`).emit('location_updated', { lat, lng });
    });

    // Order status updates
    socket.on('update_status', (data) => {
      const { orderId, status } = data;
      io.to(`order_${orderId}`).emit('status_updated', { status });
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Client disconnected:', socket.id);
    });
  });

  // SLA Background Worker - checks for orders > 15 mins in PENDING state
  setInterval(async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const pendingOrders = await prisma.order.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: fifteenMinutesAgo,
          },
        },
        include: {
          user: true,
          partner: true,
        },
      });

      for (const order of pendingOrders) {
        const existingAlert = await prisma.alert.findFirst({
          where: { orderId: order.id },
        });

        if (!existingAlert && order.partnerId) {
          const partnerObj = await prisma.partner.findUnique({
            where: { userId: order.partnerId },
          });

          if (partnerObj) {
            const partnerName = `${order.partner.firstName} ${order.partner.lastName}`;
            const alertMsg = `DIQQAT: ${partnerName} o'z buyurtmasini qabul qilmayapti!`;

            const alert = await prisma.alert.create({
              data: {
                orderId: order.id,
                partnerId: partnerObj.id,
                message: alertMsg,
              },
            });

            // Broadcast high-priority red alert
            io.emit('sla_alert', {
              id: alert.id,
              orderId: order.id,
              partnerName,
              message: alertMsg,
              createdAt: alert.createdAt,
            });

            console.log(`[SLA Alert Triggered] Order ${order.id} timed out for partner ${partnerName}`);
          }
        }
      }
    } catch (err) {
      console.error('[SLA Worker Error]:', err);
    }
  }, 15000); // Check every 15 seconds

  // Handle Next.js request routing
  server.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
