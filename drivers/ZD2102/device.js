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

    this.registerCapability("alarm_contact", "BASIC", {
      report: "BASIC_SET",
      reportParser: report => report["Value"] === 255,
    });

    this.registerCapability("alarm_generic", "SENSOR_BINARY", {
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

    this.registerCapability("alarm_tamper", "NOTIFICATION", {
      optional: true,
      get: "SENSOR_ALARM_GET",
      getParser: () => ({
        "Sensor Type": "General Purpose Alarm",
      }),
      report: "SENSOR_ALARM_REPORT",
      reportParser: report =>
        report && report.hasOwnProperty("Sensor State")
          ? report["Sensor State"] === "alarm"
          : null,
    });

    this.registerCapability("measure_battery", "BATTERY", {
      get: "BATTERY_GET",
      getOpts: {
        getOnOnline: true,
      },
      report: "BATTERY_REPORT",
      reportParser: report => {
        if (report["Battery Level"] === "battery low warning") return 1;

        if (report.hasOwnProperty("Battery Level (Raw)")) {
          return report["Battery Level (Raw)"][0];
        }

        return null;
      },
    });
  }
}

module.exports = ZD2102;