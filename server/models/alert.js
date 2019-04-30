var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Machine = Machine = require('../models/machine');

var alertSchema = new Schema({
    name: String,
    machineId: { type: Schema.Types.ObjectId, ref: 'Machine' },
    alertPolicyId: String,
    priority: String,
}, {timestamps: true} );

var Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;