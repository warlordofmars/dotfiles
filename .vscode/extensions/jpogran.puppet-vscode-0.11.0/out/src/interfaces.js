'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Only add simple interfaces here. No import's allowed
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["NotStarted"] = 0] = "NotStarted";
    ConnectionStatus[ConnectionStatus["Starting"] = 1] = "Starting";
    ConnectionStatus[ConnectionStatus["Running"] = 2] = "Running";
    ConnectionStatus[ConnectionStatus["Stopping"] = 3] = "Stopping";
    ConnectionStatus[ConnectionStatus["Failed"] = 4] = "Failed";
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
var ConnectionType;
(function (ConnectionType) {
    ConnectionType[ConnectionType["Unknown"] = 0] = "Unknown";
    ConnectionType[ConnectionType["Local"] = 1] = "Local";
    ConnectionType[ConnectionType["Remote"] = 2] = "Remote";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
var ProtocolType;
(function (ProtocolType) {
    ProtocolType[ProtocolType["UNKNOWN"] = 0] = "UNKNOWN";
    ProtocolType[ProtocolType["STDIO"] = 1] = "STDIO";
    ProtocolType[ProtocolType["TCP"] = 2] = "TCP";
})(ProtocolType = exports.ProtocolType || (exports.ProtocolType = {}));
//# sourceMappingURL=interfaces.js.map