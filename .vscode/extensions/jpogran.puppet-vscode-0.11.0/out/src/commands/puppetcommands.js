"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const messages = require("../../src/messages");
const previewNodeGraphProvider_1 = require("../../src/providers/previewNodeGraphProvider");
const puppetResourceCommand_1 = require("../commands/puppet/puppetResourceCommand");
const puppetFormatDocumentProvider_1 = require("../providers/puppetFormatDocumentProvider");
const PuppetStatusBar_1 = require("../PuppetStatusBar");
function setupPuppetCommands(langID, connManager, ctx, logger) {
    let resourceCommand = new puppetResourceCommand_1.PuppetResourceCommand(connManager, logger);
    ctx.subscriptions.push(resourceCommand);
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetResourceCommandId, () => {
        resourceCommand.run();
    }));
    ctx.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('puppet', {
        provideDocumentFormattingEdits: (document, options, token) => {
            if (vscode.workspace.getConfiguration('puppet').get('format.enable')) {
                return puppetFormatDocumentProvider_1.PuppetFormatDocumentProvider(document, options, connManager);
            }
            else {
                return [];
            }
        }
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetNodeGraphToTheSideCommandId, uri => previewNodeGraphProvider_1.showNodeGraph(uri, true)));
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetShowConnectionMenuCommandId, () => { PuppetStatusBar_1.PuppetStatusBar.showConnectionMenu(); }));
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetShowConnectionLogsCommandId, () => { connManager.showLogger(); }));
    ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetRestartSessionCommandId, () => { connManager.restartConnection(); }));
    const contentProvider = new previewNodeGraphProvider_1.PuppetNodeGraphContentProvider(ctx, connManager);
    const contentProviderRegistration = vscode.workspace.registerTextDocumentContentProvider(langID, contentProvider);
    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
        if (previewNodeGraphProvider_1.isNodeGraphFile(document)) {
            const uri = previewNodeGraphProvider_1.getNodeGraphUri(document.uri);
            contentProvider.update(uri);
        }
    }));
}
exports.setupPuppetCommands = setupPuppetCommands;
//# sourceMappingURL=puppetcommands.js.map