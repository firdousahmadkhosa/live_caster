var express = require('express');
var router = express.Router();
var config = require('../config/database');
const News = require('../models/news_categories');

router.get('/', function (req, res) {
	var bracking_news = "SELECT title FROM headline ORDER BY id DESC"
	config.query(bracking_news, function (err, rows) {
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			var sql_users = "SELECT  news.id, news.news_title, news.sub_title, news.description, news_categories.title, news.date_time, authorize_users.username,  media_table.media_type, media_table.media_data FROM (((news INNER JOIN news_categories ON news.news_categories_id=news_categories.id ) INNER JOIN authorize_users ON news.authorize_users_id=authorize_users.id) Left JOIN media_table ON news.id=media_table.news_id ) ORDER BY id DESC";
			config.query(sql_users, function (err, newsAll) {
				if (err) throw err;

				var arr = [];
				var id = [];
				for (var i = 0; i < newsAll.length; i++) {

					arr.push(newsAll[i].title);
					id.push(newsAll[i].id);
				}


				res.render('frentEnd/index', {
					title: "Live Caster",
					bracking_news: rows,
					news_categories: result,
					ids: removeDups(id).reverse(),
					categories_news: removeDups(arr),
					news: newsAll

				});
			});
		});
	});
});
router.get('/category/:name', function (req, res) {
	var name = req.params.name;
	var sql_select = "SELECT id FROM news_categories WHERE title='" + name + "'";
	config.query(sql_select, function (err, rows) {
		res.redirect('/category/' + name + '/' + rows[0].id);
	});
});
router.get('/category/:name/:id', function (req, res) {
	var name = req.params.name;
	var id = req.params.id;

	if(id==-1){//about us
	res.redirect('/about_us');
	}
	if(id==-2){//Contect
		res.redirect('/contect_us');
	}
	var bracking_news = "SELECT title FROM headline ORDER BY id DESC"
	config.query(bracking_news, function (err, rows) {
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			var sql_users = "SELECT  news.id, news.news_title, news.sub_title, news.description, news_categories.title, news.date_time, authorize_users.username,  media_table.media_type, media_table.media_data FROM (((news INNER JOIN news_categories ON news.news_categories_id=news_categories.id ) INNER JOIN authorize_users ON news.authorize_users_id=authorize_users.id) Left JOIN media_table ON news.id=media_table.news_id )Where title='" + name + "' ORDER BY id DESC";
			config.query(sql_users, function (err, newsAll) {
				if (err) throw err;
				var arr = [];
				var id = [];
				for (var i = 0; i < newsAll.length; i++) {

					arr.push(newsAll[i].title);
					id.push(newsAll[i].id);
				}
				res.render('frentEnd/category_selected', {
					title: "Live Caster",
					bracking_news: rows,
					news_categories: result,
					ids: removeDups(id).reverse(),
					categories_news: removeDups(arr),
					news: newsAll

				});

			});
		});
	});
});
router.get('/news/:id', function (req, res) {
	var id = req.params.id;
	var bracking_news = "SELECT title FROM headline ORDER BY id DESC"
	config.query(bracking_news, function (err, rows) {
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			var sql_users = "SELECT  news.id, news.news_title, news.sub_title, news.description, news_categories.title, news.date_time, authorize_users.username,  media_table.media_type, media_table.media_data FROM (((news INNER JOIN news_categories ON news.news_categories_id=news_categories.id ) INNER JOIN authorize_users ON news.authorize_users_id=authorize_users.id) Left JOIN media_table ON news.id=media_table.news_id ) ORDER BY id DESC";
			config.query(sql_users, function (err, newsAll) {
				if (err) throw err;
			
				var last_id = newsAll[0].id;
				var sql_users = "SELECT  news.id, news.news_title, news.sub_title, news.description, news_categories.title, news.date_time, authorize_users.username,  media_table.media_type, media_table.media_data FROM (((news INNER JOIN news_categories ON news.news_categories_id=news_categories.id ) INNER JOIN authorize_users ON news.authorize_users_id=authorize_users.id) Left JOIN media_table ON news.id=media_table.news_id ) WHERE news.id Between '" + id + "' And '" + last_id + "'  ORDER BY id ASC";
				config.query(sql_users, function (err, selected_news_from) {
					if (err) throw err;
var news_all =[];
for(var i=0; i<newsAll.length; i++){
	news_all.push(newsAll[i].id);
}
				
					var arr = [];
					var id = [];
					for (var i = 0; i < selected_news_from.length; i++) {

						arr.push(selected_news_from[i].title);
						id.push(selected_news_from[i].id);

					}
				
					res.render('frentEnd/news_selected', {
						title: "Live Caster",
						bracking_news: rows,
						news_categories: result,
						ids: removeDups(id),
						categories_news: removeDups(arr),
						news_all:removeDups(news_all),
						news: selected_news_from

					});
				});
			});
		});
	});
});

router.get('/about_us',function(req,res){
	var bracking_news = "SELECT title FROM headline ORDER BY id DESC"
	config.query(bracking_news, function (err, rows) {
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;

			var sql = "SELECT * FROM news";
			config.query(sql, function (err, news) {
				if (err) throw err;

			var sql_users = "SELECT * FROM authorize_users WHERE validation_status='yes'";
			config.query(sql_users, function (err, all_users) {
				if (err) throw err;
			
				res.render('frentEnd/about_us', {
					title: "Live Caster",
					bracking_news: rows,
					news_categories: result,
					total_news:news.length,
					users: all_users
				});
			});
			});
		});
	});
});

router.get('/contect_us',function(req,res){
	var bracking_news = "SELECT title FROM headline ORDER BY id DESC"
	config.query(bracking_news, function (err, rows) {
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			var sql_users = "SELECT  news.id, news.news_title, news.sub_title, news.description, news_categories.title, news.date_time, authorize_users.username,  media_table.media_type, media_table.media_data FROM (((news INNER JOIN news_categories ON news.news_categories_id=news_categories.id ) INNER JOIN authorize_users ON news.authorize_users_id=authorize_users.id) Left JOIN media_table ON news.id=media_table.news_id )Where title='" + name + "' ORDER BY id DESC";
			config.query(sql_users, function (err, newsAll) {
				if (err) throw err;
				var arr = [];
				var id = [];
				for (var i = 0; i < newsAll.length; i++) {

					arr.push(newsAll[i].title);
					id.push(newsAll[i].id);
				}
				res.render('frentEnd/category_selected', {
					title: "Live Caster",
					bracking_news: rows,
					news_categories: result,
					ids: removeDups(id).reverse(),
					categories_news: removeDups(arr),
					news: newsAll

				});

			});
		});
	});
});
function removeDups(arr) {
	let unique = {};
	arr.forEach(function (i) {
		if (!unique[i]) {
			unique[i] = true;
		}
	});
	return Object.keys(unique);
}


//Exports
module.exports = router;