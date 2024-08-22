const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const user = require('./Routes/routes');
const cors = require("cors");


dotenv.config()

const app = express()

app.use(bodyParser.json())
var corsOptions = {
    origin: "*",
  };
  app.use(cors(corsOptions));

app.get("/", (req, res)=>{
    res.json({"Hi":"Hello World"})
})

app.use('/api', user)

const PORT = 3000

app.listen(PORT, () => {
    console.log(`Port listening on ${PORT}`)
})

