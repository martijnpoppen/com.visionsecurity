"use strict";

const Homey = require("homey");

class App extends Homey.App {
  log() {
    console.log.bind(this, "[log]").apply(this, arguments);

    if (this.appSettings && this.appSettings.SET_DEBUG) {
      return log.info.apply(log, arguments);
    }
  }

  error() {
    console.error.bind(this, "[error]").apply(this, arguments);

    if (this.appSettings && this.appSettings.SET_DEBUG) {
      return log.info.apply(log, arguments);
    }
  }

  // -------------------- INIT ----------------------

  async onInit() {
    this.log(`${Homey.manifest.id} - ${Homey.manifest.version} started...`);
  }
}

module.exports = App;
