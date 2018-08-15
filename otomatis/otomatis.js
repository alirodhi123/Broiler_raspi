var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var req = require('request');
var sleep = require('sleep');
var delay = require('delay');
var url = "http://192.168.43.140:3038/sensor";
//var url = "https://ali.jagopesan.com/sensor";

var gpio = require('onoff').Gpio;
var Client = require('node-rest-client').Client;
var client = new Client();

//declare pin relay
var RELAY1 = new gpio(4, 'out');
var RELAY2 = new gpio(17, 'out');
var RELAY3 = new gpio(27, 'out');
var RELAY4 = new gpio(22, 'out');

//declare  base URL API
var ID_USER = '5b2cc36cadbf751d34d76a67';
//var BASE_URL = 'https://ali.jagopesan.com/';
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
var RELAY_SENSOR = BASE_URL+"relay/update-relay/sensor";
var BASE_RELAY_STATE = BASE_URL+"relay/get-relay/state";

//delcare relay first to off
RELAY1.writeSync(0)
RELAY2.writeSync(0)
RELAY3.writeSync(0)
RELAY4.writeSync(0)

var angka = 0

var serialPort = new SerialPort('/dev/ttyUSB0', {
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

var isReadyOpen = false

var parser = new Readline();
serialPort.pipe(parser);
parser.on('data', async (data) => {
 if(isReadyOpen){
  let sensor = data.split('#');
  let dataSensor = sensor.slice(5, 9) 
  let nativeJson = '{'
  for(let i = 0 ; i<dataSensor.length ; i++) {
    let piece = dataSensor[i].split(":")
	if(i < dataSensor.length - 1)
	  nativeJson += '"'+piece[0]+'":'+'"'+piece[1]+'",'
	else 
	  nativeJson += '"'+piece[0]+'":'+'"'+piece[1]+'"}'
  }

  let dataJSON = JSON.parse(nativeJson)
  if(angka >= 3){
    console.log(dataJSON)
	var tempVal = dataJSON.TCA
	var humVal = dataJSON.HUMA
	var cdioksidaVal = dataJSON.CO2
	var ammoniaVal = dataJSON.NH3

	//Logika IF ELSE
	if (tempVal < 32) {
	  RELAY1.writeSync(1)
          updateRelay(RELAY_LAMP, true)
         // createLogActivity(LOG_LAMP, 'Lamp On', 'Lamp is turned on')

          RELAY2.writeSync(0)
          updateRelay(RELAY_FAN, false)
         // createLogActivity(LOG_FAN, 'Lamp Off', 'Lamp is turned off')

	  RELAY4.writeSync(0)
          if (humVal > 70){
            RELAY1.writeSync(1)
           // updateRelay(RELAY_LAMP, true)
           // createLogActivity(LOG_LAMP, 'Lamp On', 'Lamp is turned on')
          }
	} //tutup if temp < 32

        else if (tempVal >= 32 && tempVal <= 34){
          RELAY1.writeSync(1)
          updateRelay(RELAY_LAMP, true)
         // createLogActivity(LOG_LAMP, 'Lamp Off', 'Lamp is turnerd off')

         // RELAY4.writeSync(1)
         // updateRelay(RELAY_FAN, true)

          if (humVal >= 50 && humVal <= 70){
            RELAY2.writeSync(0)
            updateRelay(RELAY_FAN, false)
           // createLogActivity(LOG_FAN, 'Fan Off', 'Fan is turned off')
          } 
        } //tutup if temp normal

        else if (tempVal > 34){
          RELAY2.writeSync(1)
          updateRelay(RELAY_FAN, true)
         // createLogActivity(LOG_FAN, 'Fan On', 'Fan is turned on')

          RELAY4.writeSync(1)
          updateRelay(RELAY_EXHAUST, true)

          RELAY1.writeSync(0)
         // updateRelay(RELAY_LAMP, false)
         // createLogActivity(LOG_LAMP, 'Fan Off', 'Fan is turned off')

          if (humVal < 50){
            RELAY2.writeSync(1)
            updateRelay(RELAY_FAN, true)
           // createLogActivity(LOG_FAN, 'Fan On', 'Fan is turned on')

            RELAY1.writeSync(0)
            updateRelay(RELAY_LAMP, false)
           // createLogActivity(LOG_LAMP, 'Lamp Off', 'Lamp is turned off')
          }
        } //tutup temp > 34

        if (cdioksidaVal > 2500){
          RELAY4.writeSync(1)
          updateRelay(RELAY_EXHAUST, true)
          createLogActivity(LOG_EXHAUST, 'Exhaust On', 'Exhaust is turned on')
        }//tutup cdioksida > 2500

        if (ammoniaVal > 20){
          RELAY3.writeSync(1)
          updateRelay(RELAY_SPRAY, true)
          createLogActivity(LOG_SPRAY, 'Spray On', 'Spray is turned on')
        } else {
          RELAY3.writeSync(0)
          updateRelay(RELAY_SPRAY, false)
        //  createLogActivity(LOG_SPRAY, 'Spray Off', 'Spray is turned off')
        } // tutup ammonia > 20

    //Kirim data ke server

	var datasensor = {'TCA': dataJSON.TCA, 'HUMA': dataJSON.HUMA, 'CO2': dataJSON.CO2, 'NH3': dataJSON.NH3};
	
	req.post({url: url, form: datasensor}, function(err, rst, body){
	  if(err) return console.log(err);
		console.log("data terkirim");
	  })
	  angka = 0
  }// tutup if angka >= 3
  else{
    angka++;
  }
 }// tutup if isreadyopen

 if(!isReadyOpen){
   isReadyOpen = true
 } // tutup if !isreadyopen

}); //tutup parser.on

serialPort.on('open', function () {
  console.log("Oper port..")
});

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

