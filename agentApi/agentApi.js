require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");
const uuidv1 = require('uuid/v1');
const mongoose = require('mongoose');
const app = express();
const fs = require('fs');
const NodeRSA = require('node-rsa');
const aes256 = require('aes256');

const db = process.env.MONGODBPATH

// load private key
const privateKey = new NodeRSA(fs.readFileSync('privkey.pem', 'utf8'))

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
async function agentAuth(req, res, next) {
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

async function dataUpdate(machineId, payload) {
    try {
        const machine = await Machine.findOne({ _id: machineId })
        const cipher = aes256.createCipher(machine.aesKey)
        const decryptedMachineData = JSON.parse(cipher.decrypt(payload))
        console.log(decryptedMachineData)
        machine.lastContact = Date.now()
        machine.name = decryptedMachineData.name
        machine.operatingSystem = decryptedMachineData.operatingSystem
        machine.architecture = decryptedMachineData.architecture
        machine.serialNumber = decryptedMachineData.serialNumber
        machine.applications = decryptedMachineData.applications
        machine.make = decryptedMachineData.make
        machine.model = decryptedMachineData.model
        machine.publicIp = decryptedMachineData.publicIp
        machine.domain = decryptedMachineData.domain
        machine.services = decryptedMachineData.services
        machine.processes = decryptedMachineData.processes
        machine.drives = decryptedMachineData.drives
        if (machine.status !== "Maintenance") {
            machine.status = decryptedMachineData.status
        }
        await Machine.findOneAndUpdate({ _id: machineId }, machine, { new: true })
        console.log("data update finished")
        return "data updated OK"
    } catch (error) {
        console.log(error.message)
    }

}

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
                        newAlert.save()
                    }
                } else {
                    console.log("drive isn't alerting")
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (!activeAlert) {
                        console.log("no active alert found")
                    } else {
                        console.log("active alert found for drive - need to clear")
                        Alert.deleteOne({ alertPolicyId: alertPolicy._id })
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
                        newAlert.save()
                    }
                } else {
                    console.log("service isnt alerting")
                    const activeAlert = await Alert.findOne({ alertPolicyId: alertPolicy._id })
                    if (!activeAlert) {
                        console.log("no active alert found for service: " + alertPolicy.item)
                    } else {
                        console.log("active alert found for service - need to clear")
                        Alert.deleteOne({ alertPolicyId: alertPolicy._id })
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
                    newAlert.save()
                } else {
                    console.log("process running")
                }
        }
    }
}

// Authentication route
app.post('/handshake', async (req, res) => {
    try {
        // decrypt payload received from machine with server private key
        const decryptedPayloadJson = JSON.parse(privateKey.decrypt(req.body.payload, 'utf8'))

        // check if machine exists in database
        const machine = await Machine.findById(decryptedPayloadJson._id)
        if (!machine) {
            console.log("failed to find machine - ID doesnt exist")
            return res.status(404).send("failed to find machine - ID doesnt exist")
        }

        // check if correct api key was sent
        const hash = await bcrypt.compare(decryptedPayloadJson.apiKey, machine.apiKey);
        if (!hash) {
            console.log("incorrect API key")
            return res.status(401).send("incorrect api key")
        }

        // update machine database record with new aes key
        await Machine.update({ _id: decryptedPayloadJson._id }, { $set: { aesKey: decryptedPayloadJson.aesKey } })

        // build payload to send back to machine
        const authPayloadToSend = "authenticated-OK"
        const authPayloadToSendJson = JSON.stringify(authPayloadToSend)

        // encrypt payload with machine aes key
        var cipher = aes256.createCipher(decryptedPayloadJson.aesKey);
        const encryptedAuthPayload = cipher.encrypt(authPayloadToSendJson);

        //send payload to machine
        res.send(encryptedAuthPayload);

    } catch (error) {
        console.log(error.message)
        res.status(401).send("failed to authenticate")
    }
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
app.post('/data-update', async (req, res) => {
    const machine = await dataUpdate(req.body.machineId, req.body.payload)
    if (!machine) {
        console.log("data update failed")
        return res.send("Failed data update")
    }
    res.send("OK")
    processAlerts(req.body.machineId)
})

// route to send new jobs to agents
app.post('/job-runner', async (req, res) => {

    //check if there is a job in scheduled state, return only one
    const machine = await Machine.findOne({ _id: req.body.machineId }).select('aesKey')
    const job = await Job.findOne({ machine: req.body.machineId, status: "Scheduled" }).populate('script')

    // create cipher with machines aesKey
    const cipher = aes256.createCipher(machine.aesKey);

    // if no job is found, return "No jobs to process" to agent
    if (!job) {
        const encryptedPayload = cipher.encrypt("no jobs to process");
        return res.send(encryptedPayload)
    }

    // if job exists, encrypt with machines aes key and send to machine
    const payload = {
        job: job
    };
    const payloadJson = JSON.stringify(payload)
    const encryptedPayload = cipher.encrypt(payloadJson)
    res.send(encryptedPayload)
    await Job.findByIdAndUpdate(job._id, { status: "Running" })
})

// route agents contact to update job status and send output
app.post('/job-update', async (req, res) => {

    // find machine and grab aes key
    const machine = await Machine.findOne({ _id: req.body.machineId }).select('aesKey')

    // create cipher and decrypt recieved data. Attempt to parse decrypted JSON
    const cipher = aes256.createCipher(machine.aesKey)
    const decryptedPayload = cipher.decrypt(req.body.output)
    const jobResult = JSON.parse(decryptedPayload)

    // find job and update
    const job = await Job.findOneAndUpdate({ _id: jobResult.jobId }, { status: jobResult.status, output: jobResult.output })
    res.send("OK")

})

app.listen(3872)