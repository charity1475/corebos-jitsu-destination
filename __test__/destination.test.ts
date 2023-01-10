import { JitsuDestinationContext } from "@jitsu/types/extension"
import { testDestination } from "jitsu-cli/lib/tests"
import { destination } from "../src"

testDestination({
  name: "Create a comment in FAQ record in coreBOS",
  context: {
    destinationId: "test",
    destinationType: "createFAQ",
    config: {
      "url": "https://demo.corebos.com",
      "event_types": "registration,error,comment",
      "username": "admin",
      "access_key": "cdYTBpiMR9RfGgO",
      "instance_name": "corebos",
      "faq_id": "3x4681",
      "comment": "A sample comment of event type: ${event_type}"
    },
  },
  destination: destination,
  event: {
    event_type: 'comment',
  },
  expectedResult: [{
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
  },]
})
