const express = require('express');
const app = express();

const mongoose = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in mongoose modles
const {List, Task, User} = require('./db/models');

// Load moddleware
app.use(bodyParser.json());


// CORS HEADERS MIDDLEWARE
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, append,delete,entries,foreach,get,has,keys,set,values,Authorization");
    next();
  });


app.get('/lists', (req, res) => {
    // return an array of lists in the DB
    List.find().then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    })
})


app.post('/lists', (req, res) => {
    //Create a new list 
    let title = req.body.title;

    let newList = new List({
        title
    })
    newList.save().then((listDoc) => {
        // Full list document is returned
        res.send(listDoc);
    })
})

app.patch('/lists/:id', (req, res) => {
    // Update a list with new values
    List.findOneAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(() => {
        res.send({message: 'Updated successfully'});
    })
})

app.delete('/lists/:id', (req, res) => {
    // delete the specifid list
    List.findOneAndDelete({
        _id: req.params.id
    }).then((removeListDoc) =>{
        res.send(removeListDoc);
    })
})

// API calls for tasks

app.get('/lists/:listId/tasks', (req, res) => {
    // return all of the tasks that belong to a specific list
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

app.post('/lists/:listId/tasks', (req, res) => {
    // Create a new task in the specified list
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    // Update an existing task
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    })
});

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndDelete({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    })
});

// API calls for users
app.post('/users', (req, res) => {
    // user sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // session has been created successfully and the refresh token has been returned
        // Now an access token can be generated for the user

        return newUser.generateAccessAuthToken().then((accessToken) => {
            // auth toke generated successfully. Now return an object containing the auth tokens
            return {accessToken, refreshToken}
        })
    }).then((authToken) => {
        // construct and the send the response to the user with their auth tokens in the header
        res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

})



app.listen(3000, () => {
    console.log("server is listening on port 3000");
})