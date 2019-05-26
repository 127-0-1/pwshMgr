require('dotenv').config();
const util = require('util');
const crypto = require('crypto');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const axios = require("axios");
const cron = require('node-cron');
const winston = require('winston');
const fs = require('fs');
const NodeRSA = require('node-rsa');
const aes256 = require('aes256');
const dateUpdateScript = path.join(__dirname, './scripts/data_update.ps1');
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/data-update"
const handShakeUrl = process.env.MANAGEMENT_NODE + "/handshake"
const jobRunnerUrl = process.env.MANAGEMENT_NODE + "/job-runner"
const jobUpdateUrl = process.env.MANAGEMENT_NODE + "/job-update"
const agentId = process.env.ID
const managementNode = process.env.MANAGEMENT_NODE
const apiKey = process.env.API_KEY

// wait function
function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

var logger = new (winston.createLogger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'agent.log' })
  ]
});

// set job runner lock variable
var jobInProgressLock = false

// generate AES session key
const aesKey = crypto.randomBytes(32).toString('hex')
const cipher = aes256.createCipher(aesKey)

async function handshake() {
  var auth = false
  do {
    try {
      // checking if settings exist in config file
      if (!agentId) {
        throw new Error("no id found in configuration file")
      }
      if (!apiKey) {
        throw new Error("no apikey found in configuration file")
      }
      if (!managementNode) {
        throw new Error("no management node set in configuration file")
      }
      // load servers public key
      const publicKey = new NodeRSA(fs.readFileSync('pubkey.pem', 'utf8'))

      // build payload to send to server
      const dataToEncrpt = {
        _id: agentId,
        aesKey: aesKey,
        apiKey: apiKey
      }
      const payloadJson = JSON.stringify(dataToEncrpt)

      //encrypt payload with servers public key and send
      const encryptedPayload = publicKey.encrypt(payloadJson, 'base64')
      const payloadToSend = {
        payload: encryptedPayload
      }
      const handshakeReturn = await axios.post(handShakeUrl, payloadToSend)

      // decrypt response from server with AES session key and check if it was encrypted with
      // correct AES session key
      var decryptedData = cipher.decrypt(handshakeReturn.data)
      if (!decryptedData.includes("authenticated-OK")) {
        throw new Error("unable to decrypt server response - failed auth")
      }

      // if no errors, set auth to true and proceed
      auth = true
      return
    } catch (error) {
      console.log("An error occurred in handshake. Failed to authenticate.")
      console.log(error.message)
      console.log("sleeping for 60 seconds")
      await sleep(5000)
    }
  } while (!auth)
}

handshake()
  .then(data => {
    console.log("auth OK")
    dataUpdate()
  })


async function dataUpdate() {
  // const sleepSeconds = Math.floor(Math.random() * 100) + 10
  // console.log(`sleeping for ${sleepSeconds} seconds`)
  // await sleep(sleepSeconds * 1000)
  const { stdout, stderr } = await exec(`powershell -NoProfile -File ${dateUpdateScript}`);
  const encryptedPayload = cipher.encrypt(stdout)
  const dataToSend = {
    machineId: agentId,
    payload: encryptedPayload
  }
  const postToManagementNode = await axios.post(dataUpdateUrl, dataToSend);
}

async function jobRunner() {
  // if jobInProgressLock is set to true, a job is already running, so this cron cycle needs to be skipped
  if (jobInProgressLock) {
    console.log("Job already in progress, skipping this scheduled cycle")
    return
  }

  // set jobInProgressLock to true to prevent multiple jobs launching whilst one is still in progress
  jobInProgressLock = true

  // build payload with machineId to send to server for job requests
  const dataToSend = {
    machineId: agentId
  }

  // send data to agent api
  const postToJobRunner = await axios.post(jobRunnerUrl, dataToSend)

  //decrypt response
  const decryptedPayload = cipher.decrypt(postToJobRunner.data)

  // if response contains "no jobs to process", the rest of the function can be skipped
  if (decryptedPayload.includes("no jobs to process")) {
    jobInProgressLock = false
    console.log("no jobs to process")
    return
  }

  // parse response - if this fails, it could be due to an issue with the aes encryption
  const decryptedPayloadJson = JSON.parse(decryptedPayload)

  // save script to disk for execution
  fs.writeFileSync(`${decryptedPayloadJson.job.script._id}.ps1`, decryptedPayloadJson.job.script.scriptBody)

  // execute script and capture stdout + stderr
  const { stdout, stderr } = await exec(`powershell -ExecutionPolicy Bypass -NoProfile -File ${decryptedPayloadJson.job.script._id}.ps1`);

  // check if script failed or succeeded and build payload to send
  var output = {}
  if (stdout) {
    console.log(`stdout: ${stdout}`)
    output = {
      status: "Success",
      output: stdout,
      jobId: decryptedPayloadJson.job._id
    }
  } else {
    console.log(`stderr: ${stderr}`)
    output = {
      status: "Failed",
      output: stderr,
      jobId: jobId = decryptedPayloadJson.job._id
    }
  }
  const outputJson = JSON.stringify(output)

  // encrypt payload to send to management node
  const outputEncrypted = cipher.encrypt(outputJson)
  const payloadToSend = {
    machineId: agentId,
    output: outputEncrypted
  }

  const postToJobUpdateReturn = await axios.post(jobUpdateUrl, payloadToSend)
  console.log(postToJobUpdateReturn.data)

  // // delete script once execution has finished
  // fs.unlinkSync(`${decryptedPayloadJson.job.script._id}.ps1`)

  // // set jobInProgressLock to false, ready for next job
  // jobInProgressLock = false
};

var dataUpdateCron = cron.schedule('*/5 * * * *', () => {
  dataUpdate();
}, {
    scheduled: false
  });

// Job runner
var jobRunnerCron = cron.schedule('*/1 * * * *', () => {
  jobRunner().then(output => {
    console.log(output)
  });
}, {
    scheduled: false
  });