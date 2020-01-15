//data format functions
function normalizeData(data) {
  const all_days = getDays(data);

  let c_data = [],
    r_data = [];
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

    c_data[item].data = replaceData(c_data[item].data, "total");
  }
  return c_data;
}
//replace empty data as previous day's data
function replaceData(data, key_name) {
  let r_data = [...data];
  for (let i = 0; i < r_data.length; i++) {
    if (!r_data[i][key_name]) {
      if (r_data[i - 1] && r_data[i - 1][key_name]) {
        r_data[i][key_name] = r_data[i - 1][key_name];
      } else {
        r_data[i][key_name] = 0;
      }
    }
  }
  return r_data;
}

//replace data with diff step
function replaceWithDiff(data, key_name, diff_step) {
  let replaced = [data[0]],
    current = data[0][key_name];
  for (let i = 1; i < data.length; i++) {
    if (Math.abs(current - data[i][key_name]) >= diff_step) {
      replaced.push(data[i]);
      current = data[i][key_name];
    } else {
      // replaced.push({ ...data[i], [key_name]: current });
    }
  }
  return replaced;
}

//replace data with day step
function replaceWithDay(data, day_step, days) {
  let replaced = [],
    sel_days = [];

  for (let i = 0; i < days.length; i += day_step) {
    sel_days.push(days[i]);
  }

  if (days.length % day_step !== 0) {
    sel_days.push(days[days.length - 1]);
  }

  for (let i = 0; i < data.length; i++) {
    if (sel_days.includes(data[i].date)) {
      replaced.push(data[i]);
    }
  }
  return replaced;
}

//date relation functions
const formatMD = d3.timeFormat("%b %d");
const formatYMD = d3.timeFormat("%Y-%m-%d");

function generateDays(startDate, endDate) {
  let now = startDate,
    dates = [];

  while (now.isSameOrBefore(endDate)) {
    dates.push(now.format("YYYY-MM-DD").toString());
    now.add(1, "days");
  }
  return dates;
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
