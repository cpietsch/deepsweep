function Sweep(title){
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
      .domain([0, 30])
      

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
      // .tickFormat(function(d,i){
      //   return i == 6 ? d + " dB power" : d;
      // })
      // .tickFormat(function(d){ return d3.format("1f")})

  var line = d3.svg.line()
      .interpolate("linear")
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
  
  svg.append("text")
        .text("Power (dB)")
        .attr("dy", -40)
        .attr("dx", -height/2)
        // .classed("title", true)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)");


  svg.append("text")
    .text(title)
    .attr("dx", width+5)
    .attr("dy", height-5)


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
  var map = d3.map([]);

  chart.load = function(_data){
    data = _data;

    console.log(title, data[data.length-1]);

    // y.domain([0,d3.max(data, function(c) { return d3.max(c.window, function(v) { return v.value; }); }) ]);
    map = d3.map(data, function(d){ return d.time; });

  };

  chart.draw = function(data){
    // console.time("draw")
    x.domain(d3.extent(data, function(d){ return d.frequency; }));
    // console.log(x.domain());

    svgXAxis.call(xAxis);

    linechart
          .datum(data)
          .attr("d", function(d) { return line(d); })

    // console.timeEnd("draw")
  }

  chart.select = function(d){
    // console.time("select")

    var s = map.get(d.unix);
    // console.log(s,s.window[0]);
    var w = s ? s.window : [];

    chart.draw(w);

    //console.timeEnd("select")
  }




  return chart;
}

