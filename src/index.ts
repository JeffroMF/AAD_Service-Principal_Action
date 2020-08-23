import * as core from "@actions/core";
import * as nodeFetch from "node-fetch";

async function main() {
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

        const token = await getToken(adminAppId, adminAppSecret, tenantId);
        console.log("Token generated: "+token);
        const appId = await createApplication(token, name);
        console.log("App created: "+appId);
        core.setOutput("clientId", appId);
        if (isSecretRequired) {
            const secret = await createSecret(token, appId);
            console.log("Secret created: "+secret);
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
    } catch (error) {
        core.setFailed(error.message);
    }
}


async function getToken(appId: string, appSecret: string, tenantId: string): Promise<string> {
    return new Promise((resolve,reject) => {
        const queryParams = new URLSearchParams();
        queryParams.append('client_id', appId);
        queryParams.append('client_secret', appSecret);
        queryParams.append('scope', "Application.ReadWrite.All");
        queryParams.append('grant_type', "client_credentials");
        const token = nodeFetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token", {
            method: "POST",
            body: queryParams
        }).then(res => {
            res.json().then(json => {
                resolve(json.access_token);
            })
        })
    })
}
async function createApplication(token: string, name: string): Promise<string> {
    return new Promise((resolve,reject) => {
        nodeFetch("https://graph.microsoft.com/v1.0/applications", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: {
                "displayName": name
            }
        }).then(resp => {
            resp.json().then(app => {
                resolve(app.appId)
            })
        })
    })
}
async function createSecret(token: string, appId: string): Promise<string> {
    return new Promise((resolve,reject) => {
        nodeFetch("https://graph.microsoft.com/v1.0/applications/" + appId + "/addPassword", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: {
                "displayName": "default"
            }
        }).then(resp => {
            resp.json().then(secret => {
                resolve(secret.secretText);
            })
        })
    })
}

main();