var io = require('socket.io-client');
var exec = require('child_process');
var gpio = require('onoff').Gpio;
var Client = require('node-rest-client').Client;
var client = new Client();

var sc = io.connect('http://192.168.43.140:3038');

//declare pin relay
var RELAY1 = new gpio(4, 'out');
var RELAY2 = new gpio(17, 'out');
var RELAY3 = new gpio(27, 'out');
var RELAY4 = new gpio(22, 'out');

//declare  base URL API
var ID_USER = '5b02dc72584ab60f90b5076b';
var BASE_URL = 'http://192.168.43.140:3038/';

//declare base URL Log
var LOG_LAMP = BASE_URL+"log/log-lamp";
var LOG_FAN = BASE_URL+"log/log-fan";
var LOG_SPRAY = BASE_URL+"log/log-spray";
var LOG_EXHAUST = BASE_URL+"log/log-exhaust";

//declare base URL Relay
var RELAY_LAMP = BASE_URL+"relay/update-relay/lamp";
var RELAY_FAN = BASE_URL+"relay/update-relay/fan";
var RELAY_SPRAY = BASE_URL+"relay/update-relay/spray";
var RELAY_EXHAUST = BASE_URL+"relay/update-relay/exhaust";
var BASE_RELAY_STATE = BASE_URL+"relay/get-relay/state";

//setup relay state
getRelayState(BASE_RELAY_STATE)

sc.on('relay1', (data) => {
  if(data.status){
   RELAY1.writeSync(0);
   console.log('Relay Lamp: ', data.status);
   updateRelay(RELAY_LAMP, true);
   createLogActivity(LOG_LAMP, 'Lamp Notification', 'Lamp is turned on');
  }
  else{
   RELAY1.writeSync(1);
   console.log('Relay Lamp: ', data.status);
   updateRelay(RELAY_LAMP, false);
   createLogActivity(LOG_LAMP, 'Lamp Notification', 'Lamp is turned off');
  }
})

sc.on('relay2', (data) => {
  if(data.status){
   RELAY2.writeSync(0);
   console.log('Relay Fan: ', data.status);
   updateRelay(RELAY_FAN, false);
   createLogActivity(LOG_FAN, 'Fan Notification', 'Fan is turned on'); 
  }
  else{
   RELAY2.writeSync(1);
   console.log('Relay Fan: ', data.status);
   updateRelay(RELAY_FAN, false);
   createLogActivity(LOG_FAN, 'Fan Notofication', 'Fan is turned off');
  }
})

sc.on('relay3', (data) => {
  if(data.status){
   RELAY3.writeSync(0);
   console.log('Relay Spray: ', data.status);
   updateRelay(RELAY_SPRAY, true);
   createLogActivity(LOG_SPRAY, 'Spray Notification', 'Spray is turned on');
  }
  else{
   RELAY3.writeSync(1);
   console.log('Relay Spray: ', data.status);
   updateRelay(RELAY_SPRAY, false);
   createLogActivity(LOG_SPRAY, 'Spray Notification', 'Spray is turned off');
  }
})

sc.on('relay4', (data) => {
  if(data.status){
   RELAY4.writeSync(0);
   console.log('Relay Exhaust: ', data.status);
   updateRelay(RELAY_EXHAUST, true);
   createLogActivity(LOG_EXHAUST, 'Exhaust Notification', 'Exhaust is turned on');
  }
  else{
   RELAY4.writeSync(1);
   console.log('Relay Exhaust: ', data.status);
   updateRelay(RELAY_EXHAUST, false);
   createLogActivity(LOG_EXHAUST, 'Exhaust Notification', 'Exhaust is turned off');
  }
})

function updateRelay(url, status){
  var args = {
   data: {
     state: status
   },
   headers: {
     "Content-Type": "application/json"
   }
  }

  client.post(url, args, function(data, response){
   console.log('Update relay success')
  })
}

function createLogActivity(url, title, message){
  var args = {
   data: {
     title: title,
     keterangan: message
   },
   headers: {
     "Content-Type": "application/json"
   }
  }

  client.post(url, args, function(data, response){
  // console.log(response)
   console.log(message)
  })
}

function getRelayState(url){
  var args = {
   headers: {
    "Content-Type": "application/json"
   }
  }

  client.get(url, args, function(data, response){
   console.log("State relay data ", data)
   if(data.lamp){
    RELAY1.writeSync(1);
   } 
   else{
    RELAY1.writeSync(0);
   }

   if(data.fan){
    RELAY2.writeSync(1);
   }
   else{
    RELAY2.writeSync(0);
   }

   if(data.spray){
    RELAY3.writeSync(1);
   }
   else{
    RELAY3.writeSync(0);
   }

   if(data.exhaust){
    RELAY4.writeSync(1);
   }
   else{
    RELAY4.writeSync(0);
   }
  })
}
