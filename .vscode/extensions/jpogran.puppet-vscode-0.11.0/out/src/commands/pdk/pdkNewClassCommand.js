'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const telemetry_1 = require("../../telemetry/telemetry");
const messages = require("../../messages");
class PDKNewClassCommand {
    constructor(logger, terminal) {
        this.logger = logger;
        this.terminal = terminal;
    }
    run() {
        let nameOpts = {
            placeHolder: "Enter a name for the new Puppet class",
            matchOnDescription: true,
            matchOnDetail: true
        };
        vscode.window.showInputBox(nameOpts).then(moduleName => {
            this.terminal.sendText(`pdk new class ${moduleName}`);
            this.terminal.show();
            if (telemetry_1.reporter) {
                telemetry_1.reporter.sendTelemetryEvent(messages.PDKCommandStrings.PdkNewClassCommandId);
            }
        });
    }
    dispose() {
        this.terminal.dispose();
    }
}
exports.PDKNewClassCommand = PDKNewClassCommand;
//# sourceMappingURL=pdkNewClassCommand.js.map