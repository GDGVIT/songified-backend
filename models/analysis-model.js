const mongoose = require('mongoose')
const Schema = mongoose.Schema

const analysisSchema = new Schema({
  songId: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: {}
  },
  status:
  {
    type: String,
    default: 'Processing'
  },
  userId: {
    type: String,
    required: true
  },
  songName: {
    type: String
  }
})

const Analysis = mongoose.model('analysis', analysisSchema)

module.exports = Analysis
