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
          data.push(info[i])
        }
      }

      res.status(200).json({
        userComments: data
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

module.exports = router
