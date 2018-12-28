'use strict';

const mysql = require('mysql');

const express = require('express');

const postsRouter = require('./routes/calls.js');

const PORT = process.env.PORT || 3003
//const PORT = 8080;

const app = express();

app.use(express.json());

// Heroku deployed backend will use '/' route
// When using a proxy, cannot use root endpoint '/' for route, will return HTML
app.use('/', postsRouter);

app.listen(PORT, () => {
	console.log('App is running on port ' + PORT);
});