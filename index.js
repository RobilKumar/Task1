const express= require('express')
const clc= require('cli-color');
const { clearScreenDown } = require('readline');
require('dotenv').config();
const session= require('express-session');
const monogoDbSession= require('connect-mongodb-session')(session);

//file-imports
require("./db");
const Authrouter= require('./Controllers/AuthController')

// session store instance in db
const store= new monogoDbSession({
    uri:process.env.MONGO_URI,
    collection:"sessions",
})





// const 
const app= express();
const  PORT= process.env.PORT;








//------------No use of home route now-------------------//
app.get('/',(req,res)=>{
    return res.send({
        status:200,
        message:"Server is up and running",
    });
});
//-------------------------------//





// middleware
app.use(express.json()); // to read json 

//  setting up a session middleware using Express.js
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:false,
    store:store, // store address
}));



//authrouter
// here those req come with auth
// will be redirected to Authrouter controller
app.use('/auth', Authrouter);


app.listen(6000,()=>{
    console.log(clc.yellowBright.underline(`Blogging server is running PORT:${PORT}`))
})