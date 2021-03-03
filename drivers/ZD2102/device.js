"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

// http://www.pepper1.net/zwavedb/device/702
// http://www.pepper1.net/zwavedb/device/988

class ZD2102 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("alarm_contact", "BASIC");

    this.registerCapability("alarm_generic", "SENSOR_BINARY", {
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

    this.registerCapability("alarm_tamper", "SENSOR_ALARM");

    this.registerCapability("measure_battery", "BATTERY");
  }
}

module.exports = ZD2102;