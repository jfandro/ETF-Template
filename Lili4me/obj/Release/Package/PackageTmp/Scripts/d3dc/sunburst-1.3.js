sunburst = function (divname) {

    this.root = null;
    this.svg = null;
    this.partition = null;

    var margin = { top: 200, right: 200, bottom: 200, left: 200 },
        width = $(divname).innerWidth() - 100,
        height = width - 200,
        radius = Math.min(width, height) / 2,
        numberFormat = d3.format('.2f'),
        color = d3.scale.category20b(),
        hue = d3.scale.category20b();

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.sqrt()
        .range([0, radius]);

    // A common color for all gain loss charts
    var pnlColors = d3.scale.ordinal().domain(["gain", "loss"]).range(["#8fb082", "#e49090"])

    var luminance = d3.scale.sqrt()
        .domain([-100, 100])
        .clamp(true)
        .range([150, 0]);

    var arc = null;

    function format_description(d) {
        return '<b>' + d.Name + '</b>' + '<br> (Performances : ' + numberFormat(100 * d.Pnl / d.value) + '%)';
    }

    function mouseOverArc(d) {
        //d3.select(this).attr("stroke", "black");
        //tooltip.html(format_description(d));
        //return tooltip.transition()
        //  .duration(50)
        //  .style("opacity", 0.9);

        d3.select("#percentage")
            .html(format_description(d));

        d3.select("#explanation")
            .transition()
            .duration(1000)
            .style("visibility", "");

        // Fade all the segments.
        d3.selectAll("path").style("opacity", 0.7);
        this.style.opacity = 1;
    }

    function mouseOutArc() {
        d3.select(this).attr("stroke", "")
        return tooltip.style("opacity", 0);
    }

    function mouseMoveArc(d) {
        return tooltip
          .style("top", (d3.event.pageY - 10) + "px")
          .style("left", (d3.event.pageX + 10) + "px");
    }

    // Restore everything to full opacity when moving off the visualization.
    function mouseleave(d) {
        d3.selectAll("path").style("opacity", 1);
        d3.select("#explanation").style("visibility", "hidden");
    }

    // Fill color with ???
    function fill(d) {
        var p = d,
            r = 100 * d.Pnl / d.CostValue,
            lg = (d.Pnl < 0 ? 'loss' : 'gain');

        while (p.depth > 1) p = p.parent;
        var c = d3.lab(pnlColors(lg));
        c.l = luminance(Math.abs(r));
        return c;
    }

    // Interpolate the scales!
    function arcTweenZoom(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function (d, i) {
            return i
                ? function (t) { return arc(d); }
                : function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }

    // When switching data: interpolate the arcs in data space.
    function arcTweenData(a, i) {
        var oi = d3.interpolate({ x: a.x0, dx: a.dx0 }, a);
        function tween(t) {
            var b = oi(t);
            a.x0 = b.x;
            a.dx0 = b.dx;
            return arc(b);
        }
        if (i == 0) {
            // If we are on the first arc, adjust the x domain to match the root node
            // at the current zoom level. (We only need to do this once.)
            var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
            return function (t) {
                x.domain(xd(t));
                return tween(t);
            };
        } else {
            return tween;
        }
    }

    // Fill the label
    function computeTextRotation(d) {
        return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }

    // Setup for switching data: stash the old values for transition.
    function stash (d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    }

    // create the sunburst in the element named divname
    var me = this;
    this.draw = function () {

        me.svg = d3.select(divname)
            .append("svg")
            .classed("sunburst", true)
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", "translate(" + (width / 2 + 50) + "," + (height / 2 + 50) + ")");

        me.partition = d3.layout.partition()
            .value(function (d) { return d.MarketValue; })
            .children(function (d) { return d.Children; });

        arc = d3.svg.arc()
            .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
            .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
            .innerRadius(function (d) { return Math.max(0, y(d.y)); })
            .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)); });

        //Tooltip description
        var tooltip = d3.select(divname)
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("opacity", 0);

    }

    // load the sunburst
    this.loadRoot = function (data) {

        me.root = data;
        // save the root node for switching
        node = me.root;

        var g = me.svg.selectAll("g")
                .data(me.partition.nodes(node))
                .enter().append("g");

        var path = g.append("path")
           .attr("d", arc)
           .style("fill", function (d) {
               //return color((d.Children ? d : d.parent).Name);
               return fill(d);
           })
           .on("click", click)
           .on("mouseover", mouseOverArc)
           //.on("mousemove", mouseMoveArc)
           .on("mouseout", mouseleave)
           .each(stash);

        // legends
        var text = g.append("text")
          .attr("transform", function (d) { return "rotate(" + computeTextRotation(d) + ")"; })
          .attr("x", function (d) { return y(d.y); })
          .attr("dx", "6") // margin
          .attr("dy", ".35em") // vertical-align
          .text(function (d) { return d.Name; });


        function click(d) {

            // fade out all text elements
            text.transition().attr("opacity", 0);

            path.transition()
              .duration(750)
              .attrTween("d", arcTweenZoom(d))
              .each("end", function (e, i) {
                  // check if the animated element's data e lies within the visible angle span given in d
                  if (e.x >= d.x && e.x < (d.x + d.dx)) {
                      // get a selection of the associated text element
                      var arcText = d3.select(this.parentNode).select("text");
                      // fade in the text element and recalculate positions
                      arcText.transition().duration(750)
                        .attr("opacity", 1)
                        .attr("transform", function () { return "rotate(" + computeTextRotation(e) + ")" })
                        .attr("x", function (d) { return y(d.y); });
                  }
              });
        }

        // On changing selector (market or cost value)
        $('.select-sunburst .btn').click(function () {

            var value = $(this).data('mode') === "cost"
                ? function (d) { return d.CostValue; }
                : function (d) { return d.MarketValue; };

            me.partition = d3.layout.partition()
                .value(value)
                .children(function (d) { return d.Children; });

            path.data(me.partition.nodes(me.root))
                .transition()
                .duration(1000)
                .attrTween("d", arcTweenData);
        });

    }

    // this function redraw and reload the map
    var me = this;
    this.resize = function () {
        $(divname).empty();
        me.draw();
        me.loadRoot(me.root);
    };
}

sunburst.prototype.json = function (url, callback) {
    var me = this;
    d3.json(url, function (res) {
        me.load(res, callback);
    });
}

sunburst.prototype.load = function (data, callback) {
    this.root = data;
    this.draw();
    this.loadRoot(data);
    d3.select(window).on('resize', this.resize);
    callback;
}
