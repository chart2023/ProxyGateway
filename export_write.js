//http://stackoverflow.com/questions/14018269/how-to-post-xml-data-in-node-js-http-request

var http = require('http'); //require the 'http' module
var moment = require('moment');
var fs = require('fs');
exports.write = function (pointset, fiap){
/*exports.write = function (pointset, point, value){
var body = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><ns2:dataRQ xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/"><body><pointSet id="http://napat.test.chula.ac.th/IEEE1888_ETSIM2M/'+ pointset +'/"><point id="http://napat.test.chula.ac.th/IEEE1888_ETSIM2M/' + pointset +'/'+ point+'"><value time="'+moment().format()+'">'+value+'</value></point></pointSet></body></transport></ns2:dataRQ></soapenv:Body></soapenv:Envelope>';*/
//http://gw-ct-meter.chula.ac.th/VA0/*   http://bems.ee.eng.chula.ac.th/eng4/fl13

var point= [];
	for (var i = 0; i < fiap.length; i++) {
		point = point + '<point id='+'"'+fiap[i][0]+'"'+'><value time="'+fiap[i][2]+'">'+fiap[i][1]+'</value></point>'

	}
var body = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><ns2:dataRQ xmlns:ns2="http://soap.fiap.org/"><transport xmlns="http://gutp.jp/fiap/2009/11/"><body><pointSet id="'+pointset+'">'+point+'</pointSet></body></transport></ns2:dataRQ></soapenv:Body></soapenv:Envelope>';
//console.log(body);

var postRequest = {
    host: "161.200.90.122",
    path: "/axis2/services/FIAPStorage",
    port: 80,
    method: "POST",
    headers: {
    	'Content-Type': 'text/xml charset=UTF-8',
    	'SOAPAction': 'http://soap.fiap.org/data',
        'Content-Length': Buffer.byteLength(body),
    }
};

var buffer = "";


var req = http.request( postRequest, function ( res ) {
	/* fs.appendFile(__dirname + "/write_ok_nip_storage", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!: write_ok_nip_storage');
		});*/
   //console.log( res.statusCode );
   var buffer = "";
   res.on( "data", function( data ) { buffer = buffer + data; } );
   res.on( "end", function( data ) { 
	//console.log( buffer ); 
	} );

});
	/* fs.appendFile(__dirname + "/write_nip_storage", new Date()+"   "+new Date().getMilliseconds()+'\n' , function (err) {
		  if (err) throw err;
		  console.log('The "data to append" was appended to file!: write_nip_storage');
		});*/
req.write( body );
req.end();
  return 1;
};





