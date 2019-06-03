require('dotenv').config();
const util = require('util');
const crypto = require('crypto');
const exec = util.promisify(require('child_process').exec);
const axios = require("axios");
const cron = require('node-cron');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const fs = require('fs');
const NodeRSA = require('node-rsa');
const aes256 = require('aes256');
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/data-update"
const handShakeUrl = process.env.MANAGEMENT_NODE + "/handshake"
const jobRunnerUrl = process.env.MANAGEMENT_NODE + "/job-runner"
const jobUpdateUrl = process.env.MANAGEMENT_NODE + "/job-update"
const agentId = process.env.ID
const managementNode = process.env.MANAGEMENT_NODE
const apiKey = process.env.API_KEY

// sleep function
function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

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
    new transports.File({ filename: 'agent.log' })
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
      logger.info("An error occurred in handshake. Failed to authenticate.")
      logger.error(error.message)
      logger.info("sleeping for 5 minutes")
      await sleep(300000)
    }
  } while (!auth)
}

handshake()
  .then(() => {
    logger.info("authenticated OK")
    jobRunnerCron.start()
    dataUpdateCron.start()
  })


async function dataUpdate() {
  // // sleep for randomised amount of seconds to prevent all agents hitting server at once. 10-120 seconds
  // // const sleepSeconds = Math.floor(Math.random() * 100) + 10
  // // logger.info(`starting data update - sleeping for ${sleepSeconds} seconds`)
  // await sleep(sleepSeconds * 1000)
  try {
    const encodedCommand = "DQAKACAAIAAgACAAJABQAHIAbwBnAHIAZQBzAHMAUAByAGUAZgBlAHIAZQBuAGMAZQAgAD0AIAAiAFMAaQBsAGUAbgB0AGwAeQBDAG8AbgB0AGkAbgB1AGUAIgANAAoAIAAgACAAIAAkAEgAbwBzAHQATgBhAG0AZQAgAD0AIABoAG8AcwB0AG4" +
      "AYQBtAGUADQAKACQAUAByAG8AYwBlAHMAcwBlAHMAIAA9ACAARwBlAHQALQBQAHIAbwBjAGUAcwBzACAAfAAgAFMAZQBsAGUAYwB0AC0ATwBiAGoAZQBjAHQAIABAAHsATgBhAG0AZQAgAD0AIAAiAG4AYQBtAGUAIgA7ACAARQB4AHAAcgAgAD" +
      "0AIAB7ACAAJABfAC4AUAByAG8AYwBlAHMAcwBOAGEAbQBlACAAfQAgAH0ALAAgAEAAewBOAGEAbQBlACAAPQAgACIAcABJAGQAIgA7ACAARQB4AHAAcgAgAD0AIAB7ACAAWwBzAHQAcgBpAG4AZwBdACQAXwAuAEkAZAAgAH0AIAB9ACAAIAAgA" +
      "CAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAANAAoAJABEAG8AbQBhAGkAbgAgAD0AIAAoAEcAZQB0AC0AVwBtAGkATwBiAGoAZQBjAHQAIABXAGkAbgAzADIAXwBDAG8AbQBwAHUAdABlAHIAUwB5AHMAdABl" +
      "AG0AKQAuAEQAbwBtAGEAaQBuAA0ACgAkAFMAZQByAHYAaQBjAGUAcwAgAD0AIABHAGUAdAAtAFMAZQByAHYAaQBjAGUAIAB8ACAAUwBlAGwAZQBjAHQALQBPAGIAagBlAGMAdAAgAEAAewBOAGEAbQBlACAAPQAgACIAZABpAHMAcABsAGEAeQB" +
      "OAGEAbQBlACIAOwAgAEUAeABwAHIAIAA9ACAAewAgACQAXwAuAEQAaQBzAHAAbABhAHkATgBhAG0AZQAgAH0AIAB9ACwAIABAAHsATgBhAG0AZQAgAD0AIAAiAHMAdABhAHQAdQBzACIAOwAgAEUAeABwAHIAIAA9ACAAewAgACQAXwAuAFMAdA" +
      "BhAHQAdQBzACAAfQAgAH0AIAB8ACAAQwBvAG4AdgBlAHIAdABUAG8ALQBDAHMAdgAgAHwAIABDAG8AbgB2AGUAcgB0AEYAcgBvAG0ALQBDAHMAdgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAI" +
      "AAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAADQAKACQATwBTAEQAZQB0AGEAaQBsAHMAIAA9ACAARwBlAHQALQBDAGkAbQBJAG4AcwB0AGEA" +
      "bgBjAGUAIABXAGkAbgAzADIAXwBPAHAAZQByAGEAdABpAG4AZwBTAHkAcwB0AGUAbQANAAoAJABEAHIAaQB2AGUAcwAgAD0AIABHAGUAdAAtAFAAUwBEAHIAaQB2AGUAIAAtAFAAUwBQAHIAbwB2AGkAZABlAHIAIABGAGkAbABlAFMAeQBzAHQ" +
      "AZQBtACAAfAAgAFMAZQBsAGUAYwB0AC0ATwBiAGoAZQBjAHQAIABAAHsATgBhAG0AZQAgAD0AIAAiAG4AYQBtAGUAIgA7ACAARQB4AHAAcgAgAD0AIAB7ACAAJABfAC4ATgBhAG0AZQAgAH0AIAB9ACwAIABAAHsATgBhAG0AZQAgAD0AIAAiAH" +
      "UAcwBlAGQARwBiACIAOwAgAEUAeABwAHIAIAA9ACAAewAgAFsAbQBhAHQAaABdADoAOgBSAG8AdQBuAGQAKAAkAF8ALgBVAHMAZQBkACAALwAgADEARwBCACwAIAAyACkAIAB9ACAAfQAsACAAQAB7AE4AYQBtAGUAIAA9ACAAIgBmAHIAZQBlA" +
      "EcAYgAiADsAIABFAHgAcAByACAAPQAgAHsAIABbAG0AYQB0AGgAXQA6ADoAUgBvAHUAbgBkACgAJABfAC4ARgByAGUAZQAgAC8AIAAxAEcAQgAsACAAMgApACAAfQAgAH0AIAB8ACAAQwBvAG4AdgBlAHIAdABUAG8ALQBDAHMAdgAgAHwAIABD" +
      "AG8AbgB2AGUAcgB0AEYAcgBvAG0ALQBDAHMAdgAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAANAAoAJABTAGUAcgBpAGEAbABOAHUAbQBiAGUAcgAgAD0AIABHAGUAdAAtAEMAaQB" +
      "tAEkAbgBzAHQAYQBuAGMAZQAgAHcAaQBuADMAMgBfAGIAaQBvAHMADQAKACQAQQBwAHAAbABpAGMAYQB0AGkAbwBuAHMAIAA9ACAARwBlAHQALQBJAHQAZQBtAFAAcgBvAHAAZQByAHQAeQAgAEgASwBMAE0AOgBcAFMAbwBmAHQAdwBhAHIAZQ" +
      "BcAE0AaQBjAHIAbwBzAG8AZgB0AFwAVwBpAG4AZABvAHcAcwBcAEMAdQByAHIAZQBuAHQAVgBlAHIAcwBpAG8AbgBcAFUAbgBpAG4AcwB0AGEAbABsAFwAKgAgAHwADQAKAFcAaABlAHIAZQAtAE8AYgBqAGUAYwB0ACAAewAgACQAXwAuAEQAa" +
      "QBzAHAAbABhAHkATgBhAG0AZQAgAC0AbgBlACAAJABuAHUAbABsACAAfQAgAHwADQAKAFMAZQBsAGUAYwB0AC0ATwBiAGoAZQBjAHQAIABAAHsATgBhAG0AZQAgAD0AIAAiAG4AYQBtAGUAIgA7ACAARQB4AHAAcgAgAD0AIAB7ACAAJABfAC4A" +
      "RABpAHMAcABsAGEAeQBOAGEAbQBlACAAfQAgAH0ALAAgAEAAewBOAGEAbQBlACAAPQAgACIAdgBlAHIAcwBpAG8AbgAiADsAIABFAHgAcAByACAAPQAgAHsAIAAkAF8ALgBEAGkAcwBwAGwAYQB5AFYAZQByAHMAaQBvAG4AIAB9ACAAfQAgACA" +
      "AIAAgACAAIAANAAoAJABNAGEAawBlAE0AbwBkAGUAbAAgAD0AIABHAGUAdAAtAEMAaQBtAEkAbgBzAHQAYQBuAGMAZQAgAFcAaQBuADMAMgBfAEMAbwBtAHAAdQB0AGUAcgBTAHkAcwB0AGUAbQBQAHIAbwBkAHUAYwB0AA0ACgANAAoAJABjAG" +
      "8AbQBwAHUAdABlAHIAUAByAG8AcABlAHIAdABpAGUAcwAgAD0AIABAAHsADQAKACAAIAAgACAAJwBuAGEAbQBlACcAIAAgACAAIAAgACAAIAAgACAAIAAgACAAPQAgACQASABvAHMAdABOAGEAbQBlAA0ACgAgACAAIAAgACcAbwBwAGUAcgBhA" +
      "HQAaQBuAGcAUwB5AHMAdABlAG0AJwAgAD0AIAAkAG8AcwBEAGUAdABhAGkAbABzAC4AQwBhAHAAdABpAG8AbgANAAoAIAAgACAAIAAnAGEAcgBjAGgAaQB0AGUAYwB0AHUAcgBlACcAIAAgACAAIAA9ACAAJABvAHMARABlAHQAYQBpAGwAcwAu" +
      "AE8AUwBBAHIAYwBoAGkAdABlAGMAdAB1AHIAZQANAAoAIAAgACAAIAAnAHMAZQByAGkAYQBsAE4AdQBtAGIAZQByACcAIAAgACAAIAA9ACAAJABzAGUAcgBpAGEAbABuAHUAbQBiAGUAcgAuAFMAZQByAGkAYQBsAE4AdQBtAGIAZQByAA0ACgA" +
      "gACAAIAAgACcAYQBwAHAAbABpAGMAYQB0AGkAbwBuAHMAJwAgACAAIAAgAD0AIAAkAEEAcABwAGwAaQBjAGEAdABpAG8AbgBzAA0ACgAgACAAIAAgACcAbQBhAGsAZQAnACAAIAAgACAAIAAgACAAIAAgACAAIAAgAD0AIAAkAG0AYQBrAGUAbQ" +
      "BvAGQAZQBsAC4AVgBlAG4AZABvAHIADQAKACAAIAAgACAAJwBtAG8AZABlAGwAJwAgACAAIAAgACAAIAAgACAAIAAgACAAPQAgACQAbQBhAGsAZQBtAG8AZABlAGwALgBWAGUAcgBzAGkAbwBuAA0ACgAgACAAIAAgACcAZABvAG0AYQBpAG4AJ" +
      "wAgACAAIAAgACAAIAAgACAAIAAgAD0AIAAkAGQAbwBtAGEAaQBuAA0ACgAgACAAIAAgACcAcwBlAHIAdgBpAGMAZQBzACcAIAAgACAAIAAgACAAIAAgAD0AIAAkAFMAZQByAHYAaQBjAGUAcwANAAoAIAAgACAAIAAnAGQAcgBpAHYAZQBzACcA" +
      "IAAgACAAIAAgACAAIAAgACAAIAA9ACAAJABEAHIAaQB2AGUAcwANAAoAIAAgACAAIAAnAHMAdABhAHQAdQBzACcAIAAgACAAIAAgACAAIAAgACAAIAA9ACAAIgBPAG4AbABpAG4AZQAiAA0ACgAgACAAIAAgACcAcAByAG8AYwBlAHMAcwBlAHM" +
      "AJwAgACAAIAAgACAAIAAgAD0AIAAkAHAAcgBvAGMAZQBzAHMAZQBzAA0ACgB9AA0ACgANAAoAJABjAG8AbQBwAHUAdABlAHIAUAByAG8AcABlAHIAdABpAGUAcwAgAHwAIABDAG8AbgB2AGUAcgB0AFQAbwAtAEoAcwBvAG4AIAAtAEMAbwBtAH" +
      "AAcgBlAHMAcwAgAA=="
    const { stdout, stderr } = await exec(`powershell -NoProfile -EncodedCommand ${encodedCommand}`);
    if (stderr) {
      throw new Error(stderr)
    }
    const encryptedPayload = cipher.encrypt(stdout)
    const dataToSend = {
      machineId: agentId,
      payload: encryptedPayload
    }
    const postToManagementNode = await axios.post(dataUpdateUrl, dataToSend)
    return
  } catch (error) {
    throw error
  }
}

async function jobRunner() {
  // sleep for randomised amount of seconds to prevent all agents hitting server at once. 10-30 seconds
  // const sleepSeconds = Math.floor(Math.random() * 20) + 10
  // logger.info(`starting job runner - sleeping for ${sleepSeconds} seconds`)
  await sleep(30000)
  try {
    // if jobInProgressLock is set to true, a job is already running, so this cron cycle needs to be skipped
    if (jobInProgressLock) {
      logger.info("Job already in progress, skipping this scheduled cycle")
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
      logger.info("no jobs to process")
      jobInProgressLock = false
      return
    }

    logger.info("found job to process")

    // parse response - if this fails, it could be due to an issue with the aes encryption
    const decryptedPayloadJson = JSON.parse(decryptedPayload)

    // save script to disk for execution
    fs.writeFileSync(`${decryptedPayloadJson.job.script._id}.ps1`, decryptedPayloadJson.job.script.scriptBody)

    // execute script and capture stdout + stderr
    const { stdout, stderr } = await exec(`powershell -ExecutionPolicy Bypass -NoProfile -File ${decryptedPayloadJson.job.script._id}.ps1`);
    // check if script failed or succeeded and build payload to send
    var output = {}
    if (stdout) {
      output = {
        status: "Success",
        output: stdout,
        jobId: decryptedPayloadJson.job._id
      }
    } else if (stderr) {
      output = {
        status: "Failed",
        output: stderr,
        jobId: jobId = decryptedPayloadJson.job._id
      }
    } else {
      //no stdout or stderr, job passed OK with no output
      output = {
        status: "Success",
        output: "No output from script",
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

    // delete script once execution has finished
    fs.unlinkSync(`${decryptedPayloadJson.job.script._id}.ps1`)

    // set jobInProgressLock to false, ready for next job
    jobInProgressLock = false
  } catch (error) {
    jobInProgressLock = false
    throw new Error(error)
  }
};

var dataUpdateCron = cron.schedule('*/1 * * * *', () => {
  dataUpdate()
    .then(() => {
      logger.info(`data update completed`)
    })
    .catch(error => {
      logger.error(`data update failed: ${error.message}`)
    });
}, {
    scheduled: false
  });

// Job runner
var jobRunnerCron = cron.schedule('*/1 * * * *', () => {
  jobRunner()
    .then(() => {
      logger.info(`job runner completed`)
    })
    .catch(error => {
      logger.error(`job runner failed: ${error.message}`)
    })
}, {
    scheduled: false
  });