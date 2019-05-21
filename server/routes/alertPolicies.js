const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
const AlertPolicy = require('../models/alertPolicy');
const mongoose = require('mongoose');
const status = require('http-status');
const Machine = require('../models/machine');
const checkAuth = require("../middleware/check-auth");

router.post('/', checkAuth, async (req, res) => {
    console.log(req.body)
    var data = req.body;
    if (req.body.type == "Drive") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" drive free space below ${req.body.threshold}GB`,
            type: data.type,
            machine: data.machine,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
        });
    }
    if (req.body.type == "Service") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" service stopped`,
            type: data.type,
            machine: data.machine,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
        });
    }
    if (req.body.type == "Process") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" process not running`,
            type: data.type,
            machine: data.machine,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
        });
    }
    await newAlertPolicy.save()
    res.status(status.OK).json(newAlertPolicy);
});

router.post('/multiple/delete', async (req,res) => {
    const result = await AlertPolicy.remove({_id: {$in: (req.body).map(mongoose.Types.ObjectId)}});
    console.log(result)
    res.status(status.OK).json({message: 'SUCCESS'})
})


router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const alertPolicy = await AlertPolicy.findById(req.params.id).populate('machine', 'name');
    if (!alertPolicy) return res.status(404).send('The alert policy with the given ID was not found.');
    res.send(alertPolicy)
});

router.get('/', checkAuth, async (req, res) => {
    const alertPolicies = await AlertPolicy.find().populate('machine', 'name');
    res.send(alertPolicies);
});

router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await AlertPolicy.findByIdAndRemove(req.params.id);
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;