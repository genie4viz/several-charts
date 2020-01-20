//data format functions
function normalizeData(data) {
  const all_days = getDays(data);
  let c_data = [];

  for (let item in data) {
    c_data.push({
      data: data[item].items.data,
      label: data[item].label,
      value: item
    });
  }

  for (let item in c_data) {
    const days = c_data[item].data.map(d => d.date);
    for (let day of all_days) {
      if (!days.includes(day)) {
        c_data[item].data.push({ date: day });
      }
    }
    c_data[item].data.sort((a, b) => new Date(a.date) - new Date(b.date));

    c_data[item].data = replaceData(c_data[item].data);
  }
  return c_data;
}
//replace empty data as previous day's data

function replaceData(data) {
  let r_data = [...data];
  for (let i = 0; i < r_data.length; i++) {
    if (!r_data[i].total) {
      if (r_data[i - 1] && r_data[i - 1].total) {
        r_data[i].total = r_data[i - 1].total;
      } else {
        r_data[i].total = 0;
      }
    }
    if (!r_data[i].total_in) {
      r_data[i].total_in = 0;
    }
    if (!r_data[i].total_out) {
      r_data[i].total_out = 0;
    }
  }
  return r_data;
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
//get info from any date
function getLineChartDataFromDate(data, strDate) {
  let strHtml = "",
    current;
  strHtml += `<b class="b-date">Date: ${moment(strDate).format(
    "DD-MM-YYYY"
  )}</b>`;
  strHtml += `<div class='tip-content'>`;
  for (let item of data) {
    strHtml += `<div class='tip-content-row'>`;
    current = item.data.filter(d => d.date === strDate)[0];
    strHtml += `<b>${item.label}</b>`;
    strHtml += `Balance: ${withComma(Math.round(current.total))}<br/>`;
    strHtml += `Total In: ${withComma(Math.round(current.total_in))}<br/>`;
    strHtml += `Total Out: ${withComma(Math.round(current.total_out))}<br/>`;
    strHtml += `</div>`;
  }
  strHtml += `</div>`;
  return strHtml;
}
function getBarChartDataFromDate(data, strDate) {  
  let strHtml = "",
    current;
  strHtml += `<b class="b-date">Date: ${moment(strDate).format(
    "DD-MM-YYYY"
  )}</b>`;
  strHtml += `<div class='tip-content'>`;
  strHtml += `<div class='tip-content-row'>`;
  current = data.data.filter(d => d.date === strDate)[0];
  strHtml += `<b>${data.label}</b>`;
  strHtml += `Balance: ${withComma(Math.round(current.total))}<br/>`;
  strHtml += `Total In: ${withComma(Math.round(current.total_in))}<br/>`;
  strHtml += `Total Out: ${withComma(Math.round(current.total_out))}<br/>`;
  strHtml += `</div>`;
  strHtml += `</div>`;
  return strHtml;
}
//replace data with diff step
// function replaceWithDiff(data, key_name, diff_step) {
//   let replaced = [data[0]],
//     current = data[0][key_name];
//   for (let i = 1; i < data.length; i++) {
//     if (Math.abs(current - data[i][key_name]) >= diff_step) {
//       replaced.push(data[i]);
//       current = data[i][key_name];
//     } else {
//       // replaced.push({ ...data[i], [key_name]: current });
//     }
//   }
//   return replaced;
// }

//replace data with day step
function replaceWithDay(data, day_step, days) {
  let replaced = [],
    sel_days = getSkipDays(days, day_step);

  for (let i = 0; i < data.length; i++) {
    if (sel_days.includes(data[i].date)) {
      replaced.push(data[i]);
    }
  }
  return replaced;
}

//date relation functions
function generateDays(startDate, endDate) {
  let now = startDate,
    dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.format("YYYY-MM-DD").toString());
    now.add(1, "days");
  }
  return dates;
}
function getSkipDays(days, step) {
  let sel_days = [];

  for (let i = 0; i < days.length; i += step) {
    sel_days.push(days[i]);
  }
  if (days.length - (1 % step) !== 0) {
    sel_days.push(days[days.length - 1]);
  }
  return sel_days;
}
function getDays(data) {
  let dates_arr = [];
  for (let item in data) {
    dates_arr.push(...data[item].items.dates);
  }
  return generateDays(moment(d3.min(dates_arr)), moment(d3.max(dates_arr)));
}
function withComma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
