const validateObjectId = require('../middleware/validateObjectId');
const AlertPolicy = require('../models/alertPolicy');
const Alert = require('../models/alert')
const Machine = require('../models/machine');
const Group = require('../models/group')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const status = require('http-status');
const checkAuth = require("../middleware/check-auth");

router.post('/', checkAuth, async (req, res) => {
    var alertPolicyName
    var priorityNumber
    switch (req.body.type) {
        case "Drive":
            alertPolicyName = `"${req.body.item}" drive free space below ${req.body.threshold}GB`
            break;
        case "Service":
            alertPolicyName = `"${req.body.item}" service stopped`
            break;
        case "Process":
            alertPolicyName = `"${req.body.item}" process not running`
    }
    switch (req.body.priority) {
        case "Low":
            priorityNumber = 4
            break;
        case "Medium":
            priorityNumber = 3
            break;
        case "High":
            priorityNumber = 2
            break;
        case "Urgent":
            priorityNumber = 1
    }
    var data = req.body;
    var newAlertPolicy = AlertPolicy({
        name: alertPolicyName,
        type: data.type,
        assignedTo: data.assignedTo,
        threshold: data.threshold,
        item: data.item,
        priority: data.priority,
        priorityNumber: priorityNumber,
        assignmentType: data.assignmentType,
        dateCreated: Date.now(),
        email: data.email
    });
    await newAlertPolicy.save()
    res.status(status.OK).json(newAlertPolicy);
});

router.post('/multiple/delete', checkAuth, async (req, res) => {
    await AlertPolicy.remove({ _id: { $in: (req.body).map(mongoose.Types.ObjectId) } });
    await Alert.remove({alertPolicyId: {$in: (req.body).map(mongoose.Types.ObjectId)}})
    res.status(status.OK).json({ message: 'SUCCESS' })
})


router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const alertPolicy = await AlertPolicy.findById(req.params.id).populate('assignedTo', 'name');
    if (!alertPolicy) return res.status(404).send('The alert policy with the given ID was not found.');
    res.send(alertPolicy)
});

router.get('/', async (req, res) => {
    if (req.query.machine) {
        if (!mongoose.Types.ObjectId.isValid(req.query.machine)) {
            return res.status(404).send("Invalid machine Id")
        }
        const machineId = new mongoose.Types.ObjectId(req.query.machine)
        // find groups machine is a member of
        const groups = await Group.find({ machines: machineId }).select('_id')
        //map group _id's to array
        var idArray = groups.map(group => new mongoose.Types.ObjectId(group._id))
        //add machineId to array
        idArray.push(new mongoose.Types.ObjectId(machineId))
        // search for alertpolices with idArray
        const alertPolicies = await AlertPolicy.find({ assignedTo: { $in: idArray } })
        res.send(alertPolicies)
    } else {
        const alertPolicies = await AlertPolicy.find().populate('assignedTo', 'name');
        res.send(alertPolicies);
    }

});

router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await AlertPolicy.findByIdAndRemove(req.params.id);
    await Alert.remove({alertPolicyId: req.params.id})
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;