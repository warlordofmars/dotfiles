"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const vscode = require("vscode");
const cp = require("child_process");
const interfaces_1 = require("./interfaces");
const rubyHelper_1 = require("./rubyHelper");
const PuppetLanguageClient_1 = require("./PuppetLanguageClient");
const configuration_1 = require("./configuration");
const langID = 'puppet'; // don't change this
const documentSelector = { scheme: 'file', language: langID };
class ConnectionManager {
    constructor(context, logger, statusBar, connectionConfiguration) {
        this.logger = logger;
        this.extensionContext = context;
        this.connectionStatus = interfaces_1.ConnectionStatus.NotStarted;
        this.statusBarItem = statusBar;
        this.connectionConfiguration = connectionConfiguration;
    }
    get status() {
        return this.connectionStatus;
    }
    set status(status) {
        this.connectionStatus = status;
    }
    get languageClient() {
        return this.languageServerClient;
    }
    start(connectionConfig) {
        // Setup the configuration
        this.connectionConfiguration = connectionConfig;
        this.setConnectionStatus('Starting Puppet...', interfaces_1.ConnectionStatus.Starting);
        if (this.connectionConfiguration.type === interfaces_1.ConnectionType.Local) {
            this.createLanguageServerProcess(this.connectionConfiguration.languageServerPath, this.onLanguageServerStart.bind(this));
        }
        else {
            this.languageServerClient = this.createLanguageClient();
            this.extensionContext.subscriptions.push(this.languageServerClient.start());
            this.logStart();
        }
    }
    stop() {
        this.logger.debug('Stopping...');
        this.connectionStatus = interfaces_1.ConnectionStatus.Stopping;
        // Close the language server client
        if (this.languageServerClient !== undefined) {
            this.languageServerClient.stop();
        }
        // The language server process we spawn will close once the
        // client disconnects.  No need to forcibly kill the process here. Also the language
        // client will try and send a shutdown event, which will throw errors if the language
        // client can no longer transmit the message.
        this.connectionStatus = interfaces_1.ConnectionStatus.NotStarted;
        this.logger.debug('Stopped');
    }
    dispose() {
        this.logger.debug('Disposing...');
        // Stop the current session
        this.stop();
        // Dispose of any subscriptions
        this.extensionContext.subscriptions.forEach(item => {
            item.dispose();
        });
    }
    showLogger() {
        this.logger.show();
    }
    logStart() {
        this.logger.debug('Congratulations, your extension "vscode-puppet" is now active!');
    }
    onLanguageServerStart(proc) {
        this.logger.debug('LanguageServer Process Started: ' + proc.pid);
        this.languageServerProcess = proc;
        if (this.languageServerProcess === undefined) {
            if (this.connectionStatus === interfaces_1.ConnectionStatus.Failed) {
                // We've already handled this state.  Just return
                return;
            }
            throw new Error('Unable to start the Language Server Process');
        }
        switch (this.connectionConfiguration.protocol) {
            case interfaces_1.ProtocolType.TCP:
                this.languageServerProcess.stdout.on('data', data => {
                    this.logger.debug('OUTPUT: ' + data.toString());
                    // If the language client isn't already running and it's sent the trigger text, start up a client
                    if (this.languageServerClient === undefined && /LANGUAGE SERVER RUNNING/.test(data.toString())) {
                        if (this.connectionConfiguration.port) {
                            this.languageServerClient = this.createLanguageClient();
                        }
                        else {
                            var p = data.toString().match(/LANGUAGE SERVER RUNNING.*:(\d+)/);
                            this.connectionConfiguration.port = +p[1];
                            this.languageServerClient = this.createLanguageClient();
                        }
                        this.extensionContext.subscriptions.push(this.languageServerClient.start());
                    }
                });
                break;
            case interfaces_1.ProtocolType.STDIO:
                this.logger.debug('Starting STDIO client: ');
                this.languageServerClient = this.createLanguageClient();
                this.extensionContext.subscriptions.push(this.languageServerClient.start());
                break;
        }
        this.languageServerProcess.on('close', exitCode => {
            this.logger.debug('SERVER terminated with exit code: ' + exitCode);
        });
        this.logStart();
    }
    startLanguageServerProcess(cmd, args, options, callback) {
        let logPrefix = '[startLanguageServerProcess] ';
        var parsed = this.connectionConfiguration.languageServerCommandLine;
        args = args.concat(parsed);
        this.logger.debug(logPrefix + 'Starting the language server with ' + cmd + ' ' + args.join(' '));
        var proc = cp.spawn(cmd, args, options);
        this.logger.debug(logPrefix + 'Language server PID:' + proc.pid);
        callback(proc);
    }
    createLanguageServerProcess(serverExe, callback) {
        let logPrefix = '[createLanguageServerProcess] ';
        this.logger.debug(logPrefix + 'Language server found at: ' + serverExe);
        let localServer = rubyHelper_1.RubyHelper.getRubyEnvFromPuppetAgent(serverExe, this.connectionConfiguration, this.logger);
        // Commented out for the moment.  This will be enabled once the configuration and exact user story is figured out.
        //if (localServer == null) { localServer = RubyHelper.getRubyEnvFromPDK(serverExe, this.connectionConfiguration, this.logger); }
        if (localServer === null) {
            this.logger.warning(logPrefix + 'Could not find a valid Puppet Agent installation');
            this.setSessionFailure('Could not find a valid Puppet Agent installation');
            vscode.window.showWarningMessage('Could not find a valid Puppet Agent installation. Functionality will be limited to syntax highlighting');
            return;
        }
        let connMgr = this;
        if (this.connectionConfiguration.protocol === interfaces_1.ProtocolType.TCP) {
            if (this.connectionConfiguration.port) {
                this.logger.debug(logPrefix + 'Selected port for local language server: ' + this.connectionConfiguration.port);
            }
            connMgr.startLanguageServerProcess(localServer.command, localServer.args, localServer.options, callback);
        }
        else {
            this.logger.debug(logPrefix + 'STDIO Server process starting');
            connMgr.startLanguageServerProcess(localServer.command, localServer.args, localServer.options, callback);
        }
    }
    STDIOServerOptions(serverProcess, logger) {
        let serverOptions = function () {
            return new Promise((resolve, reject) => {
                logger.debug(`[Puppet Lang Server Client] stdio connected`);
                resolve(serverProcess);
            });
        };
        return serverOptions;
    }
    createTCPServerOptions(address, port, logger, connectionManager) {
        let serverOptions = function () {
            return new Promise((resolve, reject) => {
                const retries = 5;
                var attempt = 0;
                var client = new net.Socket();
                const rconnect = () => { client.connect(port, address); };
                client.connect(port, address, function () {
                    logger.debug(`[Puppet Lang Server Client] tcp connected`);
                    resolve({ reader: client, writer: client });
                });
                client.on('error', function (err) {
                    if (attempt === retries) {
                        logger.error(`[Puppet Lang Server Client] ` + `Could not start language client: ${err.message}`);
                        connectionManager.setConnectionStatus(`Could not start language client: ${err.message}`, interfaces_1.ConnectionStatus.Failed);
                        vscode.window.showErrorMessage(`Could not start language client: ${err.message}. Please click 'Troubleshooting Information' for resolution steps`, { modal: false }, { title: 'Troubleshooting Information' }).then((item) => {
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
                        attempt = attempt + 1;
                        var message = `Timed out connecting to language server. Is the server running at ${address}:${port} ? Will wait timeout value before trying again`;
                        switch (err.code) {
                            case 'ETIMEDOUT':
                                message = `Timed out connecting to language server. Is the server running at ${address}:${port} ? Will wait timeout value before trying again`;
                                break;
                            case 'ECONNREFUSED':
                                message = `Connect refused to language server. Is the server running at ${address}:${port} ? Will wait for 5 seconds before trying again`;
                                break;
                            default:
                                message = `Connect refused to language server. Is the server running at ${address}:${port} ? Will wait for 5 seconds before trying again`;
                                break;
                        }
                        vscode.window.showWarningMessage(message);
                        logger.warning(message);
                        setTimeout(rconnect, 5000);
                    }
                });
            });
        };
        return serverOptions;
    }
    createLanguageClient() {
        this.logger.debug('Configuring language server options');
        let serverOptions;
        switch (this.connectionConfiguration.protocol) {
            case interfaces_1.ProtocolType.STDIO:
                this.logger.debug(`Starting language server client (stdio)`);
                serverOptions = this.STDIOServerOptions(this.languageServerProcess, this.logger);
                break;
            case interfaces_1.ProtocolType.TCP:
                serverOptions = this.createTCPServerOptions(this.connectionConfiguration.host, this.connectionConfiguration.port, this.logger, this);
                this.logger.debug(`Starting language server client (host ${this.connectionConfiguration.host} port ${this.connectionConfiguration.port})`);
                break;
        }
        this.logger.debug('Configuring language server client options');
        let clientOptions = {
            documentSelector: [documentSelector]
        };
        this.puppetLanguageClient = new PuppetLanguageClient_1.PuppetLanguageClient(this.connectionConfiguration.host, this.connectionConfiguration.port, this, serverOptions, clientOptions, this.statusBarItem, this.logger);
        return this.puppetLanguageClient.languageServerClient;
    }
    restartConnection(connectionConfig) {
        if (connectionConfig === undefined) {
            connectionConfig = new configuration_1.ConnectionConfiguration(this.extensionContext);
        }
        this.stop();
        this.start(connectionConfig);
    }
    setConnectionStatus(statusText, status) {
        this.connectionStatus = status;
        this.statusBarItem.setConnectionStatus(statusText, status);
    }
    setSessionFailure(message, ...additionalMessages) {
        this.setConnectionStatus('Starting Error', interfaces_1.ConnectionStatus.Failed);
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection.js.map