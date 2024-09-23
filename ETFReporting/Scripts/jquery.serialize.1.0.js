/**
 * Slightly modified the original script from this website. Instead of setting true and false as strings
 * it should send a plain Boolean variable.
 * 
 * @see https://tdanemar.wordpress.com/2010/08/24/jquery-serialize-method-and-checkboxes/
 */
(function ($) {
    $.fn.serialize = function (options) {
        return $.param(this.serializeArray(options));
    };

    $.fn.serializeArray = function (options) {
        var o = $.extend({
            checkboxesAsBools: false
        }, options || {});

        var rselectTextarea = /select|textarea/i;
        var rinput = /text|hidden|password|search|number/i;

        return this.map(function () {
            return this.elements ? $.makeArray(this.elements) : this;
        })
            .filter(function () {
                return this.name && !this.disabled &&
                    (this.checked
                        || (o.checkboxesAsBools && this.type === 'checkbox')
                        || rselectTextarea.test(this.nodeName)
                        || rinput.test(this.type));
            })
            .map(function (i, elem) {
                var val = $(this).val();
                return val == null ?
                    null :
                    $.isArray(val) ?
                        $.map(val, function (val, i) {
                            return { name: elem.name, value: val };
                        }) :
                        {
                            name: elem.name,
                            value: (o.checkboxesAsBools && this.type === 'checkbox') ?
                                (this.checked ? true : false) :
                                val
                        };
            }).get();
    };
})(jQuery);