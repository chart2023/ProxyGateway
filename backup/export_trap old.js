var r=require("./trap_callback");
r.trap_callback(function(idresult,timeresult,valueresult) {
     var id = idresult;
     var time = timeresult;
     var value = valueresult;

console.log("resutl="+id + time + value);
var partsArray = id.split('/');
console.log(partsArray[partsArray.length-1])
     //... rest your processing here
});
