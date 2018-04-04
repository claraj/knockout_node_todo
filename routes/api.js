var express = require('express');
var router = express.Router();
var Task = require('../models/task');


/* GET home page, list of incomplete tasks */
router.get('/tasks', function(req, res, next) {

  Task.find()
    .then( (docs) => {
      res.json(docs);
    })
    .catch( (err) => {
      next(err);    // Forward the request to the error handlers
    });

});


/* POST to create a new task */
router.post('/add', function(req, res, next){

console.log(req.body)
  // Check if something was entered in the text input
  if (req.body.text) {
    // Create new Task
    var t = new Task({text: req.body.text, completed: false, urgent: req.body.urgent})
    // Save the task, and redirect to home page if successful
    t.save().then((newTask) => {
      console.log('The new task created is ', newTask); // just for debugging
      res.sendStatus(201);
    }).catch(() => {
      next(err);   // Forward error to the error handlers
    });
  }
  else {
    // Do not create a new task
    res.sendStatus(400);
  }

});


/* POST to mark a task as done */
router.patch('/done', function(req, res, next){

  Task.findByIdAndUpdate( req.body._id, {completed: req.body.completed} )
    .then( (originalTask) => {
      if (originalTask) {
        res.sendStatus(200);  // ok
      } else {
        res.sendStatus(404);  // not found
      }
    })
    .catch( (err) => {
      next(err);     // to error handlers
    });

});


/* POST to delete a task */
router.delete('/delete', function(req, res, next){

  Task.findByIdAndRemove(req.body._id)
    .then( (deletedTask) => {
      if (deletedTask) {
        res.sendStatus(200);
      } else {
        res.sendStatus(404);
      }
    })
    .catch( (err) => {
      next(err);
    });

});


/* POST mark all tasks as done */
router.patch('/alldone', function(req, res, next){

  Task.updateMany({completed: false}, {completed: true})
    .then( () => {
      res.sendStatus(200);
    })
    .catch( (err) => {
      next(err);
    });

});



router.delete('/deletedone', function(req, res, next){
  Task.deleteMany( {completed: true} )
    .then( () => {
      res.sendStatus(200);
    })
    .catch( (err) => {
      next(err);
    });

});


/* GET details about one task */
router.get('/task/:_id', function(req, res, next){

  Task.findById(req.params._id)
    .then( (doc) => {
      if (doc) {
        res.json(task);
      }
      else {
        res.sendStatus(404);  // to the 404 error handler
      }
    })
    .catch( (err) => {
      next(err);
    });

});


module.exports = router;  // Make sure this is the last line in the file. Any routes beyond this will be ignored.
