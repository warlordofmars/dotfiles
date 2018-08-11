"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const messages = require("../../src/messages");
const pdkNewModuleCommand_1 = require("./pdk/pdkNewModuleCommand");
const pdkNewClassCommand_1 = require("./pdk/pdkNewClassCommand");
const pdkNewTaskCommand_1 = require("./pdk/pdkNewTaskCommand");
const pdkValidateCommand_1 = require("./pdk/pdkValidateCommand");
const pdkTestCommand_1 = require("./pdk/pdkTestCommand");
function setupPDKCommands(langID, connManager, ctx, logger, terminal) {
    let newModuleCommand = new pdkNewModuleCommand_1.PDKNewModuleCommand(logger, terminal);
    ctx.subscriptions.push(newModuleCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkNewModuleCommandId, () => {
        newModuleCommand.run();
    }));
    let newClassCommand = new pdkNewClassCommand_1.PDKNewClassCommand(logger, terminal);
    ctx.subscriptions.push(newClassCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkNewClassCommandId, () => {
        newClassCommand.run();
    }));
    let newTaskCommand = new pdkNewTaskCommand_1.PDKNewTaskCommand(logger, terminal);
    ctx.subscriptions.push(newClassCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkNewTaskCommandId, () => {
        newTaskCommand.run();
    }));
    let validateCommand = new pdkValidateCommand_1.PDKValidateCommand(logger, terminal);
    ctx.subscriptions.push(validateCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkValidateCommandId, () => {
        validateCommand.run();
    }));
    let testUnitCommand = new pdkTestCommand_1.PDKTestUnitCommand(logger, terminal);
    ctx.subscriptions.push(testUnitCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkTestUnitCommandId, () => {
        testUnitCommand.run();
    }));
}
exports.setupPDKCommands = setupPDKCommands;
//# sourceMappingURL=pdkcommands.js.map