"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

//http://products.z-wavealliance.org/products/703

class ZP3102 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("alarm_motion", "BASIC", {
      report: "BASIC_SET",
      reportParser: report => report["Value"] === 255,
    });

    // Newer firmware reports motion via NOTIFICATION (Home Security) instead of BASIC
    this.registerCapability("alarm_motion", "NOTIFICATION", {
      report: "NOTIFICATION_REPORT",
      reportParser: report => {
        if (report["Notification Type"] !== "Home Security") return null;

        if (report["Event"] === 7 || report["Event"] === 8) return true;

        if (report["Event"] === 0) {
          const param = report["Event Parameter"] && report["Event Parameter"][0];
          if (param === 7 || param === 8) return false;
        }

        return null;
      },
    });

    this.registerCapability("alarm_generic", "SENSOR_BINARY", {
      getOpts: {
        getOnOnline: true,
      },
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

    this.registerCapability("alarm_tamper", "NOTIFICATION", {
      getOpts: {
        getOnOnline: true,
      },
      getParser: () => ({
        "V1 Alarm Type": 0,
        "Notification Type": "Access Control",
        Event: 0,
      }),
      report: "NOTIFICATION_REPORT",
      reportParser: report => {
        if (report["Notification Type"] !== "Home Security") return null;

        if (report["Event"] === 3) return true;

        if (report["Event"] === 0) {
          const param = report["Event Parameter"] && report["Event Parameter"][0];
          if (param === 3 || !param) return false;
        }

        return null;
      },
    });

    this.registerCapability("measure_temperature", "SENSOR_MULTILEVEL");

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

module.exports = ZP3102;
