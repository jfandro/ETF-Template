var LoyolApp = LoyolApp || {};
LoyolApp.Settings = LoyolApp.Settings || {};
//LoyolApp.Settings.domain = "http://localhost:64629";
LoyolApp.Settings.domain = "https://etfreporting.com";
LoyolApp.Settings.signInUrl = function () { return this.domain + "/token"; }
LoyolApp.sessionTimeoutInMSec = 3000;