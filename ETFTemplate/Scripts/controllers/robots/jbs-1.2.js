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
        cry = answer('QCRY') != null ? answer('QCRY').Value : 0, // 0, 5 ou 10% sur les cryptos
        rsk = answer('QDRW').Code, // code en cas de baisse des marchés
        thm = manswers('QTHM'); // codes des thématiques retenues

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

    // retourne la correspondance avec le modèle thématique
    var mythematics = function (key) {

        switch (key) {

            case "TEC":
                return '9e08c162-cdb0-4683-90bb-d5b3104fb88d';
                break;

            case "ENG":
                return 'd242ad70-eba5-4e54-be4b-d1ae5c49c024';
                break;

            default:
                return '4dc10912-304b-4088-b006-661884c00043';
        }
    }

    // return the equities model
    var equities = function (w) {

        var esri = '99a5c2b5-d55d-48dd-9a1a-60a907de0ad3', // world sri  equities
            ewld = 'b01026ed-c691-4c40-9c6c-8c78898ec741', // world classic equities
            eesg = '4dc10912-304b-4088-b006-661884c00043'; // selected thema

        var assets = [];

        if (sri == 0)
            assets.push({ SecurityID: ewld, Weight: w });


        if (sri == 1)
            assets.push({ SecurityID: esri, Weight: w });

        if (sri == 2) {
            var k = thm.length;
            if (k == 0)
                assets.push({ SecurityID: eesg, Weight: w }); // no thematic
            else {
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
        assets.push({ SecurityID: 'b8eef841-dd33-4c8b-900b-1b05d28a62a0', Weight: w })
        return assets;
    }

    // retourne le modele cryptos
    var cryptos = function (w)
    {
        var assets = [];
        assets.push({ SecurityID: '38ef9d60-30ba-435d-8dc6-1a30ea408717', Weight: w })
        return assets;
    }

    // retourne le modele commodities
    var commo = function (w) {
        var assets = [];
        //assets.push({ SecurityID: '709cf1ce-a169-4c5d-8f23-c20b21e4b153', Weight: w })
        return assets;
    }


    // fonction qui détermine la meilleure allocation profilée en fonction de l'age et de l'expérience
    var riskallocation = function (wa, wb, wm) {

        wc = 0;

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

        // si comprends et adopte les cryptos 
        if (cry > 0) {
            wa -= cry;
            wc += cry;
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

        // poche crypto
        if (wc > 0) {
            cryptos(wc).forEach(function (x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });
        }

        // poche commo
        if (wm > 0) {
            commo(wc).forEach(function (x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });
        }

    }

    // creation de l allocation
    alloc = new myAllocation(cp, valuedate);

    // suivant le risque
    switch (rsk) {

        case 'SAL': // profil prudent
            riskallocation(40, 60, 0);
            break;

        case 'WAI': // profil equilibré
            riskallocation(60, 40, 0);
            break;

        case 'INV': // profil agressif
            riskallocation(75, 25, 0);
            break;

        default: // profil audacieux
            riskallocation(80, 20, 0);
            break;

    }

    // retourne l'allocation dans le callback
    callback(alloc);

};
