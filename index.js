'use strict';

const mysql = require('mysql');

const express = require('express');

const postsRouter = require('./routes/calls.js');

const PORT = 8080;

const app = express();

app.use(express.json());

// When using a proxy, cannot use root endpoint '/' for route, will return HTML
app.use('/api', postsRouter);

app.listen(PORT, () => {
	console.log('App is running on port ' + PORT);
});