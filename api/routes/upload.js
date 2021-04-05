const router = require('express').Router()
const multer = require('multer')
const Readable = require('stream').Readable
const axios = require('axios')
const crypto = require('crypto')
const Analysis = require('../../models/analysis-model')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const isSignatureValid = function verifySignature (
  secret /* Secret specified on Cyanite.ai */,
  signature /* Signature sent via the Signature header */,
  body /* raw request body */
) {
  const hmac = crypto.createHmac('sha512', secret)
  hmac.write(body)
  hmac.end()
  const compareSignature = hmac.read().toString('hex')
  return signature === compareSignature
}

const analysisData = async function analysisData (songId) {
  const analysis = new Analysis({
    songId: songId
  })

  await analysis.save().then((analysis) => {
    console.log('Added to Analysis DB')
  })
    .catch((error) => {
      console.log('ERROR:' + error)
    })
}

const updateAnalysisData = async function updateAnalysisData (songId) {
  const data = JSON.stringify({
    query: `query LibraryTrackMusicalAnalysisQuery($libraryTrackId: ID!) {
      libraryTrack(id: $libraryTrackId) {
        __typename
        ... on LibraryTrackNotFoundError {
          message
        }
        ... on LibraryTrack {
          id
          fullScaleMusicalAnalysis {
            __typename
            ... on FullScaleMusicalAnalysisFailed {
              error {
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
    variables: { libraryTrackId: songId }
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
    .then(async function (response) {
      const updateData = response.data.data.libraryTrack.fullScaleMusicalAnalysis

      await Analysis.updateOne({ songId: songId },
        { $set: { data: updateData, status: 'Finished' } })
        .then((update) => {
          console.log('Successful Update Analysis Data')
        })
        .catch((error) => {
          console.log('ERROR:' + error)
        })
    })
    .catch(function (error) {
      console.log('Analysis Fetch Error')
      console.log(error)
    })
}

// @TODO Remove this
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
  if (!req.body) {
    return res.sendStatus(422) // Unprocessable Entity
  }

  console.log('[info] incoming event:')
  console.log(JSON.stringify(req.body, undefined, 2))

  if (req.body.type === 'TEST') {
    console.log('[info] processing test event')
    return res.sendStatus(200)
  }

  if (!isSignatureValid(process.env.CYANITE_WEBHOOK_SECRET, req.headers.signature, JSON.stringify(req.body))) {
    console.log('[info] signature is invalid')
    return res.sendStatus(400)
  }
  console.log('[info] signature is valid')

  if (req.body.type === 'IN_DEPTH_ANALYSIS' && req.body.event.type === 'FULL_SCALE_MUSICAL_ANALYSIS' && req.body.event.status === 'FINISHED') {
    console.log('[info] processing finish event')
    console.log(req.body.type)
    console.log('ID:' + req.body.id)

    // @TODO UPLOAD TO MONGO DB
    // NOTE: YOU NEED TO PUSH TO HEROKU TO TEST THE WEBHOOK

    // You can use the result here, but keep in mind that you should probably process the result asynchronously
    // The request of the incoming webhook will be canceled after 3 seconds.
    updateAnalysisData(req.body.id)
  }

  return res.sendStatus(200)
})

router.post('/song', upload.single('songFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      errorMessage: 'missing required file. refer documentation'
    })
  }

  // Step 1: Get File as multipart form data with name songFile
  const readable = new Readable()
  readable._read = () => {}
  readable.push(req.file.buffer)
  readable.push(null)
  const len = Buffer.byteLength(req.file.buffer)
  if (len > 10485760) {
    return res.status(400).json({
      errorMessage: 'file exceeds maximum file size of 10mb'
    })
  }

  // Step 2: Request File Upload
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
      const uploadUrl = response.data.data.fileUploadRequest.uploadUrl
      const uploadId = response.data.data.fileUploadRequest.id
      const fileName = uploadId + '-songFile.mp3'
      console.log(uploadUrl, fileName)
      // Step 3: Upload the file

      const uploadConfig = {
        method: 'PUT',
        url: uploadUrl,
        headers: {
          'Content-Length': len
        },
        data: readable
      }

      axios(uploadConfig)
        .then(function (responseUpload) {
          // Step 4: Create Library Track
          const libraryData = JSON.stringify({
            query: `mutation LibraryTrackCreateMutation($input: LibraryTrackCreateInput!) {
              libraryTrackCreate(input: $input) {
                __typename
                ... on LibraryTrackCreateSuccess {
                  createdLibraryTrack {
                    id
                  }
                }
                ... on LibraryTrackCreateError {
                  code
                  message
                }
              }
            }`,
            variables: { input: { uploadId: uploadId, title: fileName } }
          })

          const libraryConfig = {
            method: 'post',
            url: 'https://app.cyanite.ai/graphql',
            headers: {
              Authorization: 'Bearer ' + process.env.CYANITE_ACCESS_TOKEN,
              'Content-Type': 'application/json'
            },
            data: libraryData
          }

          axios(libraryConfig)
            .then(function (responseLibrary) {
              console.log(responseLibrary.data)
              console.log('Id of file to query: ' + responseLibrary.data.data.libraryTrackCreate.createdLibraryTrack.id)

              analysisData(responseLibrary.data.data.libraryTrackCreate.createdLibraryTrack.id)

              res.status(200).json({
                message: 'file is being processed. Id to query for analysis result is given in Id',
                id: responseLibrary.data.data.libraryTrackCreate.createdLibraryTrack.id
              })
            })
            .catch(function (error) {
              console.log(error)
              return res.status(500).json({
                errorMessage: 'error 50X on library track creation'
              })
            })
        })
        .catch(function (error) {
          console.log(error)
          return res.status(500).json({
            errorMessage: 'error 50X on upload'
          })
        })
    })
    .catch(function (error) {
      console.log(error)
      return res.status(500).json({
        errorMessage: 'error 50X on upload request'
      })
    })
})

router.post('/getAnalysedData', (req, res) => {
  if (!req.body.songId) {
    return res.status(400).json({
      error: 'missing required parameters. refer documentation'
    })
  }

  Analysis.findOne({ songId: req.body.songId })
    .then((songData) => {
      if (songData.status === 'Finished') {
        res.status(200).json(songData)
      } else {
        res.status(200).json({
          message: 'Processing Underway please check back after a while'
        })
      }
    })
    .catch((error) => {
      res.status(400).json({
        error: error
      })
    })
})

module.exports = router
