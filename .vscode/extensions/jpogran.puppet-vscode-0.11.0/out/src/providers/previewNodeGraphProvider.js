'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const messages_1 = require("../messages");
const interfaces_1 = require("../interfaces");
const telemetry_1 = require("../telemetry/telemetry");
const messages = require("../messages");
const viz = require("viz.js");
function isNodeGraphFile(document) {
    return document.languageId === 'puppet'
        && document.uri.scheme !== 'puppet'; // prevent processing of own documents
}
exports.isNodeGraphFile = isNodeGraphFile;
function getNodeGraphUri(uri) {
    if (uri.scheme === 'puppet') {
        return uri;
    }
    return uri.with({
        scheme: 'puppet',
        path: uri.fsPath + '.rendered',
        query: uri.toString()
    });
}
exports.getNodeGraphUri = getNodeGraphUri;
class PuppetNodeGraphContentProvider {
    constructor(context, connMgr) {
        this.context = context;
        this.connMgr = connMgr;
        this._onDidChange = new vscode.EventEmitter();
        this._waiting = false;
        this._connectionManager = undefined;
        this._shownLanguageServerNotAvailable = false;
        this._connectionManager = connMgr;
    }
    provideTextDocumentContent(uri) {
        const sourceUri = vscode.Uri.parse(uri.query);
        var thisProvider = this;
        return vscode.workspace.openTextDocument(sourceUri).then(document => {
            const initialData = {
                previewUri: uri.toString(),
                source: sourceUri.toString(),
            };
            if (thisProvider._connectionManager.status != interfaces_1.ConnectionStatus.Running) {
                if (!thisProvider._shownLanguageServerNotAvailable) {
                    vscode.window.showInformationMessage("Puppet Node Graph Preview is not available as the Language Server is not ready");
                    thisProvider._shownLanguageServerNotAvailable = true;
                }
                return "Puppet Node Graph Preview is not available as the Language Server is not ready";
            }
            // Content Security Policy
            const nonce = new Date().getTime() + '' + new Date().getMilliseconds();
            // Use the language server to render the document
            return thisProvider._connectionManager.languageClient
                .sendRequest(messages_1.CompileNodeGraphRequest.type, sourceUri)
                .then((compileResult) => {
                var svgContent = '';
                if (compileResult.dotContent != null) {
                    var styling = `
            bgcolor = "transparent"
            color = "white"
            rankdir = "TB"
            node [ shape="box" penwidth="2" color="#e0e0e0" style="rounded,filled" fontname="Courier New" fillcolor=black, fontcolor="white"]
            edge [ style="bold" color="#f0f0f0" penwith="2" ]

            label = ""`;
                    var graphContent = compileResult.dotContent;
                    // vis.jz sees backslashes as escape characters, however they are not in the DOT language.  Instead
                    // we should escape any backslash coming from a valid DOT file in preparation to be rendered
                    graphContent = graphContent.replace(/\\/g, "\\\\");
                    graphContent = graphContent.replace(`label = "vscode"`, styling);
                    svgContent = viz(graphContent, "svg");
                }
                var errorContent = `<div style='font-size: 1.5em'>${compileResult.error}</div>`;
                if (compileResult.error == null) {
                    errorContent = '';
                }
                if (telemetry_1.reporter) {
                    telemetry_1.reporter.sendTelemetryEvent(messages.PuppetCommandStrings.PuppetNodeGraphToTheSideCommandId);
                }
                return `
            ${errorContent}
            <div id="graphviz_svg_div">
              ${svgContent}
            </div>`;
            });
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        if (!this._waiting) {
            this._waiting = true;
            setTimeout(() => {
                this._waiting = false;
                this._onDidChange.fire(uri);
            }, 300);
        }
    }
}
exports.PuppetNodeGraphContentProvider = PuppetNodeGraphContentProvider;
function showNodeGraph(uri, sideBySide = false) {
    let resource = uri;
    if (!(resource instanceof vscode.Uri)) {
        if (vscode.window.activeTextEditor) {
            // we are relaxed and don't check for puppet files
            // TODO: Should we? Probably
            resource = vscode.window.activeTextEditor.document.uri;
        }
    }
    const thenable = vscode.commands.executeCommand('vscode.previewHtml', getNodeGraphUri(resource), getViewColumn(sideBySide), `Node Graph '${path.basename(resource.fsPath)}'`);
    return thenable;
}
exports.showNodeGraph = showNodeGraph;
function getViewColumn(sideBySide) {
    const active = vscode.window.activeTextEditor;
    if (!active) {
        return vscode.ViewColumn.One;
    }
    if (!sideBySide) {
        return active.viewColumn;
    }
    switch (active.viewColumn) {
        case vscode.ViewColumn.One:
            return vscode.ViewColumn.Two;
        case vscode.ViewColumn.Two:
            return vscode.ViewColumn.Three;
    }
    return active.viewColumn;
}
exports.getViewColumn = getViewColumn;
//# sourceMappingURL=previewNodeGraphProvider.js.map