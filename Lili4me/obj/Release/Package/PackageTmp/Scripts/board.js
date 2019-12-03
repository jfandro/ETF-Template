
$(document).ready(function () {

    // First, we create a new instance of portfolios controller to get data from server with LILI API
    $p = new LoyolApp.PortfolioController();
    // Then create a bubbles widget
    var $b = new kpiBubbles('#bubbles');
    // create a function calling api to get kpis
    var getkpis = function (option) {
        $p.get('UserPortfoliosKpis', { option: option }, function (data) {
            $b.load(data);
        });
    }

    // get kpis on YTD by default
    getkpis('1M');

    // whe changing performances analysis
    $('.btn-option').click(function () {
        getkpis($(this).text());
    });


});