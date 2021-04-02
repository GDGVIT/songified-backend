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

router.post('/song', (req, res) => {
  // Step 1: Request File Upload
  const data = JSON.stringify({
    query: `mutation FileUploadRequestMutation {
      fileUploadRequest {
        # the id will be used for creating the library track from the file upload
        id
        # the uploadUrl specifies where we need to upload the file to
        uploadUrl
      }
    }`,
    variables: {}
  })

  const config = {
    method: 'post',
    url: 'https://app.cyanite.ai/graphql',
    headers: {
      Authorization: 'Bearer ' + process.env.CYANITE_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    data: data
  }

  axios(config)
    .then(function (response) {
      res.status(200).json({
        id: response.data.data.fileUploadRequest.id,
        uploadUrl: response.data.data.fileUploadRequest.uploadUrl
      })
    })
    .catch(function (error) {
      console.log(error)
    })
})

module.exports = router
