require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const searchRoute = require('./api/routes/search')
const authRoute = require('./api/routes/auth-routes')
const songInfoRoute = require('./api/routes/songInfo-routes')
const userInfoRoute = require('./api/routes/userInfo-routes')
const songbookRoute = require('./api/routes/songbook')
const uploadRoute = require('./api/routes/upload')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

const port = process.env.PORT || 3000

app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect(process.env.MONGODB_DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDb Atlas')
  })
  .catch(err => {
    console.log('Error:' + err)
  })

app.use('/auth', authRoute)
app.use('/search', searchRoute)
app.use('/songbook', songbookRoute)
app.use('/songInfo', songInfoRoute)
app.use('/userInfo', userInfoRoute)
app.use('/upload', uploadRoute)

// adding required headers to prevent CORS(Cross Origin Resourse Sharin) Error
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization')
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET')
    return res.status(200).json({})
  }
  next()
})

app.use(cors())

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Songify API Up and Running, Refer Documentation for Use'
  })
})

app.listen(port, () => {
  console.log('Server Up and Running at Port', port)
})
