var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var alertSchema = new Schema({
    name: String,
    machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
    alertPolicyId: String,
    priority: String,
    priorityNumber: String,
    status: String
}, {timestamps: true} );

var Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;