//draw functions
function addLineChart(cWidth, cHeight, vData) {
  console.log(vData, "converted data");
  //append title and legend
  const margin = { left: 70, top: 10, right: 50, bottom: 50 },
    colors = ["#c6333f", "#009873", "#3a468d", "#77adda", "#e68017"],
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#line-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);
  const legend_rows = 2,
    legend_cols = Math.round(vData.data.length / legend_rows);

  d3.select("#line-chart-title").html(
    `<strong style="font-size:16px">Turnover comparison 2018 vs 2019</strong>`
  );
  let legend_str = `<table>`;
  for (let i = 0; i < legend_cols; i++) {
    legend_str += `<tr>`;
    for (let j = 0; j < legend_rows; j++) {
      legend_str += `<td>
      <div class="cell">${
        vData.data[i * legend_rows + j]
          ? vData.data[i * legend_rows + j].label
          : ""
      }${
        vData.data[i * legend_rows + j]
          ? `<svg
        width="20" height="20"
      ><circle cx="10" cy="10" r="5" stroke="${
        colors[i * legend_rows + j]
      }" stroke-width="3" fill="white"/></svg>`
          : ""
      }</div></td>`;
    }
    legend_str += `</tr>`;
  }
  legend_str += `</table>`;
  d3.select("#line-chart-legends").html(legend_str);

  svg.selectAll("*").remove();

  const svgG = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`),
    x = d3
      .scaleTime()
      .domain(d3.extent(vData.days, d => new Date(d)))
      .range([0, w]),
    y = d3
      .scaleLinear()
      .domain([vData.total_min, vData.total_max])
      .range([h, 0]),
    xAxis = svgG
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(d3.axisBottom(x)),
    yAxis = svgG.append("g").call(d3.axisLeft(y).tickSize(-w));

  xAxis.select(".domain").remove();
  xAxis
    .selectAll(".tick")
    .select("line")
    .attr("opacity", 0);

  yAxis.select(".domain").remove();
  yAxis
    .selectAll(".tick")
    .select("line")
    .attr("stroke", "white");
  yAxis
    .selectAll(".tick")
    .select("text")
    .attr("dx", -5)
    .text(d =>
      d === 0
        ? d
        : d < 0
        ? vData.currency_prefix + '(-' + withComma(Math.abs(d)) + ')'
        : vData.currency_prefix + withComma(d)
    );

  // Draw the line
  svgG
    .selectAll(".line")
    .data(vData.data)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (_, i) => colors[i])
    .attr("stroke-width", 1.5)
    .attr("d", d =>
      d3
        .line()
        .defined(d => !!d["total"])
        .x(d => x(new Date(d.date)))
        .y(d => y(d.total))(d.data)
    );
  //Draw the circles

  vData.data.forEach((dd, i) => {
    svgG
      .selectAll(".circle")
      .data(dd.data)
      .enter()
      .append("circle")
      .attr("stroke", d => (d.total ? colors[i] : "transparent"))
      .attr("stroke-width", d => (d.total ? 3 : 0))
      .attr("fill", d => (d.total ? "white" : "transparent"))
      .attr("cx", d => x(new Date(d.date)))
      .attr("cy", d => y(d.total))
      .attr("r", 5);
  });
}

function addBarChart(width, height, v_data) {}

function addDonutChart(width, height, v_data) {}
