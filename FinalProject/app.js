require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var util = require('util');
var fs = require('fs');
var Grid = require('gridfs-stream');
var mongoose = require('mongoose');
var User = require("./models/user");
var UserDocs = require("./models/userDocuments");
var CryptoJS = require('crypto-js');
var CryptoAES = require('crypto-js/aes');

//  Database connection
var conn;
var usr = process.env.DB_USER;
var pss = process.env.DB_PASS
var cluster = process.env.DB_CLUSTER;
var collection = process.env.DB_COLLECTION;
var config = process.env.DB_CONFIG;
const uri = "mongodb+srv://" + usr + ":" + pss + "@" + cluster + "/" + collection + "?" + config;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var conn = mongoose.connection;

//  Mongoose connection listeners
conn.on('connected', () => {
    console.log('Database connected successfully');
    var gfs = Grid(conn, conn.db);
})
conn.on('disconnected', () => {
    console.log("Database disconnected successfully")
})
conn.on('error', console.error.bind(console, 'Connection error'));

var app = express();

//  Session config
var session = require('express-session');
const { ObjectId } = require('bson');
const { readFile } = require('fs');
app.use(session({
    secret: process.env.USER_SECRET,
    resave: true,
    saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//  Additional config
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function validateSession(uid, res) {
    if (uid != "") {
        User.findOne({
            _id: uid
        }).exec(function(err, user) {
            if (err) return res.send(err);
        });
    } else
    //redirect to log in
        return res.redirect("/login");
}

/* GET home page. */
app.route('/')
    .get(function(req, res, next) {
        res.redirect('/login');
    });

app.route('/home')
    .get(function(req, res, next) {
        if (req.session.uid) {
            validateSession(req.session.uid, res);
            res.render('home', { uid: req.session.uid, username: req.session.username });
        } else
            res.render('login');
    })

app.route('/home/getUserDocs')
    .get(function(req, res, next) {
        if (req.session.uid) {
            UserDocs.findOne({
                uid: req.session.uid
            }).exec(function(err, userDocs) {
                if (err) return res.render('error')
                if (userDocs != null) {
                    result = {
                        sections: userDocs.sections,
                        documents: userDocs.documents
                    };
                    res.send(result);
                }
            });
        } else
            res.send({ result: 'none' });
    })

app.route('/home/createSection/:sectionName')
    .post(async function(req, res, next) {
        if (req.params.sectionName && req.session.uid) {
            let data = {
                name: req.params.sectionName,
                subsections: []
            }

            //  Find docs associated with session uid
            UserDocs.findOne({ uid: req.session.uid },
                function(error, result) {
                    if (error) return next(error);
                    else {
                        //  Save the resulting document collection id
                        UserDocs.updateOne({ _id: result._id }, { "$push": { "sections": data } },
                            function(error, finalResult) {
                                if (error) return next(error);
                                else {
                                    console.log("result: " + JSON.stringify(finalResult));
                                    res.json(finalResult);
                                }
                            })
                    }
                }
            );
        }
    })

app.route('/home/createSubsection/:parentSection/:subsectionName')
    .post(async function(req, res, next) {
        if (req.params.parentSection && req.params.subsectionName) {
            var parentSection = req.params.parentSection;
            var subsectionName = req.params.subsectionName;
            UserDocs.findOne({ uid: req.session.uid }, function(error, result) {
                if (error) return next(error);
                else {
                    UserDocs.updateOne({ _id: result._id }, { "$push": { "sections.$[x1].subsections": { name: subsectionName } } }, { arrayFilters: [{ "x1.name": parentSection }] },
                        function(error, finalResult) {
                            if (error) return next(error);
                            else {
                                console.log("result: " + JSON.stringify(finalResult));
                                res.json(finalResult);
                            }
                        }
                    );
                }
            })
        }
    })

app.route('/home/uploadDocument')
    .post(async function(req, res, next) {
        var file_data = fs.readFileSync(req.body.file_path);
        var encodedFileData = file_data.toString('base64');
        var file = {
            data: new Buffer.from(encodedFileData, 'base64'),
            contentType: "application/pdf"
        };

        var data = {
            name: req.body.name,
            section: req.body.section,
            color: "Yellow",
            file: file
        };

        if (req.session.uid) {
            UserDocs.findOne({ uid: req.session.uid }, function(error, result) {
                if (error) return next(error);
                else {
                    console.log("Creating new document " + data.name + " in section " + data.section);
                    UserDocs.updateOne({ _id: result._id }, { "$pull": { "documents": docName } },
                        function(err, result) {
                            if (err) return next(err);
                            else {
                                console.log("result: " + JSON.stringify(result));
                                res.json({ result: "success", data: data });
                            }
                        }
                    )
                }
            });
        }
    })

app.route('/home/createDoc')
    .post(function(req, res, next) {
        var docName = req.body.filename;
        var section = req.body.section;
        var text = req.body.text;

        if (docName != "" && section != "" && text != "" && req.session.uid) {
            var ciphertext = CryptoAES.encrypt(text, req.session.uid).toString();
            var data = {
                "name": docName,
                "section": section,
                "color": "white",
                "text": ciphertext
            };

            console.log(JSON.stringify(data));

            UserDocs.findOne({ uid: req.session.uid },
                function(error, result) {
                    console.log(result)
                    if (error) return next(error);
                    else {
                        console.log("Creating new text doc " + data.name + " in section " + data.section);
                        UserDocs.updateOne({ _id: result._id }, { "$push": { "documents": data } },
                            function(err, finalResult) {
                                if (err) console.log(err);
                                else {
                                    console.log("result: " + JSON.stringify(data));
                                    res.json({ result: "success", data: data });
                                }
                            }
                        )
                    }
                });
        }
    })

app.route('/home/removeDoc')
    .post(function(req, res, next) {
        var docname = req.body.docname
        if (docname != null || docname != "") {
            User.updateOne({ _id: req.session.uid }, { "$pull": { "documents": { name: docname } } },
                function(err, result) {
                    if (err) next(err);
                    else {
                        console.log("result: " + JSON.stringify(result));
                    }
                }
            )
        }
    })

app.route('/home/getDoc/:docname')
    .get(function(req, res, next) {
        if (req.session.uid) {
            var docName = req.params.docname;

            UserDocs.findOne({
                    "uid": req.session.uid,
                    "documents.name": docName
                })
                .exec(function(err, userDocs) {
                    if (err) console.log(err)
                    var obj = userDocs.documents;
                    console.log("Ciphertext: " + obj[0].text)
                    var bytes = CryptoAES.decrypt(obj[0].text, req.session.uid);
                    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    console.log("Plaintext: " + plaintext)
                    res.send({ plaintext });
                })
        } else {
            res.send({ "failed": "No result" });
        }
    })

//  Login api calls
app.route('/login')
    .get(async function(req, res, next) {
        if (req.session) {
            req.session.destroy(function(err) {
                if (err) return next(err);
            });
        }

        res.render('login');
    })
    .post(async function(req, res, next) {
        if (req.body.uid && req.body.password) {
            var userData = {
                uid: req.body.uid,
                password: req.body.password
            }

            User.authenticate(userData, req, res);
        }
    })

app.route('/register')
    .get(async function(req, res) {
        res.render('register');
    })
    .post(async function(req, res) {
        if (req.body.uid && req.body.password) {
            var newUser = new User({
                uid: req.body.uid,
                password: req.body.password
            });

            console.log(newUser);

            var newDocs = new UserDocs({
                uid: newUser._id,
                sections: [],
                documents: []
            });

            User.create(newUser, function(err) {
                if (err)
                    res.render('error');
            });

            UserDocs.create(newDocs, function(err) {
                if (err)
                    res.render('error');
            });

            req.session.uid = newUser._id;
            req.session.username = newUser.uid;
            return res.redirect('/home');
        } else {
            return res.redirect('/register');
        }
    })

//  About API calls
app.route('/about')
    .get(function(req, res, next) {
        res.render('about');
    });

app.route('/settings')
    .get(function(req, res, next) {
        res.render('settings');
    });

app.route('/settings/changeUsername')
    .post(function(req, res, next) {
        if (req.body.newUsername) {
            User.updateOne({ _id: req.session.uid }, { uid: req.body.newUsername },
                function(err, result) {
                    if (err) next(err);
                    res.redirect('/login');
                }
            )
        }
    })

app.route('/settings/changePassword')
    .post(function(req, res, next) {
        if (req.body.newPass) {
            User.updateOne({ _id: req.session.uid }, { password: req.body.newPass },
                function(err, result) {
                    if (err) next(err);
                    console.log(req.body.newPass);
                    res.redirect('/login');
                }
            )
        }
    })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;