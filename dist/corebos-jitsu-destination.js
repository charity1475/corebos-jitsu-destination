//format=cjs
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const validator = async (config) => {
    [
        "instance_name",
        "url",
        "username",
        "access_key",
        "event_types",
        "comment",
    ].forEach((prop) => {
        if (config[prop] === undefined) {
            throw new Error(`Required property '${prop}' is absent in config. Present props: ${Object.keys(config)}`);
        }
    });
    return { ok: true };
};
const coreBOSDestinationFunction = (event, dstContext) => {
    dstContext.config;
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
    let envelops = [];
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

const destination = coreBOSDestinationFunction;
const descriptor = {
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

exports.descriptor = descriptor;
exports.destination = destination;
exports.validator = validator;

exports.buildInfo = {sdkVersion: "0.9.1", sdkPackage: "jitsu-cli", buildTimestamp: "2023-01-16T10:07:34.420Z"};
