'use strict';

// Heroku looks for Procfile, which explicitly declares what command should be executed to start the app
// ?? in query is for ids, ? is for values
// Can't use 'index' as a column in a MySQL table because it causes error
// Can only create foreign key constraint on primary key because it has to be unique

const mysql = require('mysql');
const async = require('async');

require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool  = mysql.createPool({
  host: process.env.REMOTE_HOST,
  user: process.env.REMOTE_USER,
  password: process.env.REMOTE_PASSWORD,
  database: process.env.REMOTE_DATABASE,
  insecureAuth: process.env.REMOTE_INSECUREAUTH
});

// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });


/*

Creating the users table:

CREATE TABLE users( 
	id INT unsigned NOT NULL AUTO_INCREMENT, 
	username VARCHAR(50) NOT NULL, 
	email VARCHAR(50) NOT NULL, 
	passHash CHAR(60) BINARY NOT NULL, 
	PRIMARY KEY (id) ) DEFAULT CHARSET=utf8;

Creating the votes table:

CREATE TABLE votes( 
	id INT unsigned NOT NULL, 
	goal VARCHAR(100) NOT NULL DEFAULT '', 
	step VARCHAR(500) NOT NULL DEFAULT '',
	action VARCHAR(50) NOT NULL DEFAULT '', 
	CONSTRAINT FK_id FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE );

*/

async function checkToken(req, callback) {
	console.log('checkToken');
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length);
    }

    if (token) {
      jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
        if (err) {
          callback(err, 'Token is not valid');
        } else {
          callback(null, 'Token is validated');
        }
      });
    } else {
      callback(err, 'Token is not supplied');
    }
};

// async function getData(id, callback) {

// 	const connection = mysql.createConnection({
// 	  host: process.env.REMOTE_HOST,
// 	  user: process.env.REMOTE_USER,
// 	  password: process.env.REMOTE_PASSWORD,
// 	  database: process.env.REMOTE_DATABASE,
// 	  insecureAuth: process.env.REMOTE_INSECUREAUTH
// 	});
// // const connection = mysql.createConnection({
// //   host: process.env.LOCAL_HOST,
// //   user: process.env.LOCAL_USER,
// //   password: process.env.LOCAL_PASSWORD,
// //   database: process.env.LOCAL_DATABASE,
// //   insecureAuth: process.env.LOCAL_INSECUREAUTH
// // });

// 	connection.connect((err) => {
// 	  if (err) {
// 	    console.error('Error connecting: ' + err.stack);
// 	    return;
// 	  }
// 	  console.log('Connected!');

// 	  console.log(`SELECT * FROM tests WHERE id = ${id};`);
// 	  connection.query('SELECT * FROM tests WHERE id = ?;', [id], (err, rows, fields) => {
// 		if (err) {
// 		  console.log(`Failure: ${err}`);
// 		  callback(err, null);
// 		} else {
// 		  console.log('Success');
// 		  callback(null, rows);
// 		}
// 	  })

// 	});
// }

async function getGoals(callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

	// Release the connection only when you finished using it through the rest of the scope
	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback(err, 'Error in pool connecting!');
	    return;
	  } 
	  console.log('Connected!');
      console.log(`SELECT * FROM goals;`);
	  connection.query('SELECT * FROM goals;', (err, rows, fields) => {
	  	connection.release();
		if (err) {
		  console.log(`Failure: ${err}`);
		  callback(err, 'MySQL connection error');
		} else {
		  console.log('Success getting goals');
		  console.log(rows);
		  callback(null, rows);
		}
	  })
	});
}

async function createGoal(create, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });


	// pool.getConnection(function(err, connection) {
 //  	  if (err) {
	//     console.error('Error in pool connecting: ' + err.stack);
	//     callback(err, 'Error in pool connecting!');
	//     return;
	//   } 
	//   console.log('Connected!');
 //      console.log(`Creating: INSERT INTO goals (first_var, second_var, third_var) 
	// 	VALUES ( \'${create.goal}\', ${create.username}...`);
	//   connection.query(`INSERT INTO goals (goal, username, timeStamp) 
	// 	VALUES (?, ?, ?);`, [create.goal, create.username, new Date()], (err, rows, fields) => {
	// 	  connection.release();
	// 	  if (err) {
	// 		console.log(`Failure: ${err}`);
	// 		callback(err, null);
	//       } else {
	// 		console.log('Success');
	// 		callback(null, rows);
	// 	  }
	//   })
	// });

	async.parallel([
    function(parallelCallback) {
        pool.getConnection(function(err, connection) {
	  	  if (err) {
		    console.error('Error in pool connecting: ' + err.stack);
		    parallelCallback('Error in pool connecting!', null);
		    return;
		  } 
		  console.log('Connected!');
	      console.log(`Creating: INSERT INTO goals (first_var, second_var, third_var) 
			VALUES ( \'${create.goal}\', ${create.username}...`);
		  connection.query(`INSERT INTO goals (goal, username, timeStamp) 
			VALUES (?, ?, ?);`, [create.goal, create.username, new Date()], (err, rows, fields) => {
			  connection.release();
			  if (err) {
				console.log(`Goal inserting failure: ${err}`);
				parallelCallback('Error inserting new goal', null);
		      } else {
				console.log('Success inserting goal!');
				parallelCallback(null, rows);
			  }
		  })
		});
    },
    function(parallelCallback) {
        pool.getConnection(function(err, connection) {
	  	  if (err) {
		    console.error('Error in pool connecting: ' + err.stack);
		    parallelCallback('Error in pool connecting!', null);
		    return;
		  } 
		  console.log('Connected!');
		  // Create the specific table for the goal that will hold its steps
	      console.log(`Creating: CREATE TABLE ${create.goal}( id INT(1) unsigned NOT NULL AUTO_INCREMENT, 
	      	step VARCHAR(500) NOT NULL DEFAULT '', 
	      	username VARCHAR(50) NOT NULL DEFAULT '', 
	      	timeStamp TIMESTAMP DEFAULT 0, 
	      	stepsIndex DECIMAL(40,20) NOT NULL DEFAULT 0,
	      	approved BOOLEAN NOT NULL DEFAULT FALSE,
	      	yesVotes INT NOT NULL DEFAULT 0,
	      	noVotes INT NOT NULL DEFAULT 0,
	      	PRIMARY KEY (id) ) AUTO_INCREMENT=1 CHARSET=utf8;`);
	      // The 'approved' column does not mean it has a default value of FALSE for every step, but rather for the table template
		  connection.query(`CREATE TABLE ??( id INT(1) unsigned NOT NULL AUTO_INCREMENT, 
	      	step VARCHAR(500) NOT NULL DEFAULT '', 
	      	username VARCHAR(50) NOT NULL DEFAULT '', 
	      	timeStamp TIMESTAMP DEFAULT 0, 
	      	stepsIndex DECIMAL(40,20) NOT NULL DEFAULT 0,
	      	approved BOOLEAN NOT NULL DEFAULT FALSE,
	      	yesVotes INT NOT NULL DEFAULT 0,
	      	noVotes INT NOT NULL DEFAULT 0,
	      	PRIMARY KEY (id) ) AUTO_INCREMENT=1 CHARSET=utf8;`, [create.goal], (err, rows, fields) => {
			  connection.release();
			  if (err) {
				console.log(`Goal tabling failure: ${err}`);
				parallelCallback('Error creating goal table', null);
		      } else {
				console.log('Success tabling goal!');
				parallelCallback(null, rows);
			  }
		  })
		});
    }],
	// optional callback
	function(err, results) {
		if (err) {
			callback(err, null);
		}
	    // Errors and results stacked in an array [0],[1]
	 	callback(null, results);
	});
}

async function getSteps(getSteps, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });


	// pool.getConnection(function(err, connection) {
 //  	  if (err) {
	//     console.error('Error in pool connecting: ' + err.stack);
	//     callback(err, 'Error in pool connecting!');
	//     return;
	//   } 
	//   console.log('Connected!');
 //      console.log(`Creating: INSERT INTO goals (first_var, second_var, third_var) 
	// 	VALUES ( \'${create.goal}\', ${create.username}...`);
	//   connection.query(`INSERT INTO goals (goal, username, timeStamp) 
	// 	VALUES (?, ?, ?);`, [create.goal, create.username, new Date()], (err, rows, fields) => {
	// 	  connection.release();
	// 	  if (err) {
	// 		console.log(`Failure: ${err}`);
	// 		callback(err, null);
	//       } else {
	// 		console.log('Success');
	// 		callback(null, rows);
	// 	  }
	//   })
	// });

	async.parallel([
    function(parallelCallback) {
    	// Get the steps associated with a goal if it exists
        pool.getConnection(function(err, connection) {
	  	  if (err) {
		    console.error('Error in pool connecting: ' + err.stack);
		    parallelCallback('Error in pool connecting!', null);
		    return;
		  } 
		  console.log('Connected!');
		  connection.query(`SELECT * FROM ?? ORDER BY stepsIndex;`, [getSteps.goal], (err, rows, fields) => {
		  	  console.log('Releasing connection');
		  	  connection.release();
			  if (err) {
				  console.log(`Fetching steps error: ${err}`);
				  parallelCallback('Can\'t fetch steps', null);
			  } else {
			  	  console.log('Goal table steps located');
			  	  console.log(rows);
		  		  parallelCallback(null, rows);
			  }
			});
		});
    },
    function(parallelCallback) {
    	// Get the username associated with a goal if it exists
        pool.getConnection(function(err, connection) {
	  	  if (err) {
		    console.error('Error in pool connecting: ' + err.stack);
		    parallelCallback('Error in pool connecting!', null);
		    return;
		  } 
		  console.log('Connected!');
		  connection.query(`SELECT * FROM goals WHERE goal = ?;`, [getSteps.goal], (err, rows, fields) => {
		  	  console.log('Releasing connection');
		  	  connection.release();
			  if (err) {
				  console.log(`Retrieving goal username failure: ${err}`);
				  parallelCallback('Couldn\'t retrieve associated username', null);
			  } else {
				  console.log('Retrieving goal username')
				  console.log(rows[0]);
		  		  parallelCallback(null, rows);
			  }
			});
		});
    }],
	// optional callback
	function(err, results) {
		if (err) {
			callback(err, null);
		}
	    // Errors and results stacked in an array [0],[1]
	 	callback(null, results);
	});
}

async function signUp(signup, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback(err, 'Error in pool connecting!');
	    return;
	  } 
	  console.log('Connected!');
	  console.log(`Username: ${signup.username}`);
	  connection.query(`SELECT * FROM users WHERE username = ?;`, [signup.username], (err, rows, fields) => {
		  if (err) {
		  	  connection.release();
			  console.log(`Failure: ${err}`);
			  callback(err, 'MySQL connection error');
		  } else {
		  	  // Both valid/invalid username reaches this closure
			  console.log(`Success: ${rows}`);
			  if (Object.keys(rows).length !== 0) {
			  	connection.release();
			  	console.log('Username is present')
			  	callback('Can\'t sign up', 'Username already exists!');
			  } else {
			  	console.log('No data, proceed')
			  	const saltRounds = 12;
			    bcrypt.hash(signup.password, saltRounds, function(err, hash) {
			        // Store hash in your password DB.
			        console.log(`Pass: ${signup.password}, Hash: ${hash}`);
			        console.log(`Signing up: INSERT INTO users (username, email, passHash) 
					  VALUES ( \'${signup.username}\', \'${signup.email}\', ${hash});`);
					connection.query(`INSERT INTO users (username, email, passHash) 
						VALUES (?, ?, ?);`, [signup.username, signup.email, hash], (err, rows, fields) => {
							if (err) {
							  connection.release();
							  console.log(`Failure: ${err}`);
							  callback(err, 'MySQL connection error');
							} else {
							  console.log(`username inserted: ${signup.username}`);
			                  console.log(`SELECT LAST_INSERT_ID();`);
							  connection.query(`SELECT LAST_INSERT_ID();`, (err, rows, fields) => {
							  	connection.release();
							    if (err) {
							      console.log(`Failure: ${err}`);
							      callback(err, 'MySQL connection error');
							    } else {
							      console.log(`Returning last ID : ${rows}`);
								  const token = jwt.sign(
								    {
									  username: signup.username,
									  email: signup.email
								    },
					        	    process.env.PRIVATE_KEY,
					                { 
					            	  algorithm: 'HS256',
					          		  expiresIn: 60 * 60 
					          	    })
							      const payload = {
						              data: rows,
						              token: token
						          };
							      callback(null, payload);

							  }


							  })


							}
					    })
			        });
			  }
		  }
		});
	})
}

async function signIn(signin, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback(err, 'Error in pool connecting!');
	    return;
	  } 
	  console.log('Pool connected!');
	  console.log(`Signing in: SELECT id, username, email, passHash FROM users WHERE username = \'${signin.username}\';`);
	  connection.query('SELECT id, username, email, passHash FROM users WHERE username = ?;', [signin.username], (err, rows, fields) => {
	  		connection.release();
	  		console.log(`Rows count: ${rows.length}`);
			//try {  
			  if (err || rows.length == 0) {
				console.log(`Failure: ${err}`);
				if (err) {
					callback(err, 'User doesn\'t exist');
				} else {
			    	callback('Placeholder error', 'User doesn\'t exist');
				}
		      } else {
				console.log(`Success: ${rows[0].passHash}`);
				// Compare hashed pass with given pass
				bcrypt.compare(signin.password, rows[0].passHash, function(err2, res) {
					console.log(`bcrypt comparing result: ${res}`);
					if (err2) {
						console.log('bcrypt comparison fails');
						callback(err2, 'Decryption Error');
					} else {
						if (res) {
							// Return JWT
							console.log(`private:  ${process.env.PRIVATE_KEY}`);
							const token = jwt.sign(
								{
									username: rows[0].username,
									email: rows[0].email
								},
					        	process.env.PRIVATE_KEY,
					            { 
					            	algorithm: 'HS256',
					          		expiresIn: 60 * 60 
					          	})
				        	callback(null, [token, rows[0].id]);
					      } else {
					      	callback('Error', 'Incorrect Password');
					      }
					}
				    
				});
			  }
			// } catch (err) {
			// 	callback(err, 'Username has no match');
			// }
	  })
	});

}

async function createStep(prospectiveStep, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback('Error in pool connecting!', null);
	    return;
	  } 
	  console.log('Pool connected!');

	  console.log(`Finding goal: SELECT * FROM goals WHERE goal = \'${prospectiveStep.goal}\';`);

	  connection.query('SELECT * FROM goals WHERE goal = ?;', [prospectiveStep.goal], (err, rows, fields) => {
			//try {  
			  if (err) {
			  	console.log('Releasing connection');
			  	connection.release();
				console.log(`Failure: ${err}`);
				callback('Goal doesn\'t exist', null);
		      } else {
		      	console.log(`Success: ${rows[0].goal}`);
				console.log(`Creating: INSERT INTO ${rows[0].goal} (step, username, timeStamp, stepsIndex, approved, yesVotes, noVotes) 
			VALUES ( \'${prospectiveStep.step}\', ${prospectiveStep.username}, ${prospectiveStep.stepsIndex}, true...`);

				// 
				connection.query(`INSERT INTO ?? (step, username, timeStamp, stepsIndex, approved, yesVotes, noVotes) 
						VALUES (?, ?, ?, ?, ?, ?, ?);`, [rows[0].goal, prospectiveStep.step, prospectiveStep.username, new Date(), prospectiveStep.stepsIndex, 1, 1, 0], (err, rows, fields) => {
					//try {
						console.log('Releasing connection');
		  	  			connection.release();  
			  			if (err) {
						  console.log(`Step inserting failure: ${err}`);
						  callback('Error inserting new step', null);
		      			} else {
						  console.log('Success inserting step!');
						  callback(null, rows);
			  			}
					// } catch (err) {
					// 	callback(err, 'Username has no match');
					// }
			  	})
			  }
			// } catch (err) {
			// 	callback(err, 'Username has no match');
			// }
	  })
	});

}


async function patchStep(specificStep, callback) {

	// const connection = mysql.createConnection({
	//   host: process.env.REMOTE_HOST,
	//   user: process.env.REMOTE_USER,
	//   password: process.env.REMOTE_PASSWORD,
	//   database: process.env.REMOTE_DATABASE,
	//   insecureAuth: process.env.REMOTE_INSECUREAUTH
	// });
// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback('Error in pool connecting!', null);
	    return;
	  } 
	  console.log('Pool connected!');

	  console.log(`Finding goal: SELECT * FROM goals WHERE goal = \'${specificStep.goal}\';`);

	  connection.query('SELECT * FROM goals WHERE goal = ?;', [specificStep.goal], (err, rows, fields) => {
			//try {  
			  if (err) {
			  	connection.release();
				console.log(`Failure: ${err}`);
				callback('Goal doesn\'t exist', null);
		      } else {
		      	console.log(`Success: ${rows[0].goal}`);
				console.log(`Finding step: SELECT * FROM ${rows[0].goal} WHERE step = \'${specificStep.step}\';`);
				connection.query('SELECT * FROM ?? WHERE step = ?;', [specificStep.goal, specificStep.step], (err, rows, fields) => {
					//try {  
					  if (err) {
					  	connection.release();
						console.log(`Failure: ${err}`);
						callback('Step doesn\'t exist', null);
				      } else {
						// Increment or decrement the count based on endorse boolean
						if (specificStep.endorsed) {
							console.log(`UPDATE ${specificStep.goal} SET yesVotes=yesVotes+1 WHERE step = \'${specificStep.step}\';`);
							connection.query('UPDATE ?? SET yesVotes=yesVotes+1 WHERE step = ?;', [specificStep.goal, specificStep.step], (err, rows, fields) => {
							  	connection.release();
								if (err) {
								  console.log(`Failure: ${err}, failed to increment yesVotes for ${specificStep.goal}, ${specificStep.step}`);
								  callback('Failed to increment yesVotes', null);
								} else {
								  console.log(`Success incrementing yesVotes for ${specificStep.goal}, ${specificStep.step}`);
								  callback(null, 'Success incrementing yesVotes');
								}
							})
						} else {
							console.log(`UPDATE ${specificStep.goal} SET noVotes=noVotes+1 WHERE step = \'${specificStep.step}\';`);
							connection.query('UPDATE ?? SET noVotes=noVotes+1 WHERE step = ?;', [specificStep.goal, specificStep.step], (err, rows, fields) => {
							  	connection.release();
								if (err) {
								  console.log(`Failure: ${err}, failed to increment noVotes for ${specificStep.goal}, ${specificStep.step}`);
								  callback('Failed to increment noVotes', null);
								} else {
								  console.log(`Success incrementing noVotes for ${specificStep.goal}, ${specificStep.step}`);
								  callback(null, 'Success incrementing noVotes');
								}
							})
						}
					  }
					// } catch (err) {
					// 	callback(err, 'Username has no match');
					// }
			  	})
			  }
			// } catch (err) {
			// 	callback(err, 'Username has no match');
			// }
	  })
	});

}

// check duplicates needed for goals/s teps

async function getNumber() {
	console.log('Number');
	const number = Math.random();
    return number.toString();
}

module.exports = {
	checkToken,
	getGoals,
	createGoal,
	getSteps,
	signUp,
	signIn,
	createStep,
	patchStep,
	getNumber
};
