// The $signInPage variable will hold a reference to the jQuery Mobile page that hosts the Sign In screen

    var LoyolApp = LoyolApp || {};

    $('.signin-form').submit(function () {

            var username = $('#username').val(),
                password = $('#password').val();

            if (username.length > 3 && password.length > 5) {

                // Create login data
                var loginData = {
                    grant_type: 'password',
                    username: username,
                    password: password
                };

                // Request server
                $.post(LoyolApp.Settings.signInUrl, loginData)
                    .success(function (resp) {
                        // Expiration of session
                        var today = new Date();
                        var expirationDate = new Date();
                        expirationDate.setMinutes(expirationDate + parseInt(resp.expires_in));
                        LoyolApp.Session.getInstance().set({
                            token: resp.access_token,
                            userGuid: resp.userGuid,
                            username: resp.userName,
                            expirationDate: expirationDate,
                            keepSignedIn: true
                        });
                        $('.signin-form').addClass('hidden');
                        $('.btn-signout').removeClass('hidden');
                    })
                    .complete(function () {
                    })
                    .fail(function () {
                        $('#ctnErr').html("<p>Oops! Loyol had a problem and could not log you on.  Please try again in a few minutes.</p>");
                        $('#ctnErr').removeClass('hide');
                    })
                    .error(function (e) {
                        $('#ctnErr').html("<p>Aie! Loyol had a problem and could not log you on.  Please try again in a few minutes.</p>");
                        $('#ctnErr').removeClass('hide');
                    });

            } else {
                alert('Please fill all necessary fields');
            }
            return false; // cancel original event to prevent form submitting
    });

    // Remove token from current session
    $('.btn-signout').click(function () {
        LoyolApp.Session.logOff();
    })


