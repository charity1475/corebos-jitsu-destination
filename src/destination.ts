import { DestinationFunction, DestinationMessage, JitsuDestinationContext, ConfigValidator } from "@jitsu/types/extension";
import { DefaultJitsuEvent } from "@jitsu/types/event";
import md5 from 'blueimp-md5';

export type DestinationConfig = {
  instance_name: string
  url: string
  username: string
  access_key: string
  event_types: string
  message_template: string
}

export const validator: ConfigValidator<DestinationConfig> = async (config: DestinationConfig) => {
  ['instance_name', 'url', 'username', 'access_key', 'event_types', 'message_template'].forEach(prop => {
    if (config[prop] === undefined) {
      throw new Error(`Required property '${prop}' is absent in config. Present props: ${Object.keys(config)}`);
    }
  });

  try {
    let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
    let response_json = await response.json()
    if (response_json.success == true) {
      return { ok: true }
    } else {
      return "Error: " + response_json.string();
    }
  } catch (error) {
    return "Error: " + error.toString()
  }
}

export const destination: DestinationFunction = (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<DestinationConfig>) => {
  let config = dstContext.config;
  let sessionName = login(config);
  if (sessionName == null) {
    return;
  }
  

  function getEventType($) {
    switch ($.event_type) {
      case "notification":
      case "identify":
        return "$identify";
      case "page":
      case "pageview":
      case "site_page":
        return "Page View";
      default:
        return $.event_type;
    }
  }

  const eventType = getEventType(event);
  let envelops: DestinationMessage[] = [];

  if (eventType == "$identify") {
    envelops.push({
      url: "https://demo.corebos.com/webservice.php/webservice.php/getchallenge?operation=getchallenge&username=admin",
      method: "GET",
      body: {}
    });

  }
  if(eventType == "Page View") {
    envelops.push({
      url: "https://demo.corebos.com/webservice.php/webservice.php/getchallenge?operation=getchallenge&username=admin",
      method: "POST",
      body: JSON.stringify([{
        event: "$site_page",
        properties: {

        }
      }
      ])
    });
  }
  // return envelops;
  return { url: `${dstContext.config.url}/webservice.php/getchallenge?operation=getchallenge&username=${dstContext.config.username}`, method: "GET", body: { a: (event.a || 0) + 1 } };
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

const login = async (config: DestinationConfig) => {
  let response = await fetch(`${config.url}/webservice.php/getchallenge?operation=getchallenge&username=${config.username}`, { method: 'get' });
  let response_json = await response.json()
  if (response_json.success == true) {
    var login_response = await fetch(`${config.url}/webservice.php/login?operation=login&username=${config.username}&accesskey=${md5(response_json.result.token + config.access_key)}`, { method: 'post' });
    let result = await login_response.json();
    return result.result.sessionName;
  } else {
    return null;
  }
}