
function loadTreeMap(data, divname, callback) {

    var root, data, treemap, grandparent, svg;

    var margin = { top: 40, right: 10, bottom: 0, left: 10 },
        width = $(divname).innerWidth(),
        height = $(divname).innerHeight() - margin.top - margin.bottom,
        formatNumber = d3.format(".2f"),
        transitioning;

    /* create x and y scales */
    var x, y;

    var color = d3.scale.category20b();

    var luminance = d3.scale.sqrt()
        .domain([0, 1e6])
        .clamp(true)
        .range([90, 20]);

    // this function creates the treemap
    function draw() {

        // get dimension
        width = $(divname).innerWidth();
        height = $(divname).innerHeight() - margin.top - margin.bottom;

        /* create x and y scales */
        x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        y = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);

        // the treemap is created here
        treemap = d3.layout.treemap()
            .children(function (d, depth) { return depth ? null : d._children; })
            .sort(function (a, b) { return a.value - b.value; })
            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
            .round(false)
            .value(function (d) { return d.MarketValue; }); // instruction to get value of each tile

        // the svg is created here
        svg = d3.select(divname)
            .append("svg:svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .style("margin-left", -margin.left + "px")
            .style("margin.right", -margin.right + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("shape-rendering", "crispEdges");

        // the grand parent is the navigation header between 2 levels
        grandparent = svg.append("g")
            .attr("class", "grandparent");

        grandparent.append("rect")
            .attr("y", -margin.top)
            .attr("width", width)
            .attr("height", margin.top);

        grandparent.append("text")
            .attr("x", 6)
            .attr("y", 6 - margin.top)
            .attr("dy", "1.75em");
    }

    function text(text) {
        text.attr("x", function (d) { return x(d.x) + 6; })
        .attr("y", function (d) { return y(d.y) + 6; });
    }

    function rect(rect) {
        rect.attr("x", function (d) { return x(d.x); })
        .attr("y", function (d) { return y(d.y); })
        .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); });

    }

    function foreign(foreign) { /* added */
        foreign.attr("x", function (d) { return x(d.x); })
        .attr("y", function (d) { return y(d.y); })
        .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
        return d.parent ? name(d.parent) + " / " + d.Name : d.Name;
    }

    function resize () {
        $(divname).empty();
        draw(root);
        loadRoot(root);
    };

    // Load a treemap from a dataset
    function loadRoot(r) {
        initialize(r);
        accumulate(r);
        layout(r);
        display(r);
    }

    // Initialization of cells
    function initialize(r) {
        r.x = r.y = 0;
        r.dx = width;
        r.dy = height;
        r.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed
    function accumulate(d) {
        return (d._children = d.Children)
        ? d.value = d.Children.reduce(function (p, v) { return p + accumulate(v); }, 0)
        : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d._children) {
            treemap.nodes({ _children: d._children });
            d._children.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    /* display the treemap and writes the embedded transition function */
    function display(d) {

        /* create grandparent bar at top */
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        /* add in data */
        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        /* transition on child click */
        g.filter(function (d) { return d._children; })
            .classed("children", true)
            .on("click", transition);

        /* write children rectangles */
        g.selectAll(".child")
            .data(function (d) { return d._children || [d]; })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect);

        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            /* open new window based on the json's URL value for leaf nodes */
            /* Chrome displays this on top */
            .on("click", function (d) {
                if (!d.children && !d.Url == '') {
                    window.open(d.Url);
                }
            })
            .append("title")
            .text(function (d) { return d.Name + "\n" + formatNumber(d.value) + '€'; });

        /* Adding a foreign object instead of a text object, allows for text wrapping */
        g.append("foreignObject")
            .call(rect)
            /* open new window based on the json's URL value for leaf nodes */
            /* Firefox displays this on top */
            .on("click", function (d) {
                if (!d.children && !d.Url == '') {
                    window.open(d.Url);
                }
            })
            .attr("class", "foreignobj") // does not work on IE (does not support foreign object)
            .append("xhtml:div")
            .attr("dy", ".75em")
            .html(function (d) {

                if (d.NodeType == "Root" || d.NodeType == "Portfolio") {
                    return String.format('<p class="text-center" width="100%"><img width="10%" src="{2}"/></p><h5>{0}</h5><p class="text-center">{1}€</p>', d.Name, formatNumber(d.value), d.Image);
                }
                if (d.value > 0 && (d.NodeType == "Class" || d.NodeType == "MasterClass"))
                    return String.format('<h5>{0}</h5><p class="text-center">{1}%</p>',
                        d.Name, formatNumber(d.Weight * 100));

                return String.format('<p class="text-center" width="100%"><img class="img-circle" width="10%" src="{3}"/></p><h5>{0}</h5><p class="text-center">Val: {1}€ (P&L = {2}€)</p>',
                    d.Name, formatNumber(d.value), formatNumber(d.Pnl), d.Image);
            })
            .attr("class", "textdiv"); //textdiv class allows us to style the text easily with CSS

        g.selectAll("rect").style("fill", function (d) {
            return color(d.parent ? d.Name : null);
        });

        /* create transition function for transitions */
        function transition(d) {

            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);
            g2.selectAll("foreignObject div").style("display", "none"); /*added*/

            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            t1.selectAll(".textdiv").style("display", "none"); /* added */
            t1.selectAll(".foreignobj").call(foreign); /* added */
            t2.selectAll(".textdiv").style("display", "block"); /* added */
            t2.selectAll(".foreignobj").call(foreign); /* added */

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });

        }//endfunc transition

        return g;
    }//end of display function


    // call data from url
    //d3.json(url, function (res) {
        root = data;
        draw(root);
        loadRoot(root);
        d3.select(window).on("resize", resize);
        callback();
    //}); // end of json call




} // end of loadTreemap function

function fill0(d) {
    var c = d3.rgb((d.Pnl) ? '#F37777' : '#7FB97F');
    var l = Math.min(0.2, Math.abs((d.Pnl) / d.CostValue));
    return c.brighter(l).toString();
}