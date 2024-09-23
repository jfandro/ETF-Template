// The signinForm variable will hold a reference to the jQuery Mobile page that hosts the Sign In screen

var frm = '#signin-form',
    signinForm = $(frm),
    $btnSubmit = $('button[type=submit]', frm),
    $txtUsername = $('#username', frm),
    $txtPassword = $('#password', frm),
    $txtDomain = $('#domain', frm),
    $ctnErr = $("#ctn-err", frm),
    mainMenuPageId = null,
    invisibleStyle = 'hidden',
    invalidInputStyle = 'invalid-input';

var loginsuccess = function (e) {
    // get the state of current session
    var session = LoyolApp.Session.getInstance().get();
    if (session && session.keepSignedIn && session.token) {
        $('.signin-container').addClass('hidden');
        $('.signoff-container').removeClass('hidden');
    } else {
        $('.signin-container').removeClass('hidden');
        $('.signoff-container').addClass('hidden');
    }
};

var loginfailed = function (e) {
    $ctnErr.html("<p>Oops! Lili had a problem and could not log you on.  Please try again in a few minutes.</p>");
    $ctnErr.addClass("bi-ctn-err").slideDown();
};

var loginerror = function (e) {
    $ctnErr.html("<p>Aie! Lili had a problem and could not log you on.  Please try again in a few minutes.</p>");
    $ctnErr.addClass("bi-ctn-err").slideDown();
};

// The step of the authentication sequence in our app is to send the user credentials to the server, 
// and wait for a response that will tell us if we can let the user in.
// We will perform this step inside a template method that we will call onSignInCommand. 
// We will invoke this method when the user pushes the Sign In button in the Sign In Screen
signinForm.submit(function () {

    var emailAddress = $txtUsername.val().trim(),
        password = $txtPassword.val().trim(),
        domain = $txtDomain.val().trim(),
        invalidInput = false,
        invisibleStyle = invisibleStyle,
        invalidInputStyle = invalidInputStyle;

    // Reset styles.
    $ctnErr.removeClass().addClass(invisibleStyle);
    $txtUsername.removeClass(invalidInputStyle);
    $txtPassword.removeClass(invalidInputStyle);

    // Flag each invalid field.
    if (emailAddress.length === 0) {
        $txtUsername.addClass(invalidInputStyle);
        invalidInput = true;
    }

    // Check password length
    if (password.length === 0) {
        $txtPassword.addClass(invalidInputStyle);
        invalidInput = true;
    }

    // Make sure that all the required fields have values.
    if (invalidInput) {
        $ctnErr.html("<p>Please enter all the required fields.</p>");
        $ctnErr.addClass("bi-ctn-err").slideDown();
        return;
    }

    var sc = new siginController();
    sc.login(emailAddress, password, loginsuccess, loginfailed, loginerror);
    return false;

    }
)



// In charge to clear the email address, password and “keep me signed in” form elements when the Sign In screen is activated. 
// Clearing these elements prevents us from accidentally showing any values entered previously
//LoyolApp.SignInController.prototype.resetSignInForm = function () {
//    this.$ctnErr.html('');
//    this.$ctnErr.removeClass().addClass(this.invisibleStyle);
//    this.$txtUsername.removeClass(this.invalidInputStyle);
//    this.$txtPassword.removeClass(this.invalidInputStyle);
//    this.$txtUsername.val('');
//    this.$txtPassword.val('');
//    //this.$chkKeepSignedIn.prop('checked', false);
//};
