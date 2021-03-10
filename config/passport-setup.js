const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const User = require('../models/user-model')
const Songbook = require('../models/songbook-model')
const uuid4 = require('uuid4')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user)
  })
})

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/redirect'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id })
    .then((currentUser) => {
      if (currentUser) {
        done(null, currentUser)
      } else {
        const id = uuid4()
        new User({
          username: profile.displayName,
          googleId: profile.id,
          points: 0,
          songbookId: id.toString()
        })
          .save()
          .then((newUser) => {
            new Songbook({
              songbookId: id.toString()
            })
              .save()
              .then((newSongbook) => {
                done(null, newUser)
              })
          })
      }
    })
})
)
