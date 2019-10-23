// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m-%d");

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.frequecy); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// read the data from contribution.json
d3.json('contribution.json',
    function(error, dataset) {
        if(error) {
        console.error('Error while loading contribution.json dataset.');
        console.error(error);
        return;
    }
    var usernames = Object.keys(dataset)
    usernames.forEach(function(d){
        //drawGraph(dataset, d);
    });
    drawGraph(dataset, "jwzhang1");

});

// draw graph for each user
function drawGraph(data, username) {
    var userData = data[username];
    var date = Object.keys(userData);
    var frequecies = Object.values(userData);

    // sort the date in ascending order
    date.sort(function compare(a, b) {
        var dateA = new Date(a);
        var dateB = new Date(b);
        return dateA - dateB;
    });

    var newData = [];
    for (var i = 0; i < date.length; i++) {
        var element = {};
        element.date = parseTime(date[i]);
        element.frequecy = userData[date[i]];
        newData.push(element);
    }
    console.log(newData);

    x.domain(d3.extent(newData, function(d) { return d.date; }));
    y.domain([0, d3.max(newData, function(d) { return d.frequecy; })]);

    svg.append("path")
        .data([newData])
        .attr("class", "line")
        .attr("d", valueline);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll(".dot")
      .data(newData)
      .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function(d) { return x(d.date) })
      .attr("cy", function(d) { return y(d.frequecy) })
      .attr("r", 5);
}