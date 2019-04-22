require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const axios = require("axios");
const cron = require('node-cron');
const winston = require('winston');
const scriptPath = path.join(__dirname, './scripts/data_update.ps1');
const startUpUrl = process.env.MANAGEMENT_NODE + "/api/machines/" + process.env.ID;
const alertPoliciesUrl = process.env.MANAGEMENT_NODE + "/api/alertPolicies/machine/" + process.env.ID;
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/api/machines/agent/" + process.env.ID;
const agentId = process.env.ID
const managementNode = process.env.MANAGEMENT_NODE

var logger = new(winston.createLogger)({
  transports: [
      new(winston.transports.Console)(),
      new(winston.transports.File)({filename: 'agent.log'})
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

startUp()
  .then(data => {
    logger.info((new Date) + " successful startup");
  })

async function dataUpdate() {
  logger.info((new Date) + " starting data update");
  const headers = {
    'api-key': process.env.API_KEY
  };
  const alertPolicies = await axios.get(alertPoliciesUrl, { headers });
  const { stdout, stderr } = await exec(`powershell -file ${scriptPath} -AlertPolicies "${alertPolicies.data}"`);
  scriptOutput = JSON.parse(stdout);
  const postToManagementNode = await axios.post(dataUpdateUrl, scriptOutput, { headers });
}

// data update
cron.schedule('*/1 * * * *', () => {
  dataUpdate();
});