//draw functions

function drawLineChart(cWidth, cHeight, gd, ei, diff_day = 1) {
  //gd: graph data, ei: extra_info

  const margin = { left: 70, top: 25, right: 50, bottom: 170 },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#line-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);

  const legend_rows = 2,
    legend_cols = Math.round(gd.length / legend_rows);

  d3.select("#line-chart-title").html(`Forecast spread 2018 vs 2019`);

  let legends = gd.map(d => ({ label: d.label, color: ei.color[d.value] }));

  let legend_html_str = `<table>`;
  for (let i = 0; i < legend_cols; i++) {
    legend_html_str += `<tr>`;
    for (let j = 0; j < legend_rows; j++) {
      legend_html_str += `<td>
      <div class="cell1">${
        legends[i * legend_rows + j]
          ? `<svg
        width="20" height="20"
      ><circle cx="10" cy="10" r="5" stroke="${
        legends[i * legend_rows + j].color
      }" stroke-width="3" fill="white"/></svg>`
          : ""
      }${
        legends[i * legend_rows + j] ? legends[i * legend_rows + j].label : ""
      }</div></td>`;
    }
    legend_html_str += `</tr>`;
  }
  legend_html_str += `</table>`;
  d3.select("#line-chart-legends").html(legend_html_str);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "line-tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

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

  //indicator line
  const indicator = svgG
    .append("path")
    .attr("class", "indicator")
    .attr("stroke", "grey")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3, 3");

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

      indicator
        .style("opacity", 1)
        .attr("d", `M${x(date) + x.bandwidth() / 2} 0v${h + 40}`);
      let strInner = getLineChartDataFromDate(gd, date); // return htmlStr
      let offsetTop = document.getElementById("line-chart-container").offsetTop,
        container_width = parseFloat(d3.select(".chart").style("width")),
        tooltip_width = parseFloat(d3.select("#line-tooltip").style("width")),
        scroll_pos = document.getElementById("line-chart").scrollLeft,
        logo_height = parseFloat(d3.select("#line-chart-logo").style("height"));

      tooltip
        .style("opacity", 1)
        .html(strInner)
        .style("left", () => {
          tooltip_width = parseFloat(d3.select("#line-tooltip").style("width"));
          if (container_width <= 512) {
            return 10 + "px";
          }
          if (d3.event.pageX < container_width / 2) {
            return (
              x(date) + x.bandwidth() / 2 + margin.left - scroll_pos + "px"
            );
          } else {
            return (
              x(date) +
              x.bandwidth() / 2 +
              margin.left -
              scroll_pos -
              tooltip_width +
              "px"
            );
          }
        })
        .style("top", offsetTop + margin.top + h + 30 + logo_height + "px")
        .style("opacity", 0.9);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      indicator.style("opacity", 0);
      svg.selectAll("circle").attr("r", 5);
    });
}
function drawBarChart(cWidth, cHeight, gd, duration_name, ei, diff_day = 1) {
  let bgd = gd.filter(d => d.value === duration_name)[0];

  const margin = { left: 70, top: 25, right: 50, bottom: 160 },
    w = cWidth - margin.left - margin.right,
    h = cHeight - margin.top - margin.bottom,
    svg = d3
      .select("#bar-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cHeight);

  d3.select("#bar-chart-title").html(
    `${bgd.label} - Predicted<br>cash flow & cash balance`
  );

  let legend_html_str = `<table>
          <tr>
            <td>
              <div class="cell2">
                <svg width="15" height="15"><rect width="15" height="15" fill="${
                  ei.color.total_in
                }"/></svg>&nbsp;Total In
              </div>
            </td>
            <td>
              <div class="cell2">
                <svg width="20" height="20"><circle cx="10" cy="10" r="5" fill="white" stroke-width="3" stroke="${
                  ei.color[bgd.value]
                }"/></svg>&nbsp;${bgd.label}
              </div>
            </td>        
          </tr>
          <tr>
            <td>
              <div class="cell2">
                <svg width="15" height="15"><rect width="15" height="15" fill="${
                  ei.color.total_out
                }"/></svg>&nbsp;Total Out
              </div>
            </td>
          </tr>
        </table>`;

  d3.select("#bar-chart-legends").html(legend_html_str);
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "bar-tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

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

      indicator
        .style("opacity", 1)
        .attr("d", `M${x(date) + x.bandwidth() / 2} 0v${h + 40}`);
      let strInner = getBarChartDataFromDate(r_bgd, date); // return htmlStr
      let offsetTop = document.getElementById("bar-chart-container").offsetTop,
        container_width = parseFloat(d3.select(".chart").style("width")),
        tooltip_width = parseFloat(d3.select("#bar-tooltip").style("width")),
        scroll_pos = document.getElementById("bar-chart").scrollLeft,
        logo_height = parseFloat(d3.select("#bar-chart-logo").style("height"));

      tooltip
        .style("opacity", 1)
        .html(strInner)
        .style("left", () => {
          tooltip_width = parseFloat(d3.select("#bar-tooltip").style("width"));
          if (d3.event.pageX < container_width / 2) {
            return (
              x(date) + x.bandwidth() / 2 + margin.left - scroll_pos + "px"
            );
          } else {
            return (
              x(date) +
              x.bandwidth() / 2 +
              margin.left -
              scroll_pos -
              tooltip_width +
              "px"
            );
          }
        })
        .style("top", offsetTop + margin.top + h + 30 + logo_height + "px")
        .style("opacity", 0.9);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      indicator.style("opacity", 0);
      svg.selectAll("circle").attr("r", 5);
    });
}
function drawDonutChart(gd) {
  console.log(gd, "docunet");
  const colors = d3
    .scaleSequential()
    .domain([1, gd.length])
    .interpolator(d3.interpolateViridis);

  const margin = 40,
    cWidth = 450,
    svg = d3
      .select("#donut-chart")
      .append("svg")
      .style("width", cWidth)
      .style("height", cWidth);

  svg.selectAll("*").remove();
  //add legends
  const rows = 4,
    cols = Math.round(gd.length / rows);
  let legend_html_str = `<table>`;
  for (let i = 0; i < cols; i++) {
    legend_html_str += `<tr>`;
    for (let j = 0; j < rows; j++) {
      legend_html_str += `<td>
          <div class='cell1'>
            <svg width="15" height="15"><rect width="15" height="15" fill="${colors(
              i * rows + j
            )}"/>
            </svg>&nbsp;${gd[i * rows + j].contact.name}
          </div>
        </td>`;
    }
    legend_html_str += `</tr>`;
  }
  legend_html_str += `</table>`;
  document.getElementById("donut-chart-legends").innerHTML = legend_html_str;

  const radius = (cWidth - margin) / 2;
  const svgG = svg
    .append("g")
    .attr("transform", `translate(${cWidth / 2}, ${cWidth / 2})`);

  const pie = d3.pie().value(d => Math.abs(parseFloat(d.contact.known_total)));
  const data_ready = pie(gd);

  //append description text in center of chart
  const descNameTxt = svgG
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text("");
  const descValueTxt = svgG
    .append("text")
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .text("");
  svgG
    .selectAll("pie")
    .data(data_ready)
    .enter()
    .append("path")
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(radius * 0.4) // This is the size of the donut hole
        .outerRadius(radius)
    )
    .attr("fill", (_, i) => colors(i))
    .attr("stroke", "white")
    .style("stroke-width", 1)
    .style("opacity", 0.6)
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", 1);
      descNameTxt.text(d.data.contact.name);
      descValueTxt.text(
        withComma(Math.abs(parseFloat(d.data.contact.known_total)))
      );
    })
    .on("mouseout", function() {
      d3.select(this).style("opacity", 0.6);
    });
}
