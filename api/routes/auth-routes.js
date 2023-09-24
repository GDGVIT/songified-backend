const router = require('express').Router()
const admin = require('firebase-admin')
const User = require('../../models/user-model')
const Songbook = require('../../models/songbook-model')
const uuid4 = require('uuid4')
const jwt = require('jsonwebtoken')

admin.initializeApp({
  credential: admin.credential.applicationDefault()
})

router.get('/logout', (req, res) => {
  res.status(200).json({
    message: 'logout successful'
  })
})

router.post('/login', (req, res) => {
  if (!req.body.idToken) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }
  // idToken comes from the client app
  admin
    .auth()
    .verifyIdToken(req.body.idToken.toString())
    .then((decodedToken) => {
      User.findOne({ email: decodedToken.email })
        .then((currentUser) => {
          if (currentUser) {
            const token = jwt.sign({ _id: currentUser._id, name: currentUser.username, email: decodedToken.email, points: currentUser.points, thumbnail: currentUser.thumbnail, songbookId: currentUser.songbookId }, process.env.TOKEN_SECRET)

            return res.status(200).json({
              success: true,
              authToken: token
            })
          } else {
            const id = uuid4()
            const songbookDataToPush = {
              id: id.toString(),
              songbookName: 'Songbook One'
            }
            new User({
              username: decodedToken.name,
              thumbnail: decodedToken.picture,
              email: decodedToken.email,
              points: 0,
              songbookId: [songbookDataToPush]
            })
              .save()
              .then((newUser) => {
                new Songbook({
                  songbookId: id.toString(),
                  songbookName: 'Songbook One'
                })
                  .save()
                  .then((newSongbook) => {
                    const token = jwt.sign({ _id: newUser._id, name: newUser.username, email: newUser.email, points: newUser.points, thumbnail: newUser.thumbnail, songbookId: newUser.songbookId }, process.env.TOKEN_SECRET)

                    return res.status(200).json({
                      success: true,
                      authToken: token
                    })
                  })
              })
              .catch((error) => {
                // Handle error
                return res.status(400).json({
                  success: false,
                  err: error
                })
              })
          }
        })
        .catch((error) => {
          // Handle error
          return res.status(400).json({
            success: false,
            err: error
          })
        })

      // ...
    })
    .catch((error) => {
      // Handle error
      return res.status(400).json({
        success: false,
        err: error
      })
    })
})

module.exports = router
