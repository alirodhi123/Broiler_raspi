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


sc.on('relay1', (data) => {
  if(data.status){
   RELAY1.writeSync(0);
   console.log('Relay Lamp: ', data.status);
   updateRelay(RELAY_LAMP, true);
   createLogActivity(LOG_LAMP, 'Lamp Notification', 'Lamp is already running');
  }
  else{
   RELAY1.writeSync(1);
   console.log('Relay Lamp: ', data.status);
   updateRelay(RELAY_LAMP, false);
   createLogActivity(LOG_LAMP, 'Lamp Notification', 'Lamp is turned off');
  }
})

function updateRelay(url, status){
  var args = {
   data: { state: status }
  }

  client.post(url, args, function(data, response){
   console.log('Update relay success')
  })
}

function createLogActivity(url, title, message){
  var args = {
   data: { title: title, detail: message}
  }

  client.post(url, args, function(data, response){
  // console.log(response)
   console.log('Berhasil'+ message)
  })

}
