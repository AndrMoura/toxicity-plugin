/* global module */
/* eslint no-undef: "error" */

// Plugin method that runs on plugin load
async function setupPlugin({ config }) {

}

async function makePostRequest(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Accept": "*/*",
           
        },
        body: JSON.stringify(data)
      });
  
      if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
      } else {
        console.error("Request message " + response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
}

async function splitDialogText(dialog_text) {
    
    const userPattern = /user:(.*?)(?=(agent:|$))/gs;
    const agentPattern = /((?:agent|system):.*?(?=(?:agent:|user:|$)))/gs;

    const userMatches = dialog_text.matchAll(userPattern);
    const agentMatches = dialog_text.matchAll(agentPattern);

    const cleanAndTrim = (utterance) => utterance.replace(/^(user|agent|system):/, '').trim();

    const userUtterances = [...userMatches].map(match => cleanAndTrim(match[1]));
    const agentUtterances = [...agentMatches].map(match => cleanAndTrim(match[1]));
    
    return { user: userUtterances, agent: agentUtterances };

}

async function processEvent(event, { config, cache }) {

    const httpString = "http://";
    const hostUrl = config.HOST_URL;
    const path = '/conversation_toxicity';

    const fullUrl = httpString + hostUrl + path;
    if (!event.properties) {
        event.properties = {};
    }

    if (!event.properties['$dialog']) {
        return event
    }

    var dialog = event.properties['$dialog']
    dialog = JSON.parse(dialog);
    const res = await makePostRequest(fullUrl, dialog);

    for (const key in res) {
      if (res[key] > 0) {
            event.properties[key] = res[key]; 
        }
    }

    return event;
}

// The plugin itself
module.exports = {
    setupPlugin,
    processEvent
}
