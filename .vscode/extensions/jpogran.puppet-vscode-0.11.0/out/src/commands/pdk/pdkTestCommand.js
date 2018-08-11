'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("../../telemetry/telemetry");
const messages = require("../../messages");
class PDKTestUnitCommand {
    constructor(logger, terminal) {
        this.logger = logger;
        this.terminal = terminal;
    }
    run() {
        this.terminal.sendText(`pdk test unit`);
        this.terminal.show();
        if (telemetry_1.reporter) {
            telemetry_1.reporter.sendTelemetryEvent(messages.PDKCommandStrings.PdkTestUnitCommandId);
        }
    }
    dispose() {
        this.terminal.dispose();
    }
}
exports.PDKTestUnitCommand = PDKTestUnitCommand;
//# sourceMappingURL=pdkTestCommand.js.map