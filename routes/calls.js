'use strict';

const express = require('express');
const router = express.Router();
const {
	checkToken,
	getGoals,
	createGoal,
	getSteps,
	signUp,
	signIn,
	createStep,
	patchStep,
	getNumber
} = require('../database/index.js');

// GET is used to retrieve remote data, POST is used to insert/update remote data

/**
* endpoint: /
* method: GET
* description: testing to get a random number
* responses: 
*/
router.get('/', async (req, res, next) => {
	console.log('get / attempt');
	try {
		const num = await getNumber();
		console.log(`calls.js: ${num}`);
		res.end(num);
	} catch (err) {
		next(err);
	}
});

/**
* endpoint: /:id
* method: GET
* description: gets all the goals
* responses: 
*/
router.get('/token', async (req, res, next) => {
	console.log(`calls get token`);
	// Validate token, and continue onwards if successful
	checkToken(req, function(err, data) {
		  if (err) {
		      console.log(`Error: ${err}, ${data}`);
		      // If token is not validated, indicate failure
			  res.json({
				success: false,
				message: data
			  });
			  //next(err);         
		  } else {            
		      // If token is validated, indicate success
		      console.log(`Data: ${data}`);   
		      // The data received here is a packet of rows whose values
		      // can be accessed with property ID's
		      res.json({
		        success: true,
		        data: data
		      });  
		  }    
	});
});

/**
* endpoint: /:id
* method: GET
* description: gets all the goals
* responses: 
*/
router.get('/goals', async (req, res, next) => {
	console.log(`calls get goals`);
	// Validate token, and continue onwards if successful
	checkToken(req, function(err, data) {
		  if (err) {
		      console.log(`Error: ${err}, ${data}`);
		      // If token is not validated, skip to next router
		      next('route');           
		  } else {            
		      // If token is validated, pass control to next middleware function in stack
		      console.log(`Data: ${data}`);   
		      next();
		    }    
		});
	}, function (req, res, next) {
		// Get the data for a specified object in database
		try {
			getGoals(function(err, data) {
		        if (err) {
		          // error handling code goes here
		          console.log(`Error: ${err}, ${data}`); 
			      res.json({
				      success: false,
				      message: data
				  });
				  next(err);          
		        } else {            
		          // code to execute on data retrieval
		          console.log(`Data: ${data}`); 
		          // The data received here is a packet of rows whose values
		          // can be accessed with property ID's
		          res.json({
		          	success: true,
		          	data: data
		          });  
		        }    
			  });
		} catch (err) {
			res.json({
			    success: false,
			    message: 'Cannot get goals data!'
			});
			next(err);
		}
});

/**
* endpoint: /:id
* method: GET
* description: if token authentication fails for getting goals
* responses: 
*/
router.get('/goals', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

// /**
// * endpoint: /:id
// * method: GET
// * description: gets data for particular goal
// * responses: 
// */
// router.get('/:id', async (req, res, next) => {
// 	// Validate token, and continue onwards if successful
// 	checkToken(req, function(err, data) {
// 		  if (err) {
// 		      console.log(`Error: ${err}, ${data}`);
// 		      // If token is not validated, skip to next router
// 		      next('route');           
// 		  } else {            
// 		      // If token is validated, pass control to next middleware function in stack
// 		      console.log(`Data: ${data}`);   
// 		      next();
// 		    }    
// 		});
// 	}, function (req, res, next) {
// 		// Get the data for a specified object in database
// 		try {
// 			getData(req.params.id, function(err, data) {
// 		        if (err) {
// 		          // error handling code goes here
// 		          console.log(`Error: ${err}`); 
// 		          next(err);           
// 		        } else {            
// 		          // code to execute on data retrieval
// 		          console.log(`Data: ${data}`); 
// 		          res.json({
// 		          	success: true,
// 		          	data: data
// 		          });  
// 		        }    
// 			  });
// 		} catch (err) {
// 			next(err);
// 		}
// });

// /**
// * endpoint: /:id
// * method: GET
// * description: if token authentication fails for getting a particular goal
// * responses: 
// */
// router.get('/:id', async (req, res, next) => {
//   	res.json({
// 		success: false,
// 		message: 'Token cannot be validated!'
// 	});
// });

/**
* endpoint: /
* method: POST
* description: creates a goal
* responses: 
*/
router.post('/goal', async (req, res, next) => {
	  checkToken(req, function(err, data) {
		    if (err) {
		        // error handling code goes here
		        console.log(`Error: ${err}, ${data}`);
		        // If token is not validated, skip to next router
		        next('route');           
		    } else {            
		        // If token is validated, pass control to next middleware function in stack
		        console.log(`Data: ${data}`);   
		        next();
		      }    
		});
	}, function (req, res, next) {

	try {
		createGoal(req.body, function(err, data) {
		  // For first entry, the inserting goal query
          if (err) {
          	// error handling code goes here
            console.log(`Get steps error: ${err}`);
          	if (err == 'Error inserting new goal') {
          		res.json({
				success: false,
				message: 'Failed to insert new goal'
				}); 
          	} else if (err == 'Error creating goal table') {
          		res.json({
				success: false,
				message: 'Failed to create goal table'
				}); 
          	} else {
              	res.json({
					success: false,
					message: 'Error in pool connecting'
				}); 
            }
            next(err);           
          } else {            
            // code to execute on data retrieval
            console.log(`Data: ${data}`); 
            res.json({
				success: true,
				message: 'Succeeded in creating and tabling'
			});   
          }    
	    });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot create goal!'
		});
		next(err);
	}
});

/**
* endpoint: /:id
* method: POST
* description: if token authentication fails for posting a goal
* responses: 
*/
router.post('/goal', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /
* method: POST
* description: gets steps for a particular goal
* responses: 
*/
router.post('/steps', async (req, res, next) => {
	  checkToken(req, function(err, data) {
		    if (err) {
		        // error handling code goes here
		        console.log(`Error: ${err}, ${data}`);
		        // If token is not validated, skip to next router
		        next('route');           
		    } else {            
		        // If token is validated, pass control to next middleware function in stack
		        console.log(`Data: ${data}`);   
		        next();
		      }    
		});
	}, function (req, res, next) {

	try {
		getSteps(req.body, function(err, data) {
		  // For first entry, the inserting goal query
          if (err) {
          	// error handling code goes here
            console.log(`Error: ${err}`);
          	if (err == 'Can\'t fetch steps') {
          		res.json({
					success: false,
					message: 'Failed to fetch goal\'s steps'
				}); 
          	} else if (err == 'Couldn\'t retrieve associated username') {
          		res.json({
					success: false,
					message: 'Failed to find goal\'s associated username'
				}); 
          	} else {
              	res.json({
					success: false,
					message: 'Error in pool connecting'
				}); 
            }
            next(err);           
          } else {            
            // code to execute on data retrieval
            console.log(`Data: ${data}`); 
            res.json({
				success: true,
				message: 'Succeeded in fetching steps and username',
				data: data
			});   
          }    
	    });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot get steps for goal!'
		});
		next(err);
	}
});

/**
* endpoint: /:id
* method: POST
* description: if token authentication fails for getting steps for a goal
* responses: 
*/
router.post('/steps', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /
* method: POST
* description: adds step for a particular goal
* responses: 
*/
router.post('/step', async (req, res, next) => {
	  checkToken(req, function(err, data) {
		    if (err) {
		        // error handling code goes here
		        console.log(`Error: ${err}, ${data}`);
		        // If token is not validated, skip to next router
		        next('route');           
		    } else {            
		        // If token is validated, pass control to next middleware function in stack
		        console.log(`Data: ${data}`);   
		        next();
		      }    
		});
	}, function (req, res, next) {

	try {
		createStep(req.body, function(err, data) {
		  // For first entry, the inserting goal query
          if (err) {
          	// error handling code goes here
            console.log(`Error: ${err}`);
          	if (err == 'Goal doesn\'t exist') {
          		res.json({
					success: false,
					message: 'Failed to find step\'s associated goal'
				}); 
          	} else if (err == 'Error inserting new step') {
          		res.json({
					success: false,
					message: 'Failed to insert new step'
				}); 
          	} else {
              	res.json({
					success: false,
					message: 'Error in pool connecting'
				}); 
            }
            next(err);           
          } else {            
            // code to execute on data retrieval
            console.log(`Data: ${data}`); 
            res.json({
				success: true,
				message: 'Succeeded in creating step',
				data: data
			});   
          }    
	    });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot create step!'
		});
		next(err);
	}
});

/**
* endpoint: /:id
* method: POST
* description: if token authentication fails for adding step for a goal
* responses: 
*/
router.post('/step', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /
* method: PATCH
* description: increments or decrements count for a specific step
* responses: 
*/
router.patch('/step', async (req, res, next) => {
	  console.log(`Patch in backend, ${req.goal}, ${req.step}, ${req.endorsed}`);
	  checkToken(req, function(err, data) {
		    if (err) {
		        // error handling code goes here
		        console.log(`Error: ${err}, ${data}`);
		        // If token is not validated, skip to next router
		        next('route');           
		    } else {            
		        // If token is validated, pass control to next middleware function in stack
		        console.log(`Data: ${data}`);   
		        next();
		      }    
		});
	}, function (req, res, next) {

	try {
		patchStep(req.body, function(err, data) {
	        if (err) {
	          // error handling code goes here
		      console.log(`Error: ${err}, ${data}`); 
			  if (err == 'Goal doesn\'t exist') {
          		res.json({
				  success: false,
				  message: 'Failed to find a goal that matches'
				}); 
	          } else if (err == 'Step doesn\'t exist') {
	          	res.json({
				  success: false,
				  message: 'Failed to find a step that matches'
				}); 
              } else if (err == 'Failed to increment yesVotes') {
              	res.json({
				  success: false,
				  message: 'Failed to endorse step'
				}); 
              } else if (err == 'Failed to increment noVotes') {
              	res.json({
				  success: false,
				  message: 'Failed to oppose step'
				}); 
              } else {
              	res.json({
				  success: false,
				  message: 'Error in pool connecting'
				}); 
              }
	          next(err);           
	        } else {            
	          // code to execute on data retrieval
	          console.log(`Data: ${data}`); 
	          // The data received here is a packet of rows whose values
	          // can be accessed with property ID's
	          res.json({
	           	success: true,
	         	message: data
	          });  
	        }    
		  });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot patch step count!'
		});
		next(err);
	}
});

/**
* endpoint: /:id
* method: PATCH
* description: increments or decrements count for a specific step
* responses: 
*/
router.patch('/step', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /signup
* method: POST
* description: 
* responses: 
*/
router.post('/signup', async (req, res, next) => {
	try {
		signUp(req.body, function(err, data) {
          if (err) {
            // error handling code goes here
            console.log(`Error: ${err}, ${data}`); 
	        res.json({
		        success: false,
		        message: data
		    });
		    //next(err);           
          } else {            
            // code to execute on data retrieval
            console.log(`Data: ${data}`);   
            res.json({
		        success: true,
		        message: 'Sign up successful!',
		        data: data.data,
		        token: data.token
		    });
          }    
	    });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot sign up!'
		});
		next(err);
	}
});

router.post('/signin', async (req, res, next) => {
  	try {
		signIn(req.body, function(err, data) {
	      if (err) {
	        // error handling code goes here
	        console.log(`Error: ${err}, ${data}`); 
	        res.json({
		        success: false,
		        message: data
		    });
		    //next(err);           
	      } else {            
	        // code to execute on data retrieval
	        console.log(`Data: ${data}`);   
	        res.json({
		        success: true,
		        message: 'Authentication successful!',
		        token: data
		    });
	      }    
		});
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Username has no match'
		});
		next(err);
	}
})

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
