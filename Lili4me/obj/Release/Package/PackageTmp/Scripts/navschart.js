
$(document).ready(function () {

    // open instrument controller
    var $ins = new LoyolApp.InstrumentController();

	// looking for lines-chart elements
	$('.navs-chart').each(function () {

		var container = $(this),
			frm = container.find('form'),
			graph = container.find('.lines-chart'),
			id = graph.attr('id'),
            rel = graph.data('rel'),
			opt = graph.data('option'),
			$n = new navschart('#' + id);

		frm.submit(function (e) {
		    var instrumentid = $(this).find('select').val();
		    $ins.get('Prices', new { option: opt, id: instrumentid }, function (data) {
		        $n.load(data, false); // false = no reset (add)
		    })
			return false;
		});

		// to erase the graph
		$('.navs-chart .btn-clear-graph').click(function () {
            if ($n.container == $(this).data('graph'))
			    $n.clear();
		})

		// when we change the calculation option
		$('.btn-nav-group .btn-option').click(function () {
		    opt = $(this).text();
		    $n.reload(opt);
		})

	});

})
