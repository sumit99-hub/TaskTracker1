require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors({ origin: '*' }));
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('task_moved', (data) => {
    socket.broadcast.emit('receive_task_move', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = Number(process.env.PORT) || 5002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
