import { httpRequest } from "http-request"

const C8_URL = "https://AKAMAI_HOSTNAME"
const C8_API_KEY = "xxxx"
const FABRIC = "_system"

const client = {
    executeQuery: function (query, bindVars) {
        return httpRequest(`${C8_URL}/_fabric/${FABRIC}/_api/cursor`, {
            method: "POST",
            headers: {
                authorization: `apikey ${C8_API_KEY}`,
            },
            body: JSON.stringify({
                query,
                bindVars,
            }),
        })
    },
}

export default client
