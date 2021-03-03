# Vision Security devices for Homey

&nbsp;
## Donation
If this project help you reduce time to develop, you can give me a cup of coffee :) 

[![paypal](https://www.paypalobjects.com/en_US/NL/i/btn/btn_donateCC_LG.gif)](https://paypal.me/martijnpoppen)

&nbsp;

---

## Supported Devices
* ZD2102 Door/window sensor
* ZP3111 4in1 sensor
* ZP3102 PIR motion sensor
* ZG8101 Garage door sensor
* ZM1601 Battery Operated Siren
* ZM1602 DC/AC Power Siren

---

## Revision History

### V2.0.0
* Updated to SDK 3 - Homey v5 support - New Developer (Martijn Poppen)

### V1.4.8
* ZP3102  Tamper Motion and Binary contact split 

### V1.4.7
* ZG8101  Extra input split

### V1.4.6
* ZM1602 addod to flow actions

### V1.4.4
* ZM8101 Added Product ID and Product Type ID

### V1.4.2
* ZM1602 Added Product ID and Product Type ID

### V1.4.1
* ZD2102 Tamper alarm set to optional

### V1.4.0
* 2 versions of ZP3102 available now  (ald and new had different command classes)
* Added some product ID's for ZP3102
* Added some product ID's for ZD2102

---

### ZD2102 Door/window sensor
    - STATUS UNKOWN
### ZP3111 4in1 sensor
    - STATUS UNKOWN
### ZP3102 PIR motion sensor
    - STATUS: IN TEST
    - TO DO: Fix generic alarm & alarm_tamper (found by @joenoo)
### ZG8101 Garage door sensor
    - STATUS: WORKING
### ZM1601 Battery Operated Siren
    - STATUS: IN TEST
    - TO DO: fix Turn siren on/off vs on/off
    - Settings not working - siren strobe - light is not blinking
    - Battery monitor not working? (found by @heronimus & @peter_peter )
### ZM1602 DC/AC Power Siren
    - STATUS: IN TEST
    - TO DO: fix Turn siren on/off vs on/off (found by @kietu)
    - Settings are working? 