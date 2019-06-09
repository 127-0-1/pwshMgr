const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
const Machine = require('../models/machine');
const mongoose = require('mongoose');
const status = require('http-status');
const Job = require('../models/job');
const Alert = require('../models/alert');
const AlertPolicy = require('../models/alertPolicy');
const checkAuth = require("../middleware/check-auth");
const Group = require("../models/group")


// delete multiuple
router.put('/multiple', async (req, res) => {
    await Machine.remove({ _id: { $in: (req.body).map(mongoose.Types.ObjectId) } });
    await Job.remove({ machine: { $in: (req.body).map(mongoose.Types.ObjectId) } });
    await Alert.remove({ machine: { $in: (req.body).map(mongoose.Types.ObjectId) } });
    await AlertPolicy.deleteMany({ assignedTo: { $in: (req.body).map(mongoose.Types.ObjectId) } });
    await Group.updateMany({ machines: { $in: (req.body).map(mongoose.Types.ObjectId) } }, { $pull: { machines: req.params.machineid } }, { safe: true, upsert: true })
    res.status(status.OK).json({ message: 'SUCCESS' })
})

router.get('/:id', validateObjectId, async (req, res) => {
    if (req.query.select) {
        const machine = await Machine.findById(req.params.id).select(req.query.select);
        res.send(machine);
    } else {
        const machine = await Machine.findById(req.params.id).select('-applications -services -drives -aesKey -processes -apiKey');
        if (!machine) return res.status(404).send('The machine with the given ID was not found.');
        res.send(machine);
    }
});

router.get('/:id/drives', validateObjectId, async (req, res) => {
    const machine = await Machine.findById(req.params.id, 'drives -_id');
    if (!machine) return res.status(404).send('The machine with the given ID was not found.');
    res.send(machine);
});

// update status
router.post('/offline/:id', checkAuth, validateObjectId, async (req, res) => {
    const machine = await Machine.findById(req.params.id);
    machine.status = "Offline"
    await Machine.findByIdAndUpdate({ _id: req.params.id }, machine, { new: true })
    req.io.sockets.in(req.params.id).emit('machineUpdate', machine)
    res.status(status.OK).json({ message: 'Success' });
})

// delete single machine
router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Machine.findByIdAndRemove(req.params.id);
    await Job.deleteMany({ machine: req.params.id });
    await Alert.deleteMany({ machine: req.params.id });
    await AlertPolicy.deleteMany({ assignedTo: req.params.id });
    await Group.updateMany({ machines: req.params.id }, { $pull: { machines: req.params.machineid } }, { safe: true, upsert: true })
    res.status(status.OK).json({ message: 'SUCCESS' });
});

// get all machines
router.get('/', checkAuth, async (req, res) => {
    const machines = await Machine.find({}, 'name _id operatingSystem status');
    res.send(machines);
});

// update machine
router.put('/:id', validateObjectId, async (req, res) => {
    const machine = await Machine.findById(req.params.id)
    machine.name = req.body.name
    machine.operatingSystem = req.body.operatingSystem
    machine.architecture = req.body.architecture
    machine.serialNumber = req.body.serialNumber
    machine.applications = req.body.applications
    machine.make = req.body.make
    machine.model = req.body.model
    machine.domain = req.body.domain
    machine.services = req.body.services
    machine.processes = req.body.processes
    machine.drives = req.body.drives
    machine.status = req.body.status
    if (req.body.pollingCycle) {
        console.log("this is an update from the UI")
        machine.pollingCycle = req.body.pollingCycle
    }
    if (req.body.credential) {
        machine.credential = req.body.credential
    }
    const updatedMachine = await Machine.findByIdAndUpdate(req.params.id, machine, { new: true })
    req.io.sockets.in(req.params.id).emit('machineUpdate', updatedMachine)
    res.status(status.OK).json(updatedMachine);
});

router.get('/jobs/:id', checkAuth, (req, res) => {
    Job.find({ machine: req.params.id }, '_id name dateAdded status', function (err, jobs) {
        if (err) return res.status(status.BAD_REQUEST).json(err);
        res.status(status.OK).json(jobs);
    });
});

router.get('/alerts/:id', checkAuth, validateObjectId, async (req, res) => {
    const alerts = await Alert.find({ machineId: req.params.id });
    res.send(alerts);
});

module.exports = router;