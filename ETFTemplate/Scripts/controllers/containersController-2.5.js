/**
 * Script focus on containers feed 
 *
 * 
 **/

myAppContainers = function (app, code) {

    this.settings = app.Settings;
    this.culture = app.Settings.language;
    this.code = code;
    this.pc = new app.PortfolioController();
    this.ic = new app.InstrumentController();
    this.oc = new app.OperationsController();
    this.qc = null;

}

/**
 * populate dataviz plugins
 * @param {any} aftershow
 */
myAppContainers.prototype.showDataviz = function (aftershow) {

    var me = this;
    me.showAllocation(function () {
        me.showNavs();
        me.showStats();
        me.showGeomaps();
        me.showExtras();
        me.showRadars();
        me.showStrategy();
        me.showWaterfallResults();
        me.showCorrelations();
        me.showSectors(aftershow);
    });
}

/**
 * fill geomap containers
 */
myAppContainers.prototype.showGeomaps = function () {
    
    var code = this.code,
        $p = this.pc,
        urlpoints = this.settings.domain + '/api/Instruments/GeoMap';

    $('.geomap').each(function () {

        var container = $(this),
            id = '#' + container.attr('id'),
            maptable = container.data('table');

        // empty targeted map;
        container.empty();
        $(maptable).empty();

        // Create a world map using data points given by server (json format)
        var map = new geomap(id, urlpoints, $(maptable), true);
        // Get the detailed geo exposures from the server in Json format
        $p.get('geoexposures', { code: code }, function (data) {
            map.load(data);
        });

    })

}

/**
 * fill sectors, breakdowns and extrabreadowns containers
 */
myAppContainers.prototype.showSectors = function (callback) {

    var code = this.code,
        culture = this.culture,
        $p = this.pc;

    $('.sectors').each(function () {
        var container = $(this),
            action = container.data('action');
        container.empty();
        var sector = new sectormap('#' + container.attr('id'));
        $p.get(action, { code: code, culture: culture }, function (data) {
            sector.load(data, null, null);
            if (callback)
                callback();
        });
    });

    $('.breakdowns').each(function () {
        var container = $(this),
            action = container.data('action'),
            legend = container.data('legend');
        container.empty();
        var map = new breakdownmap('#' + container.attr('id'));
        $p.get(action, { code: code }, function (data) {
            map.load(data, legend, function () {
                if (callback)
                    callback();
            });
        });
    });

    $('.extra-breakdowns').each(function () {
        var container = $(this),
            key = container.data('breakdown'),
            legend = container.data('legend');
        container.empty();
        var map = new breakdownmap('#' + container.attr('id'));
        $p.get('ExtraBreakdown', { code: code, key: key }, function (data) {
            map.load(data, legend, function () {
                if (callback)
                    callback();
            });
        });
    });
};

/**
 * show extra data maps
 * @param {any} callback
 */
myAppContainers.prototype.showExtras = function (callback) {

    var code = this.code,
        $p = this.pc;

    $('.extramap').each(function () {
        var container = $(this),
            action = container.data('action'),
            key = container.data('key'),
            sector = new sectormap('#' + container.attr('id'));
        container.empty();
        $p.get(action, { code: code, key: key }, function (data) {
            sector.load(data, null, null);
            if (callback)
                callback();
        });
    });

}

/**
 * show sankey-chart
 * @param {any} callback
 */
myAppContainers.prototype.showStrategy = function (callback) {

    var code = this.code,
        $p = this.pc;

    $('.sankey-chart').each(function () {

        var container = $(this),
            sankey = new sankeychart('#' + container.attr('id'));

        container.empty();
        $p.get('Strategy', { code: code }, function (data) {
            sankey.load(data, null, null);
            if (callback)
                callback();
        });
    });

}

/**
 * fill radars
 */
myAppContainers.prototype.showRadars = function (callback) {
    var code = this.code,
        $q = this.qc;

    $('.radar').each(function () {
        var container = $(this),
            questionid = container.data('question'),
            sector = new esgradar('#' + container.attr('id'));
        $q.get('Radar', { questionid: questionid, objectid: code, withUserScores: false }, function (data) {
            sector.load(data, null, null);
            if (callback)
                callback();
        });
    });
};

/**
 * populate container-indicators table
 */
myAppContainers.prototype.showStats = function () {
    var code = this.code,
        $p = this.pc,
        div = $('.container-indicators'),
        tbody = div.find('tbody');

    div.fadeOut(500, function () {
        tbody.empty();
        $p.get('stats', { code: code }, function (data) {
            $p.populateIndicators(data, tbody);
            div.fadeIn();
        });
    })
}

/**
 * fill allocation treemap
 */
myAppContainers.prototype.showAllocation = function (callback) {

    var me = this,
        $p = me.pc,
        $i = me.ic,
        code = me.code,
        culture = me.culture,
        domain = me.settings.domain,
        loadImages = function (data) {
            $.each(data, function (i, item) {
                item.Image = domain + item.Image;
                if (item.Children) {
                    loadImages(item.Children);
                }
            })
        };

    $('.allocation-container').each(function () {
        var container = $(this),
            id = '#' + container.attr('id');

        $i.get('assetclasscolors', null, function (colors) {
            $p.get('assetAllocations', { code: code, culture: culture }, function (data) {
                if (data) {
                    loadImages(data.Children);
                    var tree = new treemap(id);
                    tree.setcolors(colors, function () {
                        tree.load(data, callback);
                    });
                }
            });
        });
    })

};

/**
 * populate a container with portfolio holdings
 * @param {any} data
 * @param {any} div
 */
myAppContainers.prototype.populateHoldings = function (data, div) {
    this.pc.populateHoldings(data, div);
}

/** fill navs-container */
myAppContainers.prototype.showNavs = function () {

    var code = this.code,
        $i = this.ic;

    $('.navs-container').each(function () {
        var container = $(this),
            linechart = container.find('.lines-chart'),
            id = '#' + linechart.attr('id'),
            option = linechart.data('option'),
            $n = new navschart(id);

        $i.get('get', { id: code, benchmark:true }, function (result) {
            if (result) {
                $('.tab-svg').addClass('active');
                $i.get('prices', { id: code, option: option }, function (data) {
                    $n.load(data, code, false, function () {
                        if (result.benchmark) {
                            var codeB = result.benchmark.code;
                            $i.get('prices', { id: codeB, option: option }, function (data2) {
                                $n.load(data2, codeB, true, function () {
                                    $('.tab-svg').removeClass('active');
                                });
                            });
                        }
                        else
                        {
                            $n.populate();
                            $('.tab-svg').removeClass('active');
                        }
                    });
                });
            }
        })

        // get the historical positions from the server in Json format
        //$i.get('prices', { id: code, option: option }, function (data) {
        //    $n.load(data, code, true, function () {
        //        $('.tab-svg').removeClass('active');
        //    });
        //});

    });

}

/** fill results-container with waterfall */
myAppContainers.prototype.showWaterfallResults = function () {

    var code = this.code,
        $p = this.pc;

    $('.results-container').each(function () {
        var container = $(this),
            fromDate = container.find('input[name="fromDate"]'),
            toDate = container.find('input[name="toDate"]'),
            chart = container.find('.waterfall-container'),
            id = '#' + chart.attr('id'),
            $w = new waterfall(id);

        // get the historical positions from the server in Json format
        $p.get('PnLBreakdowns', { code: code, fromdate: fromDate.val(), toDate: toDate.val() }, function (data) {
            $w.load(data, function () { });
        });

        // button to display portfolio monthly returns
        container.find('.btn-show-breakdowns').click(function () {
            chart.empty();
            $p.get('PnLBreakdowns', { code: code, fromdate: fromDate.val(), toDate: toDate.val() }, function (data) {
                $w = new waterfall(id); // new one
                $w.load(data, function () { });
            });
        });

    });

}

/** fill correlations-container with heatmap */
myAppContainers.prototype.showCorrelations = function () {

    var code = this.code,
        $p = this.pc;

    $('.correlations-container').each(function () {
        var container = $(this),
            chart = container.find('.heatmap'),
            id = '#' + chart.attr('id');

        // get the matrix of correlations from the server 
        $p.get('CorrelationsMatrix', { code: code }, function (data) {
            $w = new correlationmap(id);
            $w.load(data, function () { });
        });

    });

}

/** fill models-container with gallery of cards */
myAppContainers.prototype.showModels = function (containers) {

    var code = this.code,
        $p = this.pc,
        domain = this.settings.domain,
        culture = this.culture;

    $(containers).each(function () {
        var container = $(this);
        container.empty();
        $p.get('LastHoldings', { code: code, transparency: false, culture: culture }, function (data) {
            $.each(data.Holdings, function (i, h) {
                var item = h.Asset;
                if (item.code != 'EUR') {
                    var card = $('<div>').addClass('card card-model'),
                        img = $('<img>').addClass('card-img-top').attr('src', domain + '/Instruments/GetImage/' + item.id),
                        body = $('<div>').addClass('card-body'),
                        tb = $('<h5>').addClass('card-title').html(item.name),
                        txt = $('<p>').addClass('card-text').html(item.strategy),
                        textfoot = h.weight + '% ' + item.category + ' - Risques ' + item.LastStat.SRRI,
                        footer = $('<div>').addClass('card-footer small text-muted').html(textfoot);

                    body.append(tb, txt);
                    card.append(img, body, footer);
                    container.append(card);
                }
            });
        });
    })
};

/**
 * populate holdings table
 * @param {any} data
 * @param {any} div
 */
myAppContainers.prototype.populateHoldings = function (data, div) {

    var myLocalFormat = { style: "currency", currency: "EUR" };
    $(div).empty();
    $.each(data.Holdings, function (i, item) {
        var tr = $('<tr>').append(
            $('<td>').append($('<img>').addClass('td-img').attr('src', 'https://etfreporting.com/Assets/GetImage/' + item.Asset.id)),
            $('<td>').text(item.Asset.code),
            $('<td>').text(item.Asset.name),
            $('<td>').text(item.Asset.class),
            $('<td class="text-end">').text(item.qty.toFixed(4)),
            $('<td class="text-end">').text(item.costprice.toFixed(3)),
            $('<td class="text-end">').text(item.unrealizedpnl.toLocaleString("fr-FR", myLocalFormat)),
            $('<td class="text-end">').text(parseFloat(100 * item.return).toFixed(2) + "%"),
            $('<td class="text-end">').text(item.marketprice),
            $('<td class="text-end">').text(item.npv.toLocaleString("fr-FR", myLocalFormat)),
            $('<td class="text-end">').text(item.weight + '%')
        );
        tr.appendTo(div);
    });
}

/**
 * populate documents table
 * @param {any} data
 * @param {any} div
 */
myAppContainers.prototype.populateDocuments = function (data, div) {
    var tbody = div.find('tbody'),
        title = div.data('document');
    tbody.empty();
    $.each(data, function (i, item) {
        if (item.title == title) {
            var a = $('<a>').attr('href', item.url).text(item.title);
            var tr = $('<tr>').append(
                $('<td>').append($('<img>').addClass('td-img').attr('src', 'https://etfreporting.com' + item.icon)),
                $('<td>').text(item.code),
                $('<td>').text(item.name),
                $('<td>').append(a));
            tr.appendTo(tbody);
        }
    });
}

/**
 * populate indicators table
 * @param {any} data
 * @param {any} div
 */
myAppContainers.prototype.populateIndicators = function (data, div) {
    div.empty();
    $.each(data, function (i, obj) {
        var net = (100 * obj.netreturn).toFixed(2),
            std = (100 * obj.stddev).toFixed(2),
            shp = obj.sharpe.toFixed(2),
            mdd = (100 * obj.maxdrawdown).toFixed(2),
            var95 = (100 * obj.var95).toFixed(2);
        tr = $('<tr>').append(
            $('<td class="text-center">').text(obj.depth),
            $('<td class="text-end">').text(net + "%"),
            $('<td class="text-end">').text(std + "%"),
            $('<td class="text-end">').text(shp),
            $('<td class="text-end">').text(mdd + "%"),
            $('<td class="text-end">').text(var95 + "%")
        );
        tr.appendTo(div);
        if (obj.depth == "STD") {
            yld = (100 * obj.yield).toFixed(2),
                $('.yld-container').text(yld);
        }
    });

}

/** populate document tables */
myAppContainers.prototype.showDocuments = function () {
    var me = this,
        code = this.code;
    me.pc.get('holdingpages', { code: code, key: '' }, function (docs) {
        me.populateDocuments(docs, $('#dici-table'));
        me.populateDocuments(docs, $('#reporting-table'));
    })
}

/** show portfolio data */
myAppContainers.prototype.showPortfolioSynthesis = function (items) {

    var $p = this.pc,
        code = this.code,
        myLocalFormat = { style: "currency", currency: "EUR" };

    $p.get('synthesis', { code: code }, function (data) {
        $(items).each(function () {
            var item = $(this);
            item.html(data[item.data('indicator')].toLocaleString("fr-FR", myLocalFormat));
        })
    })

}

/** show portfolio properties */
myAppContainers.prototype.showProperties = function (div, r) {

    var ptf = r.Portfolio;
    div.find('.pr-currencycode').html(ptf.currencycode);
    div.find('.pr-universe').html(ptf.universe ? ptf.universe.name : 'Compte titres');
    div.find('.pr-universe-rate').html(ptf.universe ? ptf.universe.ManagementFees.rate + '%' : '?');
    div.find('.pr-class').html(ptf.class);
    div.find('.pr-srri').html(ptf.srri);
    div.find('.pr-createdon').html(ptf.createdon);
    if (ptf.Benchmark)
        div.find('.pr-benchmark').html(ptf.Benchmark.name);

}

// refresh cash table
myAppContainers.prototype.showTreasury = function () {
    var $o = this.oc,
        code = this.code;
    $o.get('portfoliocashflowindex', { code: code }, function (flows) {
        $o.populateTreasury(flows, '.container-cashflows tbody');
    })
}

// refresh compliances/warnings table
myAppContainers.prototype.showCompliances = function (withcheck) {
    var $p = this.pc,
        code = this.code;
    $p.get('warnings', { code: code, withcheck: withcheck }, function (warnings) {
        $p.populateCompliances(warnings, $('.table-compliances'));
    });
}

// refresh positions
myAppContainers.prototype.showHoldings = function (div, d, callback) {
    var $p = this.pc,
        code = this.code;
    // Get the historical holdings
    $(div).fadeOut(1000, function () {
        var params = { code: code, valuedate: d };
        $p.get('holdings', params, function (data) {
            $p.populateHoldings(data, div);
            $(div).fadeIn(500);
            callback();
        });
    })
}

// refresh operations table
myAppContainers.prototype.showOperations = function (div, executed) {
    var $o = this.oc,
        code = this.code;

    $o.get('portfolioindex', { code: code }, function (operations) {
        $o.populateTable(operations, div + ' tbody', executed);
    })
}
