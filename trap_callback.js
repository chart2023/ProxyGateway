//http://nodejs.org/api/stream.html
//http://www.json.org/js.html
var http = require('http');
var parser = require('xml2json');
var export_etsi = require('./export_nip_trap');

var fs = require('fs');
var body_ok = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><ns2:dataRS xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/"><header><OK/></header></transport></ns2:dataRS></soapenv:Body></soapenv:Envelope>';

var server = http.createServer(function (req, res) {
  // req is an http.IncomingMessage, which is a Readable Stream
  // res is an http.ServerResponse, which is a Writable Stream

  var body = '';
  // we want to get the data as utf8 strings
  // If you don't set an encoding, then you'll get Buffer objects
  req.setEncoding('utf8');

  // Readable streams emit 'data' events once a listener is added
  req.on('data', function (chunk) {
    body += chunk;
  	//console.log(body);
	var json = parser.toJson(body);//convert xml to json; 
	//console.log(json);
	var idc=[];
	var timec=[];	    
	var valuec=[];	
   /*-------------------parsing json-----------------------------------*/
	JSON.parse(json, function (key, value) {

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


	var id=[];
	/*console.log(idc.length); 
	console.log(valuec.length); 
	console.log(idc.length - valuec.length); */
	for (var i=idc.length - valuec.length; i < idc.length; i++){
	//console.log(i);
	//console.log(idc[i]);
		id.push(idc[i]);
	}

	for (var i in id) {	  	
		result = export_etsi.etsi(id[i],timec[i],valuec[i]);
		console.log(id[i]);
		console.log(timec[i]);
		console.log(valuec[i]);  
		//console.log(result);   
	}
	//console.log(id);
	//console.log(timec);
	//console.log(valuec);   
  
  });

  // the end event tells you that you have entire body
  req.on('end', function () {

    try {

      var data = JSON.parse(json);
      //var data = JSON.parse(body);

    } catch (er) {
      // uh oh!  bad json!
      res.statusCode = 400;
      
      return res.end('error: ' + er.message);
    }

    // write back something interesting to the user:
    
	  res.writeHead(200, {  'Content-Type': 'text/xml charset=UTF-8',
		  'SOAPAction': 'http://soap.fiap.org/data',
		  'Content-Length': Buffer.byteLength(body_ok) });
	  res.end(body_ok);
  });
});

server.listen(80);
//console.log('Server running at http://127.0.0.1:80/');
