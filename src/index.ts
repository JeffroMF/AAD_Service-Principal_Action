import core from '@actions/core';
import github from '@actions/github';

try {
    // `who-to-greet` input defined in action metadata file
    const name = core.getInput('applicationName');
    const isSecretRequired = core.getInput('requireSecret');


    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    core.setOutput("clientId", "SampleId");
    core.setOutput("clientSecret", "");
} catch (error) {
    core.setFailed(error.message);
}