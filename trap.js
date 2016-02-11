//http://stackoverflow.com/questions/14018269/how-to-post-xml-data-in-node-js-http-request

var http = require('http'); //require the 'http' module
var uuid=require("node-uuid");
var body_trap = '<?xml version="1.0" encoding="utf-8"?>' +
'<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">'+
 '<soapenv:Body><ns2:queryRQ xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/">'+
'<header><query id="'+uuid.v4()+'" type="stream" ttl="600" callbackData="http://172.24.3.36" 	callbackControl="http://172.24.3.36">'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/north/room_server/z1/sensor1/monitor/temperature"  attrName="value" trap="changed" />'
//+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/north/room_server/z1/sensor1/monitor/humidity"  attrName="value" trap="changed" />'
//+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/north/room_server/z1/sensor1/monitor/illuminance"  attrName="value" trap="changed" />'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/north/room_server/z1/sensor1/monitor/pir"  attrName="value" trap="changed" />'
+'</query></header></transport></ns2:queryRQ>'+'</soapenv:Body></soapenv:Envelope>';

var postRequest = {
//	    host: "192.168.90.6",
	    host: "161.200.90.122",
	    path: "/axis2/services/FIAPStorage",
	    port: 80,
	    method: "POST",
	    headers: {
	        'Content-Type': 'text/xml charset=UTF-8',
		'SOAPAction': 'http://soap.fiap.org/query',
	        'Content-Length': Buffer.byteLength(body_trap)
	    }
	};
var req_trap = http.request( postRequest, function ( res ) {
	   console.log( res.statusCode );
	   var buffer = "";
	   res.on( "data", function( data ) { buffer = buffer + data; } );
	   res.on( "end", function() { console.log( buffer ); } );

	});
	req_trap.write( body_trap );
	req_trap.end();

	var minutes = 10, the_interval = minutes * 60 * 1000;
	setInterval(function() {
	var req_trap = http.request( postRequest, function ( res ) {
	   console.log( res.statusCode );
	   var buffer = "";
	   res.on( "data", function( data ) { buffer = buffer + data; } );
	   res.on( "end", function() { console.log( buffer ); } );
	});
	req_trap.write( body_trap );
	req_trap.end();
	}, the_interval);
