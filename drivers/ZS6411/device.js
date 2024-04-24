"use strict";

const mainDevice = require("../main-device");

class ZS6411 extends mainDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    await this.checkCapabilities();

    // register the alarm_fire capability with COMMAND_CLASS_NOTIFICATION
    this.registerCapability('alarm_fire', 'NOTIFICATION');

    // register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION
    this.registerCapability('alarm_tamper', 'NOTIFICATION');

    this.registerCapability("measure_battery", "BATTERY", {
        get: "BATTERY_GET",
        getOpts: {
          getOnStart: true,
          getOnOnline: true,
          pollInterval: 3600000
        },
        report: "BATTERY_REPORT",
        reportParser: (report) => {
          if (report["Battery Level"] === "battery low warning") return 1;
  
          return report["Battery Level (Raw)"][0];
        },
    });

    this.registerCapability('alarm_battery', 'BATTERY');
  }
}

module.exports = ZS6411;