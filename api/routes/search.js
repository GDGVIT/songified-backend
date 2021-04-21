const express = require('express')
const router = express.Router()
const SongInfo = require('../../models/songInfo-model')

router.post('/songData', (req, res) => {
  if (!req.body.songId) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }
  SongInfo.find({ songId: req.body.songId })
    .then((info) => {
      const data = []
      for (let i = 0; i < info.length; i++) {
        if (info[i].verified) {
          data.push(info[i].detail)
        }
      }

      res.status(200).json({
        userComments: data
      })
    })
})

module.exports = router
