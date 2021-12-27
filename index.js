const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db_connection');
const path = require('path');
const os = require('os');
const cluster = require('./cluster');
const numofCups = os.cpus().length;
const auth = require('./routes/auth');
const genre = require('./routes/genre');
const movie = require('./routes/movie');


const app = express();
app.use(express.json());

connectDB();
app.use(cors());

const port = process.env.PORT || 5000;

//test route
app.get("/test", (req, res) => res.send("Wow! the test case is working fine..."));
app.use(express.static(path.join(__dirname,'./uploads/')));
app.use("/api/v1/auth", auth);
app.use("/api/v1/genre", genre);
app.use("/api/v1/movie", movie);

cluster(app);