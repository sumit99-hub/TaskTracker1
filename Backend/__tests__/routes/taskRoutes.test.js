const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../../config/db.test');
const Task = require('../../models/Task');
const User = require('../../models/User');
const taskRoutes = require('../../routes/taskRoutes');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
let server;
let api;


process.env.JWT_SECRET = 'test-secret-key';


const generateToken = (email, role) => {
  return jwt.sign(
    { user: { email, role } },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

describe('Task Routes', () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    server = await new Promise((resolve, reject) => {
      const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
      instance.on('error', reject);
    });
    api = request(server);
    await sequelize.sync({ force: true });
    
    await User.create({
      email: 'user@test.com',
      firstName: 'Test User',
      role: 'user',
      passwordHash: User.hashPassword('password123'),
    });

    await User.create({
      email: 'admin@test.com',
      firstName: 'Admin User',
      role: 'admin',
      passwordHash: User.hashPassword('admin123'),
    });

    userToken = generateToken('user@test.com', 'user');
    adminToken = generateToken('admin@test.com', 'admin');
  });

  afterAll(async () => {
    await sequelize.close();
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  beforeEach(async () => {
    await Task.destroy({ where: {} });
  });

  describe('GET /api/tasks', () => {
    it('should return 401 without token', async () => {
      const response = await api.get('/api/tasks');
      expect(response.status).toBe(401);
    });

    it('should return tasks with valid token', async () => {
     
      await Task.create({ title: 'Task 1' });
      await Task.create({ title: 'Task 2' });

      const response = await api
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task with valid token', async () => {
      const response = await api
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Task',
          description: 'Task Description',
          status: 'To do',
          priority: 'High',
          assignedTo: 'John Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Task');
      expect(response.body._id).toBeDefined();
    });

    it('should create task with defaults', async () => {
      const response = await api
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Minimal Task',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('To do');
      expect(response.body.priority).toBe('Medium');
    });

    it('should require title', async () => {
      const response = await api
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          description: 'No title',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Update',
        status: 'To do',
      });
      taskId = task.id;
    });

    it('should update task status', async () => {
      const response = await api
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'In progress',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('In progress');
    });

    it('should update multiple fields', async () => {
      const response = await api
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated Title',
          priority: 'High',
          assignedTo: 'Jane Doe',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.priority).toBe('High');
      expect(response.body.assignedTo).toBe('Jane Doe');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await api
        .patch('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'Closed',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const task = await Task.create({
        title: 'Task to Delete',
      });
      taskId = task.id;
    });

    it('should delete a task', async () => {
      const response = await api
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      
     
      const task = await Task.findByPk(taskId);
      expect(task).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await api
        .delete('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/reorder', () => {
    beforeEach(async () => {
      await Task.destroy({ where: {} });
    });

    it('should reorder tasks', async () => {
      const task1 = await Task.create({ title: 'Task 1', status: 'To do' });
      const task2 = await Task.create({ title: 'Task 2', status: 'To do' });

      const response = await api
        .put('/api/tasks/reorder')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tasks: [
            { _id: task1.id, status: 'In progress' },
            { _id: task2.id, status: 'Closed' },
          ],
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
