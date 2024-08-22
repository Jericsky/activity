const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require('passport');
const session = require('express-session');
require('./passport')
//s43
const userRoutes = require("./routes/user")
//[SECTION] Activity: Allows access to routes defined within our application
const courseRoutes = require("./routes/course");

require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//You can also customize the CORS options to meet your specific requirements.
const corsOptions = {
    //to update the origin of the request
    origin: ['http://localhost:8000'], // Allow requests from this origin (The client's URL) the origin is in array form if there are multiple origins.
    //methods: ['GET', 'POST'], // Allow only specified HTTP methods // optional only if you want to restrict the methods
    //allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers // optional only if you want to restrict the headers
    credentials: true, // Allow credentials (e.g., cookies, authorization headers)
    optionsSuccessStatus: 200 // Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
};
app.use(cors(corsOptions));
app.use(session({
    secret: process.env.clientSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/users", userRoutes);
//[SECTION] Activity: Add course routes
app.use("/courses", courseRoutes);

if(require.main === module){
	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${ process.env.PORT || 3000}`)
	});
}

module.exports = {app, mongoose};