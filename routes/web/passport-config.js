const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')

var session_storage = require('sessionstorage')
const jwt = require('jsonwebtoken')

// Load User model
const User = require('../../models/User');
const Session = require('../../models/Session');


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {

            //STORING EMAIL IN SESSION STORAGE
            session_storage.setItem('username', email)
            console.log(session_storage.getItem('username'))

            //SET NEW SESSION TOKEN INTO SESSION STORAGE.
            const token = require('crypto').randomBytes(64).toString('hex')
            session_storage.setItem('access_token', token)
            console.log(session_storage.getItem('access_token'))

            //STORE SESSION TOKEN IN SESSION
            Session.update({ User_id: user._id }, {
              $set: {
                access_token: token,
              }
          })
          .exec()

            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};