// set the dimensions and margins of the graph
let containerWidth = parseFloat(
    d3.select("#line-chart-container").style("width")
  ),
  containerHeight = 400;

init();

function init() {
  const extra_info = {
      currency_postfix: data.calculation_basis_balances.currency_postfix,
      first_balance: data.calculation_basis_balances.first_balance,
      currency_prefix: data.calculation_basis_balances.currency_prefix,
      main_bank_account_overdraft_limit:
        data.organisation_data.account.data.main_bank_account_overdraft_limit,
      color: {
        seasonal: "#c6333f",
        mostrecent: "#009873",
        avgseasonal: "#3a468d",
        avgoneyear: "#77adda",
        mostrecentquarter: "#e68017",
        total_in: "#5b9ed6",
        total_out: "#283483"
      }
    },
    f_data = normalizeData(data.calculation_basis_balances.items);
    
  drawLineChart(
    containerWidth,
    containerHeight,
    f_data,
    extra_info,
    5 //difference of days for show
  );
}
