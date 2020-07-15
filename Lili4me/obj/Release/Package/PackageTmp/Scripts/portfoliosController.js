
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.PortfolioController = function () {
    this.Code = '';
}

// Get all the data from API portfolios related to one portfolio
LoyolApp.PortfolioController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = LoyolApp.Settings.domain + '/api/Portfolios/' + action;

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
LoyolApp.PortfolioController.prototype.post = function (action, data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
            url = LoyolApp.Settings.domain + '/api/portfolios/' + action;

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
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

// render select controls
LoyolApp.PortfolioController.prototype.select = function (divname, callback) {
    this.get('UserIndex', null, function (lst) {
        $.each(lst, function (i, item) {
            $('<option value="' + item.code + '">').text(item.name).appendTo(divname);
        });
        callback;
    })
}

// render select controls
LoyolApp.PortfolioController.prototype.exists = function (id, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
            result = false,
            url = LoyolApp.Settings.domain + '/api/Portfolios/Get';

        $.ajax({
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            url: url,
            data: { code: id },
            crossDomain: true,
            cache: false,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: function (p) { callback(true, p); },
            error: function (xhr, status, error) {
                callback(false, null);
            }
        });
    }
}