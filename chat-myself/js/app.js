'use strict';

function App(config) {
    this._config = config;
    this.user = null;
    this.token = null;
    this.loading = true;
}

App.prototype.init = function () {
    // Step 1. QB SDK initialization.
    QB.init(config.credentials.appId, config.credentials.authKey, config.credentials.authSecret, config.appConfig);
}

// QBconfig was loaded from QBconfig.js file
var app = new App(QBconfig);