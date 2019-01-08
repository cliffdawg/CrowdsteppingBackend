'use strict';

const mysql = require('mysql');

require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// const connection = mysql.createConnection({
//   host: process.env.LOCAL_HOST,
//   user: process.env.LOCAL_USER,
//   password: process.env.LOCAL_PASSWORD,
//   database: process.env.LOCAL_DATABASE,
//   insecureAuth: process.env.LOCAL_INSECUREAUTH
// });

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

async function getData(id, callback) {

	const connection = mysql.createConnection({
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

	connection.connect((err) => {
	  if (err) {
	    console.error('Error connecting: ' + err.stack);
	    return;
	  }
	  console.log('Connected!');

	  console.log(`SELECT * FROM tests WHERE id = ${id};`);
	  connection.query('SELECT * FROM tests WHERE id = ?;', [id], (err, rows, fields) => {
		if (err) {
		  console.log(`Failure: ${err}`);
		  callback(err, null);
		} else {
		  console.log('Success');
		  callback(null, rows);
		}
	  })

	});
}

async function createData(create, callback) {

	const connection = mysql.createConnection({
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

	connection.connect((err) => {
	  if (err) {
	    console.error('Error connecting: ' + err.stack);
	    return;
	  }
	  console.log('Connected!');
      console.log(`Creating: INSERT INTO tests (first_var, second_var, third_var) 
		VALUES ( \'${create.firstVar}\', \'${create.secondVar}\', ${create.thirdVar});`);
	  connection.query(`INSERT INTO tests (first_var, second_var, third_var) 
		VALUES (?, ?, ?);`, [create.firstVar, create.secondVar, create.thirdVar], (err, rows, fields) => {
		  if (err) {
			console.log(`Failure: ${err}`);
			callback(err, null);
	      } else {
			console.log('Success');
			callback(null, rows);
		  }
	  })

	});
}


async function signUp(signup, callback) {

	const connection = mysql.createConnection({
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

	connection.connect((err) => {
	  if (err) {
	    console.error('Error connecting: ${err.stack}');
	    return;
	  }
	  console.log('Connected!');
	  const saltRounds = 12;

      bcrypt.hash(signup.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        console.log(`Pass: ${signup.password}, Hash: ${hash}`);
        console.log(`Signing up: INSERT INTO users (username, email, passHash) 
		  VALUES ( \'${signup.username}\', \'${signup.email}\', ${hash});`);
		  connection.query(`INSERT INTO users (username, email, passHash) 
			VALUES (?, ?, ?);`, [signup.username, signup.email, hash], (err, rows, fields) => {
				if (err) {
				  console.log(`Failure: ${err}`);
				  callback(err, null);
				} else {
				  console.log('Success');
				  callback(null, rows);
				}
		    })
        });

	});
}

async function signIn(signin, callback) {

	const connection = mysql.createConnection({
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

	connection.connect((err) => {
	  if (err) {
	    console.error('Error connecting: ' + err.stack);
	    return;
	  }
	  console.log('Connected!');
	  console.log(`Signing in: SELECT username, email, passHash FROM users WHERE username = \'${signin.username}\';`);
	  connection.query('SELECT username, email, passHash FROM users WHERE username = ?;', [signin.username], (err, rows, fields) => {
			try {  
			  if (err) {
				console.log(`Failure: ${err}`);
				callback('Err', 'User doesn\'t exist');
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
					          	}
				        )
				        callback(null, token);
				      } else {
				      	callback('Err', 'Incorrect Password');
				      }
					}
				    
				});
			  }
			} catch (err) {
				callback(err, 'Username has no match');
			}
	  })
	});

}

async function getNumber() {
	console.log('Number');
	const number = Math.random();
    return number.toString();
}

module.exports = {
	checkToken,
	getData,
	createData,
	signUp,
	signIn,
	getNumber
};
