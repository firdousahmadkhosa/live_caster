var config = require('../config/database');
//News schema 

// var news_categories = "CREATE TABLE  if not exists news_categories (id INT AUTO_INCREMENT ,title VARCHAR (255)  PRIMARY KEY NOT NULL,description  VARCHAR (255),icon mediumblob NOT NULL)";
// config.query(news_categories, function (err, result) {
// 	if (err) throw err;
// 	console.log("news_categories Table was created");
// });

var status='no';
var regis_date = 'null';
var insert = function (username, email,password,phone_number,user_category,address,base64str,v_code) {
var regis_date = 'null';
var regis_date = 'null';
var insertion = "INSERT INTO authorize_users(username, email,password,phone_number,user_category,address,profile_picture,validation_code,validation_status,login_date) VALUES ('" + username + "','" + email + "','" + password + "','"+phone_number+ "','"+user_category+ "','"+address+ "','"+base64str+ "','"+v_code+ "','"+status+"','"+regis_date+"')";
	config.query(insertion, function (err, result) {
		if (err) throw err;
		console.log("user inserted");
	});
};
var update_query = function(username, email,password,phone_number,user_category,address,v_code,ids){
	var sql_update_query= "UPDATE  authorize_users SET username='" + username + "',email='" + email + "',password = '" + password + "',phone_number = '" + phone_number + "',user_category = '" + user_category + "',address = '" + address + "',validation_code = '" + v_code + "'   WHERE id='" + ids + "'";
	config.query(sql_update_query, function (err) {
		if (err) throw err;
		console.log("recode Updated!");

	});
};

var update_query_with_file = function(username, email,password,phone_number,user_category,address,v_code,ids,base64str){
	var sql_update_query= "UPDATE  authorize_users SET username='" + username + "',email='" + email + "',password = '" + password + "',phone_number = '" + phone_number + "',user_category = '" + user_category + "',address = '" + address + "',validation_code = '" + v_code + "',profile_picture = '" + base64str + "'   WHERE id='" + ids + "'";
	config.query(sql_update_query, function (err) {
		if (err) throw err;
		console.log("recode Updated!");

	});
};
module.exports = {
	//news_categories: news_categories,
	insert: insert,
	update_query:update_query,
	update_query_with_file:update_query_with_file
};