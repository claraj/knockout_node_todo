var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Define a schema - what fields will a Task document have?
var taskSchema = new Schema({
  text: String,
  urgent: Boolean,
  completed: Boolean
});

// compile taskSchema description into a Mongoose model
// with the name 'Task'
var Task = mongoose.model('Task', taskSchema);

// Export the Task model for use in the application
module.exports = Task;
