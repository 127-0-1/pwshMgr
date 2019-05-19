const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
var status = require('http-status');
const Group = require('../models/group');
const checkAuth = require("../middleware/check-auth");
const validateObjectId = require('../middleware/validateObjectId');


//create new group
router.post('/', async (req, res) => {
    console.log(req.body)
    var newGroup = Group({
        name: req.body.name,
        machines: req.body.machines
    })
    const group = await newGroup.save()
    if (!group) return res.status(404).send('failed to create group')
    res.status(status.OK).json(group);
});

router.post('/multiple/delete', async (req,res) => {
    const result = await Group.remove({_id: {$in: (req.body).map(mongoose.Types.ObjectId)}});
    console.log(result)
    res.status(status.OK).json({message: 'SUCCESS'})
})

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

// remove machine from group
router.delete('/:id/:machineid', validateObjectId, async (req, res) => {
    const group = await Group.findByIdAndUpdate({_id: req.params.id}, { $pull: { machines: req.params.machineid } }, { safe: true, upsert: true, new: true })
        .populate('machines', 'name')
    if (!group) return res.status(404).send('The group with the given ID was not found.')
    res.send(group)
});

module.exports = router;