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

        const token = await getToken(adminAppId, adminAppSecret, tenantId);
        console.log("Token generated: "+token);
        const app = await createApplication(token, name);
        console.log("App created: "+app.clientId);
        core.setOutput("clientId", app.clientId);
        if (isSecretRequired === "true") {
            const secret = await createSecret(token, app.id);
            core.setOutput("clientSecret", secret);
            if (debugMode === "true") {
                console.info("Client ID: " + app.clientId);
                console.info("Client Secret: " + secret);
            }
        }
        else {
            core.setOutput("clientSecret", "");
            if (debugMode === "true") {
                console.info("Client ID: " + app.clientId);
                console.info("Client Secret: ");
            }
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}


async function getToken(appId: string, appSecret: string, tenantId: string): Promise<string> {
    return new Promise(async (resolve,reject) => {
        const queryParams = new URLSearchParams();
        queryParams.append('client_id', appId);
        queryParams.append('client_secret', appSecret);
        queryParams.append('scope', "https://graph.microsoft.com/.default");
        queryParams.append('grant_type', "client_credentials");
        const token = await nodeFetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token", {
            method: "POST",
            body: queryParams
        })
        const json = await token.json();
        resolve(json.access_token);
    })
}
async function createApplication(token: string, name: string): Promise<{clientId:string,id:string}> {
    return new Promise(async (resolve,reject) => {
        const resp = await nodeFetch("https://graph.microsoft.com/v1.0/applications", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "displayName": name
            })
        });
        const json = await resp.json();
        resolve({
            clientId: json.appId,
            id: json.id
        });
    })
}
async function createSecret(token: string, appId: string): Promise<string> {
    return new Promise(async (resolve,reject) => {
        const resp = await nodeFetch("https://graph.microsoft.com/v1.0/applications/" + appId + "/addPassword", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "displayName": "default"
            })
        });
        const json = await resp.json();
        resolve(json.secretText);
    })
}

main();