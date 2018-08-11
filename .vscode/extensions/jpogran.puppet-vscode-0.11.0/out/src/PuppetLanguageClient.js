"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("./interfaces");
const main_1 = require("vscode-languageclient/lib/main");
const messages_1 = require("./messages");
class PuppetLanguageClient {
    constructor(host, port, connectionManager, serverOptions, clientOptions, statusBarItem, logger) {
        this.host = host;
        this.port = port;
        this.connectionManager = connectionManager;
        this.serverOptions = serverOptions;
        this.clientOptions = clientOptions;
        this.connectionStatus = interfaces_1.ConnectionStatus.NotStarted;
        this.statusBarItem = statusBarItem;
        this.logger = logger;
        var title = `tcp lang server (host ${this.host} port ${this.port})`;
        this.languageServerClient = new main_1.LanguageClient(title, this.serverOptions, this.clientOptions);
        this.languageServerClient.onReady().then(() => {
            logger.debug('Language server client started, setting puppet version');
            this.setConnectionStatus('Loading Puppet', interfaces_1.ConnectionStatus.Starting);
            this.queryLanguageServerStatus();
        }, reason => {
            this.setConnectionStatus('Starting Error', interfaces_1.ConnectionStatus.Failed);
        });
    }
    setConnectionStatus(statusText, status) {
        this.connectionStatus = status;
        this.connectionManager.status = status;
        this.statusBarItem.setConnectionStatus(statusText, status);
    }
    queryLanguageServerStatus() {
        return new Promise((resolve, reject) => {
            let count = 0;
            let lastVersionResponse;
            let handle = setInterval(() => {
                count++;
                // After 30 seonds timeout the progress
                if (count >= 30 || this.languageServerClient === undefined) {
                    clearInterval(handle);
                    this.setConnectionStatus(lastVersionResponse.puppetVersion, interfaces_1.ConnectionStatus.Running);
                    resolve();
                    return;
                }
                this.languageServerClient.sendRequest(messages_1.PuppetVersionRequest.type).then(versionDetails => {
                    lastVersionResponse = versionDetails;
                    if (versionDetails.factsLoaded &&
                        versionDetails.functionsLoaded &&
                        versionDetails.typesLoaded &&
                        versionDetails.classesLoaded) {
                        clearInterval(handle);
                        this.setConnectionStatus(lastVersionResponse.puppetVersion, interfaces_1.ConnectionStatus.Running);
                        resolve();
                    }
                    else {
                        let progress = 0;
                        if (versionDetails.factsLoaded) {
                            progress++;
                        }
                        if (versionDetails.functionsLoaded) {
                            progress++;
                        }
                        if (versionDetails.typesLoaded) {
                            progress++;
                        }
                        if (versionDetails.classesLoaded) {
                            progress++;
                        }
                        progress = Math.round(progress / 4.0 * 100);
                        this.setConnectionStatus('Loading Puppet (' + progress.toString() + '%)', interfaces_1.ConnectionStatus.Starting);
                    }
                });
            }, 1000);
        });
    }
}
exports.PuppetLanguageClient = PuppetLanguageClient;
//# sourceMappingURL=PuppetLanguageClient.js.map