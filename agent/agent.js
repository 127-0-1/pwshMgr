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
const startUpUrl = process.env.MANAGEMENT_NODE + "/" + process.env.ID;
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/data-update/" + process.env.ID;
const handShakeUrl = process.env.MANAGEMENT_NODE + "/handshake"
const agentId = process.env.ID
const managementNode = process.env.MANAGEMENT_NODE
const apiKey = process.env.API_KEY

// load public key
const publicKeyString = fs.readFileSync('pubkey.pem', 'utf8')
const publicKey = new NodeRSA(publicKeyString)

// generate new aes key for this session
const aesKey = crypto.randomBytes(32).toString('hex');

var logger = new (winston.createLogger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'agent.log' })
  ]
});

async function startUp() {
  var dataToEncrpt = {
    id: agentId,
    aesKey: aesKey
  };
  var payloadJson = JSON.stringify(dataToEncrpt)
  const encryptedPayload = publicKey.encrypt(payloadJson, 'base64')
  var payloadToSend = {
    payload: encryptedPayload
  }
  const handshakeReturn = await axios.post(handShakeUrl, payloadToSend)
  console.log(handshakeReturn)

  // if (!(process.env.ID)) {
  //   throw new Error("no id found")
  // }
  // try {
  //   const data = await axios.get(startUpUrl)
  //   return data;
  // } catch (error) {
  //   throw new Error(error)
  // }
}

startUp()

// async function dataUpdate() {
//   logger.info((new Date) + " starting data update");
//   const { stdout, stderr } = await exec(`powershell -noprofile -file ${dateUpdateScript}`);
//   console.log(stderr)
//   scriptOutput = JSON.parse(stdout);
//   console.log(scriptOutput)
//   const headers = {
//     'api-key': apiKey
//   };
//   const postToManagementNode = await axios.post(dataUpdateUrl, scriptOutput, { headers });
// }

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

// startUp()
//   .then(data => {
//     dataUpdate();
//     logger.info((new Date) + " successful startup");
//   });

// // data update
// cron.schedule('*/5 * * * *', () => {
//   dataUpdate();
// });

// // // Job runner
// // cron.schedule('*/1 * * * *', () => {
// //   jobRunner();
// // });