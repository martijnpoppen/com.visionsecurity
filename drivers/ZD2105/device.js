"use strict";

const mainDevice = require("../main-device");

// Vision ZD2105 / ZD2105US-5 — Z-Wave Plus recessed door/window sensor.
// Reports via NOTIFICATION (Access Control = contact, Home Security = tamper)
// and may also fire BASIC_SET. It does NOT expose SENSOR_BINARY / SENSOR_ALARM.

class ZD2105 extends mainDevice {
  async onNodeInit({ node }) {
    this.enableDebug();
    this.printNode();

    await this.checkCapabilities();

    // Contact via Notification CC (Access Control: 22 open / 23 close)
    this.registerCapability("alarm_contact", "NOTIFICATION");

    // Tamper via Notification CC (Home Security: event 3 cover removed)
    this.registerCapability("alarm_tamper", "NOTIFICATION");

    // Fallback: some units signal contact with BASIC_SET (the OpenZWave "SetAsReport" quirk)
    if (node.CommandClass.COMMAND_CLASS_BASIC) {
      this.registerReportListener("BASIC", "BASIC_SET", (rawReport, report) => {
        const v = report?.Value ?? rawReport?.Value;
        if (v === undefined) return;
        this.setCapabilityValue("alarm_contact", v === 255).catch(this.error);
      });
    }

    this.registerCapability("measure_battery", "BATTERY", {
      get: "BATTERY_GET",
      getOpts: {
        getOnStart: false,  // battery node is asleep at app start — don't GET
        getOnOnline: true,  // GET on wake instead
        pollInterval: 3600000,
      },
      report: "BATTERY_REPORT",
      reportParser: (report) => {
        if (report["Battery Level"] === "battery low warning") return 1;
        return report["Battery Level (Raw)"][0];
      },
    });
  }
}

module.exports = ZD2105;