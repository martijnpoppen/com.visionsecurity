"use strict";

const { ManagerDrivers } = require("homey");
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

    this.registerCapability("onoff", "COMMAND_CLASS_SWITCH_BINARY", {
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

    this.registerCapability("measure_battery", "COMMAND_CLASS_BATTERY", {
      get: "BATTERY_GET",
      report: "BATTERY_REPORT",
      reportParser: (report) =>
        report["Battery Level"] === "battery low warning"
          ? 1
          : report["Battery Level (Raw)"][0],
    });

    this.homey.flow
      .getActionCard("turn_alarm_on")
      .registerRunListener(function (callback, args) {
        ManagerDrivers.getDriver("ZM1601").capabilities.onoff.set(
          args.device,
          true,
          function (err, data) {
            if (err) callback(err, false);
          }
        );
        callback(null, true);
      });

    this.homey.flow
      .getActionCard("turn_alarm_off")
      .registerRunListener(function (callback, args) {
        ManagerDrivers.getDriver("ZM1601").capabilities.onoff.set(
          args.device,
          false,
          function (err, data) {
            if (err) callback(err, false);
          }
        );
        callback(null, true);
      });
  }
}

module.exports = ZM1601;
