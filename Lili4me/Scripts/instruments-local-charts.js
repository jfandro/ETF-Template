
// format of number and date
var numberFormat = d3.format('.2f');
var percentFormat = d3.format('.4f');

// A common color for all of the bar and row charts
var colors = d3.scale.category10();

var ratingColors = d3.scale.ordinal()
    .domain(['A', 'C', 'Z'])
    .range(['#109618', '#FF9900', '#DC3912']); //'#dfe9f1', 

var riskColors = d3.scale.ordinal()
        .domain(["0", "1", "2", "3", "4", "5", "6", "7"])
        .range(['#f80707', '#9cbcd7', '#96ddce', '#addd96', '#e6e474', '#e6a074', '#df9393', '#f80707']);

var complianceColors = d3.scale.ordinal()
    .domain(['A', 'B', 'C', 'D', 'Z'])
    .range(['#deac01', '#bca659', '#b4a984', '#a3a19b', '#a3a19b']);

var popularityColors = d3.scale.ordinal()
    .domain(['Top', 'Followed', 'Not followed'])
    .range(['#b9c458', '#b5bc75', '#b4b798']);

// A common color for all of the bar and row charts
var commonColor = ['#567793', '#e7e7e7'];


// ************************************************************
// ************************ kpi charts  ***********************
// ************************************************************
var kpiCharts = function (url, userid) {
    this.url = url,
    this.option = 'YTD',
    this.userid = userid,
    this.data = [],
    this.widgets = [];
}

kpiCharts.prototype.widget = function (name) {
    var r = null
    this.widgets.forEach(function (w) {
        if (w.name == name)
            r = w;
    });
    return r;
}

kpiCharts.prototype.chart = function (name) {
    var r = null
    this.widgets.forEach(function (w) {
        if (w.name == name)
            r = w.chart;
    });
    return r;
}

kpiCharts.prototype.afterLoad = function () {
}

var newSort = function () {
    $('.display-options').change(function () {
        var check = $(this).attr('checked');
        if (check) {
            var option = $(this).val();
            // only for grids
            me.widgets.forEach(function (w) {
                if (w.type == 'grid') {
                    $(w.name).attr('data-kpi-sort', option);
                    w.chart.sortBy(function (d) { return d[option]; });
                    w.chart.render();
                }
            });
        }
    })
}

kpiCharts.prototype.applySorter = function () {

    var me = this;
    d3.selectAll('.display-options').on('change', function () {
        cb = d3.select(this);
        if (cb.property('checked')) {
            var option = cb.property("value");
            // only for grids
            me.widgets.forEach(function (w) {
                if (w.type == 'grid' || w.type == 'table') {
                    $(w.name).attr('data-kpi-sort', option);
                    w.chart.sortBy(function (d) { return d[option]; });
                    w.chart.redraw();
                }
            });
        }

        $('.help-toggle').click(function (e) {
            e.preventDefault();
            var h = $($(this).data('help')).html();
            $('#help-wrapper > .help-content').html(h);
            $('#wrapper').toggleClass('helped');
        });

    });

}

kpiCharts.prototype.group = function (elts, option) {

    var me = this;
    me.option = option;

    elts.each(function () {

        var $e = $(this),
            id = '#' + $e.attr('id');

        switch ($e.data('kpi-type')) {

            case 'pie':
                $c = me.addPie(id);
                break;

            case 'rows':
                $c = me.addRows(id);
                break;

            case 'bars':
                $c = me.addBars(id);
                break;

            case 'boxes':
                $c = me.addBoxes(id);
                break;

            case 'plots':
                $c = me.addPlots(id);
                break;

            case 'bubbles':
                $c = me.addBubbles(id);
                break;

            case 'counter':
                $c = me.addCounter(id);
                break;

            case 'table':
                $c = me.addTable(id);
                break;

            case 'grid':
                $c = me.addGrid(id);
                break;

        };
    });
}

kpiCharts.prototype.getdata = function (option) {
    var me = this;
    $.get(me.url, { option: option }, function (res) { me.loaddata(res); })
}
kpiCharts.prototype.loaddata = function (data) {
    var charts = this;
    topFollowers = d3.max(data, function (d) { return +d.Followers; }) * 0.66;
    data.forEach(function (d, i) {
        d.yld = +100 * d.Stats.NetReturn,
        d.yldR = Math.round(d.yld),
        d.std = +100 * d.Stats.StdDev,
        d.dts = -d.std, // used for sorting 
        d.token = -d.TokenValue, // used for sorting
        d.Srri = d.Stats.SRRI,
        d.sharpe = +d.Stats.Sharpe,
        d.ManagementFees = +d.ManagementFees,
        d.management = d.IsPassive ? 'Passive' : 'Active',
        //d.qYield = d.Quartiles.Yield,
        d.popularity = d.Followers == 0 ? 'Not followed' : d.Followers >= topFollowers ? 'Top' : 'Followed';
    });
    // keep data after crossfilter application
    charts.data = crossfilter(data);
    // render data on each widgets
    charts.renderAll();
    // call after load function
    charts.afterLoad();
}
kpiCharts.prototype.reset = function (name) {
    var me = this;
    me.widgets.forEach(function (w) {
        if (w.name == name)
            w.reset();
    });
}
kpiCharts.prototype.redrawAll = function () {
    this.widgets.forEach(function (w) {
        w.redraw();
    });
}
kpiCharts.prototype.renderAll = function () {
    var me = this;
    if (!me.widgets)
        return;

    me.widgets.forEach(function (w) {
        w.setChart();
    });

    //window.onresize = function () {
    //    me.widgets.forEach(function (w) {
    //        w.redraw();
    //    });
    //};

    var evt = new CustomEvent('widgetsLoaded', { detail: me.url });
    window.dispatchEvent(evt)

}
kpiCharts.prototype.addCounter = function (name) {
    return new kpiWidget(this, 'counter', name, dc.dataCount(name));
}
kpiCharts.prototype.addPie = function (name) {
    return new kpiWidget(this, 'pie', name, dc.pieChart(name));
}
kpiCharts.prototype.addPlots = function (name) {
    return new kpiWidget(this, 'plots', name, dc.scatterPlot(name));
}
kpiCharts.prototype.addBoxes = function (name) {
    return new kpiWidget(this, 'boxes', name, dc.boxPlot(name));
}
kpiCharts.prototype.addBubbles = function (name) {
    return new kpiWidget(this, 'bubbles', name, dc.bubbleChart(name));
}
kpiCharts.prototype.addRows = function (name) {
    return new kpiWidget(this, 'rows', name, dc.rowChart(name));
}
kpiCharts.prototype.addBars = function (name) {
    return new kpiWidget(this, 'bars', name, dc.barChart(name));
}
kpiCharts.prototype.addGrid = function (name) {
    return new kpiWidget(this, 'grid', name, dc.dataGrid(name));
}
kpiCharts.prototype.addTable = function (name) {
    return new kpiWidget(this, 'table', name, dc.dataTable(name));
}
// ************************************************************
// ************************ kpi widget ************************
// ************************************************************
var kpiWidget = function (parent, type, name, chart) {
    this.parent = parent,
    this.type = type,
    this.name = name,
    this.chart = chart,
    this.marginw = 20,
    this.marginh = 20,
    this.xAxis = '',
    this.yAxis = '',
    this.vignette = null,
    this.dimension = null,
    this.group = null;
    parent.widgets.push(this);
}

// ************************************************************
// ************************ kpi reset *************************
// ************************************************************
kpiWidget.prototype.reset = function () {
    this.chart.filterAll();
    dc.redrawAll();
}
// ************************************************************
// ********************* widget relaod chart ******************
// ************************************************************
kpiWidget.prototype.reload = function () {
    this.setChart();
}
// ************************************************************
// ************************ kpi chart setting *****************
// ************************************************************
kpiWidget.prototype.setChart = function () {

    var data = this.parent.data;

    switch (this.type) {

        case 'pie':
            this.setPie(data);
            break;

        case 'plots':
            this.setPlots(data);
            break;

        case 'boxes':
            this.setBoxes(data);
            break;

        case 'bubbles':
            this.setBubbles(data);
            break;

        case 'rows':
            this.setRows(data);
            //this.addAxis();
            break;

        case 'bars':
            this.setBars(data);
            break;

        case 'grid':
            this.setGrid(data);
            break;

        case 'table':
            this.setTable(data);
            break;

        case 'counter':
            this.setCounter(data);
            break;
    }

    // render data
    try {
        this.chart.render();
    }
    catch (e) {
        console.log('problem on rendering widget ' + this.name);
    }
}

// ************************************************************
// ************************ kpi counter ***********************
// ************************************************************
kpiWidget.prototype.setCounter = function (xdata) {

    this.chart
        .dimension(xdata)
        .group(xdata.groupAll());
}

// ************************************************************
// ************************ kpi pie ***************************
// ************************************************************
kpiWidget.prototype.setPie = function (xdata) {

    var f = $(this.name).data('dimension');
    this.dimension = xdata.dimension(function (d) { return d[f]; });
    this.group = this.dimension.group();

    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .dimension(this.dimension)
        .group(this.group)
        .colorAccessor(function (d) {
            if (f == 'Rating' || f == 'ProfileCompliance')
                return d.key.split('-')[0];
            return d.key;
        })
        .label(function (d) {
            if (f == 'Rating' || f == 'ProfileCompliance')
                return d.key.split('-')[1];
            return d.key;
        })
        .colors(function (d) {
            switch (f) {

                case 'Rating':
                    return ratingColors(d);

                case 'ProfileCompliance':
                    return complianceColors(d);

                case 'popularity':
                    return popularityColors(d);

                default:
                    return colors(d);
            }
        })
        .radius(90)
        .innerRadius(50);
}

// ************************************************************
// ************************ kpi rows **************************
// ************************************************************
kpiWidget.prototype.setRows = function (xdata) {

    this.xAxis = $(this.name).data('x-axis');
    this.yAxis = $(this.name).data('y-axis');

    var f = $(this.name).data('dimension'),
        v = $(this.name).data('accessor'),
        rlabel = $(this.name).data('row-label'),
        xlabel = this.xAxis;

    var dimKey = function (d) { return d[f] },
        yldKey = function (d) { return +d.yld; };

    this.dimension = xdata.dimension(dimKey);

    this.group = this.dimension.group().reduce(
        function (p, v) {
            ++p.count;
            var bisect = d3.bisector(function (d) { return d.value; });
            var pos = bisect.right(p.values, v.yld);
            p.values.splice(pos, 0, { value: +v.yld }); // add
            return p;
        },
        function (p, v) {
            --p.count;
            var bisect = d3.bisector(function (d) { return d.value; });
            var pos = bisect.left(p.values, v.yld);
            p.values.splice(pos, 1); // remove 
            return p;
        },
        function () {
            return {
                count: 0,
                name: '',
                values: [],
                best: function () {
                    return d3.max(this.values, function (v) { return +v.value; });
                },
                mean: function () {
                    return d3.mean(this.values, function (v) { return +v.value; });
                },
            };
        });

    var valueAccessor = function (d) {
        if (v == 'best')
            return d.value.best();
        if (v == 'mean')
            return d.value.mean();
    }

    // ********************** chart settings *************************//
    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .colors(riskColors)
        .colorAccessor(function (d) { return d.key; })
        .margins({ top: 10, left: 10, right: 10, bottom: 40 })
        .dimension(this.dimension)
        .group(this.group)
        .valueAccessor(valueAccessor)
        //.rowsCap(7)
        .elasticX(true)
        .label(function (d) { return rlabel + d.key + ' (' + d.value.count + ' instruments)'; })
        .title(function (d) { return xlabel + ' = ' + numberFormat(valueAccessor(d)) + '%'; });
}

// ************************************************************
// ************************ kpi plots *************************
// ************************************************************
kpiWidget.prototype.setPlots = function (xdata) {

    this.xAxis = $(this.name).data('x-axis');
    this.yAxis = $(this.name).data('y-axis');

    this.dimension = xdata.dimension(function (d) { return [+d.yld, +d.std, d.Type == 'portfolio' ? 0 : d.RiskLevel]; });
    this.group = this.dimension.group();

    var h = $(this.name).innerHeight();

    // ********************************* get the cap and floor for axis **********************************************//
    var pg = this.group.all(),
        xRange = [d3.min(pg, function (d) { return d.key[0] - 1; }), d3.max(pg, function (d) { return d.key[0] + 1; })];
    yRange = [d3.min(pg, function (d) { return d.key[1] - 1; }), d3.max(pg, function (d) { return d.key[1] + 1; })];

    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .margins({ top: 10, left: 30, right: 0, bottom: 40 })
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .xAxisLabel(this.xAxis)
        .yAxisLabel(this.yAxis)
        .x(d3.scale.linear().domain(xRange))
        .y(d3.scale.linear().domain(yRange))
        .symbolSize(8)
        .excludedOpacity(0.5)
        .dimension(this.dimension)
        .group(this.group)
        .colors(riskColors)
        .colorAccessor(function (d) { return d.key[2]; })
        .transitionDuration(500);
}

// ************************************************************
// ************************ kpi boxes *************************
// ************************************************************
kpiWidget.prototype.setBoxes = function (xdata) {

    this.xAxis = $(this.name).data('x-axis'),
    this.yAxis = $(this.name).data('y-axis'),
    f = $(this.name).data('dimension'),
    x = $(this.name).data('accessor');


    var dim = xdata.dimension(function (d) { return d[f]; });
    var grp = dim.group().reduce(
        function (p, v) {
            p.push(+v[x]);
            return p;
        },
        function (p, v) {
            p.splice(p.indexOf(+v[x]), 1);
            return p;
        },
        function () {
            return [];
        }
    );

    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .margins({ top: 10, left: 40, right: 0, bottom: 40 })
        .xAxisLabel(this.xAxis)
        .yAxisLabel(this.yAxis)
        .yAxisPadding('10%')
        .dimension(dim)
        .group(grp)
        .elasticY(true)
        .elasticX(true);

}
// ************************************************************
// ************************ kpi bubbles *************************
// ************************************************************
kpiWidget.prototype.setBubbles = function (xdata) {

    this.xAxis = $(this.name).data('x-axis');
    this.yAxis = $(this.name).data('y-axis');

    this.dimension = xdata.dimension(function (d) { return [d.Name, d.Code, d.ExternalRating]; });
    this.group = this.dimension.group().reduce(
        function (p, v) {
            p.srri = +v.RiskLevel;
            p.yld = +v.yld;
            p.std = +v.std;
            p.radius = +(v.ManagementFees);
            return p;
        },
        function (p, v) {
            p.srri = -v.RiskLevel;
            p.yld = -v.yld;
            p.std = -v.std;
            p.radius = -(v.ManagementFees);
            return p;
        },
        function () {
            return { std: 0, yld: 0, radius: 0, srri: '' };
        }
    );

    // ********************************* get the cap and floor for axis **********************************************//
    var pg = this.group.all(),
        xRange = [d3.min(pg, function (d) { return d.value.yld - 1; }), d3.max(pg, function (d) { return d.value.yld + 1; })];
    yRange = [d3.min(pg, function (d) { return d.value.std - 1; }), d3.max(pg, function (d) { return d.value.std + 1; })];

    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .margins({ top: 10, left: 30, right: 30, bottom: 40 })
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .xAxisLabel(this.xAxis)
        .yAxisLabel(this.yAxis)
        .x(d3.scale.linear().domain(xRange))
        .y(d3.scale.linear().domain(yRange))
        .elasticY(false)
        .elasticX(false)
        .yAxisPadding(1)
        .xAxisPadding(1)
        .renderLabel(true)
        .label(function (d) { return d.key[0]; })
        .title(function (d) {
            return [d.key[0],
                    "Performance: " + numberFormat(d.value.yld) + '%',
                    "Volatilité: " + numberFormat(d.value.std) + '%',
                    "Gestion: " + numberFormat(d.value.radius) + '%',
                    "Profil: " + d.value.srri,
                    "Rating: " + d.key[2]]
                    .join("\n");
        })
        .dimension(this.dimension)
        .group(this.group)
        .colors(riskColors)
        .colorAccessor(function (d) { return d.value.srri; })
        .keyAccessor(function (d) { return d.value.yld; })
        .valueAccessor(function (d) { return d.value.std; })
        .radiusValueAccessor(function (d) { return d.value.radius; })
        .maxBubbleRelativeSize(2)
        .transitionDuration(500);
}

// ************************************************************
// ************************ kpi bars **************************
// ************************************************************
kpiWidget.prototype.setBars = function (xdata) {

    this.xAxis = $(this.name).data('x-axis');
    this.yAxis = $(this.name).data('y-axis');

    var f = $(this.name).data('dimension'),
        xMin = $(this.name).data('x-min'),
        xMax = $(this.name).data('x-max');

    this.dimension = xdata.dimension(function (d) { return d[f]; });
    this.group = this.dimension.group();

    this.chart
        .width($(this.name).innerWidth() - this.marginw)
        .height($(this.name).innerHeight() - this.marginh)
        .margins({ top: 10, left: 30, right: 0, bottom: 40 })
        .centerBar(true)
        .elasticY(true)
        .xAxisLabel(this.xAxis)
        .yAxisLabel(this.yAxis)
        .dimension(this.dimension)
        .group(this.group)
        .x(d3.scale.linear().domain([xMin, xMax]))
        //.gap(5)
        .round(function (n) { return Math.floor(n) + 0.1; })
        .alwaysUseRounding(false)
        .renderHorizontalGridLines(true);
}

// ************************************************************
// ************************ kpi grid **************************
// ************************************************************
kpiWidget.prototype.setGrid = function (xdata) {

    this.dimension = xdata.dimension(function (d) { return d.Srri; });
    this.group = this.dimension.group();

    var elt = $(this.name);
    var domain = elt.data('kpi-domain');
    var sortby = elt.attr('data-kpi-sort');

    this.chart
        .dimension(this.dimension)
        .group(function (d) { return ''; })
        //.group(function (d) { return 'Profil de risques<br/><span class="dc-risk-level">' + d.Srri + '</span>'; })
        .size(1000)
        .html(function (d) { return domain == 'portfolios' ? portfolioVignette(d) : instrumentVignette(d); })
        .sortBy(function (d) { return d[sortby]; })
        .order(d3.descending)
        .on("renderlet", function (grid) {
            $(document).trigger('render-grid');
        });
}

// ************************************************************
// ************************ LOCAL VERSION *********************
// ************************ kpi table  ************************
// ************************************************************
kpiWidget.prototype.setTable = function (xdata) {

    this.dimension = xdata.dimension(function (d) { return d.Name; });

    var div = $(this.name),
        domain = div.data('kpi-domain'),
        size = div.data('page-size'),
        showGroups = div.data('group') == 'off' ? false : true,
        nextbtn = div.data('btn-next'),
        lastbtn = div.data('btn-last'),
        siztxt = div.data('text-size'),
        begtxt = div.data('text-begin'),
        endtxt = div.data('text-end'),
        sortby = div.data('kpi-sort'),
        pag = div.data('page-size'),
        ofs = 0,
        table = this.chart;

    this.chart
        .dimension(this.dimension)
        .transitionDuration(1500)
        .size(Infinity)
        .group(function (d) { return '';})
        .showGroups(showGroups)
        .sortBy(function (d) { return d.yld; })
        .order(d3.descending)
        .columns([
            {
                label: '',
                format: function (d) {
                    // ******************** Here, we call the images managed by the LILI server ****************************************************
                    return '<img src="https://lili2.am/' + d.Type + 's/GetImage/' + d.ID + '" alt="' + d.Name + '" class="img-td-2 img-circle" /> ';
                }
            },
            {
                label: 'Fonds',
                format: function (d) {
                    // ******************** Here, we call the link managed by the LILI server ****************************************************
                    return '<a href="https://lili2.am/' + d.Type + 's/Details/' + d.Code + '" >' + d.Name + '</a><br/>' + d.Owner + '  (<em>' + d.AssetClass + '</em>)';
                }
            },
            {
                label: 'Perf',
                format: function (d) {
                    return numberFormat(d.yld) + '%';
                }
            },
            {
                label: 'Vol.',
                format: function (d) {
                    return numberFormat(d.std) + '%';
                }
            }

        ])

        .on('renderlet', function (table) {
            //togglesSync(); // for help icons
            table.selectAll('.dc-table-row').classed('text-nowrap', true);
            table.selectAll('td._0').attr('width', 40);
            table.selectAll('td._1').attr('width', 200);
            table.selectAll('td._2').classed('text-right', true).attr('width', 80);
            table.selectAll('td._3').classed('text-right', true).attr('width', 80);
        });

    // Apply the page size here
    update();

    function display() {
        d3.select(begtxt).text(ofs);
        d3.select(endtxt).text(ofs + pag - 1);
        d3.select(lastbtn).attr('disabled', ofs - pag < 0 ? 'true' : null);
        d3.select(nextbtn).attr('disabled', ofs + pag >= xdata.size() ? 'true' : null);
        d3.select(siztxt).text(xdata.size());
    }

    function update() {
        table.beginSlice(ofs);
        table.endSlice(ofs + pag);
        display();
    }

    this.next = function () {
        ofs += pag;
        update();
        table.redraw();
    }

    this.last = function () {
        ofs -= pag;
        update();
        table.redraw();
    }

}
// ************************************************************
// ************************ kpi redraw ************************
// ************************************************************
kpiWidget.prototype.redraw = function () {

    if (this.type == 'rows' || this.type == 'pie')
        this.chart.width($(this.name).innerWidth() - this.marginw).redraw();
    else if (this.type == 'bars' || this.type == 'plots' || this.type == 'bubbles' || this.type == 'boxes')
        this.chart.width($(this.name).innerWidth() - this.marginw).rescale().redraw();
}

// ************************************************************
// ************************ kpi x axis ************************
// ************************************************************
kpiWidget.prototype.addAxis = function () {
    this.chart.svg()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", this.chart.width() / 2)
            .attr("y", this.chart.height() - 3.5)
            .text(this.xAxis);
}