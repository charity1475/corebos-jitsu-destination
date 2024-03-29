import {
  DestinationFunction,
  DestinationMessage,
  JitsuDestinationContext,
  ConfigValidator,
} from "@jitsu/types/extension";
import { DefaultJitsuEvent } from "@jitsu/types/event";
import md5 from "blueimp-md5";

export type DestinationConfig = {
  instance_name: string;
  url: string;
  username: string;
  access_key: string;
  event_types: string;
  values: string;
};

export const validator: ConfigValidator<DestinationConfig> = async (
  config: DestinationConfig
) => {
  [
    "instance_name",
    "url",
    "username",
    "access_key",
    "event_types",
    "comment",
  ].forEach((prop) => {
    if (config[prop] === undefined) {
      throw new Error(
        `Required property '${prop}' is absent in config. Present props: ${Object.keys(
          config
        )}`
      );
    }
  });
  return { ok: true };
};

export const coreBOSDestinationFunction: DestinationFunction = (
  event: DefaultJitsuEvent,
  dstContext: JitsuDestinationContext<DestinationConfig>
) => {
  let config = dstContext.config;

  function getEventType($) {
    switch ($.event_type) {
      case "comment":
        return "$comment";
      case "pageview":
        return "$site_page";
      default:
        return $.event_type;
    }
  }

  const eventType = getEventType(event);
  let envelops: DestinationMessage[] = [];

  if (eventType == "$comment") {
    envelops.push({
      url: "https://demo.corebos.com/webservice.php/addTicketFaqComment?operation=addTicketFaqComment",
      method: "POST",
      headers: {
        "corebos-authorization": "mysupersecuretoken",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: {
        operation: "addTicketFaqComment",
        module: "Faq",
        values: '{"comments":"$comment"}',
        id: "$faq_id",
      },
    });
  }
  return envelops;
};

const isValidUrl = (urlString) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" +
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
    "((\\d{1,3}\\.){3}\\d{1,3}))" +
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
    "(\\?[;&a-z\\d%_.~+=-]*)?" +
    "(\\#[-a-z\\d_]*)?$",
    "i"
  );

  return !!urlPattern.test(urlString);
};
