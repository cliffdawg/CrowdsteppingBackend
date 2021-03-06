'use strict';

const express = require('express');
const router = express.Router();
const {
	checkToken,
	getGoals,
	createGoal,
	getSteps,
	getVotes,
	signUp,
	signIn,
	createStep,
	patchStep,
	negateStep,
	switchStep,
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
* endpoint: /token
* method: GET
* description: checks if token is valid
* responses: 
*/
router.get('/token', async (req, res, next) => {
	console.log(`calls get token`);
	// Validate token, and continue onwards if successful
	try {
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
		        message: data
		      });  
		  }    
		});
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Token cannot be validated!'
		});
		next(err);
	}
});

/**
* endpoint: /goals
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
* endpoint: /goals
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

/**
* endpoint: /goal
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
            console.log(`Get steps error: ${err}, ${data}`);
          	if (err == 'Error checking for goal') {
          		res.json({
					success: false,
					message: 'Failed to check for goal'
				}); 
          	} else if (err == 'Goal already exists!') {
          		res.json({
					success: false,
					message: 'Goal to insert is already present'
				}); 
          	} else if (err == 'Error inserting new goal') {
          		res.json({
					success: false,
					message: 'Failed to insert new goal'
				}); 
          	} else if (err == 'Error checking table for goal') {
          		res.json({
					success: false,
					message: 'Failed to check for goal table'
				}); 
          	} else if (err == 'Goal table already exists!') {
          		res.json({
					success: false,
					message: 'Goal table to insert is already present'
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
* endpoint: /goal
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
* endpoint: /steps
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
          	} else if (err == 'Error retrieving goal username') {
          		res.json({
					success: false,
					message: 'Failed to try and retrieve goal\'s associated username'
				}); 
          	} else if (err == 'Associated username not found') {
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
* endpoint: /steps
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
* endpoint: /votes
* method: POST
* description: gets votes for a particular user and goal
* responses: 
*/
router.post('/votes', async (req, res, next) => {
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
		getVotes(req.body, function(err, data) {
		  // For first entry, the inserting goal query
          if (err) {
          	// error handling code goes here
            console.log(`Error: ${err}`);
          	if (err == 'Joining tables for votes fails') {
          		res.json({
					success: false,
					message: 'Failed to join tables between users and votes'
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
				message: 'Succeeded in getting votes for user and goal',
				data: data
			});   
          }    
	    });
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot get votes for user and goal!'
		});
		next(err);
	}
});

/**
* endpoint: /votes
* method: POST
* description: if token authentication fails for getting votes
* responses: 
*/
router.post('/votes', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /step
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
          	if (err == 'Error checking for goal') {
          		res.json({
					success: false,
					message: 'Failed to check for existence of goal'
				}); 
          	} else if (err == 'Goal doesn\'t exist') {
          		res.json({
					success: false,
					message: 'Failed to find step\'s associated goal'
				}); 
          	} else if (err == 'Error checking for step') {
          		res.json({
					success: false,
					message: 'Failed to check for existence of step'
				}); 
          	} else if (err == 'Step already exists!') {
          		res.json({
					success: false,
					message: 'Step to insert already exists'
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
* endpoint: /step
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
* endpoint: /step
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
			  if (err == 'Error checking for goal') {
          		res.json({
				  success: false,
				  message: 'Failed to check for a goal that matches'
				}); 
	          } else if (err == 'Goal doesn\'t exist') {
          		res.json({
				  success: false,
				  message: 'Failed to find a goal that matches'
				}); 
	          }  else if (err == 'Error finding step') {
	          	res.json({
				  success: false,
				  message: 'Failed to try to find a step that matches'
				}); 
              } else if (err == 'Step doesn\'t exist') {
	          	res.json({
				  success: false,
				  message: 'Failed to find a step that matches'
				}); 
              } else if (err == 'Failed to increment votes') {
              	res.json({
				  success: false,
				  message: 'Failed to endorse/oppose step'
				}); 
              } else if (err == 'Failed to set approval') {
              	res.json({
				  success: false,
				  message: 'Failed to set approval status for step'
				}); 
              } else if (err == 'Failed to record vote') {
              	res.json({
				  success: false,
				  message: 'Failed to relate vote to user'
				}); 
              } else if (err == 'Failed to delete vote') {
              	res.json({
				  success: false,
				  message: 'Failed to delete previous vote related to user'
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
* endpoint: /step
* method: PATCH
* description: if token authentication fails for incrementing/decrementing count for a specific step
* responses: 
*/
router.patch('/step', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /negateStep
* method: PATCH
* description: negates increment or decrement for a specific step
* responses: 
*/
router.patch('/negateStep', async (req, res, next) => {
	  console.log(`Negate in backend, ${req.goal}, ${req.step}, ${req.endorsed}`);
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
		negateStep(req.body, function(err, data) {
	        if (err) {
	          // error handling code goes here
		      console.log(`Error: ${err}, ${data}`); 
			  if (err == 'Error checking for goal') {
          		res.json({
				  success: false,
				  message: 'Failed to check for a goal that matches'
				}); 
	          } else if (err == 'Goal doesn\'t exist') {
          		res.json({
				  success: false,
				  message: 'Failed to find a goal that matches'
				}); 
	          } else if (err == 'Error finding step') {
	          	res.json({
				  success: false,
				  message: 'Failed to try to find a step that matches'
				}); 
              } else if (err == 'Step doesn\'t exist') {
	          	res.json({
				  success: false,
				  message: 'Failed to find a step that matches'
				}); 
              } else if (err == 'Failed to decrement votes') {
              	res.json({
				  success: false,
				  message: 'Failed to decrement vote for step'
				}); 
              } else if (err == 'Failed to set approval') {
              	res.json({
				  success: false,
				  message: 'Failed to set approval status for step'
				}); 
              } else if (err == 'Failed to negate vote') {
              	res.json({
				  success: false,
				  message: 'Failed to negate previous vote related to user'
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
		    message: 'Cannot patch negate step!'
		});
		next(err);
	}
});

/**
* endpoint: /negateStep
* method: PATCH
* description: if token authentication fails for negating increment or decrement for a specific step
* responses: 
*/
router.patch('/negateStep', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /switchStep
* method: PATCH
* description: switches increment or decrement for a specific step
* responses: 
*/
router.patch('/switchStep', async (req, res, next) => {
	  console.log(`Switch in backend, ${req.goal}, ${req.step}, ${req.endorsed}`);
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
		switchStep(req.body, function(err, data) {
	        if (err) {
	          // error handling code goes here
		      console.log(`Error: ${err}, ${data}`); 
			  if (err == 'Error checking for goal') {
          		res.json({
				  success: false,
				  message: 'Failed to check for a goal that matches'
				}); 
	          } else if (err == 'Goal doesn\'t exist') {
          		res.json({
				  success: false,
				  message: 'Failed to find a goal that matches'
				}); 
	          } else if (err == 'Error finding step') {
	          	res.json({
				  success: false,
				  message: 'Failed to try to find a step that matches'
				}); 
              } else if (err == 'Step doesn\'t exist') {
	          	res.json({
				  success: false,
				  message: 'Failed to find a step that matches'
				}); 
              } else if (err == 'Failed to increment/decrement votes') {
              	res.json({
				  success: false,
				  message: 'Failed to increment/decrement votes for step'
				}); 
              } else if (err == 'Failed to set approval') {
              	res.json({
				  success: false,
				  message: 'Failed to set approval status for step'
				}); 
              } else if (err == 'Failed to record vote') {
              	res.json({
				  success: false,
				  message: 'Failed to relate vote to user'
				}); 
              } else if (err == 'Failed to delete vote') {
              	res.json({
				  success: false,
				  message: 'Failed to delete previous vote related to user'
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
		    message: 'Cannot patch switch step!'
		});
		next(err);
	}
});

/**
* endpoint: /switchStep
* method: PATCH
* description: if token authentication fails for switching increment or decrement for a specific step
* responses: 
*/
router.patch('/switchStep', async (req, res, next) => {
  	res.json({
		success: false,
		message: 'Token cannot be validated!'
	});
});

/**
* endpoint: /signup
* method: POST
* description: signs up new user
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
		        userID: data.data,
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


/**
* endpoint: /signin
* method: POST
* description: signs in existing user
* responses: 
*/
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
		        data: data
		    });
	      }    
		});
	} catch (err) {
		res.json({
		    success: false,
		    message: 'Cannot sign in!'
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
