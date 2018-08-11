'use strict';
var vscode = require('vscode');
var Jenkins = require('./Jenkins');
var JenkinsIndicator = (function () {
    function JenkinsIndicator(settings) {
        this.settings = settings;
        this.statusBarItems = {};
    }
    JenkinsIndicator.prototype.dispose = function () {
        this.hideReadOnly();
    };
    JenkinsIndicator.prototype.updateJenkinsStatus = function () {
        var _loop_1 = function(index) {
            var setting = this_1.settings[index];
            // Create as needed
            if (!this_1.statusBarItems.hasOwnProperty(setting.name)) {
                this_1.statusBarItems[setting.name] = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            }
            var statusBarItem = this_1.statusBarItems[setting.name];
            statusBarItem.show();
            var jjj = void 0;
            jjj = new Jenkins.Jenkins;
            var url = void 0;
            var user = void 0;
            var pw = void 0;
            url = setting.url;
            user = setting.username ? setting.username : "";
            pw = setting.password ? setting.password : "";
            // invalid URL
            if (!url) {
                statusBarItem.tooltip = 'No URL Defined';
                statusBarItem.text = setting.name + ' $(x)';
                //statusBarItem.show();
                return { value: void 0 };
            }
            jjj.getStatus(url, user, pw)
                .then(function (status) {
                var icon;
                var tooltip = 'Job Name: ' + status.jobName + '\n' +
                    'Status: ' + status.statusName + '\n' +
                    'URL: ' + status.url + '\n' +
                    'Connection Status: ' + status.connectionStatusName;
                if (typeof status.buildNr !== "undefined")
                    tooltip = tooltip + '\n' +
                        'Build #: ' + status.buildNr;
                if (typeof status.code !== "undefined")
                    tooltip = tooltip + '\n' +
                        'Code #: ' + status.code;
                switch (status.status) {
                    case Jenkins.BuildStatus.InProgress:
                        icon = ' $(pulse)';
                        break;
                    case Jenkins.BuildStatus.Sucess:
                        icon = ' $(check)';
                        break;
                    case Jenkins.BuildStatus.Failed:
                        icon = ' $(x)';
                        break;
                    default:
                        icon = ' $(stop)';
                }
                statusBarItem.text = setting.name + icon;
                statusBarItem.tooltip = tooltip;
                statusBarItem.command = setting.cmd;
                //statusBarItem.show();
            });
        };
        var this_1 = this;
        for (var index = 0; index < this.settings.length; index++) {
            var state_1 = _loop_1(index);
            if (typeof state_1 === "object") return state_1.value;
        }
    };
    JenkinsIndicator.prototype.hideReadOnly = function () {
        var keys = Object.keys(this.statusBarItems);
        for (var index = 0; index < keys.length; index++) {
            var key = keys[index];
            this.statusBarItems[key].dispose();
        }
        this.statusBarItems = {};
    };
    return JenkinsIndicator;
}());
exports.JenkinsIndicator = JenkinsIndicator;
var JenkinsIndicatorController = (function () {
    function JenkinsIndicatorController(indicator) {
        this._isControlled = false;
        var myself = this;
        this.jenkinsIndicator = indicator;
        this.jenkinsIndicator.updateJenkinsStatus();
    }
    JenkinsIndicatorController.prototype.dispose = function () {
        this.disposable.dispose();
    };
    JenkinsIndicatorController.prototype.onEvent = function () {
        this.jenkinsIndicator.updateJenkinsStatus();
    };
    return JenkinsIndicatorController;
}());
exports.JenkinsIndicatorController = JenkinsIndicatorController;
//# sourceMappingURL=JenkinsIndicator.js.map