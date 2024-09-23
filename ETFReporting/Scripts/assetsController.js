
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.AssetsController = function () {
    this.Code = '';
}

// Get all the funds from API
LoyolApp.AssetsController.prototype.index = function (callback) {
    this.get('Index', null, callback);
}

// Get all the data from API portfolios related to one portfolio
LoyolApp.AssetsController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/assets/' + action;

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
LoyolApp.AssetsController.prototype.post = function (action, data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/assets/' + action;

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
LoyolApp.AssetsController.prototype.select = function (divname, callback) {
    this.get('Index', null, function (lst) {
        $.each(lst, function (i, item) {
            $('<option value="' + item.code + '">').text(item.name).appendTo(divname);
        });
        callback;
    })
}

// render select countries
LoyolApp.AssetsController.prototype.selectCountry = function (divname, notselected, callback) {
    this.get('Countries', null, function (lst) {
        $('<option selected>').text(notselected).appendTo(divname);
        $.each(lst, function (i, item) {
            $('<option value="' + item.code + '">').text(item.name).appendTo(divname);
        });
        if (callback)
            callback();
    })
}




