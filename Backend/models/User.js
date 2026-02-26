const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const crypto = require('crypto');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  updatedAt: 'updatedAt',
});

User.hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

User.prototype.comparePassword = function (candidatePassword) {
  const hashedPassword = crypto.createHash('sha256')
    .update(candidatePassword)
    .digest('hex');
  return this.passwordHash === hashedPassword;
};


User.createDefaultUsers = async () => {
  const defaultUsers = [
    {
      email: 'member@tasktracker.io',
      firstName: 'Team Member',
      role: 'user',
      passwordHash: User.hashPassword('password123'),
    },
    {
      email: 'admin@tasktracker.io',
      firstName: 'Admin',
      role: 'admin',
      passwordHash: User.hashPassword('admin123'),
    },
  ];

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (!existingUser) {
      await User.create(userData);
      console.log(`Created default user: ${userData.email}`);
    }
  }
};

module.exports = User;
