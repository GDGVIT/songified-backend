const router = require('express').Router()
const verifyToken = require('../middleware/verifyToken')
const Songbook = require('../../models/songbook-model')
const uuid4 = require('uuid4')

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

  Songbook.findOne({ songbookId: req.user.songbookId })
    .then((songbook) => {
      const ourdata = songbook.data
      const newData = {
        songId: uuid4(),
        title: req.body.title,
        body: req.body.body
      }
      ourdata.push(newData)
      Songbook.updateOne({ songbookId: req.user.songbookId },
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

  Songbook.findOne({ songbookId: req.user.songbookId })
    .then((songbookData) => {
      const ourdata = songbookData.data
      for (let i = 0; i < ourdata.length; i++) {
        if (ourdata[i].songId === req.body.songId) {
          ourdata[i].title = req.body.title
          ourdata[i].body = req.body.body
        }
      }
      Songbook.updateOne({ songbookId: req.user.songbookId },
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

  Songbook.findOne({ songbookId: req.user.songbookId })
    .then((songbook) => {
      const ourdataDelete = songbook.data
      for (let i = 0; i < ourdataDelete.length; i++) {
        if (ourdataDelete[i].songId === req.body.songId) {
          ourdataDelete.splice(i, 1)
        }
      }
      Songbook.updateOne({ songbookId: req.user.songbookId },
        { $set: { data: ourdataDelete } })
        .then((deleted) => {
          res.status(200).json({
            message: 'song deleted from songbook'
          })
        })
    })
})

router.get('/', verifyToken, (req, res) => {
  Songbook.findOne({ songbookId: req.user.songbookId })
    .then((songbook) => {
      res.status(200).json({
        message: songbook
      })
    })
})

module.exports = router
