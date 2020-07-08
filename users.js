var express = require('express');
var router = express.Router();
var config = require('../config/database');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
var isEditor = auth.isEditor;
const fileUpload = require('express-fileupload')
const passport = require('passport');
router.use(fileUpload());
const authorize_users = require('../models/authorize_users');

router.get('/forgot', function (req, res) {
	var sql = "SELECT * FROM news_categories";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.render('admin/forgot_password', {
			title: 'Forgot password',
			username: '',
			email: '',
			v_code: '',
			news_categories: result
		});
	});
});

router.post('/forgot', function (req, res) {
	var username = req.body.username;
	var email = req.body.email;
	var v_code = req.body.v_code;
	req.checkBody('username', 'Username Must have a requird.').notEmpty();
	req.checkBody('email', 'email Must have a required.').isEmail();
	req.checkBody('v_code', 'password Must have a required.').notEmpty();
	var errors = req.validationErrors();
	if (errors) {//check validation errors
		req.flash('', '');
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			res.render('admin/forgot_password', {
				title: 'Forgot password',
				username: username,
				email: email,
				v_code: v_code,
				news_categories: result,
				errors: errors
			});
		});
	} else {
		var sql = "SELECT * FROM authorize_users WHERE username='" + username + "'";
		config.query(sql, function (err, rows) {
			if (err) throw err;
			if (rows.length != 0) {
				if (rows[0].email !== email) {


					var sql = "SELECT * FROM news_categories";
					config.query(sql, function (err, result) {
						if (err) throw err;
						req.flash('danger', 'email is incurrect');
						res.render('admin/forgot_password', {
							title: 'Forgot Password',
							username: username,
							email: '',
							v_code: v_code,
							news_categories: result
						});
					});
				} else if (rows[0].validation_code !== v_code) {
					var sql = "SELECT * FROM news_categories";
					config.query(sql, function (err, result) {
						if (err) throw err;
						req.flash('danger', 'Secrit code is incorrect');
						res.render('admin/forgot_password', {
							title: 'Forgot Password',
							username: username,
							email: email,
							v_code: '',
							news_categories: result
						});
					});
				} else if (rows[0].email === email && rows[0].validation_code === v_code) {//all correct than change password
					var sql = "SELECT * FROM news_categories";
					config.query(sql, function (err, result) {
						if (err) throw err;
						res.render('admin/new_password', {
							title: 'Change Password',
							id: rows[0].id,
							news_categories: result
						});
					});
				}
			} else {
				var sql = "SELECT * FROM news_categories";
				config.query(sql, function (err, result) {
					if (err) throw err;
					req.flash('danger', 'username is incorrect');
					res.render('admin/forgot_password', {
						title: 'Forgot Password',
						username: '',
						email: email,
						v_code: v_code,
						news_categories: result
					});
				});
			}
		});

	}
});
router.post('/new_password/:id', function (req, res) {
	var id = req.params.id;
	var password = req.body.password;
	req.checkBody('password', 'New Password Must have requird.').notEmpty();
	var errors = req.validationErrors();
	if (errors) {//check validation errors
		var sql = "SELECT * FROM news_categories";
		config.query(sql, function (err, result) {
			if (err) throw err;
			res.render('admin/new_password', {
				title: 'Change password',
				id: id,
				news_categories: result,
				errors: errors
			});
		});
	} else {
		var sql = "UPDATE authorize_users SET password='" + password + "'WHERE id='" + id + "'";
		config.query(sql, function (err, result) {
			if (err) throw err;

			req.flash('success', 'Successfully your password is changed! Please Login')
			res.redirect('/users/login');

		})
	}

});

router.get('/activate/:id', isAdmin, function (req, res) {
	var id = req.params.id;
	var yes = 'yes'
	var sql_activate = "UPDATE authorize_users SET validation_status='" + yes + "' WHERE id='" + id + "'";
	config.query(sql_activate, function (err, result) {
		if (err) throw err;
		req.flash('success', 'Successfully user is activated!')
		res.redirect('/users/');
	});
});
router.get('/delete_user/:id', isAdmin, function (req, res) {
	var id = req.params.id;

	if (req.user[0].id != id) {
		var select_news = "SELECT id FROM news WHERE 	authorize_users_id ='" + id + "'";
		config.query(select_news, function (err, rows) {
			if (err) throw err;
			if (rows.length != 0) { //it means auther users news exist
				for (var i = 0; i < rows.length; i++) {
					var Delete_media = "DELETE FROM media_table WHERE news_id ='" + rows[i].id + "'";
					config.query(Delete_media, function (err, result) {
						if (err) throw err;
					});


				}


				var Delete_News = "DELETE FROM news WHERE authorize_users_id ='" + id + "'";
				config.query(Delete_News, function (err, result) {
					if (err) throw err;
				});
				var sql = "DELETE FROM authorize_users WHERE id='" + id + "'";
				config.query(sql, function (err, result) {
					if (err) throw err;
				});
				req.flash('success', 'Successfully user is Deleted!')
				res.redirect('/users/');

			} else { //it means auther  users news not exist
				var sql = "DELETE FROM authorize_users WHERE id='" + id + "'";
				config.query(sql, function (err, result) {
					if (err) throw err;

					req.flash('success', 'Successfully user is Deleted!')
					res.redirect('/users/');
				});
			}
		});

	} else {
		var select_news = "SELECT id FROM news WHERE 	authorize_users_id ='" + id + "'";
		config.query(select_news, function (err, rows) {
			if (err) throw err;
			if (rows.length != 0) { //it means auther users news exist
				for (var i = 0; i < rows.length; i++) {
					var Delete_media = "DELETE FROM media_table WHERE news_id ='" + rows[i].id + "'";
					config.query(Delete_media, function (err, result) {
						if (err) throw err;
					});
				}
				var Delete_News = "DELETE FROM news WHERE authorize_users_id ='" + id + "'";
				config.query(Delete_News, function (err, result) {
					if (err) throw err;
				});
				var sql = "DELETE FROM authorize_users WHERE id='" + id + "'";
				config.query(sql, function (err, result) {
					if (err) throw err;
				});
				req.flash('success', 'Your account is Successfully Deleted!')
				res.redirect('/users/logout');

			} else { //it means auther  users news not exist
				var sql = "DELETE FROM authorize_users WHERE id='" + id + "'";
				config.query(sql, function (err, result) {
					if (err) throw err;

					req.flash('success', 'Your account is Successfully Deleted!')
					res.redirect('/users/logout');
				});
			}
		});
	}
});

router.get('/login', function (req, res) {
	if (res.locals.user) res.redirect('/admin_news');
	var sql = "SELECT * FROM news_categories";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.render('admin/login', {
			title: 'User Login ',
			username: '',
			password: '',
			news_categories: result
		});
	});
});
router.get('/validation_check', function (req, res) {
 

	if (req.user[0].user_category == 'admin' && req.user[0].validation_status == "yes") {
		var date = new Date();
		var sql = "UPDATE authorize_users SET login_date='" + date + "' WHERE username='" + req.user[0].username + "'";
		config.query(sql, function (err, result) {
			console.log(err);
		});
	
		res.redirect('/admin_news/dashboard');
	} else if (req.user[0].user_category == 'Editor' && req.user[0].validation_status == "yes") {
		var date = new Date();
		var sql = "UPDATE authorize_users SET login_date='" + date + "' WHERE username='" + req.user[0].username + "'";
		config.query(sql, function (err, result) {
			console.log(err);
		});
		res.redirect('/editor_news');
	}
});



router.post('/login', function (req, res, next) {
	var username = req.body.username
	passport.authenticate('local', {
		successRedirect: '/users/validation_check',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success', 'you are logged out!');
	res.redirect('/users/login');
});


router.get('/register', function (req, res) {
	var sql = "SELECT * FROM news_categories";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.render('admin/register', {
			username: '',
			email: '',
			password: '',
			password2: '',
			phone_number: '',
			user_category: '',
			address: '',
			v_code: '',
			news_categories: result,
			title: 'Register User',

		});
	});
});
router.post('/register', function (req, res) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var phone_number = req.body.phone_number;
	var user_category = req.body.user_category;
	var address = req.body.address;
	var v_code = req.body.v_code;
	req.checkBody('username', 'Username Must have a requird.').notEmpty();
	req.checkBody('email', 'email Must have a required.').isEmail();
	req.checkBody('password', 'password Must have a required.').notEmpty();
	req.checkBody('password2', 'Passwords do not matched!').equals(password);
	req.checkBody('phone_number', 'Phone number Must have a required.').notEmpty();
	req.checkBody('address', 'address Must have a required.').notEmpty();
	req.checkBody('v_code', 'validation code Must have a required.').notEmpty();

	if (!req.files || Object.keys(req.files).length === 0) {
		req.checkBody('files', 'picture must uploaded need.').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				res.render('admin/register', {
					username: username,
					email: email,
					password: password,
					password2: password2,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					v_code: v_code,
					title: 'Register User',
					news_categories: result,
					errors: errors

				});
			});
		}
	} else {
		var image = req.files.picture;
		req.checkBody('files', 'profile picture must uploaded anImage.').isImage(image.mimetype);
		var errors = req.validationErrors();
		if (errors) {
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				console.log("error another extensions");
				res.render('admin/register', {
					username: username,
					email: email,
					password: password,
					password2: password2,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					v_code: v_code,
					title: 'Register User',
					news_categories: result,
					errors: errors
				});
			});
		} else {

			var Query = "SELECT username from authorize_users WHERE username='" + username + "'";
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
					authorize_users.insert(username, email, password, phone_number, user_category, address, base64str, v_code);
					req.flash('success', 'Your requist is submetted wait for admin responsed!');
					res.redirect('/users/login');
				} else {// matched rows
					var sql = "SELECT * FROM news_categories";
					config.query(sql, function (err, result) {
						if (err) throw err;
						req.flash('danger', 'This ' + username + ' is Exist choose another username');
						res.render('admin/register', {
							username: username,
							email: email,
							password: password,
							password2: password2,
							phone_number: phone_number,
							user_category: user_category,
							address: address,
							p_picture: '',
							v_code: v_code,
							title: 'Register User',
							news_categories: result,
							errors: errors


						});
					});
				}
			});
		}
	}
});



router.get('/profile/Change_Password/:name', function (req, res) {
	var username = req.params.name;
	var sql = "SELECT id FROM authorize_users WHERE username='" + username + "'";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.redirect('/users/profile/my_account_edit/' + result[0].id);
	});
});
router.post('/upload', isAdmin, function (req, res) {

	req.checkBody('title', 'Title Must have a value.').notEmpty();
	req.checkBody('description', 'Description Must have a value.').notEmpty();
	var title = req.body.title;
	var description = req.body.description;
	if (!req.files || Object.keys(req.files).length === 0) {
		req.checkBody('files', 'icon file must uploaded need.').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			console.log("error file is not uploaded");
			res.render('admin/add_categories', {
				errors: errors,
				title: title,
				description: description,
				Title: 'AdminArea Add News Categories',
				username: req.user[0].username,
				user_category:req.user[0].user_category
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
				user_category:req.user[0].user_category
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
						user_category:req.user[0].user_category
					});
				}
			});
		}
	}

});


router.get('/', isAdmin, function (req, res) {
	var sql = "SELECT * From authorize_users ORDER BY id DESC";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.render('admin/users', {
			users: result,
			Title: 'AdminArea All News',
			username: req.user[0].username,
			user_category:req.user[0].user_category
		});
	});

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
				user_category:req.user[0].user_category
			});
		} else {
			res.render('admin/edit_categories', {
				id: resulted_data[0].id,
				title: resulted_data[0].title,
				description: resulted_data[0].description,
				icon: 'data:image/jpeg/png;base64,' + resulted_data[0].icon,
				Title: 'AdminArea Add News',
				username: req.user[0].username,
				user_category:req.user[0].user_category
			});
		}

	});
});

router.get('/delete_categories/:id', isAdmin, function (req, res) {
	var ids = req.params.id;
	var sql_delete = "DELETE  FROM news_categories  WHERE id='" + ids + "'";
	config.query(sql_delete, function (err) {
		if (err) throw err;
		console.log("record deleted");
	});

	var sql_select = "SELECT * FROM news_categories";
	config.query(sql_select, function (err, all_data) {
		if (err) throw err;
		res.render('admin/categories', {
			object: all_data,
			Title: 'NewsArea All Categories',
			errorsType: '',
			msg: 'record Deleted Seccussfully',
			username: req.user[0].username,
			user_category:req.user[0].user_category
		});
	});

});

router.get('/delete_categories/icon/:id', isAdmin, function (req, res) {

	var ids = req.params.id;
	var sql_delete_icon = "UPDATE  news_categories SET icon =''   WHERE id='" + ids + "'";
	config.query(sql_delete_icon, function (err) {
		if (err) throw err;
	});

	var sql_select = "SELECT * FROM news_categories	WHERE id='" + ids + "'";
	config.query(sql_select, function (err, resulted_data, fields) {
		if (err) throw err;
		res.render('admin/edit_categories', {
			id: resulted_data[0].id,
			title: resulted_data[0].title,
			description: resulted_data[0].description,
			icon: resulted_data[0].icon,
			Title: 'AdminArea Add News',
			username: req.user[0].username,
			user_category:req.user[0].user_category
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
						user_category:req.user[0].user_category
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
						user_category:req.user[0].user_category
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
				user_category:req.user[0].user_category
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
function convert_into_time(str) {
	var dt = new Date(str),

		h = dt.getHours(), m = dt.getMinutes(),
		time = (h > 12) ? (h - 12 + ':' + m + ' PM') : (h + ':' + m + ' AM')

	return [time];
}
function convert_into_date(strin) {
	var date_ob = new Date(strin),
		mnth = ("0" + (date_ob.getMonth() + 1)).slice(-2),
		day = ("0" + date_ob.getDate()).slice(-2);

	return [day + "-" + mnth + "-" + date_ob.getFullYear()];

}

//Exports
module.exports = router;