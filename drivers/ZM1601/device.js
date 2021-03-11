"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

// Vision Security ZM1601 Battery Operated Siren
// http://www.pepper1.net/zwavedb/device/344

class ZM1601 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("onoff", "SWITCH_BINARY", {
      get: "SWITCH_BINARY_GET",
      set: "SWITCH_BINARY_SET",
      setParser: (value) => {
        return {
          "Switch Value": value > 0 ? 255 : 0,
        };
      },
      report: "SWITCH_BINARY_REPORT",
      reportParser: (report) => report["Value"] === "on/enable",
    });

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

    this.homey.flow
      .getActionCard("turn_alarm_on")
      .registerRunListener(async (args, state) => {
        return await args.device.setCapabilityValue("onoff", true);
      });

    this.homey.flow
      .getActionCard("turn_alarm_off")
      .registerRunListener(async (args, state) => {
        return await args.device.setCapabilityValue("onoff", false);
      });
  }
}

module.exports = ZM1601;
