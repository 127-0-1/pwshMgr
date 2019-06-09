const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
var status = require('http-status');
const Group = require('../models/group');
const checkAuth = require("../middleware/check-auth");
const validateObjectId = require('../middleware/validateObjectId');
const AlertPolicy = require('../models/alertPolicy')


//create new group
router.post('/', async (req, res) => {
    var newGroup = Group({
        name: req.body.name,
        machines: req.body.machines
    })
    const group = await newGroup.save()
    if (!group) return res.status(404).send('failed to create group')
    res.status(status.OK).json(group);
});

router.put('/:id', checkAuth, validateObjectId, async (req,res) => {
    let group = await Group.findById(req.params.id)
    group.name = req.body.name
    await group.save()
    res.json({message: "OK"})
})

router.post('/multiple/delete', async (req,res) => {
    await Group.remove({_id: {$in: (req.body).map(mongoose.Types.ObjectId)}});
    await AlertPolicy.remove({assignedTo: {$in: (req.body).map(mongoose.Types.ObjectId)}})
    res.status(status.OK).json({message: 'SUCCESS'})
});

// get groups for specific machine
router.get('/machine/:id', validateObjectId, async (req, res) => {
    const groups = await Group.find({ machines: req.params.id });
    if (!groups) return res.status(404).send('No groups found.');
    res.send(groups);
});

// get all groups
router.get('/', async (req, res) => {
    const groups = await Group.find({}, 'name');
    if (!groups) return res.status(404).send('No groups found.');
    res.send(groups);
});

// delete group
router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Group.findByIdAndRemove(req.params.id);
    await AlertPolicy.deleteMany({assignedTo: req.params.id})
    res.status(status.OK).json({ message: 'SUCCESS' });
});

// get single group by ID
router.get('/:id', validateObjectId, async (req, res) => {
    const group = await Group.findById(req.params.id).populate('machines', 'name operatingSystem status')
    if (!group) return res.status(404).send('The integration with the given ID was not found.')
    res.send(group)
});

// add machine to group
router.get('/:id/:machineid', validateObjectId, async (req, res) => {
    console.log("hitting group add route")
    const group = await Group.findByIdAndUpdate({_id: req.params.id}, { $addToSet: { machines: req.params.machineid } }, { safe: true, upsert: true, new: true })
        .populate('machines', 'name')
    if (!group) return res.status(404).send('The group with the given ID was not found.')
    res.send(group)
});

// add multiple machines to group
router.post('/add-multiple', async (req, res) => {
    console.log(req.body)
    const group = await Group.findByIdAndUpdate({_id: req.body.groupId}, { $addToSet: { machines: req.body.machines } }, { safe: true, upsert: true, new: true })
        .populate('machines', 'name')
    if (!group) return res.status(404).send('The group with the given ID was not found.')
    var message = {message: "OK"}
    res.status(200).json(message)
});

// remove machine from group
router.delete('/:id/:machineid', validateObjectId, async (req, res) => {
    const group = await Group.findByIdAndUpdate({_id: req.params.id}, { $pull: { machines: req.params.machineid } }, { safe: true, upsert: true, new: true })
        .populate('machines', 'name')
    if (!group) return res.status(404).send('The group with the given ID was not found.')
    res.send(group)
});

module.exports = router;