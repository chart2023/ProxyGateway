"use strict";

/* external modules */
// http API from nodejs
var http = require('http');
// os API from nodejs
var os = require('os');
// express web framework
var express = require('express');
// fs
var fs = require('fs');
var Lazy = require("lazy");
var moment = require('moment');
/* internal modules */
// provides dIa primitives
var openmtc = require('openmtc');
var XIA = openmtc.interfaces.xIa;
// maps primitives to http
var HttpClient = openmtc.transport.http.client;

// configuration file for gscl
var gscl = openmtc.config_gscl.scl;

// logging
var logger = openmtc.config_gscl.log4js.getLogger('[nip]');

var config = {
  host: '161.200.90.85',
  //host: '161.200.90.70',
  port: '1000',
  notificationResource: '/notify',
  appID: 'nip'
};

/* we want to subscribe for data from container in application below */
//var targetApplicationID = 'NIPA_IEEE1888';
var targetApplicationID = 'GIPA_XB';
//var targetApplicationID = 'SmartMeter';
/* contactURI used in subscription */
var contactURI = 'http://' + config.host + ':' + config.port;
var sys = require('sys');
var console = require('console');

/* express */
var app = express();

var gscls = {};

var export_write = require('./export_write');

/* express configuration */
app.configure(function () {
  'use strict';
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'verysecret'
  }));
  app.use(express.methodOverride());
});

/* web server (dIa) */
var dIaServer = http.createServer(app);
dIaServer.listen(config.port);

/* event channel */
var eventChannel = require('socket.io').listen(dIaServer);

eventChannel.sockets.on('connection', function (socket) {
  'use strict';
  logger.info('socket browser connected');
  socket.on('echo', function (echo_data) {
    logger.info('Echo data: ' + echo_data);
    eventChannel.sockets.emit('echo-back', 'this is from server-' + echo_data);
  });
});

//some helper methods to decode contentInstance data
function parseB64Json(s) {
  logger.info("Parsing: " + s + " - " + new Buffer(s, 'base64').toString('utf8'));
  return JSON.parse(new Buffer(s, 'base64').toString('utf8'));
}

function getRepresentation(o) {
  //console.log("GetRepresentation");
  //console.log(o);
  if (o.representation.contentType !== 'application/json') {
    logger.error('no json.');
    throw new Exception("no json");
  }
  return JSON.parse(new Buffer(o.representation.$t, 'base64').toString('utf8'));
}

function getNotificationData(req) {
    //console.log("getNotificationData: ");
    //console.log(req.body);
	return getRepresentation(req.body.notify);
}

//create client for dIa interface
//generic communication module
var httpClient = new HttpClient(config);

//dIa interface
var dIaClient = new XIA(gscl.uri, httpClient, 'dIa');


function handleContent(gscl, container, content, res) {
	//console.log(content.data.consumed);
	//eventChannel.sockets.emit('data', container);
	//console.log(container.id, content.data.timestamp, content.data.consumed);
	//real
	var parseId = container.id.split('_');
	//var fiap_id_prefix 	= "http://bems.ee.eng.chula.ac.th/eng4/fl13/";   
	var fiap_id_prefix 	= "http://napat.test.chula.ac.th/NIP_IEEE1888/";     
	var pointset = fiap_id_prefix+parseId[0]+'/'+parseId.slice(1,parseId.length-3).join('_')+'/'+parseId.slice(parseId.length-3,parseId.length-1).join('/')
	var pir_point_id = pointset + '/' + 'monitor/pir';	
	var ill_point_id = pointset + '/' + 'monitor/illuminance';
	var temp_point_id = pointset + '/' + 'monitor/temperature';
	var hum_point_id = pointset + '/' + 'monitor/humidity';       	
	var time=moment().format();
	//console.log(Object.keys(frame.analogSamples).length);
	if(content.temperature!==undefined){		
		var fiap_element = [  
		 [pir_point_id, content.pir.value, time],
		 [ill_point_id, content.illuminance.value, time],
		 [temp_point_id, content.temperature.value, time],
		 [hum_point_id, content.humidity.value, time]
		];
	}else{
		var fiap_element = [[pir_point_id, content.pir.value, time]];			
	}
 
	console.log(pointset);
	//console.log(point, content.pir.value);
	res.send(200);
	export_write.write(pointset, fiap_element);	
	console.log("Handled content");

	/*var parseId = container.id.split('_');
	//var containerId = parseId.splice(parseId.length-2,parseId.length).join('/')
  	var containerId_1 = parseId[0];
	var containerId_2 = parseId[1];      
			 /*fs.appendFile(__dirname + "/notify_ok_nip_gscl", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		 		 if (err) throw err;
		 		 console.log('The "data to append" was appended to file!: notify_ok_nip_gscl');
		});
	res.send(200);
	console.log(containerId_1+'_'+containerId_2+'_'+content.data.consumed);
	export_write.write(containerId_1, containerId_2, content.data.consumed);
	console.log("Handled content");*/

}
function handleContainer(gscl, container) {
	if (gscl.containers[container.id] !== undefined) {
		console.log("Container " + container.id + " of " + gscl.sclId + " is known.");
		return;
	}

	console.log("Handling new container " + container.id + " of " + gscl.sclId);

	container.data = [];
	container.containerId = container.id;
	container.sclId = gscl.sclId;

	gscl.containers[container.id] = container;


	var notifyPath = config.notificationResource + "/" + gscl.sclId + "/" + container.id;
   	var notifyUri = contactURI + notifyPath;

	app.post(notifyPath, function(req, res) {

		/* fs.appendFile(__dirname + "/notify_nip_gscl", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		 		 if (err) throw err;
		  		console.log('The "data to append" was appended to file!: notify_nip_gscl');
		});*/
		var representation = getNotificationData(req);
		handleContent(gscl, container, representation, res);



	});

	console.log("subscribe");

	dIaClient.requestIndication('CREATE', null, gscl.link + '/applications/' + targetApplicationID + '/containers/' + container.id + '/contentInstances/subscriptions', { 
		subscription: {
			contact: notifyUri, filterCriteria: {attributeAccessor: 'latest/content'}
		}
	}).on('STATUS_CREATED', function (data) {
		'use strict';
		logger.info('subscribed to content of ' + gscl.sclId + '/' + container.id + ' (' + notifyUri + ')');
	});

	console.log("retri");

    //Now that we are subscribed and will receive changes in the contentInstances collection,
    //we can retrieve any contentInstances that already existed before we made the subscription
	/*dIaClient.requestIndication('RETRIEVE', null, gscl.link + '/applications/' + targetApplicationID + '/containers/' + container.id + '/contentInstances'+'/latest/content').on('STATUS_OK',
		 function(data) {
			handleContent(gscl, container, data);
		});*/
}

function handleContainers(gscl, containers) {
	console.log("Handling containers: ");
	console.log(containers.containerCollection.namedReference);
	containers.containerCollection.namedReference.forEach(function(container) {
		handleContainer(gscl, container);
		//console.log(gscl, container);
	});
	console.log("Handled containers.");
}

function handleApplications(gscl, applications) {
	if (gscl.initialized)
		return;

    console.log("handling applications: ");
    console.log(applications);

	applications.applicationCollection.namedReference.forEach(function(application) {
		if (application.id == targetApplicationID) {
			gscl.initialized = true;
			initgscl(gscl);
			return false;
		}	
	});
}

function initgscl(gscl) {
	var notifyPath = config.notificationResource + "/" + gscl.sclId;
   	var notifyUri = contactURI + notifyPath;
	app.post(notifyPath, function(req, res) {
		var representation = getNotificationData(req);
		handleContainers(gscl, representation.containers);
		//console.log(gscl, representation.container);
		res.send(200);
	});

	console.log("---------------------------------------------------");

	dIaClient.requestIndication('CREATE', null, gscl.link + '/applications/' + targetApplicationID + '/containers/subscriptions', { 
		subscription: {
			contact: notifyUri
		}
	}).on('STATUS_CREATED', function (data) {
		'use strict';
		logger.info('subscribed to containers of ' + gscl.sclId + ' (' + notifyUri + ')');
	});

	console.log("---------------------------------------------------");
	console.log("get containers for " + gscl.sclId);

	/*dIaClient.requestIndication('RETRIEVE', null, gscl.link + '/applications/' + targetApplicationID + '/containers').on('STATUS_OK',
		 function(data) {
			console.log("Got containers:");
			console.log(data.containers);
			handleContainers(gscl, data.containers);
		});*/
}

function handlegscl(gscl) {
	if (gscls[gscl.sclId] !== undefined) {
		console.debug("gsclS " + gscl.sclId + " is already known.");
		return;
	}

	console.log("Handling new gscl " + gscl.sclId + " (" + gscl.link + ")");

	gscl.containers = {};
	gscl.initialized = false;
	gscls[gscl.sclId] = gscl;

    var notifyPath = config.notificationResource +  "/" + gscl.sclId + "/apps";
	var notifyUri = contactURI + notifyPath;
	app.post(notifyPath, function(req, res) {
        console.log("new app.");
        //Have applications representationconsole.log(req.body);
		var representation = getNotificationData(req);
        console.log("Have applications representation: ");
        console.log(representation);
		handleApplications(gscl, representation.applications);
		res.send(200);
	});

	dIaClient.requestIndication('CREATE', null, gscl.link + '/applications/subscriptions', { 
		subscription: {
			contact: notifyUri
		}
	}).on('STATUS_CREATED', function (data) {
		'use strict';
		logger.info('subscribed to applications of ' + gscl.sclId + ' ( notifyPath=' + notifyPath + " notifyUri=" + notifyUri + ')');
	});

	/*dIaClient.requestIndication('RETRIEVE', null, gscl.link + '/applications').on('STATUS_OK',
		 function(data) {
			handleApplications(gscl, data.applications);
		});*/
}

handlegscl({"sclId": gscl.id, "link": gscl.mid.uri});

