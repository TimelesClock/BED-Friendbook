var express = require('express');
var app = express();
var user = require('../model/User.js');
var post = require('../model/Post.js')
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config.js");
const isLoggedInMiddleware = require("../auth/isLoggedInMiddleware");

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

app.put("/users/:userID/", isLoggedInMiddleware, (req, res, next) => {
    const userID = parseInt(req.params.userID);
    if (isNaN(userID)) {
        res.status(400).send();
        return;
    }
    if (userID !== req.decodedToken.user_id) {
        res.status(403).send();
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

app.post('/users/:userID/friends/:friendID', isLoggedInMiddleware, (req, res) => {
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

    if (userID !== req.decodedToken.user_id) {
        res.status(403).send();
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

app.delete('/users/:userID/friends/:friendID', isLoggedInMiddleware, (req, res) => {
    const userID = req.params.userID
    const friendID = req.params.friendID

    if (isNaN(userID) || isNaN(friendID) || userID === friendID) {
        res.status(500).send()
        return
    }
    if (userID !== req.decodedToken.user_id) {
        res.status(403).send();
        return;
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
    const userID = req.fk_poster_id
    if (userID !== req.decodedToken.user_id) {
        res.status(403).send();
        return;
    }

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

app.delete('/posts/:postid/',isLoggedInMiddleware, function (req, res) {
    const postID = parseInt(req.params.postid)

    var postIds = []
    post.findByUserID(req.decodedToken.user_id, (error, result) => {
        if (error) {
            console.log(error)
            return res.status(500).send()
        } else {

            postIds = result.map(posts => posts.id)
            console.log(postIds === [])
            if (!postIds.includes(postID) && postIds.length != 0) {
                return res.status(403).send()
     
            }
            else if(postIds.length == 0){
                return res.status(204).send()
            }
            else {
                post.delete(postID, function (err, result) {
                    if (!err) {
                        res.status(204).send()
                        return
                    } else {
                        console.log(err)

                        res.status(500).send()
                        return
                    }
                })
            }


        }
    })


})

app.put("/posts/:postID/", isLoggedInMiddleware, (req, res) => {
    const postID = parseInt(req.params.postID);
    if (isNaN(postID)) {
        return res.status(400).send();

    }
    var postIds = []
    post.findByUserID(req.decodedToken.user_id, (error, result) => {
        if (error) {
            console.log(error)
            return res.status(500).send()
        } else {

            postIds = result.map(posts => posts.id)
            if (!postIds.includes(postID)) {
                return res.status(403   ).send()
            } else {
                post.edit(postID, req.body, (error, results) => {
                    if (results === 0) {
                        return res.status(404).send()
                    } else if (error) {
                        console.log(error);
                        return res.status(500).send();
                    } else {
                        return res.status(204).send();
                    }
                });
            }


        }
    })


});

app.post('/posts/:postID/likers/:likeID/',isLoggedInMiddleware, (req, res) => {
    var likerID = req.params.likeID
    var postID = req.params.postID
    if (isNaN(postID) || isNaN(likerID)) {
        res.status(400).send();
        return;
    }
    likerID = parseInt(likerID)
    postID = parseInt(postID)
    if(likerID !== req.decodedToken.user_id){
        return res.status(403).send()
    }

    post.like(postID, likerID, (err, result) => {

        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(204).send()
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

app.delete('/posts/:postID/likers/:likeID/',isLoggedInMiddleware, (req, res) => {
    var likerID = req.params.likeID
    var postID = req.params.postID
    if (isNaN(postID) || isNaN(likerID)) {
        res.status(400).send();
        return;
    }

    likerID = parseInt(likerID)
    postID = parseInt(postID)

    if(likerID !== req.decodedToken.user_id){
        return res.status(403).send()
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

app.post("/login/", (req, res) => {
    user.verify(
        req.body.username,
        req.body.password,
        (error, user) => {
            if (error) {
                res.status(500).send();
                return;
            }
            if (user === null) {
                res.status(401).send();
                return;
            }
            const payload = { user_id: user.id };
            jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" }, (error,
                token) => {
                if (error) {
                    console.log(error);
                    res.status(401).send();
                    return;
                }
                res.status(200).send({
                    token: token,
                    user_id: user.id
                });
            })
        });
});

module.exports = app
