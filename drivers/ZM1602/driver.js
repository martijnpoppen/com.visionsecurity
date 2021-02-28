"use strict";

const { ManagerFlows, ManagerDrivers } = require("homey");
const { ZwaveDevice } = require("homey-zwavedriver");

// Vision Security ZM1602 DC/AC Power Siren
// http://www.pepper1.net/zwavedb/device/525

class ZM1602 extends ZwaveDevice {
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

    // //   siren_strobe_mode
    // await this.configurationSet({ index: 1, size: 1 }, 10);
    // //   alarm_auto_stop
    // await this.configurationSet({ index: 2, size: 1 }, 10);


    ManagerFlows.on("action.turn_alarm_on", function (callback, args) {
      ManagerDrivers.getDriver("ZM1602").capabilities.onoff.set(
        args.device,
        true,
        function (err, data) {
          if (err) callback(err, false);
        }
      );

      callback(null, true);
    });

    ManagerFlows.on("action.turn_alarm_off", function (callback, args) {
      ManagerDrivers.getDriver("ZM1602").capabilities.onoff.set(
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

module.exports = ZM1602;