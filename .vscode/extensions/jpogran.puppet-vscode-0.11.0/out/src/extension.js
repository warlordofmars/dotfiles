'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const connection_1 = require("./connection");
const configuration_1 = require("./configuration");
const outputchannel_1 = require("./logging/outputchannel");
const telemetry_1 = require("./telemetry/telemetry");
const puppetcommands_1 = require("./commands/puppetcommands");
const pdkcommands_1 = require("./commands/pdkcommands");
const PuppetStatusBar_1 = require("./PuppetStatusBar");
var connManager;
var commandsRegistered = false;
var terminal;
const langID = 'puppet'; // don't change this
function activate(context) {
    const puppetExtension = vscode.extensions.getExtension('jpogran.puppet-vscode');
    const puppetExtensionVersion = puppetExtension.packageJSON.version;
    notifyOnNewExtensionVersion(context, puppetExtensionVersion);
    context.subscriptions.push(new telemetry_1.Reporter(context));
    var logger = new outputchannel_1.OutputChannelLogger();
    var statusBar = new PuppetStatusBar_1.PuppetStatusBar(langID);
    var configSettings = new configuration_1.ConnectionConfiguration(context);
    if (!fs.existsSync(configSettings.puppetDir)) {
        logger.error('Could not find a valid Puppet installation at ' + configSettings.puppetDir);
        vscode.window
            .showErrorMessage(`Could not find a valid Puppet installation at '${configSettings.puppetDir}'. While syntax highlighting and grammar detection will still work, intellisense and other advanced features will not.`, { modal: false }, { title: 'Troubleshooting Information' })
            .then(item => {
            if (item === undefined) {
                return;
            }
            if (item.title === 'Troubleshooting Information') {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/lingua-pupuli/puppet-vscode#experience-a-problem'));
            }
        });
        return null;
    }
    else {
        logger.debug('Found a valid Puppet installation at ' + configSettings.puppetDir);
    }
    connManager = new connection_1.ConnectionManager(context, logger, statusBar, configSettings);
    if (!commandsRegistered) {
        logger.debug('Configuring commands');
        puppetcommands_1.setupPuppetCommands(langID, connManager, context, logger);
        terminal = vscode.window.createTerminal('Puppet PDK');
        terminal.processId.then(pid => {
            logger.debug('pdk shell started, pid: ' + pid);
        });
        pdkcommands_1.setupPDKCommands(langID, connManager, context, logger, terminal);
        context.subscriptions.push(terminal);
        commandsRegistered = true;
    }
    connManager.start(configSettings);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (connManager !== undefined) {
        connManager.stop();
        connManager.dispose();
    }
}
exports.deactivate = deactivate;
function notifyOnNewExtensionVersion(context, version) {
    return __awaiter(this, void 0, void 0, function* () {
        const viewReleaseNotes = 'View Release Notes';
        const suppressUpdateNotice = 'SuppressUpdateNotice';
        const dontShowAgainNotice = "Don't show again";
        if (context.globalState.get(suppressUpdateNotice, false)) {
            return;
        }
        const result = yield vscode.window.showInformationMessage(`Puppet VSCode has been updated to v${version}`, { modal: false }, { title: dontShowAgainNotice }, { title: viewReleaseNotes });
        if (result === undefined) {
            return;
        }
        if (result.title === viewReleaseNotes) {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://marketplace.visualstudio.com/items/jpogran.puppet-vscode/changelog'));
        }
        else {
            context.globalState.update(suppressUpdateNotice, true);
        }
    });
}
//# sourceMappingURL=extension.js.map