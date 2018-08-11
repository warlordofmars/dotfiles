'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const telemetry_1 = require("../../telemetry/telemetry");
const messages = require("../../messages");
class PDKNewModuleCommand {
    constructor(logger, terminal) {
        this.logger = logger;
        this.terminal = terminal;
    }
    run() {
        let nameOpts = {
            placeHolder: "Enter a name for the new Puppet module",
            matchOnDescription: true,
            matchOnDetail: true
        };
        let dirOpts = {
            placeHolder: "Enter a path for the new Puppet module",
            matchOnDescription: true,
            matchOnDetail: true
        };
        vscode.window.showInputBox(nameOpts).then(moduleName => {
            if (moduleName == undefined) {
                vscode.window.showWarningMessage('No module name specifed. Exiting.');
                return;
            }
            vscode.window.showInputBox(dirOpts).then(dir => {
                this.terminal.sendText(`pdk new module --skip-interview ${moduleName} ${dir}`);
                this.terminal.sendText(`code ${dir}`);
                this.terminal.show();
                if (telemetry_1.reporter) {
                    telemetry_1.reporter.sendTelemetryEvent(messages.PDKCommandStrings.PdkNewModuleCommandId);
                }
            });
        });
    }
    dispose() {
        this.terminal.dispose();
    }
}
exports.PDKNewModuleCommand = PDKNewModuleCommand;
//# sourceMappingURL=pdkNewModuleCommand.js.map