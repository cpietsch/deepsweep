

function Satellite(){

  var chart = {};
  var width = window.innerWidth,
      height = 800;

  var crashPos = [27.826482199999987,53.5368929];
  var startPos = [11.715210000000004,52.17651999999999];



  // var zoomlevel = 20500;
  // var zoomlevel = 5500;
  var zoomlevel = 10500;
  var projection = d3.geo.satellite()
      .distance(1.1)
      .scale(zoomlevel)
      .rotate([startPos[0]*-1, (startPos[1]-7)*-1, 32.12])
      .center([-4, 7])
      .tilt(20)
      .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
      .clipExtent([[0, 0], [width, height]])
      // .precision(10);


  var graticule = d3.geo.graticule()
      .step([3, 3]);

  var circle = d3.geo.circle().precision(50).angle(1).origin(function(x, y) { return [x, y]; });

  var line = d3.svg.line()
      .x(function(d) { return projection(d.geo)[0]; })
      .y(function(d) { return projection(d.geo)[1]-d.gpsalt/100; });

  var path = d3.geo.path()
      .projection(projection);    

  var svg = d3.select("body").append("svg")
      .classed("satellite", true)
      .attr("width", width)
      .attr("height", height);

  var svgGlobe = svg.append("g");
  var svgGPS = svg.append("g");

  var svgGraticule = svgGlobe.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path);

  var countryLabels = ["Germany", "Poland", "Belarus"];
  var topo;
  var sensorData = [];
  var routeAfter = [];

  
  var lastPos,startPos;
  var distanceFactor = 0;

  var makeDistanceFactor = function(){
    var meter = 1/111111;
    var p1 = projection(startPos);
    var p2 = projection([startPos[0], startPos[1]+meter]);
    return distance(p1,p2);
  }

  var distance = function(p1, p2){
      return Math.sqrt((p1[0] -= p2[0]) * p1[0] + (p1[1] -= p2[1]) * p1[1]);
  };

  var elevationLine = function(d,i){
    var pos = projection(d.geo);
    var alt = d.gpsalt*distanceFactor;

    //console.log(d.gpsalt,alt);

    var points = [pos,[pos[0], pos[1]-alt]];
    return d3.svg.line()(points)
  }

  chart.load = function(error,data){
    console.log(data);

    topo = topojson.feature(data, data.objects.europe);

    chart.draw();
  };

  chart.loadSensor = function(data){
    console.log(data);

    sensorData = data;
    lastPos = sensorData[sensorData.length-1].geo;
    startPos = sensorData[0].geo;
    routeAfter = [{type: "LineString", coordinates: [ lastPos, crashPos ]}];

    chart.draw();
  };

  chart.draw = function(){
    distanceFactor = makeDistanceFactor();
    // console.log(d);

    chart.drawBase();
    chart.drawPath();
  }

  chart.drawBase = function(){

    var select = svgGlobe.selectAll('.countries')
      .data(topo.features)

    select
      .enter()
      .append('path')
      .attr('class', 'countries')
      .on("mousedown.log", function(d) {
        // var out = { name: d.properties.name, coordinates: projection.invert(d3.mouse(this))};
        // console.log(JSON.stringify(out),",");
        console.log(d.properties)
      });

    // svgGlobe.append("path")
    //     .datum(topo)
    //     .attr("class", "countries")
    //     .attr("d", path);

    select.attr("d", path);
    svgGraticule.attr("d", path);

    // select = svgGlobe.selectAll(".place-label")
    //     .data(topo.features.filter(function(d){ return countryLabels.indexOf(d.properties.name) > -1; }))

    // select
    //   .enter().append("text")
    //     .attr("class", "place-label")
    //     .attr("dy", ".35em")
    //     .text(function(d) { return d.properties.name; });

    // select
    //   .attr("transform", function(d,i) { return "translate(" + path.centroid(d) + ")"; })
  }

  chart.drawPath = function(){
    
    var select = svgGPS.selectAll('.circle')
      .data(sensorData)

    select
      .enter()
      .append("path")
      .datum(function(d){ return circle.angle(0.003)(d.lon,d.lat); })
      .attr("class", "circle")
    
    select.attr("d", path);

    select = svgGPS.selectAll('.hori')
      .data(sensorData)

    select
      .enter()
      .append("path")
      .attr("class", "hori")

    select.attr("d", elevationLine);

    select = svgGPS.selectAll('.routeAfter')
      .data(routeAfter)

    select
      .enter()
      .append("path")
      .attr("class", "routeAfter")

    select.attr("d", path);
  }

  chart.zoom = function(zoomlevel){
    projection.scale(zoomlevel);

    chart.draw();
  }

  return chart;
}



function animate(){
  zoomlevel -= 500;
  zoom(zoomlevel);

  requestAnimationFrame(animate);
}


