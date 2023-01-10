import {ConfigValidator, DestinationFunction, ExtensionDescriptor} from "@jitsu/types/extension";
import { coreBOSDestinationFunction, validator} from "./destination";

const destination: DestinationFunction = coreBOSDestinationFunction;

const descriptor: ExtensionDescriptor = {
  id: "corebos-jitsu-destination",
  displayName: "coreBOS",
  icon: "https://corebos.com/documentation/coreboswsapi/favicon.ico",
  description: "Jitsu can send events from JS SDK or Events API to coreBOS API",
  configurationParameters: [
    {
      id: "url",
      type: "string",
      required: true,
      displayName: "coreBOS base url",
      documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#overview\"> refer corebos demo instance</a>",
    },
    {
      id: "event_types",
      type: "string",
      required: true,
      displayName: "events to capture",
      documentation: "comma separated list of events to capture",
    },
    {
      id: "username",
      type: "string",
      required: true,
      displayName: "corebos user usernme",
      documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos username </a>",
    },
    {
      id: "access_key",
      type: "string",
      required: true,
      displayName: "corebos access key",
      documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos account access key </a>",
    },
    {
      id: "instance_name",
      type: "string",
      required: true,
      displayName: "corebos instance name, e.g. corebos",
      documentation: "<a href=\"https://corebos.com/documentation/coreboswsapi/#servers\"> corebos account access key </a>",
    },
    {
      id: "message_template",
      type: "string",
      required: true,
      displayName: "message template",
      documentation: "message template",
    }
  ],
};

export { descriptor, destination, validator };
