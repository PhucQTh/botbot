const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db.sqlite', (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
  }
});
/**
 * Initializes the database by creating a table for members if it doesn't already exist.
 *
 * @param {function} callback - The callback function to be called after the table is created.
 * @return {void} This function does not return anything.
 */
const dbInit = () => {
  db.run(
    `CREATE TABLE members (id INTEGER PRIMARY KEY AUTOINCREMENT, username text unique)`,
    (err) => {
      if (err) {
        console.log('Table members already exists');
      } else {
        console.log('Created table members');
      }
    }
  );
};
const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT username FROM members', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const usernames = rows.map((row) => row.username);
        resolve(usernames);
      }
    });
  });
};

const addUser = (user) => {
  try {
    db.run('INSERT OR IGNORE INTO members (username) VALUES (?)', user);
  } catch (error) {}
};

module.exports = {
  dbInit,
  getUsers,
  addUser,
};
