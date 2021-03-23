const router = require('express').Router()
const authCheck = require('./authCheck')
const SongInfo = require('../../models/songInfo-model')
const User = require('../../models/user-model')

router.post('/', authCheck, (req, res) => {
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

  new SongInfo({
    userId: req.user.googleId,
    name: req.user.username,
    songName: req.body.songName.toString().toLowerCase(),
    detail: req.body.detail
  })
    .save()
    .then((newSongInfo) => {
      res.status(200).json({
        message: 'song info added, to be verified'
      })
    })
})

router.get('/', authCheck, (req, res) => {
  SongInfo.find()
    .then((infos) => {
      res.status(200).json({
        infos: infos
      })
    })
})

router.post('/authenticate', authCheck, (req, res) => {
  if (req.user.username === 'admin songified') {
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
          User.findOne({ googleId: songInfo.userId })
            .then((user) => {
              let points = user.points
              points += 10
              User.updateOne({ googleId: songInfo.userId }, { $set: { points: points } })
                .then((updated) => {
                  res.status(200).json({
                    Message: 'Verified Successfully'
                  })
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

router.post('/deauthenticate', authCheck, (req, res) => {
  if (req.user.username === 'admin songified') {
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
          User.findOne({ googleId: unverifySongInfo.userId })
            .then((userUnverified) => {
              let points = userUnverified.points
              points -= 10
              User.updateOne({ googleId: unverifySongInfo.userId }, { $set: { points: points } })
                .then((updatedUnverify) => {
                  res.status(200).json({
                    Message: 'Unverified Successfully'
                  })
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