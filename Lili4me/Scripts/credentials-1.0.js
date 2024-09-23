
/**
 * credentials management
 * @param {any} reportid
 * @param {any} callback
 */
var credentialsControl = function (reportid, callback) {

    var $cus = new LoyolApp.CustomerController();

    // credentials modal
    var credentialsModal = new bootstrap.Modal(document.getElementById('credentials'), {
        keyboard: false
    });

    // on form credentials submit
    $('.form-credentials').submit(function () {
        var params = $(this).serialize();
        $cus.getreport(params, function (data) {
            if (data != null && data.Portfolio != null) {
                // store credentials in cookies
                $.cookie('credentials-u', data.Portfolio.code, { path: '/' });
                $.cookie('credentials-p', $('#password').val(), { path: '/' });
                credentialsModal.hide();
                // return data
                callback(data);
            }
        });
        return false;
    })

    var id = reportid,
        pwd = "";

    // no given report
    if (reportid == "")
    {
        if ($.cookie('credentials-u'))
            id = $.cookie('credentials-u');
        if ($.cookie('credentials-p'))
            pwd = $.cookie('credentials-p');
    }
    else if (reportid == $.cookie('credentials-u'))
        pwd = $.cookie('credentials-p');


    // verify here the client report
    $cus.getreport({ id: id, password: pwd }, function (report) {
        if (report != null && report.Portfolio != null)
            callback(report);
        else
            credentialsModal.show();
    });

}