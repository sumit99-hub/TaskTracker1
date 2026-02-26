require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize } = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');
const fs = require('fs');
const path = require('path');

const seedDatabase = async () => {
  try {

    await sequelize.authenticate();
    console.log('Database connected successfully.');

    
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');

    
    const usersData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8')
    );
    const tasksData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'tasks.json'), 'utf8')
    );

    
    for (const user of usersData.users) {
      const existingUser = await User.findOne({ where: { email: user.email } });
      
      if (!existingUser) {
        await User.create({
          email: user.email,
          firstName: user.firstName,
          role: user.role,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt,
          updatedAt: user.createdAt,
        });
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    for (const task of tasksData.tasks) {
      const existingTask = await Task.findOne({ where: { title: task.title } });
      if (!existingTask) {
        await Task.create({
          title: task.title,
          description: task.description || '',
          status: task.status || 'To do',
          priority: task.priority || 'Medium',
          assignedTo: task.assignedTo || '',
          createdBy: task.createdBy || 'Admin',
          createdAt: task.createdAt || new Date(),
          updatedAt: task.updatedAt || task.createdAt || new Date(),
        });
        console.log(`Created task: ${task.title}`);
      } else {
        console.log(`Task already exists: ${task.title}`);
      }
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error?.message || error);
    process.exit(1);
  }
};

seedDatabase();
