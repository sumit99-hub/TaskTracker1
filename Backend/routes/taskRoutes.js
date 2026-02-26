const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const transformTask = (task) => {
  const plainTask = task.get ? task.get({ plain: true }) : task;
  return {
    ...plainTask,
    _id: plainTask.id,
  };
};

const transformTasks = (tasks) => {
  return tasks.map(transformTask);
};


router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json(transformTasks(tasks));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, createdBy } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status: status || 'To do',
      priority: priority || 'Medium',
      assignedTo: assignedTo || '',
      createdBy: createdBy || 'Admin',
    });

    res.status(201).json(transformTask(task));
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, priority, title, description, assignedTo } = req.body;
    
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    res.json(transformTask(task));
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    await task.destroy();
    res.json({ msg: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body;
    
   
    for (const taskUpdate of tasks) {
      await Task.update(
        { status: taskUpdate.status },
        { where: { id: taskUpdate._id || taskUpdate.id } }
      );
    }
    
    const updatedTasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.json(transformTasks(updatedTasks));
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
