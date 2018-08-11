"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class PuppetConfig {
    _findPuppetPath() {
        let config = vscode.workspace.getConfiguration('puppet');
        // config['puppet']
        // Object {enable: true, path: "foo"}
        // config['puppet']['enable']
        // true
        let path = '';
        if (config['path'] !== "") {
            path = config['path'];
        }
        else {
            if (process.platform == "win32") {
                path = "C:\\Program Files\PuppetLabs\puppet";
            }
            else {
                path = "fii";
            }
        }
        return path;
    }
}
exports.PuppetConfig = PuppetConfig;
//# sourceMappingURL=PuppetConfig.js.map