'use strict';

// Heroku looks for Procfile, which explicitly declares what command should be executed to start the app
// ?? in query is for ids, ? is for values
// The MySQL protocol is sequential, this means that you need multiple connections to execute queries in parallel
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
	endorsed BOOLEAN NOT NULL DEFAULT FALSE, 
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
		  console.log(`Failure getting goals: ${err}`);
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

	// Run the tasks collection of functions in parallel
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
				console.log(`Failure inserting goal: ${err}`);
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
				console.log(`Failure tabling goal: ${err}`);
				parallelCallback('Error creating goal table', null);
		      } else {
				console.log('Success tabling goal!');
				parallelCallback(null, rows);
			  }
		  })
		});
    }],
	// Optional callback that is immediately called with error when one passed to parallelCallback, and waits for all the results of tasks to be gathered
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

	// Run the tasks collection of functions in parallel
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
				  console.log(`Failure fetching steps: ${err}`);
				  parallelCallback('Can\'t fetch steps', null);
			  } else {
			  	  console.log('Success fetching steps for goal!');
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
				  console.log(`Failure retrieving goal username: ${err}`);
				  parallelCallback('Couldn\'t retrieve associated username', null);
			  } else {
				  console.log('Success retrieving goal username!')
				  console.log(rows[0]);
		  		  parallelCallback(null, rows);
			  }
			});
		});
    }],
	// Optional callback that is immediately called with error when one passed to parallelCallback, and waits for all the results of tasks to be gathered
	function(err, results) {
		if (err) {
			callback(err, null);
		}
	    // Errors and results stacked in an array [0],[1]
	 	callback(null, results);
	});
}







async function getVotes(getVotes, callback) {

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

	pool.getConnection(function(err, connection) {
  	  if (err) {
	    console.error('Error in pool connecting: ' + err.stack);
	    callback('Error in pool connecting!', null);
	    return;
	  } 
	  console.log('Pool connected!');

	  // SELECT votes.step, votes.endorsed FROM votes INNER JOIN users ON users.id=votes.id WHERE username='Dan' AND goal='tester';
	  console.log(`Joining tables for votes: SELECT votes.step, votes.endorsed FROM votes INNER JOIN users ON users.id = votes.id WHERE username = \'${getVotes.username}\' AND goal = \'${getVotes.goal}\';`);

	  connection.query('SELECT votes.step, votes.endorsed FROM votes INNER JOIN users ON users.id = votes.id WHERE username = ? AND goal = ?;', [getVotes.username, getVotes.goal], (err, rows, fields) => {
			console.log('Releasing connection');
			connection.release();
			//try {  
			  if (err) {
				console.log(`Failure joining tables: ${err}`);
				callback('Joining tables for votes fails', null);
		      } else {
		      	console.log(`Success joining tables!`);
		      	console.log(rows[0]);
				callback(null, rows);
			  }
			// } catch (err) {
			// 	callback(err, 'Username has no match');
			// }
	  })
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
							  console.log(`Failure recording user: ${err}`);
							  callback(err, 'MySQL connection error');
							} else {
							  console.log(`username inserted: ${signup.username}`);
			                  console.log(`SELECT LAST_INSERT_ID();`);
			                  // Retrieve the newly-created user's ID
							  connection.query(`SELECT LAST_INSERT_ID();`, (err, rows, fields) => {
							  	connection.release();
							    if (err) {
							      console.log(`Failure returning last ID: ${err}`);
							      callback(err, 'MySQL connection error');
							    } else {
							      console.log(`Returning last ID : ${rows[0]['LAST_INSERT_ID()']}`);
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
						              data: rows[0]['LAST_INSERT_ID()'],
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
				console.log(`Failure finding user: ${err}`);
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
				console.log(`Failure finding goal: ${err}`);
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
						  console.log(`Failure inserting step: ${err}`);
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
				console.log(`Failure finding goal: ${err}`);
				callback('Goal doesn\'t exist', null);
		      } else {
		      	console.log(`Success: ${rows[0].goal}`);
				console.log(`Finding step: SELECT * FROM ${rows[0].goal} WHERE step = \'${specificStep.step}\';`);
				connection.query('SELECT * FROM ?? WHERE step = ?;', [rows[0].goal, specificStep.step], (err, rows, fields) => {
					//try {  
					  if (err) {
					  	connection.release();
						console.log(`Failure finding step: ${err}`);
						callback('Step doesn\'t exist', null);
				      } else {
				      	// Record yesVotes and noVotes to use in following query, 'rows' field changes with future queries
				      	var currentYesVotes = rows[0].yesVotes;
				      	var currentNoVotes = rows[0].noVotes;
				      	console.log(`Success: ${rows[0].step}`);
						// Increment or decrement the count based on endorse boolean
						var incrementVotes = specificStep.endorsed ? 'yesVotes' : 'noVotes';
						console.log(`UPDATE ${specificStep.goal} SET ${incrementVotes}=${incrementVotes}+1 WHERE step = \'${rows[0].step}\';`);
						connection.query('UPDATE ?? SET ??=??+1 WHERE step = ?;', [specificStep.goal, incrementVotes, incrementVotes, rows[0].step], (err, rows, fields) => {
							if (err) {
							  connection.release();
							  console.log(`Failure: ${err}, failed to increment ${incrementVotes} for ${specificStep.goal}, ${specificStep.step}`);
							  callback('Failed to increment votes', null);
							} else {
								currentYesVotes = (specificStep.endorsed) ? currentYesVotes+1 : currentYesVotes;
								currentNoVotes = (specificStep.endorsed) ? currentNoVotes : currentNoVotes+1;
								console.log(`Success recording ${specificStep.endorsed ? 'endorsing' : 'opposing'} vote for ${specificStep.goal}, ${specificStep.step}`);
							  	// Calculate the approval status of the step after incrementing vote
							  	console.log(`currentYesVotes: ${currentYesVotes}, currentNoVotes: ${currentNoVotes}`);
								var approvedResult = (currentYesVotes >= currentNoVotes) ? true : false;
								console.log(`UPDATE ${specificStep.goal} SET approved=${approvedResult} WHERE step = \'${specificStep.step}\';`);
								connection.query('UPDATE ?? SET approved=? WHERE step = ?;', [specificStep.goal, approvedResult, specificStep.step], (err, rows, fields) => {
									if (err) {
									  connection.release();
							  		  console.log(`Failure: ${err}, failed to set ${approvedResult ? 'approved' : 'not approved'} for ${specificStep.goal}, ${specificStep.step}`);
							  		  callback('Failed to set approval', null);
									} else {
							  		  console.log(`Success setting ${approvedResult ? 'approved' : 'not approved'} for ${specificStep.goal}, ${specificStep.step}`);
							  		  // Insert new vote and remove previous vote asynchronously
							  		  async.parallel([
    								  function(parallelCallback) {
   									  	  pool.getConnection(function(err, connection) {
	  	  									if (err) {
		    								  console.error('Error in pool connecting: ' + err.stack);
		    								  parallelCallback('Error in pool connecting!', null);
		    								  return;
		  									} 
											// Insert incremented vote and record so that can later check if a user made that vote. This query inserts only if doesn't already exist
							  		  		console.log(`INSERT INTO votes (id, goal, step, endorsed) SELECT * FROM (SELECT ${specificStep.userID}, \'${specificStep.goal}\', \'${specificStep.step}\', ${specificStep.endorsed}) AS temp WHERE NOT EXISTS (SELECT * FROM votes WHERE id = ${specificStep.userID} AND goal = \'${specificStep.goal}\' AND step = \'${specificStep.step}\' AND endorsed = ${specificStep.endorsed}) LIMIT 1;`);
							  		  		connection.query('INSERT INTO votes (id, goal, step, endorsed) SELECT * FROM (SELECT ?, ?, ?, ?) AS temp WHERE NOT EXISTS (SELECT * FROM votes WHERE id = ? AND goal = ? AND step = ? AND endorsed = ?) LIMIT 1;', [specificStep.userID, specificStep.goal, specificStep.step, specificStep.endorsed, specificStep.userID, specificStep.goal, specificStep.step, specificStep.endorsed], (err, rows, fields) => {
							  		  			connection.release();
							  	  	  	  		if (err) {
							    				  console.log(`Failure: ${err}, failed to record ${specificStep.endorsed ? 'endorsing' : 'opposing'} vote for ${specificStep.goal}, ${specificStep.step}`);
							  					  parallelCallback('Failed to record vote', null);
							  	  		  		} else {
							  	  		  		  console.log(`Success inserting vote for ${specificStep.goal}, ${specificStep.step}`);
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
											// Delete the outdated vote
							  		  		console.log(`DELETE FROM votes WHERE id = ${specificStep.userID} AND goal = \'${specificStep.goal}\' AND step = \'${specificStep.step}\' AND endorsed = ${specificStep.endorsed};`);
							  		  		connection.query('DELETE FROM votes WHERE id = ? AND goal = ? AND step = ? AND endorsed = ?;', [specificStep.userID, specificStep.goal, specificStep.step, !specificStep.endorsed], (err, rows, fields) => {
							  		  			connection.release();
							  	  	  			if (err) {
							    				  console.log(`Failure: ${err}, failed to delete ${specificStep.endorsed ? 'opposing' : 'endorsing'} vote for ${specificStep.goal}, ${specificStep.step}`);
							  					  parallelCallback('Failed to delete vote', null);
							  	  				} else {
							  	  				  console.log(`Success deleting vote for ${specificStep.goal}, ${specificStep.step}`);
							  					  parallelCallback(null, rows);
							  	  		  		}
							  		  		})
										  });
									  }],
									  function(err, results) {
									  	  if (err) {
									  		  callback(err, null);
									  	  }
	    								  // Errors and results stacked in an array [0],[1]
	 									  callback(null, results);
									  });
									}
								})
							}
						})
					// } catch (err) {
					// 	callback(err, 'Username has no match');
					// }
					  }
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
	getVotes,
	signUp,
	signIn,
	createStep,
	patchStep,
	getNumber
};
