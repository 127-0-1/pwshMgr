var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var alertPolicySchema = new Schema({
    name: String,
    type: String,
    machineId: { type: Schema.Types.ObjectId, ref: 'Machine' },
    threshold: String,
    item: String,
    priority: String,
    integrations: Array
});

var AlertPolicy = mongoose.model('AlertPolicy', alertPolicySchema);

module.exports = AlertPolicy;