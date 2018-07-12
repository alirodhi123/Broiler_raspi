var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var io = require('socket.io-client');
var sc = io.connect('nama alamat url');
var req = require('request');
var sleep = require('sleep');
var delay = require('delay');
var url = "http://192.168.43.140:3038/sensor";

var tempCache = 0;
var humCache = 0;
var cdioksidaCache = 0;
var ammoniaCache = 0;
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

		var datasensor = {'TCA': dataJSON.TCA, 'HUMA': dataJSON.HUMA, 'CO2': dataJSON.CO2, 'NH3': dataJSON.NH3, 'BAT': dataJSON.BAT};
	
		req.post({url: url, form: datasensor}, function(err, rst, body){
			if(err) return console.log(err);
			console.log("data terkirim");
		})
			angka = 0
                }// tutup if
		else{
			angka++;
		}
	}
	if(!isReadyOpen){
		isReadyOpen = true
	}

});

serialPort.on('open', function () {
  console.log("Oper port..")
});

