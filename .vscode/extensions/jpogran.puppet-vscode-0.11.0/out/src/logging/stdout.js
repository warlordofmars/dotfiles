'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class StandardOutLogger {
    show() { }
    verbose(message) {
        this.emitMessage('VERBOSE', message);
    }
    debug(message) {
        this.emitMessage('DEBUG', message);
    }
    normal(message) {
        this.emitMessage('NORMAL', message);
    }
    warning(message) {
        this.emitMessage('WARNING', message);
    }
    error(message) {
        this.emitMessage('ERROR', message);
    }
    emitMessage(severity, message) {
        if (process.stdout.writable) {
            process.stdout.write(severity + ': ' + message + '\n');
        }
    }
}
exports.StandardOutLogger = StandardOutLogger;
//# sourceMappingURL=stdout.js.map