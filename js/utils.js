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
//detect media
function detectMediaQuery() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    //is mobile
    console.log("mobile");
  } else if (
    window.matchMedia("(min-width: 768px) and (max-width: 991px)").matches
  ) {
    console.log("tablet");
  } else if (window.matchMedia("(max-width: 1500px)").matches) {
    console.log("desktop");
  } else {
    console.log("extra");
  }
}
