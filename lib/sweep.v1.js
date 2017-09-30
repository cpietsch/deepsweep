function Sweep(title, start, end){
  var chart = {};

   var margin = {top: 30, right:50, bottom: 20, left: 50},
      width = 800 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

   // 2015-08-27_17:09:55.923311
   
  var parseDate = d3.time.format("%Y-%m-%d_%H:%M:%S.%L").parse

  var x = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0])

  var timeformat = d3.time.format("%H:%M:%S");

  var color = d3.scale.category10();

   var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(function(d,i){
        return d/1000000 + " MHz";
      })

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width)
      .ticks(5)
      // .tickFormat(function(d){ return d3.format("1f")})

  var line = d3.svg.line()
      .interpolate("basic")
      .x(function(d) { return x(d.frequency); })
      .y(function(d) { return y(d.value); });

  var line2 = d3.svg.line()
      .interpolate("linear")
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
      
  var svg = d3.select("#charts").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // svg.append("text")
  //       .text(title)
  //       .attr("dy", -40)
  //       .attr("dx", -height/2)
  //       // .classed("title", true)
  //       .attr("text-anchor", "middle")
  //       .attr("transform", "rotate(-90)");


  var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)

  gy.selectAll("text")
      .attr("x", -6)
      // .attr("dy", -4);

  gy.selectAll("g").filter(function(d) { return d; })
      .classed("minor", true);

  var svgXAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")

  var linechart = svg.append("path")
    .attr("class", "line")

  var data = [];

  chart.load = function(_data){
    data = _data;

    console.log(start,end)

    svg.append("text")
          .text(title+ " " + timeformat(new Date(start)))
          .attr("dy", -40)
          .attr("dx", -height/2)
          // .classed("title", true)
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)");

    // data.forEach(function(d){
    //   d.frequency = parseInt(d.frequency);
    //   d.value = parseFloat(d.value);
    //   d.date = parseDate(d.date.slice(0,-3));
    //   d.unix = +d.date;
    // });

   
    x.domain(d3.extent(data, function(d){ return d.frequency; }));
    y.domain([0,d3.max(data, function(d){ return d.value; })]);

    chart.draw(data);

  };

  chart.draw = function(data){
    svgXAxis.call(xAxis);
    gy.call(yAxis);

    gy.selectAll("text")
        .attr("x", -6)
        // .attr("dy", -4);

    gy.selectAll("g").filter(function(d) { return d; })
        .classed("minor", true);

    linechart
          .datum(data)
          .attr("d", function(d) { return line(d); })

  }

  chart.select = function(d){

    // console.time("select")
    // var seconds = 60*0.1*1000;
    // var unix = d.time.getTime();
    // // console.log(unix, data[0].unix)

    // var s = data.filter(function(dd){
    //   return dd.unix > unix-seconds && dd.unix < unix+seconds;
    // })

    

    // x.domain(d3.extent(s, function(d){ return d.frequency; }));

    // // var points =  s.map(function(d){
    // //   return {x:x(d.frequency), y: y(d.value)};
    // // });

    // // var simpel = simplify(points,5).map(function(d){
    // //   return { frequency: x.invert(d.x), value: y.invert(d.y)};
    // // });

    // // console.log(s.length, simpel.length)
    // //console.log(points.length,simpel.length);

    // // return simpel;
    // chart.draw(s);

    //chart.draw(s);
    //console.timeEnd("select")
    // console.log(d.time, s.length);
  }




  return chart;
}

