var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scriptSchema = new Schema({
    name: String,
    scriptBody: String
});

var Script = mongoose.model('Script', scriptSchema);

module.exports = Script;