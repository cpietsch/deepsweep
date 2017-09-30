// 2015 Christopher Pietsch
// chrispie.com

var out = [];

d3.csv("data/low.csv", function(d){
    out.push(makeSweeps(d, "low"));
})

d3.csv("data/mid.csv", function(d){
    out.push(makeSweeps(d, "mid"));
})

d3.csv("data/high.csv", function(d){
    out.push(makeSweeps(d, "high"));

    exportToJson("sweeps.json",out);
})



function makeSweeps(d, name){
    var parsed = parseSweep(d);
    var sweeps = splitSweeps(d);

    var simplifiedSweeps = sweeps.map(function(d,i){

        var data = simplifySweep(d,1, true);
        var sweep = { start: _.first(d).date, end: _.last(d).date, data: data };

        console.log("simple", sweep, data.length, d.length);
        
        return sweep;
    });

    return { name: name, data: simplifiedSweeps };
}

function generateSweep(d){
    readSweep(d);
    var sweeps = splitSweeps(d);

    Sensors(["frequency"], "Frequency", "hz").load(downSample(d, 200));

    sweeps.forEach(function(d,i){
        // Sweep("Sweep #"+(i+1)).load(d);

        var data = simplifySweep(d,1, true);
        console.log("simple", data.length);

        Sweep("Sweep #"+(i+1)).load(data);

        // var data = downSample(d,5)
        // console.log("sample",data.length);
        // Sweep("Sweep #"+(i+1)).load();
    })
}

function parseSweep(data){
    var parseDate = d3.time.format("%Y-%m-%d_%H:%M:%S.%L").parse

    return data.forEach(function(d){
      d.frequency = +d.frequency;
      d.value = +d.value;
      d.date = +parseDate(d.date.slice(0,-3));
    });
}

function readSweep(data){
    var parseDate = d3.time.format("%Y-%m-%d_%H:%M:%S.%L").parse

    data.forEach(function(d){
      d.frequency = parseInt(d.frequency);
      d.value = parseFloat(d.value);
      d.date = parseDate(d.date.slice(0,-3));
      d.time = d.date;
      d.unix = +d.date;
    });
}

function splitSweeps(data){
    var sweeps = [];
    var lastFreq = Infinity;
    var now;

    data.forEach(function(d,i){
      if(d.frequency<lastFreq){
        now = [];
        sweeps.push(now);
      }
      d.i = i;

      now.push(d);
      lastFreq = d.frequency;
    })

    return sweeps;
}

function downSample(data, sample){
    return data.filter(function(d, i){ return i%sample == 0; }).map(function(d){ return d; })
}

function simplifySweep(data, ratio){

    var x = d3.scale.linear()
        .range([0, 800]);

    var y = d3.scale.linear()
        .range([150, 0]);

    x.domain(d3.extent(data, function(d){ return d.frequency; }));
    y.domain([0,d3.max(data, function(d){ return d.value; })]);

    var points = data.map(function(d){
      return {x:x(d.frequency), y: y(d.value)};
    });

    var simpel = simplify(points,ratio).sort(function(a,b){ return b.x-a.x; });

    var invert = simpel.map(function(d){
      return { frequency: parseInt(x.invert(d.x)), value: y.invert(d.y)};
    });

    return invert;
}

function exportToCsv(filename, data) {
    var header = d3.keys(data[0]) + "\n";
    var csv = data.map(function(d){ return d3.values(d).join(","); }).join("\n");

    var blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function exportToJson(filename, data) {
   
    var blob = new Blob([JSON.stringify(data)], { type: 'text/json;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}


// function simpel(){
//     var arr = [];
 
//     data.forEach(function(d){
//         var simpel = sweepLow.select(d);
//         if(simpel.length) arr.push({time: +d.time, window:simpel});
//     });

//     console.log(JSON.stringify(arr))
// }