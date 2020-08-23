"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __importDefault(require("@actions/core"));
var github_1 = __importDefault(require("@actions/github"));
try {
    // `who-to-greet` input defined in action metadata file
    var name_1 = core_1.default.getInput('applicationName');
    var isSecretRequired = core_1.default.getInput('requireSecret');
    // Get the JSON webhook payload for the event that triggered the workflow
    var payload = JSON.stringify(github_1.default.context.payload, undefined, 2);
    console.log("The event payload: " + payload);
    core_1.default.setOutput("clientId", "SampleId");
    core_1.default.setOutput("clientSecret", "");
}
catch (error) {
    console.error(error);
    core_1.default.setFailed(error.message);
}
