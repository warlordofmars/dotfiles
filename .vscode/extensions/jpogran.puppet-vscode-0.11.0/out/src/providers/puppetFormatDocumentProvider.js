'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const interfaces_1 = require("../interfaces");
const messages = require("../messages");
class RequestParams {
}
function PuppetFormatDocumentProvider(document, options, connMgr) {
    if (connMgr.status != interfaces_1.ConnectionStatus.Running) {
        vscode.window.showInformationMessage("Formatting Puppet files is not available as the Language Server is not ready");
        return new Promise((resolve) => { resolve([]); });
    }
    let requestParams = new RequestParams;
    requestParams.documentUri = document.uri.toString(false);
    requestParams.alwaysReturnContent = false;
    return connMgr.languageClient
        .sendRequest(messages.PuppetFixDiagnosticErrorsRequest.type, requestParams)
        .then((result) => {
        result = result;
        if (result.fixesApplied > 0 && result.newContent != null) {
            return [vscode.TextEdit.replace(new vscode.Range(0, 0, document.lineCount, 0), result.newContent)];
        }
        else {
            return [];
        }
    });
}
exports.PuppetFormatDocumentProvider = PuppetFormatDocumentProvider;
//# sourceMappingURL=puppetFormatDocumentProvider.js.map