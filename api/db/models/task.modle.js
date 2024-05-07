const { text } = require('body-parser');
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        required: true,
        default: 'Todo'
    },
    notes: {
        type: String,
        default: ''
    }
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = {Task}