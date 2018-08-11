'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const telemetry_1 = require("../../telemetry/telemetry");
const messages = require("../../messages");
class PDKNewTaskCommand {
    constructor(logger, terminal) {
        this.logger = logger;
        this.terminal = terminal;
    }
    run() {
        let nameOpts = {
            placeHolder: "Enter a name for the new Puppet Task",
            matchOnDescription: true,
            matchOnDetail: true
        };
        vscode.window.showInputBox(nameOpts).then(taskName => {
            this.terminal.sendText(`pdk new task ${taskName}`);
            this.terminal.show();
            if (telemetry_1.reporter) {
                telemetry_1.reporter.sendTelemetryEvent(messages.PDKCommandStrings.PdkNewTaskCommandId);
            }
        });
    }
    dispose() {
        this.terminal.dispose();
    }
}
exports.PDKNewTaskCommand = PDKNewTaskCommand;
//# sourceMappingURL=pdkNewTaskCommand.js.map