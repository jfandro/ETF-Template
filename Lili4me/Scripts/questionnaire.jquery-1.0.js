
// Use this function after loading data from server
var renderQuestion = function (panel, question, controller) {

    var elts = $('.checked-list-box .list-item-check');
    
    elts.each(function () {
        // Settings
        var $widget = $(this),
            $checkbox = $widget.find('input.hidden'),
            $mode = $widget.parent('.checked-list-box').data('mode'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            },
            $more = "";

        $widget.css('cursor', 'pointer')
        updateDisplay();

        // Event Handlers
        $widget.on('click', function () {

            // post data first
            postAnswer($(this), function (v) {
                // Clear all other boxes only if one answer by question
                if ($mode == 'single') {
                    $widget.parent('.checked-list-box').find('.list-group-item').each(function () {
                        $(this).removeClass('list-group-item-' + color);
                        $(this).find('.state-icon').removeClass().addClass('state-icon glyphicon glyphicon-unchecked');
                        $(this).find('input').prop('checked', false);
                    });
                };
                // update checkbox
                $checkbox.prop('checked', v);
                $checkbox.triggerHandler('change');

            });
        });

        $checkbox.on('change', function () {
            updateDisplay();
        });

        // post selection
        var postAnswer = function (item, callback) {
            var questionid = item.data('question'),
                value = item.data('value'),
                objectid = item.data('reference'),
                ischecked = $checkbox.is(':checked');
            $k.post('PostAnswer', { ObjectID: objectid, QuestionID: questionid, Value: value, IsChecked: ischecked }, function (result) {
                // Clear all other boxes only if one answer by question
                if ($mode == 'single') {
                    $widget.parent('.checked-list-box').find('.list-group-item').each(function () {
                        $(this).removeClass('list-group-item-' + color);
                        $(this).find('.state-icon').removeClass().addClass('state-icon glyphicon glyphicon-unchecked');
                        $(this).find('input').prop('checked', false);
                    });
                };
                // update checkbox
                $checkbox.prop('checked', result);
                $checkbox.triggerHandler('change');
            });
        }

        // update on click
        function updateDisplay() {

            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $widget.addClass(style + color);
                if ($mode == 'single')
                    $('#next-question').triggerHandler('click');
            } else {
                $widget.removeClass(style + color);
            }


            // if at least one response, enable buttons
            var d = $('.checked-list-box input:checked');
            $('.btn-question').attr('disabled', (d.length == 0));

        }

        // Initialization
        function init() {

            if ($widget.data('checked')) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }

            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
                $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
            }
        }

        init();

    });

    $('.btn-question').click(function () {
        var item = $(this);
        panel.fadeOut('slow', function () {
            controller.get('CompleteQuestion', { questionid: item.data('question'), objectid: item.data('rel') }, function (result) {
                renderContainer(panel, result, controller);
                panel.fadeIn('slow');
            })
        });

    });

    var d = $('.checked-list-box input:checked')[0];
    $('.btn-question').attr('disabled', !d);

}

// render a container with one question
var renderContainer = function (panel, question, controller) {

    // first we empty the panel
    panel.empty();

    // create the list and a first item for header
    var list = $('<ul></ul>')
        .addClass('list-group checked-list-box')
        .attr('data-mode', question.Mode)
        .append($('<li></li>')
        .addClass('list-group-item')
        .html('<h4>' + question.Name + '</h4>'));

    panel.append(list);

    // list the allowed options
    $.each(question.Options, function (i, o) {
        var item = $('<li></li>')
                    .addClass('list-group-item list-item-check')
                    .attr('data-reference', panel.data('reference'))
                    .attr('data-question', question.ID)
                    .attr('data-value', o.ID)
                    .attr('data-checked', o.Selected)
                    .attr('data-color', 'info')
                    .html(o.Name);
        item.append($('<input></input>').attr('type', 'radio').attr('id', o.ID).addClass('hidden'));
        list.append(item);
    });

    // add buttons for actions
    var actions = $('<li></li>').addClass('list-group-item');
    // previous question if not the first
    if (question.PreviousQuestionID > 0) {
        var b1 = $('<button></button>')
                .addClass('btn btn-sm btn-question')
                .attr('data-question', question.PreviousQuestionID)
                .attr('data-rel', panel.data('reference'))
                .text('Précédent');
        actions.append(b1);
    }
    // next question if not the last
    if (question.NextQuestionID > 0) {
        var b2 = $('<button></button>')
                .addClass('btn btn-sm btn-question')
                .attr('data-question', question.NextQuestionID)
                .attr('data-rel', panel.data('reference'))
                .text('Suivant');
        actions.append(b2);
    }
    // add a new line for actions
    list.append(actions);

    // render the options by calling lili server script
    renderQuestion(panel, question, controller);

}
