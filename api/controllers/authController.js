var User = require('../../models/UserModel')

var Notifications = require('../../models/UserSessionModel')
const dbpool  = require('../models/db')
const uuidv4 = require('uuid/v4');
const jwt    = require('jsonwebtoken')
const secret = "4c172f5d-67b6-439c-b717-2f100eab867a"

exports.validateJwtToken = function(req,res,next){
  //console.log(req)
  if(req.headers['authorization']){
    try{
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(authorization[1], secret);
        return next();
      }
    }catch(err){
      return res.status(403).send("Valid token not found.");
    }
  }else{
    return res.status(401).send("Valid token not found.");
  }
}

exports.sendResult = function(req,res){
  if(req.body && req.body.data){
    delete req.body.data.secret
    res.status(200).send(req.body.data)
  }else{
    res.status(500).send("something unknown happened")
  }

}
exports.getUserById = function(req, res, next){
    dbpool.query("SELECT * FROM  USERS where email = ?",
    [req.params.id],(error,result) => {
      if(error) throw res.status(400).send(error);

      if(result && result.length > 0){
        req.body.data = new User(result[0])
        next()
      }else{
        res.status(500).send("Userid:"+req.body.email+" could not be found. Probably the user does not exist")
      }

  })
}

exports.validateUserCredentials = function(req, res, next){
    dbpool.query("SELECT * FROM  USERS where email = ? and password = ? and active is true",
    [req.body.email, req.body.password],(error,result) => {
      if(error) throw res.status(400).send(error);

      if(result && result.length > 0){
        req.body.data = new User(result[0])
        if(req.body.data.email == req.body.email && req.body.data.password == req.body.password){
          req.body.tracking = 'LOGGED_IN'
          next()
        }else{
          res.status(400).send("Invalid email or password")
        }
      }else{
        res.status(500).send("Email or the password is invalid. Please try again.")
      }
  })
}

exports.logout = function(req, res, next){
  req.body.tracking= 'LOGGED_OUT'
  console.log(req.body)
  next()
}

exports.trackloging = function(req,res, next){
  console.log("tracklogin")
  if(req.body.tracking){
    dbpool.query("INSERT INTO USER_SESSION (EMAIL, ACTION) VALUES(?,?)",[req.body.email,req.body.tracking],(error,result) => {
      if(error) throw res.status(400).send(error);
      next()
    })
  }
}

exports.updateLogin = function(req, res, next){
  console.log("update login")
  if(req.body.tracking){
    dbpool.query("UPDATE USERS SET LOGGED_IN = ? where email = ?",[(req.body.tracking == 'LOGGED_IN'),req.body.email],(error,result) => {
      if(error) throw res.status(400).send(error);
      next()
    })
  }
}
exports.checkDuplicate = function(req,res,next){
  dbpool.query("SELECT * FROM  USERS where email = ? and active is true",
  [req.body.email],(error,result) => {
    if(error) throw res.status(400).send(error);

    if(result && result.length > 0){
      res.status(400).send(req.body.email+" is already taken. Please use another email.");
    }else{
      next()
    }

  })
}
exports.createUser = function(req, res, next){
    //secret = uuidv4()
    dbpool.query("INSERT INTO USERS(FIRST_NAME,LAST_NAME,EMAIL,PASSWORD,SECRET_CODE) VALUES(?,?,?,?,?)",
    [req.body.firstName,req.body.lastName, req.body.email, req.body.password,secret],(error,result) => {
      if(error) throw res.status(400).send(error);
      req.params.id = req.body.email
      req.body.tracking = 'LOGGED_IN'
      next()
  })
}

exports.generateToken = function (req,res,next){
  req.body.data.token = {'token_type':'Bearer', 'access_type':jwt.sign({id:req.body.data.email}, req.body.data.secret, {
              expiresIn: 1440 // expires in 24 hours
        })};

  next()
}


// function createUserSession(user){
//   return new Promise(function(resolve,reject){
//     token = uuidv4()
//     console.log(token)
//     dbpool.query("INSERT INTO USER_SESSION(USER_ID,TOKEN) VALUES((SELECT ID FROM USERS WHERE EMAIL = ? ),?)",
//     [user.email,token],(error,result) => {
//       if(error) throw reject(error);
//
//       userSession = new UserSession()
//       userSession.email = user.email
//       userSession.password = user.password
//       userSession.token = token
//       resolve(userSession)
//     });
//
//
//   });
// }
// function getUserFromCredentials(req){
//   return new Promise(function(resolve,reject){
//
//     dbpool.query("select * from users where u.email = ? and password = ?",
//     [req.body.email, req.body.password],(error,result) => {
//       if(error) throw reject(error);
//       reject(new User(result[0]))
//
//     })
//   })
// }





// exports.logout = function(req, res){
//   console.log("logout")
//   console.log(req.params)
//   console.log(req.body)
// }
//
// exports.getUser = function(req, res){
//   console.log("getUser")
//   console.log(req.params)
//   console.log(req.body)
// }
