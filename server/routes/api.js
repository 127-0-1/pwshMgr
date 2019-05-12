require('dotenv').config();
const uristring = process.env.MONGODBPATH
const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const mongoose = require('mongoose');
mongoose.connect(uristring)
    .then(connection => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log(error.message)
    });
const bcrypt = require("bcryptjs");
const machines = require('./machines');
const users = require('./users');
const jobs = require('./jobs');
const scripts = require('./scripts');
const alertPolicies = require('./alertPolicies');
const alerts = require('./alerts')
const groups = require('./groups');
const integrations = require('./integrations');
const Alert = require('../models/alert');
const Machine = require('../models/machine');
const AlertPolicies = require('../models/alertPolicy');
const Script = require('../models/script');
const Group = require('../models/group');
const Job = require('../models/job');
const checkAuth = require("../middleware/check-auth");
const agentAuth = require("../middleware/agentAuth");

router.use('/machines', machines);
router.use('/jobs', jobs);
router.use('/users', users);
router.use('/scripts', scripts);
router.use('/alertpolicies', alertPolicies);
router.use('/alerts', alerts);
router.use('/integrations', integrations);
router.use('/groups', groups)
router.get('/count', async (req, res) => {
    const onlineMachines = await Machine.count({ status: 'Online' });
    const offlineMachines = await Machine.count({ status: 'Offline' });
    const alerts = await Alert.count();
    const count = {
        alerts: alerts,
        onlineMachines: onlineMachines,
        offlineMachines: offlineMachines
    }
    res.send(count)
});

//   agent routes

// this route is called on agent install
router.post('/register', async (req,res) => {
    const apiKey = uuidv1()
    const hash = await bcrypt.hash(apiKey, 10);
    req.body.apiKey = hash
    req.body.dateAdded = Date.now()
    const machine = await Machine.create(req.body)
    machine.apiKey = apiKey
    res.send(machine)
})

// get alert policies per machine
router.get('/alertPolicies/machine/:id', async (req,res) => {
    const alertPolices = await AlertPolicies.find({machineId: req.params.id})
    res.send(alertPolices)
})

// get alert policies per machine
router.get('/alerts/machine/:machineid/:alertpolicyid', async (req,res) => {
    const alerts = await Alert.find({machineId: req.params.machineid, alertPolicyId: req.params.alertpolicyid})
    res.send(alerts)
})

// get all jobs for machine
router.get('/agent/jobs/machine/:id/:status', async (req,res) => {
    const jobs = await Job.find({machine: req.params.id, status: req.params.status}).populate('script', 'scriptBody')
    res.send(jobs)
})

// Add script output for job
router.post('/agent/jobupdate/:id', async (req,res) => {
    const jobId = req.params.id
    console.log("job id" + req.params.id)
    var newJob = {};
    newJob.status = req.body.status;
    newJob.output = req.body.output;
    const updatedJob = await Job.findOneAndUpdate({_id: jobId}, newJob, { new: true })
    console.log(updatedJob)
    await res.send(updatedJob)
})

// data update
router.post('/machines/agent/:id', agentAuth, async (req,res) => {
    const machine = await Machine.findById(req.params.id)
    if (!Array.isArray(req.body.alerts) || !req.body.alerts.length) {
        console.log("no alerts found to process")
      } else if (machine.status == "Maintenance") {
          console.log("machine in maintenance mode")
      } else {
        console.log("alerts found to process")
        await Alert.insertMany(req.body.alerts) 
    }
    machine.lastContact = Date.now()
    machine.name = req.body.name
    machine.operatingSystem = req.body.operatingSystem
    machine.architecture = req.body.architecture
    machine.serialNumber = req.body.serialNumber
    machine.applications = req.body.applications
    machine.make = req.body.make
    machine.model = req.body.model
    machine.publicIp = req.body.publicIp
    machine.domain = req.body.domain
    machine.services = req.body.services
    machine.processes = req.body.processes
    machine.drives = req.body.drives
    if (machine.status !== "Maintenance"){
        machine.status = req.body.status
    }
    if (req.body.pollingCycle){
        machine.pollingCycle = req.body.pollingCycle
    }
    const updatedMachine = await Machine.findOneAndUpdate({_id: req.params.id}, machine, { new: true })
    req.io.sockets.in(req.params.id).emit('machineUpdate', updatedMachine)
    res.json(updatedMachine);
})

module.exports = router;