"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __importDefault(require("@actions/core"));
var node_fetch_1 = __importDefault(require("node-fetch"));
try {
    // `who-to-greet` input defined in action metadata file
    var adminAppId = core_1.default.getInput("adminApplicationId");
    var adminAppSecret = core_1.default.getInput("adminApplicationSecret");
    var tenantId = core_1.default.getInput("tenantId");
    var name_1 = core_1.default.getInput('applicationName');
    var isSecretRequired_1 = core_1.default.getInput('requireSecret');
    var debugMode_1 = core_1.default.getInput('requireSecret');
    getToken(adminAppId, adminAppSecret, tenantId).then(function (token) {
        createApplication(token, name_1).then(function (appId) {
            core_1.default.setOutput("clientId", appId);
            if (isSecretRequired_1) {
                createSecret(token, appId).then(function (secret) {
                    core_1.default.setOutput("clientSecret", secret);
                    if (debugMode_1) {
                        console.info("Client ID: " + appId);
                        console.info("Client Secret: " + secret);
                    }
                });
            }
            else {
                core_1.default.setOutput("clientSecret", "");
                if (debugMode_1) {
                    console.info("Client ID: " + appId);
                    console.info("Client Secret: ");
                }
            }
        });
    });
}
catch (error) {
    core_1.default.setFailed(error.message);
}
function getToken(appId, appSecret, tenantId) {
    return new Promise(function (resolve) {
        var queryParams = new URLSearchParams();
        queryParams.append('client_id', appId);
        queryParams.append('client_secret', appSecret);
        queryParams.append('scope', "Application.ReadWrite.All");
        queryParams.append('grant_type', "client_credentials");
        var token = node_fetch_1.default("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token", {
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
        node_fetch_1.default("https://graph.microsoft.com/v1.0/applications", {
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
        node_fetch_1.default("https://graph.microsoft.com/v1.0/applications/" + appId + "/addPassword", {
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
