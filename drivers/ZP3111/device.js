"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

//http://products.z-wavealliance.org/products/1572

class ZP3111 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("alarm_motion", "NOTIFICATION", {
      getParser: () => {
        return {
          "V1 Alarm Type": 0,
          "Notification Type": "Access Control",
          Event: 0,
        };
      },
      report: "NOTIFICATION_REPORT",
      reportParser: (report) => {
        if (report["Event (Parsed)"] === "Motion Detection, Unknown Location") {
          return true;
        }

        if (report["Event (Parsed)"] === "Event inactive") {
          return false;
        }

        return null;
      },
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
      reportParser: (report) =>
        report["Event (Parsed)"] === "Tampering, Product covering removed",
    });

    this.registerCapability("measure_temperature", "SENSOR_MULTILEVEL");

    this.registerCapability("measure_luminance", "SENSOR_MULTILEVEL", {
      get: "SENSOR_MULTILEVEL_GET",
      getParser: () => {
        return {
          "Sensor Type": "Luminance (version 1)",
          Properties1: {
            Scale: 0,
          },
        };
      },
      report: "SENSOR_MULTILEVEL_REPORT",
      reportParser: (report) =>
        report["Sensor Type"] !== "Luminance (version 1)"
          ? null
          : report["Sensor Value (Parsed)"],
    });

    this.registerCapability("measure_humidity", "SENSOR_MULTILEVEL");

    this.registerCapability("measure_battery", "BATTERY", {
        get: "BATTERY_GET",
        getOpts: {
          getOnStart: true,
          pollInterval: 7200
        },
        report: "BATTERY_REPORT",
        reportParser: (report) => {
          if (report["Battery Level"] === "battery low warning") return 1;
  
          return report["Battery Level (Raw)"][0];
        },
      });
  }
}

module.exports = ZP3111;
