// set the dimensions and margins of the graph
// let containerWidth = d3.select("#chart-container").style("width"),
//   containerHeight = d3.select("#chart-container").style("height"),
const c_width = 700,
  c_height = 400;

init();

function init() {
  d3.select("#line-chart")
    .style("width", `${c_width}px`)
    .style("height", `${c_height}px`);

  //   onResize();
  addLineChart(
    c_width,
    c_height,
    convertLineChartData(data)
  );
  //   addBarChart();
  //   addDonutChart();
}

//events
window.addEventListener("resize", onResize);

function onResize() {
  //   console.log(window.innerWidth, window.innerHeight);
}
