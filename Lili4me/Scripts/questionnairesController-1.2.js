
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.QuestionnaireController = function (container) {
    this.container = container;
    this.reference = container.data('reference');
}

// Return a new guid
LoyolApp.QuestionnaireController.prototype.newguid = function () {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    var newid = _p8() + _p8(true) + _p8(true) + _p8();
    return 'X-' + newid;
}

// Get all the data from API portfolios related to one portfolio
LoyolApp.QuestionnaireController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/Questionnaires/' + action;

        $.ajax({
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            url: url,
            data: data,
            crossDomain: true,
            cache: false,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: callback,
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    }
}

// Post the data to the controller API portfolios
LoyolApp.QuestionnaireController.prototype.post = function (action, data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {

        var token = session.token,
            param = $.param(data),
            url = session.domain + '/api/Questionnaires/' + action;

        $.ajax({
            type: 'POST',
            url: url,
            data: param,
            //dataType: 'json',
            cache: false,
            processData: false,
            crossDomain: true,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: callback,
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    }
}

// Get or open default user project
LoyolApp.QuestionnaireController.prototype.openProject = function (callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/InvestorProjects/CreateDefault';

        $.ajax({
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            url: url,
            crossDomain: true,
            cache: false,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: callback,
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    }
}

// render a container with one question
LoyolApp.QuestionnaireController.prototype.start = function (question, callback) {

    // controller var
    var me = this;

    // first we empty the container
    me.container.empty();

    // Input for control
    var containerDouble = function (q) {
        var control = $('<div>').addClass('form-group');
        var label = $('<label>').addClass('label-control').html(q.Name);
        var inpgrp = $('<div>').addClass('input-group');
        var input = $('<input>').addClass('form-control text-right')
            .attr('name', 'Value')
            .attr('type', 'text')
            .attr('value', q.Value)
            .focusout(function () {
                var answer = { ObjectID: me.reference, QuestionID: q.ID, Value: $(this).val() };
                me.post('PostAnswer', answer, function (result) { });
            });
        inpgrp.append(input);
        control.append(label, inpgrp);
        return control;
    }

    // List of options
    var containerList = function () {

        var list = $('<ul>').addClass('list-group checked-list-box')
            .attr('data-mode', question.Mode)
            .append($('<li>').addClass('list-group-item')
            .html('<h4>' + question.Name + '</h4>'));

        // list the allowed options
        $.each(question.Options, function (i, o) {
            var item = $('<li></li>')
                .addClass('list-group-item list-item-check')
                .attr('data-reference', me.reference)
                .attr('data-question', question.ID)
                .attr('data-value', o.ID)
                .attr('data-checked', o.Selected)
                .attr('data-color', 'info')
                .html(o.Name);
            item.append($('<input></input>').attr('type', 'radio').attr('id', o.ID).addClass('hidden'));
            list.append(item);
        });

        // add buttons for actions
        var options = $('<li></li>').addClass('list-group-item');

        // options
        list.append(options);

        // return the ul
        return list;
    }

    // title of the questionnaire
    $('.questionnaire-name').html(question.Questionnaire);

    // options list
    if (question.AnswerType == 1)
        me.container.append(containerList());

    // double as 
    if (question.AnswerType == 5)
        me.container.append(containerDouble(question));

    // create a footer for actions
    var footer = $('<div>').addClass('question-footer');
    // add the footer
    me.container.append(footer);

    // previous question if not the first
    if (question.PreviousQuestionID > 0) {
        var b1 = $('<button></button>')
            .addClass('btn btn-sm btn-question')
            .attr('type', 'button')
            .attr('data-question', question.PreviousQuestionID)
            .attr('data-rel', me.reference)
            .text('Précédent');
        footer.append(b1);
    }

    // next question if not the last
    if (question.NextQuestionID > 0) {
        // create a button for next question
        var b2 = $('<button>')
                    .addClass('btn btn-sm btn-question btn-next-question')
                    .attr('data-question', question.NextQuestionID)
                    .attr('data-rel', me.reference)
            .text('Suivant');
        // to receive the next button
        footer.append(b2);
    }
    else
    {
        this.nextQuestionnaire(question, function (questionnaire) {
            if (questionnaire.ID > 0) {
                var b3 = $('<button>')
                    .addClass('btn btn-sm btn-next-questionnaire')
                    .attr('data-question', 0)
                    .attr('data-questionnaire', questionnaire.ID)
                    .attr('data-rel', me.reference)
                    .text(questionnaire.Name + '...');
                footer.append(b3);
            }
            else
            {
                // create a button for termination
                var b4 = $('<button>')
                    .addClass('btn btn-sm btn-termination')
                    .text('Fin du questionnaire');
                footer.append(b4);
                // call for termination
                $('.btn-termination').click(function () {
                    me.container.fadeOut('slow', function () {
                        me.terminate();
                    });
                });
            }
        })
    }
    // render the options by calling server script
    me.renderQuestion(question);

    if (callback)
        callback();

}

// goto the next questionnaire
LoyolApp.QuestionnaireController.prototype.nextQuestionnaire = function (question, callback) {

    this.get('NextQuestionnaire', { id: question.QuestionnaireID }, function (result) {
        if (result.ID > 0) {
            // title of the new questionnaire
            $('.questionnaire-name').html(result.Name);
        }
        callback(result);
    })
}

// Use this function after loading data from server
LoyolApp.QuestionnaireController.prototype.renderQuestion = function (question) {

    var me = this;
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
            };

        $widget.css('cursor', 'pointer')
        updateDisplay();

        // Event Handlers
        $widget.on('click', function () {
            // post data first
            var item = $(this);
            var answer = { ObjectID: me.reference, QuestionID: item.data('question'), Value: item.data('value'), IsChecked: $checkbox.is(':checked') }
            me.post('PostAnswer', answer, function (result) {
                // if completed
                if (result.Success) {
                    $checkbox.triggerHandler('change');
                    me.get('CompleteQuestion', { questionid: question.ID, objectid: me.reference }, function (result) {
                        me.start(result);
                    })
                }
            });
        });

        // on change update 
        $checkbox.on('change', function () {
            updateDisplay();
        });

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

            if (question.IsMandatory) {
                // if at least one response, enable buttons
                var d = $('.checked-list-box input:checked');
                $('.btn-question').attr('disabled', (d.length == 0));
            }

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
        me.container.fadeOut('slow', function () {
            me.get('CompleteQuestion', { questionid: item.data('question'), objectid: me.reference }, function (result) {
                me.start(result, function () {
                    me.container.fadeIn('slow');
                });
            })
        });
    });

    $('.btn-next-questionnaire').click(function () {
        var item = $(this),
            questionnaireid = item.data('questionnaire');

        me.container.fadeOut('slow', function () {
            // launch related survey
            me.get('Complete', { id: questionnaireid, objectid: me.reference }, function (data) {
                me.onchange(data, function () {
                    me.container.fadeOut('slow', function () {
                        // start with the first question
                        me.start(data.FirstQuestion, function () {
                            me.container.fadeIn('slow');
                        });
                    });
                });



            });
        });


    });

    // only when list and mandatory
    if (question.AnswerType == 1 && question.IsMandatory) {
        var d = $('.checked-list-box input:checked')[0];
        $('.btn-question').attr('disabled', !d);
    }

}

// terminate questionnaire
LoyolApp.QuestionnaireController.prototype.terminate = function () {
    var evt = new CustomEvent('terminate');
    window.dispatchEvent(evt);
}

// when changing questionnaire
LoyolApp.QuestionnaireController.prototype.onchange = function (questionnaire, callback){
    var me = this;
    // first we empty the container
    me.container.empty();
    var div = $('<div>').addClass('new-questionnaire');
    var title = $('<h4>').html(questionnaire.Name);
    div.append(title);
    var message = $('<p>').html(questionnaire.Body);
    div.append(message);
    var btn = $('<button>').addClass('btn btn-default').html('Poursuivre');
    div.append(btn);
    me.container.append(div);
    me.container.fadeIn('slow');
    me.container.find('.btn').on('click', callback);
}

// Run kyc
LoyolApp.QuestionnaireController.prototype.run = function (questionnaireid, userid, callback) {

    // controller var
    var me = this;
    me.reference = userid;

    me.get('Complete', { id: questionnaireid, objectid: userid }, function (data) {
        // title of the questionnaire
        $('.questionnaire-name').html(data.Name);
        // render the first question
        if (data.FirstQuestion != null)
            me.start(data.FirstQuestion);
        if (callback)
            callback();
    })
}

