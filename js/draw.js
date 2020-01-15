//draw functions

function addLineChart(cWidth, cHeight, gd, ei) {
  //gd: graph data, ei: extra_info
  //append title and legend
  const margin = { left: 70, top: 10, right: 50, bottom: 30 },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#line-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);
  const legend_rows = 2,
    legend_cols = Math.round(gd.length / legend_rows);

  d3.select("#line-chart-title").html(
    `<strong style="font-size:16px">Turnover comparison 2018 vs 2019</strong>`
  );

  let legends = gd.map(d => ({ label: d.label, color: ei.color[d.value] }));

  let legend_html_str = `<table>`;
  for (let i = 0; i < legend_cols; i++) {
    legend_html_str += `<tr>`;
    for (let j = 0; j < legend_rows; j++) {
      legend_html_str += `<td>
      <div class="cell">${
        legends[i * legend_rows + j] ? legends[i * legend_rows + j].label : ""
      }${
        legends[i * legend_rows + j]
          ? `<svg
        width="20" height="20"
      ><circle cx="10" cy="10" r="5" stroke="${
        legends[i * legend_rows + j].color
      }" stroke-width="3" fill="white"/></svg>`
          : ""
      }</div></td>`;
    }
    legend_html_str += `</tr>`;
  }
  legend_html_str += `</table>`;
  d3.select("#line-chart-legends").html(legend_html_str);
  d3.select("#line-chart-description").html("This is multi-line chart!");

  svg.selectAll("*").remove();

  let days = gd[0].data.map(d => d.date),
    available_y_values = [];
  gd.forEach(item => {
    available_y_values.push(...item.data.map(d => d.total));
  });

  console.log(available_y_values, "avai");

  const svgG = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`),
    x = d3
      .scaleTime()
      .domain(d3.extent(days, d => new Date(d)))
      .range([0, w]),
    y = d3
      .scaleLinear()
      .domain([data.y_min, data.y_max])
      .range([h, 0]),
    xAxis = svgG
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(d3.axisBottom(x)),
    yAxis = svgG.append("g").call(d3.axisLeft(y).tickSize(-w));

  xAxis.select(".domain").remove();

  let showableDays = [];
  xAxis
    .selectAll(".tick")
    .select("text")
    .text(d => {
      showableDays.push(formatYearMonthDay(d));
      return formatMonthDay(d);
    });

  xAxis
    .selectAll(".tick")
    .select("line")
    .attr("opacity", 0);

  yAxis.select(".domain").remove();
  yAxis
    .selectAll(".tick")
    .select("line")
    .attr("stroke", "white")
    .attr("stroke-dasharray", "3, 3");
  yAxis
    .selectAll(".tick")
    .select("text")
    .attr("dx", -5)
    .text(d =>
      d === 0
        ? d
        : d < 0
        ? data.currency_prefix + "(" + withComma(Math.abs(d)) + ")"
        : data.currency_prefix + withComma(d)
    );

  // Draw the line
  svgG
    .selectAll(".line")
    .data(data)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (_, i) => colors[i])
    .attr("stroke-width", 1.5)
    .attr("d", d =>
      d3
        .line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.total))(d.data)
    );

  //Draw the circles
  data.forEach((dd, i) => {
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

  //Draw main_bank_account_overdraft_limit line
  svgG
    .append("path")
    .attr("stroke", "grey")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3, 3")
    .attr("d", `M0 ${y(data.main_bank_account_overdraft_limit)}h${w}z`);
}

function addBarChart(cWidth, cHeight, data) {
  const margin = { left: 70, top: 10, right: 50, bottom: 30 },
    color = {
      total_in: "#5b9ed6",
      total_out: "#283483"
    },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#bar-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);
  const legend_rows = 3,
    legend_cols = Math.round(data.length / legend_rows);

  d3.select("#bar-chart-title").html(
    `<strong style="font-size:16px">Next 30 days - Predicted <br /> cash flow & cash balance </strong>`
  );
  let legend_str = `<table>`;
  for (let i = 0; i < legend_cols; i++) {
    legend_str += `<tr>`;
    for (let j = 0; j < legend_rows; j++) {
      legend_str += `<td>
      <div class="cell">${
        data[i * legend_rows + j] ? data[i * legend_rows + j].label : ""
      }${
        data[i * legend_rows + j]
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
  d3.select("#bar-chart-legends").html(legend_str);
  d3.select("#bar-chart-description").html("This is multi-line chart!");

  svg.selectAll("*").remove();

  // const svgG = svg
  //     .append("g")
  //     .attr("transform", `translate(${margin.left}, ${margin.top})`),
  //   x = d3
  //     .scaleTime()
  //     .domain(d3.extent(data.days, d => new Date(d)))
  //     .range([0, w]),
  //   y = d3
  //     .scaleLinear()
  //     .domain([data.y_min, data.y_max])
  //     .range([h, 0]),
  //   xAxis = svgG
  //     .append("g")
  //     .attr("transform", `translate(0, ${h})`)
  //     .call(d3.axisBottom(x)),
  //   yAxis = svgG.append("g").call(d3.axisLeft(y).tickSize(-w));

  // xAxis.select(".domain").remove();

  // let showableDays = [];
  // xAxis
  //   .selectAll(".tick")
  //   .select("text")
  //   .text(d => {
  //     showableDays.push(formatYearMonthDay(d));
  //     return formatMonthDay(d);
  //   });

  // console.log(showableDays);

  // xAxis
  //   .selectAll(".tick")
  //   .select("line")
  //   .attr("opacity", 0);

  // yAxis.select(".domain").remove();
  // yAxis
  //   .selectAll(".tick")
  //   .select("line")
  //   .attr("stroke", "white")
  //   .attr("stroke-dasharray", "3, 3");
  // yAxis
  //   .selectAll(".tick")
  //   .select("text")
  //   .attr("dx", -5)
  //   .text(d =>
  //     d === 0
  //       ? d
  //       : d < 0
  //       ? data.currency_prefix + "(-" + withComma(Math.abs(d)) + ")"
  //       : data.currency_prefix + withComma(d)
  //   );

  // // Draw the line
  // svgG
  //   .selectAll(".line")
  //   .data(data)
  //   .enter()
  //   .append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", (_, i) => colors[i])
  //   .attr("stroke-width", 1.5)
  //   .attr("d", d =>
  //     d3
  //       .line()
  //       .x(d => x(new Date(d.date)))
  //       .y(d => y(d.total))(d.data)
  //   );

  // //Draw the circles
  // data.forEach((dd, i) => {
  //   svgG
  //     .selectAll(".circle")
  //     .data(dd.data)
  //     .enter()
  //     .append("circle")
  //     .attr("stroke", d => (d.total ? colors[i] : "transparent"))
  //     .attr("stroke-width", d => (d.total ? 3 : 0))
  //     .attr("fill", d => (d.total ? "white" : "transparent"))
  //     .attr("cx", d => x(new Date(d.date)))
  //     .attr("cy", d => y(d.total))
  //     .attr("r", 5);
  // });

  // //Draw main_bank_account_overdraft_limit line
  // svgG
  //   .append("path")
  //   .attr("stroke", "grey")
  //   .attr("stroke-width", 1.5)
  //   .attr("stroke-dasharray", "3, 3")
  //   .attr("d", `M0 ${y(data.main_bank_account_overdraft_limit)}h${w}z`);
}

function addDonutChart(width, height, v_data) {}
