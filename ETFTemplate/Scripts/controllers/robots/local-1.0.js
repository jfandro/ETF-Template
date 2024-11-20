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
            assets.push({ SecurityID: 'e481a272-50ac-476c-a260-bc763ac166fc', Weight: w })
            return assets;
        }

        // retourne le modele cryptos
        var cryptos = function (w) {
            var assets = [];
            assets.push({ SecurityID: 'BTC-USD', Weight: w })
            return assets;
        }

        // fonction qui détermine la meilleure allocation profilée en fonction de l'age et de l'expérience
        var riskallocation = function (wa, wb) {

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
            fixedincomes(wb).forEach(function (x) {
                alloc.Records.push(item(x.SecurityID, x.Weight));
            });

            // poche crypto
            if (wc > 0) {
                cryptos(wc).forEach(function (x) {
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
                riskallocation(90, 10);
                break;

            default: // profil audacieux
                riskallocation(80, 20);
                break;

        }

        // retourne l'allocation dans le callback
        callback(alloc);

};
