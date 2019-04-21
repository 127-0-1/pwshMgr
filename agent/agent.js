require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const axios = require("axios");
const cron = require('node-cron');
const winston = require('winston');
const scriptPath = path.join(__dirname, './scripts/data_update.ps1');
const connectionScriptPath = path.join(__dirname, './scripts/connection.ps1');
const alertPoliciesUrl = process.env.MANAGEMENT_NODE + "/api/alertPolicies/machine/" + process.env.ID;
const dataUpdateUrl = process.env.MANAGEMENT_NODE + "/api/machines/agent/" + process.env.ID;

if (!(process.env.ID)) {
  throw "no id found"
}

axios.get(process.env.MANAGEMENT_NODE + "/api/machines/" + process.env.ID)
  .then(response => {

  })
  .catch(error => {
    console.log(error)
    throw "machine not found"
  });

async function dataUpdate() {
  const headers = {
    'Api-Key': process.env.API_KEY
  };
  const alertPolicies = await axios.get(alertPoliciesUrl, { headers });
  console.log(alertPolicies.data)
  // const { stdout, stderr } = await exec(`powershell -file ${scriptPath} -AlertPolicies "${alertPolicies.data}"`);
  // scriptOutput = JSON.parse(stdout);
  // const postToManagementNode = await axios.post(dataUpdateUrl, scriptOutput);
}

dataUpdate();

// // data update
// cron.schedule('*/1 * * * *', () => {
//   testAlertPolicies();
// });