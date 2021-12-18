//these should probably be pulled from a configuration file or environment variable
const url = "mongodb://localhost:27017/";
const DB_NAME = "mydb";
const PORT = 8080;

const express = require("express");
const app = express();

//used for encryption (salting and hashing our passwords)
const bcrypt = require("bcrypt");

//This should be in a /models/user.js file
var mongoose = require('mongoose');

//Included to remove Mongoose depreciation warning
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//User schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    //https://stackoverflow.com/questions/6832445/how-can-bcrypt-have-built-in-salts
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

//Method to authenticate input against database
UserSchema.statics.authenticate = function (userData, req, res) {
    User.findOne({
            username: userData.username
        })
        .exec(function (err, user) {
            if (err) {
                return res.render("error.ejs", {
                    errors: 2
                });
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                //error
                return res.render("error.ejs", {
                    errors: 2
                });
            }
            //if we get here, we did not hit an error...
            bcrypt.compare(userData.password, user.password, function (err, result) {
                if (result === true) { //password hashes match
                    //set up session cookie
                    req.session.userId = user._id;
                    return res.render("form.ejs");
                } else {
                    return res.redirect("/login");
                }
            })
        });
}

var User = mongoose.model('User', UserSchema);
module.exports = User;

//session configuration
const session = require('express-session');
//use sessions for tracking logins
app.use(session({
    secret: "This is a secret string that should be stored in an environment variable!",
    resave: true,
    saveUninitialized: false
}));

//additional additions for mongoose connection to users db
mongoose.connect(url + "users", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const mongooseDB = mongoose.connection;
mongooseDB.on("error", console.error.bind(console, "Mongoose DB Connection error: "));

//end new additions part 1

const sanitize = require("mongo-sanitize");
const Validator = require("validatorjs");

//Data validation
var rules = {
    first: "required",
    last: "required",
    check1: "boolean",
    rating: "integer|between:0,4",
    agree: "required"

};

const bodyParser = require("body-parser"); //required for user authentication of post data

const MongoClient = require("mongodb").MongoClient;
//added for UPDATE in our CRUD operation
var ObjectId = require("mongodb").ObjectID;

const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.connect(err => {
    db = client.db(DB_NAME).collection("surveyRespondents");
});

app.use(bodyParser.urlencoded({
    extended: true
}));

//we want to use embedded javascript "template" files, like we did with Pug
app.set("view engine", "ejs");

app.listen(PORT, function () {
    console.log("Server listening on port " + PORT);
});

//root URL
app.get("/", (req, res) => {
    //check if there is a session
    if (req.session.userId) {
        //authenticate        
        validateSession(req.session.userId, res);
        res.redirect("/show");
    } else {
        return res.redirect("/login");
    }
});

//Now we want to implement our CRUD methods

//Create
app.post("/show", (req, res) => {
    console.log(req.body);
    //we can parse this object or we can submit it directly
    //to our database if it conforms to the schema
    //note that this is not saving our check1 as it is not checked!
    //we would want to handle this to add to the database

    db.insertOne(req.body, (err, result) => {
        if (err) return console.log("Error: " + err);
        console.log("We saved one record into the database!");
        res.redirect("/show");
    });
});

//READ
app.get("/show", (req, res) => {
    //require authenticated user to see this page
    //check if there is a session
    if (req.session.userId) {
        //authenticate        
        validateSession(req.session.userId, res);
        //if invalid we will be redirected, otherwise we'll hit this block
        db.find().toArray((err, results) => {
            if (err) return console.log("Error: " + err);
            res.render("show.ejs", {
                surveyRespondents: results
            });
        });
    } else { //no session data, log in first
        return res.redirect("/login");
    }
});

//TODO: put edit behind authenticated users
//UPDATE
app.route("/edit/:id")
    .get((req, res) => {
        let id = req.params.id;

        db.find(ObjectId(id)).toArray((err, result) => {
            if (err) return console.log("Error: " + err);

            if (result == null || result.length == 0) { //added just in case we get no results
                res.render("error.ejs", {
                    errors: 1
                });
            } else {
                res.render("edit.ejs", {
                    surveyRespondents: result
                });
            }
        });
    })
    .post((req, res) => {
        //DATA VALIDATION        
        let id = req.body.id; //need to grab the parameter for our id

        //creating an object we can validate --recall we created our rule at the top of this file
        let data = {
            first: req.body.first,
            last: req.body.last,
            check1: req.body.check1 == "" ? 0 : req.body.check1,
            rating: req.body.rating,
            agree: req.body.agree
        };

        //validating
        let validation = new Validator(data, rules /*, optionally we could pass in custom error messages*/ );

        console.log("Validation Passes: " + validation.passes() + " Validation Fails: " + validation.fails());

        //Make a decision
        if (validation.fails()) {
            let errorsList = {
                first: validation.errors.first("first"),
                last: validation.errors.first("last"),
                check1: validation.errors.first("check1"),
                rating: validation.errors.first("rating"),
                agree: validation.errors.first("agree")
            };

            //redirect to an error page and pass our error messages
            //ideally we would provide error feedback in the same
            //page that we accepted the data
            res.render("error.ejs", {
                errors: errorsList
            });
        } else {
            db.updateOne({
                _id: ObjectId(id)
            }, {
                $set: {
                    first: data.first,
                    last: data.last,
                    check1: data.check1,
                    rating: data.rating,
                    agree: data.agree
                }
            }, (err, results) => {
                console.log("Number: " + results.result.n + " Number Modified: " + results.result.nModified + " Update Status: " + results.result.ok);
                if (err) return res.send(err);
                res.redirect("/show");
                console.log("Successfully Updated!");
            })
        }
    });

//TODO: put delete behind authenticated users
//DELETE
app.route("/delete/:id")
    .get((req, res) => {
        let id = req.params.id;

        //just to let us see what we are about to delete
        let query = {
            _id: ObjectId(id)
        };
        db.find(query).toArray(function (err, result) {
            if (err) throw err;
            console.log("Deleted from the database: " + JSON.stringify(result));
        });

        db.deleteOne({
            _id: ObjectId(id)
        }, (err, result) => {
            if (err) return res.send(500, err);
            console.log("Entry removed from the database!");
            res.redirect("/show");
        });
    });

//POST route for creating a user
app.route("/register")
    .get((req, res) => {
        let errors = {
            usernameError: ""
        }
        res.render("register.ejs", errors);
    })
    .post((req, res) => {
        if (req.body.username &&
            req.body.password &&
            req.body.passwordConf) {
            var userData = {
                username: req.body.username,
                password: req.body.password,
            }

            //use schema.create to insert data into the db
            User.create(userData, function (err, user) {
                if (err) {
                    //return next(err)
                    let errors = {
                        usernameError: "Invalid username"
                    }
                    res.render("register.ejs", errors);
                } else {
                    return res.redirect("/show");
                }
            });
        }
    });

app.route("/login")
    .get((req, res) => {
        let errors = {
            usernameError: ""
        }
        res.render("login.ejs", errors);
    })
    .post((req, res) => {
        if (req.body.username &&
            req.body.password) {
            var userData = {
                username: req.body.username,
                password: req.body.password,
            }
            let temp = User.authenticate(userData, req, res);
            let temp2 = 0;
        }
    });

function validateSession(_id, res) {
    if (_id != "") {
        //authenticate
        User.findOne({
            _id: _id
        }).exec(function (err, user) {
            if (err) {
                return res.render("error.ejs", {
                    errors: 2
                });
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                //error
                return res.render("error.ejs", {
                    errors: 2
                });
            }
            //if authenticated give access to show all
            return; // res.redirect("/show");
        });

    } else {
        //redirect to log in
        return res.redirect("/login");
    }
};

app.get("/survey", (req, res) => {
    return res.render("form.ejs");
});

// GET /logout
app.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

app.use('/static', express.static('static'))

app.get("/index.html", function (req, res) {
    res.redirect("/index.html");
});