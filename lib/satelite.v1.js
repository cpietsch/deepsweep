
function animate(){
  zoomlevel -= 500;
  zoom(zoomlevel);

  requestAnimationFrame(animate);
}


function zoom(zoomlevel){
  projection.scale(zoomlevel);

  svg.selectAll('path').attr("d", path);
}

function mapTo(poi,mass,impact){
  projection.rotate([poi[0]*-1, (poi[1]-7)*-1, 32.12]);

  svgGlobe.selectAll('path').attr("d", path);
}



var line = d3.svg.line()
    .x(function(d) { return projection(d.geo)[0]; })
    .y(function(d) { return projection(d.geo)[1]-d.gpsalt/100; });


function makePath(data){

  var crashPos = [27.826482199999987,53.5368929];
  var lastPos = data[data.length-1].geo;
  var startPos = data[0].geo;

 

  var hori = data.map(function(d){
    var pos = projection(d.geo);
    return [pos,[pos[0], pos[1]-d.gpsalt/100]];
  });

  svgGPS.selectAll('.hori')
    .data(hori)
    .enter()
    .append("path")
    .attr("class", "hori")
    .attr("d", d3.svg.line());

  console.time("circle");
  svgGPS.selectAll('.circle')
    .data(data)
    .enter()
    .append("path")
    .datum(function(d){ return circle.angle(0.003)(d.lon,d.lat); })
    .attr("class", "circle")
    .attr("id", "mass")
    .attr("d", path);

  console.timeEnd("circle");


  // var route = {
  //   type: "LineString",
  //   coordinates: somedata.map(function(d){ return d.geo; })
  // };


  var route = {
    type: "LineString",
    coordinates: data.map(function(d){ return d.geo; })
  };

  svgGPS
    .append("path")
    .datum(data)
    .attr("class", "route")
    .attr("d", line);

  svgGPS
    .append("path")
    .datum(route)
    .attr("class", "route")
    .attr("d", path);



  var routeAfter = {
    type: "LineString",
    coordinates: [
      lastPos,
      crashPos
    ]
  };

  svgGPS
    .append("path")
    .datum(routeAfter)
    .attr("class", "routeAfter")
    .attr("d", path);


}

var width = window.innerWidth,
    height = 800;

var poi = [52.50,13.38];

// var zoomlevel = 20500;
// var zoomlevel = 5500;
var zoomlevel = 10500;
var projection = d3.geo.satellite()
    .distance(1.1)
    .scale(zoomlevel)
    .rotate([poi[0]*-1, (poi[1]-7)*-1, 32.12])
    .center([-4, 7])
    .tilt(20)
    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
    .clipExtent([[0, 0], [width, height]])
    // .precision(10);

var projection2 = d3.geo.satellite()
    .distance(1.1)
    .scale(zoomlevel+8000)
    .rotate([poi[0]*-1, (poi[1]-7)*-1, 32.12])
    .center([-4, 7])
    .tilt(20)
    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
    .clipExtent([[0, 0], [width, height]])

var graticule = d3.geo.graticule()
    // .extent([[poi[1]*-1, poi[0]*-1], [poi[1] + 1e-6, poi[0] + 1e-6]])
    .step([3, 3]);

var circle = d3.geo.circle().precision(50).angle(1).origin(function(x, y) { return [x, y]; });

var fill = d3.scale.log()
    .domain([10, 500])
    .range(["brown", "grey"]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select($("#satelite")[0]).append("svg")
    .attr("width", width)
    .attr("height", height);

var svgGlobe = svg.append("g");
var svgGPS = svg.append("g");

svgGlobe.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// svgGlobe.append("path")
//     .datum(graticule)
//     .attr("class", "graticule2")
//     .attr("d", d3.geo.path().projection(projection2));

// d3.json("data/world-50m.json", function(error, world) {
  // svgGlobe.append("path")
  //     .datum(topojson.feature(world, {type: "GeometryCollection", geometries: world.objects.countries.geometries/*.filter(function(d) { return d.id == 840 || d.id == 124; })*/}))
  //     .attr("class", "countries")
  //     .attr("d", path);
//});

d3.json("data/eu.topojson", function(error, world) {
  // svgGlobe.selectAll('.countries')
  //       .data(topojson.feature(world, world.objects.europe).features)
  //       .enter()
  //       .append('path')
  //       .attr('class', 'countries')
  //       .attr('d', path);

  console.time("draw");
  svgGlobe.append("path")
      .datum(topojson.feature(world, world.objects.europe))
      .attr("class", "countries")
      .attr("d", path);

  console.timeEnd("draw");

   // animate();
});




