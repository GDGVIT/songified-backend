const router = require('express').Router()
const https = require('https')

router.get('/', (req1, res1) => {
  const options = {
    method: 'POST',
    hostname: 'app.cyanite.ai',
    path: '/graphql',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.CYANITE_ACCESS_TOKEN
    }
  }

  const req = https.request(options, (res) => {
    const chunks = []

    res.on('data', (chunk) => {
      chunks.push(chunk)
    })

    res.on('end', (chunk) => {
      const body = Buffer.concat(chunks)
      console.log(body.toString())
      res1.status(200).json(JSON.parse(body.toString()))
    })

    res.on('error', (error) => {
      console.error(error)
    })
  })

  const postData = JSON.stringify({
    query: `query LibraryTracksQuery {
                libraryTracks(first: 10) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }`,
    variables: {}
  })

  req.write(postData)

  req.end()
})

router.post('/cyaniteWebHook', (req, res) => {
  console.log(req.body)
  res.json({
    'Test Accessed': 'Accessed'
  })
})

module.exports = router
