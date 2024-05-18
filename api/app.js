const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

const mongoose = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in mongoose modles
const {List, Task, User} = require('./db/models');

const jwt = require('jsonwebtoken');

/* MIDDLEWARE */

// Load moddleware
app.use(bodyParser.json());


// CORS HEADERS MIDDLEWARE
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, append,delete,entries,foreach,get,has,keys,set,values,Authorization, x-access-token, x-refresh-token, _id");

    res.header(
        "Access-Control-Expose-Headers",
        "x-access-token, x-refresh-token"
    );

    next();
  });

  // if the request has a valid JWT access token token
  let authenticate = (req, res, next) => {
      let token = req.header('x-access-token');

      // verify JWT
      jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // JWT is invalid so do not authenticate
            res.status(401).send(err);
        } else {
            // JWT isvalid
            req.user_id = decoded._id;
            next();
        }
      });
  }

  // Verify refresh token. THis will verify the session
  let verifySession = (req, res, next) => {
    // Get the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');
    // get the _id from the request header 
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // Not user found
            return Promise.reject({
                'error': 'User not found. Make sure that the token and user ID are correct'
            })
        }

        // User has been found
        // now we need to check if the refresh token has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;
    
        // BY default the session will not be valid
        let isSessionValid = false;

        //console.log("Refresh Token:", user.sessions);

        // Loop over the current sessions that the user has and find one that has the same refresh token
        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        })

        if (isSessionValid) {
            // The session is valid. Call next to conitnue processing the request
            next();
        } else{
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }
    }).catch((e) => {
        res.status(401).send(e);
    })
  }

  /* END MIDDLEWARE */


app.get('/lists', authenticate, (req, res) => {
    // return an array of lists in the DB that belong to the authenticated user
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
})


app.post('/lists', authenticate, (req, res) => {
    //Create a new list 
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    })
    newList.save().then((listDoc) => {
        // Full list document is returned
        res.send(listDoc);
    })
})

app.patch('/lists/:id', authenticate, (req, res) => {
    // Update a list with new values
    List.findOneAndUpdate({_id: req.params.id, _userId: req.user_id}, {
        $set: req.body
    }).then(() => {
        res.send({message: 'Updated successfully'});
    })
})

app.delete('/lists/:id', authenticate, (req, res) => {
    // delete the specifid list
    List.findOneAndDelete({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removeListDoc) =>{
        res.send(removeListDoc);

        // Delete all tasks associated with the deleted list
        deleteTasksFromList(removeListDoc.id);
    })
})

// API calls for tasks

app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    // return all of the tasks that belong to a specific list
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // Create a new task in the specified list

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // Currently autheticated user can create tasks
            return true;
        }

        // else - the user object is undefined
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            });
        } else {
            res.sendStatus(404);
        }
    })
});

app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // Update an existing task
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // Currently autheticated user can update tasks within this list
            return true;
        }

        // else - the user object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // the currently authenticated user can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }).then(() => {
                res.sendStatus(200);
            })
        } else {
            res.sendStatus(404);
        }
    })
});

app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object is valid
            // Currently autheticated user can update tasks within this list
            return true;
        }

        // else - the user object is undefined
        return false;
    }).then((canDeleteTasks) => {
        if (canDeleteTasks) {
            Task.findOneAndDelete({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
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
    }).then((authTokens) => {
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

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // session created successfuly and the refresh token is returned
            // now the access auth token is generated
            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token is generated successfully
                // both the access token and the auth token get returned
                return{accessToken, refreshToken}
            }).then((authTokens) => {
                // construct and the send the response to the user with their auth tokens in the header
                res
                    .header('x-refresh-token', authTokens.refreshToken)
                    .header('x-access-token', authTokens.accessToken)
                    .send(user);
            }).catch((e) => {
                res.status(400).send(e);
            })
        })
    }).catch((error) => {
        console.log(error);
        res.status(404).send(error);
    })

})

app.get("/users/me/access-token", verifySession, (req, res) => {
    // we know that the user/caller is autheticated
    // now we have access to the user ID and user object
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

app.patch('/users/me/change-password', (req, res) => {
    let body = req.body;
    User.updatePassword(body._id, body.currentPassword, body.newPassword).then((outPut) =>{
        console.log("2000000000", outPut);
        res.sendStatus(400);
        
    }).catch((e) => {
        res.sendStatus(400).send(e);
    })

    
})



/* HELPER METHODS */
let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from: " + _listId + " were deleted!");
    })
}


app.listen(port, () => {
    console.log("server is listening on port 3000");
})