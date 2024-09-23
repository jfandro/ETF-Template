
LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.OperationsController = function () {
}

// Get all the data from API operations related to one portfolio
LoyolApp.OperationsController.prototype.get = function (action, data, callback) {

    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/Operations/' + action;

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
LoyolApp.OperationsController.prototype.post = function (action, data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
        url = session.domain + '/api/Operations/' + action;

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

// Post the data to the controller API portfolios
LoyolApp.OperationsController.prototype.download = function (data, callback) {
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        var token = session.token,
            url = session.domain + '/api/Operations/DownloadRecordFile';

        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            cache: false,
            processData: false,
            crossDomain: true,
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", 'Bearer ' + token);
            },
            success: function (response, status, xhr) {
                var type = xhr.getResponseHeader('Content-Type');
                var blob = new Blob([response], { type: type });
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);

                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = downloadUrl;
                a.download = "MyStrategy.csv";
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
            },
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    }
}




