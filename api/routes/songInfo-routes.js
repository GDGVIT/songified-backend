const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const SongInfo = require('../../models/songInfo-model')
const User = require('../../models/user-model')

router.post('/', verifyToken, (req, res) => {
  if (!req.body.songId) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.songName) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.detail) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  User.findOne({ email: req.user.email })
    .then((currentUser) => {
      new SongInfo({
        user: currentUser,
        name: req.user.name,
        songId: req.body.songId,
        songName: req.body.songName,
        detail: req.body.detail
      })
        .save()
        .then((newSongInfo) => {
          res.status(200).json({
            message: 'song info added, to be verified'
          })
        })
        .catch((error) => {
          // Handle error
          return res.status(400).json({
            success: false,
            err: error
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
})

router.get('/', verifyToken, (req, res) => {
  SongInfo.find()
    .then((infos) => {
      res.status(200).json({
        infos: infos
      })
    })
})

router.post('/authenticate', verifyToken, (req, res) => {
  if (req.user.name === 'admin songified') {
    if (!req.body.id) {
      return res.status(400).json({
        errorMessage: 'missing required parameters. refer documentation'
      })
    }

    SongInfo.findOne({ _id: req.body.id }).then((songInfo) => {
      if (songInfo.verified) {
        return res.status(200).json({
          Message: 'Already Verified'
        })
      }
      SongInfo.updateOne({ _id: req.body.id }, { $set: { verified: true } })
        .then((verified) => {
          User.findOne({ _id: songInfo.user._id })
            .then((user) => {
              let points = user.points
              points += 10
              User.updateOne({ _id: songInfo.user._id }, { $set: { points: points } })
                .then((updated) => {
                  res.status(200).json({
                    Message: 'Verified Successfully'
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
        })
        .catch((error) => {
          // Handle error
          return res.status(400).json({
            success: false,
            err: error
          })
        })
    })
  } else {
    res.status(400).json({
      message: 'Unauthorized Access Prevented'
    })
  }
})

router.post('/deauthenticate', verifyToken, (req, res) => {
  if (req.user.name === 'admin songified') {
    if (!req.body.id) {
      return res.status(400).json({
        error: 'missing required parameters. refer documentation'
      })
    }

    SongInfo.findOne({ _id: req.body.id }).then((unverifySongInfo) => {
      if (!unverifySongInfo.verified) {
        return res.status(200).json({
          Message: 'Already Unverified'
        })
      }
      SongInfo.updateOne({ _id: req.body.id }, { $set: { verified: false } })
        .then((unverified) => {
          User.findOne({ _id: unverifySongInfo.user._id })
            .then((userUnverified) => {
              let points = userUnverified.points
              points -= 10
              User.updateOne({ _id: unverifySongInfo.user._id }, { $set: { points: points } })
                .then((updatedUnverify) => {
                  res.status(200).json({
                    Message: 'Unverified Successfully'
                  })
                })
                .catch((error) => {
                  // Handle error
                  return res.status(400).json({
                    success: false,
                    err: error
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
        })
    })
  } else {
    res.status(400).json({
      message: 'Unauthorized Access Prevented'
    })
  }
})

module.exports = router
