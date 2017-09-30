function Sensors(keys, title){
  var chart = {};

  var margin = {top: 30, right:50, bottom: 20, left: 50},
      width = 800 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

   // 2015-08-27_17:09:55.923311

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width)
      .ticks(4)
      .tickFormat(function(d){ 
        return title == "Elevation (km)" ? d/1000 : d;
      })

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.value); });
      
  var svg = d3.select("#charts").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
    .text(title)
    .attr("dy", -40)
    .attr("dx", -height/2)
    // .classed("title", true)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)");

  var axisSvg = svg.append("g")
  var linechartSvg = svg.append("g")

  var timeLine = svg.append("line")
     .classed("timeline", true)
     .attr("y2", height)
     .attr("x1", 0)


  var activeSvg = svg.append("g").selectAll("active")
      .data(keys)
  var each = activeSvg.enter()
      .append("g")
      .classed("active", true)

      activeSvg.append("circle").attr("r", 3)
      activeSvg.append("text").attr("text-anchor", "start")
     

  var hover = svg.append("g")
 
  

  chart.select = function(d){


    var active = keys.map(function(key){
      return { time: d.time, value: d[key] };
    });

    activeSvg.data(active);
    activeSvg.attr("transform",function(d){ return "translate("+x(d.time)+","+y(d.value)+")"; })
    activeSvg.select("text")
      .text(function(d){ return title == "Elevation (km)" ? parseInt(d.value)/1000 : parseInt(d.value); })
      .attr("dy", function(d,i){ return i ? 15 : -10})
      .attr("dx", 10)
      


    timeLine
      .attr("transform", "translate("+x(d.time)+",0)")
  }
  chart.load = function(data){

    // console.log(data[0], data.length);
    console.log(title, data[data.length-1]);

    x.domain(d3.extent(data, function(d){ return d.time; }));


    var temps = keys.map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {time: d.time, value: d[name]};
          })
        };
      });

   // console.log(temps);

   y.domain([
     d3.min(temps, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
     d3.max(temps, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
   ]);

  axisSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

  var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

  gy.selectAll("text")
      .attr("x", -6)
      // .attr("dy", -4);

  gy.selectAll("g").filter(function(d) { return d; })
      .classed("minor", true);

  
  
  var linechart = linechartSvg.selectAll(".linechart")
        .data(temps)
      .enter().append("g")
        .attr("class", "linechart");

    linechart.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        //.style("stroke", function(d) { return color(d.name); });

    linechart.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });


    svg.append("g").selectAll(".hover")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "hover")
          .attr("transform", function(d) { return "translate(" + x(d.time) + "," + 0 + ")"; })
          .attr("height", height)
          .attr("width", 3)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .attr("cursor", "pointer")
          .on("mouseenter", chart.mouseenter)
          .on("touchdown", chart.mouseenter)
          .on("touchmove", chart.mouseenter)

  };


  chart.mouseenter = function(d){
    //console.log(d);
    //chart.select(d);
    satellite.select(d);
  }


  return chart;
}

