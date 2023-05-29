var universeBubbles = function (divname) {

    this.root = null;
    this.svg = null;
    this.dots = null;
    this.tooltip = null;
    this.x = null;
    this.y = null;
    this.depth = '1Y';
    this.scenario = 0;
    this.z = d3.scaleLinear().domain([0, 1]).range([0, 50]);

    this.colors = d3.scaleLinear().domain([1, 5]).range(['#fed98e', '#993404']);

    var margin = { top: 10, right: 0, bottom: 50, left: 50 },
        width = $(divname).width() - margin.right - margin.left,
        height = $(divname).height() - margin.top - margin.bottom,
        numberFormat = d3.format('.2f');

    var me = this;

    // create the universeBubbles in the element named divname
    this.draw = function () {

        me.svg = d3.select(divname)
            .append("svg")
            .classed("universeBubbles", true)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // -1- Create a tooltip div that is hidden by default:
        me.tooltip = d3.select(divname)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "black");

    }

    // load the universeBubbles
    this.loadRoot = function () {

        // get the data
        var data = this.root;

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var tooltip = me.tooltip;

        var showTooltip = function (d) {
            tooltip
                .transition()
                .duration(200);

            tooltip
                .style("opacity", 1)
                .html(tooltipHtml(d))
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1] + 30) + "px");
        }

        var moveTooltip = function (d) {
            tooltip
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1] + 30) + "px")
        }

        var hideTooltip = function (d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        var tooltipHtml = function (d) {
            
            return '<table class="universe-tip"><tr><td><img src="' + d.img +  '" /></td><td><h4>' + d.name + '</h4><p>' +
                '<p>Performance : <b>' + numberFormat(d.x) + '%</b><br/>' +
                '  Pertes max : <b>' + numberFormat(d.y) + '%</b><br/>' +
                '  Frais : <b>' + d.z + '%</b><br/>'+
                '  ESG : <b>' + d.esg.name + '</b><br/>' +
                '  Notes : <b>' + d.s + '</b> étoiles<br/>' +
                '  Simulation : <a target="_blank" href="' + d.urls + '">Simulation</a></p></td></tr></table>';
        }

        var goto = function (d) {
            window.location = d.urls;
        }

        // Add X axis (yld)
        me.x = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return d.xmin - 2; }), d3.max(data, function (d) { return +d.xmax + 2; })])
            .range([0, width]);

        // Add Y axis (vol)
        me.y = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d.y; }), d3.max(data, function (d) { return +d.y; })])
            .range([height, 0]);

        me.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(d3.axisBottom(me.x));

        me.svg.append("g")
            .attr("class", "y-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(me.y));

        me.svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 40) + ")")
            .attr("class", "x-label")
            .style("text-anchor", "middle")
            .text("Performance annuelle");

        me.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "y-label")
            .style("text-anchor", "middle")
            .text("Perte maximale");


        // Add dots
        me.dots = me.svg
            .append('g')
            .selectAll('.dots')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'dots');

        me.dots
            .append('circle')
            .attr("cx", function (d) { return me.x(d.x); })
            .attr("cy", function (d) { return me.y(d.y); })
            .attr("r", function (d) { return  me.z(d.z); })
            .style("fill", function (d) { return d.esg.color; })
            .style("opacity", "0.7")
            .attr("stroke", "white")
            .style("stroke-width", "1px")
            .on("click", goto)
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip);

        me.dots
            .append("text")
            .style("font", "10px sans-serif")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("x", function (d) { return me.x(d.x); })
            .attr("y", function (d) { return me.y(d.y); })
            .text((d) => { return d.name; });

    }

    // this function redraw and reload the map
    var me = this;
    this.resize = function () {
        $(divname).empty();
        me.draw();
        me.loadRoot(me.root);
    };
}


/**
 * parse data and compute circles x,y,z
 * @param {any} data
 */
var parsedata = function (data) {
    bubbles = [];
    var simurl = LoyolApp.Settings.domain + '/Portfolios/BacktestUniverse?reportkey=' + data.Settings.Key + '&scenariokey=';
    data.Universes.forEach(function (d) {
        bubble = {
            name: d.Universe.Name,
            url: d.Universe.WebsiteUrl,
            img: d.Universe.ImageUrl,
            scenarios: d.Scenarios,
            x: +100 * d.Scenarios[0].Portfolio.Yield,
            y: -100 * d.Scenarios[0].Portfolio.MaxDrawdown,
            z: +d.Scenarios[0].Portfolio.Fees.TotalManagementFee,
            s: d.Scenarios[0].Portfolio.RatingStars.toFixed(2),
            esg: d.Scenarios[0].Portfolio.ESGRating,
            urls: simurl + d.Scenarios[0].Key,
            xmin: d3.min(d.Scenarios, function (s) { return +100 * s.Portfolio.Yield ; }),
            xmax: d3.max(d.Scenarios, function (s) { return +100 * s.Portfolio.Yield; })
        }
        bubbles.push(bubble);
    });
    return bubbles;
}

/**
 * load bubbles with json data 
 * @param {json} data json
 * @param {any} callback
 */
universeBubbles.prototype.load = function (data, callback) {
    this.root = parsedata(data, this.depth);
    this.draw();
    this.loadRoot();
    d3.select(window).on('resize', this.resize);
    if (callback)
        callback();
}

/**
 * Change the scenario
 * @param {any} scenario : 0 or 1
 */
universeBubbles.prototype.setOption = function (scenario) {

    var me = this;
    me.scenario = scenario; // change scenario

    // parse data
    me.root.forEach(function (d) {
        d.x = +100 * d.scenarios[scenario].Portfolio.Yield,
        d.y = -100 * d.scenarios[scenario].Portfolio.MaxDrawdown,
        d.z = +d.scenarios[scenario].Portfolio.Fees.TotalManagementFee
        d.s = +d.scenarios[scenario].Portfolio.RatingStars.toFixed(2),
        d.esg = d.scenarios[scenario].Portfolio.ESGRating
    });

    me.dots.selectAll('circle')
        .transition()
        .duration(1500)
        .attr("cx", function (d) { return me.x(d.x); })
        .attr("cy", function (d) { return me.y(d.y); })
        .attr("r", function (d) { return me.z(d.z); })
        .style("fill", function (d) { return d.esg.color; });

    me.dots
        .selectAll('text')
        .transition()
        .duration(1500)
        .attr("x", function (d) { return me.x(d.x); })
        .attr("y", function (d) { return me.y(d.y); });
}
