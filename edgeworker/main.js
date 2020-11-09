import { logger } from "log";
import { createResponse } from "create-response";
import { executeHandler } from "./router.js";

const URL = "https://mmgdn1.demo.macrometa.io";
const API_KEY =
  "fashionstore_macrometa.io.fashionstore.LxBhnHq7vSBNWLmb9d2pD4tLDwuMgyG6gKCOn6tWEVI1IKFzMswxckeaYtbmHlbp7f59fd";
const FABRIC = "_system";

export async function responseProvider(request) {
  const response = await executeHandler(request);
  return Promise.resolve(
    createResponse(
      200,
      {
        headers: {
          "Content-Type": ["application/json"],
          "Content-Language": ["en-US"],
        },
      },
      JSON.stringify(response)
      // JSON.stringify({
      //   method: request.method,
      //   custom: request.path,
      //   params: params.get("testParam"),
      //   allParams: JSON.stringify(params.keys()),
      //   test: TEST,
      //   res,
      //   msg: res.message,
      //   status: res.status,
      // })
    )
  );
}

export function onClientResponse(request, response) {
  // Outputs a message to the X-Akamai-EdgeWorker-onClientResponse-Log header.
  logger.log("Adding a header in ClientResponse");

  response.setHeader("X-Hello-World", "From Akamai EdgeWorkers");
}

// tar -czvf fashionstore.tgz main.js bundle.json
// akamai sandbox add-edgeworker 4692 fashionstore.tgz
// akamai sandbox update-edgeworker 4692 fashionstore.tgz
// curl -i --header 'Host: fashionstore.demo.macrometa.io' http://127.0.0.1:9550/api/asadad
// http://fashionstore.demo.macrometa.io:9550/api/a1

// akamai edgeworkers auth --expiry 60 d018263e6439675c18da2d9176d793093652d7537161371e2d292ae9d64a89ae

// Akamai-EW-Trace: st=1604825241~exp=1604828841~acl=/*~hmac=d1c3877b2498bd47e4012a2c63109fd0e2dab15ac6eeb3f3fdb525359ccf58bd

// curl -i --header 'Host: fashionstore.demo.macrometa.io' http://127.0.0.1:9550/api/asadad -H 'Pragma: akamai-x-ew-debug' -H 'Akamai-EW-Trace: st=1604825241~exp=1604828841~acl=/*~hmac=d1c3877b2498bd47e4012a2c63109fd0e2dab15ac6eeb3f3fdb525359ccf58bd'

// let res;
// try {
//   res = await httpRequest(`${URL}/_fabric/${FABRIC}/_api/cursor`, {
//     method: "POST",
//     headers: {
//       authorization: `apikey ${API_KEY}`,
//     },
//     body: JSON.stringify({
//       query: "for dox in testColl return dox",
//       bindVars: {},
//     }),
//   });
//   if (res.ok) {
//     res = await res.json();
//   } else {
//     res = {
//       hasError: true,
//       err: JSON.stringify(res),
//       msg: res.statusText,
//       status: res.status,
//     };
//   }
// } catch (err) {
//   res = {
//     hasError: true,
//     err: JSON.stringify(err),
//     msg: err.message,
//     body: err.body,
//   };
// }
