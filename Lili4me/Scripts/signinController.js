// The signinForm variable will hold a reference to the jQuery Mobile page that hosts the Sign In screen

var LoyolApp = LoyolApp || {};

// Constructor
LoyolApp.SignInController = function (frm) {

    this.signinForm = $(frm);
    this.$btnSubmit = $('button[type=submit]', frm);
    this.$txtUsername = $('#username', frm);
    this.$txtPassword = $('#password', frm);
    this.$txtDomain = $('#domain', frm);
    this.$ctnErr = $("#ctn-err", frm);
    this.mainMenuPageId = null;
    this.invisibleStyle = 'hidden';
    this.invalidInputStyle = 'invalid-input';
    this.onSignin = null;

    var me = this;

    // The step of the authentication sequence in our app is to send the user credentials to the server, 
    // and wait for a response that will tell us if we can let the user in.
    // We will perform this step inside a template method that we will call onSignInCommand. 
    // We will invoke this method when the user pushes the Sign In button in the Sign In Screen
    $(frm).submit(function () {

        var emailAddress = me.$txtUsername.val().trim(),
            password = me.$txtPassword.val().trim(),
            domain = me.$txtDomain.val().trim(),
            invalidInput = false,
            invisibleStyle = me.invisibleStyle,
            invalidInputStyle = me.invalidInputStyle;

        // Reset styles.
        me.$ctnErr.removeClass().addClass(invisibleStyle);
        me.$txtUsername.removeClass(invalidInputStyle);
        me.$txtPassword.removeClass(invalidInputStyle);

        // Flag each invalid field.
        if (emailAddress.length === 0) {
            me.$txtUsername.addClass(invalidInputStyle);
            invalidInput = true;
        }

        // Check password length
        if (password.length === 0) {
            me.$txtPassword.addClass(invalidInputStyle);
            invalidInput = true;
        }

        // Make sure that all the required fields have values.
        if (invalidInput) {
            me.$ctnErr.html("<p>Please enter all the required fields.</p>");
            me.$ctnErr.addClass("bi-ctn-err").slideDown();
            return;
        }
        // Check email address
        //if (!me.emailAddressIsValid(emailAddress)) {
        //    me.$ctnErr.html("<p>Please enter a valid email address.</p>");
        //    me.$ctnErr.addClass("bi-ctn-err").slideDown();
        //    me.$txtUsername.addClass(invalidInputStyle);
        //    return;
        //}

        // Create login data
        var loginData = {
            grant_type: 'password',
            username: emailAddress,
            password: password
        };

        // Show loader
        $.post(LoyolApp.Settings.signInUrl(), loginData)
            .success(function (resp) {
                // Create session in case of Success
                var expirationDate = new Date();
                expirationDate.setMinutes(expirationDate + parseInt(resp.expires_in));
                LoyolApp.Session.getInstance().set({
                    domain:domain,
                    token: resp.access_token,
                    userGuid: resp.userGuid,
                    username: resp.userName,
                    expirationDate: expirationDate,
                    keepSignedIn: true
                });
                // Go to next step
                me.onSignin;
            })
            .complete(function () {
                me.onSignin();
            })
            .fail(function (e) {
                me.$ctnErr.html("<p>Oops! Lili had a problem and could not log you on.  Please try again in a few minutes.</p>");
                me.$ctnErr.addClass("bi-ctn-err").slideDown();
            })
            .error(function (e) {
                me.$ctnErr.html("<p>Aie! Lili had a problem and could not log you on.  Please try again in a few minutes.</p>");
                me.$ctnErr.addClass("bi-ctn-err").slideDown();
            });

        // Important to return false on submit
        return false;
    }
)
};

// In charge of the validation of the email address entered by the user
LoyolApp.SignInController.prototype.emailAddressIsValid = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

// In charge to clear the email address, password and “keep me signed in” form elements when the Sign In screen is activated. 
// Clearing these elements prevents us from accidentally showing any values entered previously
LoyolApp.SignInController.prototype.resetSignInForm = function () {
    this.$ctnErr.html('');
    this.$ctnErr.removeClass().addClass(this.invisibleStyle);
    this.$txtUsername.removeClass(this.invalidInputStyle);
    this.$txtPassword.removeClass(this.invalidInputStyle);
    this.$txtUsername.val('');
    this.$txtPassword.val('');
    //this.$chkKeepSignedIn.prop('checked', false);
};
