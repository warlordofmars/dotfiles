'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const net = require("net");
const cp = require("child_process");
const null_1 = require("./logging/null");
const rubyHelper_1 = require("./rubyHelper");
const interfaces_1 = require("./interfaces");
// This code just marshalls the STDIN/STDOUT to a socket
// Pause the stdin buffer until we're connected to the debug server
process.stdin.pause();
class DebugErrorResponse {
    constructor(errorMessage) {
        this.request_seq = 1;
        this.success = false;
        this.command = "initialize";
        this.seq = 1;
        this.type = "response";
        this.message = errorMessage;
    }
}
function sendErrorMessage(message) {
    let mesageObject = new DebugErrorResponse(message);
    let jsonMessage = JSON.stringify(mesageObject);
    let payloadString = `Content-Length: ${jsonMessage.length}\r\n\r\n${jsonMessage}`;
    process.stdout.write(payloadString);
}
class DebugConfiguration {
    constructor() {
        this.type = interfaces_1.ConnectionType.Local;
        this.host = "127.0.0.1";
        this.port = 8082;
        this.timeout = 10;
        this.type = interfaces_1.ConnectionType.Local;
        this.protocol = interfaces_1.ProtocolType.TCP;
        this.host = '127.0.0.1';
        this.port = 8082;
        this.timeout = 10;
        this.puppetAgentDir = '';
        this.languageServerPath = '';
        this.rubydir = '';
        this.rubylib = '';
        this.environmentPath = '';
        this.sslCertFile = '';
        this.sslCertDir = '';
        this.pdkDir = '';
        this.languageServerCommandLine = [''];
        this.enableFileCache = false;
        this.debugFilePath = '';
    }
}
function startDebuggingProxy(config, logger, exitOnClose = false) {
    // Establish connection before setting up the session
    logger.debug("Connecting to " + config.host + ":" + config.port);
    let isConnected = false;
    let debugServiceSocket = net.connect(config.port, config.host);
    // Write any errors to the log file
    debugServiceSocket.on('error', (e) => {
        logger.error("Socket ERROR: " + e);
        debugServiceSocket.destroy();
    });
    // Route any output from the socket through stdout
    debugServiceSocket.on('data', (data) => process.stdout.write(data));
    // Wait for the connection to complete
    debugServiceSocket.on('connect', () => {
        isConnected = true;
        logger.debug("Connected to Debug Server");
        // When data comes on stdin, route it through the socket
        process.stdin.on('data', (data) => debugServiceSocket.write(data));
        // Resume the stdin stream
        process.stdin.resume();
    });
    // When the socket closes, end the session
    debugServiceSocket.on('close', () => {
        logger.debug("Socket closed, shutting down.");
        debugServiceSocket.destroy();
        isConnected = false;
        if (exitOnClose) {
            process.exit(0);
        }
    });
}
function startDebugServerProcess(cmd, args, config, logger, options) {
    if ((config.host === undefined) || (config.host === '')) {
        args.push('--ip=127.0.0.1');
    }
    else {
        args.push('--ip=' + config.host);
    }
    args.push('--port=' + config.port);
    args.push('--timeout=' + config.timeout);
    if ((config.debugFilePath !== undefined) && (config.debugFilePath !== '')) {
        args.push('--debug=' + config.debugFilePath);
    }
    logger.debug("Starting the debug server with " + cmd + " " + args.join(" "));
    var proc = cp.spawn(cmd, args, options);
    logger.debug('Debug server PID:' + proc.pid);
    return proc;
}
function startDebugServer(config, debugLogger) {
    let localServer = null;
    let rubyfile = path.join(__dirname, '..', '..', 'vendor', 'languageserver', 'puppet-debugserver');
    if (!fs.existsSync(rubyfile)) {
        sendErrorMessage("Unable to find the Debug Server at " + rubyfile);
        process.exit(255);
    }
    // TODO use argv to pass in stuff?
    if (localServer === null) {
        localServer = rubyHelper_1.RubyHelper.getRubyEnvFromPuppetAgent(rubyfile, config, debugLogger);
    }
    // Commented out for the moment.  This will be enabled once the configuration and exact user story is figured out.
    // if (localServer == null) { localServer = RubyHelper.getRubyEnvFromPDK(rubyfile, config, debugLogger); }
    if (localServer === null) {
        sendErrorMessage("Unable to find a valid ruby environment");
        process.exit(255);
    }
    var debugServerProc = startDebugServerProcess(localServer.command, localServer.args, config, debugLogger, localServer.options);
    let debugSessionRunning = false;
    debugServerProc.stdout.on('data', (data) => {
        debugLogger.debug("OUTPUT: " + data.toString());
        // If the language client isn't already running and it's sent the trigger text, start up a client
        if (!debugSessionRunning && (data.toString().match("DEBUG SERVER RUNNING") !== null)) {
            debugSessionRunning = true;
            startDebuggingProxy(config, debugLogger);
        }
    });
    return debugServerProc;
}
function startDebugging(config, debugLogger) {
    var debugServerProc = startDebugServer(config, debugLogger);
    debugServerProc.on('close', (exitCode) => {
        debugLogger.debug("Debug server terminated with exit code: " + exitCode);
        debugServerProc.kill();
        process.exit(exitCode);
    });
    debugServerProc.on('error', (data) => {
        debugLogger.error(data.message);
    });
    process.on('SIGTERM', () => {
        debugLogger.debug("Received SIGTERM");
        debugServerProc.kill();
        process.exit(0);
    });
    process.on('SIGHUP', () => {
        debugLogger.debug("Received SIGHUP");
        debugServerProc.kill();
        process.exit(0);
    });
    process.on('exit', () => {
        debugLogger.debug("Received Exit");
        debugServerProc.kill();
        process.exit(0);
    });
}
// TODO Do we need a logger? should it be optional?
// var logPath = path.resolve(__dirname, "../logs");
// var logFile = path.resolve(logPath,"DebugAdapter.log");
// let debugLogger = new FileLogger(logFile);
// TODO Until we figure out the logging, just use the null logger
let debugLogger = new null_1.NullLogger();
debugLogger.normal("args = " + process.argv);
let config = new DebugConfiguration();
// Launch command
startDebugging(config, debugLogger);
//# sourceMappingURL=debugAdapter.js.map