
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.CustomerController = function () {
    this.Code = '';
}

// Get all the data from API portfolios related to one portfolio
LoyolApp.CustomerController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = LoyolApp.Settings.domain + '/api/Customers/' + action;

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
LoyolApp.CustomerController.prototype.post = function (action, data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
            url = LoyolApp.Settings.domain + '/api/Customers/' + action;

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

// Get one report
LoyolApp.CustomerController.prototype.getreport = function (credentials, callback) {
    this.get('ActivityReport', credentials, function (data) {
        callback(data);
    });
}

// Get one access
LoyolApp.CustomerController.prototype.getaccess = function (credentials, callback) {
    this.get('Access', credentials, function (data) {
        callback(data);
    });
}
// Return true or false if report exists
LoyolApp.CustomerController.prototype.exists = function (id, callback) {
    this.get('ReportExists', { id: id }, function (resp) {
        callback(resp.status);
    });
}
