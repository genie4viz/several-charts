//draw functions

function drawLineChart(cWidth, cHeight, gd, ei, diff_day = 1) {
  //gd: graph data, ei: extra_info

  const margin = { left: 70, top: 80, right: 50, bottom: 164 },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#line-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);

  //legend
  const legend_g = svg.append("g");
  //add title
  legend_g
    .append("text")
    .attr("x", w / 4)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("font-size", 18)
    .text("Turnover comparison 2018 vs 2019");
  //add legends
  gd.forEach((dd, i) => {
    if (i < 3) {
      legend_g
        .append("text")
        .attr("x", w / 2)
        .attr("y", (i + 1) * 20)
        .attr("alignment-baseline", "central")
        .text(dd.label);
      legend_g
        .append("circle")
        .attr("cx", w / 2 + 120)
        .attr("cy", (i + 1) * 20)
        .attr("r", 5)
        .attr("fill", "white")
        .attr("stroke", ei.color[dd.value])
        .attr("stroke-width", 3);
    } else {
      legend_g
        .append("text")
        .attr("x", w / 2 + 200)
        .attr("y", (i - 2) * 20)
        .attr("alignment-baseline", "central")
        .text(dd.label);
      legend_g
        .append("circle")
        .attr("cx", w / 2 + 320)
        .attr("cy", (i - 2) * 20)
        .attr("r", 5)
        .attr("fill", "white")
        .attr("stroke", ei.color[dd.value])
        .attr("stroke-width", 3);
    }
  });

  let days = gd[0].data.map(d => d.date),
    available_y_values = [];
  gd.forEach(item => {
    available_y_values.push(...item.data.map(d => d.total));
  });

  //replace data with diff day
  let r_gd = [];

  gd.forEach(d => {
    r_gd.push({
      label: d.label,
      value: d.value,
      data: replaceWithDay(d.data, diff_day, days)
    });
  });

  const y_max = d3.max(available_y_values),
    y_min = d3.min(available_y_values);

  const svgG = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`),
    x = d3
      .scaleBand()
      .domain(days)
      .range([0, w]),
    y = d3
      .scaleLinear()
      .domain([y_min, y_max])
      .range([h, 0]),
    xAxis = svgG
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(d3.axisBottom(x)),
    yAxis = svgG.append("g").call(d3.axisLeft(y).tickSize(-w));

  xAxis.select(".domain").remove();

  //show skipped days
  const skippedDays = getSkipDays(days, 5);
  xAxis
    .selectAll(".tick")
    .select("text")
    .text(d => (skippedDays.includes(d) ? moment(d).format("MMM DD") : ""));

  xAxis
    .selectAll(".tick")
    .select("line")
    .attr("opacity", 0);

  yAxis
    .append("text")
    .attr("x", -15)
    .attr("y", y(y_max) - 10)
    .attr("fill", "black")
    .attr("font-size", 16)
    .text(ei.currency_prefix);
  yAxis.select(".domain").remove();
  yAxis
    .selectAll(".tick")
    .select("line")
    .attr("stroke", "white");

  yAxis
    .selectAll(".tick")
    .select("text")
    .attr("dx", -5)
    .text(d => (d < 0 ? `(${withComma(Math.abs(d))})` : withComma(d)));

  //tooltip
  const tooltipG = svgG.append("g").attr("class", "tool-tip");
  //indicator line
  const indicator = svgG
    .append("path")
    .attr("class", "indicator")
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3, 3");

  //Append invisible rect for bisect data
  svgG
    .append("rect")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "transparent") //will transparent
    .on("mousemove", function() {
      let date = scaleBandInvert(x)(d3.mouse(this)[0]);

      svg.selectAll("circle").each(function() {
        if (d3.select(this).attr("cx") == x(date) + x.bandwidth() / 2) {
          d3.select(this).attr("r", 8);
        } else {
          d3.select(this).attr("r", 5);
        }
      });

      indicator.attr("d", `M${x(date) + x.bandwidth() / 2} 0v${h + 40}`);
      let accInfo = getInfoFromDate(gd, date);

      tooltipG
        .attr("transform", `translate(${x(date)}, ${h + 40})`)
        .call(
          callout,
          x,
          w,
          date,
          accInfo,
          ["date", "total", "total_in", "total_out"],
          ei
        );
    });

  // Draw the line
  svgG
    .selectAll(".line")
    .data(r_gd)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", d => ei.color[d.value])
    .attr("stroke-width", 1.5)
    .attr("d", d =>
      d3
        .line()
        .x(d => x(d.date) + x.bandwidth() / 2)
        .y(d => y(d.total))(d.data)
    );

  //Draw the circles
  r_gd.forEach(dd => {
    svgG
      .selectAll(".circle")
      .data(dd.data)
      .enter()
      .append("circle")
      .attr("stroke", ei.color[dd.value])
      .attr("stroke-width", 3)
      .attr("fill", "white")
      .attr("cx", d => x(d.date) + x.bandwidth() / 2)
      .attr("cy", d => y(d.total))
      .attr("r", 5);
  });

  //Draw main_bank_account_overdraft_limit line
  svgG
    .append("path")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3, 3")
    .attr("d", `M0 ${y(ei.main_bank_account_overdraft_limit)}h${w}z`);
}

function drawBarChart(cWidth, cHeight, gd, duration_name, ei, diff_day = 1) {
  let bgd = gd.filter(d => d.value === duration_name)[0];

  const margin = { left: 70, top: 90, right: 50, bottom: 170 },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#bar-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);

  //legend
  const legend_g = svg.append("g");
  //add title
  legend_g
    .append("text")
    .attr("x", w / 4)
    .attr("y", 40)
    .attr("font-size", 18)
    .text(`${bgd.label} - Predicted`);
  legend_g
    .append("text")
    .attr("x", w / 4)
    .attr("y", 60)
    .attr("font-size", 18)
    .text("cash flow & cash balance");
  //add legends
  legend_g
    .append("rect")
    .attr("x", w / 2 - 30)
    .attr("y", 28)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", ei.color.total_in);
  legend_g
    .append("text")
    .attr("x", w / 2)
    .attr("y", 40)
    .text("Total In");
  legend_g
    .append("rect")
    .attr("x", w / 2 - 30)
    .attr("y", 48)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", ei.color.total_out);
  legend_g
    .append("text")
    .attr("x", w / 2)
    .attr("y", 60)
    .text("Total Out");
  legend_g
    .append("circle")
    .attr("cx", w / 2 + 120)
    .attr("cy", 35)
    .attr("r", 5)
    .attr("fill", "white")
    .attr("stroke", ei.color[bgd.value])
    .attr("stroke-width", 3);
  legend_g
    .append("text")
    .attr("x", w / 2 + 135)
    .attr("y", 40)
    .text(bgd.label);

  let days = bgd.data.map(d => d.date),
    available_y_values = [
      ...bgd.data.map(d => d.total),
      ...bgd.data.map(d => d.total_in),
      ...bgd.data.map(d => d.total_out)
    ],
    y_max = d3.max(available_y_values),
    y_min = d3.min(available_y_values),
    //replace data with diff day
    r_bgd = {
      label: bgd.label,
      value: bgd.value,
      data: replaceWithDay(bgd.data, diff_day, days)
    };

  //show skipped days
  const skippedDays = getSkipDays(days, 5);
  const svgG = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`),
    x = d3
      .scaleBand()
      .domain(days)
      .range([0, w])
      .padding(0.2),
    y = d3
      .scaleLinear()
      .domain([y_min, y_max])
      .range([h, 0]),
    xAxis = svgG
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(d3.axisBottom(x)),
    yAxis = svgG.append("g").call(d3.axisLeft(y).tickSize(-w));

  xAxis.select(".domain").remove();

  xAxis
    .selectAll(".tick")
    .select("text")
    .text(d => (skippedDays.includes(d) ? moment(d).format("MMM DD") : ""));

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
    .append("text")
    .attr("x", -15)
    .attr("y", y(y_max) - 10)
    .attr("fill", "black")
    .attr("font-size", 16)
    .text(ei.currency_prefix);
  yAxis
    .selectAll(".tick")
    .select("text")
    .attr("dx", -5)
    .text(d => (d < 0 ? `(${withComma(Math.abs(d))})` : withComma(d)));

  // Draw bars - total_in
  svgG
    .selectAll(".total_in-bars")
    .data(r_bgd.data)
    .enter()
    .append("rect")
    .attr("fill", ei.color.total_in)
    .attr("x", d => x(d.date))
    .attr("y", d => y(d.total_in))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.total_in));

  // Draw bars - total_out
  svgG
    .selectAll(".total_out-bars")
    .data(r_bgd.data)
    .enter()
    .append("rect")
    .attr("fill", ei.color.total_out)
    .attr("x", d => x(d.date))
    .attr("y", y(0))
    .attr("width", x.bandwidth())
    .attr("height", d => y(d.total_out) - y(0));
  // Draw the line
  svgG
    .selectAll(".line")
    .data([r_bgd])
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", d => ei.color[d.value])
    .attr("stroke-width", 1.5)
    .attr("d", d =>
      d3
        .line()
        .x(d => x(d.date) + x.bandwidth() / 2)
        .y(d => y(d.total))(d.data)
    );

  //tooltip
  const tooltipG = svgG.append("g").attr("class", "tool-tip");
  //indicator line
  const indicator = svgG
    .append("path")
    .attr("class", "indicator")
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3, 3");

  //Append invisible rect for bisect data
  svgG
    .append("rect")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "transparent")
    .on("mousemove", function() {
      let date = scaleBandInvert(x)(d3.mouse(this)[0]);
      indicator.attr("d", `M${x(date) + x.bandwidth() / 2} 0v${h + 40}`);

      svg.selectAll("circle").each(function() {
        if (d3.select(this).attr("cx") == x(date) + x.bandwidth() / 2) {
          d3.select(this).attr("r", 8);
        } else {
          d3.select(this).attr("r", 5);
        }
      });

      let accInfo = getInfoFromDate([r_bgd], date);
      tooltipG
        .attr("transform", `translate(${x(date)}, ${h + 40})`)
        .call(
          callout,
          x,
          w,
          date,
          accInfo,
          ["date", "total", "total_in", "total_out"],
          ei
        );
    });

  //Draw the circles
  svgG
    .selectAll(".circle")
    .data(r_bgd.data)
    .enter()
    .append("circle")
    .attr("stroke", ei.color[r_bgd.value])
    .attr("stroke-width", 3)
    .attr("fill", "white")
    .attr("cx", d => x(d.date) + x.bandwidth() / 2)
    .attr("cy", d => y(d.total))
    .attr("r", 5);

  //Draw main_bank_account_overdraft_limit line
  svgG
    .append("path")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3, 3")
    .attr("d", `M0 ${y(ei.main_bank_account_overdraft_limit)}h${w}z`);
}
function callout(
  g,
  x = null,
  w = 0,
  date = "",
  info = null,
  fields = [],
  ei = {}
) {
  if (!info) return g.style("display", "none");

  g.style("display", null).style("pointer-events", "none");

  g.selectAll("*").remove();

  const info_len = Object.keys(info).length,
    each_info_width = 160;

  g.append("rect")
    .attr("x", x(date) <= w / 2 ? 0 : -info_len * each_info_width + 15)
    .attr("width", info_len * each_info_width)
    .attr("height", (fields.length + 1) * 24)
    .attr("stroke", ei.color.desc_body)
    .attr("stroke-width", 1)
    .attr("fill", "#eaecf0");
  g.append("rect")
    .attr("x", x(date) <= w / 2 ? 0 : -info_len * each_info_width + 15)
    .attr("width", 20)
    .attr("stroke", ei.color.desc_head)
    .attr("stroke-width", 1)
    .attr("height", (fields.length + 1) * 24)
    .attr("fill", ei.color.desc_head);

  let x_step = 0,
    x_start = 40;

  for (let item in info) {
    g.append("text")
      .attr(
        "x",
        x(date) <= w / 2
          ? x_start + x_step
          : -info_len * each_info_width + x_start + x_step
      )
      .attr("y", 25)
      .attr("font-size", 16)
      .text(info[item].label);
    for (let i = 0; i < fields.length; i++) {
      g.append("text")
        .attr(
          "x",
          x(date) <= w / 2
            ? x_start + x_step
            : -info_len * each_info_width + x_start + x_step
        )
        .attr("y", 25 + (i + 1) * 20)
        .attr("font-size", 12)
        .text(
          i === 0
            ? fields[i] +
                ":" +
                moment(info[item][fields[i]]).format("DD-MM-YYYY")
            : fields[i] + ":" + withComma(Math.round(info[item][fields[i]]))
        );
    }
    x_step += each_info_width;
  }
}

function scaleBandInvert(scale) {
  let domain = scale.domain();
  let paddingOuter = scale(domain[0]);
  let eachBand = scale.step();
  return function(value) {
    let index = Math.floor((value - paddingOuter) / eachBand);
    return domain[Math.max(0, Math.min(index, domain.length - 1))];
  };
}
