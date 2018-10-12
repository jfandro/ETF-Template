// The Session Class is a singleton, which saves us from having instantiate it each time we need to save or retrieve session data. 
// Internally, the Class uses the window.localStorage object to move the data to and from local storage. 
// We call the set method to save data, and the get method to retrieve data

var LoyolApp = LoyolApp || {};

LoyolApp.Session = (function () {

    var instance;
    var sessionIdKey = 'signon-session';

    function init() {
        return {
            // Public methods and variables are saved in localstorage
            set: function (sessionData) {
                window.localStorage.setItem(sessionIdKey, JSON.stringify(sessionData));
            },
            get: function () {
                var result = null;
                try {
                    result = JSON.parse(window.localStorage.getItem(sessionIdKey));
                } catch (e) { }
                return result;
            }
        };
    };
    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        },
        logOff: function () {
            window.localStorage.removeItem(sessionIdKey);
            instance = null;
        }
    };
}());