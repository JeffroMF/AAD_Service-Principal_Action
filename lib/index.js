"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const nodeFetch = __importStar(require("node-fetch"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Workflow started...");
            // `who-to-greet` input defined in action metadata file
            const adminAppId = core.getInput("adminApplicationId");
            const adminAppSecret = core.getInput("adminApplicationSecret");
            const tenantId = core.getInput("tenantId");
            const name = core.getInput('applicationName');
            const isSecretRequired = core.getInput('requireSecret');
            const debugMode = core.getInput('requireSecret');
            console.log(`Inputs fetched: {
            ${adminAppId}
            ${adminAppSecret}
            ${tenantId}
            ${name}
            ${isSecretRequired}
            ${debugMode}
        }`);
            const token = yield getToken(adminAppId, adminAppSecret, tenantId);
            console.log("Token generated: " + token);
            const appId = yield createApplication(token, name);
            console.log("App created: " + appId);
            core.setOutput("clientId", appId);
            if (isSecretRequired) {
                const secret = yield createSecret(token, appId);
                console.log("Secret created: " + secret);
                core.setOutput("clientSecret", secret);
                if (debugMode) {
                    console.info("Client ID: " + appId);
                    console.info("Client Secret: " + secret);
                }
            }
            else {
                core.setOutput("clientSecret", "");
                if (debugMode) {
                    console.info("Client ID: " + appId);
                    console.info("Client Secret: ");
                }
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function getToken(appId, appSecret, tenantId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const queryParams = new URLSearchParams();
            queryParams.append('client_id', appId);
            queryParams.append('client_secret', appSecret);
            queryParams.append('scope', "https://graph.microsoft.com/.default");
            queryParams.append('grant_type', "client_credentials");
            const token = yield nodeFetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token", {
                method: "POST",
                body: queryParams
            });
            const json = yield token.json();
            console.log(json);
            resolve(json.access_token);
        }));
    });
}
function createApplication(token, name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const resp = yield nodeFetch("https://graph.microsoft.com/v1.0/applications", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "displayName": name
                })
            });
            const json = yield resp.json();
            console.log(json);
            resolve(json.appId);
        }));
    });
}
function createSecret(token, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const resp = yield nodeFetch("https://graph.microsoft.com/v1.0/applications/" + appId + "/addPassword", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "displayName": "default"
                })
            });
            const json = yield resp.json();
            console.log(json);
            resolve(json.secretText);
        }));
    });
}
main();
