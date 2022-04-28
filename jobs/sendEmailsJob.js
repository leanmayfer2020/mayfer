const campanas = require("../controllers/CampanasController");
let schedule = require("node-schedule");
const self = {};

self.sendEmailsToPotentialCustomer = schedule.scheduleJob("*/1 * * * *", function() {
  campanas.index();
});

module.exports = self;
