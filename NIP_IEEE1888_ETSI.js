//http://nodejs.org/api/stream.html
//http://www.json.org/js.html
var http = require('http');
var parser = require('xml2json');
var trap = require('./trap');
var export_create = require('./export_nip_trap');
var fs = require('fs');
var moment = require('moment');
var parseString = require('xml2js').parseString;
var body_ok = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><ns2:dataRS xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/"><header><OK/></header></transport></ns2:dataRS></soapenv:Body></soapenv:Envelope>';

var server = http.createServer(function (req, res) {
  // req is an http.IncomingMessage, which is a Readable Stream
  // res is an http.ServerResponse, which is a Writable Stream

  var body = '';
  var jsonbody
  // we want to get the data as utf8 strings
  // If you don't set an encoding, then you'll get Buffer objects
  req.setEncoding('utf8');

  // Readable streams emit 'data' events once a listener is added
  req.on('data', function (chunk) {
    body += chunk;
  	//console.log(body);
	//console.log(json);


  });

  // the end event tells you that you have entire body
  req.on('end', function () {
	/* fs.appendFile(__dirname + "/callback_gw_storage", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!: callback_gw_storage');
		});*/
	parseString(body, function (err, result) {
		//console.log(JSON.stringify(result));
		jsonbody = JSON.stringify(result);
		return jsonbody;      
	})
    try {
	var idc=[];
	var timec=[];	    
	var valuec=[];	
   /*-----------------parsing json-----------------------------------*/
	JSON.parse(jsonbody, function (key, value) {
		if (key==='id'&& value[0]==='h'){
			idc.push(value);
		}
		else if (key==='time'){
			timec.push(value);
		}
		else if (key==='_'){
			valuec.push(value);
		}
		});
    } catch (er) {
      console.log(er);
    }
//console.log(idc);
//console.log(valuec)
    // write back something interesting to the user:
    
	  res.writeHead(200, {  'Content-Type': 'text/xml charset=UTF-8',
		  'SOAPAction': 'http://soap.fiap.org/data',
		  'Content-Length': Buffer.byteLength(body_ok) });
	  res.end(body_ok);
	  var time=moment().format();
    try {
		var json_data = {};
		var j = 0
		for (var i=idc.length - valuec.length; i < idc.length; i++){
			var parseId = idc[i].split('/');
			json_data[parseId[parseId.length-1]]={'value': valuec[j]};
			console.log(valuec[j]);
			j++
		}	
		json_data['timestamp']=time;
	 	var parseId = idc[idc.length-1].split('/');
		var containerId = parseId.slice(parseId.length-6,parseId.length-1).join('_');
		console.log(json_data);
		console.log(containerId);
		result = export_create.create(containerId, json_data);
    } catch (er) {
      console.log(er);
    }

  });
});

server.listen(80);
//console.log('Server running at http://127.0.0.1:80/');
