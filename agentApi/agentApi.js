require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const uuidv1 = require('uuid/v1');
const mongoose = require('mongoose');
const app = express();
const db = process.env.MONGODBPATH

// connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// load models
const Machine = require('./models/machine')
const Script = require('./models/script');
const Group = require('./models/group');
const Job = require('./models/job');
const Alert = require('./models/alert');
const AlertPolicies = require('./models/alertPolicy')

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

async function processAlerts(machineId) {
    const alertPolicies = await AlertPolicies.find({ machine: machineId })
    if (!alertPolicies.length) {
        console.log("no alert policies for this machine")
        return
    }
    alertPolicies.forEach(async (alertPolicy) => {
        switch (alertPolicy.type) {
            case "Drive":
                const drive = await Machine
                    .findOne({ _id: machineId })
                    .select({ drives: { $elemMatch: { name: alertPolicy.item } } })
                const threshold = new Number(alertPolicy.threshold)
                const driveFreeGb = new Number(drive.drives[0].freeGb)
                if (threshold > driveFreeGb) {
                    console.log("drive is alerting")
                } else {
                    console.log("drive isn't alerting")
                }
                break;
            case "Service":
                const service = await Machine
                    .findOne({ _id: machineId })
                    .select({ services: { $elemMatch: { displayName: alertPolicy.item } } })
                if (!service.services.length) {
                    console.log("service not found")
                } else if (service.services[0].status == "Stopped") {
                    console.log("service is stopped")
                } else {
                    console.log("service is running")
                }
                break;
            case "Process":
                const process = await Machine
                    .findOne({ _id: machineId })
                    .select({ processes: { $elemMatch: { name: alertPolicy.item } } })
                if (!process.processes.length) {
                    console.log("process not running")
                } else {
                    console.log("process running")
                }
            // code block
        }
    });
}

processAlerts("5ce19b87699cb232384f0fe4")

// //register
// app.post('/register', async (req, res) => {
//     const apiKey = uuidv1()
//     const hash = await bcrypt.hash(apiKey, 10);
//     req.body.apiKey = hash
//     req.body.dateAdded = Date.now()
//     const machine = await Machine.create(req.body)
//     machine.apiKey = apiKey
//     res.send(machine)
// })

// //data update
// app.post('/data-update/:id', agentAuth, async (req, res) => {
//     const machine = await Machine.findById(req.params.id)
//     if (!Array.isArray(req.body.alerts) || !req.body.alerts.length) {
//         console.log("no alerts found to process")
//     } else if (machine.status == "Maintenance") {
//         console.log("machine in maintenance mode")
//     } else {
//         console.log("alerts found to process")
//         await Alert.insertMany(req.body.alerts)
//     }
//     machine.lastContact = Date.now()
//     machine.name = req.body.name
//     machine.operatingSystem = req.body.operatingSystem
//     machine.architecture = req.body.architecture
//     machine.serialNumber = req.body.serialNumber
//     machine.applications = req.body.applications
//     machine.make = req.body.make
//     machine.model = req.body.model
//     machine.publicIp = req.body.publicIp
//     machine.domain = req.body.domain
//     machine.services = req.body.services
//     machine.processes = req.body.processes
//     machine.drives = req.body.drives
//     if (machine.status !== "Maintenance") {
//         machine.status = req.body.status
//     }
//     if (req.body.pollingCycle) {
//         machine.pollingCycle = req.body.pollingCycle
//     }
//     const updatedMachine = await Machine.findOneAndUpdate({ _id: req.params.id }, machine, { new: true })
//     res.json(updatedMachine);
// })


// app.get('/:id', async (req, res) => {
//     const machine = await Machine.findById(req.params.id);
//     if (!machine) return res.status(404).send('The machine with the given ID was not found.');
//     res.send(machine);
// });

// app.listen(3872)