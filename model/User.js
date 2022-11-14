const db = require('./databaseConfig')

const User = {

    findByID: function (userID, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {

            if (err) {//database connection gt issue!

                console.log(err);
                return callback(err, null);
            } else {
                // We can use "?" as placeholder for user provided data.
                // The userID is passed in through the second parameter of the query  
                // method.
                // This is done instead of using string templates to prevent SQL 
                // injections.
                // https://github.com/mysqljs/mysql#escaping-query-values

                const findUserByIDQuery = "SELECT * FROM user WHERE id = ?;";
                conn.query(findUserByIDQuery, [userID], (error, results) => {
                    conn.end();
                    if (error) {
                        return callback(error, null);

                    };
                    if (results.length === 0) {
                        callback(null, null);
                        return;
                    };

                    return callback(null, results);
                });
            }
        });
    },

    findAll: function(callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err,null)
            }else{
                const sql = "SELECT * FROM user"
                conn.query(sql,(err,results)=>{
                    conn.end()
                    if(err){
                        console.log(err)
                        return callback(err,null)
                    }else{
                        return callback(null,results)
                    }
                })
            }
        })
    },

    insert:function(user,callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err,null)
            }else{
                const sql = 'INSERT INTO user (username,full_name,bio,date_of_birth) VALUES (?,?,?,?)'
                conn.query(sql,[user.username,user.full_name,user.bio,user.date_of_birth],(err,results)=>{
                    conn.end()
                    if(err){
                        return callback(err,null)
                    }else{
                        return callback(null,results.insertId)
                    }
                })
            }
        })
    },

    edit:function(userID,user,callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err,null)
            }else{
                const sql = 'UPDATE user SET full_name =?,username = ?,bio = ?,date_of_birth = ? WHERE id = ?'
                conn.query(sql,[user.full_name,user.username,user.bio,user.date_of_birth,userID],(err,results)=>{
                    conn.end()
                    if(err){
                        return callback(err)
                    }else{
                        return callback(null)
                    }
                })
            }
        })
    },

    addFriend:function(userIDOne,userIDTwo,callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err)
            }else{
                const sql = 'INSERT INTO friendship (fk_friend_one_id,fk_friend_two_id) VALUES (?,?)'
                conn.query(sql,[userIDOne,userIDTwo],(err,results)=>{
                    conn.end()
                    if(err){
                        return callback(err,null)
                    }else{
                        return callback(null)
                    }
                })
            }
        })
    },

    removeFriend(userIDOne,userIDTwo,callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err)
            }else{
                const sql = 'DELETE FROM friendship WHERE fk_friend_one_id = ? AND fk_friend_two_id = ?'
                conn.query(sql,[userIDOne,userIDTwo],(err,results)=>{
                    conn.end()
                    if(err){
                        console.log(err)
                        return callback(err,null)
                    }else{
                        return callback(null)
                    }
                })
            }
        })
    },

    showFriends:function(userID,callback){
        var conn = db.getConnection()
        conn.connect(function(err){
            if(err){
                console.log(err)
                return callback(err)
            }else{
                const sql = 'SELECT u.* FROM user u,friendship f WHERE f.fk_friend_one_id = ? AND f.fk_friend_two_id = u.id'
                conn.query(sql,[userID],(err,results)=>{
                    if(err){
                        console.log(err)
                        return callback(err,null)
                    }else{
                        return callback(null,results)
                    }
                })
            }
        })
    }

}


module.exports = User