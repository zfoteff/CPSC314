var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const userDocumentsSchema = Schema({
    uid: {type: String, required: true},
    sections: [{
        name: String,
        subsections: [{name: String}]
    }],
    documents: [{
        name: String,
        section: String,
        color: String,
        text: String
    }]
})

var UserDocs = mongoose.model('Documents', userDocumentsSchema);
module.exports = UserDocs;