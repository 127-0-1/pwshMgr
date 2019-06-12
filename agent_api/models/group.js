var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
    name: String,
    machines: [{ type: Schema.Types.ObjectId, ref: 'Machine' }]
});

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;