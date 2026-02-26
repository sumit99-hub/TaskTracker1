const { sequelize } = require('../../config/db.test');
const Task = require('../../models/Task');
const User = require('../../models/User');

describe('Task Model', () => {
  beforeAll(async () => {
    // Sync database before tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Task.destroy({ where: {} });
  });

  describe('Task.create', () => {
    it('should create a task with valid data', async () => {
      const task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        status: 'To do',
        priority: 'High',
        assignedTo: 'John Doe',
        createdBy: 'Admin',
      });

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe('To do');
      expect(task.priority).toBe('High');
      expect(task.assignedTo).toBe('John Doe');
      expect(task.createdBy).toBe('Admin');
    });

    it('should require title', async () => {
      await expect(Task.create({
        description: 'No title',
      })).rejects.toThrow();
    });

    it('should have default status', async () => {
      const task = await Task.create({
        title: 'Default Status Task',
      });

      expect(task.status).toBe('To do');
    });

    it('should have default priority', async () => {
      const task = await Task.create({
        title: 'Default Priority Task',
      });

      expect(task.priority).toBe('Medium');
    });

    it('should have empty string default for assignedTo', async () => {
      const task = await Task.create({
        title: 'Task without assignee',
      });

      expect(task.assignedTo).toBe('');
    });

    it('should have Admin as default createdBy', async () => {
      const task = await Task.create({
        title: 'Task with default creator',
      });

      expect(task.createdBy).toBe('Admin');
    });
  });

  describe('Task status validation', () => {
    it('should accept "To do" status', async () => {
      const task = await Task.create({
        title: 'Todo Task',
        status: 'To do',
      });

      expect(task.status).toBe('To do');
    });

    it('should accept "In progress" status', async () => {
      const task = await Task.create({
        title: 'In Progress Task',
        status: 'In progress',
      });

      expect(task.status).toBe('In progress');
    });

    it('should accept "Closed" status', async () => {
      const task = await Task.create({
        title: 'Closed Task',
        status: 'Closed',
      });

      expect(task.status).toBe('Closed');
    });
  });

  describe('Task priority validation', () => {
    it('should accept "Low" priority', async () => {
      const task = await Task.create({
        title: 'Low Priority Task',
        priority: 'Low',
      });

      expect(task.priority).toBe('Low');
    });

    it('should accept "Medium" priority', async () => {
      const task = await Task.create({
        title: 'Medium Priority Task',
        priority: 'Medium',
      });

      expect(task.priority).toBe('Medium');
    });

    it('should accept "High" priority', async () => {
      const task = await Task.create({
        title: 'High Priority Task',
        priority: 'High',
      });

      expect(task.priority).toBe('High');
    });
  });

  describe('Task CRUD operations', () => {
    it('should update a task', async () => {
      const task = await Task.create({
        title: 'Original Title',
        status: 'To do',
      });

      task.status = 'In progress';
      await task.save();

      const updatedTask = await Task.findByPk(task.id);
      expect(updatedTask.status).toBe('In progress');
    });

    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to Delete',
      });

      const id = task.id;
      await task.destroy();

      const deletedTask = await Task.findByPk(id);
      expect(deletedTask).toBeNull();
    });

    it('should find all tasks', async () => {
      await Task.create({ title: 'Task 1' });
      await Task.create({ title: 'Task 2' });
      await Task.create({ title: 'Task 3' });

      const tasks = await Task.findAll();
      expect(tasks.length).toBe(3);
    });
  });
});
