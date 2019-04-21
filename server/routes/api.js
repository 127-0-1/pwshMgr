require('dotenv').config();
const uristring = process.env.MONGODBPATH
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.connect(uristring)
    .then(connection => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log(error.message)
    });

const machines = require('./machines');
const users = require('./users');
const jobs = require('./jobs');
const scripts = require('./scripts');
const alertPolicies = require('./alertPolicies');
const alerts = require('./alerts')
const integrations = require('./integrations');
const Alert = require('../models/alert');
const Machine = require('../models/machine');
const AlertPolicies = require('../models/alertPolicy');
const checkAuth = require("../middleware/check-auth");

router.use('/machines', machines);
router.use('/jobs', jobs);
router.use('/users', users);
router.use('/scripts', scripts);
router.use('/alertpolicies', alertPolicies);
router.use('/alerts', alerts);
router.use('/integrations', integrations);

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
router.post('/register', async (req,res) => {
    console.log(req.body)
    req.body.dateAdded = Date.now()
    const machine = await Machine.create(req.body)
    res.send(machine)
})

// get alert policies per machine
router.get('/alertPolicies/machine/:id', async (req,res) => {
    console.log(req.params.id)
    const alertPolices = await AlertPolicies.find({machineId: req.params.id})
    res.send(alertPolices)
})


// update data
router.post('/machines/agent/:id', async (req,res) => {
    if (!Array.isArray(req.body.alerts) || !req.body.alerts.length) {
        console.log("no alerts found to process")
      } else {
        console.log("alerts found to process")
        await Alert.insertMany(req.body.alerts) 
    }
    const machine = await Machine.findById(req.params.id)
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
    machine.dateUpdated = Date.now()
    machine.status = req.body.status
    if (req.body.pollingCycle){
        console.log("this is an update from the UI")   
        machine.pollingCycle = req.body.pollingCycle
    }
    if (req.body.credential) {
        machine.credential = req.body.credential
    }
    const updatedMachine = await Machine.findByIdAndUpdate(req.params.id, machine, { new: true })
    req.io.sockets.in(req.params.id).emit('machineUpdate', updatedMachine)
    res.json(updatedMachine);
})

module.exports = router;