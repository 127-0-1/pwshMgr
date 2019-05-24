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
var aes256 = require('aes256');
const dateUpdateScript = path.join(__dirname, './scripts/data_update.ps1');
const jobRunnerScript = path.join(__dirname, './scripts/job_runner.ps1');
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/data-update"
const handShakeUrl = process.env.MANAGEMENT_NODE + "/handshake"
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

// generate AES session key
const aesKey = crypto.randomBytes(32).toString('hex')

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
      var cipher = aes256.createCipher(aesKey);
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
  const { stdout, stderr } = await exec(`powershell -NoProfile -File ${dateUpdateScript}`);
  var cipher = aes256.createCipher(aesKey)
  const encryptedPayload = cipher.encrypt(stdout)
  const dataToSend = {
    machineId: agentId,
    payload: encryptedPayload
  }
  const postToManagementNode = await axios.post(dataUpdateUrl, dataToSend);
}

// async function jobRunner() {
//   logger.info((new Date) + " starting job runner");
//   const { stdout, stderr } = await exec(`powershell -file ${jobRunnerScript} -ApiKey "${apiKey}" -ManagementNode "${managementNode}" -MachineID ${agentId}`);
//   if (stdout) {
//     logger.info((new Date) + " " + stdout);
//   }
//   if (stderr) {
//     logger.info((new Date) + " " + stderr)
//   }
// };

// // data update
// cron.schedule('*/5 * * * *', () => {
//   dataUpdate();
// });

// // // Job runner
// // cron.schedule('*/1 * * * *', () => {
// //   jobRunner();
// // });