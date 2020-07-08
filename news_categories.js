var config = require('../config/database');
//News schema 

var news_categories = "CREATE TABLE  if not exists news_categories (id INT AUTO_INCREMENT ,title VARCHAR (255)  PRIMARY KEY NOT NULL,description  VARCHAR (255),icon mediumblob NOT NULL)";
config.query(news_categories, function (err, result) {
	if (err) throw err;
	console.log("news_categories Table was created");
});


var insert = function (tit, des, ic) {
	var insertion = "INSERT INTO news_categories(title,description,icon) VALUES ('" + tit + "','" + des + "','" + ic + "')";
	config.query(insertion, function (err, result) {
		if (err) throw err;
		console.log("record inserted");
	});
};
var update_query = function(ids,tit,des,icon){
	var sql_update_query= "UPDATE  news_categories SET title='" + tit + "',description='" + des + "',icon = '" + icon + "'   WHERE id='" + ids + "'";
	config.query(sql_update_query, function (err) {
		if (err) throw err;
		console.log("recode Updated!");

	});
};
var insert_without_file= function(tit,des){
	var insertion = "INSERT INTO news_categories(title,description,icon) VALUES ('" + tit + "','" + des + "','" + null + "')";
	config.query(insertion, function (err, result) {
		if (err) throw err;
		console.log("record inserted");
	});
}
module.exports = {
	news_categories: news_categories,
	insert: insert,
	insert_without_file:insert_without_file,
	update_query:update_query
};