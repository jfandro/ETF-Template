// The signinForm variable will hold a reference to the jQuery Mobile page that hosts the Sign In screen

var LoyolApp = LoyolApp || {};

// Constructor
LoyolApp.SignInController = function () {

    // Create login data
    var loginData = {
        grant_type: 'password',
        username: 'lili',
        password: 'Valmarfl@41'
    };

    // Get token
    $.post(LoyolApp.Settings.signInUrl(), loginData, function (resp) {
        // Create session in case of Success
        var expirationDate = new Date();
        expirationDate.setMinutes(expirationDate + parseInt(resp.expires_in));
        LoyolApp.Session.getInstance().set({
            domain: LoyolApp.Settings.domain,
            token: resp.access_token,
            userGuid: resp.userGuid,
            username: resp.userName,
            expirationDate: expirationDate,
            keepSignedIn: true
        });
    })
};

