'use strict';

const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cyin_168',
  database : 'project1',
  insecureAuth : true
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected!');
});

async function getData(id, callback) {
	// SELECT * FROM tests WHERE id = 1;
	console.log('SELECT * FROM tests WHERE id = ' + id + ';');
	connection.query('SELECT * FROM tests WHERE id = ' + id + ';', (err, rows, fields) => {
		if (err) {
		  console.log('Failure: ' + err);
		  callback(err, null);
		} else {
		  console.log('Success');
		  callback(null, rows);
		}
	})
}

async function createData(create, callback) {
	console.log('Creating: ', `INSERT INTO tests (first_var, second_var, third_var) 
		VALUES ( \'` + create.firstVar + `\', \'` + create.secondVar + `\', ` + create.thirdVar + ` );`);
	connection.query(`INSERT INTO tests (first_var, second_var, third_var) 
		VALUES ( \'` + create.firstVar + `\', \'` + create.secondVar + `\', ` + create.thirdVar + ` );`, (err, rows, fields) => {
			if (err) {
			  console.log('Failure: ' + err);
			  callback(err, null);
			} else {
			  callback('Success');
			  console.log(null, rows);
			}
	})
}

async function getNumber() {
	console.log('Number');
	const number = Math.random();
    return number.toString();
}

module.exports = {
	getData,
	createData,
	getNumber
};
