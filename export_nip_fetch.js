/*
 *  module to manage IEEE1888
 */

/* external modules --------------------------------------------------------- */
var os = require('os');                         // os API from nodejs
var express = require('express');               // express web framework
var fs = require('fs');                         // filesystem module
var exec = require('child_process').exec;       // for running commands
var util = require('util');                     // helper module
var http = require('http');                     // http

/* internal modules --------------------------------------------------------- */
var NIP = require('/NIP');             // gateway IP library
var openmtc = require('openmtc');

/* configuration ------------------------------------------------------------ */
/** configuration file for NSCL */
var nscl = openmtc.config_nscl.scl;

/** logging */
var logger = openmtc.config_nscl.log4js.getLogger('[nip]');

/** configuration of our app */
var config = {
  host: os.hostname(),
  port: '9810',
  notificationResource: '/notify',
  appId: 'NIPA_IEEE1888', // appID for this application
  maxNrOfInstances: undefined,
  scanInterval: 50
};

/** contactURI used in subscription */
var contactURI = 'http://' + config.host + ':' + config.port +
  config.notificationResource;

/* variables ---------------------------------------------------------------- */
/** our ID */
var server = express();

/** the application */
var app = new NIP(config.appId);

var containers = [];

function pushData(containerId, data) {
  'use strict';
  //logger.info('%s -> %s', containerId,
    //util.inspect(data, false, null, false));

  if (containers.indexOf(containerId) === -1) {
    app.addContainer(containerId, {maxNrOfInstances: config.maxNrOfInstances})
      .on('STATUS_CREATED', function () {
	/* fs.appendFile(__dirname + "/create_nip_nscl", containerId + new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file! = create_nip_nscl');
		});*/
        app.pushData(containerId, data);
        containers.push(containerId);
      });
  } else {
	 /*fs.appendFile(__dirname + "/create_nip_nscl", containerId + new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file! = create_nip_nscl');
		});*/
    app.pushData(containerId, data);
  }
}
app.on('REGISTERED', function () {
  'use strict';
  //logger.info('app registered');

	exports.etsi = function(id, time, value){


		//console.log(id + time + value);
		var parseId = id.split('/');
		//console.log(parseId);
		//console.log(parseId);
		//var appId = parseId[2].replace(/\./g, '_');
		//console.log(appId);
		//var containerId = parseId.splice(parseId.length-2,parseId.length).join('_');//experimant
		var containerId = parseId.slice(parseId.length-6,parseId.length-1).join('_');//real
		//console.log(parseId.splice(6,parseId.length));
		//console.log(parseId.splice(6,parseId.length).join('_'));
		//var partsArray = id.split('/');
		//console.log(partsArray[partsArray.length-1])
		//var json_object = { 'data': { 'timestamp': time, 'consumed': value} };//experimant
		var json_object = {'pir': {'value': value}, 'timestamp': time };//real
		console.log(containerId, json_object);
		pushData(containerId,json_object);
	return 1;

};


});

app.on('DEREGISTERED', function () {
  'use strict';
});

/* main --------------------------------------------------------------------- */
app.register();



