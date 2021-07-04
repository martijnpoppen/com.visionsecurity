"use strict";

const mainDevice = require("../main-device");

// http://manuals-backend.z-wave.info/make.php?lang=en&sku=ZS5101US-5&cert=ZC10-17015397
// https://products.z-wavealliance.org/ProductManual/File?folder=&filename=Manuals/2099/ZS%205101-5_V1_20160427.pdf

class ZS5101 extends mainDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    await this.checkCapabilities();

    this.registerCapability("alarm_contact", "BASIC");

    this.registerCapability("alarm_generic", "SENSOR_BINARY", {
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

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

    this.registerCapability('alarm_battery', 'BATTERY');
  }
}

module.exports = ZS5101;