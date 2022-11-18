var express = require('express');
var app = express();
var user = require('../model/User.js');
var post = require('../model/Post.js')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json())
app.use(urlencodedParser)

app.get('/users/', (req, res) => {
    user.findAll((err, result) => {
        if (!err) {
            return res.send(result)
        } else {
            console.log(result)
            return res.status(500).send(result)
        }
    })

})

app.get("/users/:userID/", (req, res, next) => {
    const userID = parseInt(req.params.userID);
    // if userID is not a number, send a 400.
    if (isNaN(userID)) {
        res.status(400).send();
        return;
    }

    user.findByID(userID, (error, user) => {
        if (error) {
            res.status(500).send();
            return;
        };

        // send a 404 if user is not found.
        if (user === null) {
            res.status(404).send();
            return;
        };
        return res.status(200).send(user);
    });
});

app.post("/users/", (req, res, next) => {
    user.insert(req.body, (error, userID) => {
        if (error) {
            console.log(error);
            res.status(500).send();
            return;
        };
        return res.status(201).send({
            userID
        });
    });
});

app.put("/users/:userID/", (req, res, next) => {
    const userID = parseInt(req.params.userID);
    if (isNaN(userID)) {
        res.status(400).send();
        return;
    }

    user.edit(userID, req.body, (error) => {
        if (error) {
            console.log(error);
            res.status(500).send();
            return;
        };
        return res.status(204).send();
    });
});

app.get('/users/:userID/friends', (req, res) => {
    const userID = parseInt(req.params.userID);
    if (isNaN(userID)) {
        res.status(400).send();
        return;
    }
    user.showFriends(userID, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send(err)
            return
        } else {
            return res.status(200).send(result)
        }
    })
})

app.post('/users/:userID/friends/:friendID', (req, res) => {
    const userID = req.params.userID
    const friendID = req.params.friendID

    if (userID === friendID) {
        res.status(400).send()
        return
    }

    if (isNaN(userID) || isNaN(friendID)) {
        res.status(400).send();
        return;
    }

    user.addFriend(userID, friendID, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(201).send()
            } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
                return res.status(400).send()
            } else {
                return res.status(500).send()
            }
        } else {
            return res.status(201).send()
        }
    })
})

app.delete('/users/:userID/friends/:friendID', (req, res) => {
    const userID = req.params.userID
    const friendID = req.params.friendID

    if (isNaN(userID) || isNaN(friendID) || userID === friendID) {
        res.status(500).send()
        return
    }

    user.removeFriend(userID, friendID, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send()
            return
        } else {
            res.status(204).send()
            return
        }
    })
})

//Posting on friend book endpoints but why

app.get('/posts/', (req, res) => {
    post.findAll((err, result) => {
        if (!err) {
            res.status(200).send(result)
            return
        } else {
            console.log(result)
            res.status(500).send(result)
            return
        }
    })
})

app.post('/posts/', (req, res) => {
    post.insert(req.body, (err, result) => {
        if (!err) {
            res.status(201).send({ result })
            return
        } else {
            res.status(500).send(result)
            return
        }
    })
})

app.get("/posts/:postID/", (req, res, next) => {
    const postID = parseInt(req.params.postID);
    // if postID is not a number, send a 400.
    if (isNaN(postID)) {
        res.status(400).send();
        return;
    }

    post.findByID(postID, (error, post) => {
        if (error) {
            res.status(500).send();
            return;
        };

        // send a 404 if post is not found.
        if (post === null) {
            res.status(404).send();
            return;
        };
        res.status(200).send(post);
        return
    });
});

app.delete('/posts/:postid/', function (req, res) {
    var postid = req.params.postid

    post.delete(postid, function (err, result) {
        if (!err) {
            res.status(204).send()
            return
        } else {
            console.log(err)

            res.status(500).send()
            return
        }
    })
})

app.put("/posts/:postID/", (req, res) => {
    const postID = parseInt(req.params.postID);
    if (isNaN(postID)) {
        return res.status(400).send();

    }

    post.edit(postID, req.body, (error, results) => {
        if (results === 0) {
            return res.status(404).send()
        }else if (error) {
            console.log(error);
            return res.status(500).send();
        }else {
            return res.status(204).send();
        }
    });
});

app.post('/posts/:postID/likers/:likeID/', (req, res) => {
    const likerID = req.params.likeID
    const postID = req.params.postID
    if (isNaN(postID) || isNaN(likerID)) {
        res.status(400).send();
        return;
    }
    post.like(postID, likerID, (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(201).send()
                return
            }
            res.status(500).send()
            return
        } else {
            res.status(201).send()
            return
        }
    })
})

app.delete('/posts/:postID/likers/:likeID/', (req, res) => {
    const likerID = req.params.likeID
    const postID = req.params.postID
    if (isNaN(postID) || isNaN(likerID)) {
        res.status(400).send();
        return;
    }
    post.unlike(postID, likerID, (err, result) => {
        if (err) {
            res.status(500).send()
            return
        } else {
            res.status(204).send()
            return
        }
    })
})

app.get("/users/:userID/posts/", (req, res, next) => {
    const userID = parseInt(req.params.userID);
    // if userID is not a number, send a 400.
    if (isNaN(userID)) {
        res.status(400).send();
        return;
    }

    post.findByUserID(userID, (error, result) => {
        if (error) {
            res.status(500).send(error);
            return;
        };

        // send a 404 if post is not found.
        if (result === null) {
            res.status(404).send();
            return;
        };
        res.status(200).send(result);
        return
    });
});

app.get('/posts/:postID/likers', (req, res) => {
    const postID = parseInt(req.params.postID)

    if (isNaN(postID)) {
        res.status(400).send()
        return
    }

    post.findLikers(postID, (err, result) => {
        if (err) {
            res.status(500).send(error)
            return
        }
        if (result === null) {
            res.status(404).send()
            return
        }
        res.status(200).send(result)
        return
    })
})

module.exports = app
