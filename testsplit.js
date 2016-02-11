var export_etsi = require('./export_nip_trap');
var id = "http://bems.ee.eng.chula.ac.th/eng4/fl13/north/lab_telecommunication/z1/sensor1/monitor/humidity";
var parseId = id.split('/');
//console.log(parseId);
//var appId = parseId[2].replace(/\./g, '_');
//console.log(appId);
var containerId = parseId.splice(2,parseId.length).join('_').replace(/\./g, '_');
//console.log(containerId);
//export_etsi.etsi('pir','2014','10');

//var parseId2 = parseId1[1].replace(/\//g, '_');
//console.log(parseId2);
//var parseId3 = parseId2.split('_');
//console.log(parseId3);
//var appId = parseId3[0].replace(/\./g, '_');
//console.log(appId);
//console.log(res.split('_')[2]);
//console.log(id.replace('http://bems.ee.eng.chula.ac.th/',''));
