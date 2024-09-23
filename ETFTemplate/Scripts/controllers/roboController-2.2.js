
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

    var cp = this.code;

    // on va chercher toutes les réponses du questionnaire
    this.getAnswers(function (answers) {

        // retourne la réponse unique donnée à la question portant un code
        var answer = function (code) {
            var q = answers.find(e => e.Code == code);
            return q == null ? 0 : q.Answers[0];
        }

        // retourne les réponses données à la question portant un code
        var manswers = function (code) {
            var q = answers.find(e => e.Code == code);
            return q == null ? 0 : q.Answers;
        }

        // retourne les réponses suivante
        var sri = answer('QESG').Rank, // le niveau de sensibilité esg
            age = answer('QAGE').Rank, // la tranche d'ages
            exp = answer('QEXP').Rank, // le niveau d'expériences
            rsk = answer('QDRW').Code, // code en cas de baisse des marchés
            thm = manswers('QTHM');

        // montant initial investi
        var init = function (ratio) {
            var apports = answer('QAPP');
            if (apports == null)
                return 100 * ratio;
            return 10 * parseInt(apports.Code.replace('K', '')) * ratio;
        }

        // return an investment of one security with a given weight 
        var item = function (securityid, weight) {
            return { SecurityID: securityid, Value: weight, ValueDate: valuedate, Status: 'INV', Units: 'M', Ccy: 'EUR' };
        }

        // retourne la correspondance avec le modèle thématique
        var mythematics = function (key) {

            switch (key) {

                case "TEC":
                    return '7f410c5d-1517-4da1-96d5-cae9e58e68d6';
                    break;

                case "SMT":
                    return '4124fe36-68f4-448b-96c2-4773ab662875';
                    break;

                case "ENG":
                    return '286f6b20-3ebf-46dd-a507-abd8291551a4';
                    break;

                case "RUS":
                    return '8e797049-c05d-46a7-88b7-f81a5dca5424';
                    break;

                default:
                    return '77a07a53-140c-4ef6-83d5-632593aee7d4';
            }
        }

        // return the equities model
        var equities = function (w) {

            var esri = 'b9c32ba8-fc2e-41e4-a31e-6681bc8e5859', // world classic equities
                ewld = '7f3234ca-22ed-4747-b5fd-27d85d0971d8', // world sri equities
                eesg = '77a07a53-140c-4ef6-83d5-632593aee7d4'; // selected thema

            var assets = [];

            if (sri == 0)
                assets.push({ SecurityID: ewld, Weight: w });
          
            
            if (sri == 1)
                assets.push({ SecurityID: esri, Weight: w });
            
            if (sri == 2) {
                var k = thm.length;
                if (k == 0)
                    assets.push({ SecurityID: eesg, Weight: w }); // no thematic
                else
                {
                    thm.forEach(function (t) {
                        assets.push({ SecurityID: mythematics(t.Code), Weight: w / k });
                    })
                }
            }

            return assets;
        }

        // retourne le modele fixed incomes
        var fixedincomes = function (w) {
            var assets = [];
            assets.push({ SecurityID: 'e481a272-50ac-476c-a260-bc763ac166fc', Weight: w })
            return assets;
        }

        // allocation profilée
        var riskallocation = function (wa, wb) {

            // si l'expérience est forte, on augmente de 5% la partie risquée
            if (exp > 1) {
                wa += 5;
                wb -= 5;
            }
            // si +40 ans on baisse de 7% la partie risquée
            if (age > 1) {
                wa -= 7;
                wb += 7;
            }
            // poche actions
            equities(wa).forEach(function(x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });
            // poche obligation
            fixedincomes(wb).forEach(function (x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });
        }

        // creation de l allocation
        alloc = new myAllocation(cp, valuedate);

        // suivant le risque
        switch (rsk) {

            case 'SAL': // profil prudent
                riskallocation(40, 60);
                break;

            case 'WAI': // profil equilibré
                riskallocation(60, 40);
                break;

            case 'INV': // profil agressif
                riskallocation(100, 0);
                break;

            default: // profil audacieux
                riskallocation(80, 20);
                break;

        }

        // retourne l'allocation dans le callback
        callback(alloc);

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


myAllocation = function (code, valuedate) {
    this.PortfolioCode = code;
    this.ResetPortfolio = true;
    this.FileUpload = false;
    this.Persistence = false;
    this.ValueDate = valuedate;
    this.Records = [];
};
