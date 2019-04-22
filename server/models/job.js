var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jobSchema = new Schema({
    name: String,
    machine: String,
    status: String,
    startDate: String,
    finishDate: String,
    group: String,
    subJob: Boolean,
    masterJob: String,
    dateAdded: Number,
    output: String,
    type: String,
    script: String
});

var Job = mongoose.model('Job', jobSchema);

module.exports = Job;