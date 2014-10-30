var bcrypt = require("bcrypt");
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var salt = bcrypt.genSaltSync(10);
var readline = require('readline');

// var google = require('googleapis/lib/googleapis.js');
// var OAuth2Client = google.auth.OAuth2;
// var plus = google.plus('v1');


// var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

module.exports = function (sequelize, DataTypes){

   var User = sequelize.define('User', {
    googleId: DataTypes.STRING,
    accessToken: DataTypes.STRING,
    refreshToken: DataTypes.STRING
    },

  {
    classMethods: {
      associate: function(db) {
        User.hasMany(db.Class);
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    },
      comparePass: function(userpass, dbpass) {
      // don't salt twice when you compare....watch out for this
        return bcrypt.compareSync(userpass, dbpass);
    },
      createNewUser:function(username, password, err, success ) {
        if(password.length < 6) {
          err({message: "Password should be more than six characters"});
        }
        else{
        User.create({
            username: username,
            password: this.encryptPass(password)
          }).done(function(error,user) {
            if(error) {
              console.log(error);
              if(error.name === 'SequelizeValidationError'){
              err({message: 'Your username should be at least 6 characters long', username: username});
            }
              else if(error.name === 'SequelizeUniqueConstraintError') {
              err({message: 'An account with that username already exists', username: username});
              }
            }
            else{
              success({message: 'Account created, please log in now'});
            }
          });
        }
      },
      } // close classMethods
    } //close classMethods outer

  ); // close define user
// function blah(accessToken, refreshToken, params, profile, done) {
//   console.log(params.expires_in);
//   // save tokens and expiry time
// }

console.log("Client id " + process.env.CLIENTSECRET + "callback is " +process.env.CALLBACKURL);
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: process.env.CALLBACKURL,
    // returnURL : "http://127.0.0.1:3000/auth/google/callback",
    // realm: "http://127.0.0.1:3000"
  },
  function(accessToken, refreshToken, profile, done) {
    // blah(accessToken, refreshToken, params, profile, done);
    console.log("profile.id is", profile.id);
    console.log("accessToken is", accessToken);
    console.log("refreshToken is", refreshToken);    
    User.findOrCreate({
      where: {
        googleId: profile.id
      },
      defaults : {
        accessToken: accessToken, 
        refreshToken: refreshToken, 
        }
      }).done(function (err, user, created) {
        // oauth2Client.setCredentials({
        // access_token: user.accessToken,
        // refresh_token: user.refreshToken
        // });

      console.log("err is", err);
      console.log("user is", user);
      console.log("created is", created);
      return done(err, user);
    }).success(function () {console.log("hi");});
  }
));

  // passport.use(new passportLocal.Strategy({
  //     usernameField: 'username',
  //     passwordField: 'password',
  //     passReqToCallback : true
  //   },

  //   function(req, username, password, done) {
  //     // find a user in the DB
  //     User.find({
  //         where: {
  //           username: username
  //         }
  //       })
  //       // when that's done,
  //       .done(function(error,user){
  //         if(error){
  //           console.log(error);
  //           return done(error, req.flash('loginMessage', 'Oops! Something went wrong.'));
  //         }
  //         if (user === null){
  //           return done(null, false, req.flash('loginMessage', 'Username does not exist.'));
  //         }
  //         if ((User.comparePass(password, user.password)) !== true){
  //           return done(null, false, req.flash('loginMessage', 'Invalid Password'));
  //         }
  //         done(null, user);
  //       });
  //   }));

  return User;
}; // close User function





