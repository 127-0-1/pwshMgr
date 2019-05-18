var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var applicationSchema = new Schema({
  name: String,
  version: String
})

var serviceSchema = new Schema({
  displayName: String,
  status: String
})

var driveSchema = new Schema({
  name: String,
  usedGb: String,
  freeGb: String
})

var processSchema = new Schema({
  name: String,
  pId: String
})

var machineSchema = new Schema({
  name: String,
  operatingSystem: String,
  serialNumber: String,
  applications: [applicationSchema],
  make: String,
  model: String,
  architecture: String,
  publicIp: String,
  ipAddress: String,
  domain: String,
  credential: String,
  services: [serviceSchema],
  drives: [driveSchema],
  processes: [processSchema],
  status: String,
  pollingCycle: String,
  dateAdded: String,
  lastContact: String,
  apiKey: String
}, {});


var Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;