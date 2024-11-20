var myReadAnswers = function (cp, valuedate, answers, callback) {

    // retourne la réponse unique donnée à la question portant un code
    var answer = function (code) {
        var q = answers.find(e => e.Code == code);
        return q == null ? null : q.Answers[0];
    }

    // retourne les réponses données à la question portant un code
    var manswers = function (code) {
        var q = answers.find(e => e.Code == code);
        return q == null ? 0 : q.Answers;
    }

    // retourne les réponses aux questions suivantes
    var sri = answer('QESG').Rank, // le niveau de sensibilité esg
        age = answer('QAGE').Rank, // la tranche d'ages
        exp = answer('QEXP').Rank, // le niveau d'expériences
        rsk = answer('QDRW').Code; // code en cas de baisse des marchés

    // montant initial investi
    var init = function (ratio) {
        var apports = answer('QAPP');
        if (apports == null)
            return 100 * ratio;
        return 10 * parseInt(apports.Code.replace('K', '')) * ratio;
    }

    // return an investment of one security with a given weight 
    var item = function (securityid, weight) {
        var amount = init(weight);
        return { SecurityID: securityid, Value: amount, ValueDate: valuedate, Status: 'INV', Units: 'M', Ccy: 'EUR' };
    }

    // return the equities model
    var equities = function (w) {

        var esri = '63668d3b-9beb-4e9e-9ccf-07ee95b8218d', // world sri equities
            ewld = 'e508639a-7de2-48a0-8cc5-90ba3dc40208'; // world classic equities

        var assets = [];

        if (sri == 0)
            assets.push({ SecurityID: ewld, Weight: w });
        else
            assets.push({ SecurityID: esri, Weight: w });

        return assets;
    }

    // retourne le modele fixed incomes
    var fixedincomes = function (w) {
        var assets = [];
        assets.push({ SecurityID: 'd1115cd8-b876-409d-bd88-f3e9ef3cb639', Weight: w })
        return assets;
    }

    // fonction qui détermine la meilleure allocation profilée en fonction de l'age et de l'expérience
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
        equities(wa).forEach(function (x) {
            alloc.Records.push(item(x.SecurityID, x.Weight));
        });

        // poche obligation
        if (wb > 0) {
            fixedincomes(wb).forEach(function (x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });
        }

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
            riskallocation(75, 25);
            break;

        default: // profil audacieux
            riskallocation(90, 20);
            break;

    }

    // retourne l'allocation dans le callback
    callback(alloc);

};
