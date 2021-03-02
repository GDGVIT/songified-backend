const express = require('express')
const https = require('https')
const router = express.Router()

router.post('/song_and_artist', (req, res) => {
  if (!req.body.song_name) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  if (!req.body.artist) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  const songName = req.body.song_name.split(' ').join('+')
  const artist = req.body.artist.split(' ').join('+')
  const url = 'https://api.getsongbpm.com/search/?api_key=' + process.env.API_KEY + '&type=both&lookup=song:' + songName + ' artist:' + artist

  https.get(url, (response) => {
    console.log(response.statusCode)

    let body = ''

    response.on('data', function (data) {
      body += data
    })

    response.on('end', () => {
      const songData = JSON.parse(body)
      if (songData.search.error) {
        return res.status(200).json({
          error: songData.search.error
        })
      }
      const song = songData.search[0]
      const songTempo = song.tempo
      const songKey = song.key_of
      const songTimeSig = song.time_sig
      res.status(200).json({
        details:
                    {
                      song_tempo: songTempo,
                      song_key: songKey,
                      song_time_sig: songTimeSig
                    }
      })
    })
  })
})

router.post('/song', (req, res) => {
  if (!req.body.song_name) {
    res.status(400).json({
      error: 'missing required parameter. refer documentation'
    })
  }

  const songName = req.body.song_name.split(' ').join('+')
  const url = 'https://api.getsongbpm.com/search/?api_key=' + process.env.API_KEY + '&type=song&lookup=' + songName

  https.get(url, (response) => {
    console.log(response.statusCode)

    let body = ''

    response.on('data', (data) => {
      body += data
    })

    response.on('end', () => {
      const songDataOfSong = JSON.parse(body)
      if (songDataOfSong.search.error) {
        return res.status(200).json({
          error: songDataOfSong.search.error
        })
      }

      const song = songDataOfSong.search[0]

      const songId = song.id

      const url2 = 'https://api.getsongbpm.com/song/?api_key=' + process.env.API_KEY + '&id=' + songId

      https.get(url2, (response) => {
        console.log(response.statusCode)

        let body2 = ''

        response.on('data', (data) => {
          body2 += data
        })

        response.on('end', () => {
          const songDetails = JSON.parse(body2)
          const allDetails = songDetails.song

          const songArtist = allDetails.artist.name
          const songTempo = allDetails.tempo
          const songTimeSig = allDetails.time_sig
          const songKey = allDetails.key_of

          res.status(200).json({
            details:
                        {
                          artist: songArtist,
                          song_tempo: songTempo,
                          song_key: songKey,
                          song_time_sig: songTimeSig
                        }
          })
        })
      })
    })
  })
})

module.exports = router
