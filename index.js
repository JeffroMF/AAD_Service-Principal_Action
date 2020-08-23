"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var core = require("@actions/core");
var nodeFetch = require("node-fetch");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminAppId, adminAppSecret, tenantId, name_1, isSecretRequired, debugMode, token, appId, secret, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    adminAppId = core.getInput("adminApplicationId");
                    adminAppSecret = core.getInput("adminApplicationSecret");
                    tenantId = core.getInput("tenantId");
                    name_1 = core.getInput('applicationName');
                    isSecretRequired = core.getInput('requireSecret');
                    debugMode = core.getInput('requireSecret');
                    return [4 /*yield*/, getToken(adminAppId, adminAppSecret, tenantId)];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, createApplication(token, name_1)];
                case 2:
                    appId = _a.sent();
                    core.setOutput("clientId", appId);
                    if (!isSecretRequired) return [3 /*break*/, 4];
                    return [4 /*yield*/, createSecret(token, appId)];
                case 3:
                    secret = _a.sent();
                    core.setOutput("clientSecret", secret);
                    if (debugMode) {
                        console.info("Client ID: " + appId);
                        console.info("Client Secret: " + secret);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    core.setOutput("clientSecret", "");
                    if (debugMode) {
                        console.info("Client ID: " + appId);
                        console.info("Client Secret: ");
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function getToken(appId, appSecret, tenantId) {
    return new Promise(function (resolve) {
        var queryParams = new URLSearchParams();
        queryParams.append('client_id', appId);
        queryParams.append('client_secret', appSecret);
        queryParams.append('scope', "Application.ReadWrite.All");
        queryParams.append('grant_type', "client_credentials");
        var token = nodeFetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token", {
            method: "POST",
            body: queryParams
        }).then(function (res) {
            res.json().then(function (json) {
                resolve(json.access_token);
            });
        });
    });
}
function createApplication(token, name) {
    return new Promise(function (resolve) {
        nodeFetch("https://graph.microsoft.com/v1.0/applications", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: {
                "displayName": name
            }
        }).then(function (resp) {
            resp.json().then(function (app) {
                resolve(app.appId);
            });
        });
    });
}
function createSecret(token, appId) {
    return new Promise(function (resolve) {
        nodeFetch("https://graph.microsoft.com/v1.0/applications/" + appId + "/addPassword", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: {
                "displayName": "default"
            }
        }).then(function (resp) {
            resp.json().then(function (secret) {
                resolve(secret.secretText);
            });
        });
    });
}
main();
