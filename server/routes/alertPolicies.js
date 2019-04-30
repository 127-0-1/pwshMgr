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
    if (req.body.type == "drive") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" drive free space below ${req.body.threshold}GB`,
            type: data.type,
            machineId: data.machineId,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
            integrations: data.integrations
        });
    }
    if (req.body.type == "service") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" service stopped`,
            type: data.type,
            machineId: data.machineId,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
            integrations: data.integrations
        });
    }
    if (req.body.type == "process" && req.body.threshold == "is-running") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" process running`,
            type: data.type,
            machineId: data.machineId,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
            integrations: data.integrations
        });
    }
    if (req.body.type == "process" && req.body.threshold == "not-running") {
        var newAlertPolicy = AlertPolicy({
            name: `"${req.body.item}" process not running`,
            type: data.type,
            machineId: data.machineId,
            threshold: data.threshold,
            item: data.item,
            priority: data.priority,
            integrations: data.integrations
        });
    }
    await newAlertPolicy.save()
    res.status(status.OK).json(newAlertPolicy);
});

router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const alertPolicy = await AlertPolicy.findById(req.params.id).populate('machineId', 'name');
    if (!alertPolicy) return res.status(404).send('The alert policy with the given ID was not found.');
    res.send(alertPolicy)
});

router.get('/', checkAuth, async (req, res) => {
    const alertPolicies = await AlertPolicy.find().populate('machineId', 'name');
    res.send(alertPolicies);
});

router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await AlertPolicy.findByIdAndRemove(req.params.id);
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;