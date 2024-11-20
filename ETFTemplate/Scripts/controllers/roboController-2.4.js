
// Constructor of the controller
myRobo = function (app, kycid, containerquestion) {
    this.code = '';
    this.kycid = kycid;
    this.App = app;
    this.settings = app.Settings;
    this.session = null;
    this.answers = [];

    var cookie = "newuserid";
    this.userid = $.cookie(cookie);

    // Create and return a new temporary guid starting with x-
    var newguid = function () {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        var newid = _p8() + _p8(true) + _p8(true) + _p8();
        return 'x-' + newid;
    }

    // if the cookie not exists create one.
    if (!this.userid) {
        // check if the browser supports cookie
        var test_cookie = 'testcookie';
        $.cookie(test_cookie, true);
        // browser supports cookie
        if ($.cookie(test_cookie)) {
            // delete the test cookie
            $.cookie(test_cookie, null);
            // create a new guid for the user
            this.userid = newguid();
            // create a new cookie with created value
            $.cookie(cookie, this.userid);
        }
    }

    // open app containers to fill and populate containers
    this.appContainers = new myAppContainers(app, this.code);
    this.pc = this.appContainers.pc;
    this.ic = this.appContainers.ic;
    this.oc = this.appContainers.oc;

    // open questionnaire and lead controllers
    this.qc = new app.QuestionnaireController(containerquestion, this.userid);
    this.lc = new app.LeadController();

    this.appContainers.qc = this.qc;

}

// start the questions
myRobo.prototype.start = function (callback) {
    this.qc.run(this.kycid, this.userid, callback);
}

// start the questions
myRobo.prototype.startfrom = function (i, callback) {
    this.qc.renderQuestion(q, callback);
}

/**
 * fill all containers designed to display the essentials of a proposal
 * @param {any} callback
 */
myRobo.prototype.showProposal = function (callback) {
    var $a = this.appContainers;
    $a.code = this.code;
    $a.showModels('.assets-container');
    $a.showAllocation(function () {
        $a.showSectors(callback);
        $a.showGeomaps();
        $a.showExtras();
        $a.showRadars();
        //$a.showCorrelations();
    });
}

/**
 * fill instruments gallery
 */
myRobo.prototype.showInstruments = function () {
    this.appContainers.showModels($('.assets-container'));
};

/**
 * create and return a new portfollio
 * @param {any} params
 * @param {any} valuedate
 * @param {any} callback
 */
myRobo.prototype.create = function (data, valuedate, callback) {
    var me = this;
    me.pc.post('create', data, function (result) {
        me.code = result.code;
        // create profiled allocation
        me.allocation(valuedate, function (alloc) {
            var params = $.param(alloc);
            // upload this new allocation
            me.pc.post('upload', params, function (result) {
                callback(result);
                return false;
            });
        });
        return false;
    });
};

/**
 * Post a proposal and send an email to connect
 * @param {any} data
 * @param {any} callback
 */
myRobo.prototype.post = function (data, callback) {
    var me = this;
    me.lc.post('create', data, function (result) {
        callback(result);
        return false;
    });
};

/**
 * get portfolio
 * @param {any} callback
 */
myRobo.prototype.get = function (callback) {

    var me = this;
    this.pc.get('Get', { code: me.code }, function (data) {
        callback(data);
    });
}

/**
 * return allocation on value date
 * @param {any} valuedate
 */
myRobo.prototype.allocation = function (valuedate, callback) {

    var me = this;      
    // on va chercher toutes les réponses du questionnaire
    me.getAnswers(function (answers) {
        myReadAnswers(me.code, valuedate, answers, callback);
    })  
};

/**
 * get answers
 * @param {any} callback
 */
myRobo.prototype.getAnswers = function (callback) {
    var me = this;
    me.qc.answers(me.kycid, me.userid, function (answers) {
        callback(answers);
    });
}

/**
 * populate answers table
 * @param {any} tbody
 * @param {any} callback
 */
myRobo.prototype.showAnswers = function (tbody, callback) {
    this.getAnswers(function (answers) {
        loadAnswersTable(tbody, answers)
        callback();
    });
}

/**
 * populate table with answ
 * @param {any} tbody
 * @param {any} callback
 */
myRobo.prototype.showReportAnswers = function (tbody, callback) {
    var me = this;
    me.qc.reportAnswers(me.code, function (answers) {
        loadAnswersTable(tbody, answers)
        callback();
    });
}

/**
 * get diligence
 */
myRobo.prototype.checkDiligence = function () {
    var me = this;
    me.lc.get('getDiligence', { id: me.code }, function (d) {
        if (d)
            me.userid = d.Email;
    });
}


var loadAnswersTable = function (tbody, data) {
    tbody.empty();
    $.each(data, function (i, q) {
        var tr = $('<tr>');
        var td = $('<td>');
        var label = $('<label>').html(q.Question);
        label.appendTo(td);
        td.appendTo(tr);
        var ta = $('<td>');
        var res = [];
        $.each(q.Answers, function (j, answer) {
            res.push(answer.Answer);
        });
        ta.html(res.join(", "));
        ta.appendTo(tr);
        tr.appendTo(tbody);
    });
}

// common allocation
myAllocation = function (code, valuedate) {
    this.PortfolioCode = code;
    this.ResetPortfolio = true;
    this.FileUpload = false;
    this.Persistence = false;
    this.ValueDate = valuedate;
    this.Records = [];
};
