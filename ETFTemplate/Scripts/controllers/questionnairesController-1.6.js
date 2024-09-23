
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.QuestionnaireController = function (container, ref) {
    this.container = container;
    this.reference = ref;
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

        var list = $('<div>')
            .addClass('container-options')
            .attr('data-mode', question.Mode);

        // list the allowed options
        $.each(question.Options, function (i, o) {
            var item = $('<div>')
                .addClass('form-check mb-3')
                .attr('data-reference', me.reference)
                .attr('data-question', question.ID)
                .attr('data-value', o.ID)
                .attr('data-checked', o.Selected)
                .attr('data-color', 'info');

            item.append($('<input>').attr('type', 'radio').attr('id', o.ID).addClass('form-check-input'));
            var label = $('<label>').addClass('form-check-label').attr('for', o.ID);
            var span = $('<span>').addClass('pl-1').html(o.Name);
            label.append(span);
            item.append(label);
            list.append(item);
        });

        // return the ul
        return list;
    }

    // title of the questionnaire
    $('.questionnaire-name').html(question.Questionnaire);
    $('.question-name').html(question.Name);
    $('.question-title').html(question.Title);
    $('.question-mandatory').html(question.IsMandatory ? 'obligatoire' : 'optionnelle');
    $('.question-multiple').html(question.IsMultiple ? 'multiple' : 'unique');

    // options list
    if (question.AnswerType == 1)
        me.container.append(containerList());

    // double as 
    if (question.AnswerType == 5)
        me.container.append(containerDouble(question));

    // create a footer for actions
    var footer = $('<div>').addClass('question-footer py-3 text-center');
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
                    .attr('type', 'button')
                    .addClass('btn btn-sm btn-default btn-question btn-next-question')
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
                    .attr('type', 'button')
                    .addClass('btn btn-sm btn-default btn-next-questionnaire')
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
                    .attr('type', 'button')
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

/**
 * open a given question
 * @param {any} i is question id
 * @param {any} callback
 */
LoyolApp.QuestionnaireController.prototype.startfrom = function (i, callback) {
    var me = this;
    me.get('CompleteQuestion', { questionid: i, objectid: me.reference }, function (result) {
        me.start(result, callback);
    })
}

// Use this function after loading data from server
LoyolApp.QuestionnaireController.prototype.renderQuestion = function (question) {

    var me = this,
        containeroptions = $('.container-options'),
        options = $('.container-options .form-check');

    options.each(function () {
        // Settings
        var $widget = $(this),
            $checkbox = $widget.find('input'),
            $mode = containeroptions.data('mode'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "item-"),
            settings = {
                on: {
                    icon: 'fa fa-check-square-o'
                },
                off: {
                    icon: 'fa fa-square-o'
                }
            };

        $widget.css('cursor', 'pointer')

        $widget.on('click', function (e) {
            // important
            e.preventDefault();
            // post data first
            var item = $(this);
            var answer = { ObjectID: me.reference, QuestionID: item.data('question'), Value: item.data('value'), IsChecked: $checkbox.is(':checked') };
            me.post('PostAnswer', answer, function (result) {
                if (result.Success) {
                    me.get('CompleteQuestion', { questionid: question.ID, objectid: me.reference }, function (result) {
                        // in case of completion goto the next question
                        if (result.IsCompleted) {
                            if (result.NextQuestionID > 0) {
                                me.container.parent('.card').fadeOut('slow', function () {
                                    me.get('CompleteQuestion', { questionid: result.NextQuestionID, objectid: me.reference }, function (result) {
                                        me.start(result, function () {
                                            me.container.parent('.card').fadeIn('slow');
                                        });
                                    })
                                })
                            }
                            else
                            {
                                me.container.fadeOut('slow', function () {
                                    me.terminate();
                                });
                            }
                        }
                        else
                            me.start(result); // refresh question options
                    })
                }
            });
        });

        // update on click
        function updateDisplay(callback) {

            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked)
                $widget.addClass('selected-option');
             else
                $widget.removeClass(style + color);

            if (question.IsMandatory) {
                // if at least one response, enable buttons
                var d = $('.container-options input:checked');
                $('.btn-next-question').attr('disabled', (d.length == 0));
            } else {
                $('.btn-next-question').removeAttr('disabled');
            }

            callback();
        }

        // Initialization
        function init() {

            if ($widget.data('checked')) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }

            updateDisplay(function () {
                // Inject the icon if applicable
                if ($widget.find('.state-icon').length == 0) {
                    $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
                }
            });

        }

        init();

    });

    $('.btn-question').click(function () {
        var item = $(this);
        me.container.parent('.card').fadeOut('slow', function () {
            me.get('CompleteQuestion', { questionid: item.data('question'), objectid: me.reference }, function (result) {
                me.start(result, function () {
                    me.container.parent('.card').fadeIn('slow');
                });
            })
        });
    });

    $('.btn-next-questionnaire').click(function () {
        var item = $(this),
            questionnaireid = item.data('questionnaire');

        me.container.parent('.card').fadeOut('slow', function () {
            // launch related survey
            me.get('Complete', { id: questionnaireid, objectid: me.reference }, function (data) {
                me.onchange(data, function () {
                    me.container.parent('.card').fadeOut('slow', function () {
                        // start with the first question
                        me.start(data.FirstQuestion, function () {
                            me.container.parent('.card').fadeIn('slow');
                        });
                    });
                });



            });
        });


    });

    // only when list and mandatory
    if (question.AnswerType == 1) {
        if (question.IsMandatory) {
            var d = $('.container-options input:checked')[0];
            $('.btn-next-question').attr('disabled', !d);
        } else {
            $('.btn-next-question').removeAttr('disabled');
        }
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

// Get user answers
LoyolApp.QuestionnaireController.prototype.answers = function (questionnaireid, userid, callback) {
    var me = this;
    me.get('Answers', { id: questionnaireid, objectid: userid }, function (data) {
        if (callback)
            callback(data);
    });
}

// Get report answers
LoyolApp.QuestionnaireController.prototype.reportAnswers = function (reportid, callback) {
    var me = this;
    me.get('AccessAnswers', { id: reportid }, function (data) {
        if (callback)
            callback(data);
    });
}
