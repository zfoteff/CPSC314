const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    uid: {type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', function (next) {
    var user = this;
    console.log('save '+user.password);
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err)
            return next(err);
        user.password = hash;
        next();
    })
})

userSchema.statics.authenticate = function (userData, req, res, next) {
    User.findOne({
        uid: userData.uid
    }).exec(function(err, user) {
            if (err) return next(err);
            if (user != null) {
                bcrypt.compare(userData.password, user.password, function (err, result) {
                    if (result === true) {
                        //  Password found --> redirect to home
                        req.session.uid = user._id;
                        req.session.username = user.uid;
                        return res.redirect('/home');
                    } else
                        return res.redirect('/login');
                });
            } else
                return res.redirect('/login');
        });
}

var User = mongoose.model('User', userSchema);
module.exports = User;