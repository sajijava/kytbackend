var passport = require("passport")
var BasicStrategy = require('passport-http').BasicStrategy
var User = require('../../models/UserModel');

passport.use(new BasicStrategy(function(userName, password, callback){

}))
