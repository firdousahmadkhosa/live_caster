var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "livecaster"

});
module.exports = conn;


    // host: "www.db4free.net",
    // user: "firdousahmad",
    // password: "firdousahmad",
    // database:"livecaster"