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
        const redirectUrls = core.getInput('redirectUrl');
        const logoutUrl = core.getInput('logoutUrl');

        const enableImplicitIdToken = core.getInput("allowImplicitIdToken");
        const enableImplicitAccessToken = core.getInput("allowImplicitAccessToken");
        const isSecretRequired = core.getInput('requireSecret');
        const debugMode = core.getInput('requireSecret');


        console.log(isSecretRequired);
        console.log(enableImplicitIdToken);

        const token = await getToken(adminAppId, adminAppSecret, tenantId);
        console.info("Token generated...");
        const app = await createApplication(token, name, redirectUrls, logoutUrl, enableImplicitIdToken, enableImplicitAccessToken);
        console.info("App created...");
        core.setOutput("clientId", app.clientId);
        if (isSecretRequired === "true") {
            const secret = await createSecret(token, app.id);
            core.setOutput("clientSecret", secret);
            console.info("Secret created...");
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
    return new Promise(async (resolve, reject) => {
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
async function createApplication(
    token: string, name: string,
    redirectUrls?: string, logoutUrl?: string, allowImplicitId?: string, allowImplicitAccess?: string
): Promise<{ clientId: string, id: string }> {
    return new Promise(async (resolve, reject) => {
        let body: any = { "displayname": name };
        if (redirectUrls && redirectUrls != "") {
            const urls = redirectUrls.split(",");
            body.web = {redirectUris: urls};
            body.web.implicitGrantSettings = {
                enableIdTokenIssuance: false,
                enableAccessTokenIssuance: false
            }
            if (allowImplicitId === "true") body.web.implicitGrantSettings.enableIdTokenIssuance = true;
            if (allowImplicitAccess === "true") body.web.implicitGrantSettings.enableAccessTokenIssuance = true;
        }
        if (logoutUrl !== "") {
            if(body.web) body.web.logoutUrl = logoutUrl;
            else body.web = {logoutUrl: logoutUrl};
        }
        const resp = await nodeFetch("https://graph.microsoft.com/v1.0/applications", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const json = await resp.json();
        resolve({
            clientId: json.appId,
            id: json.id
        });
    })
}
async function createSecret(token: string, appId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
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