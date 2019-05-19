require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const uuidv1 = require('uuid/v1');
const mongoose = require('mongoose');
const app = express();
const mongoUriString = process.env.MONGODBPATH

// connect to MongoDB
mongoose.connect(mongoUriString)
    .then(connection => {
        console.log('Connected to MongoDB')
    })
    .catch(error => {
        console.log(error.message)
    });

// load models
const Machine = require('./models/machine')
const Script = require('./models/script');
const Group = require('./models/group');
const Job = require('./models/job');
const Alert = require('./models/alert');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// auth middleware
const agentAuth = async function (req, res, next) {
    try {
        const machine = await Machine.findById(req.params.id)
        const hash = await bcrypt.compare(req.header('api-key'), machine.apiKey);
        if (hash) {
            next();
        } else {
            res.status(401).json({ message: "You are not authenticated!" });
        }
    } catch (error) {
        throw error
    }
};

//register
app.post('/register', async (req, res) => {
    const apiKey = uuidv1()
    const hash = await bcrypt.hash(apiKey, 10);
    req.body.apiKey = hash
    req.body.dateAdded = Date.now()
    const machine = await Machine.create(req.body)
    machine.apiKey = apiKey
    res.send(machine)
})

//data update
app.post('/data-update/:id', agentAuth, async (req, res) => {
    const machine = await Machine.findById(req.params.id)
    if (!Array.isArray(req.body.alerts) || !req.body.alerts.length) {
        console.log("no alerts found to process")
    } else if (machine.status == "Maintenance") {
        console.log("machine in maintenance mode")
    } else {
        console.log("alerts found to process")
        await Alert.insertMany(req.body.alerts)
    }
    machine.lastContact = Date.now()
    machine.name = req.body.name
    machine.operatingSystem = req.body.operatingSystem
    machine.architecture = req.body.architecture
    machine.serialNumber = req.body.serialNumber
    machine.applications = req.body.applications
    machine.make = req.body.make
    machine.model = req.body.model
    machine.publicIp = req.body.publicIp
    machine.domain = req.body.domain
    machine.services = req.body.services
    machine.processes = req.body.processes
    machine.drives = req.body.drives
    if (machine.status !== "Maintenance") {
        machine.status = req.body.status
    }
    if (req.body.pollingCycle) {
        machine.pollingCycle = req.body.pollingCycle
    }
    const updatedMachine = await Machine.findOneAndUpdate({ _id: req.params.id }, machine, { new: true })
    res.json(updatedMachine);
})


app.get('/:id', async (req, res) => {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).send('The machine with the given ID was not found.');
    res.send(machine);
});

app.listen(3872)