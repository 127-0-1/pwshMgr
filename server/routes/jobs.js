require('dotenv').config();
const validateObjectId = require('../middleware/validateObjectId');
const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const status = require('http-status');
const checkAuth = require("../middleware/check-auth");

router.post('/', checkAuth, async (req, res) => {
        var newJob = Job({
            machine: req.body.machine,
            script: req.body.script,
            status: "Scheduled",
            dateAdded: Date.now(),
            output: null,
        })
    await newJob.save()
    res.status(status.OK).json(newJob);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const job = await Job.findById(req.params.id).populate('machine', 'name').populate('script', 'name');
    if (!job) return res.status(404).send('The job with the given ID was not found.');
    if (job.group) {
        const subJobs = await Job.find({ masterJob: req.params.id })
        var jobDetails = {
            _id: job._id,
            name: job.name,
            application: job.application,
            status: job.status,
            startDate: job.startDate,
            group: job.group,
            subJob: job.subjob,
            finishData: job.finishDate,
            subJobs: subJobs
        }
        return res.send(jobDetails)
    }
    res.send(job)
});

router.get('/', checkAuth, async (req, res) => {
    const jobs = await Job.find().populate('machine', 'name').populate('script', 'name');
    res.send(jobs);
});

router.put('/', checkAuth, (req, res) => {
    var data = req.body;
    var id = data._id;
    if (data.status == "Finished") {
        var jobToUpdate = {
            name: data.name,
            machine: data.machine,
            application: data.application,
            status: data.status,
            startDate: data.startDate,
            dateAdded: data.dateAdded,
            finishDate: Date.now()
        }
    }

    if (data.status == "Running") {
        var jobToUpdate = {
            name: data.name,
            machine: data.machine,
            application: data.application,
            status: data.status,
            startDate: Date.now(),
            dateAdded: data.dateAdded
        }
    }

    Job.findByIdAndUpdate({_id: req.params.id}, jobToUpdate, function (err, job) {
        Job.findById(id, function (err, jobFounded) {
            req.io.sockets.in(id).emit('jobUpdate', jobFounded)
            console.log(id)
            console.log(jobFounded)
            res.status(status.OK).json(jobFounded);
        });
    });
});

router.get('/subjobs/:subJobId', checkAuth, (req, res) => {
    var subJobId = req.params.subJobId;
    Job.find({ masterJob: subJobId }, function (err, jobs) {
        if (err) return res.status(status.BAD_REQUEST).json(err);
        res.status(status.OK).json(jobs);
    });
});

router.delete('/:id', checkAuth, validateObjectId, async (req, res) => {
    await Job.findByIdAndRemove(req.params.id);
    res.status(status.OK).json({ message: 'SUCCESS' });
});

module.exports = router;