'use strict';

const express = require('express');
const router = express.Router();
const {
	getData,
	createData,
	getNumber
} = require('../database/index.js');

/**
* endpoint: /:id
* method: GET
* description: 
* responses: 
*/
router.get('/:id', async (req, res, next) => {
	try {
	    getData(req.params.id, function(err, data) {
          if (err) {
            // error handling code goes here
            console.log("Error: ", err);            
          } else {            
            // code to execute on data retrieval
            console.log("Data: ", data);   
          }    
	    });
	    const num = '7';
		res.end(num);
	} catch (err) {
		next(err);
	}
});

/**
* endpoint: /
* method: POST
* description: 
* responses: 
*/
router.post('/', async (req, res, next) => {
	try {
		createData(req.body, function(err, data) {
          if (err) {
            // error handling code goes here
            console.log("Error: ", err);            
          } else {            
            // code to execute on data retrieval
            console.log("Data: ", data);   
          }    
	    });
		const num = '8';
		res.end(num);
	} catch (err) {
		next(err);
	}
});

/**
* endpoint: /
* method: GET
* description: 
* responses: 
*/
router.get('/', async (req, res, next) => {
	try {
		const num = await getNumber();
		console.log('calls.js: ', num);
		res.end(num);
	} catch (err) {
		next(err);
	}
});

// Register an error handler as well.
router.use((err, req, res) => {
	try {
		// Normally, we try to send out a nice error.
		res.status(500).json({ message: err.message });
	} catch(e) {
		// However, if that fails, we try to just end the response immediately.
		try {
			res.end();
		} catch(e) {
			// If even _that_ fails, we just ignore any error.
		}
	}
});

module.exports = router;
