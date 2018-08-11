"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageclient_1 = require("vscode-languageclient");
var PuppetVersionRequest;
(function (PuppetVersionRequest) {
    PuppetVersionRequest.type = new vscode_languageclient_1.RequestType0('puppet/getVersion');
})(PuppetVersionRequest = exports.PuppetVersionRequest || (exports.PuppetVersionRequest = {}));
var PuppetResourceRequest;
(function (PuppetResourceRequest) {
    PuppetResourceRequest.type = new vscode_languageclient_1.RequestType('puppet/getResource');
})(PuppetResourceRequest = exports.PuppetResourceRequest || (exports.PuppetResourceRequest = {}));
var PuppetFixDiagnosticErrorsRequest;
(function (PuppetFixDiagnosticErrorsRequest) {
    PuppetFixDiagnosticErrorsRequest.type = new vscode_languageclient_1.RequestType('puppet/fixDiagnosticErrors');
})(PuppetFixDiagnosticErrorsRequest = exports.PuppetFixDiagnosticErrorsRequest || (exports.PuppetFixDiagnosticErrorsRequest = {}));
var CompileNodeGraphRequest;
(function (CompileNodeGraphRequest) {
    CompileNodeGraphRequest.type = new vscode_languageclient_1.RequestType('puppet/compileNodeGraph');
})(CompileNodeGraphRequest = exports.CompileNodeGraphRequest || (exports.CompileNodeGraphRequest = {}));
class PuppetCommandStrings {
}
PuppetCommandStrings.PuppetResourceCommandId = 'extension.puppetResource';
PuppetCommandStrings.PuppetNodeGraphToTheSideCommandId = 'extension.puppetShowNodeGraphToSide';
PuppetCommandStrings.PuppetShowConnectionMenuCommandId = 'extension.puppetShowConnectionMenu';
PuppetCommandStrings.PuppetShowConnectionLogsCommandId = 'extension.puppetShowConnectionLogs';
PuppetCommandStrings.PuppetRestartSessionCommandId = 'extension.puppetRestartSession';
exports.PuppetCommandStrings = PuppetCommandStrings;
class PDKCommandStrings {
}
PDKCommandStrings.PdkNewModuleCommandId = 'extension.pdkNewModule';
PDKCommandStrings.PdkNewClassCommandId = 'extension.pdkNewClass';
PDKCommandStrings.PdkNewTaskCommandId = 'extension.pdkNewTask';
PDKCommandStrings.PdkValidateCommandId = 'extension.pdkValidate';
PDKCommandStrings.PdkTestUnitCommandId = 'extension.pdkTestUnit';
exports.PDKCommandStrings = PDKCommandStrings;
//# sourceMappingURL=messages.js.map