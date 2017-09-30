

function Satellite(){

  var chart = {};
  var width = window.innerWidth,
      height = 800;

  var crashPos = [27.826482199999987,53.5368929];
  var startPos = [11.715210000000004,52.17651999999999];
  var sensorPos = [14.687695517241384,53.0802693103448];
  var rfPos = [12.569604333333336, 52.57218133333332];

  var pois = [
    { name: "Berlin", geo: [13.396359,52.518531], class: "city", radius: 0.1},
    { name: "Magdeburg", geo: startPos, class: "start", radius: 0.07},
    { name: "Belarus", geo: crashPos, class: "end", radius: 0.07},
  ];

  var annotations = [
    { name: "Launch site", time: 1440691815250 },
    { name: "Landing site", time: 0, point: { geo: crashPos} },
    { name: "Sensor power shutdown", time: 1440699264603 },
    { name: "RF power shutdown", time: 1440695681888 }
    
  ];

  // var zoomlevel = 20500;
  // var zoomlevel = 5500;
  //var zoomlevel = 10500;
  // var projection = d3.geo.satellite()
  //     .distance(1.1)
  //     .scale(zoomlevel)
  //     .rotate([startPos[0]*-1, (startPos[1]-7)*-1, 32.12])
  //     .center([-4, 7])
  //     .tilt(20)
  //     .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
  //     .clipExtent([[0, 0], [width, height]])


  var zoomlevel = 28500;
  var projection = clippedSatellite()
      .distance(1.07)
      .scale(zoomlevel)
      .rotate([startPos[0]*-1, (startPos[1]-7)*-1, 32.12])
      .center([-3, 9])
      .tilt(40)
      // .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI + 1e-6)
      .clipExtent([[0, 0], [width, height]])

    var projection2 = d3.geo.satellite()
      .distance(1.07)
      .scale(zoomlevel)
      .rotate([startPos[0]*-1, (startPos[1]-7)*-1, 32.12])
      .center([-3, 9])
      .tilt(40)
      .clipExtent([[0, 0], [width, height]])


  var graticule = d3.geo.graticule()
      // .extent([[-10, 50], [-50, 20]])
      .step([3, 3]);

  var circle = d3.geo.circle().precision(50).angle(1).origin(function(x, y) { return [x, y]; });
  var circlePoi = d3.geo.circle().angle(1).origin(function(x, y) { return [x, y]; });

  var line = d3.svg.line()
      .x(function(d) { return projection(d.geo)[0]; })
      .y(function(d) { return projection(d.geo)[1]-d.gpsalt/100; });

  var path = d3.geo.path()
      .projection(projection);    

  var svg = d3.select("#container").append("svg")
      .classed("satellite", true)
      .attr("width", width)
      .attr("height", height);
  var svgPoi = svg.append("g")
      .attr("class", "poi")
  var svgGlobe = svg.append("g");



  var svgGPS = svg.append("g");

  svgGlobe.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", path);

  var countryLabels = ["Germany", "Poland", "Belarus"];
  var topo;
  var sensorData = [];
  var routeAfter = [];

  
  var lastPos,startPos;
  var distanceFactor = 0;

  var voronoi = d3.geom.voronoi()
      .clipExtent([[-2, -2], [width + 2, height + 2]])
      .x(function(d){ return d.pos[0]; })
      .y(function(d){ return d.pos[1]; })

  var cell = svg.append("g")
      .attr("class", "voronoi")
      .selectAll("g");

  var cellClip = svg.append("g")
      .attr("class", "clip")
      .selectAll("clipPath");

   var annotationsSvg = svg.append("g")
      .attr("class", "annotations")

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
    var points = [pos,[pos[0], pos[1]-alt]];
    return d3.svg.line()(points)
  }

  chart.load = function(error,data){
    // console.log(data);

    topo = topojson.feature(data, data.objects.europe);

    svgGlobe.selectAll('.countries')
      .data(topo.features)
      .enter()
      .append('path')
      .attr('class', 'countries')
      .on("mousedown.log", function(d) {
        // var out = { name: d.properties.name, coordinates: projection.invert(d3.mouse(this))};
        // console.log(JSON.stringify(out),",");
        // console.log(d.properties)
      })
      .attr("d", path);

    // svgGlobe.append("path")
    //     .datum(topo)
    //     .attr("class", "countries")
    //     .attr("d", path);

  
    // svgGPS.selectAll(".place-label")
    //   .data(topo.features.filter(function(d){ return countryLabels.indexOf(d.properties.name) > -1; }))
    //   .enter()
    //   .append("text")
    //   .attr("class", "place-label")
    //   .attr("dy", ".35em")
    //   .text(function(d) { return d.properties.name; })
    //   .attr("transform", function(d,i) { return "translate(" + path.centroid(d) + ")"; })

      
  };

  chart.loadSensor = function(data){
    // console.log(data);

    distanceFactor = makeDistanceFactor();
    sensorData = data;
    lastPos = sensorData[sensorData.length-1].geo;
    startPos = sensorData[0].geo;

    routeAfter = {type: "LineString", coordinates: [ lastPos, crashPos ]};
    routeBefore = {
      type: "LineString",
      coordinates: sensorData.map(function(d){ return d.geo; })
    };

    sensorData.forEach(function(d){ d.pos = projection2(d.geo); });

    annotations.forEach(function(d){
      var f = sensorData.filter(function(dd){ return dd.unix == d.time; })[0];
      if(f) d.point = f;
      // console.log(d.point)
    })

    // console.log(sensorData.map(function(d){ return d.lon; }));

    // svgGlobe.selectAll('.circle')
    //   .data(sensorData)
    //   .enter()
    //   .append("path")
    //   .datum(function(d){ return circle.angle(0.003)(d.lon,d.lat); })
    //   .attr("class", "circle")
    //   .attr("d", path);

    var s1 = annotationsSvg.selectAll('g')
      .data(annotations)
      .enter()
      .append("g")
      .attr("transform", function(d) { console.log(d); return "translate(" + projection2(d.point.geo) + ")"; })
      .on("mouseenter", chart.hover)

    s1.append("circle")
      .attr("r", 3)
      // .attr("fill", "#9E9C9C");

    s1.append("line")
      .attr("x1", -20)
      .attr("y1", -20)
      .attr("x2", -5)
      .attr("y2", -5)
      // .attr("stroke", "rgba(0, 0, 0, 0.25)")

    s1.append("text")
      .attr("class", "place-label")
      .attr("dy", "-2em")
      .attr("dx", "-2em")
      .attr("text-anchor", "end")
      .text(function(d) { return d.name; })

    var s = svgPoi.selectAll('g')
      .data(pois)
      .enter()
      .append("g")
      .attr("class", function(d){ return d.class; })

    s.append("path")
      .datum(function(d){ return circlePoi.angle(d.radius)(d.geo[0], d.geo[1]); })
      .attr("d", path);

    s.append("text")
      .attr("class", "place-label")
      .attr("dy", "2em")
      // .attr("dx", ".25em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.name; })
      .attr("transform", function(d,i) { return "translate(" + projection2(d.geo) + ")"; })

    svgGlobe
      .append("path")
      .datum(routeAfter)
      .attr("class", "routeAfter")
      .attr("d", path);

    svgGlobe
      .append("path")
      .datum(routeBefore)
      .attr("class", "routeBefore")
      .attr("d", path);

    // svgGPS.selectAll('.hori')
    //   .data(sensorData)
    //   .enter()
    //   .append("path")
    //   .attr("class", "hori")
    //   .attr("d", elevationLine);

    chart.voronoi();
  };

  chart.voronoi = function() {
    sensorData.forEach(function(d){ d.pos = projection2(d.geo); });
    var v = voronoi(sensorData);
    cellClip = cellClip.data(v);
    cellClip.exit().remove();
    var cellEnter = cellClip.enter().append("clipPath")
      .attr("id", function(d, i) { return "clip-"+i;})
      .append("circle").attr("r", 40);
    cellClip.attr("transform", function(d) { return "translate(" + d.point.pos + ")"; });
    
    cell = cell.data(v);
    cell.exit().remove();
    var cellEnter = cell.enter().append("g");
    cellEnter.append("circle").attr("r", 7);
    cellEnter.append("path");
    cellEnter
      // .on("mouseover", chart.hover)
      .on("mouseenter", chart.hover)
      // .on("touchdown", chart.hover)
      // .on("touchmove", chart.hover)
    cell.select("circle").attr("transform", function(d) { return "translate(" + d.point.pos + ")"; });
    cell.select("path").attr("d", function(d) { return d.length ? "M" + d.join("L") + "Z": ""; }).attr("clip-path", function(d,i) { return "url(#clip-"+i+")"; })
  }

  chart.hover = function(d){
    if(d.time=="0") return;

    chart.select(d.point);
   
  }

  chart.zoom = function(zoomlevel){
    projection.scale(zoomlevel);

    distanceFactor = makeDistanceFactor();

    svgGlobe.selectAll('path').attr("d", path);
    svgGPS.selectAll('.hori').attr("d", elevationLine);
    // svgGPS.selectAll(".place-label").attr("transform", function(d,i) { return "translate(" + path.centroid(d) + ")"; });
    
    chart.voronoi();
  }

  chart.select = function(d){
    cell.classed("hover", function(dd){
      return dd.point === d;
    });

    sensorsAlt.select(d);
    sensorsSpeed.select(d);
    sensorsTemp.select(d);
  }


  return chart;
}



function animate(){
  zoomlevel -= 500;
  zoom(zoomlevel);

  requestAnimationFrame(animate);
}


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

