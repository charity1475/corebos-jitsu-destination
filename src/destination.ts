import { DestinationFunction, DestinationMessage, JitsuDestinationContext, ConfigValidator } from "@jitsu/types/extension";
import { DefaultJitsuEvent } from "@jitsu/types/event";

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
  if (!isValidUrl(config.url)) {
    throw new Error(`Invalid url: ${config.url}`);
  }

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
  const eventTypes = dstContext.config.event_types.split(",")
  if (!eventTypes.includes(event.event_type)) {
    return null
  }
  let messageText = renderTemplateMessage(dstContext.config.message_template, event)
  if (!messageText) {
    return null;
  }




  const context = event.eventn_ctx || event;
  const user = context.user || {};
  const utm = context.utm || {};
  const location = context.location || {};
  const ua = context.parsed_ua || {};
  const conversion = context.conversion || {};
  const matches = context.referer?.match(
    /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i
  );
  const refDomain = matches && matches[1];
  const config = dstContext.config
  const Authorization = `<TOKEN>`;

  //TODO: filter events by config.event_types
  function getTypes(event: DefaultJitsuEvent) {
    return event.type;
  }
  //TODO: send each to a specific endpoint 
  return { url: "https://test.com", method: "POST", body: { a: (event.a || 0) + 1 } };



};
export const notification: DestinationFunction = (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<DestinationConfig>) => {
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
function renderTemplateMessage(str, obj) {
  const get = (obj: any, key: string | string[]) => {
    if (typeof key == 'string')
      key = key.split('.');

    if (key.length == 1)
      return obj[key[0]];
    else if (key.length == 0)
      return obj;
    else
      return get(obj[key[0]], key.slice(1));
  }
  return str.replace(/\$\{(.+)\}/g, (match, p1) => {
    return get(obj, p1)
  })
}