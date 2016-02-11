/* external modules */
// http API from nodejs
var http = require('http');
// express web framework
var express = require('express');
// fs
var fs = require('fs');
//var export_write = require('./export_write');

/* internal modules */
// provides dIa primitives
var openmtc = require('openmtc');

//mIa / dIa client
var XIA = openmtc.interfaces.xIa;
// maps primitives to http
var HttpClient = openmtc.transport.http.client;

// configuration file for NSCL
var nscl = openmtc.config_nscl.scl;

//our app's configuration
var config = {
  host: '161.200.90.70',
  port: '3002',
  appId: 'NIP',
  notificationResource: "/notify",
};

/* we want to subscribe for data from container in application below */
//var targetApplicationID = 'GIPA_Temp';
//var targetApplicationID = 'SmartMeter';
var targetApplicationID = 'GIPA_XB';
/* contactURI used in subscription */
var contactURI = 'http://' + config.host + ':' + config.port;
var notificationPath = '/notify';

/* express */
var app = express();

/* express configuration */
app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});

/* web server (dIa) */
var dIaServer = http.createServer(app);

dIaServer.listen(config.port);

/* event channel */
var eventChannel = require('socket.io').listen(dIaServer);

var temperatureData = {};

eventChannel.sockets.on('connection', function (socket) {
  'use strict';
  console.log('socket browser connected');
  socket.on('echo', function (echo_data) {
    console.log('Echo data: ' + echo_data);
    eventChannel.sockets.emit('echo-back', 'this is from server-' + echo_data);
  });
});



//some helper methods to decode contentInstance data
function parseB64Json(s) {
  return JSON.parse(new Buffer(s, 'base64').toString('utf8'));
}

function getRepresentation(o) {
  if (o.representation.contentType !== 'application/json') {
    throw new Error("Unknown content type");
  }
  return JSON.parse(new Buffer(o.representation.$t, 'base64').toString('utf8'));
}

function getNotificationData(req) {
	return getRepresentation(req.body.notify);
}

//create client for dIa interface
//generic communication module
var httpClient = new HttpClient({ sclUri: nscl.dia.hostUri });

//dIa interface
var dIaClient = new XIA(nscl.uri, httpClient, 'dIa');


function handleContent(sclId, container, content) {
	eventChannel.sockets.emit('data', container);

	//export_write.write(container.id, content.data.timestamp, content.data.consumed);
	console.log(container.id, content.data.timestamp, content.data.consumed);
	console.log("Handled content");
}
function handleContainer(sclId, appLink, container) {

	var notifyPath = config.notificationResource + "/" + sclId + "/" + container.id;
   	var notifyUri = contactURI + notifyPath;

	app.post(notifyPath, function(req, res) {
	 fs.appendFile(__dirname + "/notfy_nip_gscl", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!: notfy_nip_gscl');
		});
		var representation = getNotificationData(req);
		handleContent(sclId, container, representation);
		res.send(200);
	 fs.appendFile(__dirname + "/notfyok_nip_gscl", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!: notfy_nip_gscl');
		});
	});

	console.log("subscribe");

	dIaClient.requestIndication('CREATE', null, appLink + '/containers/' + container.id + '/contentInstances/subscriptions', { 
		subscription: {
			contact: notifyUri, filterCriteria: {attributeAccessor: 'latest/content'}
		}
	}).on('STATUS_CREATED', function (data) {
		'use strict';
		logger.info('subscribed to content of ' + sclId + '/' + container.id + ' (' + notifyUri + ')');
	});

	console.log("retri");

}

function handleContainers(sclId, appLink, containers) {
	console.log("Handling containers: ");
	console.log(containers.containerCollection.namedReference);
	containers.containerCollection.namedReference.forEach(function(container) {
		handleContainer(sclId, appLink, container);
		console.log(sclId, appLink, container);
	});
	console.log("Handled containers.");
}

function handleApplication(sclId, appLink) {
	var notifyPath = config.notificationResource + "/" + sclId + "/" + targetApplicationID;
   	var notifyUri = contactURI + notifyPath;
	app.post(notifyPath, function(req, res) {
		var representation = getNotificationData(req);
		handleContainers(sclId, appLink, representation.containers);
		res.send(200);
	});

	console.log("---------------------------------------------------");

	dIaClient.requestIndication('CREATE', null, appLink + '/containers/subscriptions', { 
		subscription: {
			contact: notifyUri,
		}
	}).on('STATUS_CREATED', function (data) {
		'use strict';
		logger.info('subscribed to containers of ' + sclId + ' (' + notifyUri + ')');
	});

	console.log("---------------------------------------------------");
	console.log("get containers for " + sclId);

}

function handleDeviceApplication(sclId, deviceApplication) {
    console.log("Found a DA: " + deviceApplication.$t);

    //Now that we are subscribed and will receive changes in the containers collection,
    //we can retrieve any containers that already existed before we made the subscription
    dIaClient.requestIndication('RETRIEVE', null, 
        deviceApplication.$t 
    ).on('STATUS_OK', function(data) {
            console.log("Retrieved containers for: " + deviceApplication.$t);
            console.log(data.applicationAnnc.link);
	    handleApplication(sclId, data.applicationAnnc.link);
    }).on("ERROR", function(err){
       console.log("Error retrieving containers " + err);
    });
}

function handleApplicationsData(sclId, applications) {
  console.log("Handling applications data.");
  console.log(applications.applicationAnncCollection.namedReference);
  var applicationReferences = applications.applicationAnncCollection.namedReference;

  //we get information about all registered apps. Here we look for the one we are actually interested in
  for (var i = 0; i < applicationReferences.length; ++i) {
    var applicationReference = applicationReferences[i];
    console.log("Found an application: ", applicationReference);
    if (applicationReference.id == targetApplicationID + 'Annc')
    handleDeviceApplication(sclId, applicationReference);
  }
}

function getApplicationsData(scl) {
    //first make sure that we are able to receive notifications

    //The internal URI path we will receive notifications about new applications on
	var notifyPath = config.notificationResource + "/" + scl.id;

    //The full external URI, that we will communicate as contactURI to the SCL 
	var notifyUri = contactURI + notifyPath;

    //Tell express JS to accept requests for the defined notification path
	app.post(notifyPath, function(req, res) {
		console.log("Got applications notification.");
		var notificationData = getNotificationData(req);
		console.log(notificationData);

		handleApplicationsData(scl.id, notificationData.applications);

		res.send(200);
	});

	dIaClient.requestIndication('CREATE', null, scl.$t + '/applications/subscriptions', { 
		subscription: { contact: notifyUri }
	}).on('STATUS_CREATED', function (data) {
	  console.log('Subscribed to applications.');
	}).on("ERROR", function(err){
      console.log("Error creating subscription for applications: " + err);
    });

    console.log("go");

}

function handleScls(scls) {
  console.log("Handling scls.");
  console.log(scls.sclCollection.namedReference);
  var sclReferences = scls.sclCollection.namedReference;

  //we get information about all registered apps. Here we look for the one we are actually interested in
  for (var i = 0; i < sclReferences.length; ++i) {
    var sclReference = sclReferences[i];
    console.log("Found an scl: ", sclReference);
    getApplicationsData(sclReference);
  }
}

function getScls() {
    //first make sure that we are able to receive notifications

    //The internal URI path we will receive notifications about new applications on
	var notifyPath = config.notificationResource + "/";

    //The full external URI, that we will communicate as contactURI to the SCL 
	var notifyUri = contactURI + notifyPath;

    //Tell express JS to accept requests for the defined notification path
	app.post(notifyPath, function(req, res) {
		console.log("Got scls notification.");
		var notificationData = getNotificationData(req);
		console.log(notificationData);
		handleScls(notificationData.scls);

		res.send(200);
	});

	dIaClient.requestIndication('CREATE', null, nscl.dia.hostUri + '/m2m/scls/subscriptions', { 
		subscription: { contact: notifyUri }
	}).on('STATUS_CREATED', function (data) {
	  console.log('Subscribed to scls.');
	}).on("ERROR", function(err){
      console.log("Error creating subscription for scls: " + err);
    });

    console.log("go");

}

function doIt() {
    console.log("go");

    console.log(nscl.dia);
    //dIaClient.requestIndication('RETRIEVE', null, 
}

function registerApplication() {
  var appData = {
    application: { appId: config.appId }
  };

  console.log('Registering application...');
  dIaClient.requestIndication('CREATE', null, 
        nscl.dia.hostUri + '/m2m/applications', appData
  ).on('STATUS_CREATED', function (data) {
    console.log('Application registered.')
   
    //Our GA is registered at the SCL. We can now proceed to gather information
    //available applications. We use the subscribe/retrieve pattern.
    getScls();

  }).on('ERROR', function(err) {
        //409 is the HTTP error code for "conflict". This error occurs when an application
        //with the same ID as ours is already registered. 
        //For our training scenario, we'll just assume that we are already registered. 
        //In 'reality' we would of course have to handle this more sophisticated.
        if (err == 409) {
          console.log("Already registered.");
          getScls();
        }
        else
          console.log("Error registering application: " + err);
  });
}

function main() {
  console.log("Starting application");
  registerApplication();
}

main();
