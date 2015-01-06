var express = require("express"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  cookieParser = require("cookie-parser"),
  session = require("cookie-session"),
  db = require("./models/index"),
  flash = require('connect-flash'),
  request = require("request"),
  async = require("async"),
  app = express();
//google stuff
// var readline = require('readline');

// var google = require('googleapis/lib/googleapis.js');
// var OAuth2Client = google.auth.OAuth2;
// var plus = google.plus('v1');

// // Client ID and client secret are available at
// // https://code.google.com/apis/console
// var CLIENT_ID = "";
// var CLIENT_SECRET = "";
// var REDIRECT_URL = "";

// var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// var rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });


// retrieve an access token
// getAccessToken(oauth2Client, function() {
//   // retrieve user profile
//   plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
//     if (err) {
//       console.log('An error occured', err);
//       return;
//     }
//     console.log(profile.displayName, ':', profile.tagline);
//   });
// });



// oauth2Client.setCredentials({
//   access_token: req.user.accessToken,
//   refresh_token: req.user.refreshToken
// });

// plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
//   // handle err and response
// });


// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}) );
app.use(express.static(__dirname + '/public'));
// we are going to create a cookie that will store our session data
// ideally we want this secret to be a string of random numbers
// we use the secret to parse the data from the cookie
// This is cookie-based session middleware so technically this creates a session
// This session can expire and doesn't live on our server

// The session middleware implements generic session functionality with in-memory storage by default. It allows you to specify other storage formats, though.
// The cookieSession middleware, on the other hand, implements cookie-backed storage (that is, the entire session is serialized to the
  //cookie, rather than just a session key. It should really only be used when session data is going to stay relatively small.
// And, as I understand, it (cookie-session) should only be used when session data isn't sensitive.
// It is assumed that a user could inspect the contents of the session, but the middleware will detect when the data has been modified.
app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.User.find({
      where: {
        id: id
      }
    })
    .done(function(error,user){
      done(error, user);
    });
});

//you get sent here from /login by google
app.get('/oauth2callback/',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    //console.log(req,res);
    console.log("on my way home");
//     oauth2Client.setCredentials({
//   access_token: 'ACCESS TOKEN HERE',
//   refresh_token: 'REFRESH TOKEN HERE'
// });
//     plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, response) {
//   console.log("response is", response, "error is", err);
// });
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

app.get('/', function(req,res){
  // check if the user is logged in
  if(!req.user) {
    res.render("index", { username: ""});
  }
  else{
    res.redirect('/home');
  }
});


// app.get('/login', function(req,res){
//   // check if the user is logged in
//   if(!req.user) {
//     res.render("login", {message: req.flash('loginMessage'), username: ""});
//   }
//   else{
//     res.redirect('/home');
//   }
// });

app.get('/login',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email',
                                            "https://www.googleapis.com/auth/drive.readonly",
                                            "https://www.google.com/m8/feeds",
                                            "https://www.googleapis.com/auth/userinfo.email",
                                            "https://www.googleapis.com/auth/userinfo.profile"
                                            ], redirect_uri:"http://localhost:3000/auth/google/callback",accessType: 'offline', approvalPrompt: 'force' }),  function(req, res){
    console.log("This should never appear");
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });


app.get('/home', function(req,res){
  console.log("made it home");
// getAccessToken(oauth2Client, function() {
//   // retrieve user profile
//   plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
//     if (err) {
//       console.log('An error occured', err);
//       return;
//     }
//     console.log(profile.displayName, ':', profile.tagline);
//   });
  var refresh = false;
  var courses = [];
  var useRefreshToken = function(){
    refresh = true;
    console.log("usingRefreshToken");
    var reqObj = {
      url: "https://accounts.google.com/o/oauth2/token",
      headers: {'Authorization': 'Bearer ' + req.user.accessToken},
      form: {
        refresh_token: req.user.refreshToken,
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        grant_type: "refresh_token"
      }
    };
    // console.log(reqObj);
    request.post(reqObj, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("200","error is ", error," response is", response, " body is ",body);
        body = JSON.parse(body);
        console.log("body.access_token ", body.access_token);
        console.log("before accessToken", req.user.accessToken);
        req.user.updateAttributes({
          accessToken : body.access_token
        }).done(function(err, dbUser){
          console.log("after accessToken", req.user.accessToken);
          console.log("dbUser.accessToken", dbUser.accessToken);
        });
      }else{
        //console.log("error is ", error," response is", response, " body is ",body);
      }
    });
  };
  var makeQuery = function(course, callback){
    // console.log("course is", course);
    var url = 'https://www.googleapis.com/drive/v2/files/' + course.googleId;
    var reqObj = {
      url: url,
      headers: {Authorization: 'Bearer ' + req.user.accessToken}
    };
    // console.log("reqObj", reqObj);
    request(reqObj, function (error, response, body) {
      //console.log("7787997","error is ", error," response is", response.statusCode, " body is ",body);
      if (!error && response.statusCode == 200) {
        var date = new Date(JSON.parse(body).modifiedDate);
        console.log(date);
        var today = Date.now() - 86400000;
        console.log(today);
        console.log(date.getTime());
        // console.log("body is ", date.getTime()); // Print the google web page.
        // console.log(Date.now() - Date.now()%86400000);
        // console.log(Date.now() - Date.now()%86400000 > date.getTime());
        if(date.getTime()>today){
          console.log("you have " + course.name + " homework");
          courses.push({name: course.name, url: "https://docs.google.com/document/d/"+course.googleId +"/preview", updated: true});
        }else{
          console.log("you do not have " + course.name + " homework");
          courses.push({name: course.name, url: "https://docs.google.com/document/d/"+course.googleId +"/preview", updated: false});
        }
      }else{
        console.log("status is ", response.statusCode);
        console.log("error ", error);
        if(response.statusCode == "401"){ //is of the type token expired
          useRefreshToken();
        }
      }
      callback();
    });
  };
// console.log(req.user);
  if(!req.user){
    console.log("redirecting to log-in b/c no user");
    res.render("index", { username: ""});
  }else{
    req.user.getClasses().done(function(err,classes){
      async.each(classes, makeQuery, function(err){
      console.log("hi1");
          res.render("home", {
            refresh: refresh,
            //runs a function to see if the user is authenticated - returns true or false
            isAuthenticated: req.isAuthenticated(),
            //this is our data from the DB which we get from deserializing
            user: req.user,
            //this is the array of courses for this user with a updated key
            courses: courses
          });
      // if any of the saves produced an error, err would equal that error
      });
      console.log("hi");
    });
  }
});


// on submit, create a new users using form values
app.post('/submit', function(req,res){
  // console.log("body is ",req.body, "user is ", req.user, "classes are ", req.body.classes);
  var classes = req.body.classes;
  // console.log("*****classes",classes,"classes*****");
  var user = req.user;

  var makeClass = function(course, callback){
    console.log("url is ", course.url);
    console.log("parsed it is ", parseGDoc(course.url));

    db.Class.findOrCreate({where: {name: course.name, googleId: parseGDoc(course.url)}}
      ).success(function(klass, created){
        if(created){
          console.log("adding class ", klass);
        }else{
          console.log("found class ", klass);
        }
        klass.addUser(user);
        callback();
      });
  };
  async.each(classes, makeClass, function(err){
    console.log("we've made all the classes");
    res.redirect("/home");
  });
});

// authenticate users when logging in - no need for req,res passport does this for us
app.post('/login', passport.authenticate('', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function(req,res){
  //req.logout added by passport - delete the user id/session
  req.logout();
  res.redirect('/');
});

app.delete('/delete', function(req, res){
  console.log("deleting", req.body.googleId);
  var googleId = req.body.googleId;
  db.Class.find({where: {googleId: googleId}}).done(function(err,klass){
    if(err){
      console.log("WE MESSED UP...");
      console.log(err);
    }
    else{
      klass.removeUser(req.user);
    }
    console.log("DIS IS KLASS")
    console.log(klass)
    res.send(klass);
  });
});

// catch-all for 404 errors
app.get('*', function(req,res){
  console.log("404");
  res.status(404);
  res.render('404');
});



var parseGDoc = function(url){
  console.log("url is", url);
  // var reggy = new RegExp()
  var id = url.trim().match("/d/[^\/]*");
  console.log("id is ", id);
  id = id[0].slice(3,id[0].length);
  console.log(id);
  return id;
};




app.listen(process.env.PORT || 3000, function(){
  console.log("get this party started on port 3000");
});

