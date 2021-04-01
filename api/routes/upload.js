const router = require('express').Router()
const axios = require('axios')

router.get('/', (req, res) => {
  const data = JSON.stringify({
    query: `query analysis($id: ID!) {
      inDepthAnalysis(recordId: $id) {
        __typename
        ... on Error {
          message
        }
        ... on InDepthAnalysis {
          id
          title
          fullScaleMusicalAnalysis {
            __typename
            ... on FullScaleMusicalAnalysisFailed {
              error {
                __typename
                ... on Error {
                  message
                }
              }
            }
            ... on FullScaleMusicalAnalysisFinished {
              result {
                bpm
                key {
                  values
                  confidences
                }
              }
            }
          }
        }
      }
    }`,
    variables: { id: 1294396 }
  })

  const config = {
    method: 'post',
    url: 'https://app.cyanite.ai/graphql',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.CYANITE_ACCESS_TOKEN
    },
    data: data
  }

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data))
      res.status(200).json(response.headers)
    })
    .catch(function (error) {
      console.log(error)
    })
})

router.post('/cyaniteWebHook', (req, res) => {
  console.log(req.body)
  res.status(200).json({
    'Test Accessed': 'Accessed'
  })
})

module.exports = router
