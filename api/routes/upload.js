const router = require('express').Router()
const authCheck = require('./authCheck')

router.get('/',(req,res)=>{
    res.json("GET ACCESSED OF UPLOAD")
})

module.exports = router
