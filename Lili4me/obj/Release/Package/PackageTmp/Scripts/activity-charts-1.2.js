
var colors = d3.scale.category20b();

// ************************************************************
// ************************ activity charts *******************
// ************************************************************
var activityCharts = function () {
    this.url = '',
    this.data = [],
    this.widgets = [],
    this.minDate = null,
    this.maxDate = null,
    this.numberFormat = d3.format('.2f'),
    this.percentFormat = d3.format('.4f'),
    this.dateFormat = d3.time.format('%Y/%m/%d'),
    this.localDateFormat = d3.time.format('%d/%m/%Y'),
    this.priceFormat = d3.format('.4f'),
    this.tradeColors = d3.scale.ordinal().domain(['buy', 'sale']).range(["#a3b4c2", "#e7e7e7"]),
    this.pnlColors = d3.scale.ordinal().domain(['gain', 'loss']).range(["#8fb082", "#c09a9a"]);
}
// ************************************************************
// ************************ get a widget **********************
// ************************************************************
activityCharts.prototype.widget = function (name) {
    var r = null
    this.widgets.forEach(function (w) {
        if (w.name == name)
            r = w;
    });
    return r;
}
// ************************************************************
// ****************** get chart with a name *******************
// ************************************************************
activityCharts.prototype.chart = function (name) {
    var r = null
    this.widgets.forEach(function (w) {
        if (w.name == name)
            r = w;
    });
    return r;
}


// ************************************************************
// ******************************* get data *******************
// ************************************************************
activityCharts.prototype.getdata = function () {
    // use me as the root
    me = this;
    // Get data from server
    d3.json(this.url, function (error, data) {
        me.loaddata(data);
    });
}



// ************************************************************
// ************************* load data ************************
// ************************************************************
activityCharts.prototype.loaddata = function (data) {

    var me = this;

    // parse data
    data.forEach(function (d, i) {
        d.dd = me.dateFormat.parse(d.date);
        d.net = +me.numberFormat(d.net);
        //d.prf = (d.market) ? + numberFormat(d.market.performance) : 0;
        //d.pl = d.weight > 0 ? (d.market ? (d.market.pnl > 0 ? 'gain' : 'loss') : 'unknown') : (d.pnl > 0 ? 'gain' : 'loss');
        d.pl = d.pnl > 0 ? 'gain' : 'loss';
        d.weight = +100 * me.percentFormat(d.weight);
        d.aweight = +Math.abs(d.weight);
        d.pnl = +me.numberFormat(d.pnl);
        d.contrib = -d.netreturn * d.weight;
        d.exit = d.weight > 0 ? 0 : +(d.net - d.pnl);
        d.class = d.asset.class;
        d.category = '?'; // d.asset.category;
        d.issuer = d.asset.issuer;
    });

    // for barchart in order to include main date and mew date
    me.minDate = d3.time.day.offset(d3.min(data, function (d) { return d.dd; }), -5);
    //me.maxDate = d3.time.day.offset(d3.max(data, function (d) { return d.dd; }), +5);
    me.maxDate = new Date();

    // save data as property
    me.data = crossfilter(data); // call crossfilter

    // render all widgets
    me.renderAll(); // render data on each widgets

}

// ************************************************************
// ******************* reset one elt by name *******************
// ************************************************************
activityCharts.prototype.reset = function (name) {
    this.widgets.forEach(function (w) {
        if (w.name == name)
            w.reset();
    });
}

// ************************************************************
// ************************ group elts *******************
// ************************************************************
activityCharts.prototype.group = function (elts) {
    var me = this;

    elts.each(function () {

        var $e = $(this),
            id = '#' + $e.attr('id');

        switch ($e.data('chart')) {

            case 'pie':
                $c = me.addPie(id);
                break;

            case 'rows':
                $c = me.addRows(id);
                break;

            case 'bars':
                $c = me.addBars(id);
                break;

            case 'table':
                $c = me.addTable(id);
                break;

        };
    });
}


// ************************************************************
// ************************** add rows ************************
// ************************************************************
activityCharts.prototype.addRows = function (name) {
    return new widgetActivity(this, 'rows', name, dc.rowChart(name));
}


// ************************************************************
// ************************** add bars ************************
// ************************************************************
activityCharts.prototype.addBars = function (name) {
    return new widgetActivity(this, 'bars', name, dc.barChart(name));
}


// ************************************************************
// ************************** add table ***********************
// ************************************************************
activityCharts.prototype.addTable = function (name) {
    return new widgetActivity(this, 'table', name, dc.dataTable(name));
}


// ************************************************************
// ************************** add pie ************************
// ************************************************************
activityCharts.prototype.addPie = function (name) {
    var w = new widgetActivity(this, 'pie', name, dc.pieChart(name));
    w.marginh = 0;
    w.marginw = 0;
    return w;
}


// ************************************************************
// ************************** redraw when resize **************
// ************************************************************
activityCharts.prototype.redrawAll = function () {
    var me = this;
    me.widgets.forEach(function (w) {
        w.redraw();
    });
}

// ************************************************************
// ************************** render all charts **************
// ************************************************************
activityCharts.prototype.renderAll = function () {

    var me = this;

    me.widgets.forEach(function (w) {
        w.setChart();
    });

    var evt = new CustomEvent('widgetsLoaded', { detail: me.url });
    window.dispatchEvent(evt)
}


// ************************************************************
// ************************ widget activity *******************
// ************************************************************
var widgetActivity = function (parent, type, name, chart) {
    this.parent = parent,
    this.type = type,
    this.name = name,
    this.chart = chart,
    this.marginw = 20,
    this.marginh = 20,
    this.xAxis = '',
    this.yAxis = '',
    this.colors = d3.scale.category20b(),
    this.vignette = null,
    this.dimension = null,
    this.range = null,
    this.minDate = null,
    this.maxDate = null,
    this.group = null;
    parent.widgets.push(this);
}


// ************************************************************
// ************************ widget set chart ******************
// ************************************************************
widgetActivity.prototype.setChart = function () {

    var data = this.parent.data;

    switch (this.type) {

        case 'pie':
            this.setPie(data);
            break;

        case 'rows':
            this.setRows(data);
            break;

        case 'bars':
            this.setBars(data);
            break;

        case 'table':
            this.setTable(data);
            break;
    }

    try {
        this.chart.render();
    }
    catch (e) {
        console.log('problem on rendering widget ' + this.name);
    }
}

// ************************************************************
// ************************ widget data ***********************
// ************************************************************
widgetActivity.prototype.getData = function (key) {
    return $(this.name).data(key);
}

// ************************************************************
// ************************ widget reset **********************
// ************************************************************
widgetActivity.prototype.reset = function () {
    this.chart.filterAll();
    dc.redrawAll();
}

// ************************************************************
// ************************ widget redraw *********************
// ************************************************************
widgetActivity.prototype.redraw = function () {

    var w = $(this.name).innerWidth() - this.marginw;

    try {
        if (this.type == 'pie')
            this.chart.width(w).height(w).redraw();
        else if (this.type == 'rows')
            this.chart.width(w).redraw();
        else if (this.type == 'bars')
            this.chart.width(w).rescale().redraw();
    }
    catch (e) {
        console.log('problem on widget ' + this.name);
    }

}

/* callback for when data is added to the current filter results */
widgetActivity.prototype.reduceAdd = function (p, v) {
    ++p.count;
    p.weight += v.weight;
    p.aweight += v.aweight;
    p.pnl += v.pnl;
    p.net += v.net;
    p.exit += v.exit;
    p.gross += Math.abs(v.net);
    p.netreturn = p.exit == 0 ? 0 : 100 * p.pnl / p.exit;
    p.contrib += v.contrib;
    return p;
}

/* callback for when data is removed from the current filter results */
widgetActivity.prototype.reduceRemove = function (p, v) {
    --p.count;
    p.weight -= v.weight;
    p.aweight -= v.aweight;
    p.pnl -= v.pnl;
    p.net -= v.net;
    p.contrib -= v.contrib;
    p.exit -= v.exit;
    p.gross -= Math.abs(v.net);
    p.netreturn = p.exit == 0 ? 0 : 100 * p.pnl / p.exit;
    return p;
}

/* initialize p */
widgetActivity.prototype.reduceInitial = function () {
    return {
        count: 0,
        weight: 0,
        net: 0,
        pnl: 0,
        contrib: 0,
        gross: 0,
        exit: 0,
        aweight: 0,
        contrib: 0,
        netreturn: 0,
        avg: function () { return this.count == 0 ? 0 : this.aweight / this.count; }
    };
}

// ************************************************************
// ************************** widget pie **********************
// ************************************************************
widgetActivity.prototype.setPie = function (xdata) {

    var me = this,
        f = $(this.name).data('dimension'),
        l = $(this.name),
        w = Math.max(10, l.innerWidth() - this.marginw),
        h = l.innerWidth() - this.marginh,
        c = (f == 'trade') ? this.parent.tradeColors : this.parent.pnlColors;

    this.dimension = xdata.dimension(function (d) { return d[f]; });
    this.group = this.dimension.group().reduce(me.reduceAdd, me.reduceRemove, me.reduceInitial);

    this.chart
        .width(w)
        .height(h)
        .dimension(this.dimension)
        .group(this.group)
        .colors(c)
        .colorAccessor(function (d) { return d.key; })
        .valueAccessor(function (d) { return d.value.count; })
        .title(function (d) {
            return [d.key,
                    d.value.count + ' operations'].join("\n");
        })
        .radius(70)
        .innerRadius(40);
}
// ************************************************************
// ********************* widget relaod chart ******************
// ************************************************************
widgetActivity.prototype.reload = function () {
    this.setChart();
}
// ************************************************************
// ************************** widget row **********************
// ************************************************************
widgetActivity.prototype.setRows = function (xdata) {

    var me = this,
        f = $(this.name).data('dimension'),
        v = $(this.name).data('value'),
        l = $(this.name),
        w = Math.max(10, l.innerWidth() - this.marginw),
        h = l.innerHeight() - this.marginh;

    var xlabel = this.getData('x-label'),
        ylabel = this.getData('y-label'),
        zlabel = this.getData('z-label');

    this.dimension = xdata.dimension(function (d) { return d[f]; });
    this.group = this.dimension.group().reduce(me.reduceAdd, me.reduceRemove, me.reduceInitial);

    this.chart
        .width(w)
        .height(h)
        .margins({ top: 10, left: 10, right: 10, bottom: 40 })
        .dimension(this.dimension)
        .group(this.group)
        .colors(colors)
        .colorAccessor(function (d) { return d.key; })
        .valueAccessor(function (d) { return d.value[v]; })
        .ordering(function (d) { return -d.value[v]; })
        .label(function (d) { return d.key + ' (' + d3.format(".2f")(d.value[v]) + ')'; })
        .title(function (d) {
            return ['Impact moyen :' + d3.format(".2f")(d.value.avg()) + '% du portefeuille',
                    d.value.count + ' operation(s) comptabilisée(s)',
                    'Résultats réalisés: ' + d3.format(".2f")(d.value.netreturn) + '%'].join("\n");
        })
        .elasticX(true);

}

// ************************************************************
// ************************** widget bar **********************
// ************************************************************
widgetActivity.prototype.setBars = function (xdata) {

    var me = this,
        f = $(this.name).data('dimension'),
        v = $(this.name).data('value'),
        t = $(this.name).data('time'),
        l = $(this.name),
        w = Math.max(10, l.innerWidth() - this.marginw),
        h = l.innerHeight() - this.marginh,
        minDate = me.parent.minDate,
        maxDate = me.parent.maxDate;

    this.dimension = xdata.dimension(function (d) { return d[f]; });
    this.group = this.dimension.group().reduce(me.reduceAdd, me.reduceRemove, me.reduceInitial);

    this.chart
        .width(w)
        .height(h)
        .margins({ top: 10, left: 40, right: 0, bottom: 40 })
        .dimension(this.dimension)
        .group(this.group)
        .valueAccessor(function (d) {
            return d.value[v];
        })
        .centerBar(false)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .elasticX(false)
        .xUnits(t == 'week' ? d3.time.weeks : t == 'month' ? d3.time.months : d3.time.days)
        .round(t == 'week' ? d3.time.week.round : t == 'month' ? d3.time.month.round : d3.time.day.round);


    //.xAxis().tickFormat(t == 'week' ? d3.time.format('%b %y') : d3.time.format('%b'));

}

// ************************************************************
// ************************ widget table **********************
// ************************************************************
widgetActivity.prototype.setTable = function (xdata) {

    this.dimension = xdata.dimension(function (d) { return d.dd; }),

    dateFormat = d3.time.format('%d/%m/%Y'),
    numberFormat = this.parent.numberFormat,
    priceFormat = this.parent.priceFormat,
    tableFormat = this.getData('table'),
    ofs = 0,
    pag = this.getData('page-size'),
    table = this.chart;

    this.chart
        .dimension(this.dimension)
        //.sortBy(function (d) { return d.dd; })
        .size(Infinity)
        .group(function (d) { return ''; })
        .columns([
            function (d) { return d.dd ? dateFormat(d.dd) : ''; },
            function (d) { return d.status; },
            function (d) { return d.portfolio.name; },
            function (d) { return '<img class="img-td" src="https://lili.am/Assets/GetImage/' + d.asset.id + '" >'; },
            function (d) { return '<a target="_blank" href="https://lili.am/Assets/details/' + d.asset.code + '" >' + d.asset.name + '</a>'; },
            function (d) { return d.asset ? d.asset.issuer : ''; },
            function (d) { return priceFormat(d.price); },
            function (d) { return numberFormat(d.weight) + '%';},
            function (d) { return d.weight > 0 ? '' : numberFormat(d.netreturn * 100) + '%'; },
            function (d) { return d.weight > 0 ? '' : numberFormat(-d.netreturn * d.weight) + '%'; }])
        .sortBy(function (d) { return d.date; })
        .showGroups(false)
        .order(d3.descending)
        .on('renderlet', function (table) {
            //togglesSync(); // for help icons
            table.selectAll('.dc-table-row').classed('text-nowrap', true);
            table.selectAll('td._0').classed('text-center', true).attr('width', 80);
            table.selectAll('td._1').attr('width', 40);
            table.selectAll('td._2').attr('width', 40);
            table.selectAll('td._3').attr('width', 20);
            table.selectAll('td._6').classed('text-right', true).attr('width', 70);
            table.selectAll('td._7').classed('text-right', true).attr('width', 60);
            table.selectAll('td._8').classed('text-right', true).attr('width', 60);
            table.selectAll('td._9').classed('text-right', true).attr('width', 60);
            table.selectAll('td._7').each(function (d, i) {
                this.className = this.className + (d.weight < 0 ? ' text-warning' : ' text-success');
            });
            table.selectAll('td._8').each(function (d, i) {
                if (d.weight < 0) {
                    this.className = 'text-right ' + (d.netreturn < 0 ? 'warning' : 'success');
                }
            });
            table.selectAll('td._9').each(function (d, i) {
                if (d.weight < 0) {
                    this.className = 'text-right ' + (d.netreturn < 0 ? 'warning' : 'success');
                }
            })
        });
   
    // Apply the page size here
    update();

    function display() {
        d3.select('#begin')
            .text(ofs);
        d3.select('#end')
            .text(ofs + pag - 1);
        d3.select('#last')
            .attr('disabled', ofs - pag < 0 ? 'true' : null);
        d3.select('#next')
            .attr('disabled', ofs + pag >= xdata.size() ? 'true' : null);
        d3.select('#size').text(xdata.size());
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

// show or hide group in table
widgetActivity.prototype.showGroup = function (groupOn) {
    me.$tab.showGroups(groupOn);
}