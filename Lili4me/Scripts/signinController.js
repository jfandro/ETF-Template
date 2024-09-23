
var LoyolApp = LoyolApp || {};

// Constructor of the controller
LoyolApp.SignInController = function (domain) {
    this.domain = domain;
}

LoyolApp.SignInController.prototype.setcredentials = function (resp) {
    // read domain
    var domain = this.domain;
    // Create session in case of Success
    var expirationDate = new Date();
    expirationDate.setMinutes(expirationDate + parseInt(resp.expires_in));
    LoyolApp.Session.getInstance().set({
        domain: domain,
        token: resp.access_token,
        userGuid: resp.userGuid,
        username: resp.userName,
        expirationDate: expirationDate,
        keepSignedIn: true
    });
}

// Constructor
LoyolApp.SignInController.prototype.login = function (username, password, onsuccess, onfail, onerror) {

    // Create login data
    var loginData = {
        grant_type: 'password',
        username: username,
        password: password
    };

    // Post data
    $.post(LoyolApp.Settings.signInUrl(), loginData)
        .success(function (resp) {
            // read domain
            var domain = this.domain;
            // Create session in case of Success
            var expirationDate = new Date();
            expirationDate.setMinutes(expirationDate + parseInt(resp.expires_in));
            LoyolApp.Session.getInstance().set({
                domain: domain,
                token: resp.access_token,
                userGuid: resp.userGuid,
                username: resp.userName,
                expirationDate: expirationDate,
                keepSignedIn: true
            });
            onsuccess();
        })
        .complete(onsuccess)
        .fail(onfail)
        .error(onerror);
};

// In charge of the validation of the email address entered by the user
LoyolApp.SignInController.prototype.emailAddressIsValid = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};