'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var JenkinsIndicator = require('./JenkinsIndicator');
var open = require('open');
function activate(context) {
    var jenkinsIndicator;
    var settings = [];
    var hasJenkinsInRoot;
    hasJenkinsInRoot = vscode.workspace.rootPath && fs.existsSync(path.join(vscode.workspace.rootPath, '.jenkins'));
    if (hasJenkinsInRoot) {
        settings = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath, '.jenkins')).toString());
        settings = Array.isArray(settings) ? settings : [settings];
        var noNameCount = -1;
        for (var index = 0; index < settings.length; index++) {
            var setting = settings[index];
            if (!(setting.name)) {
                noNameCount++;
                setting.name = "Jenkins" + (noNameCount ? noNameCount : "");
            }
            setting.cmd = 'Jenkins.' + setting.name + '.openInJenkins';
            registerCommandForGivenSetting(setting.cmd, setting.url);
        }
        jenkinsIndicator = new JenkinsIndicator.JenkinsIndicator(settings);
        var jenkinsController = new JenkinsIndicator.JenkinsIndicatorController(jenkinsIndicator);
        context.subscriptions.push(jenkinsController);
        context.subscriptions.push(jenkinsIndicator);
        var interval = void 0;
        var polling = vscode.workspace.getConfiguration('jenkins').get('polling', 0);
        if (polling > 0) {
            setInterval(updateStatus, polling * 60000);
        }
    }
    var dispUpdateStatus = vscode.commands.registerCommand('jenkins.updateStatus', function () { return updateStatus(); });
    context.subscriptions.push(dispUpdateStatus);
    var dispOpenInJenkins = vscode.commands.registerCommand('jenkins.openInJenkins', function () { return openInJenkins(); });
    context.subscriptions.push(dispOpenInJenkins);
    function openInJenkins() {
        if (!hasJenkinsInRoot) {
            vscode.window.showWarningMessage('The project is not enabled for Jenkins. Missing .jenkins file.');
        }
        else {
            vscode.window.showQuickPick(settings.map(function (setting) { return setting.name; }), {
                placeHolder: 'Select the Jenkins job to open in browser'
            })
                .then(function (jobName) {
                vscode.commands.executeCommand('Jenkins.' + jobName + '.openInJenkins');
            });
        }
    }
    ;
    function updateStatus() {
        if (!hasJenkinsInRoot) {
            vscode.window.showWarningMessage('The project is not enabled for Jenkins. Missing .jenkins file.');
        }
        else {
            jenkinsIndicator.updateJenkinsStatus();
        }
    }
    ;
    function registerCommandForGivenSetting(cmd, url) {
        var dispOpenInJenkins = vscode.commands.registerCommand(cmd, function () {
            open(url);
        });
        context.subscriptions.push(dispOpenInJenkins);
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map