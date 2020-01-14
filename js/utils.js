const formatTime = d3.timeFormat("%B %d, %Y");

function convertLineChartData(data) {
  let c_data = [],
    dates_arr = [],
    totals_arr = [];

  console.log(data, "origin data");
  //get min, max date for range
  for (let item in data.items) {
    dates_arr.push(...data.items[item].items.dates);
    totals_arr.push(...data.items[item].items.data.map(d => d.total));
    c_data.push({
      label: data.items[item].label,
      data: data.items[item].items.data
    });
  }

  const start_date = d3.min(dates_arr),
    end_date = d3.max(dates_arr),
    m_start_date = moment(start_date),
    m_end_date = moment(end_date),
    all_days = daysBetweenDates(m_start_date, m_end_date);

  for (let i = 0; i < c_data.length; i++) {
    const days = c_data[i].data.map(d => d.date);
    for (let day of all_days) {
      if (!days.includes(day)) {
        c_data[i].data.push({ date: day });
      }
    }
    c_data[i].data.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return {
    data: c_data,
    days: all_days,
    total_max: d3.max(totals_arr),
    total_min: d3.min(totals_arr),
    currency_prefix: data.currency_prefix
  };
}

function daysBetweenDates(startDate, endDate) {
  let now = startDate,
    dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.format("YYYY-MM-DD").toString());
    now.add(1, "days");
  }
  return dates;
}

function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")) || 0,
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
