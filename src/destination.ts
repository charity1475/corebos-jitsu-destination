import { DestinationFunction, DestinationMessage, JitsuDestinationContext, ConfigValidator } from "@jitsu/types/extension";
import { DefaultJitsuEvent } from "@jitsu/types/event";
import axios from 'axios';

export type DestinationConfig = {
  instance_name:    string
  url:              string
  username:         string
  access_key:       string
  event_types:      string
  message_template: string
}

export const validator: ConfigValidator<DestinationConfig> = async (config: DestinationConfig) => {
  if (!config.instance_name) {
    return `Please provide a corebos instance name: ${config.instance_name}`;
  }
  if (!isValidUrl(config.url)) {
    return "Missing required parameter: url";
  }
  if (!config.event_types) {
    return "Missing required parameter: event_types";
  }
  if (!config.message_template) {
    return "Missing required parameter: message_template";
  }
  if (!config.username) {
    return "Missing required parameter: username";
  }
  if (!config.access_key) {
    return "Missing required parameter: username";
  }

  try {
    let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
    let response_json = await response.json()
    if (response_json.success == true) {
      return true
    } else {
      return "Error: " + response_json.string();
    }
  } catch (error) {
    return "Error: " + error.toString()
  }
}

export const destination: DestinationFunction = (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<DestinationConfig>) => {
  return { url: "https://test.com", method: "POST", body: { a: (event.a || 0) + 1 } };
};

const isValidUrl = urlString => {
  var urlPattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');

  return !!urlPattern.test(urlString);
}