// set the dimensions and margins of the graph
// let containerWidth = d3.select("#chart-container").style("width"),
//   containerHeight = d3.select("#chart-container").style("height"),
const c_width = 700,
  c_height = 400;

init();

function init() {  
  
  const f_data = normalize(data.calculation_basis_balances.items);
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
      mostrecentquarter: "#e68017"
    }    
  }
  
  addLineChart(
    c_width,
    c_height,
    f_data,
    extra_info
  );
  // main_bank_account_overdraft_limit:
  //     data.organisation_data.account.data.main_bank_account_overdraft_limit || 0
  // addBarChart(
  //   c_width,
  //   c_height,
  //   convertBarChartData(data, "seasonal")
  // );
  //   addBarChart();
  //   addDonutChart();
}

//events
window.addEventListener("resize", onResize);

function onResize() {
  //   console.log(window.innerWidth, window.innerHeight);
}
