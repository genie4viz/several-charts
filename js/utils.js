//data format functions
function normalize(data) {
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
    //replace empty data as previous day's data
    for (let k = 0; k < c_data[item].data.length; k++) {
      if (!c_data[item].data[k].total) {
        if (c_data[item].data[k - 1] && c_data[item].data[k - 1].total) {
          c_data[item].data[k].total = c_data[item].data[k - 1].total;
        } else {
          c_data[item].data[k].total = 0;
        }
      }
    }
  }
  return c_data;
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
