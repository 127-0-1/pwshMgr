var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobSchema = new Schema({
    name: String,
    machine: { type: Schema.Types.ObjectId, ref: 'Machine' },
    status: String,
    startDate: String,
    finishDate: String,
    group: String,
    subJob: Boolean,
    masterJob: String,
    dateAdded: Date,
    output: String,
    type: String,
    script: { type: Schema.Types.ObjectId, ref: 'Script' }
});

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;