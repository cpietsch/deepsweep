
function animate(){
  zoomlevel -= 10;
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

function makePath(data){

  var somedata = data.filter(function(d,i){ return i%40==0; });
  console.log("some", somedata.length)

  svgGPS.selectAll('.circle').remove();
  svgGPS.selectAll('.circle')
    .data(somedata)
    .enter()
    .append("path")
    .datum(function(d){ return circle.angle(0.01)(d.lon,d.lat); })
    .attr("class", "circle")
    .attr("id", "mass")
    .attr("d", path);


  var route = {
    type: "LineString",
    coordinates: [
      [data[data.length-1].lon, data[data.length-1].lat],
      [27.826482199999987,53.5368929]
    ]
  };

  svgGPS
    .append("path")
    .datum(route)
    .attr("class", "line")
    .attr("d", path);


}

var width = window.innerWidth,
    height = 800;

var poi = [52.50,13.38];

var zoomlevel = 20500;
var projection = d3.geo.satellite()
    .distance(1.1)
    .scale(zoomlevel)
    .rotate([76.00, -34.50, -22.12])
    //.center([-4, 7])
    .center([-4, 7])
    .tilt(20)
    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
    .clipExtent([[0, 0], [width, height]])
    .precision(.1);

var graticule = d3.geo.graticule()
    //.extent([[poi[1]*-1, poi[0]*-1], [poi[1] + 1e-6, poi[0] + 1e-6]])
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

//d3.select(self.frameElement).style("height", height + "px");

function clippedSatellite() {
  var projection = d3.geo.satellite();

  var clipAngle = projection.clipAngle,
      distance = projection.distance,
      degrees = 180 / Math.PI,
      radians = Math.PI / 180,
      tilt = projection.tilt,
      projectionStream = projection.stream,
      rotate = [0, 0, 0],
      rotation = d3.geo.rotation(rotate),
      tiltRotate,
      alpha;

  // Special projection instance for additional clipping.
  var clip = d3.geo.projection(function(λ, φ) {
    return [λ, -φ];
  }).scale(degrees).translate([0, 0]);

  delete projection.clipAngle;

  projection.distance = function(_) {
    if (!arguments.length) return distance.call(projection);
    distance.call(projection, _);
    clipAngle.call(projection, Math.acos(1 / +_) * degrees - 1e-6);
    return projection;
  };

  projection.rotate = function(_) {
    if (!arguments.length) return rotate;
    rotation = d3.geo.rotation(rotate = [+_[0], +_[1], _.length > 2 && +_[2]]);
    return projection;
  };

  projection.tilt = function(angle) {
    if (!arguments.length) return tilt.call(projection);
    tilt.call(projection, angle);
    alpha = Math.acos(projection.distance() * Math.cos(angle * radians) * .99) * degrees;
    clip.clipAngle(180 - alpha).rotate([0, 180 + angle]);
    tiltRotate = d3.geo.rotation([0, 180 + projection.tilt()]);
    return projection;
  };

  projection.stream =  function(stream) {
    var pstream = projectionStream.call(projection, stream),
        circle = d3.geo.circle().angle(clipAngle.call(projection) - 1e-6),
        clipStream = alpha ? clip.stream({
          point: function(λ, φ) {
            var point = tiltRotate.invert([λ, φ]);
            pstream.point(point[0], point[1]);
          },
          lineStart: function() { pstream.lineStart(); },
          lineEnd: function() { pstream.lineEnd(); },
          polygonStart: function() { pstream.polygonStart(); },
          polygonEnd: function() { pstream.polygonEnd(); }
        }) : pstream;
    return {
      point: function(λ, φ) {
        var point = rotation([λ, φ]);
        clipStream.point(point[0], point[1]);
      },
      lineStart: function() { clipStream.lineStart(); },
      lineEnd: function() { clipStream.lineEnd(); },
      polygonStart: function() { clipStream.polygonStart(); },
      polygonEnd: function() { clipStream.polygonEnd(); },
      sphere: function() {
        d3.geo.stream(circle(), clipStream);
      }
    };
  };

  return projection.distance(projection.distance());
}