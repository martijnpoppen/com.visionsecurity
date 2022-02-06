"use strict";

const mainDevice = require("../main-device");

// http://www.pepper1.net/zwavedb/device/702
// http://www.pepper1.net/zwavedb/device/988

class ZD2102_5 extends mainDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    const settings = this.getSettings();
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    await this.checkCapabilities();

    this.registerCapability("alarm_contact", "NOTIFICATION");

    this.registerCapability("alarm_tamper", "NOTIFICATION");

    this.registerCapability("measure_battery", "BATTERY", {
        get: "BATTERY_GET",
        getOpts: {
          getOnStart: true,
          pollInterval: 3600000
        },
        report: "BATTERY_REPORT",
        reportParser: (report) => {
          if (report["Battery Level"] === "battery low warning") return 1;
  
          return report["Battery Level (Raw)"][0];
        },
      });
  }
}

module.exports = ZD2102_5;