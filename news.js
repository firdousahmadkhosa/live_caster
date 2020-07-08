var config = require('../config/database');
//News schema 

var news = "CREATE TABLE  if not exists news_categories (id INT AUTO_INCREMENT ,title VARCHAR (255)  PRIMARY KEY NOT NULL, sub_title VARCHAR (255),description  VARCHAR (255),news_categories_id  INT ,date_time datetime,authorize_users_id INT NOT NULL)";
config.query(news, function (err, result) {
	if (err) throw err;
	console.log("news Table was created");
});


var insert = function (head, subhead, desc, cate, authorize) {
	var insertion = "INSERT INTO news(news_title,sub_title,description,news_categories_id,authorize_users_id) VALUES ('" + head + "','" + subhead + "','" + desc + "','" + cate + "','" + authorize + "')";
	config.query(insertion, function (err, result) {
		if (err) throw err;
		console.log("record inserted");
		
	});
};
var media_insert = function (des, name, mimetype, size, base64str) {
	var search = "SELECT id from news WHERE description='" + des+ "'";
	config.query(search, function (err, resulted,fields) {
		if (err) {console.log(err)};
		var temp = resulted.length-1;
		var temp2 = resulted[temp].id;
	var insertion = "INSERT INTO media_table(news_id,media_name,media_type,media_size,media_data) VALUES ('" + temp2 +"','" + name + "','" + mimetype + "','" + size + "','" + base64str + "')";
	config.query(insertion, function (err, result) {
		if (err) throw err;
		console.log("media file inserted");
	});
	});
};
var update_query = function (ids,head, subhead, desc, cate, authorize) {
	var sql_update_query = "UPDATE  news SET news_title='" + head + "',sub_title='" + subhead + "',description = '" + desc + "',news_categories_id = '"+ cate+"',authorize_users_id= '"+authorize+"'   WHERE id='" + ids + "'";
	config.query(sql_update_query, function (err,result) {
		if (err) throw err;

		console.log("recode Updated!");

	});
};
module.exports = {
	news: news,
	insert: insert,
	media_insert: media_insert,
	update_query: update_query
};