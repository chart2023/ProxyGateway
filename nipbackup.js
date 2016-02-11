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
var NIP = require('../lib/NIP');               // gateway IP library
var fetch_ieee1888=require("./fetch");
var openmtc = require('openmtc');
/* configuration ------------------------------------------------------------ */
/** configuration file for GSCL */
var nscl = openmtc.config_nscl.scl;

/** logging */
var logger = openmtc.config.log4js.getLogger('[nip]');

/** configuration of our app */
var config = {
  host: os.hostname(),
  port: '9810',
  notificationResource: '/notify',
  appId: 'NIPA_IEEE1888', // appID for this application
  maxNrOfInstances: 2,
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
  logger.info('%s -> %s', decodeURIComponent(containerId),
    util.inspect(data, false, null, false));

  if (containers.indexOf(containerId) === -1) {
    app.addContainer(containerId, {maxNrOfInstances: config.maxNrOfInstances})
      .on('STATUS_CREATED', function () {
        app.pushData(containerId, data);
        containers.push(containerId);
      });
  } else {
    app.pushData(containerId, data);
  }

//  app.findContainer(containerId)
//    .on('STATUS_OK', function () {
//      app.pushData(containerId, data);
//    })
//    .on('ERROR', function () {
//      app.addContainer(containerId, config.maxNrOfInstances)
//        .on('STATUS_CREATED', function () {
//          app.pushData(containerId, data);
//        });
//    });
}

function scanForDevices() {
  'use strict';
  logger.info('### start scan ###');
  exec('python scan.py | grep -e "^[[0-9:A-F]*] RSSI: [-[0-9]*]$" | sort',
    function (error, stdout, stderr) {
      if (error) {
        logger.error('###error in scan script###');
        logger.error('return code: ' + error.code);
        logger.error('kill signal: ' + error.signal);
        logger.error('std err: ' + stderr);

        setTimeout(scanForDevices, config.scanInterval);

        return;
      }

      var stdoutArray, i, tempArray, oldValue, count, sum;

      stdoutArray = stdout.split('\n');
      if (stdoutArray[stdoutArray.length - 1] === '') {
        stdoutArray.pop();
      }

      oldValue = '';
      count = 0;
      sum = 0;
      for (i = 0; i < stdoutArray.length; i += 1) {
        tempArray = stdoutArray[i].split(' ');
        if (tempArray[0].replace(/(\[|\])/gm, '') === oldValue) {
          sum += Number(tempArray[2].replace(/(\[|\])/gm, ''));
          count += 1;
        } else {
          if (count !== 0) {
            pushData(encodeURIComponent(oldValue), {
              Bluetooth: {
                RSSI: Math.round(sum / count)
              }
            });
          }
          oldValue = tempArray[0].replace(/(\[|\])/gm, '');
          count = 1;
          sum = Number(tempArray[2].replace(/(\[|\])/gm, ''));
        }
      }
      pushData(encodeURIComponent(oldValue), {
        Bluetooth: {
          RSSI: Math.round(sum / count)
        }
      });

      setTimeout(scanForDevices, config.scanInterval);
    });
}

app.on('REGISTERED', function () {
  'use strict';
  logger.info('app registered');
  setTimeout(scanForDevices, config.scanInterval);
});

app.on('DEREGISTERED', function () {
  'use strict';
});

/* main --------------------------------------------------------------------- */
app.register();





