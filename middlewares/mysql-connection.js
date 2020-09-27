var mysql = require('mysql');

var con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

con.connect(function (err) {
  if (err) throw err;
  con.query("CREATE DATABASE IF NOT EXISTS popcorntime", function (err, result) {
    if (err) throw err;
    console.log("Popcorn Time MySQL Connected!");
  });

  con.query("CREATE TABLE IF NOT EXISTS RATING (RID int NOT NULL AUTO_INCREMENT,\
                                                MOVIE_ID VARCHAR(255),\
                                                USER_ID VARCHAR(255),\
                                                RATING INT,\
                                                COMMENT VARCHAR(400),\
                                                PRIMARY KEY (RID))"
      , function (err, result) {
    if (err) throw err;
  });


  con.query("CREATE TABLE IF NOT EXISTS SEEN_MOVIE (SMID int NOT NULL AUTO_INCREMENT,\
    MOVIE_ID VARCHAR(255),\
    USER_ID VARCHAR(255),\
    DATE date,\
    PRIMARY KEY (SMID))"
    , function (err, result) {
      if (err) throw err;
    });


});

  module.exports = con