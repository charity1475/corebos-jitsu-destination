import { DestinationFunction, DestinationMessage, JitsuDestinationContext, ConfigValidator} from "@jitsu/types/extension";
import { DefaultJitsuEvent } from "@jitsu/types/event";

export type DestinationConfig = {
  exampleParam: string
}  

export const validator: ConfigValidator<DestinationConfig> = async (config: DestinationConfig) => {
  if (config.exampleParam !== 'valid-config') {
    return `Invalid config: exampleParam expected to be 'valid-config', but actual value is: ${config.exampleParam}`;
  }
  return true;
}

export const destination: DestinationFunction = (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<DestinationConfig>) => {
  return { url: "https://test.com", method: "POST", body: { a: (event.a || 0) + 1 } };
};