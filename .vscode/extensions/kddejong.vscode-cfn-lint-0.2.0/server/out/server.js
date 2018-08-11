/*
Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License").
You may not use this file except in compliance with the License.
A copy of the License is located at

    http://www.apache.org/licenses/LICENSE-2.0

or in the "license" file accompanying this file. This file is distributed
on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied. See the License for the specific language governing
permissions and limitations under the License.
*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const child_process_1 = require("child_process");
// Create a connection for the server. The connection uses Node's IPC as a transport
let connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities.
connection.onInitialize(() => {
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind
        }
    };
});
// The content of a CloudFormation document has saved. This event is emitted
// when the document get saved
documents.onDidSave((event) => {
    console.log('Running cfn-lint...');
    validateCloudFormationFile(event.document);
});
documents.onDidOpen((event) => {
    validateCloudFormationFile(event.document);
});
// hold the Settings
let Path;
let AppendRules;
let IgnoreRules;
let OverrideSpecPath;
// The settings have changed. Is send on server activation as well.
connection.onDidChangeConfiguration((change) => {
    console.log('Settings have been updated...');
    let settings = change.settings;
    console.log('Settings: ' + JSON.stringify(settings));
    Path = settings.cfnLint.path || 'cfn-lint';
    IgnoreRules = settings.cfnLint.ignoreRules;
    OverrideSpecPath = settings.cfnLint.overrideSpecPath;
    AppendRules = settings.cfnLint.appendRules;
    // Revalidate any open text documents
    documents.all().forEach(validateCloudFormationFile);
});
let isValidating = {};
function convertSeverity(mistakeType) {
    switch (mistakeType) {
        case "Warning":
            return vscode_languageserver_1.DiagnosticSeverity.Warning;
        case "Information":
            return vscode_languageserver_1.DiagnosticSeverity.Information;
        case "Hint":
            return vscode_languageserver_1.DiagnosticSeverity.Hint;
    }
    return vscode_languageserver_1.DiagnosticSeverity.Error;
}
function validateCloudFormationFile(document) {
    let uri = document.uri;
    if (isValidating[uri]) {
        return;
    }
    isValidating[uri] = true;
    let file_to_lint = vscode_languageserver_1.Files.uriToFilePath(uri);
    let is_cfn_regex = new RegExp('"?AWSTemplateFormatVersion"?\s*');
    let is_cfn = false;
    let text = document.getText().split("\n");
    for (var index in text) {
        if (is_cfn_regex.exec(text[index])) {
            is_cfn = true;
        }
    }
    connection.console.log("Is CFN: " + is_cfn);
    if (is_cfn) {
        let args = ['--format', 'json', '--template', file_to_lint];
        if (IgnoreRules.length > 0) {
            for (var ignoreRule of IgnoreRules) {
                args.push('--ignore-checks');
                args.push(ignoreRule);
            }
        }
        if (AppendRules.length > 0) {
            for (var appendRule of AppendRules) {
                args.push('--append-rules');
                args.push(appendRule);
            }
        }
        if (OverrideSpecPath !== "") {
            args.push('--override-spec', OverrideSpecPath);
        }
        connection.console.log(`running............. ${Path} ${args}`);
        let child = child_process_1.spawn(Path, args);
        let diagnostics = [];
        let filename = uri.toString();
        let start = 0;
        let end = Number.MAX_VALUE;
        child.on('error', function (err) {
            let errorMessage = `Unable to start cfn-lint (${err}). Is cfn-lint installed correctly?`;
            connection.console.log(errorMessage);
            let lineNumber = 0;
            let diagnostic = {
                range: {
                    start: { line: lineNumber, character: start },
                    end: { line: lineNumber, character: end }
                },
                severity: vscode_languageserver_1.DiagnosticSeverity.Error,
                message: errorMessage
            };
            diagnostics.push(diagnostic);
        });
        child.stderr.on("data", (data) => {
            let err = data.toString();
            connection.console.log(err);
            let lineNumber = 0;
            let diagnostic = {
                range: {
                    start: { line: lineNumber, character: start },
                    end: { line: lineNumber, character: end }
                },
                severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
                message: err
            };
            diagnostics.push(diagnostic);
        });
        let stdout = "";
        child.stdout.on("data", (data) => {
            stdout = stdout.concat(data.toString());
        });
        child.on('exit', function (code, signal) {
            console.log('child process exited with ' +
                `code ${code} and signal ${signal}`);
            let tmp = stdout.toString();
            let obj = JSON.parse(tmp);
            for (let element of obj) {
                let lineNumber = (Number.parseInt(element.Location.Start.LineNumber) - 1);
                let columnNumber = (Number.parseInt(element.Location.Start.ColumnNumber) - 1);
                let lineNumberEnd = (Number.parseInt(element.Location.End.LineNumber) - 1);
                let columnNumberEnd = (Number.parseInt(element.Location.End.ColumnNumber) - 1);
                let diagnostic = {
                    range: {
                        start: { line: lineNumber, character: columnNumber },
                        end: { line: lineNumberEnd, character: columnNumberEnd }
                    },
                    severity: convertSeverity(element.Level),
                    message: element.Message
                };
                diagnostics.push(diagnostic);
            }
        });
        child.on("close", () => {
            //connection.console.log(`Validation finished for(code:${code}): ${Files.uriToFilePath(uri)}`);
            connection.sendDiagnostics({ uri: filename, diagnostics });
            isValidating[uri] = false;
        });
    }
}
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map