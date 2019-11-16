// set the dimensions and margins of the graph
var margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60
  },
  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%Y-%m-%d");

// get last week's datess
$(function () {
  $("#filter").click(function () {
    //var query = $("#mySearch").val();
    //var values =filterHouse()
    value = document.getElementById('fromDate').value;
    fromDate = new Date(value);
    loadData(fromDate)
  });
});

// set the ranges
var x = d3.scaleBand().range([0, width]).padding(0.01);
var y = d3.scaleBand().range([height, 0]).padding(0.01);

var colorScale = d3.scaleLinear().range(["white", "#69b3a2"]).domain([-8, 8])

var svg = d3.select("#contribution-heatmap").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

var fromDate = new Date()
loadData(fromDate)

function loadData(fromDate) {
  // read the data from contribution.json
  d3.json('contribution.json',
    function (error, dataset) {
      if (error) {
        console.error('Error while loading contribution.json dataset.');
        console.error(error);
        return;
      }

      //get the max/min number through the dataset for domains
      var maxValuesFeqSet = [];
      var minValuesFeqSet = [];


      for (var username in dataset) {
        maxValuesFeqSet.push(d3.max(Object.values(dataset[username])));
        minValuesFeqSet.push(d3.min(Object.values(dataset[username])));
      }

      var maxValue = d3.max(maxValuesFeqSet);
      var minValue = d3.max(minValuesFeqSet);

      var last_week_dates = [];
      var last_week_dates_formatted = [];
      var first = fromDate.getDate() - fromDate.getDay();

      for (var i = 0; i <= 6; i++) {
        var last = first + i;
        var previous_day = new Date(fromDate.setDate(last));
        console.log(previous_day)
        last_week_dates.push(previous_day);
        last_week_dates_formatted.push(formatTime(previous_day));
      }

      x.domain(last_week_dates_formatted);
      y.domain(Object.keys(dataset));

      // loop each users and draw graph
      var usernames = Object.keys(dataset)
      usernames.forEach(function (d) {
        drawGraph(dataset, d, last_week_dates);
      });
      drawAxis();
    });
}

// draw graph for each user
function drawGraph(data, username, last_week_dates) {

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
  for (var i = 0; i < last_week_dates.length; i++) {
    var tmp_object = {};
    var tmp_date = formatTime(last_week_dates[i]);

    tmp_object["date"] = tmp_date;

    var index = date.indexOf(tmp_date);

    if (index != -1) {
      tmp_object["frequecy"] = userData[date[i]];
    } else {
      tmp_object["frequecy"] = 0;
    }

    newData.push(tmp_object);
  }

  svg.selectAll()
    .data(newData)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.date)
    })
    .attr("y", function (d) {
      return y(username)
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) {
      return colorScale(d.frequecy)
    })

}

function drawAxis() {
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));
}