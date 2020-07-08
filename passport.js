var config = require('../config/database');
// config/passport.js
var LocalStrategy   = require('passport-local').Strategy;
// expose this function to our app using module.exports
module.exports = function(passport) {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            var Quary = "SELECT * FROM authorize_users WHERE username='"+username+"'";
            config.query(Quary,function (err, user) {
            if (err) { return done(err); }
            
            if (user.length==0) {
                console.log("Incorrect username");
              return done(null, false, { message: 'Incorrect username.' });
            }else{
                var user_password = user[0].password;
                if (user_password!=password) {
                    console.log("Incorrect password");
                  return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            }
           
           
          });
        }
      ));
    
      passport.serializeUser(function(user, done) {
        done(null, user[0].id);
      });
      
      passport.deserializeUser(function(id, done) {
        var Quary2 = "SELECT * FROM authorize_users WHERE id='"+id+"'";
        config.query(Quary2,function (err, user) {
        if (err) { return done(err); }
          done(err, user);
        });
      });

};