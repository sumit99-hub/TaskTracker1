require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});


connectDB().then(async () => {
  
  await User.createDefaultUsers();
  
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);

  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('task_moved', (data) => {
      socket.broadcast.emit('receive_task_move', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  const PORT = Number(process.env.PORT || process.env.BACKEND_PORT) || 5003;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
