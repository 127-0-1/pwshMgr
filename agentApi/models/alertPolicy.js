var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var alertPolicySchema = new Schema({
    name: String,
    type: String,
    assignmentType: {
        type: String,
        required: true,
        enum: ['Group', 'Machine']
    },
    assignedTo: { type: Schema.Types.ObjectId, refPath: 'assignmentType' },
    threshold: String,
    item: String,
    priority: String,
    priorityNumber: Number,
    integrations: Array,
    dateCreated: Date
});

var AlertPolicy = mongoose.model('AlertPolicy', alertPolicySchema);

module.exports = AlertPolicy;