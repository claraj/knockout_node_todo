$(function(){

    // Represents a Task object in the client app. Many observable properties which are bound
    // to properties in the HTML, so when a Task object updates, the HTML property that is
    // is bound to also updates, so the web page updates.

    function Task(data, ctx) {
        this._id = data._id;
        this.text = ko.observable(data.text);
        this.urgent = ko.observable(data.urgent) || false;
        this.completed = ko.observable(data.completed) || false;

        // Whether a task is visible depends on whether it is completed or not
        // and whether the user wants to see completed/not completed.
        this.visible = ko.computed(function(){
            if (this.completed() && ctx.showCompleted() ) return true;
            if (!this.completed() && ctx.showNotCompleted()) return true;
            return false;
        }, this)
    }


    // Represents all the data that the page will display.
    // Includes event handler functions for the user interacting with the page.
    function TaskListViewModel() {

        let self = this;

        // All the tasks
        self.tasks = ko.observableArray([]);

        // Observables for UI components

        self.newTaskText = ko.observable();                 // The text currently entered into the new task form
        self.newTaskIsUrgent = ko.observable();             // Whether the new task form checkbox is checked

        self.showCompleted = ko.observable(true);           // If the show completed checkbox is checked
        self.showNotCompleted = ko.observable(true);        // If the show not completed checkbox is checked


        // Used to display feedback messages to the user
        self.flashMessage = ko.observable('Welcome to the Task Manager!');


        // invoked when user clicks add task button on form.
        // Reads task info, converts to JSON object and sends to server with an AJAX request
        self.saveNewTask = function() {

            // Read data from the form observables, format as JSON
            let data = ko.toJSON({ text: self.newTaskText(), urgent: self.newTaskIsUrgent() || false, completed: false});

            $.ajax({
                type: 'POST',
                url: 'api/add',         // This is the /add route in the routes/api.js
                data: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                success: function() {
                    self.loadAllTasks();                // This causes a request to the server to fetch all tasks
                    self.newTaskIsUrgent(false);        // Clear form
                    self.newTaskText('');               // Clear form
                    self.notification('New task created.')      // Notify user
                },
                error: function() {
                    self.notification('Unable to save task. Did you enter some text?') }  // TODO there's a lot of other things that can go wrong, error handling could be greatly improved.
            });

        };


        self.taskCompleted = function(task) {

            // if done, make not done, and vice versa
            task.completed(!task.completed());

            console.log('task completed');
            
            $.ajax({
                type: 'patch',
                url: 'api/done',
                data: ko.toJSON(task),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                success: function(res) {
                    self.loadAllTasks();
                    self.notification(`Task "${task.text()}" updated`) },
                error: function() {
                    self.notification('Sorry, error updating task');
                }
            })
        };


        self.taskDelete = function(task) {

            $.ajax({
                type: 'delete',
                url: 'api/delete',
                data: ko.toJSON(task),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                success: function() {
                    self.loadAllTasks();   // Collect updated list of tasks from server
                    self.notification(`Task "${task.text()}" deleted`);
                },
                error: function() {
                    self.notification('Error deleting task');
                }
            })
        };


        self.deleteCompleted = function() {

          $.ajax({
              type: 'delete',
              url: 'api/deletedone',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              success: function() {
                  self.loadAllTasks();   // Collect updated list of tasks from server
                  self.notification('All completed tasks deleted.');
              },
              error: function() {
                  self.notification('Error deleting completed tasks.');
              }
          })
        }


        self.allCompleted = function() {

          $.ajax({
              type: 'patch',
              url: 'api/alldone',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              },
              success: function() {
                  self.loadAllTasks();   // Collect updated list of tasks from server
                  self.notification('All tasks are complete. Well done');
              },
              error: function() {
                  self.notification('Error marking tasks as complete.')
              }
          })

        }


        self.loadAllTasks = function() {
            $.getJSON('api/tasks', function (allData) {
                let allTasks = $.map(allData, function (item) {
                    return new Task(item, self);
                });
                self.tasks(allTasks);   // Update the tasks observable array
            })
        };



        self.notification = function(text) {

            self.flashMessage(text);

            $('#flash-message')
                .clearQueue()           // Clear any current animations and transitions
                .fadeTo(0, 1)           // Immediately become opaque
                .delay(3000)            // Wait this many milliseconds // FIXME this is not cancellable, replace with timeout.
                .fadeTo('slow', 0)      // And then fade away
        };


        self.loadAllTasks();   // Load initial tasks from server

    }


    ko.applyBindings(new TaskListViewModel());

});
