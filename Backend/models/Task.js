const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('To do', 'In progress', 'Closed'),
    defaultValue: 'To do',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  assignedTo: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  createdBy: {
    type: DataTypes.STRING,
    defaultValue: 'Admin',
  },
}, {
  tableName: 'tasks',
  timestamps: true,
  updatedAt: 'updatedAt',
});

module.exports = Task;
