"use strict";
var core = require("@actions/core");
var nodeFetch = require("node-fetch");
try {
    // `who-to-greet` input defined in action metadata file
    var adminAppId = core.getInput("adminApplicationId");
    var adminAppSecret = core.getInput("adminApplicationSecret");
    var tenantId = core.getInput("tenantId");
    var name_1 = core.getInput('applicationName');
    var isSecretRequired_1 = core.getInput('requireSecret');
    var debugMode_1 = core.getInput('requireSecret');
    getToken(adminAppId, adminAppSecret, tenantId).then(function (token) {
        createApplication(token, name_1).then(function (appId) {
            core.setOutput("clientId", appId);
            if (isSecretRequired_1) {
                createSecret(token, appId).then(function (secret) {
                    core.setOutput("clientSecret", secret);
                    if (debugMode_1) {
                        console.info("Client ID: " + appId);
                        console.info("Client Secret: " + secret);
                    }
                });
            }
            else {
                core.setOutput("clientSecret", "");
                if (debugMode_1) {
                    console.info("Client ID: " + appId);
                    console.info("Client Secret: ");
                }
            }
        });
    });
}
catch (error) {
    core.setFailed(error.message);
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
