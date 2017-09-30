// compresses csv sensor data through polyline simplification

var d3 = require('d3');
var simplify = require('simplify');
var csv = require("fast-csv");

var all =[];
csv
 .fromPath("../data/mid.csv")
 .on("data", function(data){
     // console.log(data);
     all.push(data)
 })
 .on("end", function(){
     console.log("done");
     console.log(all[0]);
 });

