import { logger } from "log";
import { createResponse } from "create-response";
import { executeHandler } from "./router.js";

export async function responseProvider(request) {
  let result = {};
  let body;
  try {
    const response = await executeHandler(request);
    if (response.ok) {
      result.ok = true;
    } else {
      result.ok = false;
    }
    if (
      response.message &&
      response.status &&
      Object.keys(response).length === 3
    ) {
      body = response;
    } else if (response.body) {
      body = await response.json();
    } else if (response.text) {
      body = await response.text();
    } else {
      body = { message: "Something unexpected" };
    }
    result = { ...result, ...body };
  } catch (e) {
    result.error = true;
    result.errorMessage = e;
  }
  return Promise.resolve(
    createResponse(
      200,
      {
        headers: {
          "Content-Type": ["application/json"],
          "Content-Language": ["en-US"],
        },
      },
      JSON.stringify(result)
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
// curl -i --header 'Host: fashionstore.demo.macrometa.io' 'http://127.0.0.1:9550/api/asadad'
// http://fashionstore.demo.macrometa.io:9550/api/a1

// akamai edgeworkers auth --expiry 60 d018263e6439675c18da2d9176d793093652d7537161371e2d292ae9d64a89ae

// Akamai-EW-Trace: st=1604825241~exp=1604828841~acl=/*~hmac=d1c3877b2498bd47e4012a2c63109fd0e2dab15ac6eeb3f3fdb525359ccf58bd

// curl -i --header 'Host: fashionstore.demo.macrometa.io' 'http://127.0.0.1:9550/api/asadad' -H 'Pragma: akamai-x-ew-debug' -H 'Akamai-EW-Trace: st=1604825241~exp=1604828841~acl=/*~hmac=d1c3877b2498bd47e4012a2c63109fd0e2dab15ac6eeb3f3fdb525359ccf58bd'
