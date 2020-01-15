// set the dimensions and margins of the graph
// let containerWidth = d3.select("#chart-container").style("width"),
//   containerHeight = d3.select("#chart-container").style("height"),
const c_width = 700,
  c_height = 400;

init();

function init() {  
  
  const f_data = normalizeData(data.calculation_basis_balances.items);
  console.log(f_data,' ppp')
  const extra_info = {
    currency_postfix: data.calculation_basis_balances.currency_postfix,
    first_balance: data.calculation_basis_balances.first_balance,
    currency_prefix: data.calculation_basis_balances.currency_prefix,
    main_bank_account_overdraft_limit: data.organisation_data.account.data.main_bank_account_overdraft_limit,
    color: {
      seasonal: "#c6333f",
      mostrecent: "#009873",
      avgseasonal: "#3a468d",
      avgoneyear: "#77adda",
      mostrecentquarter: "#e68017",
      total_in: "#5b9ed6",
      total_out: "#283483"
    }
  }
  
  addLineChart(
    c_width,
    c_height,
    f_data,
    extra_info
    // 500 //difference of nested y values : diff_step
  );
  
  addBarChart(
    c_width,
    c_height,
    f_data,
    extra_info
  );
  
  //   addDonutChart();
}

//events
window.addEventListener("resize", onResize);

function onResize() {
  //   console.log(window.innerWidth, window.innerHeight);
}
