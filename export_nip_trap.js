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
var NIP = require('../lib/NIP');             // gateway IP library
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

	exports.create = function(container, json_object_data){
		//console.log(id + time + value);
		//var json_object = { 'data': { 'timestamp': time, 'consumed': value} };
		//console.log(container,json_object.data.timestamp, json_object.data.consumed);
		pushData(container,json_object_data);
		//console.log(id+time+value);
		return 1;

	};


});

app.on('DEREGISTERED', function () {
  'use strict';
});

/* main --------------------------------------------------------------------- */
app.register();



