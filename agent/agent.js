require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const axios = require("axios");
const cron = require('node-cron');
const winston = require('winston');
const dateUpdateScript = path.join(__dirname, './scripts/data_update.ps1');
const jobRunnerScript = path.join(__dirname, './scripts/job_runner.ps1');
const startUpUrl = process.env.MANAGEMENT_NODE + "/" + process.env.ID;
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/data-update/" + process.env.ID;
const agentId = process.env.ID
const managementNode = process.env.MANAGEMENT_NODE
const apiKey = process.env.API_KEY

var logger = new (winston.createLogger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'agent.log' })
  ]
});

async function startUp() {
  if (!(process.env.ID)) {
    throw new Error("no id found")
  }
  try {
    const data = await axios.get(startUpUrl)
    return data;
  } catch (error) {
    throw new Error(error)
  }
}

async function dataUpdate() {
  logger.info((new Date) + " starting data update");
  const { stdout, stderr } = await exec(`powershell -file ${dateUpdateScript} -ApiKey "${apiKey}" -ManagementNode "${managementNode}" -MachineID ${agentId}`);
  console.log(stderr)
  scriptOutput = JSON.parse(stdout);
  console.log(scriptOutput)
  const headers = {
    'api-key': apiKey
  };
  const postToManagementNode = await axios.post(dataUpdateUrl, scriptOutput, { headers });
}

async function jobRunner() {
  logger.info((new Date) + " starting job runner");
  const { stdout, stderr } = await exec(`powershell -file ${jobRunnerScript} -ApiKey "${apiKey}" -ManagementNode "${managementNode}" -MachineID ${agentId}`);
  if (stdout) {
    logger.info((new Date) + " " + stdout);
  }
  if (stderr) {
    logger.info((new Date) + " " + stderr)
  }
};

startUp()
  .then(data => {
    dataUpdate();
    logger.info((new Date) + " successful startup");
  });

// data update
cron.schedule('*/5 * * * *', () => {
  dataUpdate();
});

// // Job runner
// cron.schedule('*/1 * * * *', () => {
//   jobRunner();
// });