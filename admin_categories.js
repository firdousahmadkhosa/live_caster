var express = require('express');
var router = express.Router();
var config = require('../config/database');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
const fileUpload = require('express-fileupload')
router.use(fileUpload());

const News = require('../models/news_categories');

router.get('/', isAdmin, function (req, res) {

	var sql = "SELECT * FROM news_categories";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.render('admin/categories', {
			object: result,
			Title: 'NewsArea All Categories',
			errorsType: '',
			msg: '',
			username: req.user[0].username,
			user_category: req.user[0].user_category
		});
	});

});



router.get('/add_categories', isAdmin, function (req, res) {

	res.render('admin/add_categories', {
		title: '',
		description: '',
		Title: 'AdminArea Add News_Category',
		username: req.user[0].username,
		user_category: req.user[0].user_category
	});
});




router.post('/upload', isAdmin, function (req, res) {

	req.checkBody('title', 'Title Must have a value.').notEmpty();
	req.checkBody('description', 'Description Must have a value.').notEmpty();
	var title = req.body.title;
	var description = req.body.description;
	if (!req.files || Object.keys(req.files).length === 0) {
		//req.checkBody('files', 'icon file must uploaded need.').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			console.log("error file is not uploaded");
			res.render('admin/add_categories', {
				errors: errors,
				title: title,
				description: description,
				Title: 'AdminArea Add News Categories',
				username: req.user[0].username,
				user_category: req.user[0].user_category
			});

		} else {
			var Query = "SELECT title from news_categories WHERE title='" + title + "'";
			config.query(Query, function (err, rows, fields) {
				if (err) console.log(err);
				if (rows.length == 0) {//NOT matched rows

					var get_categories_length = "SELECT title from news_categories WHERE title='" + title + "'";
					config.query(get_categories_length, function (err, result) {
						if (err) console.log(err);
						if (get_categories_length.length <= 7) {///save inside 

						} else {//save out side

						}
					});
					News.insert_without_file(title, description);
					req.flash('success', 'News Categories Added!');
					res.redirect('/admin_categories');
				} else {// matched rows
					req.flash('danger', 'This title is Exist choose another title');
					res.render('admin/add_categories', {
						errors: errors,
						title: '',
						description: description,
						Title: 'AdminArea Add News Categories',
						username: req.user[0].username,
						user_category: req.user[0].user_category
					});
				}
			});
		}
	} else {
		var image = req.files.icon;
		req.checkBody('files', 'icon file must uploaded anImage.').isImage(image.mimetype);
		var errors = req.validationErrors();
		if (errors) {
			console.log("error another extensions");
			res.render('admin/add_categories', {
				errors: errors,
				title: title,
				description: description,
				Title: 'AdminArea Add News Categories',
				username: req.user[0].username,
				user_category: req.user[0].user_category
			});
		} else {
			var Query = "SELECT title from news_categories WHERE title='" + title + "'";
			config.query(Query, function (err, rows, fields) {
				if (err) { console.log(err); }
				if (rows.length == 0) {//NOT matched rows
					// read binary data
					var bitmap = image.data;

					// function to encode file data to base64 encoded string
					function base64_encode(file) {
						// convert binary data to base64 encoded string
						return new Buffer.from(file).toString('base64');
					}
					var base64str = base64_encode(bitmap);
					News.insert(title, description, base64str);
					req.flash('success', 'News Categories Added!');
					res.redirect('/admin_categories');
				} else {// matched rows
					req.flash('dengar', 'This ' + title + ' is Exist choose another title');
					res.render('admin/add_categories', {
						errors: errors,
						title: '',
						description: description,
						Title: 'AdminArea Add News Categories',
						username: req.user[0].username,
						user_category: req.user[0].user_category
					});
				}
			});
		}
	}

});


router.get('/edit_categories/:id', isAdmin, function (req, res) {
	var ids = req.params.id;

	var sql_select = "SELECT * FROM news_categories	WHERE id='" + ids + "'";
	config.query(sql_select, function (err, resulted_data) {
		if (err) throw err;
		if (resulted_data[0].icon.toString() == "") {
			res.render('admin/edit_categories', {
				id: resulted_data[0].id,
				title: resulted_data[0].title,
				description: resulted_data[0].description,
				icon: '',
				Title: 'AdminArea Add News',
				username: req.user[0].username,
				user_category: req.user[0].user_category
			});
		} else {
			res.render('admin/edit_categories', {
				id: resulted_data[0].id,
				title: resulted_data[0].title,
				description: resulted_data[0].description,
				icon: 'data:image/jpeg/png;base64,' + resulted_data[0].icon,
				Title: 'AdminArea Add News',
				username: req.user[0].username,
				user_category: req.user[0].user_category
			});
		}

	});
});

router.get('/delete_categories/:id', isAdmin, function (req, res) {
	var ids = req.params.id;

	var sql_select_news_id = "SELECT id  FROM news WHERE news_categories_id='" + ids + "'";
	config.query(sql_select_news_id, function (err, result) {
		if (err) throw err;
		if (result.length != 0) {//news exist
			for (var i = 0; i < result.length; i++) {
				console.log(result[i].id);
				var sql_delete = "DELETE  FROM media_table WHERE news_id='" + result[i].id + "'";
				config.query(sql_delete, function (err) {
					if (err) throw err;
					console.log("ALL media deleted");
				});
			}
			var sql_delete_news = "DELETE  FROM news  WHERE news_categories_id='" + ids + "'";
			config.query(sql_delete_news, function (err) {
				if (err) throw err;
				console.log("all news deleted");
			});

			var sql_delete = "DELETE  FROM news_categories  WHERE id='" + ids + "'";
			config.query(sql_delete, function (err) {
				if (err) throw err;
				console.log("category deleted");
			});
		} else {//news not exist


			var sql_delete = "DELETE  FROM news_categories  WHERE id='" + ids + "'";
			config.query(sql_delete, function (err) {
				if (err) throw err;
				console.log("category deleted");
			});

		}
	});

	var sql_select = "SELECT * FROM news_categories";
	config.query(sql_select, function (err, all_data) {
		if (err) throw err;
		req.flash('danger', 'news category is deleted');
		res.render('admin/categories', {
			object: all_data,
			Title: 'NewsArea All Categories',
			errorsType: '',
			msg: 'record Deleted Seccussfully',
			username: req.user[0].username,
			user_category: req.user[0].user_category
		});
	});

});

router.post('/update/:id', isAdmin, function (req, res) {
	var ids = req.params.id;
	req.checkBody('title', 'Title Must have a value.').notEmpty();
	req.checkBody('description', 'Description Must have a value.').notEmpty();
	var title = req.body.title;
	var description = req.body.description;
	if (!req.files || Object.keys(req.files).length === 0) {

		var Query = "SELECT icon from news_categories WHERE id='" + ids + "'";
		config.query(Query, function (err, rows, fields) {
			if (err) { console.log(err); }
			if (rows[0].icon.toString() == "") {//icon file is not exist
				req.checkBody('files', 'icon file must uploaded need.').notEmpty();
				var errors = req.validationErrors();
				if (errors) {
					console.log("error file is not uploaded");
					res.render('admin/edit_categories', {
						id: ids,
						errors: errors,
						title: title,
						description: description,
						icon: '',
						Title: 'AdminArea Add News Categories',
						username: req.user[0].username,
						user_category: req.user[0].user_category
					});
				}
			} else {//file is exist
				var errors = req.validationErrors();
				if (errors) {
					console.log("error validation title or description!");
					res.render('admin/edit_categories', {
						id: ids,
						errors: errors,
						title: title,
						description: description,
						icon: 'data:image/jpeg/png;base64,' + rows[0].icon,
						Title: 'AdminArea Add News Categories',
						username: req.user[0].username,
						user_category: req.user[0].user_category
					});
				} else {
					var file = rows[0].icon.toString();
					News.update_query(ids, title, description, file);
					req.flash('success', 'Recode Updated!');
					res.redirect('/admin_categories');
				}
			}
		});



	} else {
		var image = req.files.icon;
		req.checkBody('files', 'icon file must uploaded an Image.').isImage(image.mimetype);
		var errors = req.validationErrors();
		if (errors) {
			console.log("error another extensions");
			res.render('admin/edit_categories', {
				id: ids,
				errors: errors,
				title: title,
				description: description,
				icon: '',
				Title: 'AdminArea Add News Categories',
				username: req.user[0].username,
				user_category: req.user[0].user_category
			});
		} else {
			// read binary data
			var bitmap = image.data;

			// function to encode file data to base64 encoded string
			function base64_encode(file) {
				// convert binary data to base64 encoded string
				return new Buffer.from(file).toString('base64');
			}

			var base64str = base64_encode(bitmap);
			News.update_query(ids, title, description, base64str);
			req.flash('success', 'Recode Updated!');
			res.redirect('/admin_categories');

		}
	}

});
//Exports
module.exports = router;