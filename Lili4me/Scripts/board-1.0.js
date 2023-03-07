
$(document).ready(function () {

    // First, we create a new instance of portfolios controller to get data from server with LILI API
    $p = new LoyolApp.PortfolioController();
    // Then create a bubbles widget
    var $b = new kpiBubbles('#bubbles');
    // create a function calling api to get kpis
    var getkpis = function (option) {
        $p.get('UserPortfoliosKpis', { option: option }, function (data) {
            $b.load(data);
            loadGrid(data);
        });
    }

    // get kpis on YTD by default
    getkpis('1M');

    // whe changing performances analysis
    $('.btn-option').click(function () {
        getkpis($(this).text());
    });

    var loadGrid = function (data) {
        var $cx = $('#myportfolios')
        $.each(data, function (i, p) {
            var url = "url('" + LoyolApp.Settings.domain + "/" + p.ImageUrl + "')";
            var $cd = $('<div>').addClass('card card-img col-sm-3').attr('style', "background-image:" + url);
            var $bd = $('<div>').addClass('card-body');
            var $tt = $('<h3>').html(p.Name);
            var $rt = $('<p>').html('Prf = ' + parseFloat(100 * p.Stats.Yield).toFixed(2) + '%');
            var $st = $('<p>').html('Vol = ' + parseFloat(100 * p.Stats.StdDev).toFixed(2) + '%');
            $bd.append($tt, $rt, $st);
            $cd.append($bd);
            $cx.append($cd);
        })
    }

});