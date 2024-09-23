/**
 * return allocation on value date
 * @param {any} valuedate
 */
myallocation = function (robo, valuedate) {

    var questions = robo.questions,
        code = robo.code;

    var sri = function () {
        var q = questions.find(e => e.Code == 'Q3');
        return q == null ? 0 : q.Answers[0].Rank;
    }

    var rsk = function () {
        var q = questions.find(e => e.Code == 'Q8');
        return q == null ? 0 : q.Answers[0].Code;
    }

    // initial amount
    var init = function (ratio) {
        var q = questions.find(e => e.Code == 'Q7');
        if (q == null)
            return 10000 * ratio / 100;
        var a = q.Answers[0];
        switch (a.Value) {
            case 1:
                return 10000 * ratio / 100;
            case 2:
                return 25000 * ratio / 100;
            case 3:
                return 100000 * ratio / 100;
            case 4:
                return 250000 * ratio / 100;
            default:
                return 1e6 * ratio / 100;
        }
    }

    var item = function (securityid, weight) {
        return { SecurityID: securityid, Value: weight, ValueDate: valuedate, Status: 'INV', Units: 'M', Ccy: 'EUR' };
    }

    var equities = function () {
        var esri = 'b9c32ba8-fc2e-41e4-a31e-6681bc8e5859', // world classic equities
            ewld = '7f3234ca-22ed-4747-b5fd-27d85d0971d8', // world sri equities
            eesg = '77a07a53-140c-4ef6-83d5-632593aee7d4', // thema
            srilevel = sri();
        if (srilevel == 0)
            return ewld;
        if (srilevel == 1)
            return esri;
        return eesg;
    }

    var fixedincomes = function () {
        var svg = 'e481a272-50ac-476c-a260-bc763ac166fc';
        return svg;
    }

    var alloc = new myAllocation(code, valuedate);
    switch (rsk()) {

        case 'SAL': // profil prudent
            alloc.Records.push(item(equities, init(40)));
            alloc.Records.push(item(fixedincomes, init(60)));
            break;

        case 'WAI': // profil equilibré
            alloc.Records.push(item(equities, init(60)));
            alloc.Records.push(item(fixedincomes, init(40)));
            break;

        default: // profil agressif
            alloc.Records.push(item(equities, init(80)));
            alloc.Records.push(item(fixedincomes, init(20)));
            break;

    }

    return alloc;

};
