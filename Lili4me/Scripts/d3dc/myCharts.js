
// NAV chart
var mynavschart = function (divname) {

    this.container = divname,
    this.node = [],
    this.url = '/Instruments/JsonInstrumentPrices?',
    this.option = '1M',
    this.margin = { top: 0, right: 10, bottom: 0, left: 40 },
    this.width = $(divname).innerWidth() - this.margin.left - this.margin.right,
    this.height = $(divname).innerHeight() - this.margin.top - this.margin.bottom;
    this.areastyle = true;
    this.data = [];
    this.codes = [];

    var me = this;

    // colors v5
    var linecolors = d3.scaleOrdinal(d3.schemeCategory10);

    // prices format
    var priceFormat = d3.format('.2f');

    // date parser
    var parseDate = d3.timeParse("%Y/%m/%d");

    // date format
    var dateFormat = d3.timeFormat("%d/%m/%Y");

    // Set the ranges
    var x = d3.scaleTime().range([0, this.width]);
    var y = d3.scaleLinear().range([this.height, 0]);

    // Set the legend array
    var legend = [];
    // Set the tooltips array
    var tooltips = [];

    // Define the axis v5
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y).tickSize(5);

    // Define one line curve
    var line = d3.line()
        .x(function (d) { return x(d.date); })
        .y(function (d) { return y(d.price); })
        .curve(d3.curveMonotoneX);

    // Define one area curve
    var area = d3.area()
        .x(function (d) { return x(d.date); })
        .y0(y(0))
        .y1(function (d) { return y(d.price); });

    var commtip = [];

    // Add a tooltip
    //var notetip = d3.select(divname)
    //    .append("div")
    //    .attr("id", "notetip")
    //    .classed("tooltip", true)
    //    .style("position", "absolute")
    //    .style("z-index", "10")
    //    .style("opacity", 0);

    var noteHtml = function (n) {
        return '<h5>' + n.title + '</h5><p>' + n.preamble + '</p>';
    }

    // Adds the svg canvas in the div
    var svg = d3.select(divname)
        .append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // Add the X Axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', "translate(0," + this.height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // Add the Y Axis
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // Add horizontal grid lines every 10
    svg.selectAll('y axis').data(y.ticks(10)).enter()
        .append('line')
        .attr('class', 'horizontalGrid')
        .attr('x1', 0)
        .attr('x2', this.width)
        .attr('y1', function (d) { return y(d); })
        .attr('y2', function (d) { return y(d); });

    //$(divname).prepend('<div class="legend"></div>');
    //$('.legend').hide();

    var nodes = this.node,
        codes = this.codes;

    // bisector for tooltip
    var bisectDate = d3.bisector(function (d) { return d.date; }).left;

    // populate data
    var populate = function (data, callback) {

        this.data = data;

        // Scale the range of all data recorded in nodes
        x.domain(d3.extent(data[0].prices, function (d) { return d.date; }));

        var y1 = [],
            y2 = [];

        data.forEach(function (d) {
            y1.push(d3.min(d.prices, function (p) { return p.price; }));
            y2.push(d3.max(d.prices, function (p) { return p.price; }));
        });

        y.domain([d3.min(y1, function (v) { return v; }) - 1, d3.max(y2, function (v) { return v; }) + 1]);

        var animation = parseInt($(divname).data('animation'));

        // update axis
        svg.selectAll('g .y.axis').transition(animation).call(yAxis);
        svg.selectAll('g .x.axis').transition(animation).call(xAxis);

        svg.selectAll('g path').remove();
        svg.selectAll('g.tooltip-x').remove();

        // empty the legend box
        $(divname + ' .legend').empty();

        // also tooltips
        legend = [];
        tooltips = [];

        // Loop through each portfolio / key
        data.forEach(function (d, i) {

            // create a line per instrument
            var path = svg.append('path')
                .attr('class', function () { return me.areastyle ? 'area curve' : 'line curve'; })
                .style('fill', function () { return me.areastyle ? d.color = linecolors(i) : 'none'; })
                .style('stroke', function () { return me.areastyle ? 'none' : d.color = linecolors(i); })
                .attr('d', function () { return me.areastyle ? area(d.prices) : line(d.prices); });

            // this is done for animation
            if (animation > 100) {
                var totalLength = path.node().getTotalLength();
                path
                    .attr('fill', 'none')
                    .attr('data-rel', d.code)
                    .attr('stroke-dasharray', totalLength + " " + totalLength)
                    .attr('stroke-dashoffset', totalLength).transition()
                    .duration(animation)
                    .ease(d3.easeLinear)
                    .attr('stroke-dashoffset', 0);
            }

            // create a tooltip for each serie
            var t = addTooltip(i);
            tooltips.push({ tooltip: t, values: d.prices, color: linecolors(i) });

            // create a new item for legend
            var obj = { key: legend.length, color: linecolors(i) };

            // add push it in the legend table
            legend.push(obj);
            $(divname + ' .legend').append('<div class="item" data-key="' + obj.key + '"><div class="swatch" style="background: ' + obj.color + '"></div>' + d.name + '</div>');

        });

        // Create an overlay rectangle and events to display/hide tooltips 
        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', me.width)
            .attr('height', me.height)
            .on('mouseover', function () {
                svg.selectAll('.tooltip-x').style('display', null);
            })
            .on('mouseout', function () {
                svg.selectAll('.tooltip-x').style('display', 'none');
            })
            .on('mousemove', mousemove);

        // add notes
        data.forEach(function (d, i) {
            if (d.notes) {

                // create a commtip
                if (commtip == [])
                    commtip = d3.select('body')
                        .append('div')
                        .style("z-index", "10")
                        .classed('commtip', true)
                        .style("opacity", 0);

                d.notes.forEach(function (n, i) {
                    var prices = d.prices.filter(function (p) { return p.valuedate == n.effectivedate; });
                    prices.forEach(function (p, j) {
                        var comm = svg.append('g')
                            .attr('class', 'comment')
                            .attr('id', 'comm-' + p.id);

                        comm.append('rect')
                            .attr("stroke-width", "1px")
                            .attr("width", ".5px")
                            .attr("height", me.height - y(p.price));

                        // append a circle
                        comm.append('circle')
                            .attr('fill', '#000')
                            .attr('r', '10')
                            .style('opacity', '0.2')
                            .style("pointer-events", "visible")
                            .on('mouseover', function () {
                                commtip.html(noteHtml(n));
                                commtip.style("opacity", 0.9);
                            })
                            .on('mouseout', function () {
                                commtip.style("opacity", 0);
                            })
                            .on('mousemove', function (d) {
                                commtip.style('top', (d3.event.pageY - 120) + "px")
                                    .style("left", (d3.event.pageX - 75) + "px");;
                            })
                            .on('click', function () {
                                $(divname).trigger('click-note', n);
                            })

                        comm.append('rect')
                            .attr("stroke-width", "1px")
                            .attr("width", ".5px")
                            .attr('fill', '#333')
                            .attr("height", me.height - y(p.price));

                        //comm.append('text')
                        //    .style('font-size', '10px')
                        //    .style('font-family', 'Segoe UI')
                        //    .style('color', "#333333")
                        //    .style('fill', "#333333")
                        //    .text(c.comment.substring(0, 20) + '...')
                        //    .attr('transform', 'translate(-50, -40)');

                        comm.attr('transform', 'translate(' + x(p.date) + ',' + y(p.price) + ')');

                    })

                });
            }
        });

        $('.legend').fadeIn();

        $('.legend .item').mouseover(function () {
            var k = $(this).data('key');
            svg.selectAll('.curve')
                .transition()
                .duration(100)
                .attr('opacity', function (d, j) { return j != k ? 0.1 : 1; });
        });

        $('.legend').mouseout(function () {
            svg.selectAll('.curve').transition()
                .duration(100)
                .attr('opacity', '1');
        });

        if (callback)
            callback();

    }

    // populate gathered data
    mynavschart.prototype.populate = function (callback) {
        populate(nodes, callback);
    };

    // switch graph
    mynavschart.prototype.switch = function (callback) {
        this.areastyle = !this.areastyle;
        populate(nodes, callback);
    };

    // add one note on grap
    mynavschart.prototype.addnote = function (n) {
        this.node.forEach(function (d, i) {
            if (d.code == n.objectid) {
                newnote(d, n);
            }
        });
    };

    var newnote = function (d, n) {

        var prices = d.prices.filter(function (p) { return p.valuedate == n.effectivedate; });
        prices.forEach(function (p, j) {
            var comm = svg.append('g')
                .attr('class', 'comment')
                .attr('id', 'comm-' + p.id);

            comm.append('rect')
                .attr("stroke-width", "1px")
                .attr("width", ".5px")
                .attr("height", me.height - y(p.price));

            // append a circle
            comm.append('circle')
                .attr('fill', '#000')
                .attr('r', '10')
                .style('opacity', '0.2')
                .style("pointer-events", "visible")
                .on('mouseover', function () {
                    commtip.html(noteHtml(n));
                    commtip.style("opacity", 0.9);
                })
                .on('mouseout', function () {
                    commtip.style("opacity", 0);
                })
                .on('mousemove', function (d) {
                    commtip.style('top', (d3.event.pageY - 120) + "px")
                        .style("left", (d3.event.pageX - 75) + "px");;
                })
                .on('click', function (d) {
                    $(divname).trigger('click-note', n);
                })

            comm.append('rect')
                .attr("stroke-width", "1px")
                .attr("width", ".5px")
                .attr('fill', '#333')
                .attr("height", me.height - y(p.price));

            comm.attr('transform', 'translate(' + x(p.date) + ',' + y(p.price) + ')');

        })
    }

    // Here we add a new serie of data
    mynavschart.prototype.addserie = function (data, populatedata, callback) {

        //parsing data and push prices to the nodes
        data.prices.forEach(function (p, n) {
            p.date = parseDate(p.valuedate);
        })

        // push data
        nodes.push(data);

        // then populate if requested
        if (populatedata)
            populate(nodes, callback);
        else if (callback)
            callback();
    };

    // Here we load several series in one set of data
    mynavschart.prototype.addseries = function (data, callback) {

        var me = this;
        //codes = [];

        // Nest the prices by code
        data.forEach(function (d) {
            if (!codes.includes(d.code)) {
                codes.push(d.code);
                me.addserie(d, false, null);
            }
        });

        populate(nodes, callback);
    }

    // show or hide a serie
    mynavschart.prototype.showhideserie = function (code, show) {

        // exists
        if (!codes.includes(code))
            return;

        // show/hide line
        svg.selectAll('.line')
            .filter(function () { return d3.select(this).attr('data-rel') == code; })
            .attr('opacity', function () { return show ? 1 : 0; });

        // show/hide line
        svg.selectAll('.legend.item')
            .filter(function () { return d3.select(this).attr('data-rel') == code; })
            .attr('opacity', function () { return show ? 1 : 0; });
    }

    /********* push new serie of data with or without populating ************/
    mynavschart.prototype.load = function (data, code, populate, callback) {
        codes.push(code);
        this.addserie(data, populate, callback);
    }

    /********* read data json call and push them in the waterfall ************/
    mynavschart.prototype.clear = function (keepcodes) {
        nodes = [];
        if (!keepcodes)
            codes = [];
        tooltips = [];
        svg.selectAll('g path').remove();
        svg.selectAll('g.tooltip-x').remove();
        svg.selectAll('g.comment').remove();
        d3.selectAll('.legend .item').remove();
    }

    // reload current codes 
    mynavschart.prototype.reload = function (opt, callback) {
        var me = this;

        me.option = opt;
        me.clear(true); // do nor forget codes

        var j = 0,
            n = codes.length;
        for (i = 0; i < n; i++) {
            var code = codes[i],
                url = me.url + $.param({ option: opt, id: code });
            d3.json(url).then(function (res) {
                j++;
                me.addserie(res, (j == n), callback);
            });
        };
    }

    // function to add a tooltip
    function addTooltip(i, color) {

        // Création d'un groupe qui contiendra tout le tooltip plus le cercle de suivi
        var tooltip = svg.append('g')
            .attr('id', 'tooltip-' + i)
            .attr('class', 'tooltip-x')
            .style('display', 'none');

        // Le cercle extérieur bleu clair
        tooltip.append('circle')
            .attr('fill', function () { return linecolors(i); })
            .style('opacity', '0.25')
            .attr('r', 10);

        // Le cercle intérieur bleu foncé
        tooltip.append("circle")
            .attr("fill", function () { return linecolors(i); })
            .attr("stroke", "#fff")
            .attr("stroke-width", "1.5px")
            .attr("r", 4);

        // Le tooltip en lui-même avec sa pointe vers le bas
        // Il faut le dimensionner en fonction du contenu
        tooltip.append('polyline')
            .attr("points", "0,0 0,40 55,40 60,45 65,40 120,40 120,0 0,0")
            .style('fill', '#fafafa')
            .style('opacity', '0.9')
            .style('stroke', function () { return linecolors(i); })
            .style('stroke-width', '1')
            .attr('transform', 'translate(-60, -55)');

        // Cet élément contiendra tout notre texte
        var text = tooltip.append('text')
            .style('font-size', '10px')
            .style('font-family', 'Segoe UI')
            .style('color', "#333333")
            .style('fill', "#333333")
            .attr('transform', 'translate(-50, -40)');

        // Element for date
        text.append('tspan')
            .attr('dx', '-5')
            .attr('id', 'tooltip-date-' + i);

        // Positionnement spécifique pour le petit rond	bleu
        //text.append("tspan")
        //    .style("fill", "#3498db")
        //    .style('stroke', function () { return linecolors(i); })
        //    .attr("dx", "-60")
        //    .attr("dy", "15")
        //    .text("●");

        // Add simple textbox
        text.append("tspan")
            .attr("x", "-5")
            .attr("dy", "15")
            .attr('class', 'tooltip-content')
            .text("");

        // Add price (bold)
        text.append('tspan')
            .attr("x", "-5")
            .attr("dy", "15")
            .attr('id', 'tooltip-price-' + i)
            .style('font-weight', 'bold');

        return tooltip;
    }

    // show the tooltip
    function mousemove() {

        var x0 = x.invert(d3.mouse(this)[0]);

        // Loop through each portfolio / key
        tooltips.forEach(function (item, n) {
            var data = item.values,
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;
            tooltip = item.tooltip;
            if (d) {
                tooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price) + ')');
                d3.select('#tooltip-date-' + n).text(dateFormat(d.date));
                d3.select('#tooltip-price-' + n).text(priceFormat(d.price) + '€');
            }
        });

        //d3.select(".dotted").attr('x', d3.mouse(this)[0]);

    }
}
