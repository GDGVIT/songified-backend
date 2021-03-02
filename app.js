require('dotenv').config();
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const searchRoute = require("./api/routes/search");

const app = express();

const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("/search",searchRoute);

//adding required headers to prevent CORS(Cross Origin Resourse Sharin) Error
app.use((req,res,next)=>
{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,Authorization");
    if(req.method === "OPTIONS")
    {
        res.header("Access-Control-Allow-Methods","PUT,POST,PATCH,DELETE,GET");
        return res.status(200).json({});
    }
    next();
});

app.get('/',(req, res) => {
  
    res.status(200).json({
      status: 200,
      message: "Songify API Up and Running, Refer Documentation for Use"
    });
  
  });
  
app.listen(port, () => {
    console.log("Server Up and Running at Port");
  });