//http://stackoverflow.com/questions/14018269/how-to-post-xml-data-in-node-js-http-request
//http://www.json.org/js.html

var http = require('http'); //require the 'http' module
var parser = require('xml2json');
//var export_etsi = require('./nip_fetch');

var body = '<?xml version="1.0" encoding="utf-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><ns2:queryRQ xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/"><header><query id="9eed9de4-1c48-4b08-a41d-dac067fc1c0d" type="storage">'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/corridor/elevetorfront/z1/sensor1/monitor/pir"  attrName="time" select="maximum" />'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/corridor/elevetorfront/z1/sensor2/monitor/pir"  attrName="time" select="maximum" />'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/corridor/walkingpath/z1/sensor1/monitor/pir"  attrName="time" select="maximum" />'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/corridor/walkingpath/z1/sensor2/monitor/pir"  attrName="time" select="maximum" />'
+'<key id="http://bems.ee.eng.chula.ac.th/eng4/fl13/corridor/walkingpath/z1/sensor3/monitor/pir"  attrName="time" select="maximum" />'
+'</query></header></transport></ns2:queryRQ></soapenv:Body></soapenv:Envelope>';

var postRequest = {
    host: "161.200.90.122",
    path: "/axis2/services/FIAPStorage",
    port: 80,
    method: "POST",
    headers: {
        'Content-Type': 'text/xml charset=UTF-8',
        'SOAPAction': 'http://soap.fiap.org/query',
        'Content-Length': Buffer.byteLength(body)
    }
};

var req = http.request( postRequest, function ( res ) {
	  //console.log('STATUS: ' + res.statusCode);
	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	 res.setEncoding('utf8');
	 res.on('data', function(data){
	 read_data(data);
});

});
req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

//write data to request body
req.write( body );
req.end();

function read_data(chunk) {
console.log(chunk);
	var json = parser.toJson(chunk);//convert xml to json; 
	//console.log(json);
	var idc=[];
	var timec=[];	    
	var valuec=[];	
   /*-------------------parsing json-----------------------------------*/
	JSON.parse(json, function (key, value) {
//console.log(key+'.....'+value);
    if (key==='id'&& value[0]==='h'){
        idc.push(value);
    }
    else if (key==='time'){
        timec.push(value);
    }
    else if (key==='$t'){
        valuec.push(value);
    }
    //return value;
    });
	//console.log(idc[idc.length-1]);
	//console.log(timec[0]);
	//console.log(valuec[0]);

	//console.log(idc);
//console.log(idc);
console.log(timec);
console.log(valuec);


	var id=[];
/*	console.log(idc.length); 
	console.log(valuec.length); 
	console.log(idc.length - valuec.length); */
	for (var i=idc.length - valuec.length; i < idc.length; i++){
	//console.log(i);
	//console.log(idc[i]);
		id.push(idc[i]);
	}
//console.log(id);

	for (var i in id) {	  	
		//export_etsi.etsi(id[i],timec[i],valuec[i]);
		console.log(id[i]);
		console.log(timec[i]);
		console.log(valuec[i]);  
		//console.log(result);   
	}
	//console.log(id);
	//console.log(timec);
	//console.log(valuec); 
		    }

	var minutes = 1, the_interval = minutes * 60 * 1000;
	setInterval(function() {
var req = http.request( postRequest, function ( res ) {
	  //console.log('STATUS: ' + res.statusCode);
	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	 res.setEncoding('utf8');
	 res.on('data', function(data){
	 read_data(data);
});

});
req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

//write data to request body
req.write( body );
req.end();
	}, the_interval);

