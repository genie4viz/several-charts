// set the dimensions and margins of the graph
const sample_text = "Lem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to amke a type specimen.";
let containerWidth = parseFloat(
    d3.select(".chart").style("width")
  ),
  containerHeight = 600;

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
    extra_info    
  );
  drawBarChart(
    containerWidth,
    containerHeight,
    f_data,
    "avgseasonal",
    extra_info    
  );
}
