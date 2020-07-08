var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
expressValidator = require('express-validator');
var flash = require('connect-flash');
var con = require('./config/database');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');  

//mysql connection
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});




//Init app
var app = express();



//View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


//Set public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Set Global errors variable 
app.locals.errors = null;


//Body Parser middelware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());





//express validater middelware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }, customValidators: {
        isImage: function (value, Extension) {
            var extension = (Extension).toLowerCase();
            switch (extension) {
                case 'image/jpg':
                    return 'jpg';
                case 'image/jpeg':
                    return 'jpeg';
                case 'image/png':
                    return 'png';
                case 'image/PNG':
                    return 'PNG';
                default:
                    return false;
            }
        }
    }
}));


//express messages middelware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.set('trust proxy', 1)
app.use(session({
    secret: 'max',
    resave: true,
    saveUninitialized: true,
     cookie: { secure: false }
}));

app.use(cookieParser()); 
app.get('*', function (req, res, next) {
    res.locals.user = req.session.user || null;
    next();
});

//passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());



//Set routes
var admin_categories = require('./routes/admin_categories.js');
app.use('/admin_categories', admin_categories);

var news = require('./routes/admin_news.js');
app.use('/admin_news', news);

var editor = require('./routes/editor_news.js');
app.use('/editor_news', editor);

var users = require('./routes/users.js');
app.use('/users', users);


var frentEnd = require('./routes/index.js');
app.use('/', frentEnd);



//Start the server
var port = 3000 || process.env.PORT;
app.listen(port, function () {
    console.log('Servar started on port ' + port);
});
