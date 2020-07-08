var express = require('express');
var router = express.Router();
var config = require('../config/database');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;
var isEditor = auth.isEditor;
const fileUpload = require('express-fileupload')
router.use(fileUpload());


const News = require('../models/news.js');
const authorize_users = require('../models/authorize_users.js');
router.get('/', isAdmin, function (req, res) {
//	var loggedIn = req.isAuthenticated() ? true : false;
	var sql = "SELECT  news.id, news.news_title, news_categories.title, media_table.media_data,media_table.media_name, authorize_users.username FROM (((news JOIN news_categories ON news.news_categories_id =news_categories.id)LEFT JOIN media_table ON news.id=media_table.news_id) JOIN authorize_users ON news.authorize_users_id=authorize_users.id)ORDER BY id DESC";
	config.query(sql, function (err, result) {
		if (err) throw err;

		res.render('admin/news', {
			news: result,
			Title: 'AdminArea All News',
			username: req.user[0].username,
			user_category:req.user[0].user_category
		});
	});

});

router.get('/xyz',function(req,res){
	res.render('admin/new_layout');
})

router.get('/facebook', function(req,res){
	// var cookie = require('cookie-parser');  

	// res.cookie('myFirstCookie','looks good');
	// res.clearCookie('myFirstCookie');
	// console.log(req.cookies);

 res.render('socialauth/index');
});


router.get('/dashboard', isAdmin, function (req, res) {
	var sql = "SELECT * from authorize_users WHERE 	validation_status='yes'";
	config.query(sql, function (err, valid_users) {
		if (err) throw err;

		var sql = "SELECT * from authorize_users WHERE 	validation_status='no'";
		config.query(sql, function (err, not_valid_users) {
			if (err) throw err;

			var sql = "SELECT * from news_categories ";
			config.query(sql, function (err, categories) {
				if (err) throw err;

				var sql = "SELECT * from news ";
				config.query(sql, function (err, news) {
					if (err) throw err;

					res.render('admin/dashboard', {
						Title: 'AdminArea All News',
						valid_users: valid_users.length,
						not_valid_users: not_valid_users.length,
						categories: categories.length,
						news: news.length,
						username: req.user[0].username,
						user_category:req.user[0].user_category
					});
				});
			});
		});
	});
});
router.get('/add_news', isAdmin, function (req, res) {
	var sql = "SELECT * FROM news_categories";
	config.query(sql, function (err, result) {
		if (err) throw err;

		res.render('admin/add_news', {
			headline: '',
			subheadline: '',
			description: '',
			categories: result,
			media: '',
			Title: 'AdminArea All News',
			username: req.user[0].username,
			user_category:req.user[0].user_category
		});
	});
});

router.post('/upload', isAdmin, function (req, res) {
	req.checkBody('headline', 'headline Must have a value.').notEmpty();
	req.checkBody('subheadline', 'Subheadline Must have a value.').notEmpty();

	req.checkBody('categories', 'categories Must have a value.').notEmpty();

	req.checkBody('description', 'description Must have a value.').notEmpty();
	var headline = req.body.headline;
	var subheadline = req.body.subheadline;
	var categories = req.body.categories;
	var authorize_users_id = req.user[0].id;
	var description = req.body.description;

	if (req.files == null) {
		req.checkBody('files', 'files must uploaded need.').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			console.log("error file is not uploaded");
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				res.render('admin/add_news', {
					errors: errors,
					headline: headline,
					subheadline: subheadline,
					categories: result,
					authorize_users_id: authorize_users_id,
					description: description,
					Title: 'AdminArea Add News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			});
		}
	} else {

		var images = req.files.myFiles;
		for (var i = 0; i < images.length; i++) {
			req.checkBody('files', 'files must uploaded anImage.').isImage(images[i].mimetype);
		}
		var errors = req.validationErrors();
		if (errors) {
			console.log("error another extensions");
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				res.render('admin/add_news', {
					errors: errors,
					headline: headline,
					subheadline: subheadline,
					categories: result,
					authorize_users_id: authorize_users_id,
					description: description,
					Title: 'AdminArea Add News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			});
		} else {
		 
			News.insert(headline, subheadline, description, categories, authorize_users_id);
			saveMediaFiles(description, req.files.myFiles);

			req.flash('success', 'Successfuly News  Added!');
			res.redirect('/admin_news');
		}
	}

});
function saveMediaFiles(des, Files) {

	var a = des;
	var b = Files;
	if (Files.length != undefined) {

		for (var i = 0; i < b.length; i++) {



			// read binary data
			var bitmap = b[i].data;
			//	console.log(bitmap);
			//encode in base64
			var base64str = base64_encode(bitmap);
			News.media_insert(a, b[i].name, b[i].mimetype, b[i].size, base64str);
		}
	} else {
		// read binary data
		var bitmap = b.data;
		//	console.log(bitmap);
		//encode in base64
		var base64str = base64_encode(bitmap);
		News.media_insert(a, b.name, b.mimetype, b.size, base64str);
	}

}


// function to encode file data to base64 encoded string
function base64_encode(file) {
	// convert binary data to base64 encoded string
	return new Buffer.from(file).toString('base64');
}

router.get('/edit_news/:id', isAdmin, function (req, res) {
	var ids = req.params.id;
	var sql_select = "SELECT  n.id, n.news_title, n.sub_title,n.description, c.title, m.media_data,m.media_name,m.media_id,u.username  FROM (((news AS n JOIN news_categories AS c ON n.news_categories_id =c.id)LEFT JOIN media_table AS m ON n.id=m.news_id) JOIN authorize_users AS u ON n.authorize_users_id=u.id) WHERE n.id='" + ids + "'";
	//var sql_select = "SELECT * FROM news	WHERE id='" + ids + "'";
	config.query(sql_select, function (err, resulted_data) {
		if (err) throw err;
		var sql_categories = "SELECT * FROM news_categories";
		config.query(sql_categories, function (err, resulted_cat) {
			if (err) throw err;
		
			if (resulted_data[0].media_data == null) {
			
				res.render('admin/edit_news', {
					id: resulted_data[0].id,
					title: resulted_data[0].news_title,
					subtitle: resulted_data[0].sub_title,
					description: resulted_data[0].description,
					categories: resulted_data[0].title,
					all_categories: resulted_cat,
					authorize_users_id: resulted_data[0].username,
					icon: '',
					Title: 'AdminArea Edit News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			} else {
				res.render('admin/edit_news', {
					id: resulted_data[0].id,
					title: resulted_data[0].news_title,
					subtitle: resulted_data[0].sub_title,
					description: resulted_data[0].description,
					categories: resulted_data[0].title,
					all_categories: resulted_cat,
					authorize_users_id: resulted_data[0].username,
					icon: resulted_data,
					Title: 'AdminArea Edit News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			}
		});
	});
});

router.get('/delete_news/:id', isAdmin, function (req, res) {
	var ids = req.params.id;
	var sql_delete = "DELETE news.*,media_table.* FROM media_table LEFT JOIN news ON media_table.news_id= news.id WHERE media_table.news_id='" + ids + "'";
	config.query(sql_delete, function (err, result) {
		if (err) throw err;
		if (result.affectedRows == 0) {
			var sql_delete = "DELETE news.* FROM news WHERE news.id='" + ids + "'";
			config.query(sql_delete, function (err, result) {
				if (err) throw err;
			});
		}
		console.log("record deleted");
	});

	req.flash('success', 'Successfuly News Deleted');
	res.redirect('/admin_news');

});

router.get('/delete_single_icon/:media_id/:id', isAdmin, function (req, res) {

	var media_id = req.params.media_id;
	var news_id = req.params.id;

	var sql_delete_icon = "DELETE FROM media_table WHERE media_id='" + media_id + "'";
	config.query(sql_delete_icon, function (err, resulted) {
		if (err) throw err;
		//console.log(resulted);
	});
	
	var sql_select = "SELECT  news.id, news.news_title, news.sub_title,news.description, news_categories.title, media_table.media_data,media_table.media_name,media_table.media_id,authorize_users.username  FROM (((news JOIN news_categories ON news.news_categories_id =news_categories.id)LEFT JOIN media_table ON news.id=media_table.news_id) JOIN authorize_users ON news.authorize_users_id=authorize_users.id) WHERE news.id='" + news_id + "'";

	config.query(sql_select, function (err, resulted_data) {
		if (err) throw err;
		var sql_categories = "SELECT * FROM news_categories";
		config.query(sql_categories, function (err, resulted_cat) {
			if (err) throw err;
			
			if (resulted_data[0].media_data == null) {
			
				res.render('admin/edit_news', {
					id: resulted_data[0].id,
					title: resulted_data[0].news_title,
					subtitle: resulted_data[0].sub_title,
					description: resulted_data[0].description,
					categories: resulted_data[0].title,
					all_categories: resulted_cat,
					authorize_users_id: resulted_data[0].username,
					icon: '',
					Title: 'AdminArea Edit News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			} else {
				res.render('admin/edit_news', {
					id: resulted_data[0].id,
					title: resulted_data[0].news_title,
					subtitle: resulted_data[0].sub_title,
					description: resulted_data[0].description,
					categories: resulted_data[0].title,
					all_categories: resulted_cat,
					authorize_users_id: resulted_data[0].username,
					icon: resulted_data,
					Title: 'AdminArea Edit News', username: req.user[0].username,
					user_category:req.user[0].user_category

				});
			}
		});
	});

});
router.post('/update/:id', isAdmin, function (req, res) {
	var ids = req.params.id;
	var headline = req.body.headline;
	var subheadline = req.body.subheadline;
	var categories = req.body.categories;
	var authorize_users_name = req.body.user_name;
	var description = req.body.description;
	req.checkBody('headline', 'headline Must have a value.').notEmpty();
	req.checkBody('subheadline', 'Subheadline Must have a value.').notEmpty();

	req.checkBody('categories', 'categories Must have a value.').notEmpty();
	req.checkBody('user_name', 'autherize_user Must have a value.').notEmpty();

	req.checkBody('description', 'description Must have a value.').notEmpty();


	if (req.files == null) {
		//req.checkBody('files', 'files must uploaded need.').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			console.log("error file is not uploaded");
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				res.render('admin/add_news', {
					errors: errors,
					headline: headline,
					subheadline: subheadline,
					categories: result,
					authorize_users_id: authorize_users_name,
					description: description,
					Title: 'AdminArea Add News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			});
		} else {
			var sql = "SELECT id FROM authorize_users WHERE username='" + authorize_users_name + "'";
			config.query(sql, function (err, result_id) {
				if (err) throw err;
				var authorize_users_id = result_id[0].id;
				News.update_query(ids, headline, subheadline, description, categories, authorize_users_id);
			});
		}
		res.redirect('/admin_news');
	} else {

		var images = req.files.myFiles;
		for (var i = 0; i < images.length; i++) {
			req.checkBody('files', 'files must uploaded anImage.').isImage(images[i].mimetype);
		}
		var errors = req.validationErrors();
		if (errors) {
			console.log("error another extensions");
			var sql = "SELECT * FROM news_categories";
			config.query(sql, function (err, result) {
				if (err) throw err;
				res.render('admin/add_news', {
					errors: errors,
					headline: headline,
					subheadline: subheadline,
					categories: result,
					authorize_users_id: authorize_users_name,
					description: description,
					Title: 'AdminArea Add News',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			});
		} else {
			var sql = "SELECT id FROM authorize_users WHERE username='" + authorize_users_name + "'";
			config.query(sql, function (err, result_id) {
				if (err) throw err;
				var authorize_users_id = result_id[0].id;
				News.update_query(ids, headline, subheadline, description, categories, authorize_users_id);
				saveMediaFiles(description, req.files.myFiles);

				req.flash('success', 'Successfuly News  Edited!');
				res.redirect('/admin_news');
			});
		}
	}

});
router.post('/profile_edit/:id', function (req, res) {
	var id = req.params.id;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var phone_number = req.body.phone_number;
	var user_category = req.body.user_category;
	var address = req.body.address;
	var v_code = req.body.v_code;
	req.checkBody('username', 'Username Must have a requird.').notEmpty();
	req.checkBody('email', 'email Must have a required.').isEmail();
	req.checkBody('password', 'password Must have a required.').notEmpty();
	req.checkBody('phone_number', 'Phone number Must have a required.').notEmpty();
	req.checkBody('address', 'address Must have a required.').notEmpty();
	req.checkBody('v_code', 'validation code Must have a required.').notEmpty();

	if (!req.files || Object.keys(req.files).length === 0) {//file not uploaded from form.
		var errors = req.validationErrors();
		if (errors) {//check validation errors with out files
			if (req.user[0].user_category == 'admin') {
				res.render('admin/profiles_edit', {
					id: id,
					Username: username,
					email: email,
					password: password,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					// 'data:image/jpeg/png;base64,' + result[0].profile_picture,
					v_code: v_code,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			} else if (req.user[0].user_category == 'Editor') {
				res.render('editor/profiles_edit', {
					id: id,
					Username: username,
					email: email,
					password: password,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					// 'data:image/jpeg/png;base64,' + result[0].profile_picture,
					v_code: v_code,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			}
		} else {//no errors without files
			var sql = "SELECT profile_picture FROM authorize_users WHERE id='" + id + "'";
			config.query(sql, function (err, result) {//search old file is exist 
				if (err) throw err;
				if (result[0].profile_picture.toString() != "") {// old file is exist
					authorize_users.update_query(username, email, password, phone_number, user_category, address, v_code, id);
					req.flash('success', 'User Recode Updated!');
					req.flash('danger', 'Please login again!');
					res.redirect('/users/login');
				} else {// old file is not exist
					req.checkBody('files', 'profile picture must uploaded need.').notEmpty();
					var errors = req.validationErrors();

					if (errors) {//check validation errors with out files
						if (req.user[0].user_category == 'admin') {
							res.render('admin/profiles_edit', {
								id: id,
								Username: username,
								email: email,
								password: password,
								phone_number: phone_number,
								user_category: user_category,
								address: address,
								p_picture: '',
								// 'data:image/jpeg/png;base64,' + result[0].profile_picture,
								v_code: v_code,
								Title: 'user profiles',
								username: req.user[0].username,
								user_category:req.user[0].user_category
							});
						} else if (req.user[0].user_category == 'Editor') {
							res.render('editor/profiles_edit', {
								id: id,
								Username: username,
								email: email,
								password: password,
								phone_number: phone_number,
								user_category: user_category,
								address: address,
								p_picture: '',
								// 'data:image/jpeg/png;base64,' + result[0].profile_picture,
								v_code: v_code,
								Title: 'user profiles',
								username: req.user[0].username,
								user_category:req.user[0].user_category
							});
						}
					}
				}
			});
		}

	} else {
		var image = req.files.p_picture;
		req.checkBody('files', 'Profile picture must uploaded anImage.').isImage(image.mimetype);
		var errors = req.validationErrors();
		if (errors) {
			console.log("error another extensions");
			if (req.user[0].user_categor == 'admin') {
				res.render('admin/profiles_edit', {
					id: id,
					Username: username,
					email: email,
					password: password,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					v_code: v_code,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			} else if (req.user[0].user_category == 'Editor') {
				res.render('editor/profiles_edit', {
					id: id,
					Username: username,
					email: email,
					password: password,
					phone_number: phone_number,
					user_category: user_category,
					address: address,
					p_picture: '',
					v_code: v_code,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category
				});
			}
		} else {
			// read binary data
			var bitmap = image.data;

			// function to encode file data to base64 encoded string
			function base64_encode(file) {
				// convert binary data to base64 encoded string
				return new Buffer.from(file).toString('base64');
			}
			var base64str = base64_encode(bitmap);

			authorize_users.update_query_with_file(username, email, password, phone_number, user_category, address, v_code, id, base64str);
			req.flash('success', 'User Recode Updated!');
			req.flash('danger', 'Please login again!');
			res.redirect('/users/login');

		}

	}
});


router.get('/profile/:name', function (req, res) {
	var name = req.params.name;
	
	var sql = "SELECT * FROM authorize_users WHERE username='" + name + "'";
	config.query(sql, function (err, result) {
		if (err) throw err;
		var ids = result[0].id;
		var sql_select = "SELECT * FROM news WHERE 	authorize_users_id='" + ids + "'";
		config.query(sql_select, function (err, resulted_data) {
			if (err) throw err;

			if (req.user[0].user_category == 'admin') {
				res.render('admin/profiles', {
					id: ids,
					Username: result[0].username,
					email: result[0].email,
					password: result[0].password,
					phone_number: result[0].phone_number,
					user_category: result[0].user_category,
					address: result[0].address,
					p_picture: 'data:image/jpeg/png;base64,' + result[0].profile_picture,
					v_code: result[0].validation_code,
					v_status: result[0].validation_status,
					register_date: result[0].register_date.toDateString(),
					login_date: convert(result[0].login_date),
					total_posts: resulted_data.length,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category

				});

			} else if (req.user[0].user_category == 'Editor') {
				res.render('editor/profiles', {
					id: ids,
					Username: result[0].username,
					email: result[0].email,
					password: result[0].password,
					phone_number: result[0].phone_number,
					user_category: result[0].user_category,
					address: result[0].address,
					p_picture: 'data:image/jpeg/png;base64,' + result[0].profile_picture,
					v_code: result[0].validation_code,
					v_status: result[0].validation_status,
					register_date: result[0].register_date.toDateString(),
					login_date: convert(result[0].login_date),
					total_posts: resulted_data.length,
					Title: 'user profiles',
					username: req.user[0].username,
					user_category:req.user[0].user_category

				});
			}



		});
	});

});
router.get('/my_account_edit/:id', function (req, res) {
	var id = req.params.id;
	var sql = "SELECT * FROM authorize_users WHERE id='" + id + "'";
	config.query(sql, function (err, result) {
		if (err) throw err;
		if (req.user[0].user_category == 'admin') {
			res.render('admin/profiles_edit', {
				id: result[0].id,
				Username: result[0].username,
				email: result[0].email,
				password: result[0].password,
				phone_number: result[0].phone_number,
				user_category: result[0].user_category,
				address: result[0].address,
				p_picture: 'data:image/jpeg/png;base64,' + result[0].profile_picture,
				v_code: result[0].validation_code,
				Title: 'user profiles',
				news_categories: result,
				username: req.user[0].username,
				user_category:req.user[0].user_category
			});
		} else if (req.user[0].user_category == 'Editor') {
			res.render('editor/profiles_edit', {
				id: result[0].id,
				Username: result[0].username,
				email: result[0].email,
				password: result[0].password,
				phone_number: result[0].phone_number,
				user_category: result[0].user_category,
				address: result[0].address,
				p_picture: 'data:image/jpeg/png;base64,' + result[0].profile_picture,
				v_code: result[0].validation_code,
				Title: 'user profiles',
				username: req.user[0].username,
				user_category:req.user[0].user_category
			});
		}
	});
});

router.get('/profile/Change_Password/:name', function (req, res) {
	var username = req.params.name;
	var sql = "SELECT id FROM authorize_users WHERE username='" + username + "'";
	config.query(sql, function (err, result) {
		if (err) throw err;
		res.redirect('/admin_news/my_account_edit/' + result[0].id);
	});
});
function convert(str) {
	var date_ob = new Date(str),

		day = ("0" + date_ob.getDate()).slice(-2),

		// current month
		month = ("0" + (date_ob.getMonth() + 1)).slice(-2),

		// current year
		year = date_ob.getFullYear(),

		// current hours
		hours = date_ob.getHours(),

		// current minutes
		minutes = date_ob.getMinutes(),

		// current seconds
		seconds = date_ob.getSeconds();


	// prints date & time in YYYY-MM-DD HH:MM:SS format
	return [day + "-" + month + "-" + year + " | " + hours + ":" + minutes + ":" + seconds];
}

//Exports
module.exports = router;