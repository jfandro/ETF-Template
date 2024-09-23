
LoyolApp = LoyolApp || {};

// Constructor of the lead controller
LoyolApp.LeadController = function () {
}

// Get all the data from API lead connectors
LoyolApp.LeadController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
            url = session.domain + '/api/Leads/' + action;

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

// Post the data to the controller API lead connectors
LoyolApp.LeadController.prototype.post = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {

        var token = session.token,
            url = session.domain + '/api/Leads/' + action;

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            mimeType: 'multipart/form-data',
            cache: false,
            processData: false,
            crossDomain: true,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: callback,
            error: function (xhr, status, error) {
                alert(status);
            }
        });
    }
}

// render select portfolios
LoyolApp.LeadController.prototype.select = function (id, divname, callback) {
    this.get('LeadReports', { id: id }, function (lst) {
        $.each(lst, function (i, report) {
            $('<option value="' + report.Portfolio.code + '">').text(report.Portfolio.name).appendTo(divname);
        });
        if (callback)
            callback();
    })
}
