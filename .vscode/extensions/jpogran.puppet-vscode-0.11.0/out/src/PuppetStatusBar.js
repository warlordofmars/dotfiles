"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const messages_1 = require("./messages");
const interfaces_1 = require("./interfaces");
const PuppetConnectionMenuItem_1 = require("./PuppetConnectionMenuItem");
class PuppetStatusBar {
    constructor(langID) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
        this.statusBarItem.command = messages_1.PuppetCommandStrings.PuppetShowConnectionMenuCommandId;
        this.statusBarItem.show();
        vscode.window.onDidChangeActiveTextEditor(textEditor => {
            if (textEditor === undefined || textEditor.document.languageId !== langID) {
                this.statusBarItem.hide();
            }
            else {
                this.statusBarItem.show();
            }
        });
    }
    setConnectionStatus(statusText, status) {
        console.log(statusText);
        // Set color and icon for 'Running' by default
        var statusIconText = '$(terminal) ';
        var statusColor = '#affc74';
        if (status === interfaces_1.ConnectionStatus.Starting) {
            statusIconText = '$(sync) ';
            statusColor = '#f3fc74';
        }
        else if (status === interfaces_1.ConnectionStatus.Failed) {
            statusIconText = '$(alert) ';
            statusColor = '#fcc174';
        }
        this.statusBarItem.color = statusColor;
        this.statusBarItem.text = statusIconText + statusText;
    }
    static showConnectionMenu() {
        var menuItems = [];
        menuItems.push(new PuppetConnectionMenuItem_1.PuppetConnectionMenuItem("Restart Current Puppet Session", () => { vscode.commands.executeCommand(messages_1.PuppetCommandStrings.PuppetRestartSessionCommandId); }));
        menuItems.push(new PuppetConnectionMenuItem_1.PuppetConnectionMenuItem("Show Puppet Session Logs", () => { vscode.commands.executeCommand(messages_1.PuppetCommandStrings.PuppetShowConnectionLogsCommandId); }));
        vscode
            .window
            .showQuickPick(menuItems)
            .then((selectedItem) => {
            if (selectedItem) {
                selectedItem.callback();
            }
        });
    }
}
exports.PuppetStatusBar = PuppetStatusBar;
//# sourceMappingURL=PuppetStatusBar.js.map