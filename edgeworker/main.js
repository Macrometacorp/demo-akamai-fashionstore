import { logger } from "log"
import { createResponse } from "create-response"
import { executeHandler } from "./router.js"

export async function responseProvider(request) {
    let result = {}
    let body
    let status = 501
    try {
        const response = await executeHandler(request)
        status = response.code
        if (response.body) {
            body = await response.json()
            status = body.code ? body.code : status
        } else if (response.message && response.code && Object.keys(response).length === 3) {
            body = response
        } else if (response.text) {
            const text = await response.text()
            body = { text }
        } else {
            body = { message: "Something unexpected" }
        }

        if (body.result) {
            result = body.result
        } else {
            result = { ...body }
        }
    } catch (e) {
        result.error = true
        result.errorMessage = e.message
    }
    return Promise.resolve(
        createResponse(
            status,
            {
                "Content-Type": "application/json",
                "Content-Language": "en-US",
            },
            JSON.stringify(result),
        ),
    )
}

export function onClientResponse(request, response) {
    // Outputs a message to the X-Akamai-EdgeWorker-onClientResponse-Log header.
    logger.log("Adding a header in ClientResponse")

    response.setHeader("X-Hello-World", "From Akamai EdgeWorkers")
}

// tar -czvf fashionstore.tgz main.js bundle.json
// akamai sandbox add-edgeworker 4692 fashionstore.tgz
// akamai sandbox update-edgeworker 4692 fashionstore.tgz
// curl -i --header 'Host: fashionstore.demo.macrometa.io' 'http://127.0.0.1:9550/api/asadad'
// http://fashionstore.demo.macrometa.io:9550/api/a1
