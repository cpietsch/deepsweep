// 2015 Christopher Pietsch
// chrispie.com

var satellite = Satellite();

var sensorsAlt = Sensors(["gps", "pressure"], "Elevation", "km");
var sensorsTemp = Sensors(["internal", "external"], "Temperature", "°C");
var sensorsSpeed = Sensors(["speed"], "Speed", "km/h");


d3.json("data/eu.topojson", satellite.load);


d3.csv("data/sensor-clean2.csv")
    .row(function(d) { 
        return {
            time: new Date(+d.date),
            unix: +new Date(+d.date),
            lat: +d.lat,
            lon: +d.lon,
            geo: [+d.lon,+d.lat],
            gps: +d.gps,
            pressure: +d.pressure,
            external: +d.external,
            internal: +d.internal,
            speed: +d.speed,
        };
    })
    .get(function(error, rows) {


    	console.log(rows[0], rows[rows.length-1], rows.length);

        var uni = _.uniq(rows, function(d){ return d3.round(d.lon, 5) });
        // var uni = rows;


        sensorsAlt.load(uni);
        sensorsTemp.load(uni);
        sensorsSpeed.load(uni);

        satellite.loadSensor(uni);
    	
    });


d3.json("data/sweeps.json", function(d){

    console.log(d);

    d.forEach(function(sweep){
        sweep.data.forEach(function(d){
            var data = d.data;
      
            Sweep(sweep.name + " sweep",d.start,d.end).load(data)
        })
    })


})


