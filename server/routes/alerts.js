const validateObjectId = require('../middleware/validateObjectId')
const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');
const mongoose = require('mongoose');
const status = require('http-status');
const Machine = require('../models/machine');
const checkAuth = require("../middleware/check-auth");

router.get('/', async (req, res) => {
    if (req.query.machine) {
        if (!mongoose.Types.ObjectId.isValid(req.query.machine)) {
            return res.status(404).send('Invalid machine ID.');
        }
        const machineId = new mongoose.Types.ObjectId(req.query.machine)
        const alerts = await Alert.find({ status: "Active", machine: machineId }).sort({ priorityNumber: 'asc' });
        res.send(alerts);
    } else {
        const alerts = await Alert.find({ status: "Active" }).populate('machine', 'name').sort({ priorityNumber: 'asc' });
        res.send(alerts);
    }
});

router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Alert.findByIdAndRemove(req.params.id);
    res.status(status.OK).json({ message: 'SUCCESS' });
});

router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const alert = await Alert.findById(req.params.id).populate('machine')
    if (!alert) return res.status(404).send('The alert with the given ID was not found.')
    res.send(alert)
});

module.exports = router;