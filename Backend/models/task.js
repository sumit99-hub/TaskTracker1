const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: String,
    status: { type: String, enum: ['To do', 'In progress', 'Closed', 'Frozen'], default: 'To do' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    participant: String,
    dateAdded: { type: Date, default: Date.now },
    deadline: Date,
});

module.exports = mongoose.model('Task', TaskSchema);