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
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const db = process.env.MONGODBPATH

// load private key
const privateKey = new NodeRSA(fs.readFileSync('privkey.pem', 'utf8'))

// configure logging
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'agentApi.log' })
    ]
});

// connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false })
    .then(() => logger.info("MongoDB connected"))
    .catch(error => logger.error(`error connecting to mongodb: ${error}`));

// load models
const Machine = require('./models/machine')
const Job = require('./models/job');
const Alert = require('./models/alert');
const AlertPolicies = require('./models/alertPolicy')
const Script = require('./models/script')
const Group = require('./models/group')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function encrypt(machineAesKey, messageToEncrypt) {
    const cipher = aes256.createCipher(machineAesKey)
    const encryptedMessage = cipher.encrypt(messageToEncrypt)
    return encryptedMessage
}

function decrypt(machineAesKey, messageToDecrypt) {
    const cipher = aes256.createCipher(machineAesKey)
    const decryptedMessage = cipher.decrypt(messageToDecrypt)
    return decryptedMessage
}

function decryptMachineData(machineAesKey, messageToDecrypt) {
    const cipher = aes256.createCipher(machineAesKey)
    const decryptedMessage = JSON.parse(cipher.decrypt(messageToDecrypt))
    return decryptedMessage
}

async function jobUpdate(machineId, jobData) {
    try {
        // find machine and grab aes key
        const machine = await Machine.findOne({ _id: machineId }).select('aesKey')

        // decrypt recieved data. Attempt to parse decrypted JSON
        const decryptedData = decrypt(machine.aesKey, jobData)
        const decryptedDataJson = JSON.parse(decryptedData)

        // find job and update
        await Job.findOneAndUpdate({ _id: decryptedDataJson.jobId }, { status: decryptedDataJson.status, output: decryptedDataJson.output })
        return
    } catch (error) {
        throw error
    }
}

async function dataUpdate(machineId, payload) {
    try {
        const machine = await Machine.findOne({ _id: machineId })
        const decryptedMachineData = decryptMachineData(machine.aesKey, payload)
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
        await Machine.updateOne({ _id: machineId }, machine, { new: true })
        logger.info(`data update completed for ${machine.id} ${machine.name}`)
        return "data updated OK"
    } catch (error) {
        logger.error(`error occured in data update for ${machineId}: ${error.message}`)
    }

}

async function processAlerts(machineId) {

    // find groups machine is a member of
    const groups = await Group.find({ machines: machineId }).select('_id')

    //map group _id's to array
    var idArray = groups.map(group => new mongoose.Types.ObjectId(group._id))

    //add machineId to array
    idArray.push(new mongoose.Types.ObjectId(machineId))

    // search for alertpolices with idArray
    const alertPolicies = await AlertPolicies.find({ assignedTo: { $in: idArray } })
    if (!alertPolicies.length) {
        logger.info(`no alert policies to process for ${machineId}`)
        return
    }
    for (const alertPolicy of alertPolicies) {
        switch (alertPolicy.type) {
            case "Drive":
                const drive = await Machine
                    .findOne({ _id: machineId })
                    .select({ drives: { $elemMatch: { name: alertPolicy.item } } })
                if (!drive.drives.length) {
                    logger.info(`${alertPolicy.item} drive doesnt exist on machine ${machineId}`)
                    continue
                }
                const threshold = new Number(alertPolicy.threshold)
                const driveFreeGb = new Number(drive.drives[0].freeGb)
                if (threshold > driveFreeGb) {
                    logger.info(`${alertPolicy.item} drive is alerting on machine ${machineId}`)
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active" })
                    if (!activeAlert) {
                        logger.info(`raising new alert for ${alertPolicy.item} drive on machine ${machineId}`)
                        var newAlert = Alert({
                            name: alertPolicy.name,
                            machine: machineId,
                            priority: alertPolicy.priority,
                            alertPolicyId: alertPolicy._id,
                            priorityNumber: alertPolicy.priorityNumber,
                            status: "Active"
                        });
                        newAlert.save()
                    }
                } else {
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active" })
                    if (activeAlert) {
                        logger.info(`active alert found for drive ${alertPolicy.item} on machine ${machineId} - need to clear`)
                        await Alert.updateOne({ _id: activeAlert._id }, { $set: { status: "Resolved" } })
                    }
                }
                break;
            case "Service":
                const service = await Machine
                    .findOne({ _id: machineId })
                    .select({ services: { $elemMatch: { displayName: alertPolicy.item } } })
                if (!service.services.length) {
                    logger.info(`${alertPolicy.item} service doesn't exist on machine ${machineId}`)
                    continue
                }
                if (service.services[0].status == "Stopped") {
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active" })
                    if (!activeAlert) {
                        logger.info(`raising new alert for ${alertPolicy.item} service on machine ${machineId}`)
                        var newAlert = Alert({
                            name: alertPolicy.name,
                            machine: machineId,
                            priority: alertPolicy.priority,
                            alertPolicyId: alertPolicy._id,
                            priorityNumber: alertPolicy.priorityNumber,
                            status: "Active"
                        });
                        newAlert.save()
                    }
                } else {
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active", })
                    if (activeAlert) {
                        logger.info(`active alert found for service ${alertPolicy.item} on machine ${machineId} - need to clear`)
                        await Alert
                            .updateOne({ _id: activeAlert._id }, { $set: { status: "Resolved" } })
                    }
                }
                break;
            case "Process":
                const process = await Machine
                    .findOne({ _id: machineId })
                    .select({ processes: { $elemMatch: { name: alertPolicy.item } } })
                if (!process.processes.length) {
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active" })
                    if (!activeAlert) {
                        logger.info(`${alertPolicy.item} process not running on machine ${machineId}`)
                        var newAlert = Alert({
                            name: alertPolicy.name,
                            machine: machineId,
                            priority: alertPolicy.priority,
                            alertPolicyId: alertPolicy._id,
                            priorityNumber: alertPolicy.priorityNumber,
                            status: "Active"
                        });
                        newAlert.save()
                    }
                } else {
                    const activeAlert = await Alert
                        .findOne({ alertPolicyId: alertPolicy._id, machine: machineId, status: "Active" })
                    if (activeAlert) {
                        logger.info(`active alert found for process ${alertPolicy.item} not running on machine ${machineId} - need to clear`)
                        await Alert
                            .updateOne({ _id: activeAlert._id }, { $set: { status: "Resolved" } })
                    }
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
        await Machine.updateOne({ _id: decryptedPayloadJson._id }, { $set: { aesKey: decryptedPayloadJson.aesKey } })

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
        const machine = await Machine.findOne({ _id: req.body.machineId }).select('aesKey')
        const encryptedPayload = await encrypt(machine.aesKey, "data update failed")
        logger.error("data update failed")
        return res.status(401).send(encryptedPayload)
    }
    res.status(200).send()
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
    try {
        await jobUpdate(req.body.machineId, req.body.output)
        res.status(200).send()
    } catch (error) {
        await logger.error(`job update failed for job: ${error}`)
        res.status(500).send()
    }
})

app.listen(3872)