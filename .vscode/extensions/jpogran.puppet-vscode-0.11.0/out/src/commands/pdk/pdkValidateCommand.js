'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("../../telemetry/telemetry");
const messages = require("../../messages");
class PDKValidateCommand {
    constructor(logger, terminal) {
        this.logger = logger;
        this.terminal = terminal;
    }
    run() {
        this.terminal.sendText(`pdk validate`);
        this.terminal.show();
        if (telemetry_1.reporter) {
            telemetry_1.reporter.sendTelemetryEvent(messages.PDKCommandStrings.PdkValidateCommandId);
        }
    }
    dispose() {
        this.terminal.dispose();
    }
}
exports.PDKValidateCommand = PDKValidateCommand;
//# sourceMappingURL=pdkValidateCommand.js.map