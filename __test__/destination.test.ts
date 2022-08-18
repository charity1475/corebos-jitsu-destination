import { JitsuDestinationContext } from "@jitsu/types/extension"
import { testDestination } from "jitsu-cli/lib/tests"
import { destination } from "../src"

testDestination({
  name: "basic",
  context: {
    destinationId: "test",
    destinationType: "mydest",
    config: {}
  },
  destination: destination,
  event: {
    event_type: 'test',
    a: 1
  },
  expectedResult: {
    method: "POST",
    url: "https://test.com",
    body: { a: 2 },
  },
})