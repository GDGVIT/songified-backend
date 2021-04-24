const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const Songbook = require('../../models/songbook-model')
const uuid4 = require('uuid4')
const User = require('../../models/user-model')

router.post('/create', verifyToken, (req, res) => {
  if (!req.body.songbookName) {
    return res.status(400).json({
      erroMessage: 'missing required parameters. refer documentation'
    })
  }
  const id = uuid4()
  new Songbook({
    songbookId: id.toString(),
    songbookName: req.body.songbookName
  })
    .save()
    .then((newSongbook) => {
      User.findOne({ email: req.user.email })
        .then((currentUser) => {
          const songbook = currentUser.songbookId
          // songbook.push(id.toString())
          const songbookDataToPush = {
            id: id.toString(),
            songbookName: req.body.songbookName
          }
          songbook.push(songbookDataToPush)
          User.updateOne({ email: req.user.email }, { $set: { songbookId: songbook } })
            .then((update) => {
              res.status(200).json({
                message: 'songbook created'
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
    .catch((error) => {
      // Handle error
      return res.status(400).json({
        success: false,
        err: error
      })
    })
})

router.patch('/songbookName', verifyToken, (req, res) => {
  if (!req.body.songbookName) {
    return res.status(400).json({
      erroMessage: 'missing required parameters. refer documentation'
    })
  }
  if (!req.body.songbookId) {
    return res.status(400).json({
      erroMessage: 'missing required parameters. refer documentation'
    })
  }

  Songbook.updateOne({ songbookId: req.body.songbookId },
    { $set: { songbookName: req.body.songbookName } })
    .then((update) => {
      User.findOne({ email: req.user.email })
        .then((currentUser) => {
          const songbookData = currentUser.songbookId
          for (let i = 0; i < songbookData.length; i++) {
            if (songbookData[i].id === req.body.songbookId) {
              songbookData[i].songbookName = req.body.songbookName
            }
          }
          User.updateOne({ email: req.user.email }, { $set: { songbookId: songbookData } })
            .then((update) => {
              res.status(200).json({
                message: 'song updated in songbook'
              })
            })
        })
    })
})

router.post('/addSong', verifyToken, (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      erroMessage: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.body) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.songbookId) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  Songbook.findOne({ songbookId: req.body.songbookId })
    .then((songbook) => {
      const ourdata = songbook.data
      const newData = {
        songId: uuid4(),
        title: req.body.title,
        body: req.body.body
      }
      ourdata.push(newData)
      Songbook.updateOne({ songbookId: req.body.songbookId },
        { $set: { data: ourdata } })
        .then((update) => {
          res.status(200).json({
            message: 'song added to songbook'
          })
        })
    })
})

router.patch('/updateSong', verifyToken, (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.songbookId) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.body) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.songId) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  Songbook.findOne({ songbookId: req.body.songbookId })
    .then((songbookData) => {
      const ourdata = songbookData.data
      for (let i = 0; i < ourdata.length; i++) {
        if (ourdata[i].songId === req.body.songId) {
          ourdata[i].title = req.body.title
          ourdata[i].body = req.body.body
        }
      }
      Songbook.updateOne({ songbookId: req.body.songbookId },
        { $set: { data: ourdata } })
        .then((update) => {
          res.status(200).json({
            message: 'song updated in songbook'
          })
        })
    })
})

router.delete('/deleteSong', verifyToken, (req, res) => {
  if (!req.body.songId) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.songbookId) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  Songbook.findOne({ songbookId: req.body.songbookId })
    .then((songbook) => {
      const ourdataDelete = songbook.data
      for (let i = 0; i < ourdataDelete.length; i++) {
        if (ourdataDelete[i].songId === req.body.songId) {
          ourdataDelete.splice(i, 1)
        }
      }
      Songbook.updateOne({ songbookId: req.body.songbookId },
        { $set: { data: ourdataDelete } })
        .then((deleted) => {
          res.status(200).json({
            message: 'song deleted from songbook'
          })
        })
    })
})

router.get('/', verifyToken, (req, res) => {
  if (!req.body.songbookId) {
    return res.status(400).json({
      errorMessage: 'missing required parameters. refer documentation'
    })
  }

  Songbook.findOne({ songbookId: req.body.songbookId })
    .then((songbook) => {
      res.status(200).json({
        message: songbook
      })
    })
})

module.exports = router
