const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const crypto = require('crypto');

const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors({ origin: '*' }));
app.use(express.json());


const tasks = [
  {
    _id: crypto.randomUUID(),
    title: 'Design login screen',
    status: 'To do',
    priority: 'Medium',
    participant: 'You',
    dateAdded: new Date(),
    deadline: null,
  },
  {
    _id: crypto.randomUUID(),
    title: 'Wireframe dashboard',
    status: 'In progress',
    priority: 'High',
    participant: 'Team',
    dateAdded: new Date(),
    deadline: null,
  },
  {
    _id: crypto.randomUUID(),
    title: 'Sync task board',
    status: 'Closed',
    priority: 'Low',
    participant: 'You',
    dateAdded: new Date(),
    deadline: null,
  },
];

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, status, priority, participant, deadline } = req.body || {};
  if (!title) {
    return res.status(400).json({ msg: 'Title is required' });
  }

  const task = {
    _id: crypto.randomUUID(),
    title,
    status: status || 'To do',
    priority: priority || 'Low',
    participant: participant || '',
    dateAdded: new Date(),
    deadline: deadline || null,
  };

  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find((item) => item._id === req.params.id);
  if (!task) {
    return res.status(404).json({ msg: 'Task not found' });
  }

  const { title, status, priority, participant, deadline } = req.body || {};

  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (participant !== undefined) task.participant = participant;
  if (deadline !== undefined) task.deadline = deadline;

  res.json(task);
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('task_moved', (data) => {
    if (Array.isArray(data)) {
      tasks.length = 0;
      tasks.push(...data);
    }
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
