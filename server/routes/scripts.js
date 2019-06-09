const express = require('express');
const router = express.Router();
const Script = require('../models/script');
const mongoose = require('mongoose');
const status = require('http-status');
const validateObjectId = require('../middleware/validateObjectId');
const checkAuth = require("../middleware/check-auth");

// add new script
router.post('/', checkAuth, async (req, res) => {
    const script = new Script({
        name: req.body.name,
        scriptBody: req.body.scriptBody,
        state: "Active"
    });
    await script.save();
    res.send(script);
});

router.put('/:id', checkAuth, validateObjectId, async (req,res) => {
    let script = await Script.findById(req.params.id)
    script.scriptBody = req.body.scriptBody
    script.name = req.body.name
    await script.save()
    res.json({message: "OK"})
})

//get script
router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const script = await Script.findById(req.params.id)
    if (!script) return res.status(404).send('The script with the given ID was not found.');
    res.send(script)
});

// get all
router.get('/', checkAuth, async (req, res) => {
    const scripts = await Script.find({ state: "Active" })
    res.send(scripts);
});

// delete multiple
router.post('/multiple/delete', async (req, res) => {
    await Script.updateMany({ _id: { $in: (req.body).map(mongoose.Types.ObjectId) } }, {state: "Deleted "});
    res.status(status.OK).json({ message: 'SUCCESS' })
})

// delete single
router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Script.findByIdAndUpdate(req.params.id, {state: "Deleted"});
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;