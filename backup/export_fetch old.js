var r=require("./exportfetch");
r.fetch(function(idresult,timeresult,valueresult) {
     var id = idresult;
     var time = timeresult;
     var value = valueresult;

console.log(id + time + value);
var partsArray = id.split('/');
console.log(partsArray[partsArray.length-1])
     //... rest your processing here
});
