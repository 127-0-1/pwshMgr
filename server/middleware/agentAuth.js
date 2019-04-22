const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Machine = require('../models/machine');

module.exports = async (req, res, next) => {
  try {
    console.log(req.header('api-key'))
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