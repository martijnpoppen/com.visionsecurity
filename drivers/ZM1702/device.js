"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

https://products.z-wavealliance.org/products/983

class ZM1702 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("locked", "DOOR_LOCK");
    this.registerCapability('locked', 'NOTIFICATION');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}

module.exports = ZM1702;
