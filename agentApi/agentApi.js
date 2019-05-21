require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const uuidv1 = require('uuid/v1');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');
const NodeRSA = require('node-rsa');
var aes256 = require('aes256');
const db = process.env.MONGODBPATH

// load key
const privateKeyString = fs.readFileSync('privkey.pem', 'utf8');
const privateKey = new NodeRSA(privateKeyString)

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
async function agentAuth (req, res, next) {
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
    for (const alertPolicy of alertPolicies) {
        switch (alertPolicy.type) {
            case "Drive":
                const drive = await Machine
                    .findOne({ _id: machineId })
                    .select({ drives: { $elemMatch: { name: alertPolicy.item } } })
                if (!drive.drives.length) {
                    console.log(alertPolicy.item + " drive doesnt exist on this machine")
                    continue
                }
                const threshold = new Number(alertPolicy.threshold)
                const driveFreeGb = new Number(drive.drives[0].freeGb)
                if (threshold > driveFreeGb) {
                    console.log("drive is alerting")
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (activeAlert) {
                        console.log("alert is already active, no need to raise a new one")
                    } else {
                        console.log("no alert found, raising new")
                        var newAlert = Alert({
                            name: alertPolicy.name,
                            machine: alertPolicy.machine,
                            priority: alertPolicy.priority,
                            alertPolicyId: alertPolicy._id
                        });
                        await newAlert.save()
                    }
                } else {
                    console.log("drive isn't alerting")
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (!activeAlert) {
                        console.log("no active alert found")
                    } else {
                        console.log("active alert found for drive - need to clear")
                        await Alert.deleteOne({ alertPolicyId: alertPolicy._id })
                    }
                }
                break;
            case "Service":
                const service = await Machine
                    .findOne({ _id: machineId })
                    .select({ services: { $elemMatch: { displayName: alertPolicy.item } } })
                if (!service.services.length) {
                    console.log(alertPolicy.item + " service not found")
                    continue
                }
                if (service.services[0].status == "Stopped") {
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (activeAlert) {
                        console.log("alert is already active, no need to raise a new one")
                    } else {
                        console.log("service is stopped")
                        var newAlert = Alert({
                            name: alertPolicy.name,
                            machine: alertPolicy.machine,
                            priority: alertPolicy.priority,
                            alertPolicyId: alertPolicy._id
                        });
                        await newAlert.save()
                    }
                } else {
                    console.log("service isnt alerting")
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (!activeAlert) {
                        console.log("no active alert found for service: " + alertPolicy.item)
                    } else {
                        console.log("active alert found for service - need to clear")
                        await Alert.deleteOne({ alertPolicyId: alertPolicy._id })
                    }
                }
                break;
            case "Process":
                const process = await Machine
                    .findOne({ _id: machineId })
                    .select({ processes: { $elemMatch: { name: alertPolicy.item } } })
                if (!process.processes.length) {
                    console.log("process not running")
                    var newAlert = Alert({
                        name: alertPolicy.name,
                        machine: alertPolicy.machine,
                        priority: alertPolicy.priority,
                        alertPolicyId: alertPolicy._id
                    });
                    await newAlert.save()
                } else {
                    console.log("process running")
                }
        }
    }
}

// processAlerts("5ce19b87699cb232384f0fe4")


app.post('/handshake', async (req, res) => {
    console.log(req.body)
    const decryptedPayload = privateKey.decrypt(req.body.payload, 'utf8')
    const payloadJson = JSON.parse(decryptedPayload)
    console.log(payloadJson.aesKey)
    const machine = await Machine.update({ _id: payloadJson.id}, {$set: { aesKey: payloadJson.aesKey}})
    machine.aesKey = payloadJson.aesKey
    console.log(machine)
    res.send("ok");
});


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
    await processAlerts(req.params.id)
    console.log("data update finished")
})




app.listen(3872)