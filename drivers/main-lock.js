"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");
const { sleep, hexEncode, hexDecode } = require("../lib/helpers");

// https://products.z-wavealliance.org/products/983

class mainLock extends ZwaveDevice {
     // this method is called when the Device is inited
    async onNodeInit({ node }) {
        // enable debugging
        this.enableDebug();

        // print the node's info to the console
        this.printNode();

        await this.checkCapabilities();

        this.registerCapability('locked', 'DOOR_LOCK',  {
            get: 'DOOR_LOCK_OPERATION_GET',
            getOpts: {
            // TODO: We should not assume that `getOnOnline` is necessary/safe for all devices
            getOnOnline: true,
            },
            set: 'DOOR_LOCK_OPERATION_SET',
            setParser(value) {
            return {
                'Door Lock Mode': !value ? 'Door Unsecured' : 'Door Secured',
            };
            },
            report: 'DOOR_LOCK_OPERATION_REPORT',
            reportParser(report) {
            if (report && report.hasOwnProperty('Door Lock Mode')) {
                return report['Door Lock Mode'] === 'Door Secured';
            }
            return null;
            },
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

        await this.syncUserCode();

        this.setAvailable();
    }


    async onAdded() {
        await this.deleteAllCodes();
    }

    async onDeleted() {
        await this.deleteAllCodes();
    }
    
    async onSettings({ newSettings, changedKeys }) {
        if(!changedKeys.length) throw new Error('No changed settings found');

        this.homey.app.log(`[Device] ${this.getName()} - onSettings - changedKeys =>`, changedKeys, newSettings);
        this.setUnavailable('Updating User Codes');

        if(newSettings.reset_user_codes) {
            this.deleteAllCodes(true);
            return;
        } 

        let index = 1;
        for (const [key, value] of Object.entries(newSettings)) {
            if(changedKeys.includes(key)) {
                this.homey.app.log(`[Device] ${this.getName()} - Found user code =>`, key, value);
                if(value.length && value !== '0000000000') {
                    await this.updateUserCode(index, value, 'Set');
                } else {
                    await this.updateUserCode(index, '0000000000', 'Delete');
                }
                await sleep(2000);
            }
            index = index + 1;
        }

        this.setAvailable();
    }

    async updateUserCode(index, value, action) {
        try {
            this.homey.app.log(`[Device] ${this.getName()} - ${action} user code =>`, value);

            const tag = { tagId: (index), tagValue: hexEncode(`${value}`), createdOn: new Date(), tagType: -1 };
    
            const setCode = await this.node.CommandClass.COMMAND_CLASS_USER_CODE.USER_CODE_SET({
                'User Identifier': tag.tagId,
                USER_CODE: Buffer.from(tag.tagValue, 'hex'),
                ...(action === 'Delete' && {'User ID Status': Buffer.from('02', 'hex')}),
                ...(action === 'Set' && {'User ID Status': Buffer.from('01', 'hex')})
            });
            
            this.homey.app.log(`[Device] ${this.getName()} - Set user code RESULT: =>`, setCode);
        } catch (e) {
            this.homey.app.log(e)
        }
    }

    async syncUserCode() {
        try {
            const oldSettings = this.getSettings();
            let newSettings = {};

            this.setUnavailable('Syncing User Codes with Homey');

            for (let index = 1; index < 14;) {
                const code = await this.node.CommandClass.COMMAND_CLASS_USER_CODE.USER_CODE_GET({'User Identifier': (index)});

                if(code && code.USER_CODE && code['User ID Status'] !== 'Reserved by administrator') {
                    this.homey.app.log(`[Device] ${this.getName()} - Found user code =>`, code);
                    
                    const hexCode = code.USER_CODE.toString('hex');
                    newSettings[`user_code_${index}`] = hexDecode(`${hexCode}`);
                } else {
                    newSettings[`user_code_${index}`] = '0000000000';
                }
                
                this.homey.app.log(`[Device] ${this.getName()} - Set user code to settings =>`, `user_code_${index}`, newSettings[`user_code_${index}`]);

                index = index + 1;

                await sleep(1000);
            }

            this.homey.app.log(`[Device] ${this.getName()} - Updating settings =>`, newSettings);
            await this.setSettings({...oldSettings, ...newSettings});
        } catch (e) {
            this.homey.app.log(e)
        }
    }

    async deleteAllCodes(save = false) {
        try {
            this.homey.app.log(`[Device] ${this.getName()} - deleteAllCodes => save: `, save);
            const oldSettings = this.getSettings();
            let newSettings = {};

            for (let index = 1; index < 14;) {
                await this.updateUserCode(index, '0000000000', 'Delete');
                
                newSettings[`user_code_${index}`] = '0000000000';
                index = index + 1;
                await sleep(100);
            }

            if(save) {
                this.homey.app.log(`[Device] ${this.getName()} - Updating settings =>`, newSettings);
                await this.setSettings({...oldSettings, ...newSettings});
                this.setAvailable();
            }
        } catch (e) {
            this.homey.app.log(e)
        }
    }

    async checkCapabilities() {
        const driverManifest = this.driver.manifest;
        const driverCapabilities = driverManifest.capabilities;
        
        const deviceCapabilities = this.getCapabilities();

        this.homey.app.log(`[Device] ${this.getName()} - Found capabilities =>`, deviceCapabilities);
        
        if(driverCapabilities.length > deviceCapabilities.length) {      
            await this.updateCapabilities(driverCapabilities);
        }

        return deviceCapabilities;
    }

    async updateCapabilities(driverCapabilities) {
        this.homey.app.log(`[Device] ${this.getName()} - Add new capabilities =>`, driverCapabilities);
        try {
            driverCapabilities.forEach(c => {
                this.addCapability(c);
            });
            await sleep(2000);
        } catch (error) {
            this.homey.app.log(error)
        }
    }
}

module.exports = mainLock;
