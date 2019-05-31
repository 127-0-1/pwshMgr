const express = require('express');
const router = express.Router();
const Script = require('../models/script');
const mongoose = require('mongoose');
const status = require('http-status');
const validateObjectId = require('../middleware/validateObjectId');
const checkAuth = require("../middleware/check-auth");

router.post('/', checkAuth, async (req, res) => {
    const script = new Script({
        name: req.body.name,
        scriptBody: req.body.scriptBody
    });
    await script.save();
    res.send(script);
});

//get script
router.get('/:id', checkAuth, validateObjectId, async (req, res) => {
    const script = await Script.findById(req.params.id)
    if (!script) return res.status(404).send('The script with the given ID was not found.');
    res.send(script)
});

router.get('/', checkAuth, async (req, res) => {
    const scripts = await Script.find();
    res.send(scripts);
});

// delete multiple
router.post('/multiple/delete', async (req,res) => {
    console.log(req.body)
    const result = await Script.remove({_id: {$in: (req.body).map(mongoose.Types.ObjectId)}});
    console.log(result)
    res.status(status.OK).json({message: 'SUCCESS'})
})


router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Script.findByIdAndRemove(req.params.id);
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;